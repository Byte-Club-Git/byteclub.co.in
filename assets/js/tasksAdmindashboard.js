firebase.initializeApp(firebaseConfig);
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        user.getIdTokenResult().then(async (idTokenResult) => {
            if (!idTokenResult.claims.admin) {
                alert("Access denied. You are not authorized to view this page.");
                window.location.href = "../index.html"; // or unauthorized.html
            } else {
                const email = user.email;
                const snapshot = await firebase.database().ref("members").orderByChild("email").equalTo(email).once("value");
                if (snapshot.exists()) {
                    const userData = Object.values(snapshot.val())[0];
                    const fullName = `${userData.fname || ""} ${userData.lname || ""}`.trim();
                    document.getElementById("accountName").textContent = fullName;
                } else {
                    document.getElementById("accountName").textContent = email.split('@')[0]; // fallback
                }
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

const addTask = document.getElementById("addTask")

function skillClicked(e) {
    if (e.classList.contains("clicked")) {
        e.classList.remove("clicked")
    } else {
        e.classList.add("clicked")
    }
}

function headingSelect(left) {
    activeHeading = document.getElementById("activeHeading")
    currentTasks = document.getElementById("currentTasks")
    previousTasks = document.getElementById("previousTasks")
    activeHeading.style.left = left

    if (left == 0) {
        currentTasks.style.display = "flex"
        previousTasks.style.display = "none"
    } else {
        currentTasks.style.display = "none"
        previousTasks.style.display = "flex"
    }
}

function formOpen() {
    addTask.style.pointerEvents = "all"
    addTask.style.opacity = "1"
}



// form store --------------
const db = firebase.firestore();

// 3. Form Submission Handling
document.querySelector("form").addEventListener("submit", async function (e) {
    e.preventDefault();

    const taskInputs = document.querySelectorAll(".taskname");
    const taskName = taskInputs[0].value.trim();
    const promptLink = taskInputs[1].value.trim();

    const deadline = document.querySelector(".dateInput").value;
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);

    const clickedSkills = Array.from(document.querySelectorAll(".skill.clicked")).map(el => el.textContent.trim());


    if (!taskName || !promptLink || !deadline || clickedSkills.length === 0) {
        alert("Please fill all fields and select at least one skill.");
        return;
    }

    try {
        var webhookURL;
        var payload;
        for (let skill of clickedSkills) {


            if (skill == "Programming") {
                webhookURL = "https://l.webhook.party/hook/rfyEb3L6HHnhLey%2BAiPlueXUqA12MPcjIN3HgiOSxAm%2F7jg8VGY9FJMKnuVyRBMYcw4Wt3w8GV8Qfk%2BbJgvZ%2Fva45iCg0u0MoBd4mMLnS7WsgIc1tVZsxWpDoQ3yDLwkZtgfSs9dcPYfbdDEcy0T404yBWakCkyfdXIfke%2FhpIFBpvDotvvXAPO1Hzv7RyWFEKk3%2F41WF%2FNYlvUQHBnqrizvSvWcenXROIjQp9CfjG1HKmMroi5ZsJCUM3WicBw7VbMWe4jvlRkvenUp0xkodw3UpNpuuqqlVgsJ5bA9IitDf2XJq4yplMLT41aH5zljyob0JN9maiGIXcsh4IN%2BZumds2pYTw9ffyLg1oHHUOua2fPoLvTmaEib18mqWBq3E3h36umImdc%3D/Jp3GJGfSlNmNGNNj"
            }

            await db.collection("tasks").doc(skill).collection("tasks").add({
                taskName,
                promptLink,
                deadline,
                currentTime,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });

            payload = {
                embeds: [
                    {
                        color: 0x67A9E4,
                        fields: [
                            {
                                name: "📝 Title",
                                value: `**${taskName}**`,
                            },
                            {
                                name: "🔗 Prompt Link",
                                value: `[Open Prompt](${promptLink})`,
                            },
                            {
                                name: "🗓️ Deadline",
                                value: `> ${deadline}, 11:59PM`,
                                inline: true
                            },
                            {
                                name: "⏰ Posted At",
                                value: `> ${currentTime}`,
                                inline: true
                            }
                        ],
                        footer: {
                            text: skill + " Task | Byte Club",
                        },
                        timestamp: new Date().toISOString()
                    }
                ]
            };

            fetch(webhookURL, {
                method: 'POST',
                body: JSON.stringify(payload),
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(response => {
                if (response.ok) {
                    alert(`Alert Sent to: ${skill} members`)
                } else {
                    console.log("Failed to send webhook message.");
                }
            }).catch(err => {
                console.error("Webhook error:", err);
            });
        }
        alert("Task added to all clicked skill categories!");
        this.reset(); // reset form after submit
        document.querySelectorAll(".skill.clicked").forEach(el => el.classList.remove("clicked")); // reset skill buttons
        addTask.style.pointerEvents = "none"
        addTask.style.opacity = "0"
        location.reload();
    } catch (error) {
        console.error("Error adding task:", error);
        alert("There was an error. Check console.");
    }
});



// pull data ------------------


// You should already have Firebase initialized with Firestore (from previous step)

const currentTasksContainer = document.getElementById("currentTasks");
const previousTasksContainer = document.getElementById("previousTasks");

const skills = [
    "Programming", "Web Development", "Motion Design", "Graphic Design",
    "Cryptic", "Photographer", "Group Discussion", "Quizzer",
    "Game developer", "Entrepreneurship", "Video Editor", "Gamer",
    "3D design", "Robotics", "Film Making", "Acting", "Not Sure"
];

async function fetchTasksForUser() {
    currentTasksContainer.innerHTML = "";
    previousTasksContainer.innerHTML = "";

    const today = new Date();
    const tasks = [];

    for (const skill of skills) {
        const tasksRef = firebase.firestore()
            .collection("tasks")
            .doc(skill)
            .collection("tasks");

        try {
            const snapshot = await tasksRef.get();
            snapshot.forEach(doc => {
                const task = doc.data();
                const taskId = doc.id;
                const deadlineDate = new Date(task.deadline);

                tasks.push({
                    ...task,
                    id: taskId,
                    deadlineDate,
                    isUpcoming: deadlineDate >= today,
                    skill: skill
                });
            });

        } catch (error) {
            console.error(`Error fetching tasks for ${skill}:`, error);
        }
    }


    tasks.sort((a, b) => b.deadlineDate - a.deadlineDate);
    console.log(tasks)

    tasks.forEach(task => {
        const taskBox = document.createElement("div");
        taskBox.className = "taskBox";
        taskBox.innerHTML = `
                    <div class="statHeading">
                        <div class="statIcon">
                            <i class="bi bi-file-earmark-text"></i>
                        </div>
                        <span>${task.taskName}</span>
                        <div class="deleteIcon" onclick="deleteTask('${task.skill}', '${task.id}')">
                            <i class="bi bi-trash"></i>
                        </div>
                    </div>
                    <div class="taskSkill">
                        <div class="skill">${task.skill}</div>
                    </div>
                    <div class="taskLink">
                        <a href="${task.promptLink}" target="_blank">
                            ${task.promptLink}
                        </a>
                    </div>
                    <div class="taskFooter">
                        <span>${formatDate(task.deadlineDate)}</span>
                        <div class="submitTask" onclick="viewSubmissions('${task.skill}', '${task.id}')">Submissions</div>
                    </div>
                `;

        if (task.isUpcoming) {
            currentTasksContainer.appendChild(taskBox);
        } else {
            previousTasksContainer.appendChild(taskBox);
        }
    });
}

// Helper to format date as "MMM DD, h:mm A"
function formatDate(date) {
    const month = date.toLocaleString('en-US', { month: 'short' }); // May
    const day = date.getDate(); // 10
    return `${month} ${day}, 11:59 PM`;
}

async function deleteTask(skill, taskId) {
    const confirmDelete = confirm("Are you sure you want to delete this task and all associated scores?");

    if (!confirmDelete) return;

    try {
        // 1. Get a reference to the Realtime Database
        const rtdb = firebase.database();

        // 2. Fetch all members from the Realtime Database
        const membersSnapshot = await rtdb.ref("members").once("value");
        const membersData = membersSnapshot.val();

        const scoreDeletionPromises = [];

        // 3. Iterate through members and find/delete scores for this task
        if (membersData) {
            for (const uid in membersData) {
                if (membersData.hasOwnProperty(uid)) {
                    const userData = membersData[uid];
                    // Check if the member has taskScores and if a score exists for this taskId
                    if (userData.taskScores && userData.taskScores[taskId] !== undefined) {
                        console.log(`Deleting score for user ${uid} for task ${taskId}`);
                        // Add the deletion promise to the array
                        scoreDeletionPromises.push(
                            rtdb.ref(`members/${uid}/taskScores/${taskId}`).remove()
                        );
                    }
                }
            }
        }

        // 4. Wait for all score deletions to complete
        if (scoreDeletionPromises.length > 0) {
            console.log(`Attempting to delete ${scoreDeletionPromises.length} scores...`);
            await Promise.all(scoreDeletionPromises);
            console.log("All associated scores deleted from Realtime Database.");
        } else {
            console.log("No associated scores found in Realtime Database for this task.");
        }


        // 5. Delete the task document from Firestore
        console.log(`Deleting task ${taskId} from Firestore under skill ${skill}`);
        await firebase.firestore()
            .collection("tasks")
            .doc(skill)
            .collection("tasks")
            .doc(taskId)
            .delete();
        console.log("Task document deleted from Firestore.");

        alert("Task and all associated scores deleted successfully.");

        // 6. Refresh the task list on the page
        // Assuming fetchTasksForUser() is defined and available in this scope
        if (typeof fetchTasksForUser === 'function') {
            fetchTasksForUser();
        } else {
            // If fetchTasksForUser is not available (e.g., in submissions.html),
            // you might need a different refresh logic, like reloading the page
            // window.location.reload(); // Use this if fetchTasksForUser is not global/available
            // Or redirect if it's the admin dashboard page
            window.location.href = "../admindashboard.html";
        }


    } catch (error) {
        console.error("Error during task or score deletion:", error);
        alert("Failed to delete task or associated scores. Check console for details.");
    }
}


// Call on page load
fetchTasksForUser();

function logoutFirebase() {
    firebase.auth().signOut().then(function () {
        console.log('Signed Out');
        alert("bye")
        window.location.href = "../joinlogin.html";
    }, function (error) {
        console.error('Sign Out Error', error);
    });
}

function viewSubmissions(skill, taskId) {
    const url = `submissions.html?skill=${encodeURIComponent(skill)}&taskId=${encodeURIComponent(taskId)}`;
    window.location.href = url;
}
