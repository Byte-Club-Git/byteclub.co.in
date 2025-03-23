const link = document.getElementById("link")
var currentLink = window.location.href
currentLink = currentLink.slice((currentLink).indexOf("://") + 3)
link.innerHTML = currentLink

const input = document.getElementById("input")

const span1 = document.getElementById("1")
const span2 = document.getElementById("2")
const span3 = document.getElementById("3")
const span4 = document.getElementById("4")
const span5 = document.getElementById("5")
const span6 = document.getElementById("6")
const span7 = document.getElementById("7")
const span8 = document.getElementById("8")
const span9 = document.getElementById("9")
const span10 = document.getElementById("10")

setTimeout(() => {
    span1.style.display = "block"
    span2.style.display = "block"
}, 100);
setTimeout(() => {
    span3.style.display = "block"
}, 300);
setTimeout(() => {
    span4.style.display = "block"
}, 600);
setTimeout(() => {
    span5.style.display = "block"

    var i = 1;
    function loop() {
        setTimeout(function () {
            span5.innerHTML = "#".repeat(i) + ` <span class="progressNo">${i * 2}%</span>`
            console.log("#".repeat(i))
            i++;
            if (i <= 36) {
                loop();
            }
        }, 50)
    }
    loop();

}, 900);
setTimeout(() => {
    span6.style.display = "block"
}, 3000);
setTimeout(() => {
    span7.style.display = "block"
}, 3300);
setTimeout(() => {
    span8.style.display = "block"
}, 3600);
setTimeout(() => {
    span9.style.display = "block"
}, 3800);
setTimeout(() => {
    span10.style.display = "block"
    input.focus();
}, 4000);

input.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        if (input.value == "y" || input.value == "Y") {
            window.location.href = "/";
        }
    }
});