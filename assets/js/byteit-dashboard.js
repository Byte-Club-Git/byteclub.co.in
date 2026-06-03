import { events, isClassEligible, participantLabel, teamLimitLabel } from "./byteit-events.js";
import {
  db,
  doc,
  getDoc,
  hasFirebaseConfig,
  onAuthStateChanged,
  reload,
  requireFirebase,
  serverTimestamp,
  setDoc,
  signOut
} from "./byteit-firebase.js?v=20260527-setpass4";

const REGISTRATION_COLLECTION = "byteit_registrations";
const eventList = document.querySelector("[data-event-list]");
const schoolName = document.querySelector("[data-school-name]");
const schoolEmail = document.querySelector("[data-school-email]");
const registeredCount = document.querySelector("[data-registered-count]");
const availableCount = document.querySelector("[data-available-count]");
const statusBox = document.querySelector("[data-status]");
const logoutButton = document.querySelector("[data-logout]");
const schoolDetailsForm = document.querySelector("[data-school-details-form]");
const modal = document.querySelector("[data-registration-modal]");
const modalTitle = document.querySelector("[data-modal-title]");
const modalMeta = document.querySelector("[data-modal-meta]");
const modalStatusBox = document.querySelector("[data-modal-status]");
const form = document.querySelector("[data-team-form]");
const participantsHost = document.querySelector("[data-participants]");
const closeModalButtons = document.querySelectorAll("[data-close-modal]");

let schoolContext = null;
let registrations = [];
let activeEvent = null;
let activeRegistration = null;

function usesSharedRegistrationLink(event) {
  return event?.id === "crypt-it" || event?.id === "build-it";
}

function setStatus(message, type = "info") {
  if (!statusBox) return;
  statusBox.textContent = message;
  statusBox.dataset.type = type;
  statusBox.hidden = false;
}

function hideStatus() {
  if (statusBox) statusBox.hidden = true;
}

function setModalStatus(message, type = "info") {
  if (!modalStatusBox) return;
  modalStatusBox.textContent = message;
  modalStatusBox.dataset.type = type;
  modalStatusBox.hidden = false;
}

function hideModalStatus() {
  if (modalStatusBox) modalStatusBox.hidden = true;
}

function byName(a, b) {
  return a.name.localeCompare(b.name);
}

function byDashboardOrder(a, b) {
  if (a.id === "make-it") return -1;
  if (b.id === "make-it") return 1;
  return byName(a, b);
}

function registrationDocRef(schoolId) {
  return doc(db, REGISTRATION_COLLECTION, schoolId);
}

