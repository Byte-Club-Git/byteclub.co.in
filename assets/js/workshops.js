import { db } from './workshopfirebase.js';
import { collection, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";



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

  const selectedSkills = new Set();


function skillClicked(e) {

    if (e.classList.contains("clicked")) {
        e.classList.remove("clicked")
    } else {
        e.classList.add("clicked")
    }

}
  const form = document.querySelector("form");


  form.addEventListener("submit", async function (e) {
    e.preventDefault();
  const fname = document.getElementById("fname").value;
  const lname = document.getElementById("lname").value;
  const email = document.querySelector(".email").value + document.querySelector(".emailPlaceholder").textContent;
  const discordID = document.getElementById("discordID").value.toLowerCase();
  const classVal = document.getElementById("class").value;
  const section = document.getElementById("section").value;
  const date = new Date();
  const skills = Array.from(document.querySelectorAll('.skill.clicked')).map(skill => skill.textContent);
  const points = 0;

  try {
    const uniqueID = crypto.randomUUID(); // generate a unique ID
    await setDoc(doc(db, "users", uniqueID), {
      fname,
      lname,
      email,
      discordID,
      class: classVal,
      section,
      date: date.toISOString(),
      skills,
      points
    });
    console.log("Data successfully written with ID:", uniqueID);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
  });
   