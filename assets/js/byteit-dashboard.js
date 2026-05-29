import { events, isClassEligible, participantLabel, teamLimitLabel } from "./byteit-events.js";
import {
  addDoc,
  collection,
  db,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  hasFirebaseConfig,
  onAuthStateChanged,
  query,
  reload,
  requireFirebase,
  serverTimestamp,
  setDoc,
  signOut,
  where
} from "./byteit-firebase.js?v=20260527-setpass4";

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

    const schoolRef = doc(db, "schools", user.uid);
    const schoolSnapshot = await getDoc(schoolRef);
    let schoolData = schoolSnapshot.data();

    if (!schoolSnapshot.exists()) {
      schoolData = {
        name: user.displayName || user.email?.split("@")[0] || "School",
        email: user.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      await setDoc(schoolRef, schoolData);
    }

    schoolContext = { user, school: { id: user.uid, ...schoolData } };
    schoolName.textContent = schoolContext.school.name;
    schoolEmail.textContent = schoolContext.school.email;
    await loadRegistrations();
    renderEvents();
  } catch (error) {
    setStatus(error.message || "Unable to load dashboard.", "error");
  }
}

async function loadRegistrations() {
  const registrationsQuery = query(
    collection(db, "event_registrations"),
    where("schoolId", "==", schoolContext.school.id)
  );
  const snapshot = await getDocs(registrationsQuery);
  registrations = snapshot.docs.map((registrationDoc) => ({
    id: registrationDoc.id,
    ...registrationDoc.data()
  })).sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));
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
    renderEvents();
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
    throw new Error(`${ineligible.name || "A participant"} is not eligible for Class ${activeEvent.classRange}.`);
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
    await setDoc(doc(db, "event_registrations", activeRegistration.id), payload, { merge: true });
    return {
      ...activeRegistration,
      ...payload,
      updatedAt: { seconds: Math.floor(Date.now() / 1000) }
    };
  } else {
    const registrationRef = await addDoc(collection(db, "event_registrations"), {
      ...payload,
      createdAt: serverTimestamp()
    });
    return {
      ...payload,
      id: registrationRef.id,
      createdAt: { seconds: Math.floor(Date.now() / 1000) },
      updatedAt: { seconds: Math.floor(Date.now() / 1000) }
    };
  }
}

async function deleteRegistration(registrationId) {
  if (!window.confirm("Delete this team registration?")) return;
  try {
    await deleteDoc(doc(db, "event_registrations", registrationId));
    registrations = registrations.filter((registration) => registration.id !== registrationId);
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
