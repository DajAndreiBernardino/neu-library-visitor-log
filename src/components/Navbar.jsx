import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
  const { user, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user || location.pathname === "/login") return null;

  const isAdmin = userProfile?.role === "admin";
  const isOnAdmin = location.pathname === "/admin";

  return (
    <nav className="bg-white shadow-sm px-6 py-3 flex items-center justify-between sticky top-0 z-50 border-b border-gray-200">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-full flex items-center justify-center shadow border-2 border-yellow-400 bg-yellow-50">
          <span className="text-xs font-black text-blue-900">NEU</span>
        </div>
        <div>
          <h1 className="text-lg font-bold" style={{ color: '#1a237e' }}>New Era University</h1>
          <p className="text-xs text-gray-400">Library Visitor Log</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {isAdmin && (
          <>
            <button
              onClick={() => navigate("/welcome")}
              className={`text-sm font-medium px-4 py-1.5 rounded-full transition-all border ${
                !isOnAdmin 
                  ? "text-white border-transparent" 
                  : "text-gray-600 border-gray-300 hover:border-cyan-400"}`}
              style={!isOnAdmin ? { backgroundColor: '#00b4d8' } : {}}>
              👤 User View
            </button>
            <button
              onClick={() => navigate("/admin")}
              className={`text-sm font-medium px-4 py-1.5 rounded-full transition-all border ${
                isOnAdmin 
                  ? "text-white border-transparent" 
                  : "text-gray-600 border-gray-300 hover:border-blue-400"}`}
              style={isOnAdmin ? { backgroundColor: '#1a237e' } : {}}>
              🛡️ Admin View
            </button>
          </>
        )}

        <div className="flex items-center gap-2 ml-2">
          <img src={user.photoURL} alt={user.displayName} className="w-9 h-9 rounded-full border-2 border-yellow-400" />
          <span className="text-sm font-medium text-gray-700 hidden md:block">{user.displayName}</span>
          {isAdmin && (
            <span className="text-xs px-2 py-0.5 rounded-full text-white hidden md:block" style={{ backgroundColor: '#1a237e' }}>
              Admin
            </span>
          )}
        </div>
        <button onClick={logout} className="text-sm text-gray-400 hover:text-red-500 transition-colors">
          Sign out
        </button>
      </div>
    </nav>
  );
}