import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

export default function Login() {
  const { signInWithGoogle, user } = useAuth();
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (user) navigate("/welcome");
  }, [user]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithGoogle();
      const u = result.user;
      const snap = await getDoc(doc(db, "users", u.uid));
      const data = snap.exists() ? snap.data() : null;
      if (!data?.program) {
        navigate("/profile-setup");
        return;
      }
      data.role === "admin" ? navigate("/admin") : navigate("/welcome");
    } catch (err) {
      if (
        err.code !== "auth/cancelled-popup-request" &&
        err.code !== "auth/popup-closed-by-user"
      ) {
        alert("Login failed: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#f8f9fa" }}>
      {/* Navbar */}
      <div className="bg-white shadow-sm px-6 py-3 flex items-center gap-3 border-b border-gray-200">
        <div
          className="w-11 h-11 rounded-full border-2 border-yellow-400 bg-yellow-50 flex items-center justify-center shadow font-black text-xs"
          style={{ color: "#1a237e" }}
        >
          NEU
        </div>
        <p className="text-lg font-bold" style={{ color: "#1a237e" }}>
          New Era University
        </p>
        <div className="ml-auto text-right">
          <p className="text-xs text-gray-400">
            {time.toLocaleDateString("en-PH", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
          <p className="text-sm font-bold" style={{ color: "#1a237e" }}>
            {time.toLocaleTimeString("en-PH")}
          </p>
        </div>
      </div>

      {/* Card */}
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="bg-white rounded-xl shadow-md w-full max-w-md overflow-hidden border border-gray-100">
          <div className="h-2 w-full" style={{ backgroundColor: "#f0a500" }} />

          <div className="px-8 pt-7 pb-5 text-center">
            <div
              className="w-16 h-16 rounded-full border-4 border-yellow-400 bg-yellow-50 flex items-center justify-center mx-auto mb-4 shadow font-black text-lg"
              style={{ color: "#1a237e" }}
            >
              NEU
            </div>
            <h2 className="text-xl font-bold mb-1" style={{ color: "#1a237e" }}>
              Library Visitor Log
            </h2>
            <p className="text-gray-400 text-sm">Sign in with your NEU account to continue</p>
          </div>

          <div className="px-8 pb-8 space-y-3">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition font-medium text-gray-700 shadow-sm disabled:opacity-60"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {loading ? "Signing in..." : "Continue with Google"}
            </button>

            <p className="text-center text-xs text-gray-400 pt-2">
              Use your <span className="font-semibold">@neu.edu.ph</span> account
            </p>

            <div className="border-t border-gray-100 pt-4 text-center">
              <a
                href="/kiosk"
                className="text-xs text-gray-400 hover:text-cyan-500 transition"
              >
                📟 RFID Kiosk Mode →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}