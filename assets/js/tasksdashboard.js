// Initialize Firebase (make sure firebase.js has firebaseConfig already loaded)
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();
const firestore = firebase.firestore();
let userUID = null; // Global

window.addEventListener("load", () => {
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            try {
                const email = user.email;
                const snapshot = await database.ref("members").orderByChild("email").equalTo(email).once("value");
                if (!snapshot.exists()) return;

                const userDataObj = snapshot.val();
                const firstKey = Object.keys(userDataObj)[0];
                userUID = firstKey;
                const userData = userDataObj[firstKey];

                displayUserStats(userData);
                await loadUserScores();
                loadUserTasks(userData.skills, email);
            } catch (err) {
                console.error("Error loading user data:", err);
            }
        } else {
            window.location.href = "../joinlogin.html"; // redirect if not logged in
        }
    });
});

function displayUserStats(userData) {
    document.getElementById("accountName").textContent = `${userData.fname} ${userData.lname}`;
    document.getElementById("initials").textContent = `${userData.fname.slice(0, 1)}${userData.lname.slice(0, 1)}`;

    // Display skills
    const skillSack = document.querySelector(".skillSack");
    skillSack.innerHTML = "";
    if (Array.isArray(userData.skills)) {
        userData.skills.forEach(skill => {
            const div = document.createElement("div");
            div.className = "skill";
            div.textContent = skill;
            skillSack.appendChild(div);
        });
    }
}

async function loadUserTasks(skills, email) {
    let completed = 0;
    let pending = 0;

    const currentTasksContainer = document.getElementById("currentTasks");
    const previousTasksContainer = document.getElementById("previousTasks");
    currentTasksContainer.innerHTML = "";
    previousTasksContainer.innerHTML = "";

    const today = new Date();
    const allTasks = [];

    for (const skill of skills) {
        const taskCol = firestore.collection("tasks").doc(skill).collection("tasks");
        const taskSnap = await taskCol.get();

        taskSnap.forEach(doc => {
            const task = doc.data();
            const taskId = doc.id;
            const deadline = new Date(task.deadline);
            const submissions = task.submissions || {};
            const username = email.split('@')[0];
            const userSubmission = submissions[username];
            const timestamps = task.submissionTimestamps || {};
            const submittedAt = timestamps[username];

            allTasks.push({
                ...task,
                id: taskId,
                skill,
                deadline,
                userSubmission,
                submittedDate: submittedAt?.toDate ? submittedAt.toDate() : submittedAt,
            });
        });
    }
    allTasks.sort((a, b) => b.deadline - a.deadline);

    allTasks.forEach(task => {
        const taskBox = document.createElement("div");
        taskBox.className = "taskBox";
        const currentScore = scores[task.id] ?? "nil";

        taskBox.innerHTML = `
            <div class="statHeading">
                <div class="statIcon"><i class="bi bi-file-earmark-text"></i></div>
                <span>${task.taskName || "Unnamed Task"}</span>
                <div class="deleteIconUser">${currentScore}</div>
            </div>
            <div class="taskSkill">
                <div class="skill">${task.skill}</div>
            </div>
            <div class="taskLink previousTaskLink previousTaskLink1">
                <a href="${task.promptLink}" target="_blank">${task.promptLink}</a>
            </div>
        `;

        const footer = document.createElement("div");
        footer.className = "taskFooter";

        if (task.userSubmission || task.deadline < today) {
            // Previous Task
            footer.innerHTML = `
                <span class='deadlineDate' title='Deadline'>${formatDate(task.deadline)}</span>
                <span class='submissionDate' title='Submission Date'>${formatDateTime(task.submittedDate)}</span>
            `;
            taskBox.classList.add("previousTaskBox");
            footer.classList.add("previousTaskFooter");

            const submissionLink = document.createElement("div");
            submissionLink.className = "taskLink previousTaskLink previousTaskLink2";
            submissionLink.innerHTML = `<span>submission: </span><a href="${task.userSubmission}" target="_blank">${task.userSubmission}</a>`;

            taskBox.appendChild(submissionLink);
            previousTasksContainer.appendChild(taskBox);
            completed++;
        } else {
            // Current Task
            const submitBtn = document.createElement("div");
            submitBtn.className = "submitTask";
            submitBtn.textContent = "Submit";
            submitBtn.addEventListener("click", () => submitTask(task.skill, task.id, email));

            footer.innerHTML = `<span class='deadlineDate' title='Deadline'>${formatDate(task.deadline)}</span>`;
            footer.appendChild(submitBtn);
            currentTasksContainer.appendChild(taskBox);
            pending++;
        }

        taskBox.appendChild(footer);
    });

    // Update stats
    document.querySelectorAll(".statBox")[0].querySelector(".value").textContent = completed;
    document.querySelectorAll(".statBox")[1].querySelector(".value").textContent = pending;
}

