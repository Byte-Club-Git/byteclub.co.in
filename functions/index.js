const crypto = require("node:crypto");
const admin = require("firebase-admin");
const { HttpsError, onCall } = require("firebase-functions/v2/https");

admin.initializeApp();

const db = admin.firestore();

const events = [
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
  { id: "crypt-it", name: "Crypt.IT", teamsPerInstitution: null, minParticipants: 1, maxParticipants: 3, classRange: "Open", mode: "Online" }
];

const eventsById = new Map(events.map((event) => [event.id, event]));
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

function cleanString(value) {
  return String(value || "").trim();
}

function cleanEmail(value) {
  return cleanString(value).toLowerCase();
}

function generatePassword() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
  const bytes = crypto.randomBytes(18);
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
}

function normalizeClass(value) {
  const clean = cleanString(value).toUpperCase();
  if (romanClasses[clean]) return romanClasses[clean];
  const number = Number.parseInt(clean, 10);
  return Number.isFinite(number) ? number : null;
}

function isClassEligible(classValue, event) {
  if (event.classRange === "Open") return true;
  const normalized = normalizeClass(classValue);
  if (!normalized) return false;
  const [start, end] = event.classRange.split("-");
  return normalized >= romanClasses[start] && normalized <= romanClasses[end];
}

function assertAuthed(request) {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Please log in first.");
  }
  return request.auth.uid;
}

function cleanParticipants(participants, event) {
  if (!Array.isArray(participants)) {
    throw new HttpsError("invalid-argument", "Participants are required.");
  }

  const cleaned = participants
    .map((participant) => ({
      name: cleanString(participant.name),
      classLabel: cleanString(participant.classLabel).toUpperCase(),
      contact: cleanString(participant.contact)
    }))
    .filter((participant) => participant.name || participant.classLabel || participant.contact);

  if (cleaned.length < event.minParticipants || cleaned.length > event.maxParticipants) {
    throw new HttpsError("invalid-argument", `${event.name} needs ${event.minParticipants}-${event.maxParticipants} participants.`);
  }

  const incomplete = cleaned.find((participant) => !participant.name || !participant.classLabel || !participant.contact);
  if (incomplete) {
    throw new HttpsError("invalid-argument", "Each participant needs name, class, and email/phone.");
  }

  const ineligible = cleaned.find((participant) => !isClassEligible(participant.classLabel, event));
  if (ineligible) {
    throw new HttpsError("invalid-argument", `${ineligible.name} is not eligible for Class ${event.classRange}.`);
  }

  return cleaned;
}

exports.registerSchool = onCall(async (request) => {
  const schoolName = cleanString(request.data?.schoolName);
  const schoolEmail = cleanEmail(request.data?.schoolEmail);

  if (!schoolName || !schoolEmail) {
    throw new HttpsError("invalid-argument", "School name and email are required.");
  }

  try {
    await admin.auth().getUserByEmail(schoolEmail);
    throw new HttpsError("already-exists", "This school email is already registered.");
  } catch (error) {
    if (error instanceof HttpsError) throw error;
    if (error.code !== "auth/user-not-found") throw error;
  }

  const password = generatePassword();
  let userRecord;

  try {
    userRecord = await admin.auth().createUser({
      email: schoolEmail,
      password,
      displayName: schoolName,
      emailVerified: false
    });

    await db.doc(`schools/${userRecord.uid}`).set({
      name: schoolName,
      email: schoolEmail,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    await db.collection("mail").add({
      to: [schoolEmail],
      message: {
        subject: "Your Byte.IT school dashboard password",
        text: `Your Byte.IT school account is ready.\n\nSchool: ${schoolName}\nEmail: ${schoolEmail}\nPassword: ${password}\n\nLogin at your Byte.IT dashboard and keep this password private.`,
        html: `<p>Your Byte.IT school account is ready.</p><p><strong>School:</strong> ${schoolName}<br><strong>Email:</strong> ${schoolEmail}<br><strong>Password:</strong> ${password}</p><p>Login at your Byte.IT dashboard and keep this password private.</p>`
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return { ok: true };
  } catch (error) {
    if (userRecord?.uid) {
      await admin.auth().deleteUser(userRecord.uid).catch(() => {});
      await db.doc(`schools/${userRecord.uid}`).delete().catch(() => {});
    }
    throw new HttpsError("internal", error.message || "Could not create school account.");
  }
});

exports.saveEventRegistration = onCall(async (request) => {
  const schoolId = assertAuthed(request);
  const eventId = cleanString(request.data?.eventId);
  const event = eventsById.get(eventId);
  const teamName = cleanString(request.data?.teamName);
  const registrationId = cleanString(request.data?.registrationId);

  if (!event) throw new HttpsError("invalid-argument", "Event not found.");
  if (!teamName) throw new HttpsError("invalid-argument", "Team name is required.");

  const participants = cleanParticipants(request.data?.participants, event);
  const registrationsRef = db.collection("event_registrations");

  await db.runTransaction(async (transaction) => {
    let registrationRef;

    if (registrationId) {
      registrationRef = registrationsRef.doc(registrationId);
      const registrationSnapshot = await transaction.get(registrationRef);
      if (!registrationSnapshot.exists || registrationSnapshot.data().schoolId !== schoolId) {
        throw new HttpsError("not-found", "Registration not found.");
      }
    } else {
      const existingSnapshot = await registrationsRef
        .where("schoolId", "==", schoolId)
        .where("eventId", "==", event.id)
        .get();

      if (event.teamsPerInstitution !== null && existingSnapshot.size >= event.teamsPerInstitution) {
        throw new HttpsError("failed-precondition", `${event.name} has reached the team limit for your school.`);
      }
      registrationRef = registrationsRef.doc();
    }

    const registrationPayload = {
      schoolId,
      eventId: event.id,
      eventName: event.name,
      teamName,
      participants,
      participantCount: participants.length,
      mode: event.mode,
      classRange: event.classRange,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    if (!registrationId) {
      registrationPayload.createdAt = admin.firestore.FieldValue.serverTimestamp();
    }

    transaction.set(registrationRef, registrationPayload, { merge: true });
  });

  return { ok: true };
});

exports.deleteEventRegistration = onCall(async (request) => {
  const schoolId = assertAuthed(request);
  const registrationId = cleanString(request.data?.registrationId);
  if (!registrationId) throw new HttpsError("invalid-argument", "Registration ID is required.");

  const registrationRef = db.collection("event_registrations").doc(registrationId);
  const registrationSnapshot = await registrationRef.get();
  if (!registrationSnapshot.exists || registrationSnapshot.data().schoolId !== schoolId) {
    throw new HttpsError("not-found", "Registration not found.");
  }

  await registrationRef.delete();
  return { ok: true };
});
