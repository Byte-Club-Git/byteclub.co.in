const form = document.querySelector("[data-self-invite-form]");
const statusBox = document.querySelector("[data-status]");

function setStatus(message, type = "info") {
  if (!statusBox) return;
  statusBox.textContent = message;
  statusBox.dataset.type = type;
  statusBox.hidden = false;
}

function setLoading(isLoading) {
  const button = form?.querySelector("button[type='submit']");
  if (!button) return;
  button.disabled = isLoading;
  button.dataset.originalText ||= button.textContent;
  button.textContent = isLoading ? "please wait" : button.dataset.originalText;
}

function getSupabaseConfig() {
  return window.SELF_INVITE_SUPABASE_CONFIG || {};
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

async function saveInvite(email) {
  const { url, publishableKey } = getSupabaseConfig();

  if (!url || !publishableKey) {
    throw new Error("Supabase is not configured yet.");
  }

  const response = await fetch(`${url}/rest/v1/self_invites`, {
    method: "POST",
    headers: {
      apikey: publishableKey,
      Authorization: `Bearer ${publishableKey}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal"
    },
    body: JSON.stringify({
      email,
      source: "self-invite"
    })
  });

  if (response.status === 409) return;

  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new Error(message || "Could not save the email.");
  }
}

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = normalizeEmail(new FormData(form).get("email"));

  if (!email) {
    setStatus("Please enter your email.", "error");
    return;
  }

  setLoading(true);

  try {
    await saveInvite(email);
    form.reset();
    setStatus("You're on the invite list. Mail will be sent by tonight.", "success");
  } catch (error) {
    setStatus(error.message || "Could not save your email. Please try again.", "error");
  } finally {
    setLoading(false);
  }
});