function makeRegistrationId(eventId) {
  return `${eventId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function writeField(form, name, value) {
  if (form?.elements[name]) form.elements[name].value = value || "";
}

function schoolDetailsFromForm() {
  if (!schoolDetailsForm) return {};
  const formData = new FormData(schoolDetailsForm);
  return {
    schoolAddress: String(formData.get("schoolAddress") || "").trim(),
    teacherName: String(formData.get("teacherName") || "").trim(),
    teacherMobile: String(formData.get("teacherMobile") || "").trim(),
    teacherEmail: String(formData.get("teacherEmail") || "").trim().toLowerCase()
  };
}

function flatKey(value) {
  return String(value || "")
    .replace(/[^a-z0-9]+/gi, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();
}

function buildExportFields(school, registrationList) {
  const eventOrder = new Map(events.map((event, index) => [event.id, index]));
  const sortedRegistrations = registrationList.slice().sort((a, b) => {
    const eventCompare = (eventOrder.get(a.eventId) ?? 999) - (eventOrder.get(b.eventId) ?? 999);
    return eventCompare || (a.teamName || "").localeCompare(b.teamName || "");
  });
  const exportFields = {
    csv_school_name: school.name || "",
    csv_school_address: school.schoolAddress || "",
    csv_teacher_in_charge_name: school.teacherName || "",
    csv_teacher_in_charge_mobile: school.teacherMobile || "",
    csv_teacher_in_charge_email: school.teacherEmail || school.email || "",
    csv_selected_events: [...new Set(sortedRegistrations.map((registration) => registration.eventName).filter(Boolean))].join(", ")
  };

  sortedRegistrations.forEach((registration, registrationIndex) => {
    const eventPrefix = flatKey(registration.eventName || registration.eventId || `event_${registrationIndex + 1}`);
    const teamNumber = sortedRegistrations
      .filter((item) => item.eventId === registration.eventId)
      .findIndex((item) => item.id === registration.id) + 1;
    exportFields[`csv_${eventPrefix}_team_${teamNumber}_name`] = registration.teamName || "";
    (registration.participants || []).forEach((participant, participantIndex) => {
      const participantPrefix = `csv_${eventPrefix}_team_${teamNumber}_participant_${participantIndex + 1}`;
      exportFields[`${participantPrefix}_name`] = participant.name || "";
      exportFields[`${participantPrefix}_class`] = participant.classLabel || "";
      exportFields[`${participantPrefix}_email`] = participant.contact || "";
    });
  });

  return exportFields;
}

function buildSchoolPayload(overrides = {}, registrationList = registrations) {
  const school = {
    ...schoolContext.school,
    ...overrides
  };
  return {
    schoolId: schoolContext.school.id,
    name: school.name || "",
    email: school.email || "",
    schoolAddress: school.schoolAddress || "",
    teacherName: school.teacherName || "",
    teacherMobile: school.teacherMobile || "",
    teacherEmail: school.teacherEmail || "",
    selectedEvents: [...new Set(registrationList.map((registration) => registration.eventName).filter(Boolean))],
    registrations: registrationList,
    ...buildExportFields(school, registrationList),
    updatedAt: serverTimestamp()
  };
}

function waitForUser(auth) {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
}

async function init() {
  if (!hasFirebaseConfig()) {
    setStatus("Firebase is not configured yet. Update assets/js/byteit-firebase-config.js.", "error");
    return;
  }

  try {
    const { auth } = requireFirebase();
    const user = await waitForUser(auth);
    if (!user) {
      window.location.href = "login.html";
      return;
    }
    await reload(user);

    if (!user.emailVerified) {
      window.location.href = "login.html?verify=1";
      return;
    }

    const schoolRef = registrationDocRef(user.uid);
    const schoolSnapshot = await getDoc(schoolRef);
    let schoolData = schoolSnapshot.data();

    if (!schoolSnapshot.exists()) {
      schoolData = {
        schoolId: user.uid,
        name: user.displayName || user.email?.split("@")[0] || "School",
        email: user.email,
        schoolAddress: "",
        teacherName: "",
        teacherMobile: "",
        teacherEmail: "",
        selectedEvents: [],
        registrations: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      await setDoc(schoolRef, schoolData);
    }

    schoolContext = { user, school: { id: user.uid, ...schoolData } };
    schoolName.textContent = schoolContext.school.name;
    schoolEmail.textContent = schoolContext.school.email;
    writeField(schoolDetailsForm, "schoolAddress", schoolContext.school.schoolAddress);
    writeField(schoolDetailsForm, "teacherName", schoolContext.school.teacherName);
    writeField(schoolDetailsForm, "teacherMobile", schoolContext.school.teacherMobile);
    writeField(schoolDetailsForm, "teacherEmail", schoolContext.school.teacherEmail);
    await loadRegistrations();
    renderEvents();
  } catch (error) {
    setStatus(error.message || "Unable to load dashboard.", "error");
  }
}

async function loadRegistrations() {
  registrations = Array.isArray(schoolContext.school.registrations)
    ? schoolContext.school.registrations.slice().sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0))
    : [];
}

function renderEvents() {
  const count = registrations.length;
  registeredCount.textContent = count;
  availableCount.textContent = events.length;

  eventList.innerHTML = events
    .slice()
    .sort(byDashboardOrder)
    .map((event) => {
      const eventRegistrations = registrations.filter((item) => item.eventId === event.id);
      const limitReached = event.teamsPerInstitution !== null && eventRegistrations.length >= event.teamsPerInstitution;
      const registeredMarkup = eventRegistrations.length
        ? eventRegistrations.map((registration) => registrationCard(registration, event)).join("")
        : usesSharedRegistrationLink(event)
          ? ""
        : `<p class="byteit-muted">No teams registered yet.</p>`;
      const actionMarkup = usesSharedRegistrationLink(event)
        ? `<p class="event-card__notice">Registeration link will be shared</p>`
        : `
          <button class="byteit-button newbtn" type="button" data-register-event="${event.id}" ${limitReached ? "disabled" : ""}>
            ${limitReached ? "limit reached" : "Add Team"}
          </button>
        `;

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
          ${actionMarkup}
        </article>
      `;
    })
    .join("");
}

