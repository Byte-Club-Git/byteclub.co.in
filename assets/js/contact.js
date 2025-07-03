
// Function to detect mobile devices
function isMobile() {
    return /Mobi|Android/i.test(navigator.userAgent) || (window.innerWidth <= 800 && window.innerHeight <= 800);
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

const fullName = document.getElementById("input");
const email = document.getElementById("email");
const msg = document.getElementById("formTextarea");
const form = document.getElementById("form");

function sendEmail() {

    const dataURL = canvas.toDataURL("image/png"); // base64 image
    const bodyMsg = `<b><h4>Name</h3></b> ${fullName.value} <br> <b><h4>Email</h3></b> ${email.value} <br> <b><h4>Message</h4></b> ${msg.value}`;

    Email.send({
        SecureToken: '64186b92-3ea1-473f-8e1b-0d3fe443d519',
        To: 'byteclub@pp.balbharati.org',
        From: "byteclub@pp.balbharati.org",
        Subject: `${fullName.value} would like to contact you`,
        Body: bodyMsg,
        Attachments: [
            {
                name: "drawing.png",
                data: dataURL
            }
        ]
    }).then(
        message => {
            alert(`${fullName.value} your message was sent successfully!`)
            form.reset()
        }
    ).catch(
        error => console.log(error)
    )
}

form.addEventListener("submit", (e) => {
    e.preventDefault();
    sendEmail()
})

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


// painting ----------
const canvas = document.getElementById("drawCanvas");
const container = document.getElementById("canvasContainer");

// Set internal canvas size to match container size
canvas.width = container.clientWidth;
canvas.height = container.clientHeight;

const ctx = canvas.getContext("2d");
let drawing = false;

const grad = ctx.createLinearGradient(0, 0, canvas.width, 0);
grad.addColorStop(0.0, '#FEE140');
grad.addColorStop(0.5, '#FA709A');
grad.addColorStop(1.0, '#FEC163');

ctx.strokeStyle = grad;
ctx.lineWidth = 5;
ctx.lineCap = 'round';
ctx.lineJoin = 'round';
ctx.shadowColor = "#FF5F6D";
ctx.shadowBlur = 8;

let isDrawing = false;
let lastX = 0;
let lastY = 0;

canvas.addEventListener("mousedown", (e) => {
    isDrawing = true;
    [lastX, lastY] = [e.offsetX, e.offsetY];
});

canvas.addEventListener('mouseleave', () => {
    isDrawing = false;
});

canvas.addEventListener("mouseup", () => {
    isDrawing = false;
    ctx.beginPath();
});
canvas.addEventListener("mouseout", () => drawing = false);

canvas.addEventListener("mousemove", (e) => {
    if (!isDrawing) return;

    const x = e.offsetX;
    const y = e.offsetY;

    const dx = x - lastX;
    const dy = y - lastY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const steps = Math.ceil(distance / 2); // Smoothness vs performance
    for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        const ix = lastX + dx * t;
        const iy = lastY + dy * t;

        ctx.beginPath();
        ctx.moveTo(lastX + dx * ((i - 1) / steps), lastY + dy * ((i - 1) / steps));
        ctx.lineTo(ix, iy);
        ctx.stroke();
    }

    [lastX, lastY] = [x, y]; // ✅ Only update once after drawing
});


window.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('input');
    const span = document.getElementById('text-measurer');

    function resizeInput(withBuffer = true) {
        if (!(withBuffer) && (input.value == '')) {
            input.value = "Your Name"
            span.textContent
        }
        span.textContent = input.value || ' ';
        const width = span.offsetWidth;
        input.style.width = (width + (withBuffer ? 16 : 0)) + 'px'; // 1px buffer if desired
    }

    function removeDefault() {
        if (input.value === "Your Name") {
            input.value = '';
            resizeInput(true);
        }
    }

    document.fonts.ready.then(() => resizeInput(false));
    input.addEventListener('input', () => resizeInput(true));
    input.addEventListener('focus', () => resizeInput(true));
    input.addEventListener('blur', () => resizeInput(false));
    input.addEventListener('click', () => removeDefault());
});

function socialFlyHover(e) {
    let socialFly = e.querySelector(".socialFly");
    socialFly.style.transition = "all 500ms cubic-bezier(.42,-0.59,0,1.04)"
    socialFly.style.transform = "rotate(225deg) translateY(100px)"
    setTimeout(() => {
        socialFly.style.transition = "all 0ms cubic-bezier(.42,-0.59,0,1.04)"
        socialFly.style.transform = "rotate(225deg) translateY(-100px)"
    }, 500);
    setTimeout(() => {
        socialFly.style.transition = "all 500ms cubic-bezier(.42,-0.59,0,1.04)"
        socialFly.style.transform = "rotate(225deg)"
    }, 550);
}

const letsChat = document.getElementsByClassName("letsChatLetter")

window.onscroll = function () {

    scroll = window.scrollY
    var height = 0
    if ((isMobile())) {
        height = window.innerHeight / 2
    } else {
        height = window.innerHeight
    }
    if (scroll <= 100) {
        for (let i = 0; i < letsChat.length; i++) {
            const e = letsChat[i];
            e.classList.remove("letsChatAnimate")
        }
    } else {
        for (let i = 0; i < letsChat.length; i++) {
            const e = letsChat[i];
            e.classList.add("letsChatAnimate")
        }
    }
}

const welcomeMsgspans = document.querySelectorAll('.welcomeMsg > div > span');
welcomeMsgspans.forEach((span, index) => {
    const delay = (index * 0.005 + 3).toFixed(2);
    span.style.animation = `email 0.25s forwards cubic-bezier(0.175, 0.885, 0.32, 1.275) ${delay}s`;
});

const welcomeMsgAspans = document.querySelectorAll('.welcomeMsg > div > a > span');
welcomeMsgAspans.forEach((span, index) => {
    const delay = (index * 0.005 + 3.18).toFixed(2);
    span.style.animation = `email 0.25s forwards cubic-bezier(0.175, 0.885, 0.32, 1.275) ${delay}s`;
});

const quotespans = document.querySelectorAll('.quote > span');
quotespans.forEach((span, index) => {
    const delay = (index * 0.005 + 3).toFixed(2);
    span.style.animation = `email 0.25s forwards cubic-bezier(0.175, 0.885, 0.32, 1.275) ${delay}s`;
});

const namespans = document.querySelectorAll('.name > span');
namespans.forEach((span, index) => {
    const delay = (index * 0.015 + 3.31).toFixed(2);
    span.style.animation = `email 0.25s forwards cubic-bezier(0.175, 0.885, 0.32, 1.275) ${delay}s`;
});

const main = document.getElementById("main")
const footer = document.getElementById("footer")


setTimeout(function () {
    main.style.overflow = "visible"
    footer.style.display = "flex"
}, 2000);