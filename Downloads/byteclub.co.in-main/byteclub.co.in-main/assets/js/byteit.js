const sponsors = document.getElementById("sponsors")
const alumni = document.getElementById("alumni")
const dcb = document.getElementById("dcb")
const unstop = document.getElementById("unstop")
const xyz = document.getElementById("xyz")
const sponsorsHeading = document.getElementById("sponsorsHeading")
const sponsorsList = document.getElementsByClassName("sponsor")


const height = window.innerHeight
const width = sponsors.offsetWidth
const alumniWidth = (47 / width) * 100
const dcbWidth = (110 / width) * 100
const unstopWidth = (112 / width) * 100
const xyzWidth = (106 / width) * 100



// onscroll
window.onscroll = function () {
    console.log(height)

    if (alumniWidth == 0 || dcbWidth == 0 || unstopWidth == 0 || xyzWidth == 0) {
        location.reload();
    }

    scroll = window.scrollY

    // 1010


    // big div
    sponsors.style.width = 85 + 15 * (scroll / height) + '%'
    sponsors.style.top = 22.5 + 77.5 * (scroll / height) + '%'
    sponsors.style.height = 14 + 86 * (scroll / height) + 'vh'
    sponsors.style.paddingRight = 0 + 7 * (scroll / height) + 'vh'


    // sponsors sorting by money

    if (scroll < 15) {

        for (let i = 0; i < sponsorsList.length; i++) {
            const e = sponsorsList[i];
            e.style.height = "40px"
        }

        alumni.style.width = 'auto';
        alumni.style.height = '40px';
        alumni.style.margin = '0 0';

        dcb.style.width = 'auto';
        dcb.style.height = '40px';
        dcb.style.margin = '0 0';

        unstop.style.width = 'auto';
        unstop.style.height = '40px';
        unstop.style.margin = '0 0';

        xyz.style.width = 'auto';
        xyz.style.height = '40px';
        xyz.style.margin = '0 0';
    } else {

        sponsorsHeading.style.top = -5 + 108.5 * (scroll / height) + "%"
        sponsorsHeading.style.marginTop = 0 + 7 * (scroll / height) + "vh"
        sponsorsHeading.style.transform = "translateY(" + (-50 + 50 * (scroll / height)) + "%) translateX(" + (0 - 50 * (scroll / height)) + "%)"
        sponsorsHeading.style.left = 7 + 43 * (scroll / height) + "%"

        for (let i = 0; i < sponsorsList.length; i++) {
            const e = sponsorsList[i];
            e.style.height = + 40 + 20 * (scroll / height) + "px"
        }

        alumni.style.height = 'auto';
        alumni.style.width = alumniWidth + (19 - alumniWidth) * (scroll / height) + '%';
        alumni.style.margin = '0 ' + 0 + 2.5 * (scroll / height) + '%'
        alumni.style.filter = 'grayscale(' + (100 - 100 * (scroll / height)) + '%)'

        dcb.style.height = 'auto';
        dcb.style.width = dcbWidth + (19 - dcbWidth) * (scroll / height) + '%';
        dcb.style.margin = '0 ' + 0 + 2.5 * (scroll / height) + '%'
        dcb.style.filter = 'grayscale(' + (100 - 100 * (scroll / height)) + '%)'

        unstop.style.height = 'auto';
        unstop.style.width = unstopWidth + (19 - unstopWidth) * (scroll / height) + '%';
        unstop.style.margin = '0 ' + 0 + 2.5 * (scroll / height) + '%'
        unstop.style.filter = 'grayscale(' + (100 - 100 * (scroll / height)) + '%)'

        xyz.style.height = 'auto';
        xyz.style.width = xyzWidth + (19 - xyzWidth) * (scroll / height) + '%';
        xyz.style.margin = '0 ' + 0 + 2.5 * (scroll / height) + '%'
        xyz.style.filter = 'grayscale(' + (100 - 100 * (scroll / height)) + '%)'
    }






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