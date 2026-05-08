// Team Data Structure
const teamMembers = [
  // Presidents
  
  { email: 'kapurpranav506@gmail.com', firstName: 'Pranav', lastName: 'Kapur', post: 'President', hasHover: true, social: { website: 'https://www.behance.net/pranavkapur2', linkedin: 'https://www.linkedin.com/in/pranav-kapur-8b2a3932a' } },
  { email: 'neilgandhi2009@gmail.com', firstName: 'Neil', lastName: 'Gandhi', post: 'President', hasHover: true, social: { website: 'https://www.behance.net/neilgandhi04', linkedin: 'https://www.linkedin.com/in/neilgandhi04/' } },
  // Vice Presidents
  { email: 'parinkhurana@gmail.com', firstName: 'Parin', lastName: 'Khurana', post: 'Vice President', hasHover: true, social: { special: 'yes' } },
  { email: 'Abhayanvika2@gmail.com', firstName: 'Abhay', lastName: 'Mangla', post: 'Vice President', hasHover: true, social: { linkedin: 'http://linkedin.com/in/abhay-mangla-457019312/', github: 'https://github.com/Dev-Abhay-ai' } },
  { email: 'ekanshgupta49@gmail.com', firstName: 'Ekansh', lastName: 'Gupta', post: 'Vice President', hasHover: true, social: { website: 'https://x.com/Ekansh707645621', linkedin: 'https://www.linkedin.com/in/ekansh-gupta-b49249312/', github: 'https://github.com/Ekansh-Coder5' } },
  
  // Club Ambassadors
  { email: 'tvishanangia@gmail.com', firstName: 'Tvisha', lastName: 'Nangia', post: 'Club Ambassador', hasHover: true, social: { linkedin: 'https://www.linkedin.com/in/tvisha-nangia-6b1b6a34a' } },
  { email: 'divakshv@gmail.com', firstName: 'Divaksh', lastName: 'Vir', post: 'Club Ambassador', hasHover: true, social: { linkedin: 'https://www.linkedin.com/in/divaksh-vir-176401365' } },
  { email: 'jaskirat.ob8@gmail.com', firstName: 'Jaskirat', lastName: 'Singh', post: 'Club Ambassador', hasHover: true, social: {} },
  
  // Members
  { email: 'rishikk1507@gmail.com', firstName: 'Rishik', lastName: 'Goyal', post: 'Member', hasHover: true, social: {} },
  { email: 'adhritgarg017@gmail.com', firstName: 'Adhrit', lastName: 'Garg', post: 'Member', hasHover: true, social: { website: 'adhritgarg.carrd.co', linkedin: 'https://www.linkedin.com/in/adhrit-garg-76a7a8291/', github: 'https://github.com/MrYoinkk' } },
  { email: 'ishaanhanda2010@gmail.com', firstName: 'Ishaan', lastName: 'Handa', post: 'Member', hasHover: true, social: { linkedin: 'https://www.linkedin.com/in/ishaan-handa-a18164363/', github: 'https://github.com/handaishaan10' } },
  { email: 'abhirajnarayan26@gmail.com', firstName: 'Abhiraj', lastName: 'Narayan', post: 'Member', hasHover: true, social: {} },
  { email: 'kabirdhingra001@gmail.com', firstName: 'Kabir', lastName: 'Dhingra', post: 'Member', hasHover: true, social: { linkedin: 'www.linkedin.com/in/kabir-dhingra-745704361', github: 'https://github.com/KabirDhingra' } },
  { email: 'anvisaluja24@gmail.com', firstName: 'Anvi', lastName: 'Saluja', post: 'Member', hasHover: true, social: {} },
  { email: 'shriyankalra26@gmail.com', firstName: 'Shriyan', lastName: 'Kalra', post: 'Member', hasHover: true, social: { github: 'http://github.com/botbean-pro' } },
  { email: 'banpreet.rekhi@gmail.com', firstName: 'Banpreet', lastName: 'Singh Rikhi', post: 'Member', hasHover: true, social: {} },
  { email: 'arora08viraj@gmail.com', firstName: 'Viraj', lastName: 'Arora', post: 'Member', hasHover: true, social: { linkedin: 'https://www.linkedin.com/in/viraj-arora/' } },
  
  // Junior Members
  { email: '@gmail.com', firstName: 'Inesh', lastName: 'Khosla', post: 'Junior Member', hasHover: true, social: {} },
  { email: 'raunakpahwa2010@gmail.com', firstName: 'Raunak', lastName: 'Pahwa', post: 'Junior Member', hasHover: true, social: { linkedin: 'https://www.linkedin.com/in/raunak-pahwa-059458260' } },
  { email: 'contact.kashika@gmail.com', firstName: 'Kashika', lastName: 'Arora', post: 'Junior Member', hasHover: true, social: {} },
  { email: 'naksalujapro11@gmail.com', firstName: 'Naksh', lastName: 'Saluja', post: 'Junior Member', hasHover: true, social: { website: 'https://www.bribooks.com/author/naksh-saluja', linkedin: 'https://www.linkedin.com/in/naksh-saluja-13098736b/', github: 'https://github.com/nakshtheking12' } },
  { email: 'ishitabatra0811@gmail.com', firstName: 'Ishita', lastName: 'Batra', post: 'Junior Member', hasHover: true, social: { linkedin: 'www.linkedin.com/in/ishita-batra-161a54361', github: 'https://github.com/ishh-b' } },
];

