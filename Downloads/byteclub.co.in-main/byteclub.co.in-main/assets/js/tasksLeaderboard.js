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
                buildLeaderboard()
            } catch (err) {
                console.error("Error loading user data:", err);
            }
        } else {
            window.location.href = "../joinlogin.html"; // redirect if not logged in
        }
    });
});

function displayUserStats(userData) {
    document.getElementById("initials").textContent = `${userData.fname.slice(0,1)}${userData.lname.slice(0,1)}`;
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


// Ensure Firebase is initialized (assuming firebaseConfig is loaded elsewhere)
// firebase.initializeApp(firebaseConfig); // Make sure this is done once

// Function to fetch data and build the leaderboard
async function buildLeaderboard() {
    const leaderboardBody = document.getElementById("leaderboardTableBody"); // Get the table body element
    if (!leaderboardBody) {
        console.error("Leaderboard table body element not found!");
        return;
    }

    leaderboardBody.innerHTML = "<div>Loading leaderboard...</div>"; // Show loading message

    try {
        // 1. Fetch all members from the Realtime Database
        const snapshot = await database.ref("members").once("value");

        if (!snapshot.exists()) {
            leaderboardBody.innerHTML = "<div>No members found.</div>";
            console.log("No members data available.");
            return;
        }

        const membersData = snapshot.val();
        const users = [];

        // 2. Process each member to calculate total points
        for (const uid in membersData) {
            if (membersData.hasOwnProperty(uid)) {
                const userData = membersData[uid];
                const fname = userData.fname || "";
                const lname = userData.lname || "";
                const discordID = userData.discordID || "";
                const taskScores = userData.taskScores || {};

                // Calculate total points
                // Calculate total points
                let totalPoints = 0;
                // Ensure scores are numbers before summing
                for (const taskId in taskScores) {
                    if (taskScores.hasOwnProperty(taskId)) {
                        const score = taskScores[taskId];
                        if (typeof score === 'number') {
                            totalPoints += score;
                        } else if (typeof score === 'string' && !isNaN(parseFloat(score))) {
                             totalPoints += parseFloat(score);
                        }
                    }
                }

                // Extract username from email (assuming it's before @)
                const username = discordID

                users.push({
                    uid: uid,
                    name: `${fname} ${lname}`.trim(),
                    discordId: username, // Using username as placeholder for Discord ID
                    points: totalPoints
                });
            }
        }

        // 3. Sort users by points in descending order
        users.sort((a, b) => b.points - a.points);

        // 4. Display users in the table
        leaderboardBody.innerHTML = ""; // Clear loading message

        if (users.length === 0) {
             leaderboardBody.innerHTML = "<div>No users with scores found.</div>";
             return;
        }

        users.forEach((user, index) => {
            // const row = leaderboardBody.insertRow();
            const row = document.createElement("div");
            row.className = 'row'
            const entry = `
                <div class="srNo">${index + 1}</div>
                <div class="about"><div class='name'>${user.name}</div> <div class='discordID'>${user.discordId}</div></div>
                <div class="score">${user.points}</div>
            `
            row.innerHTML = entry
            leaderboardBody.appendChild(row)
        });

    } catch (error) {
        console.error("Error building leaderboard:", error);
        leaderboardBody.innerHTML = "<div>Error loading leaderboard.</div>";
    }
}
// You might also want a logout function if this page is part of your app
function logoutFirebase() {
    firebase.auth().signOut().then(function () {
        console.log('Signed Out');
        alert("bye")
        window.location.href = "../joinlogin.html"; // Redirect to login page
    }, function (error) {
        console.error('Sign Out Error', error);
    });
}
