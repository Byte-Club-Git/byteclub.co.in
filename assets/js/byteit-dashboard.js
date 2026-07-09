import { events, isClassEligible, participantLabel, teamLimitLabel } from "./byteit-events.js?v=20260709-closed";
import {
  db,
  deleteField,
  doc,
  getDoc,
  hasFirebaseConfig,
  onAuthStateChanged,
  reload,
  requireFirebase,
  serverTimestamp,
  setDoc,
  signOut
} from "./byteit-firebase.js?v=20260709-closed";

const REGISTRATION_COLLECTION = "byteit_registrations";
const ALL_REGISTRATIONS_CLOSED = true;
const DEFAULT_UNLIMITED_TEAM_SLOTS = 20;
const LEGACY_FLAT_FIELD_PREFIX = ["c", "s", "v"].join("_");
const REMOVED_DATABASE_EVENTS = [
  { id: "quiz-it", name: "Quiz.IT", teamsPerInstitution: 1, maxParticipants: 2 }
];
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
  return Boolean(event?.sharedLinkOnly);
}

function isRegistrationClosed(event) {
  return ALL_REGISTRATIONS_CLOSED || Boolean(event?.registrationsClosed);
}

function isDatabaseEvent(event) {
  return !usesSharedRegistrationLink(event);
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

function teamLabel(event, index) {
  return `${event.name} Team ${index + 1}`;
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

function teamSlotCount(event, registrationList) {
  if (event.teamsPerInstitution !== null) return event.teamsPerInstitution;
  const registeredTeams = registrationList.filter((registration) => registration.eventId === event.id).length;
  return Math.max(DEFAULT_UNLIMITED_TEAM_SLOTS, registeredTeams);
}

function blankParticipantFields(fields, eventPrefix, teamNumber, participantNumber) {
  const participantPrefix = `sheet_${eventPrefix}_team_${teamNumber}_participant_${participantNumber}`;
  fields[`${participantPrefix}_name`] = "";
  fields[`${participantPrefix}_class`] = "";
  fields[`${participantPrefix}_email`] = "";
}

function legacyFlatFieldDeletes() {
  const deletes = {
    [`${LEGACY_FLAT_FIELD_PREFIX}_school_name`]: deleteField(),
    [`${LEGACY_FLAT_FIELD_PREFIX}_school_address`]: deleteField(),
    [`${LEGACY_FLAT_FIELD_PREFIX}_teacher_in_charge_name`]: deleteField(),
    [`${LEGACY_FLAT_FIELD_PREFIX}_teacher_in_charge_mobile`]: deleteField(),
    [`${LEGACY_FLAT_FIELD_PREFIX}_teacher_in_charge_email`]: deleteField(),
    [`${LEGACY_FLAT_FIELD_PREFIX}_selected_events`]: deleteField()
  };

  [...events, ...REMOVED_DATABASE_EVENTS].forEach((event) => {
    const eventPrefix = flatKey(event.name || event.id);
    const teamSlots = event.teamsPerInstitution === null ? DEFAULT_UNLIMITED_TEAM_SLOTS : event.teamsPerInstitution;
    for (let teamIndex = 1; teamIndex <= teamSlots; teamIndex += 1) {
      deletes[`${LEGACY_FLAT_FIELD_PREFIX}_${eventPrefix}_team_${teamIndex}_name`] = deleteField();
      deletes[`sheet_${eventPrefix}_team_${teamIndex}_name`] = deleteField();
      for (let participantIndex = 1; participantIndex <= event.maxParticipants; participantIndex += 1) {
        const participantPrefix = `${LEGACY_FLAT_FIELD_PREFIX}_${eventPrefix}_team_${teamIndex}_participant_${participantIndex}`;
        deletes[`${participantPrefix}_name`] = deleteField();
        deletes[`${participantPrefix}_class`] = deleteField();
        deletes[`${participantPrefix}_email`] = deleteField();
      }
    }
  });

  return deletes;
}

function buildExportFields(school, registrationList) {
  const databaseEvents = events.filter(isDatabaseEvent);
  const eventOrder = new Map(databaseEvents.map((event, index) => [event.id, index]));
  const sortedRegistrations = registrationList.filter((registration) => eventOrder.has(registration.eventId)).slice().sort((a, b) => {
    const eventCompare = (eventOrder.get(a.eventId) ?? 999) - (eventOrder.get(b.eventId) ?? 999);
    return eventCompare || (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0);
  });
  const exportFields = {
    sheet_school_name: school.name || "",
    sheet_school_address: school.schoolAddress || "",
    sheet_teacher_in_charge_name: school.teacherName || "",
    sheet_teacher_in_charge_mobile: school.teacherMobile || "",
    sheet_teacher_in_charge_email: school.teacherEmail || school.email || "",
    sheet_selected_events: [...new Set(sortedRegistrations.map((registration) => registration.eventName).filter(Boolean))].join(", ")
  };

  databaseEvents.forEach((event) => {
    const eventPrefix = flatKey(event.name || event.id);
    const eventRegistrations = sortedRegistrations.filter((registration) => registration.eventId === event.id);
    const teamSlots = teamSlotCount(event, registrationList);

    for (let teamIndex = 1; teamIndex <= teamSlots; teamIndex += 1) {
      const registration = eventRegistrations[teamIndex - 1];

      for (let participantIndex = 1; participantIndex <= event.maxParticipants; participantIndex += 1) {
        blankParticipantFields(exportFields, eventPrefix, teamIndex, participantIndex);
        const participant = registration?.participants?.[participantIndex - 1];
        if (participant) {
          const participantPrefix = `sheet_${eventPrefix}_team_${teamIndex}_participant_${participantIndex}`;
          exportFields[`${participantPrefix}_name`] = participant.name || "";
          exportFields[`${participantPrefix}_class`] = participant.classLabel || "";
          exportFields[`${participantPrefix}_email`] = participant.contact || "";
        }
      }
    }
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
    selectedEvents: [...new Set(registrationList.filter((registration) => events.some((event) => event.id === registration.eventId && isDatabaseEvent(event))).map((registration) => registration.eventName).filter(Boolean))],
    registrations: registrationList.filter((registration) => events.some((event) => event.id === registration.eventId && isDatabaseEvent(event))),
    ...legacyFlatFieldDeletes(),
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
  const activeDatabaseEventIds = new Set(events.filter(isDatabaseEvent).map((event) => event.id));
  registrations = Array.isArray(schoolContext.school.registrations)
    ? schoolContext.school.registrations
      .filter((registration) => activeDatabaseEventIds.has(registration.eventId))
      .map(({ teamName, ...registration }) => registration)
      .sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0))
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
      const actionMarkup = isRegistrationClosed(event)
  ? `<p class="event-card__notice">Registrations closed for this event.</p>`
  : usesSharedRegistrationLink(event)
  ? `
    <p class="event-card__notice">
      <a href="${
        event.id === "crypt-it"
          ? "https://unstop.com/quiz/cryptit-bal-bharati-public-school-pitampura-1690718"
          : "https://unstop.com/hackathons/buildit-26-bal-bharati-public-school-pitampura-1698904"
      }" target="_blank" rel="noopener noreferrer">
        Register Here
      </a>
    </p>
  `
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
  const eventRegistrations = registrations.filter((item) => item.eventId === registration.eventId);
  const registrationIndex = Math.max(eventRegistrations.findIndex((item) => item.id === registration.id), 0);
  const actionsMarkup = isRegistrationClosed(event)
    ? `<span class="team-actions__notice">Registrations closed for this event.</span>`
    : usesSharedRegistrationLink(event)
  ? `
    <span class="team-actions__notice">
      <a href="${
        event.id === "crypt-it"
          ? "https://unstop.com/quiz/cryptit-bal-bharati-public-school-pitampura-1690718"
          : "https://unstop.com/hackathons/buildit-26-bal-bharati-public-school-pitampura-1698904"
      }" target="_blank" rel="noopener noreferrer">
        Register Here
      </a>
    </span>
  `
    : `
      <div class="team-actions">
        <button class="newbtn" data-edit-registration="${registration.id}">edit</button>
        <button class="newbtn" type="button" data-delete-registration="${registration.id}">delete</button>
      </div>
    `;

  return `
    <div class="team-row">
      <div>
        <strong>${teamLabel(event, registrationIndex)}</strong>
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

  if (registerId) {
    const eventToRegister = events.find((item) => item.id === registerId);
    if (isRegistrationClosed(eventToRegister)) {
      setStatus("Registrations closed for this event.", "error");
      return;
    }
    openTeamModal(eventToRegister);
  }
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
  if (isRegistrationClosed(activeEvent)) {
    throw new Error("Registrations closed for this event.");
  }

  const formData = new FormData(form);
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
