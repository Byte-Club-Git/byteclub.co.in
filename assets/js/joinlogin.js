
function skillClicked(e) {

    if (e.classList.contains("clicked")) {
        e.classList.remove("clicked")
    } else {
        e.classList.add("clicked")
    }

}


// Function to detect mobile devices
function isMobile() {
    return /Mobi|Android/i.test(navigator.userAgent) || (window.innerWidth <= 800 && window.innerHeight <= 800);
}

if (!(isMobile())) {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'assets/js/keyboard.js';
    script.defer = true;
    script.type = "module";
    document.head.appendChild(script);
}

// smooth scrolll
const lenis = new Lenis()

lenis.on('scroll', (e) => {
    // console.log(e)
})

function raf(time) {
    lenis.raf(time)
    requestAnimationFrame(raf)
}
requestAnimationFrame(raf)

function rotateNumbers(e) {
    numbers = $(e).find(".numbers")[0]
    numbers.classList.add("numberRotate")
}
function stopRotateNumbers(e) {
    numbers = $(e).find(".numbers")[0]
    numbers.classList.remove("numberRotate");
}

// navbar circles and lines

circle1 = document.getElementById("circle1")
circle2 = document.getElementById("circle2")
navByte = document.getElementById("navByte")
line1 = document.getElementById("line1")
line2 = document.getElementById("line2")
bigNav = document.getElementById("bigNav")
span1 = document.getElementById("span1")
span2 = document.getElementById("span2")
span3 = document.getElementById("span3")
span4 = document.getElementById("span4")
var n = 0

function rotateBack() {
    circle1.classList.remove("rotateStop")
    circle2.classList.remove("rotateStop")
}
function rotateStop() {
    circle1.classList.add("rotateStop")
    circle2.classList.add("rotateStop")
}
function navMenuClick() {
    if (n == 0) {
        line1.classList.add("line1Click")
        line2.classList.add("line2Click")
        circle1.classList.add("circleBigNav")
        circle2.classList.add("circleBigNav")
        bigNav.classList.add("bigNavAppear")
        span1.style.animationPlayState = "running"
        span2.style.animationPlayState = "running"
        span3.style.animationPlayState = "running"
        span4.style.animationPlayState = "running"
        navByte.style.color = "whitesmoke"

        n = 1
    } else {
        line1.classList.remove("line1Click")
        line2.classList.remove("line2Click")
        circle1.classList.remove("circleBigNav")
        circle2.classList.remove("circleBigNav")
        bigNav.classList.remove("bigNavAppear")
        navByte.style.color = "black"

        n = 0
    }
}

// login process ------------

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

document.getElementById("form").addEventListener("submit", function (e) {
    e.preventDefault();

    const email = document.querySelector(".email").value + document.querySelector(".emailPlaceholder").textContent;
    const pwd = document.getElementById("pwd").value;

    firebase.auth().signInWithEmailAndPassword(email, pwd)
        .then((userCredential) => {
            const user = userCredential.user;
            const uid = user.uid;

            return firebase.database().ref('members').orderByChild('email').equalTo(email).once('value');
        })
        .then(snapshot => {
            if (snapshot.exists()) {
                const userData = Object.values(snapshot.val())[0]; // get first matched user
                const fullName = `${userData.fname} ${userData.lname}`;
                alert(`Successfully logged in, ${fullName}!`);
                firebase.auth().currentUser.getIdTokenResult()
                    .then((idTokenResult) => {
                        if (idTokenResult.claims.admin) {
                            window.location.href = "/tasks/admindashboard.html";
                        } else {
                            window.location.href = "/tasks/dashboard.html";
                        }
                    })
                    .catch((error) => {
                        console.error("Error checking admin claim:", error);
                        window.location.href = "/tasks/dashboard.html"; // fallback
                    });
            } else {
                alert("Logged in, but user data not found!");
            }
        })
        .catch(error => {
            if (error.code === "auth/internal-error") {
                if (confirm("Invalid credentials. Do you want to reset your password?")) {
                    firebase.auth().sendPasswordResetEmail(email)
                        .then(() => {
                            alert("Password reset email sent! Check your inbox.");
                        })
                        .catch(err => {
                            console.error(err);
                            alert("Failed to send password reset email: " + err.message);
                        });
                }
            } else {
                console.error(error);
                alert("An unexpected error occurred: " + error.message);
            }
        });
});