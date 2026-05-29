import {
  createUserWithEmailAndPassword,
  doc,
  getDoc,
  GoogleAuthProvider,
  hasFirebaseConfig,
  linkWithCredential,
  onAuthStateChanged,
  reload,
  requireFirebase,
  sendEmailVerification,
  sendPasswordResetEmail,
  serverTimestamp,
  setDoc,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updatePassword,
  updateProfile
} from "./byteit-firebase.js?v=20260527-setpass4";

const forms = document.querySelectorAll("[data-auth-form]");
const googleButtons = document.querySelectorAll("[data-google-auth]");
const page = document.body.dataset.page;
const loginParams = new URLSearchParams(window.location.search);
const pendingSetupKey = "byteitPendingPasswordSetup";
let isPasswordSetupMode = page === "login" && Boolean(loginParams.get("verified"));
let authActionInProgress = false;

function getStatusBox(form) {
  return form.closest(".auth-card")?.querySelector("[data-status]") || document.querySelector("[data-status]");
}

function setStatus(statusBox, message, type = "info") {
  if (!statusBox) return;
  statusBox.textContent = message;
  statusBox.dataset.type = type;
  statusBox.hidden = false;
}

function setLoading(form, isLoading) {
  const submitButton = form?.querySelector("button[type='submit']");
  if (!submitButton) return;
  submitButton.disabled = isLoading;
  submitButton.dataset.originalText ||= submitButton.textContent;
  submitButton.textContent = isLoading ? "please wait" : submitButton.dataset.originalText;
}

function setButtonLoading(button, isLoading) {
  if (!button) return;
  button.disabled = isLoading;
  button.dataset.originalText ||= button.textContent;
  button.textContent = isLoading ? "please wait" : button.dataset.originalText;
}

function authErrorMessage(error) {
  if (error.code === "auth/popup-closed-by-user") {
    return "Google sign-in was closed before it finished.";
  }
  if (error.code === "auth/account-exists-with-different-credential") {
    return "This email already has a password account. Enter that email and password above, then click Google again to connect both sign-in methods.";
  }
  if (error.code === "auth/too-many-requests") {
    return "Kindly verify your email first. If you already verified it, please wait a few minutes and try again.";
  }
  return error.message || "Something went wrong. Please try again.";
}

function getPendingPasswordSetup() {
  try {
    return JSON.parse(localStorage.getItem(pendingSetupKey) || "null");
  } catch {
    return null;
  }
}

function setPendingPasswordSetup(data) {
  localStorage.setItem(pendingSetupKey, JSON.stringify(data));
}

function clearPendingPasswordSetup() {
  localStorage.removeItem(pendingSetupKey);
}

function passwordSetupUrl(email) {
  const url = new URL("login.html", window.location.href);
  url.searchParams.set("verified", "1");
  url.searchParams.set("email", email);
  return url.toString();
}

function enablePasswordSetupMode(email = "") {
  const form = document.querySelector("[data-auth-form]");
  if (!form) return;

  isPasswordSetupMode = true;
  if (form.schoolEmail && email) form.schoolEmail.value = email;
  if (form.password) {
    form.password.autocomplete = "new-password";
    form.password.placeholder = "Create password";
  }
  form.querySelector("button[type='submit']")?.replaceChildren(document.createTextNode("set password"));
  form.setAttribute("data-auth-mode", "set-password");
}

if (!hasFirebaseConfig()) {
  forms.forEach((form) => {
    setStatus(getStatusBox(form), "Firebase is not configured yet. Update assets/js/byteit-firebase-config.js.", "error");
  });
}

if (page === "login" && loginParams.get("verify")) {
  const statusBox = document.querySelector("[data-status]");
  setStatus(statusBox, "Kindly verify your email first, then set your password.", "error");
}

if (isPasswordSetupMode) {
  const email = loginParams.get("email") || "";
  enablePasswordSetupMode(email);
  setStatus(document.querySelector("[data-status]"), "Email verified. Enter a new password to open the dashboard.", "success");
}