function registrationCard(registration, event) {
  const participantNames = (registration.participants || [])
    .map((participant) => `${participant.name} (${participant.classLabel})`)
    .join(", ");
  const actionsMarkup = usesSharedRegistrationLink(event)
    ? `<span class="team-actions__notice">Registeration link will be shared</span>`
    : `
      <div class="team-actions">
        <button class="newbtn" data-edit-registration="${registration.id}">edit</button>
        <button class="newbtn" type="button" data-delete-registration="${registration.id}">delete</button>
      </div>
    `;

  return `
    <div class="team-row">
      <div>
        <strong>${registration.teamName}</strong>
        <span>${participantNames}</span>
      </div>
      ${actionsMarkup}
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
    openTeamModal(events.find((item) => item.id === registration.eventId), registration);
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
  hideModalStatus();
  activeEvent = event;
  activeRegistration = registration;
  modal.hidden = false;
  document.body.classList.add("byteit-modal-open");
  modalTitle.textContent = registration ? `Edit ${event.name}` : `Register ${event.name}`;
  modalMeta.textContent = `${event.mode} · ${participantLabel(event)} · Class ${event.classRange}`;
  form.teamName.value = registration?.teamName || `${event.name} Team`;
  form.registrationId.value = registration?.id || "";
  renderParticipantFields(registration?.participants || []);
}

function closeTeamModal() {
  modal.hidden = true;
  document.body.classList.remove("byteit-modal-open");
  form.reset();
  hideModalStatus();
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
        <label>Class <input name="participantClass" value="${participant.classLabel || ""}" ${required} placeholder="IX"></label>
        <label>Email / Phone <input name="participantContact" value="${participant.contact || ""}" ${required}></label>
      </fieldset>
    `;
  }).join("");
}

schoolDetailsForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const details = schoolDetailsFromForm();
    schoolContext.school = {
      ...schoolContext.school,
      ...details
    };
    await setDoc(registrationDocRef(schoolContext.school.id), buildSchoolPayload(details), { merge: true });
    setStatus("School details saved.", "success");
  } catch (error) {
    setStatus(error.message || "Could not save school details.", "error");
  }
});

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const wasEditing = Boolean(activeRegistration?.id);
    const savedRegistration = await saveRegistration();
    closeTeamModal();
    if (wasEditing) {
      registrations = registrations.map((registration) =>
        registration.id === savedRegistration.id ? savedRegistration : registration
      );
    } else {
      registrations = [...registrations, savedRegistration];
    }
    schoolContext.school.registrations = registrations;
    renderEvents();
    await setDoc(registrationDocRef(schoolContext.school.id), buildSchoolPayload({}, registrations), { merge: true });
    setStatus("Registration saved.", "success");
  } catch (error) {
    setModalStatus(error.message || "Could not save registration.", "error");
  }
});

async function saveRegistration() {
  const formData = new FormData(form);
  const teamName = String(formData.get("teamName") || "").trim();
  const names = formData.getAll("participantName");
  const classes = formData.getAll("participantClass");
  const contacts = formData.getAll("participantContact");

  const participants = names
    .map((name, index) => ({
      name: String(name || "").trim(),
      classLabel: String(classes[index] || "").trim().toUpperCase(),
      contact: String(contacts[index] || "").trim()
    }))
    .filter((participant) => participant.name || participant.classLabel || participant.contact);

  if (!teamName) throw new Error("Please name the team.");
  if (participants.length < activeEvent.minParticipants || participants.length > activeEvent.maxParticipants) {
    throw new Error(`${activeEvent.name} needs ${participantLabel(activeEvent)}.`);
  }

  const ineligible = participants.find((participant) => !isClassEligible(participant.classLabel, activeEvent));
  if (ineligible) {
    throw new Error(`${activeEvent.name} allows Class ${activeEvent.classRange} only. ${ineligible.name || "A participant"} entered Class ${ineligible.classLabel || "blank"}.`);
  }

  if (!activeRegistration) {
    const existingForEvent = registrations.filter((item) => item.eventId === activeEvent.id).length;
    if (activeEvent.teamsPerInstitution !== null && existingForEvent >= activeEvent.teamsPerInstitution) {
      throw new Error(`${activeEvent.name} has reached the team limit for your school.`);
    }
  }

  const payload = {
    schoolId: schoolContext.school.id,
    eventId: activeEvent.id,
    eventName: activeEvent.name,
    teamName,
    participants,
    participantCount: participants.length,
    mode: activeEvent.mode,
    classRange: activeEvent.classRange,
    updatedAt: serverTimestamp()
  };

  if (activeRegistration?.id) {
    return {
      ...activeRegistration,
      ...payload,
      updatedAt: { seconds: Math.floor(Date.now() / 1000) }
    };
  } else {
    return {
      ...payload,
      id: makeRegistrationId(activeEvent.id),
      createdAt: { seconds: Math.floor(Date.now() / 1000) },
      updatedAt: { seconds: Math.floor(Date.now() / 1000) }
    };
  }
}

async function deleteRegistration(registrationId) {
  if (!window.confirm("Delete this team registration?")) return;
  try {
    registrations = registrations.filter((registration) => registration.id !== registrationId);
    schoolContext.school.registrations = registrations;
    await setDoc(registrationDocRef(schoolContext.school.id), buildSchoolPayload({}, registrations), { merge: true });
    renderEvents();
    setStatus("Registration deleted.", "success");
  } catch (error) {
    setStatus(error.message || "Could not delete registration.", "error");
  }
}

logoutButton?.addEventListener("click", async () => {
  const { auth } = requireFirebase();
  await signOut(auth);
  window.location.href = "login.html";
});

init();
