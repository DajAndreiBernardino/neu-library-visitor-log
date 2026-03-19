# NEU Library Visitor Log

A comprehensive web application for logging and managing visitor statistics at New Era University (NEU) Library. The system allows visitors to log their entry with their purpose, while administrators can analyze visitor patterns and manage access restrictions.

## 🚀 Live Application

**Deployed Application:** [Add your deployment URL here](https://your-deployed-url.com)

## 📋 Features

### For Regular Users (Students/Faculty/Staff)
- **Google Authentication** - Sign in with your NEU institutional email (e.g., jcesperanza@neu.edu.ph)
- **RFID Login** - Alternative login via RFID card scanning using student/employee ID
- **Visit Logging** - Select reason for library visit:
  - Reading
  - Researching
  - Use of Computer
  - Meeting
  - Borrowing Books
  - Returning Books
  - Other
- **Personalized Welcome Message** - Your profile displayed with name, program/college, and "Welcome to NEU Library!" greeting
- **Access Control** - Admins can block users from accessing the library

### For Administrators
- **Dashboard & Analytics** - View visitor statistics in card format
- **Date Range Filtering**:
  - Today
  - This Week
  - This Month
  - Custom Date Range
- **Advanced Filtering**:
  - Filter by visitor's reason for visit
  - Filter by college/program
  - Filter by visitor type (Student, Faculty, Staff, Employee)
  - General text search (name, program, reason)
- **User Management**:
  - View all registered users
  - Block/Unblock visitors
  - Manage access to the library
- **Data Export** - Convert visitor logs and statistics to PDF

## 👤 User Roles

### Regular User: `jcesperanza@neu.edu.ph`
- All features listed under "For Regular Users" above

### Administrator: `jcesperanza@neu.edu.ph`
- All admin dashboard features
- Capability to switch between regular user and admin roles
- Full visitor management and statistics access

## 🛠️ Technology Stack

- **Frontend**: React 19 + Vite
- **Backend**: Firebase (Authentication & Firestore Database)
- **Styling**: Tailwind CSS + Custom CSS
- **PDF Export**: jsPDF + jsPDF AutoTable
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Routing**: React Router DOM
- **Build Tools**: ESLint

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Firebase Project (with Firestore Database and Authentication enabled)

### Setup Instructions

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/neu-library-visitor-log.git
   cd neu-library-visitor-log
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root directory:
   ```
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Update Admin Emails** (in `src/context/authConstants.js`)
   ```javascript
   export const ADMIN_EMAILS = [
     "jcesperanza@neu.edu.ph",
     // Add more admin emails as needed
   ];
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

6. **Build for Production**
   ```bash
   npm run build
   ```

## 📁 Project Structure

```
src/
├── components/
│   └── Navbar.jsx                 # Navigation component
├── context/
│   ├── authConstants.js           # Admin email list
│   ├── authContext.js             # Auth context creation
│   ├── AuthContext.jsx            # Auth provider component
│   └── useAuth.js                 # Custom hook for auth
├── pages/
│   ├── AdminDashboard.jsx         # Admin statistics & management
│   ├── Login.jsx                  # Login page (Google + RFID)
│   ├── ProfileSetup.jsx           # User profile setup
│   └── Welcome.jsx                # Visitor welcome & logging
├── App.jsx                        # Main app with routing
├── firebase.js                    # Firebase configuration
├── main.jsx                       # React entry point
└── index.css                      # Global styles
```

## 🔐 Firebase Firestore Structure

### Collections

**users/**
- Stores user profiles with roles and preferences
- Fields: uid, email, name, photoURL, role, college, program, type

**visits/**
- Logs every visitor entry
- Fields: uid, name, email, program, college, type, reason, loginMethod, timestamp, date

**blocklist/**
- Tracks blocked users
- Fields: uid, blocked, blockedAt

## 🎯 Usage Guide

### For Visitors

1. Navigate to the login page
2. Choose authentication method:
   - **Google Login**: Click "Sign in with Google" and authenticate with your NEU email
   - **RFID Login**: Enter or scan your RFID student/employee ID
3. Complete profile setup (first time only):
   - Select your college
   - Select your program
   - Select your type (Student/Faculty/Staff/Employee)
4. Select your reason for library visit
5. Review your personalized welcome message
6. Log in for additional visits

### For Administrators

1. Log in with your admin email (jcesperanza@neu.edu.ph)
2. Access the Admin Dashboard
3. **View Statistics**:
   - Total visitors, students, faculty, staff (displayed in cards)
   - Filter by date range (today, week, month, custom)
4. **Search & Filter Visitors**:
   - Use text search for name/program/reason
   - Filter by visit reason
   - Filter by college
   - Filter by visitor type
5. **Manage Access**:
   - View visitor log with details
   - Block/unblock users as needed
6. **Export Data**:
   - Click "Export PDF" to download filtered results

## 🔄 Role Switching

If you have both user and admin roles:
1. Log in to your account
2. The system automatically detects your role
3. Navigate between roles using UI controls

## ⚙️ Firebase Setup

### Required Collections
Ensure these collections exist in Firestore:
1. `users` - User profiles and roles
2. `visits` - Visit logs
3. `blocklist` - Blocked users

### Enable Authentication
- Enable Google Sign-In in Firebase Authentication
- Set authorized domains to include your deployed URL

### Security Rules
Configure Firestore rules to allow authenticated users to read/write their own data and admins full access.

## 📊 Sample Statistics Filter

The admin dashboard supports filtering by:
- **Time**: Today / This Week / This Month / Custom Range
- **Reason**: Reading, Researching, Computer Use, Meeting, etc.
- **College**: All 20+ NEU colleges/schools
- **Type**: Student, Faculty, Staff

## 🐛 Troubleshooting

### Login Issues
- Ensure your email is whitelisted in `authConstants.js` for admin access
- Check Firebase authentication domain restrictions
- Verify `.env` file has correct Firebase credentials

### Statistics Not Showing
- Ensure visits collection has data with proper timestamps
- Check date filters are set correctly
- Verify user is authenticated as admin

### PDF Export Not Working
- Install jsPDF dependencies: `npm install jspdf jspdf-autotable`
- Ensure browser allows downloads

## 📝 License

This project is part of a coursework assignment for New Era University.

## 👨‍💻 Developer

- **Name**: [Your Name]
- **Email**: jcesperanza@neu.edu.ph
- **GitHub**: https://github.com/yourusername

## 🤝 Support

For issues or questions about the application, please contact the NEU Library administration or reach out to the developer.
