import {
  createUserWithEmailAndPassword,
  doc,
  hasFirebaseConfig,
  onAuthStateChanged,
  reload,
  requireFirebase,
  sendEmailVerification,
  serverTimestamp,
  setDoc,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  updateProfile
} from "./byteit-firebase.js?v=20260527-setpass4";

const forms = document.querySelectorAll("[data-auth-form]");
const page = document.body.dataset.page;
const loginParams = new URLSearchParams(window.location.search);
const pendingSetupKey = "byteitPendingPasswordSetup";
let isPasswordSetupMode = page === "login" && Boolean(loginParams.get("verified"));

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

function authErrorMessage(error) {
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
      setLoading(form, false);
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

  setStatus(statusBox, "School account created. Verify the email from Firebase, then set your password from the login page.", "success");

  form.reset();
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
