# 📚 NEU Library Visitor Log

A digital visitor log system for the **New Era University Library**, built with React + Firebase. Supports Google OAuth login, RFID kiosk check-in, admin dashboard, and Excel export.

---

## 🌐 Live Demo

[https://neu-lib-visitor-6b1qvt514-dajandreibernardinos-projects.vercel.app]

---

## ✨ Features

- 🔐 **Google Sign-In** — restricted to `@neu.edu.ph` accounts
- 📟 **RFID Kiosk Mode** — standalone check-in page at `/kiosk`, no Google login needed
- 📋 **Visitor Check-In** — select purpose of visit, logs saved to Firestore
- 🛡️ **Admin Dashboard** — view all visit logs with filters (date, reason, college, type)
- 👥 **User Management** — block/unblock users from the admin panel
- 📊 **Export to Excel** — download filtered visit logs as `.xlsx`
- 🚫 **Block System** — blocked users are restricted from checking in

---

## 🗂️ Project Structure

```
src/
├── firebase.js                  # Firebase config & exports
├── App.jsx                      # Routes & guards
├── context/
│   └── AuthContext.jsx          # Auth state, Google sign-in, role logic
├── components/
│   └── Navbar.jsx               # Top navigation bar
└── pages/
    ├── Login.jsx                # Google + RFID login page
    ├── ProfileSetup.jsx         # First-time user registration
    ├── Welcome.jsx              # Visitor check-in (purpose selection)
    ├── AdminDashboard.jsx       # Admin panel (logs, users, export)
    └── Kiosk.jsx                # RFID-only kiosk page
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Firebase project with Firestore + Google Auth enabled

### Installation

```bash
git clone https://github.com/DajAndreiBernardino/neu-library-visitor-log.git
cd neu-library-visitor-log
npm install
```

### Environment Variables

Create a `.env` file in the root:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Run locally

```bash
npm run dev
```

---

## 🔥 Firestore Collections

| Collection | Purpose |
|---|---|
| `users` | Registered user profiles |
| `visits` | Visit log entries |
| `blocklist` | Blocked user IDs |
| `adminEmails` | Emails with admin access (document ID = email) |

### Adding an Admin

In Firestore, create a document under `adminEmails` with the email as the document ID:

```
adminEmails/
  └── youremail@neu.edu.ph
        active: true
```

---

## 🛠️ Tech Stack

- [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- [Firebase](https://firebase.google.com/) (Auth + Firestore)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Router](https://reactrouter.com/)
- [date-fns](https://date-fns.org/)
- [xlsx](https://sheetjs.com/)

---

## 📄 License

For academic use — New Era University, CICS.
