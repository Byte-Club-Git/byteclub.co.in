import { events } from "./byteit-events.js?v=20260709-closed";
import {
  auth,
  db,
  doc,
  getDoc,
  GoogleAuthProvider,
  serverTimestamp,
  setDoc,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut
} from "./byteit-firebase.js?v=20260709-closed";

const loginPanel = document.querySelector("[data-login-panel]");
const assignmentPanel = document.querySelector("[data-assignment-panel]");
const formPanel = document.querySelector("[data-form-panel]");
const loginForm = document.querySelector("[data-login-form]");
const judgementForm = document.querySelector("[data-judgement-form]");
const googleLoginButton = document.querySelector("[data-google-login]");
const logoutButton = document.querySelector("[data-logout]");
const judgeEmail = document.querySelector("[data-judge-email]");
const eventList = document.querySelector("[data-event-list]");
const formTitle = document.querySelector("[data-form-title]");
const totalScore = document.querySelector("[data-total-score]");
const statusBox = document.querySelector("[data-status]");

let currentJudge = null;
let currentAssignment = null;
let selectedEvent = null;

function showStatus(message, type = "success") {
  if (!statusBox) return;
  statusBox.hidden = false;
  statusBox.textContent = message;
  statusBox.dataset.type = type;
}

function setPanelVisibility(isLoggedIn) {
  loginPanel?.classList.toggle("judge-hidden", isLoggedIn);
  assignmentPanel?.classList.toggle("judge-hidden", !isLoggedIn);
  formPanel?.classList.toggle("judge-hidden", !isLoggedIn || !selectedEvent);
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function allowedEvents() {
  const eventIds = Array.isArray(currentAssignment?.eventIds) ? currentAssignment.eventIds : [];
  return events.filter((event) => eventIds.includes(event.id));
}

function renderEvents() {
  const assignedEvents = allowedEvents();
  if (!eventList) return;

  if (!assignedEvents.length) {
    eventList.innerHTML = "<p>No events are assigned to this judge email yet.</p>";
    selectedEvent = null;
    setPanelVisibility(true);
    return;
  }

  eventList.innerHTML = assignedEvents.map((event) => `
    <button class="judge-event-option" type="button" data-event-id="${event.id}" aria-pressed="${selectedEvent?.id === event.id}">
      <strong>${event.name}</strong>
      <span>${event.mode} · Class ${event.classRange}</span>
    </button>
  `).join("");
}

function selectEvent(eventId) {
  selectedEvent = allowedEvents().find((event) => event.id === eventId) || null;
  formTitle.textContent = selectedEvent ? `${selectedEvent.name} Judgement` : "Judgement Form";
  renderEvents();
  setPanelVisibility(Boolean(currentJudge));
}

async function loadAssignment(user) {
  const email = normalizeEmail(user.email);
  const assignmentRef = doc(db, "judge_assignments", email);
  const assignmentSnap = await getDoc(assignmentRef);

  currentJudge = user;
  currentAssignment = assignmentSnap.exists() ? assignmentSnap.data() : null;
  judgeEmail.textContent = email;
  selectedEvent = null;
  renderEvents();
  setPanelVisibility(true);

  if (!currentAssignment) {
    showStatus("This email is logged in, but it is not assigned to any event in Firebase.", "error");
  }
}

function scoreValue(formData, field) {
  const value = Number(formData.get(field));
  return Number.isFinite(value) ? value : 0;
}

function calculateTotal() {
  const formData = new FormData(judgementForm);
  const total = scoreValue(formData, "idea")
    + scoreValue(formData, "execution")
    + scoreValue(formData, "presentation")
    + scoreValue(formData, "technical")
    + scoreValue(formData, "qa")
    - scoreValue(formData, "penalty");
  totalScore.textContent = Math.max(total, 0).toString();
  return Math.max(total, 0);
}

loginForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(loginForm);
  try {
    const credential = await signInWithEmailAndPassword(
      auth,
      normalizeEmail(formData.get("email")),
      String(formData.get("password") || "")
    );
    await loadAssignment(credential.user);
  } catch (error) {
    showStatus(error.message || "Could not log in.", "error");
  }
});

googleLoginButton?.addEventListener("click", async () => {
  try {
    const provider = new GoogleAuthProvider();
    const credential = await signInWithPopup(auth, provider);
    await loadAssignment(credential.user);
  } catch (error) {
    showStatus(error.message || "Could not log in with Google.", "error");
  }
});

logoutButton?.addEventListener("click", async () => {
  await signOut(auth);
  currentJudge = null;
  currentAssignment = null;
  selectedEvent = null;
  setPanelVisibility(false);
});

eventList?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-event-id]");
  if (!button) return;
  selectEvent(button.dataset.eventId);
});

judgementForm?.addEventListener("input", calculateTotal);

judgementForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!currentJudge || !selectedEvent) {
    showStatus("Select an assigned event before submitting.", "error");
    return;
  }

  const formData = new FormData(judgementForm);
  const judgeMail = normalizeEmail(currentJudge.email);
  const teamName = String(formData.get("teamName") || "").trim();
  const schoolName = String(formData.get("schoolName") || "").trim();
  const idParts = [selectedEvent.id, judgeMail, schoolName, teamName]
    .map((part) => part.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""))
    .filter(Boolean);

  try {
    await setDoc(doc(db, "judgement_scores", idParts.join("__")), {
      eventId: selectedEvent.id,
      eventName: selectedEvent.name,
      judgeEmail: judgeMail,
      teamName,
      schoolName,
      participants: String(formData.get("participants") || "")
        .split(/\r?\n/)
        .map((name) => name.trim())
        .filter(Boolean),
      scores: {
        idea: scoreValue(formData, "idea"),
        execution: scoreValue(formData, "execution"),
        presentation: scoreValue(formData, "presentation"),
        technical: scoreValue(formData, "technical"),
        qa: scoreValue(formData, "qa"),
        penalty: scoreValue(formData, "penalty")
      },
      total: calculateTotal(),
      remarks: String(formData.get("remarks") || "").trim(),
      updatedAt: serverTimestamp()
    });

    judgementForm.reset();
    calculateTotal();
    showStatus("Judgement submitted.", "success");
  } catch (error) {
    showStatus(error.message || "Could not submit judgement.", "error");
  }
});

setPanelVisibility(false);