const alumniMembers = [
  { email: 'namishoberoi2008@gmail.com', firstName: 'Namish', lastName: 'Oberoi', post: 'President', hasHover: false, social: {} },
  { email: 'amaanssethi@gmail.com', firstName: 'Amaan', lastName: 'Singh', post: 'President', hasHover: true, social: { linkedin: 'https://in.linkedin.com/in/amaansinghsethi', website: 'https://www.instagram.com/amaansinghsethi' } },
  { email: 'gavishjindal2006@gmail.com', firstName: 'Gavish', lastName: 'Jindal', post: 'President', hasHover: true, social: { website: 'https://gavishjindal.com/', linkedin: 'https://www.linkedin.com/in/Gavishjindal/', github: 'https://github.com/Gavishj' } },
  { email: 'gsoham562@gmail.com', firstName: 'Soham', lastName: 'Gupta', post: 'Vice President', hasHover: true, social: { linkedin: 'https://www.linkedin.com/in/soham-gupta-b567b2274/', github: 'https://github.com/Sam562retro' } },
  { email: 'vanditkad@gmail.com', firstName: 'Vandit', lastName: 'Kad', post: 'Vice President', hasHover: true, social: { website: 'https://vanditkad.xyz/', linkedin: 'https://www.linkedin.com/in/vanditkad/', github: 'https://github.com/MrVoraciousw' } },
  { email: 'aravgupta28@gmail.com', firstName: 'Arav', lastName: 'Gupta', post: 'Secretary', hasHover: false, social: {} },
  { email: 'pratyushgarg527@gmail.com', firstName: 'Pratyush', lastName: 'Garg', post: 'Secretary', hasHover: false, social: {} },
  { email: 'sharma.shaurya2007@gmail.com', firstName: 'Shaurya', lastName: 'Sharma', post: 'Secretary', hasHover: false, social: {} },
  { email: 'gavishjindal2006@gmail.com', firstName: 'Gavish', lastName: 'Jindal', post: 'Co-President', hasHover: false, social: {} },
  { email: 'sakshamkochar@gmail.com', firstName: 'Saksham', lastName: 'Kochar', post: 'President', hasHover: false, social: {} },
  { email: 'ayushi_agrawal@hotmail.com', firstName: 'Ayushi', lastName: 'Aggarwal', post: 'President', hasHover: false, social: {} },
  { email: 'star.shreya67.mangla@gmail.com', firstName: 'Shreya', lastName: 'Mangla', post: 'Vice President', hasHover: false, social: {} },
  { email: 'shubhamgamer.6105@gmail.com', firstName: 'Shubham', lastName: 'Aggarwal', post: 'Club Ambassador', hasHover: false, social: {} },
  { email: 'Yttanay07@gmail.com', firstName: 'Tanay', lastName: 'Jain', post: 'Vice President', hasHover: false, social: {} },
  { email: 'twittersaatvik@gmail.com', firstName: 'Saatvik', lastName: 'Sachdeva', post: 'Club Ambassador', hasHover: false, social: {} },
  { email: 'narulanischay2005@gmail.com', firstName: 'Nischay', lastName: 'Narula', post: 'Club Ambassador', hasHover: false, social: {} },
  { email: 'aryan_02@outlook.com', firstName: 'Aryan', lastName: 'Mediratta', post: 'President', hasHover: false, social: {} },
  { email: 'mah.ansh564@gmail.com', firstName: 'Anshul', lastName: 'Mahajan', post: 'Co-President', hasHover: false, social: {} },
  { email: 'aaditsaluja@gmail.com', firstName: 'Aadit', lastName: 'Saluja', post: 'Co-President', hasHover: false, social: {} },
  { email: 'ahujatejas06@gmail.com', firstName: 'Tejas', lastName: 'Ahuja', post: 'Vice President', hasHover: false, social: {} },
  { email: 'singhjaspreet.official@gmail.com', firstName: 'Jaspreet', lastName: 'Singh', post: 'Robotics President', hasHover: false, social: {} },
  { email: 'divyamarora2213@gmail.com', firstName: 'Divyam', lastName: 'Arora', post: 'Robotics President', hasHover: false, social: {} },
  { email: 'ngarg311@gmail.com', firstName: 'Nabh', lastName: 'Garg', post: 'Alumni', hasHover: false, social: {} },
  { email: 'adi.oberoi2004@gmail.com', firstName: 'Aditya', lastName: 'Oberoi', post: 'Group Discussion', hasHover: false, social: {} },
  { email: 'paartha27@gmail.com', firstName: 'Paartha', lastName: 'Panwar', post: 'Quizzing', hasHover: false, social: {} },
  { email: 'harshmittal101001@gmail.com', firstName: 'Harsh', lastName: 'Mittal', post: 'President', hasHover: false, social: {} },
  { email: 'mananmrig47@gmail.com', firstName: 'Manan', lastName: 'Mrig', post: 'Alumni', hasHover: false, social: {} },
  { email: 'gautamsinghi2013@gmail.com', firstName: 'Gautam', lastName: 'Singhi', post: 'Alumni', hasHover: false, social: {} },
  { email: 'manas.25.july@gmail.com', firstName: 'Manas', lastName: 'Khandelwal', post: 'Alumni', hasHover: false, social: {} },
  { email: 'saiyyamkochar@gmail.com', firstName: 'Saiyyam', lastName: 'Kochar', post: 'President', hasHover: false, social: {} },
  { email: 'yajatkhanna28@gmail.com', firstName: 'Yajat', lastName: 'Khanna', post: 'Alumni', hasHover: false, social: {} },
  { email: 'abheetkansal@gmail.com', firstName: 'Abheet', lastName: 'Kansal', post: 'Alumni', hasHover: false, social: {} },
  { email: 'ishpreet2000@gmail.com', firstName: 'Ishpreet', lastName: 'Singh Bhasin', post: 'President', hasHover: false, social: {} },
  { email: 'tharejatanmay@gmail.com', firstName: 'Tanmay', lastName: 'Thareja', post: 'President', hasHover: false, social: {} },
  { email: 'kapoornitigya@gmail.com', firstName: 'Nitigya', lastName: 'Kapoor', post: 'Alumni', hasHover: false, social: {} },
  { email: 'shivam0732@gmail.com', firstName: 'Shivam', lastName: 'Issar', post: 'Cryptic', hasHover: false, social: {} },
];

