

function skillClicked(e) {

    if (e.classList.contains("clicked")) {
        e.classList.remove("clicked")
    } else {
        e.classList.add("clicked")
    }

}


// Function to detect mobile devices
function isMobile() {
    return /Mobi|Android/i.test(navigator.userAgent) || (window.innerWidth <= 800 && window.innerHeight <= 800);
}

if (!(isMobile())) {
    var script = document.createElement('script');
    script.type = 'text/javascript';
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

// login process ------------

// firebase.initializeApp(firebaseConfig);
// const database = firebase.database();

// // document.getElementById("form").addEventListener("submit", function (e) {
// //     e.preventDefault();

//     // const email = document.querySelector(".email").value + document.querySelector(".emailPlaceholder").textContent;
//     // const pwd = document.getElementById("pwd").value;

//     // firebase.auth().signInWithEmailAndPassword(email, pwd)
//     //     .then((userCredential) => {
//     //         const user = userCredential.user;
//     //         const uid = user.uid;

//     //         return firebase.database().ref('members').orderByChild('email').equalTo(email).once('value');
//     //     })
//     //     .then(snapshot => {
//     //         if (snapshot.exists()) {
//     //             const userData = Object.values(snapshot.val())[0]; // get first matched user
//     //             const fullName = `${userData.fname} ${userData.lname}`;
//     //             alert(`Successfully logged in, ${fullName}!`);
//     //             firebase.auth().currentUser.getIdTokenResult()
//     //                 .then((idTokenResult) => {
//     //                     if (idTokenResult.claims.admin) {
//     //                         window.location.href = "/tasks/admindashboard.html";
//     //                     } else {
//     //                         window.location.href = "/tasks/dashboard.html";
//     //                     }
//     //                 })
//     //                 .catch((error) => {
//     //                     console.error("Error checking admin claim:", error);
//     //                     window.location.href = "/tasks/dashboard.html"; // fallback
//     //                 });
//     //         } else {
//     //             alert("Logged in, but user data not found!");
//     //         }
//     //     })
//     //     .catch(error => {
//     //         if (error.code === "auth/internal-error") {
//     //             if (confirm("Invalid credentials. Do you want to reset your password?")) {
//     //                 firebase.auth().sendPasswordResetEmail(email)
//     //                     .then(() => {
//     //                         alert("Password reset email sent! Check your inbox.");
//     //                     })
//     //                     .catch(err => {
//     //                         console.error(err);
//     //                         alert("Failed to send password reset email: " + err.message);
//     //                     });
//     //             }
//     //         } else {
//     //             console.error(error);
//     //             alert("An unexpected error occurred: " + error.message);
//     //         }
//     //     });


//    const provider = new firebase.auth.GoogleAuthProvider();

// document.getElementById("'login-google'").addEventListener("click", function (e) {
//   firebase.auth().signInWithPopup(provider)
//     .then((result) => {
//       const user = result.user;

//       // Email domain check: only allow emails ending with '.pp.balbharati.org'
//       if (!user.email.endsWith('pp.balbharati.org')) {
//         console.error("Sign-in error: Email does not end with .pp.balbharati.org");
//         alert("Sign in with school email.");

//         // Sign out unauthorized user immediately
//         firebase.auth().signOut()
//           .catch((signOutError) => {
//             console.error("Error signing out user:", signOutError);
//           });

//         return; // Stop further processing
//       }

//       // User email domain is valid, now check user in 'members' database
//       firebase.database().ref('members').orderByChild('email').equalTo(user.email).once('value')
//         .then(snapshot => {
//           if (snapshot.exists()) {
//             const userData = Object.values(snapshot.val())[0];
//             const fullName = `${userData.fname} ${userData.lname}`;
//             alert(`Successfully logged in, ${fullName}!`);

//             // Check for admin claim to redirect appropriately
//             firebase.auth().currentUser.getIdTokenResult()
//               .then((idTokenResult) => {
//                 if (idTokenResult.claims.admin) {
//                   window.location.href = "/tasks/admindashboard.html";
//                 } else {
//                   window.location.href = "/tasks/dashboard.html";
//                 }
//               })
//               .catch((tokenError) => {
//                 console.error("Error retrieving token claims:", tokenError);
//                 alert("Login failed due to token error.");
//               });
//           } else {
//             alert("Logged in, but user data not found!");
//             // Optional: Sign out the user if data not found
//             firebase.auth().signOut()
//               .catch(s => console.error("Sign out failed:", s));
//           }
//         })
//         .catch(dbError => {
//           console.error("Database error:", dbError);
//           alert("Error accessing user data. Please try again.");
//         });
//     })
//     .catch((error) => {
//       alert("Google Sign-in failed: " + error.message);
//     });
// });


// // });

document.addEventListener('DOMContentLoaded', function() {
    if (window.authInitialized) return;
    window.authInitialized = true;

    if (!firebase || !db) {
        showError('Firebase is not loaded or database is missing.');
        return;
    }

    setupAuthListener();

    const googleSignInBtn = document.getElementById('login-google');
    if (googleSignInBtn) {
        googleSignInBtn.addEventListener('click', signInWithGoogle);
    }
});

function setupAuthListener() {
    const dashboardPages = ['admin-dashboard', 'user-dashboard', 'teamdashboard'];

    auth.onAuthStateChanged(async (user) => {
        if (user) {
            const currentPath = window.location.pathname;
            if (
                currentPath.includes('teamlogin.html') ||
                currentPath === '/' ||
                currentPath.endsWith('/')
            ) {
                await handleAuthenticatedUser(user);
            } else if (dashboardPages.some(page => currentPath.includes(page))) {
                await verifyDashboardAccess(user);
            }
        } else {
            const currentPath = window.location.pathname;
            if (dashboardPages.some(page => currentPath.includes(page))) {
                window.location.href = 'index.html';
            }
        }
    });
}

async function signInWithGoogle() {
    try {
        
        
        const result = await auth.signInWithPopup(window.googleProvider);
        // onAuthStateChanged will handle the rest
    } catch (error) {
        console.error("Google Sign-in failed:", error);
    }
}

async function handleAuthenticatedUser(user) {
    if (window.processingAuth) return;
    window.processingAuth = true;
    try {
        const userDoc = await db.collection('users').doc(user.uid).get();
        let userRole;
        if (userDoc.exists) {
            userRole = userDoc.data().role;
            await db.collection('users').doc(user.uid).update({
                lastLogin: new Date(),
                photoURL: user.photoURL || null
            });
        } else {
            userRole = await determineUserRole(user.email);
            const newUserData = {
                uid: user.uid,
                email: user.email,
                name: user.displayName || user.email.split('@')[0],
                role: userRole,
                wins: 0,
                registeredEvents: [],
                createdAt: new Date(),
                lastLogin: new Date(),
                photoURL: user.photoURL || null
            };
            await db.collection('users').doc(user.uid).set(newUserData);
        }
        console.log(`User ${user.email} authenticated with role: ${userRole}`);
        redirectToDashboard(userRole);
    } catch (error) {
        showError('Failed to process user authentication.');
        
    } finally {
        window.processingAuth = false;
    }
}

async function verifyDashboardAccess(user) {
    try {
        const userDoc = await db.collection('users').doc(user.uid).get();
        if (!userDoc.exists) {
            await signOut();
            return;
        }
        const userData = userDoc.data();
        const currentPath = window.location.pathname;

        // Allow teamdashboard.html as valid dashboard for users
        if (userData.role === 'admin' && !currentPath.includes('admin-dashboard')) {
            redirectToDashboard('admin');
        } else if (userData.role === 'user' && !['user-dashboard', 'teamdashboard'].some(page => currentPath.includes(page))) {
            redirectToDashboard('user');
        }
    } catch (error) {
        window.location.href = 'index.html';
    }
}

async function determineUserRole(email) {
    const adminEmails = [
        'byteclub@pp.balbharati.org' // <-- set your admin Gmail(s) here
        // Add more admin emails as needed
    ];
    if (adminEmails.includes(email.toLowerCase())) return 'admin';

    // Uncomment and adjust if you want to assign admin to first user in DB
    // const adminQuery = await db.collection('users').where('role', '==', 'admin').limit(1).get();
    // return adminQuery.empty ? 'admin' : 'user';

    // For now, default to 'user'
    return 'user';
}

function redirectToDashboard(role) {
    if (role === 'admin') {
        window.location.href = 'admin-dashboard.html';
    } else {
        window.location.href = 'teamdashboard.html'; // Redirect standard users here
    }
}

async function signOut() {
    await auth.signOut();
    window.location.href = 'index.html';
}

function requireAuth(callback) {
    const unsubscribe = auth.onAuthStateChanged(user => {
        if (user) {
            callback(user);
            unsubscribe();
        } else {
            window.location.href = 'index.html';
        }
    });
}

function requireRole(requiredRole, callback) {
    requireAuth(async (user) => {
        const userDoc = await db.collection('users').doc(user.uid).get();
        if (userDoc.exists && userDoc.data().role === requiredRole) {
            callback(user, userDoc.data());
        } else {
            showError('Access denied. Insufficient permissions.');
            setTimeout(signOut, 1500);
        }
    });
}
window.signOut = signOut;
window.requireAuth = requireAuth;
window.requireRole = requireRole;