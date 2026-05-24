// Function to detect mobile devices
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}
isAnimationEnabled = false;

const keyboard = document.getElementById("keyboard")
const container1 = document.getElementById("container")
container1.style.maxHeight = window.innerHeight + "px";

removeHover();

var canvas = document.getElementById("canvas3d")
if (!(isMobile())) {
document.querySelectorAll('.hoverme2').forEach(item => {
    const pfp = item.querySelector('.pfp');
    const name = item.querySelector('.name');
    const post = item.querySelector('.post');
    const sociallinks = item.querySelector('.social-links');
    let hoverTimeout; // to store the timeout reference

    item.addEventListener('mouseenter', () => {
      if (!isAnimationEnabled) return;
  
      // Set a timeout to trigger animations after 0.5s
      hoverTimeout = setTimeout(() => {
        clearTimeout(invisibleTimeout);
        sociallinks.style.visibility = 'visible';
        sociallinks.style.position = 'static'; // Ensure position is applied

        pfp.style.animation = 'goup .5s ease forwards';
        pfp.style.animationDelay = '0s';
        name.style.animation = 'goup .5s ease forwards';
        name.style.animationDelay = '0s';
        post.style.animation = 'goup .5s ease forwards';
        post.style.animationDelay = '0s';
        sociallinks.style.animation = 'links .5s forwards ease-in-out';
        sociallinks.style.animationDelay = '0s';
      }, 250);
    });
  
    item.addEventListener('mouseleave', () => {
    //  if (!isAnimationEnabled) return;
  
      clearTimeout(hoverTimeout); // cancel if mouse leaves early
  
      setTimeout(() => {
  //      sociallinks.style.display = 'none';
        pfp.style.animation = 'godown .5s ease forwards';
        name.style.animation = 'godown .5s ease forwards';
        post.style.animation = 'godown .5s ease forwards';
        sociallinks.style.animation = 'linksout .25s forwards ease-in-out';
        
        invisibleTimeout = setTimeout(() => {
            sociallinks.style.visibility = 'hidden';
            sociallinks.style.height = '0px';
      //  sociallinks.style.height = '0px'; // Reset position to absolute
        }
        , 250);
      }, 200);
    });
  });
}
  


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


document.querySelectorAll('.social-links').forEach(card => {
    const website = card.dataset.website;
    const github = card.dataset.github;
    const linkedin = card.dataset.linkedin;
    const special = card.dataset.special;
  if(!special){
    let iconsHTML = '';
  
    if (github) {
      iconsHTML += `
        <a href="${github}" target="_blank" class="social-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
            <path d="M9 18c-4.51 2-5-2-7-2"></path>
          </svg>  
        </a>
      `;
    }
  
    if (linkedin) {
      iconsHTML += `
        <a href="${linkedin}" target="_blank" class="social-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
            <rect width="4" height="12" x="2" y="9"></rect>
            <circle cx="4" cy="4" r="2"></circle>
          </svg>
        </a>
      `;
    }
  
    if (website) {
      iconsHTML += `
        <a href="${website}" target="_blank" class="social-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path>
            <path d="M2 12h20"></path>
          </svg>
        </a>
      `;
    }
  
    card.querySelector('.social-icons').innerHTML = iconsHTML;
}
  });
  


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
        addHover();
        navByte.classList.remove("invisible")
        scrollableDiv.classList.add("cardsContainerAdd")
        isAnimationEnabled = true
        navByte.classList.add("invisible")
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
            navByte.classList.remove("invisible")
            if(!isMobile()){
            removeHover();
            
        }}

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
        console.log("blackie")

        n = 0
    }
}


//  -----------------------
function removeHover(){
  document.querySelectorAll('.hoverme2').forEach(card => {
    //  sociallinks.style.animation = 'linksout .5s forwards ease-in-out';
    //      card.classList.remove('hoverme');
      card.style.marginTop = "15px"
      isAnimationEnabled = false
     
  
  })
}

function addHover(){
  document.querySelectorAll('.hoverme2').forEach(card => {
    if(!isMobile()){
    card.classList.add('hoverme');
    console.log("added")
    isAnimationEnabled = false
    card.style.marginTop = "30px"
}
})
}
