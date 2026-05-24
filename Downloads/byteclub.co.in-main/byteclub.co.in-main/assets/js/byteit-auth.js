import { hasSupabaseConfig, requireSupabase, supabase } from "./byteit-supabase.js";

const form = document.querySelector("[data-auth-form]");
const statusBox = document.querySelector("[data-status]");
const submitButton = form?.querySelector("button[type='submit']");

function setStatus(message, type = "info") {
  if (!statusBox) return;
  statusBox.textContent = message;
  statusBox.dataset.type = type;
  statusBox.hidden = false;
}

function setLoading(isLoading) {
  if (!submitButton) return;
  submitButton.disabled = isLoading;
  submitButton.dataset.originalText ||= submitButton.textContent;
  submitButton.textContent = isLoading ? "please wait" : submitButton.dataset.originalText;
}

if (!hasSupabaseConfig()) {
  setStatus("Supabase is not configured yet. Update assets/js/byteit-supabase-config.js.", "error");
}

const page = document.body.dataset.page;

if (page === "login" && supabase) {
  supabase.auth.getSession().then(({ data }) => {
    if (data.session) window.location.href = "dashboard.html";
  });
}

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      if (page === "register") {
        await registerSchool(new FormData(form));
      } else {
        await loginSchool(new FormData(form));
      }
    } catch (error) {
      setStatus(error.message || "Something went wrong. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  });
}

async function registerSchool(formData) {
  const client = requireSupabase();
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
      emailRedirectTo: `${window.location.origin}${window.location.pathname.replace(/registration\.html$/, "login.html")}`
    }
  });

  if (error) throw error;

  setStatus("Account created. Check the school email for the Supabase confirmation link, then log in.", "success");
  form.reset();
}

async function loginSchool(formData) {
  const client = requireSupabase();
  const email = String(formData.get("schoolEmail") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;

  setStatus("Logged in. Opening dashboard...", "success");
  window.location.href = "dashboard.html";
}
