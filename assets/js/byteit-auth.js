import {
  createUserWithEmailAndPassword,
  doc,
  hasFirebaseConfig,
  onAuthStateChanged,
  requireFirebase,
  sendPasswordResetEmail,
  serverTimestamp,
  setDoc,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from "./byteit-firebase.js";

const forms = document.querySelectorAll("[data-auth-form]");
const forgotPasswordButton = document.querySelector("[data-forgot-password]");
const passwordResult = document.querySelector("[data-password-result]");
const generatedPassword = document.querySelector("[data-generated-password]");
const copyPasswordButton = document.querySelector("[data-copy-password]");
const page = document.body.dataset.page;

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

if (!hasFirebaseConfig()) {
  forms.forEach((form) => {
    setStatus(getStatusBox(form), "Firebase is not configured yet. Update assets/js/byteit-firebase-config.js.", "error");
  });
}

function showGeneratedPassword(password) {
  if (!passwordResult || !generatedPassword) return;
  generatedPassword.textContent = password;
  passwordResult.hidden = false;
}

if (page === "login" && hasFirebaseConfig()) {
  const { auth } = requireFirebase();
  onAuthStateChanged(auth, (user) => {
    if (user) window.location.href = "dashboard.html";
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
      } else {
        await loginSchool(form, statusBox);
      }
    } catch (error) {
      setStatus(statusBox, error.message || "Something went wrong. Please try again.", "error");
    } finally {
      setLoading(form, false);
    }
  });
});

forgotPasswordButton?.addEventListener("click", async () => {
  const form = forgotPasswordButton.closest(".auth-card")?.querySelector("[data-auth-form]");
  const statusBox = getStatusBox(form);
  const email = String(new FormData(form).get("schoolEmail") || "").trim().toLowerCase();

  if (!email) {
    setStatus(statusBox, "Enter the school email first, then request a password reset.", "error");
    return;
  }

  forgotPasswordButton.disabled = true;
  forgotPasswordButton.dataset.originalText ||= forgotPasswordButton.textContent;
  forgotPasswordButton.textContent = "sending...";

  try {
    const { auth } = requireFirebase();
    await sendPasswordResetEmail(auth, email);
    setStatus(statusBox, "Password reset email requested. Please check inbox and spam.", "success");
  } catch (error) {
    setStatus(statusBox, error.message || "Could not request the password reset email.", "error");
  } finally {
    forgotPasswordButton.disabled = false;
    forgotPasswordButton.textContent = forgotPasswordButton.dataset.originalText;
  }
});

copyPasswordButton?.addEventListener("click", async () => {
  const password = generatedPassword?.textContent || "";
  if (!password) return;
  await navigator.clipboard.writeText(password);
  copyPasswordButton.textContent = "Copied";
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
  await signOut(auth);

  showGeneratedPassword(tempPassword);
  setStatus(statusBox, "School account created. Save this password now; it is shown only once.", "success");

  form.reset();
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

  setStatus(statusBox, "Logged in. Opening dashboard...", "success");
  window.location.href = "dashboard.html";
}