if (page === "login" && hasFirebaseConfig()) {
  const { auth } = requireFirebase();
  onAuthStateChanged(auth, async (user) => {
    if (!user) return;
    if (authActionInProgress) return;
    const pendingSetup = getPendingPasswordSetup();
    const isPendingUser = pendingSetup && (pendingSetup.uid === user.uid || pendingSetup.email === user.email);

    if (user.emailVerified && isPendingUser) {
      enablePasswordSetupMode(user.email);
      setStatus(document.querySelector("[data-status]"), "Email verified. Enter a new password to open the dashboard.", "success");
      return;
    }

    if (isPasswordSetupMode) return;
    if (user.emailVerified) {
      window.location.href = "dashboard.html";
      return;
    }

    const statusBox = document.querySelector("[data-status]");
    setStatus(statusBox, "Kindly verify your email first, then set your password.", "error");
  });
}

forms.forEach((form) => {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const statusBox = getStatusBox(form);
    const mode = form.dataset.authMode || page;
    setLoading(form, true);
    authActionInProgress = true;

    try {
      if (mode === "register") {
        await registerSchool(form, statusBox);
      } else if (mode === "set-password") {
        await setVerifiedPassword(form, statusBox);
      } else {
        await loginSchool(form, statusBox);
      }
    } catch (error) {
      setStatus(statusBox, authErrorMessage(error), "error");
    } finally {
      authActionInProgress = false;
      setLoading(form, false);
    }
  });
});

googleButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    const form = document.querySelector("[data-auth-form]");
    const statusBox = getStatusBox(form);
    setButtonLoading(button, true);
    authActionInProgress = true;

    try {
      if (page === "register") {
        await registerSchoolWithGoogle(form, statusBox);
      } else {
        await loginSchoolWithGoogle(form, statusBox);
      }
    } catch (error) {
      setStatus(statusBox, authErrorMessage(error), "error");
    } finally {
      authActionInProgress = false;
      setButtonLoading(button, false);
    }
  });
});

async function registerSchool(form, statusBox) {
  const { auth, db } = requireFirebase();
  const formData = new FormData(form);
  const schoolName = String(formData.get("schoolName") || "").trim();
  const schoolEmail = String(formData.get("schoolEmail") || "").trim().toLowerCase();

  if (!schoolName || !schoolEmail) {
    throw new Error("Please enter the school name and email.");
  }

  const tempPassword = generateTemporaryPassword();
  const credential = await createUserWithEmailAndPassword(auth, schoolEmail, tempPassword);
  await updateProfile(credential.user, { displayName: schoolName });
  await setDoc(doc(db, "schools", credential.user.uid), {
    name: schoolName,
    email: schoolEmail,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  await sendEmailVerification(credential.user, {
    url: passwordSetupUrl(schoolEmail)
  });
  setPendingPasswordSetup({ uid: credential.user.uid, email: schoolEmail });

  const verificationMessage = "Please check your email to verify your account. If you do not see it in your inbox, check your spam or junk folder.";
  setStatus(statusBox, verificationMessage, "success");
  window.alert(verificationMessage);

  form.reset();
}

async function registerSchoolWithGoogle(form, statusBox) {
  const { auth, db } = requireFirebase();
  const formData = new FormData(form);
  const schoolName = String(formData.get("schoolName") || "").trim();
  const schoolEmail = String(formData.get("schoolEmail") || "").trim().toLowerCase();

  if (!schoolName || !schoolEmail) {
    throw new Error("Please enter the school name and email before continuing with Google.");
  }

  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  let credential;

  try {
    credential = await signInWithPopup(auth, provider);
  } catch (error) {
    if (error.code === "auth/account-exists-with-different-credential") {
      throw new Error("This email already has a password account. Log in with the password once, then click Google to connect it to the same account.");
    }
    throw error;
  }

  const googleEmail = String(credential.user.email || "").trim().toLowerCase();
  if (googleEmail !== schoolEmail) {
    await signOut(auth);
    throw new Error("The Google account email must match the school email entered in the form.");
  }

  const schoolRef = doc(db, "schools", credential.user.uid);
  const schoolSnapshot = await getDoc(schoolRef);

  await updateProfile(credential.user, { displayName: schoolName });
  const schoolData = {
    name: schoolName,
    email: googleEmail,
    updatedAt: serverTimestamp()
  };

  if (schoolSnapshot.exists()) {
    await setDoc(schoolRef, schoolData, { merge: true });
  } else {
    await setDoc(schoolRef, {
      ...schoolData,
      createdAt: serverTimestamp()
    });
  }

  await sendPasswordResetEmail(auth, googleEmail);
  const passwordSetupMessage = "A link has been sent to your mail ID for setting a password.";
  setStatus(statusBox, passwordSetupMessage, "success");
  window.alert(passwordSetupMessage);
  window.location.href = "dashboard.html";
}

async function setVerifiedPassword(form, statusBox) {
  const { auth } = requireFirebase();
  const password = String(new FormData(form).get("password") || "");

  if (!auth.currentUser) {
    throw new Error("Please open the verification link in the same browser used for registration.");
  }

  await reload(auth.currentUser);
  if (!auth.currentUser.emailVerified) {
    throw new Error("Kindly verify your email before setting a password.");
  }

  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters.");
  }

  await updatePassword(auth.currentUser, password);
  clearPendingPasswordSetup();
  setStatus(statusBox, "Password set. Opening dashboard...", "success");
  window.location.href = "dashboard.html";
}

function generateTemporaryPassword() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
  const bytes = crypto.getRandomValues(new Uint8Array(18));
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
}

