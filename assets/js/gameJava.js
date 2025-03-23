// firebase

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDucL9ALRAAUB73HFrBOOvqp5vrZBeOgJ8",
  authDomain: "bytegameleaderboard.firebaseapp.com",
  databaseURL: "https://bytegameleaderboard-default-rtdb.firebaseio.com",
  projectId: "bytegameleaderboard",
  storageBucket: "bytegameleaderboard.firebasestorage.app",
  messagingSenderId: "428797246861",
  appId: "1:428797246861:web:785653fdd0f6b57a4451c4",
  measurementId: "G-NNPT17CFNE"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.database(); // Use Realtime Database


// game

const numbers = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48', '49', '50', '51', '52', '53', '54', '55', '56', '57', '58', '59', '60', '61', '62', '63', '64', '65', '66', '67', '68', '69', '70', '71', '72', '73', '74', '75', '76', '77', '78', '79', '80', '81', '82', '83', '84', '85', '86', '87', '88', '89', '90', '91', '92', '93', '94', '95', '96', '97', '98', '99']
var temp = numbers.slice()
var vw = 0.233333
let scoreVal = 0
let randDiv;
let started = false;

const container = document.getElementById("container")
const leaderboard = document.getElementById("leaderboard")
const notification = document.getElementById("notification")
const score = document.getElementById("score")
const scoreDiv = document.getElementById("scoreDiv")
const startDesc = document.getElementById("startDesc")
score.innerHTML = scoreVal
const submitBtn = document.getElementById("submitBtn")


// defining variables
let equalSpace;
let vh;
const windowDiv = document.getElementById("window")

function createStructure() {

  vh = ((vw * (window.innerWidth)) / window.innerHeight)
  vh = Math.round(vh * 1000000) / 1000000
  const vertical = Math.floor(100 / (6.2 + 2 * vh))
  var r = document.querySelector(':root');

  const space = 100 - 6.2 * vertical - 2 * vh * vertical
  equalSpace = (space / vertical) + 6.2

  windowDiv.style.display = "flex"

  for (let i = 0; i < (15 * vertical); i++) {
    const newDigit = document.createElement("div");
    if (temp.length < 1) {
      temp = numbers.slice()
    }

    var randDigit = temp[Math.floor(Math.random() * temp.length)]
    newDigit.innerHTML = randDigit
    let index = temp.indexOf(randDigit);
    if (index !== -1) {
      temp.splice(index, 1);
    }

    newDigit.className = "digits " + randDigit;

    container.appendChild(newDigit)
  }
  r.style.setProperty('--height', equalSpace + 'vh');
  changePosition(0)
  scoreDiv.style.bottom = "1%"

  // start
  document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
      startDesc.style.opacity = "0"
      startDesc.style.pointerEvents = "none"
      if (started == false) {
        start()
      }
      started = true;
    }
  });
}

function changePosition(num) {

  let formattedNum = String(num).padStart(2, '0');

  const divs = document.getElementsByClassName(formattedNum)
  randDiv = divs[Math.floor(Math.random() * divs.length)]
  let position = randDiv.getBoundingClientRect()
  let xPx = position.x
  let yPx = position.y

  if (started == true) {
    randDiv.onclick = () => {
      randDiv.classList.add("randdivClicked")
      scoreVal += 1
      score.innerHTML = scoreVal
      randDiv.onclick = null;

    };
  }


  let xPos = (xPx / window.innerWidth) * 100;
  let yPos = (yPx / window.innerHeight) * 100;

  let x = Math.floor(xPos / (6.2 + 2 * vw))
  let y = Math.floor(yPos / (equalSpace + 2 * vh))

  const left = document.getElementById("left")
  const right = document.getElementById("right")
  const topDiv = document.getElementById("top")
  const bottom = document.getElementById("bottom")

  var leftvw = ((x) * 6.2 + 2 * (x) * vw)
  var rightvw = 100 - leftvw - vw - 6.2 - vw
  var topvh = equalSpace * (y) + vh * 2 * (y)
  var bottomvh = 100 - topvh - vh - 6.2 - vh

  left.style.width = leftvw + "vw";
  right.style.width = rightvw + "vw";
  topDiv.style.height = topvh + "vh";
  bottom.style.height = bottomvh + "vh";
  windowDiv.style.left = xPx - vw * window.innerWidth / 100 + 'px'
  windowDiv.style.top = yPx - vh * window.innerHeight / 100 + 'px'

}

