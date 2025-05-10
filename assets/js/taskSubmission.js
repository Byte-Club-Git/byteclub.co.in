firebase.initializeApp(firebaseConfig);
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        user.getIdTokenResult().then(async (idTokenResult) => {
            if (!idTokenResult.claims.admin) {
                alert("Access denied. You are not authorized to view this page.");
                window.location.href = "../index.html"; // or unauthorized.html
            } else {
                const email = user.email;
            }
        }).catch((error) => {
            console.error("Error checking admin claim:", error);
            window.location.href = "../index.html";
        });
    } else {
        alert("You are not logged in!");
        window.location.href = "../joinlogin.html";
    }
});
const urlParams = new URLSearchParams(window.location.search);
const skill = urlParams.get('skill');
const taskId = urlParams.get('taskId');

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const rtdb = firebase.database();

async function loadSubmissions() {
    const taskDoc = await db.collection("tasks").doc(skill).collection("tasks").doc(taskId).get();
    const data = taskDoc.data();
    const submissions = data.submissions || {};

    const membersSnap = await rtdb.ref("members").once("value");
    const members = membersSnap.val() || {};

    const list = document.getElementById("submissionList");
    const tasksContainer = document.getElementById("tasksContainer");

    list.innerHTML = "";

    if (Object.keys(submissions).length === 0) {
        list.textContent = "No submissions yet.";
        return;
    }

    for (const [username, link] of Object.entries(submissions)) {
        const memberEntry = Object.entries(members).find(([uid, info]) => info.email.startsWith(username));
        let fullName = "Unknown";
        let uid = null;
        let currentScore = "";

        if (memberEntry) {
            uid = memberEntry[0];
            const info = memberEntry[1];
            fullName = `${info.fname || ""} ${info.lname || ""}`;
            currentScore = info.taskScores && info.taskScores[taskId] !== undefined ? info.taskScores[taskId] : "";
        }

        const taskBox = document.createElement("div");
        const deadlineDate = new Date(data.deadline);
        taskBox.className = "taskBox";
        taskBox.innerHTML = `
                        <div class="statHeading">
                            <div class="statIcon">
                                <i class="bi bi-file-earmark-text"></i>
                            </div>
                            <span>${data.taskName}</span>
                                <div class="deleteIcon" onclick="deleteTask('${skill}', '${taskId}')">
                                    <i class="bi bi-trash"></i>
                                </div>
                        </div>
                        <div class="taskSkill">
                            <div class="skill">${skill}</div>
                        </div>
                        <div class="taskLink">
                            <a href="${data.promptLink}" target="_blank">
                                ${data.promptLink}
                            </a>
                        </div>
                        <div class="taskFooter">
                            <span>${formatDate(deadlineDate)}</span>
                            <div class="submitTask" onclick="alert('you are already here!')">Submissions</div>
                        </div>
                    `;

        tasksContainer.prepend(taskBox)

        const box = document.createElement("div");
        box.className = "taskBox";
        box.innerHTML = `
                    <div class="statHeading">
                        <span><strong>${fullName}</strong> (${username})</span>
                    </div>
                    <div class="taskLink">
                        <a href="${link}" target="_blank">${link}</a>
                    </div>
                    <div class="taskFooter">
                        <div class="scoreBox">
                            <label>Score:</label>
                            <input type="number" min="0" max="10" value="${currentScore}" id="score-${uid}" class="scoreInp" required>
                        </div>
                        <div class="submitTask" onclick="submitScore('${uid}', '${taskId}', 'score-${uid}')">Save</div>
                    </div>
                `;
        list.appendChild(box);
    }
}

function submitScore(uid, taskId, inputId) {
    const score = parseInt(document.getElementById(inputId).value);
    if (isNaN(score) || score < 0 || score > 10) {
        alert("Please enter a valid score between 0 and 10.");
        return;
    }
    firebase.database().ref(`members/${uid}/taskScores/${taskId}`).set(score)
        .then(() => alert("Score saved!"))
        .catch(err => {
            console.error("Error saving score:", err);
            alert("Failed to save score.");
        });
}

loadSubmissions();

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

async function deleteTask(skill, taskId) {
    const confirmDelete = confirm("Are you sure you want to delete this task?");
    if (!confirmDelete) return;

    try {
        await firebase.firestore()
            .collection("tasks")
            .doc(skill)
            .collection("tasks")
            .doc(taskId)
            .delete();

        alert("Task deleted successfully.");
        window.location.href = "../admindashboard.html";
    } catch (error) {
        console.error("Error deleting task:", error);
        alert("Failed to delete task.");
    }
}
