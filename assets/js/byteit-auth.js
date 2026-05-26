import {
  hasFirebaseConfig,
  httpsCallable,
  onAuthStateChanged,
  requireFirebase,
  signInWithEmailAndPassword
} from "./byteit-firebase.js";

const forms = document.querySelectorAll("[data-auth-form]");
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

async function registerSchool(form, statusBox) {
  const { functions } = requireFirebase();
  const formData = new FormData(form);
  const schoolName = String(formData.get("schoolName") || "").trim();
  const schoolEmail = String(formData.get("schoolEmail") || "").trim().toLowerCase();

  if (!schoolName || !schoolEmail) {
    throw new Error("Please enter the school name and email.");
  }

  const registerSchoolFunction = httpsCallable(functions, "registerSchool");
  await registerSchoolFunction({ schoolName, schoolEmail });

  setStatus(statusBox, "School account created. A unique password has been sent to the school email.", "success");
  form.reset();
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
