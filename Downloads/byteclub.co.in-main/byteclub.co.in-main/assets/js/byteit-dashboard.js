import { events, isClassEligible, participantLabel, teamLimitLabel } from "./byteit-events.js";
import { getCurrentSchool, requireSupabase, supabase } from "./byteit-supabase.js";

const eventList = document.querySelector("[data-event-list]");
const schoolName = document.querySelector("[data-school-name]");
const schoolEmail = document.querySelector("[data-school-email]");
const registeredCount = document.querySelector("[data-registered-count]");
const availableCount = document.querySelector("[data-available-count]");
const statusBox = document.querySelector("[data-status]");
const logoutButton = document.querySelector("[data-logout]");
const modal = document.querySelector("[data-registration-modal]");
const modalTitle = document.querySelector("[data-modal-title]");
const modalMeta = document.querySelector("[data-modal-meta]");
const form = document.querySelector("[data-team-form]");
const participantsHost = document.querySelector("[data-participants]");
const closeModalButtons = document.querySelectorAll("[data-close-modal]");

let schoolContext = null;
let registrations = [];
let activeEvent = null;
let activeRegistration = null;

function setStatus(message, type = "info") {
  if (!statusBox) return;
  statusBox.textContent = message;
  statusBox.dataset.type = type;
  statusBox.hidden = false;
}

function hideStatus() {
  if (statusBox) statusBox.hidden = true;
}

function byName(a, b) {
  return a.name.localeCompare(b.name);
}

async function init() {
  if (!supabase) {
    setStatus("Supabase is not configured yet. Update assets/js/byteit-supabase-config.js.", "error");
    return;
  }

  try {
    schoolContext = await getCurrentSchool();
    if (!schoolContext) {
      window.location.href = "login.html";
      return;
    }

    schoolName.textContent = schoolContext.school.name;
    schoolEmail.textContent = schoolContext.school.email;
    await loadRegistrations();
    renderEvents();
  } catch (error) {
    setStatus(error.message || "Unable to load dashboard.", "error");
  }
}

async function loadRegistrations() {
  const client = requireSupabase();
  const { data, error } = await client
    .from("event_registrations")
    .select("*, event:events(*), participants(*)")
    .eq("school_id", schoolContext.school.id)
    .order("created_at", { ascending: true });

  if (error) throw error;
  registrations = data || [];
}

function renderEvents() {
  const count = registrations.length;
  registeredCount.textContent = count;
  availableCount.textContent = events.length;

  eventList.innerHTML = events
    .slice()
    .sort(byName)
    .map((event) => {
      const eventRegistrations = registrations.filter((item) => item.event_id === event.id);
      const limitReached = event.teamsPerInstitution !== null && eventRegistrations.length >= event.teamsPerInstitution;
      const registeredMarkup = eventRegistrations.length
        ? eventRegistrations.map(registrationCard).join("")
        : `<p class="byteit-muted">No teams registered yet.</p>`;

      return `
        <article class="event-card">
          <div class="event-card__header">
            <div>
              <h2>${event.name}</h2>
              <p>${teamLimitLabel(event)} · ${participantLabel(event)} · Class ${event.classRange}</p>
            </div>
            <span class="mode-badge mode-badge--${event.mode.toLowerCase()}">${event.mode}</span>
          </div>
          <div class="event-card__teams">
            ${registeredMarkup}
          </div>
          <button class="byteit-button" type="button" data-register-event="${event.id}" ${limitReached ? "disabled" : ""}>
            ${limitReached ? "limit reached" : "add team"}
          </button>
        </article>
      `;
    })
    .join("");
}

function registrationCard(registration) {
  const participantNames = (registration.participants || [])
    .map((participant) => `${participant.name} (${participant.class_label})`)
    .join(", ");

  return `
    <div class="team-row">
      <div>
        <strong>${registration.team_name}</strong>
        <span>${participantNames}</span>
      </div>
      <div class="team-actions">
        <button type="button" data-edit-registration="${registration.id}">edit</button>
        <button type="button" data-delete-registration="${registration.id}">delete</button>
      </div>
    </div>
  `;
}

eventList?.addEventListener("click", async (event) => {
  const registerId = event.target.closest("[data-register-event]")?.dataset.registerEvent;
  const editId = event.target.closest("[data-edit-registration]")?.dataset.editRegistration;
  const deleteId = event.target.closest("[data-delete-registration]")?.dataset.deleteRegistration;

  if (registerId) openTeamModal(events.find((item) => item.id === registerId));
  if (editId) {
    const registration = registrations.find((item) => item.id === editId);
    openTeamModal(events.find((item) => item.id === registration.event_id), registration);
  }
  if (deleteId) await deleteRegistration(deleteId);
});