async function submitTask(skill, taskId, email) {
    const submissionURL = prompt("Enter your submission link (e.g., GitHub, CodePen, etc.):");
    if (!submissionURL || !submissionURL.startsWith("http")) {
        alert("Invalid link. Please submit a valid URL.");
        return;
    }

    const taskDocRef = firestore.collection("tasks").doc(skill).collection("tasks").doc(taskId);
    const taskDoc = await taskDocRef.get();
    if (!taskDoc.exists) {
        alert("Task not found.");
        return;
    }

    const taskData = taskDoc.data();
    const deadline = new Date(taskData.deadline);
    deadline.setHours(23, 59, 0, 0);
    const now = new Date();

    if (now > deadline) {
        alert("Sorry, the deadline for this task has passed. You cannot submit anymore.");
        return;
    }

    const username = email.split('@')[0];

    await taskDocRef.update({
        [`submissions.${username}`]: submissionURL,
        [`submissionTimestamps.${username}`]: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        alert("Submission successful!");
        window.location.reload();
    }).catch(err => {
        console.error("Error submitting task:", err);
        alert("Error submitting task. Please try again.");
    });
}


function logoutFirebase() {
    firebase.auth().signOut().then(function () {
        console.log('Signed Out');
        alert("bye")
        window.location.href = "../joinlogin.html";
    }, function (error) {
        console.error('Sign Out Error', error);
    });
}

function formatDate(date) {
    const month = date.toLocaleString('en-US', { month: 'short' }); // May
    const day = date.getDate(); // 10
    return `${month} ${day}, 11:59 PM`;
}

function formatDateTime(date) {
    if (!(date instanceof Date)) return null;

    finalDate = {
        month: date.toLocaleString('en-US', { month: 'short' }), // "May"
        day: date.getDate(),                                      // 2
        hour: date.getHours(),                                    // 15 (24-hr)
        minute: date.getMinutes().toString().padStart(2, '0'),    // "16"
        hour12: date.getHours() % 12 || 12,                       // 3 (12-hr)
        ampm: date.getHours() >= 12 ? 'PM' : 'AM'                 // "PM"
    };

    formattedDateTime = `${finalDate.month} ${finalDate.day}, ${finalDate.hour12}:${finalDate.minute} ${finalDate.ampm}`
    return formattedDateTime
}

let scores = {};

async function loadUserScores() {
    if (!userUID) return;

    const scoresRef = database.ref(`members/${userUID}/taskScores`);
    const snapshot = await scoresRef.once("value");
    const allScores = snapshot.val() || {};

    const userSkillsSnap = await database.ref(`members/${userUID}/skills`).once("value");
    const userSkills = userSkillsSnap.val() || [];

    let validScores = {};
    const db = firebase.firestore();

    for (const [taskId, score] of Object.entries(allScores)) {
        let taskExists = false;

        for (const skill of userSkills) {
            const taskDoc = await db.collection("tasks").doc(skill).collection("tasks").doc(taskId).get();
            if (taskDoc.exists) {
                taskExists = true;
                break;
            }
        }

        if (taskExists) {
            validScores[taskId] = score;
        }
    }

    // No var here — this updates the global variable
    scores = validScores;

    const total = Object.values(scores).reduce((a, b) => a + b, 0);
    document.querySelectorAll(".statBox")[2].querySelector(".value").textContent = total;

    console.log("Valid scores only:", scores);
}