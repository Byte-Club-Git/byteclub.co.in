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

const svg = document.getElementById("svg")
const keyboard = document.getElementById("keyboard")
const byteHead1 = document.getElementById("byteHead1")
var canvasImg = document.getElementById("canvas3dImg")
var canvas = document.getElementById("canvas3d")

// Function to detect mobile devices
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

if (!(isMobile())) {
    const e = document.getElementsByClassName("keyboardMobileImg")
    const e2 = document.getElementsByClassName("keyboardMobileImg2")
    for (let i = 0; i < e.length; i++) {
        const element = e[i];
        element.remove()
    }
    for (let i = 0; i < e2.length; i++) {
        const element = e2[i];
        element.remove()
    }

    setTimeout(() => {

        let marginTopVal = canvas.style.marginTop
        let leftVal = canvas.style.left
        let webkitFilterVal = canvas.style.webkitFilter
        let transformVal = canvas.style.transform
        canvas.remove()

        var canvas3d = document.createElement('canvas');
        canvas3d.id = "canvas3d"
        canvas3d.height = "652"
        canvas3d.width = "1232"
        document.body.appendChild(canvas3d);
        canvas = document.getElementById("canvas3d")

        var keyboardJs = document.createElement('script');
        keyboardJs.src = 'assets/js/keyboard.js';
        keyboardJs.async = true;
        keyboardJs.type = "module";
        document.head.appendChild(keyboardJs);


        canvas.style.marginTop = marginTopVal
        canvas.style.left = leftVal
        canvas.style.webkitFilter = webkitFilterVal
        canvas.style.transform = transformVal
    }, 3000);

} else {
    var realScript = document.createElement('script');
    realScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/animejs/2.0.2/anime.min.js';
    document.head.appendChild(realScript);
    byteHead1.innerHTML = "Byte Club"

    realScript.onload = function () {
        anime({
            targets: '#byteAnime path',
            strokeDashoffset: [anime.setDashoffset, 0],
            easing: 'easeInOutSine',
            duration: 2000,
            delay: function (el, i) { return i * 0 },
            direction: 'alternafote',
            loop: false
        });
    };

}

document.addEventListener('DOMContentLoaded', function () {
    // scroll

    var script = document.createElement('script');
    script.src = "https://unpkg.com/lenis@1.1.2/dist/lenis.min.js";

    if (!(isMobile())) {
        document.head.appendChild(script);
    }

    script.onload = function () {
        const lenis = new Lenis()
        lenis.on('scroll', (e) => {
            // console.log(e)
        })
        function raf(time) {
            lenis.raf(time)
            requestAnimationFrame(raf)
        }
        requestAnimationFrame(raf)
    };

});

const cursor = document.getElementById("cursor");


function circleBig() {
    cursor.style.width = "30px"
    cursor.style.height = "30px"
    cursor.style.opacity = "0.75"
}
function circleSmall() {
    cursor.style.width = "15px"
    cursor.style.height = "15px"
    cursor.style.opacity = "1"
}

// tracker accuracy increase?

const animateCursor = (e) => {
    const x = e.clientX - cursor.offsetWidth / 2,
        y = e.clientY - cursor.offsetHeight / 2;

    const keyframes = {
        transform: `translate(${x}px, ${y}px)`
    }

    cursor.animate(keyframes, {
        duration: 1,
        fill: "forwards"
    });
}


window.onmousemove = e => {
    animateCursor(e);
    animateTrailer(e);
}

// tracker

const trailer = document.getElementById("trailer");

const animateTrailer = (e) => {
    const x = e.clientX - trailer.offsetWidth / 2,
        y = e.clientY - trailer.offsetHeight / 2;

    const keyframes = {
        transform: `translate(${x}px, ${y}px)`
    }

    trailer.animate(keyframes, {
        duration: 800,
        fill: "forwards"
    });
}

// hacker loader

const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
let interval = null;
loadByte = document.getElementById("loadByte")
let iteration = 0;
clearInterval(interval);

interval = setInterval(() => {
    loadByte.innerText = loadByte.innerText
        .split("")
        .map((letter, index) => {
            if (index < iteration) {
                return loadByte.dataset.value[index];
            }

            return letters[Math.floor(Math.random() * 26)]
        })
        .join("");

    if (iteration >= loadByte.dataset.value.length) {
        clearInterval(interval);
    }

    iteration += 1 / 40;
}, 10);

// loader
loadByte = document.getElementById("loadByte")
container1 = document.getElementById("container1")
container2 = document.getElementById("container2")
body = document.body
loader = document.getElementById("loader")
byteSpans = document.getElementsByClassName("byteSpan")
container2.classList.add("containerLoad")
mobileByte.classList.add("mobileByte")

var n