async function loginSchool(form, statusBox) {
  const { auth } = requireFirebase();
  const formData = new FormData(form);
  const email = String(formData.get("schoolEmail") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  await signInWithEmailAndPassword(auth, email, password);
  if (!auth.currentUser.emailVerified) {
    await signOut(auth);
    setStatus(statusBox, "Kindly verify your email first, then set your password.", "error");
    return;
  }

  setStatus(statusBox, "Logged in. Opening dashboard...", "success");
  window.location.href = "dashboard.html";
}

async function loginSchoolWithGoogle(form, statusBox) {
  const { auth, db } = requireFirebase();
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  let credential;

  try {
    credential = await signInWithPopup(auth, provider);
  } catch (error) {
    if (error.code !== "auth/account-exists-with-different-credential") {
      throw error;
    }

    credential = await linkPasswordAccountToGoogle(form, error);
  }

  const schoolSnapshot = await getDoc(doc(db, "schools", credential.user.uid));

  if (!schoolSnapshot.exists()) {
    await signOut(auth);
    throw new Error("No school account exists for this Google email yet. Please register your school first.");
  }

  setStatus(statusBox, "Logged in with Google. Opening dashboard...", "success");
  window.location.href = "dashboard.html";
}

async function linkPasswordAccountToGoogle(form, googleError) {
  const { auth } = requireFirebase();
  const pendingCredential = GoogleAuthProvider.credentialFromError(googleError);
  const googleEmail = String(googleError.customData?.email || "").trim().toLowerCase();
  const formData = new FormData(form);
  const email = String(formData.get("schoolEmail") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!pendingCredential) {
    throw new Error("Google sign-in could not be connected. Please try again.");
  }

  if (!email || !password) {
    throw new Error("This email already has a password account. Enter that email and password above, then click Google again to connect both sign-in methods.");
  }

  if (googleEmail && googleEmail !== email) {
    throw new Error("The Google account email must match the school email entered above.");
  }

  const emailCredential = await signInWithEmailAndPassword(auth, email, password);
  if (!emailCredential.user.emailVerified) {
    await signOut(auth);
    throw new Error("Kindly verify your email before connecting Google.");
  }

  await linkWithCredential(emailCredential.user, pendingCredential);
  return emailCredential;
}
