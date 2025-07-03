
const firebaseConfig = {
  apiKey: "AIzaSyCS5qxCpCs9eb9VrhSUOVxIlRWvzjg8WCA",
  authDomain: "byteit-25leaderboard.firebaseapp.com",
  projectId: "byteit-25leaderboard",
  storageBucket: "byteit-25leaderboard.firebasestorage.app",
  messagingSenderId: "542241200299",
  appId: "1:542241200299:web:8a527bc3b5f05971b97fee",
  measurementId: "G-V3E50WCPYJ"
};

    // 🔥 Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();

    // 📋 Fetch & Render Leaderboard
    const container = document.getElementById("leaderboardContainer");

    db.collection("leaderboard")
      .orderBy("score", "desc")
      .get()
      .then((querySnapshot) => {
        // Add header
        container.innerHTML = `
          <div class="teams">
            <div class="position leadheading rankheading">
              <span>Rank</span><div class="seprectangle seprectangle-left"></div>
            </div>
            <div class="headtext text">
              <span class="position leadheading headingteam">Team</span>
              <span class="points leadheading headscore">Score</span>
            </div>
          </div>
        `;

        let rank = 1;
        querySnapshot.forEach((doc) => {
          const team = doc.data();
          const top3 = rank <= 3 ? 'top3' : '';
          const rankClass = rank === 1 ? 'rank1' : '';

          container.innerHTML += `
            <div class="teams ${top3}">
              <div class="position ${top3} ${rankClass}"><span>${rank}</span></div>
              <div class="text">
                <span class="participantname ${top3}"><span class="tn">${team.name}</span><span class="sf">${team.sf}</span></span>
                <span class="points ${top3}">${team.score}</span>
              </div>
            </div>
          `;
          rank++;
        });
      })
      .catch((error) => {
        console.error("Error fetching leaderboard:", error);
        container.innerHTML = "<p>Failed to load leaderboard.</p>";
      });