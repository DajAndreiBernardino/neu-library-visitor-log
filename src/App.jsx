import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Welcome from "./pages/Welcome";
import AdminDashboard from "./pages/AdminDashboard";
import ProfileSetup from "./pages/ProfileSetup";
import Kiosk from "./pages/Kiosk";
import Navbar from "./components/Navbar";

function Spinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div
        className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin"
        style={{ borderColor: "#00b4d8", borderTopColor: "transparent" }}
      />
    </div>
  );
}

// Only blocks unauthenticated users
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const rfidUser = sessionStorage.getItem("rfidUser");
  if (loading) return <Spinner />;
  if (!user && !rfidUser) return <Navigate to="/login" replace />;
  return children;
}

// Only blocks non-admins (checks Firestore role, not activeRole state)
function AdminRoute({ children }) {
  const { user, userProfile, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (userProfile && userProfile.role !== "admin") return <Navigate to="/access-denied" replace />;
  return children;
}

function AccessDenied() {
  const { logout } = useAuth();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow-md p-10 text-center max-w-sm border border-gray-100">
        <p className="text-5xl mb-4">🚫</p>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Access Denied</h2>
        <p className="text-gray-500 text-sm mb-6">You don't have permission to view this page.</p>
        <button
          onClick={async () => { await logout(); window.location.href = "/login"; }}
          className="px-5 py-2 rounded-full text-white text-sm font-medium bg-red-500 hover:bg-red-600 transition"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/kiosk" element={<Kiosk />} />
          <Route path="/profile-setup" element={<ProtectedRoute><ProfileSetup /></ProtectedRoute>} />
          <Route path="/welcome" element={<ProtectedRoute><Welcome /></ProtectedRoute>} />
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/access-denied" element={<AccessDenied />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}