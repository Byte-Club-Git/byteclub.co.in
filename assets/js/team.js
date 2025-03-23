
// Function to detect mobile devices
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

const keyboard = document.getElementById("keyboard")
const container1 = document.getElementById("container")
container1.style.maxHeight = window.innerHeight + "px";

var canvas = document.getElementById("canvas3d")

if (!(isMobile())) {
    setTimeout(() => {

        canvas.remove()

        var canvas3d = document.createElement('canvas');
        canvas3d.id = "canvas3d"
        canvas3d.height = "652"
        canvas3d.width = "1232"
        keyboard.appendChild(canvas3d);
        canvas = document.getElementById("canvas3d")

        var script = document.createElement('script');
        script.src = 'assets/js/keyboard.js';
        script.defer = true;
        script.type = "module";
        document.head.appendChild(script);
    }, 3000);

} else {
    const leftDiv = document.getElementById("leftDiv")
    keyboard.remove()
    leftDiv.remove()
}

const pfp = document.getElementsByClassName("pfp")

for (let i = 0; i < pfp.length; i++) {
    const e = pfp[i];
    e.style.background = "url(https://gravatar.com/avatar/" + getGravatarHash(e.dataset.value) + "?s=600)  no-repeat center"
}
// gravatar

function getGravatarHash(email) {
    const lowerCaseEmail = email.trim().toLowerCase();
    // Get the SHA-256 hash using CryptoJS
    const hash = CryptoJS.SHA256(lowerCaseEmail);
    // Convert the hash to a hexadecimal string
    const hashHex = hash.toString(CryptoJS.enc.Hex);
    return hashHex;
}
// --------------------

memberCards = document.getElementById("memberCards")
alumnis = document.getElementById("alumni")
memberOpt = document.getElementById("memberOpt")
alumOpt = document.getElementById("alumOpt")

var n = 1

function alumni() {
    alumnis.style.display = "flex"
    memberCards.style.display = "none"
    memberOpt.classList.remove("current")
    alumOpt.classList.add("current")
}

function member() {
    alumnis.style.display = "none"
    memberCards.style.display = "flex"
    memberOpt.classList.add("current")
    alumOpt.classList.remove("current")
}


// scroll-----------------------------

let lastScrollTop = 0

const scrollableDiv = document.getElementById('cardsContainer');
function handleWheelEvent(event) {
    // Determine scroll direction
    let direction;

    cards = document.getElementsByClassName("card")
    names = document.getElementsByClassName("name")
    pfps = document.getElementsByClassName("pfp")
    posts = document.getElementsByClassName("post")

    if (!(isMobile())) {
        direction = Math.sign(event.deltaY);
        scrollableDiv.scrollLeft += event.deltaY * 0.8;
    } else {
        scrolledAmount = scrollableDiv.scrollTop

        if (scrolledAmount > lastScrollTop) {
            direction = 1;
        } else {
            direction = -1;
        }

        lastScrollTop = scrolledAmount

        if (lastScrollTop < 0) {
            lastScrollTop = 0
        }

    }

    if (direction > 0) {
        scrollableDiv.classList.add("cardsContainerAdd")

        line1.style.background = "whitesmoke"
        line2.style.background = "whitesmoke"
        circle1.classList.add("circleBigNav")
        circle2.classList.add("circleBigNav")

        for (let i = 0; i < cards.length; i++) {
            const e = cards[i];
            e.classList.add("cardAdd")
        }

        for (let i = 0; i < pfps.length; i++) {
            const e = pfps[i];
            e.classList.add("pfpAdd")
        }

        for (let i = 0; i < names.length; i++) {
            const e = names[i];
            e.classList.add("nameAdd")
        }

        for (let i = 0; i < posts.length; i++) {
            const e = posts[i];
            e.classList.add("postAdd")
        }
    } else if ((direction < 0) && (scrollableDiv.scrollLeft <= 800)) {

        if (isMobile() && scrolledAmount > 400) {
            return;
        }

        scrollableDiv.classList.remove("cardsContainerAdd")

        if (!(bigNav.classList.contains("bigNavAppear"))) {
            line1.style.background = "black"
            line2.style.background = "black"
            circle1.classList.remove("circleBigNav")
            circle2.classList.remove("circleBigNav")

        }

        for (let i = 0; i < cards.length; i++) {
            const e = cards[i];
            e.classList.remove("cardAdd")
        }

        for (let i = 0; i < pfps.length; i++) {
            const e = pfps[i];
            e.classList.remove("pfpAdd")
        }

        for (let i = 0; i < names.length; i++) {
            const e = names[i];
            e.classList.remove("nameAdd")
        }

        for (let i = 0; i < posts.length; i++) {
            const e = posts[i];
            e.classList.remove("postAdd")
        }
    }
}

// Listen for wheel events (scroll attempts)
window.addEventListener('wheel', handleWheelEvent);

// Listen for touch events (scroll attempts on touch devices)
window.addEventListener('touchmove', handleWheelEvent);
window.addEventListener('touchstart', handleWheelEvent);





// -------------------------------------------------------

// ------------------------



function rotateNumbers(e) {
    let numbers = e.querySelector(".numbers");
    numbers.classList.add("numberRotate")
}

function stopRotateNumbers(e) {
    let numbers = e.querySelector(".numbers");
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


//  -----------------------