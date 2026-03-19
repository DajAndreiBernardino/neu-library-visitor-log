import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Welcome from "./pages/Welcome";
import AdminDashboard from "./pages/AdminDashboard";
import ProfileSetup from "./pages/ProfileSetup";
import Navbar from "./components/Navbar";

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, activeRole, loading } = useAuth();

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-2"
          style={{ borderColor: '#00b4d8', borderTopColor: 'transparent' }}></div>
        <p className="text-gray-400 text-sm">Verifying session...</p>
      </div>
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && activeRole !== "admin") return <Navigate to="/access-denied" replace />;
  return children;
}

function AccessDenied() {
  const { logout } = useAuth();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-xl shadow-md p-10 max-w-md text-center border-t-4" style={{ borderTopColor: '#1a237e' }}>
        <div className="text-5xl mb-4">🚫</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Access Denied</h2>
        <p className="text-gray-500 text-sm mb-6">You don't have permission to access this page.</p>
        <div className="flex gap-3 justify-center">
          <a href="/login" className="px-5 py-2 rounded-full text-white text-sm font-medium" style={{ backgroundColor: '#00b4d8' }}>
            Go to Visitor Page
          </a>
          <button onClick={logout} className="px-5 py-2 rounded-full text-white text-sm font-medium bg-red-500">
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
function WelcomeGuard({ children }) {
  const { user, loading } = useAuth();
  const rfidUser = sessionStorage.getItem("rfidUser");

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin mx-auto"
        style={{ borderColor: '#00b4d8', borderTopColor: 'transparent' }}></div>
    </div>
  );

  // ✅ Allow through if Google user OR RFID session exists
  if (!user && !rfidUser) return <Navigate to="/login" replace />;

  return children;
}

function AppRoutes() {
  const { user, activeRole } = useAuth();

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/access-denied" element={<AccessDenied />} />
        <Route path="/welcome" element={<WelcomeGuard><Welcome /></WelcomeGuard>} />
        <Route path="/profile-setup" element={<ProtectedRoute><ProfileSetup /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
        <Route path="*" element={
          user
            ? activeRole === "admin"
              ? <Navigate to="/admin" replace />
              : <Navigate to="/welcome" replace />
            : <Navigate to="/login" replace />
        } />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}