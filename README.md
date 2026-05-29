# Byte Club – Official Website

Welcome to the GitHub repository for [Byte Club](https://byteclub.co.in) – the official website of a student-led tech collective from Bal Bharati Public School, Pitampura (Delhi).

> 💡 Learn. Build. Share. Together.

---

## 🏆 Awards

### 🥇 Web Guru Awards – *“Guru of the Day”*  
🗓️ **4 May 2025**  
Byte Club’s website was recognized as *Guru of the Day* by [WebGuruAwards.com](https://www.webguruawards.com/sites/byteclub) for:

- Clean, minimal design
- Smooth scroll effects
- User-friendly layout with no distractions

This award highlights Byte Club’s commitment to simplicity and great UX design.

---

## 📬 Contact
- 🌐 Website Form: [byteclub.co.in/contact](https://byteclub.co.in/contact$0)
- 📧 Email: byteclub@pp.balbharati.org

---

## Byte.IT Registration Setup

This repo is a static HTML/CSS/JS site. The registration system uses Firebase Auth and Firestore. Schools can register with email/password or Google. Email/password registration creates the Firebase Auth account with a unique temporary password, then Firebase Auth sends a password setup/reset email so the school can set its own password. Google registration signs in with a popup, creates the matching Firestore school profile, and sends a password setup email for the same Firebase user. If a password account already exists with that email, the Google button links Google to that existing UID after the user enters the email/password once.

### Files

- `registration.html` - school registration form
- `login.html` - school login form
- `dashboard.html` - event registration dashboard
- `assets/js/byteit-firebase-config.js` - public Firebase browser config
- `assets/js/byteit-firebase.js` - shared Firebase browser helpers
- `firestore.rules` - Firestore security rules
- `firebase.json` / `.firebaserc` - Firebase deploy config

### Firebase setup

1. In Firebase Console, use project `byteclub-cc7ac`.
2. Enable Authentication > Sign-in method > Email/Password.
3. Enable Authentication > Sign-in method > Google, choose the project support email, and save.
4. In Authentication > Settings, keep one account per email enabled so Google and password login share the same Firebase user.
5. In Authentication > Settings > Authorized domains, make sure your live domain is listed, for example `byteclub.co.in` plus any local/test domains you use.
6. Create Firestore Database.
7. Make sure password reset emails are enabled in Authentication email templates.

The app uses these Firestore collections:

- `schools`
- `event_registrations`

Event rules are kept in frontend code and guarded by Firestore owner-only rules. For stronger server-side event limit enforcement later, upgrade to Firebase Cloud Functions on the Blaze plan.

### Frontend config

Firebase browser config lives in `assets/js/byteit-firebase-config.js`:

```js
window.BYTEIT_FIREBASE_CONFIG = {
  apiKey: "...",
  authDomain: "byteclub-cc7ac.firebaseapp.com",
  projectId: "byteclub-cc7ac",
  storageBucket: "byteclub-cc7ac.firebasestorage.app",
  messagingSenderId: "...",
  appId: "...",
  measurementId: "..."
};
```

Firebase web config is safe to use in frontend code. Firestore rules and Cloud Functions protect private data and writes.

### Deploy Firebase rules

Install Firebase CLI, log in, then deploy from the repo root:

```bash
firebase login
firebase use byteclub-cc7ac
firebase deploy --only firestore:rules
```

The website itself can still be deployed on GitHub Pages.

### Run locally

Because browser modules need HTTP, serve the folder with any static server:

```bash
python -m http.server 8000
```

Then open `http://127.0.0.1:8000/registration.html`.
