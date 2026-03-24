import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
  const { user, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!user || location.pathname === "/login" || location.pathname === "/kiosk") return null;

  const isAdmin = userProfile?.role === "admin";
  const isOnAdmin = location.pathname === "/admin";

  return (
    <nav className="bg-white shadow-sm px-6 py-3 flex items-center justify-between sticky top-0 z-50 border-b border-gray-200">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-full flex items-center justify-center shadow border-2 border-yellow-400 bg-yellow-50">
          <span className="text-xs font-black" style={{ color: "#1a237e" }}>NEU</span>
        </div>
        <div>
          <h1 className="text-sm font-bold leading-tight" style={{ color: "#1a237e" }}>New Era University</h1>
          <p className="text-xs text-gray-400 leading-tight">Library Visitor Log</p>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Role switcher — only for admins, just navigates, no state change */}
        {isAdmin && (
          <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1">
            <button
              onClick={() => navigate("/welcome")}
              className="text-xs font-medium px-3 py-1.5 rounded-full transition-all"
              style={!isOnAdmin ? { backgroundColor: "#00b4d8", color: "white" } : { color: "#6b7280" }}
            >
              👤 Visitor
            </button>
            <button
              onClick={() => navigate("/admin")}
              className="text-xs font-medium px-3 py-1.5 rounded-full transition-all"
              style={isOnAdmin ? { backgroundColor: "#1a237e", color: "white" } : { color: "#6b7280" }}
            >
              🛡️ Admin
            </button>
          </div>
        )}

        {/* Live clock */}
        <div className="hidden md:block text-right">
          <p className="text-xs text-gray-400">
            {time.toLocaleDateString("en-PH", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
          <p className="text-sm font-bold" style={{ color: "#1a237e" }}>
            {time.toLocaleTimeString("en-PH")}
          </p>
        </div>

        {/* Profile photo */}
        {user?.photoURL && (
          <img src={user.photoURL} alt="profile" className="w-8 h-8 rounded-full border border-gray-200 object-cover" />
        )}

        {/* Sign out */}
        <button
          onClick={async () => { await logout(); window.location.href = "/login"; }}
          className="text-xs font-medium px-3 py-1.5 rounded-full border border-gray-300 text-gray-600 hover:border-red-400 hover:text-red-500 transition-all"
        >
          Sign out
        </button>
      </div>
    </nav>
  );
}