if (!(sessionStorage.getItem('hasVisited'))) {

    if ((isMobile())) {
        n = 2000
    } else {
        n = 1000
    }
} else {
    loader.style.display = "none"
    n = 0
}
const footer = document.getElementById("footer")
setTimeout(
    function () {
        container2.classList.remove("containerLoad")
        loadByte.classList.add("byteAdd")
        loader.classList.add("loaderAdd")
        footer.style.display = "flex"
        mobileByte.style.opacity = "0"
        for (let i = 0; i < byteSpans.length; i++) {
            const e = byteSpans[i];
            e.classList.add("byteSpanAdd")

        }
        sessionStorage.setItem('hasVisited', 'true');
    }, n);

setTimeout(
    function () {
        loader.style.display = "none"
    }, (n + 2000));

// ---------------------------------------------------

var keys = ""


function yourFunction() {
    if (keys.slice(-1) == "") {
        keys = ""
    }
    keys += ""
    setTimeout(yourFunction, 2000);
}
yourFunction();
const keyClick = new Audio("assets/audios/keyPress.mp3");
const radarPing = new Audio("radarPing.mp3");

let speedX = 2;
let speedY = 2;
let posX = 0;
let posY = 0;
function moveDVD() {
    const dvd = document.getElementById("dvd");
    dvd.style.display = "inline-block"
    const dvdWidth = dvd.offsetWidth;
    const dvdHeight = dvd.offsetHeight;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    posX += speedX;
    posY += speedY;

    if (posX + dvdWidth >= windowWidth || posX <= 0) {
        speedX *= -1;
    }

    if (posY + dvdHeight >= windowHeight || posY <= 0) {
        speedY *= -1;
    }

    dvd.style.left = posX + "px";
    dvd.style.top = posY + "px";

    requestAnimationFrame(moveDVD);
}

// ----------------      scroll      ---------------------------

bigByte2 = document.getElementById("bigByte2")
spanA = document.getElementById("spanA")
spanB = document.getElementById("spanB")
spanC = document.getElementById("spanC")
aboutSpan = document.getElementsByClassName("aboutSpan")
const letsChat = document.getElementsByClassName("letsChatLetter")

window.onscroll = function () {
    scroll = window.scrollY
    var height = 0
    if ((isMobile())) {
        height = window.innerHeight / 2
    } else {
        height = window.innerHeight
    }

    if (scroll <= height) {
        canvas.style.marginTop = scroll + 'px'
        canvas.style.left = 50 - 40 * (scroll / height) + '%'
        opacity = (0.9 - 0.4 * (scroll / height))
        canvas.style.webkitFilter = 'blur(' + 3 * (scroll / height) + 'px)'
        canvas.style.transform = 'translateX(' + (-50 + 50 * (scroll / height)) + '%)' + ' translateY(-50%) rotate(-7deg)';
        svg.style.right = "7vw"
        for (let i = 0; i < letsChat.length; i++) {
            const e = letsChat[i];
            e.classList.remove("letsChatAnimate")
        }
    } else {
        svg.style.right = 7 - ((scroll - height) * 2.5) / 25 + "vw"
        for (let i = 0; i < letsChat.length; i++) {
            const e = letsChat[i];
            e.classList.add("letsChatAnimate")
        }
    }

    if (600 < scroll) {
        spanA.style.animationPlayState = "running"
        spanB.style.animationPlayState = "running"
        spanC.style.animationPlayState = "running"

        for (let i = 0; i < aboutSpan.length; i++) {
            const e = aboutSpan[i];
            e.style.animationPlayState = "running"
        }
    }

}

// navbar lines rotate

function rotateNumbers(e) {
    let numbers = e.querySelector(".numbers"); // Vanilla JS
    numbers.classList.add("numberRotate")
}

function stopRotateNumbers(e) {
    let numbers = e.querySelector(".numbers"); // Vanilla JS
    numbers.classList.remove("numberRotate");
}



// navbar circles and lines

highlights = document.getElementById("highlights")
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
        svg.classList.add("svgClick")
        circle1.classList.add("circleBigNav")
        circle2.classList.add("circleBigNav")
        bigNav.classList.add("bigNavAppear")
        span1.style.animationPlayState = "running"
        span2.style.animationPlayState = "running"
        span3.style.animationPlayState = "running"
        span4.style.animationPlayState = "running"
        navByte.style.color = "whitesmoke"
        highlights.style.opacity = "0"

        n = 1
    } else {
        line1.classList.remove("line1Click")
        line2.classList.remove("line2Click")
        svg.classList.remove("svgClick")
        circle1.classList.remove("circleBigNav")
        circle2.classList.remove("circleBigNav")
        bigNav.classList.remove("bigNavAppear")
        navByte.style.color = "black"
        highlights.style.opacity = "1"
        n = 0
    }
}
