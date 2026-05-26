import { hasSupabaseConfig, requireSupabase, supabase } from "./byteit-supabase.js";

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

if (!hasSupabaseConfig()) {
  forms.forEach((form) => {
    setStatus(getStatusBox(form), "Supabase is not configured yet. Update assets/js/byteit-supabase-config.js.", "error");
  });
}

if (page === "login" && supabase) {
  supabase.auth.getSession().then(({ data }) => {
    if (data.session) window.location.href = "dashboard.html";
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
  const client = requireSupabase();
  const formData = new FormData(form);
  const schoolName = String(formData.get("schoolName") || "").trim();
  const schoolEmail = String(formData.get("schoolEmail") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");

  if (!schoolName || !schoolEmail || !password) {
    throw new Error("Please enter the school name, email, and password.");
  }

  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }

  if (password !== confirmPassword) {
    throw new Error("Passwords do not match.");
  }

  const { error } = await client.auth.signUp({
    email: schoolEmail,
    password,
    options: {
      data: {
        school_name: schoolName,
        school_email: schoolEmail
      },
      emailRedirectTo: `${window.location.origin}${window.location.pathname.replace(/(registration|byteITRegister)\.html$/, "login.html")}`
    }
  });

  if (error) throw error;

  setStatus(statusBox, "Account created. You can log in now. If Supabase email confirmation is enabled, confirm the email first.", "success");
  form.reset();
}

async function loginSchool(form, statusBox) {
  const client = requireSupabase();
  const formData = new FormData(form);
  const email = String(formData.get("schoolEmail") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;

  setStatus(statusBox, "Logged in. Opening dashboard...", "success");
  window.location.href = "dashboard.html";
}