async function start() {
  for (let i = 0; i < 100; i++) {
    await new Promise(resolve => setTimeout(() => {
      changePosition(i);
      resolve();
    }, (1500-(i**0.5)*(110.5541596785)) ));
  }

  scoreDiv.style.height = "20%"
  scoreDiv.style.bottom = "50%"
  scoreDiv.style.transform = "translateX(-50%) translateY(50%)"
  scoreDiv.style.fontSize = "4rem"

  // Save final score to Realtime Database
  const user = firebase.auth().currentUser;
  if (user) {
    const userRef = db.ref('leaderboard/' + user.uid);

    userRef.once('value').then(snapshot => {
      const existingScore = snapshot.val()?.score || 0;

      if (scoreVal > existingScore) { // Update only if new score is higher
        userRef.set({
          name: user.displayName || "Anonymous",
          score: scoreVal,
          timestamp: Date.now()
        });
      }
    }).then(() => {
      setTimeout(() => {
        showLeaderboard();
      }, 2000);
    });
  }

  console.log("Game over. Final score:", scoreVal);
}

function handleSubmit(event) {
  submitBtn.disabled = true;
  event.preventDefault();
  const name = document.getElementById('name').value;
  const pass = document.getElementById('password').value;
  const email = name + "@game.com";

  // Try signing in the user
  firebase.auth().signInWithEmailAndPassword(email, pass)
    .then((userCredential) => {
      console.log("Signed in:", userCredential.user);
      notify("#2e7d32", "User signed in")
      saveUserData(userCredential.user.uid, name);
      // start();
    })
    .catch((error) => {
      if (error.code === 'auth/wrong-password') {
        console.error("Incorrect password! Please try again.");
        notify("#e63946", "Password incorrect!")
        setTimeout(() => {
          location.reload();
        }, 1000);
      }
      else if (error.code === "auth/user-not-found") {
        firebase.auth().createUserWithEmailAndPassword(email, pass)
          .then((userCredential) => {
            let user = userCredential.user;

            // Update the display name
            return user.updateProfile({
              displayName: name  // Assuming 'name' is taken from an input field
            }).then(() => {
              console.log("User registered and display name set:", user.displayName);
              saveUserData(userCredential.user.uid, name);
              notify("#2e7d32", "User registered successfully")
            });
          })
          .catch((error) => {
            console.error("Error registering:", error.message);
          });
      }
      else {
        console.log(email, name, pass)
        console.error("Error signing in:", error.message);
        alert(error.message);
      }

    })
    .finally(() => {
      console.log("Sign-in attempt finished");
      submitBtn.disabled = false;
    });



  const disappear = document.getElementsByClassName("disappear")
  for (let i = 0; i < disappear.length; i++) {
    const e = disappear[i];
    e.style.opacity = 0
    e.style.pointerEvents = "none"
  }

  const greeting = document.getElementById('greeting');
  let value = greeting.innerText;
  for (let i = 0; i < value.length; i++) {
    setTimeout(() => {
      greeting.innerHTML = value.slice(0, -1);
      value = greeting.innerText
    }, i * 50);
  }

  setTimeout(() => {
    value = ("How to play")
    for (let i = 0; i < value.length; i++) {
      setTimeout(() => {
        greeting.innerHTML += value.slice(0, 1);
        value = value.slice(1)
      }, (i * 50));
    }
  }, 550);

  const info = document.getElementById('info');
  const loader = document.getElementById('loader');
  const authContainer = document.getElementById('authContainer');

  info.style.width = "70%"
  info.style.opacity = 1
  info.style.pointerEvents = "all"
  loader.style.width = "100%"
  authContainer.style.opacity = "0"
  authContainer.style.pointerEvents = "none"

  setTimeout(() => {
    container.style.opacity = "1"
    startDesc.style.opacity = "1"
    startDesc.style.pointerEvents = "all"
    startDesc.style.width = "max-content"
    container.style.pointerEvents = "all"
    createStructure()
  }, 12000);

}

function saveUserData(userId, name) {
  // Save user data in Realtime Database
  db.ref('users/' + userId).set({
    name: name,
    score: 0 // Initial score = 0
  });
}

function showLeaderboard() {
  scoreDiv.style.display = "none"
  container.style.display = "none"
  startDesc.style.display = "none"
  authContainer.style.transition = "opacity 300ms 0s"
  authContainer.style.opacity = "1"
  authContainer.style.pointerEvents = "all"
  windowDiv.style.display = "none"
  info.style.display = "none"
  loader.style.display = "none"
  greeting.innerHTML = "LEADERBOARD";
  greeting.classList.add("greetingEnd")
  leaderboard.style.display = "flex"

  // firebase

  db.ref("leaderboard").once("value", (snapshot) => {
    const data = snapshot.val();
    if (!data) {
      leaderboard.innerHTML = "No data available!";
      return;
    }

    // Convert to array and sort by score (highest first)
    const leaderboardArray = Object.values(data).sort((a, b) => b.score - a.score);

    // Display leaderboard
    leaderboard.innerHTML = leaderboardArray
      .map((player, index) => `<div class="player">
            <span class="rank">#${index + 1}</span>
            <span class="playerName">${player.name}</span>
            <span class="playerScore">${player.score} pts</span>
        </div>`)
      .join("");
  });
}

function notify(color, text) {
  notification.style.color = color
  notification.style.bottom = "1%"
  notification.innerHTML = text
  setTimeout(() => { notification.style.bottom = "-8%" }, 2000);
}