closeModalButtons.forEach((button) => {
  button.addEventListener("click", closeTeamModal);
});

modal?.addEventListener("click", (event) => {
  if (event.target === modal) closeTeamModal();
});

function openTeamModal(event, registration = null) {
  hideStatus();
  activeEvent = event;
  activeRegistration = registration;
  modal.hidden = false;
  modalTitle.textContent = registration ? `Edit ${event.name}` : `Register ${event.name}`;
  modalMeta.textContent = `${event.mode} · ${participantLabel(event)} · Class ${event.classRange}`;
  form.teamName.value = registration?.team_name || `${event.name} Team`;
  form.registrationId.value = registration?.id || "";
  renderParticipantFields(registration?.participants || []);
}

function closeTeamModal() {
  modal.hidden = true;
  form.reset();
  participantsHost.innerHTML = "";
  activeEvent = null;
  activeRegistration = null;
}

function renderParticipantFields(existingParticipants) {
  const count = activeEvent.maxParticipants;
  participantsHost.innerHTML = Array.from({ length: count }, (_, index) => {
    const participant = existingParticipants[index] || {};
    const required = index < activeEvent.minParticipants ? "required" : "";
    return `
      <fieldset class="participant-fieldset">
        <legend>Participant ${index + 1}${required ? "" : " (optional)"}</legend>
        <label>Name <input name="participantName" value="${participant.name || ""}" ${required}></label>
        <label>Class <input name="participantClass" value="${participant.class_label || ""}" ${required} placeholder="IX"></label>
        <label>Email / Phone <input name="participantContact" value="${participant.contact || ""}" ${required}></label>
      </fieldset>
    `;
  }).join("");
}

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    await saveRegistration();
    closeTeamModal();
    await loadRegistrations();
    renderEvents();
    setStatus("Registration saved.", "success");
  } catch (error) {
    setStatus(error.message || "Could not save registration.", "error");
  }
});

async function saveRegistration() {
  const client = requireSupabase();
  const formData = new FormData(form);
  const teamName = String(formData.get("teamName") || "").trim();
  const names = formData.getAll("participantName");
  const classes = formData.getAll("participantClass");
  const contacts = formData.getAll("participantContact");

  const participants = names
    .map((name, index) => ({
      name: String(name || "").trim(),
      class_label: String(classes[index] || "").trim().toUpperCase(),
      contact: String(contacts[index] || "").trim()
    }))
    .filter((participant) => participant.name || participant.class_label || participant.contact);

  if (!teamName) throw new Error("Please name the team.");
  if (participants.length < activeEvent.minParticipants || participants.length > activeEvent.maxParticipants) {
    throw new Error(`${activeEvent.name} needs ${participantLabel(activeEvent)}.`);
  }

  const ineligible = participants.find((participant) => !isClassEligible(participant.class_label, activeEvent));
  if (ineligible) {
    throw new Error(`${ineligible.name || "A participant"} is not eligible for Class ${activeEvent.classRange}.`);
  }

  if (!activeRegistration) {
    const existingForEvent = registrations.filter((item) => item.event_id === activeEvent.id).length;
    if (activeEvent.teamsPerInstitution !== null && existingForEvent >= activeEvent.teamsPerInstitution) {
      throw new Error(`${activeEvent.name} has reached the team limit for your school.`);
    }
  }

  const { error } = await client.rpc("save_event_registration", {
    p_registration_id: activeRegistration?.id || null,
    p_school_id: schoolContext.school.id,
    p_event_id: activeEvent.id,
    p_team_name: teamName,
    p_participants: participants
  });

  if (error) throw error;
}

async function deleteRegistration(registrationId) {
  if (!window.confirm("Delete this team registration?")) return;
  try {
    const client = requireSupabase();
    const { error } = await client
      .from("event_registrations")
      .delete()
      .eq("id", registrationId);
    if (error) throw error;

    await loadRegistrations();
    renderEvents();
    setStatus("Registration deleted.", "success");
  } catch (error) {
    setStatus(error.message || "Could not delete registration.", "error");
  }
}

logoutButton?.addEventListener("click", async () => {
  await requireSupabase().auth.signOut();
  window.location.href = "login.html";
});

init();