// Function to detect mobile devices
function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}
isAnimationEnabled = false;

const keyboard = document.getElementById("keyboard")
const container1 = document.getElementById("container")
container1.style.maxHeight = window.innerHeight + "px";

// Function to generate card HTML
function generateCardHTML(member, isAlumni = false) {
  const hoverClass = member.hasHover ? 'hoverme hoverme2' : '';
  let socialHTML = '';
  
  if (member.social.special === 'yes') {
    socialHTML = `
      <div class="social-links" data-special="yes">
        <div class="social-icons">
          <a href="https://github.com/Parin-Khurana" target="_blank" class="social-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
              <path d="M9 18c-4.51 2-5-2-7-2"></path>
            </svg>
          </a>
          <a href="https://open.spotify.com/user/31h2cedo23stl6zmiprpejextzui?si=18425191f59c48b0" target="_blank" class="social-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
              <path d="M8 11.5c2.5-1 5.5-.5 7.5 2" />
              <path d="M9 15c1.5-1 4-1 5 .5" />
              <path d="M7 9.5c2-1 6-1 8 1" />
            </svg>
          </a>
        </div>
      </div>
    `;
  } else if (Object.keys(member.social).length > 0 && !member.social.special) {
    let dataAttrs = '';
    if (member.social.website) dataAttrs += ` data-website="${member.social.website}"`;
    if (member.social.github) dataAttrs += ` data-github="${member.social.github}"`;
    if (member.social.linkedin) dataAttrs += ` data-linkedin="${member.social.linkedin}"`;
    
    socialHTML = `
      <div class="social-links"${dataAttrs}>
        <div class="social-icons"></div>
      </div>
    `;
  }

  return `
    <div class="center card ${hoverClass}">
      <div data-value="${member.email}" class="center pfp"></div>
      <div class="name">
        ${member.firstName}<br>
        ${member.lastName}
      </div>
      <div class="post${isAlumni ? ' align="center"' : ''}">
        ${member.post}
      </div>
      ${socialHTML}
    </div>
  `;
}

