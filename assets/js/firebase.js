const firebaseConfig = {
    apiKey: "AIzaSyCGGDaoB9LpfbPcgoIHL7NwECUUMp-iEwU",
    authDomain: "byte-club-provisionary-members.firebaseapp.com",
    projectId: "byte-club-provisionary-members",
    storageBucket: "byte-club-provisionary-members.appspot.com",
    messagingSenderId: "502131482784",
    appId: "1:502131482784:web:fc014f0bfa0dc8a61fe9c5",
    measurementId: "G-ZJLG4D3R05",
    databaseURL: "https://byte-club-provisionary-members-default-rtdb.asia-southeast1.firebasedatabase.app/"
};


firebase.initializeApp(firebaseConfig);
const database = firebase.database();


document.getElementById("form").addEventListener("submit", function (e) {
    e.preventDefault();

    const fname = document.getElementById("fname").value;
    const lname = document.getElementById("lname").value;
    const email = document.querySelector(".email").value + document.querySelector(".emailPlaceholder").textContent;
    const discordID = (document.getElementById("discordID").value).toLowerCase();
    const classVal = document.getElementById("class").value;
    const section = document.getElementById("section").value;
    const date = new Date();
    const skills = Array.from(document.querySelectorAll('.skill.clicked')).map(skill => skill.textContent);
    const points = 0;

    // Check if the email already exists in the database
    const membersRef = firebase.database().ref('members');
    membersRef.orderByChild('email').equalTo(email).once('value', snapshot => {
        if (snapshot.exists()) {
            alert("This email is already registered.");
        } else {
            // If email doesn't exist, proceed with adding the data
            firebase.database().ref('members/').push({
                fname: fname,
                lname: lname,
                email: email,
                discordID: discordID,
                class: classVal,
                section: section,
                skills: skills,
                points: points
            }).then(() => {
                const payload = {
                    content: `${date} \n**${fname + " " + lname}**: ${discordID}`
                };
                // Send the message to the Discord webhook
                fetch("https://l.webhook.party/hook/7O04Veyj%2BtIv6A4BZkuND5g8Qi2Yf211dZz41wEdG4m9etQiwlscaothBrX1nWR5MQpws2Fo5uQbge55y96XrNOoWWIxYQuAuJ3dZ7138qOFp793333ZN1JpY2cVoGMe4tRkk0P2wQTDiyUdTvbUOBRA%2Bdk3fOfbVbm0xlYbeSftYmQSx3GBpY%2FX1S%2FNl%2BJpPJeaXk4AAYPjgeMDU1sy%2BKF5sLCu80b%2B0arN4%2FIKRtd8f%2BrQoFDMvINKJ7ytONtDOPwwndKN2QdsOPHkDk0uUAtU%2BTPnC9O0nktJzmnaT%2Fj5rxvR9RCUvM3QoGVA%2Fi3V463%2Biii5%2FtrYRZiS5qnkklKk%2BtVZ2mOaNHanuuSiN%2FPGzcB%2B03VITxJSWCSh3MATogDI0voKjfc%3D/DusFgkYYNaEvVfAb", {
                    method: 'POST',
                    body: JSON.stringify(payload),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                    .then(response => {

                        if (response.ok) {
                            document.getElementById('myForm').reset();
                        } else {
                            console.log('Failed to send message.');
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        console.log('An error occurred while sending the message.');
                    });
                alert("Registered Sucessfully! \nNow redirecting you to the Discord server!");
                window.location.href = "https://discord.com/invite/Cr2j38SQM7";

            }).catch(error => {
                console.error("Error saving data:", error);
            });
        }
    });
});