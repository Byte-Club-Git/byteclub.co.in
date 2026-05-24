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

This repo is a static HTML/CSS/JS site. The registration system uses Supabase directly from the browser with the public publishable key. Schools choose their own password, and Supabase Auth handles confirmation/reset emails.

### Files

- `registration.html` - school registration form
- `login.html` - school login form
- `dashboard.html` - event registration dashboard
- `assets/js/byteit-supabase-config.js` - public Supabase browser config
- `supabase/schema.sql` - tables, RLS policies, event seed data, validation triggers, and save RPC
- `supabase/functions/register-school/index.ts` - legacy generated-password function, not needed for the current Supabase Auth flow

### Supabase SQL

1. Create a Supabase project.
2. Open Supabase SQL Editor.
3. Run `supabase/schema.sql`.

The schema creates:

- `schools`
- `events`
- `event_registrations`
- `participants`

It also seeds all 11 events and enables RLS so logged-in schools can only see and manage their own registrations.

### Frontend config

Update `assets/js/byteit-supabase-config.js`:

```js
window.BYTEIT_SUPABASE_CONFIG = {
  url: "https://YOUR_PROJECT_REF.supabase.co",
  anonKey: "YOUR_SUPABASE_ANON_PUBLIC_KEY",
  registrationFunctionUrl: "https://YOUR_PROJECT_REF.functions.supabase.co/register-school"
};
```

The anon key is safe to use in frontend code. Never add the Supabase service role key to any frontend file.

### Auth email setup

No Resend or custom Edge Function is required for the active flow. In Supabase, configure Auth email settings:

1. Go to Authentication > Providers and make sure Email is enabled.
2. Go to Authentication > URL Configuration.
3. Add your local and production site URLs, for example `http://127.0.0.1:8000` and your GitHub Pages URL.
4. For production, configure Supabase SMTP later if you want branded email delivery. The default Supabase Auth emails are enough to test.

### Run locally

Because this is a static site, open `index.html`, `byteit.html`, `registration.html`, `login.html`, or `dashboard.html` in a browser, or serve the folder with any static server. No Node/npm install is required for the website.
