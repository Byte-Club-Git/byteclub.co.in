export const events = [
  { id: "make-it", name: "Make.IT", teamsPerInstitution: 1, minParticipants: 2, maxParticipants: 4, classRange: "IX-XII", mode: "Hybrid" },
  { id: "build-it", name: "Build.IT", teamsPerInstitution: null, minParticipants: 2, maxParticipants: 4, classRange: "Open", mode: "Online" },
  { id: "design-it", name: "Design.IT", teamsPerInstitution: 1, minParticipants: 2, maxParticipants: 2, classRange: "IV-V", mode: "Offline" },
  { id: "think-it", name: "Think.IT", teamsPerInstitution: 1, minParticipants: 2, maxParticipants: 4, classRange: "IX-XII", mode: "Hybrid" },
  { id: "quiz-it", name: "Quiz.IT", teamsPerInstitution: 1, minParticipants: 2, maxParticipants: 2, classRange: "IX-XII", mode: "Hybrid" },
  { id: "code-it", name: "Code.IT", teamsPerInstitution: 1, minParticipants: 2, maxParticipants: 2, classRange: "IX-XII", mode: "Hybrid" },
  { id: "snap-it", name: "Snap.IT", teamsPerInstitution: 2, minParticipants: 2, maxParticipants: 2, classRange: "VI-XII", mode: "Hybrid" },
  { id: "frag-it", name: "Frag.IT", teamsPerInstitution: 1, minParticipants: 6, maxParticipants: 6, classRange: "IX-XII", mode: "Online" },
  { id: "surprise-it", name: "Surprise.IT", teamsPerInstitution: 1, minParticipants: 2, maxParticipants: 2, classRange: "IX-XII", mode: "Hybrid" },
  { id: "film-it", name: "Film.IT", teamsPerInstitution: 1, minParticipants: 2, maxParticipants: 4, classRange: "IX-XII", mode: "Online" },
  { id: "crypt-it", name: "Crypt.IT", teamsPerInstitution: null, minParticipants: 1, maxParticipants: 3, classRange: "Open", mode: "Online" },
  { id: "Robosoccer", name: "Robosoccer", teamsPerInstitution: 1, minParticipants: 2, maxParticipants: 4, classRange: "IX-XII", mode: "Online" },
  { id: "Electroart", name: "Electroart", teamsPerInstitution: null, minParticipants: 1, maxParticipants: 3, classRange: "Open", mode: "Online" }
];

const romanClasses = {
  IV: 4,
  V: 5,
  VI: 6,
  VII: 7,
  VIII: 8,
  IX: 9,
  X: 10,
  XI: 11,
  XII: 12
};

export function normalizeClass(value) {
  const clean = String(value || "").trim().toUpperCase();
  if (romanClasses[clean]) return romanClasses[clean];
  const number = Number.parseInt(clean, 10);
  return Number.isFinite(number) ? number : null;
}

export function isClassEligible(classValue, event) {
  if (event.classRange === "Open") return true;
  const normalized = normalizeClass(classValue);
  if (!normalized) return false;
  const [start, end] = event.classRange.split("-");
  return normalized >= romanClasses[start] && normalized <= romanClasses[end];
}

export function participantLabel(event) {
  return event.minParticipants === event.maxParticipants
    ? `${event.minParticipants} participant${event.minParticipants === 1 ? "" : "s"}`
    : `${event.minParticipants}-${event.maxParticipants} participants`;
}

export function teamLimitLabel(event) {
  return event.teamsPerInstitution === null ? "Unlimited teams" : `${event.teamsPerInstitution} team${event.teamsPerInstitution === 1 ? "" : "s"}`;
}