// Function to render cards
function renderCards() {
  const memberCardsContainer = document.getElementById('memberCards');
  const alumniContainer = document.getElementById('alumni');
  
  // Clear existing cards
  memberCardsContainer.innerHTML = '';
  alumniContainer.innerHTML = '';
  
  // Render team members
  teamMembers.forEach(member => {
    memberCardsContainer.innerHTML += generateCardHTML(member, false);
  });
  
  // Render alumni
  alumniMembers.forEach(member => {
    alumniContainer.innerHTML += generateCardHTML(member, true);
  });
}

// Render cards on page load
document.addEventListener('DOMContentLoaded', () => {
  renderCards();
  
  // Set up gravatars for all profile pictures
  const pfp = document.getElementsByClassName("pfp");
  for (let i = 0; i < pfp.length; i++) {
    const e = pfp[i];
    e.style.background = "url(https://gravatar.com/avatar/" + getGravatarHash(e.dataset.value) + "?s=600)  no-repeat center";
  }

  // Set up social links
  document.querySelectorAll('.social-links').forEach(card => {
    const website = card.dataset.website;
    const github = card.dataset.github;
    const linkedin = card.dataset.linkedin;
    const special = card.dataset.special;
    if (!special) {
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

  // Set up hover effects for hoverme2 cards
  if (!isMobile()) {
    document.querySelectorAll('.hoverme2').forEach(item => {
      const pfp = item.querySelector('.pfp');
      const name = item.querySelector('.name');
      const post = item.querySelector('.post');
      const sociallinks = item.querySelector('.social-links');
      let hoverTimeout;

      item.addEventListener('mouseenter', () => {
        if (!isAnimationEnabled) return;

        hoverTimeout = setTimeout(() => {
          clearTimeout(invisibleTimeout);
          if (sociallinks) {
            sociallinks.style.visibility = 'visible';
            sociallinks.style.position = 'static';
            sociallinks.style.animation = 'links .5s forwards ease-in-out';
            sociallinks.style.animationDelay = '0s';
          }

          pfp.style.animation = 'goup .5s ease forwards';
          pfp.style.animationDelay = '0s';
          name.style.animation = 'goup .5s ease forwards';
          name.style.animationDelay = '0s';
          post.style.animation = 'goup .5s ease forwards';
          post.style.animationDelay = '0s';
        }, 250);
      });

      item.addEventListener('mouseleave', () => {
        clearTimeout(hoverTimeout);

        setTimeout(() => {
          pfp.style.animation = 'godown .5s ease forwards';
          name.style.animation = 'godown .5s ease forwards';
          post.style.animation = 'godown .5s ease forwards';
          if (sociallinks) {
            sociallinks.style.animation = 'linksout .25s forwards ease-in-out';
          }

          invisibleTimeout = setTimeout(() => {
            if (sociallinks) {
              sociallinks.style.visibility = 'hidden';
              sociallinks.style.height = '0px';
            }
          }, 250);
        }, 200);
      });
    });
  }
});

removeHover();

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

// Navigation and scroll handling continues below...


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
      if (!isMobile()) {
        removeHover();

      }
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
    console.log("blackie")

    n = 0
  }
}


//  -----------------------
function removeHover() {
  document.querySelectorAll('.hoverme2').forEach(card => {
    //  sociallinks.style.animation = 'linksout .5s forwards ease-in-out';
    //      card.classList.remove('hoverme');
    card.style.marginTop = "15px"
    isAnimationEnabled = false


  })
}

function addHover() {
  document.querySelectorAll('.hoverme2').forEach(card => {
    if (!isMobile()) {
      card.classList.add('hoverme');
      console.log("added")
      isAnimationEnabled = false
      card.style.marginTop = "30px"
    }
  })
}
