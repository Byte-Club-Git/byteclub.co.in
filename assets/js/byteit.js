const sponsors = document.getElementById("sponsors")
const alumni = document.getElementById("alumni")
const jamboree = document.getElementById("jamboree")
const kurious = document.getElementById("kurious")
const vns = document.getElementById("vns")
const sponsorsHeading = document.getElementById("sponsorsHeading")
const sponsorsList = document.getElementsByClassName("sponsor")


const height = window.innerHeight
const width = sponsors.offsetWidth
const alumniWidth = (47 / width) * 100
const jamboreeWidth = (177 / width) * 100
const kuriousWidth = (112 / width) * 100
const vnsWidth = (106 / width) * 100



// onscroll
window.onscroll = function () {
    console.log(height)

    if (alumniWidth == 0 || jamboreeWidth == 0 || kuriousWidth == 0 || vnsWidth == 0) {
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

        jamboree.style.width = 'auto';
        jamboree.style.height = '40px';
        jamboree.style.margin = '0 0';

        kurious.style.width = 'auto';
        kurious.style.height = '40px';
        kurious.style.margin = '0 0';

        vns.style.width = 'auto';
        vns.style.height = '40px';
        vns.style.margin = '0 0';
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

        jamboree.style.height = 'auto';
        jamboree.style.width = jamboreeWidth + (19 - jamboreeWidth) * (scroll / height) + '%';
        jamboree.style.margin = '0 ' + 0 + 2.5 * (scroll / height) + '%'
        jamboree.style.filter = 'grayscale(' + (100 - 100 * (scroll / height)) + '%)'

        kurious.style.height = 'auto';
        kurious.style.width = kuriousWidth + (19 - kuriousWidth) * (scroll / height) + '%';
        kurious.style.margin = '0 ' + 0 + 2.5 * (scroll / height) + '%'
        kurious.style.filter = 'grayscale(' + (100 - 100 * (scroll / height)) + '%)'

        vns.style.height = 'auto';
        vns.style.width = vnsWidth + (19 - vnsWidth) * (scroll / height) + '%';
        vns.style.margin = '0 ' + 0 + 2.5 * (scroll / height) + '%'
        vns.style.filter = 'grayscale(' + (100 - 100 * (scroll / height)) + '%)'
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
