
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

// register process -----------

const defaultPassword = "byteClubMember123";
const defaultPassword2 = "ByteClub2025";

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

function trySignInWithMultiplePasswords(email) {
    return firebase.auth().signInWithEmailAndPassword(email, defaultPassword)
        .catch(() => {
            console.log("First password failed, trying second password...");
            return firebase.auth().signInWithEmailAndPassword(email, defaultPassword2);
        });
}

document.getElementById("form").addEventListener("submit", function (e) {
    e.preventDefault();

    const submitBtn = document.getElementById("submitBtn");

    const fname = document.getElementById("fname").value;
    const lname = document.getElementById("lname").value;
    const email = document.querySelector(".email").value + document.querySelector(".emailPlaceholder").textContent;
    const discordID = document.getElementById("discordID").value.toLowerCase();
    const classVal = document.getElementById("class").value;
    const section = document.getElementById("section").value;
    const date = new Date();
    const skills = Array.from(document.querySelectorAll('.skill.clicked')).map(skill => skill.textContent);
    const points = 0;

    const payloadContent = `**${fname} ${lname}**: ${discordID}`;
    const webhookURL = "https://l.webhook.party/hook/7O04Veyj%2BtIv6A4BZkuND5g8Qi2Yf211dZz41wEdG4m9etQiwlscaothBrX1nWR5MQpws2Fo5uQbge55y96XrNOoWWIxYQuAuJ3dZ7138qOFp793333ZN1JpY2cVoGMe4tRkk0P2wQTDiyUdTvbUOBRA%2Bdk3fOfbVbm0xlYbeSftYmQSx3GBpY%2FX1S%2FNl%2BJpPJeaXk4AAYPjgeMDU1sy%2BKF5sLCu80b%2B0arN4%2FIKRtd8f%2BrQoFDMvINKJ7ytONtDOPwwndKN2QdsOPHkDk0uUAtU%2BTPnC9O0nktJzmnaT%2Fj5rxvR9RCUvM3QoGVA%2Fi3V463%2Biii5%2FtrYRZiS5qnkklKk%2BtVZ2mOaNHanuuSiN%2FPGzcB%2B03VITxJSWCSh3MATogDI0voKjfc%3D/DusFgkYYNaEvVfAb";

    // First, check if email already exists in DB
    const membersRef = database.ref('members');
    trySignInWithMultiplePasswords(email)
        .then(() => {
            // Now user is authenticated, safe to access database
            const membersRef = database.ref('members');
            membersRef.orderByChild('email').equalTo(email).once('value', snapshot => {
                if (snapshot.exists()) {
                    // ✅ UPDATE the existing entry
                    const key = Object.keys(snapshot.val())[0];
                    membersRef.child(key).update({
                        fname,
                        lname,
                        discordID,
                        class: classVal,
                        section,
                        skills,
                        points
                    }).then(() => {
                        sendWebhookAndRedirect(`${date}\n${payloadContent}\n(Updated existing member)`, `Updated the entry of ${email} successfully!`);
                    });
                } else {
                    // ❌ Email doesn't exist, create Firebase Auth user + DB entry
                    firebase.auth().createUserWithEmailAndPassword(email, defaultPassword)
                        .then(() => {
                            return membersRef.push({
                                fname,
                                lname,
                                email,
                                discordID,
                                class: classVal,
                                section,
                                skills,
                                points
                            });
                        })
                        .then(() => {
                            sendWebhookAndRedirect(`${date}\n${payloadContent}`, `Registered successfully!`);
                        })
                        .catch(error => {
                            console.error("Registration error:", error);
                            alert("Something went wrong during registration. Please try again.");
                        });
                }
            });
        })
        .catch((error) => {
            if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential' || error.code === 'auth/internal-error') {
                // User not found → proceed normally (create user + data)
                const membersRef = database.ref('members');
                firebase.auth().createUserWithEmailAndPassword(email, defaultPassword)
                    .then(() => {
                        return membersRef.push({
                            fname,
                            lname,
                            email,
                            discordID,
                            class: classVal,
                            section,
                            skills,
                            points
                        });
                    })
                    .then(() => {
                        sendWebhookAndRedirect(`${date}\n${payloadContent}`, `Registered successfully!`);
                    })
                    .catch(error => {
                        console.error("Registration error:", error);
                        alert("Password may have been reset. Try logging in at byteclub.co.in/joinlogin. If not, an unexpected error occurred.");
                    });
            } else {
                console.error("Auth error:", error);
                alert("Authentication error. Please try again.");
            }
        });

    function sendWebhookAndRedirect(content, alertMessage) {
        const payload = { content };
        fetch(webhookURL, {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(response => {
            if (response.ok) {
                document.getElementById("myForm").reset();
            } else {
                console.log("Failed to send webhook message.");
            }
        }).catch(err => {
            console.error("Webhook error:", err);
        });

        alert(alertMessage + "\nNow redirecting you to the Discord server!");
        window.location.href = "https://discord.com/invite/Cr2j38SQM7";
    }
});