import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function Login() {
  const { signInWithGoogle, user } = useAuth();
  const navigate = useNavigate();
  const [rfid, setRfid] = useState("");
  const [rfidError, setRfidError] = useState("");
  const [rfidLoading, setRfidLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("google");

  useEffect(() => { if (user) navigate("/welcome"); }, [user, navigate]);

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithGoogle();
      const { getFirestore, doc, getDoc } = await import("firebase/firestore");
      const db = getFirestore();
      const ref = doc(db, "users", result.user.uid);
      const snap = await getDoc(ref);
      const data = snap.exists() ? snap.data() : {};
      if (!data?.program) {
        navigate("/profile-setup");
        return;
      }
      if (data?.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/welcome");
      }
    } catch (err) {
      alert("Login failed: " + err.message);
    }
  };

  const handleRFID = async () => {
    if (!rfid.trim()) return setRfidError("Please enter or scan your RFID number.");
    setRfidLoading(true);
    setRfidError("");
    try {
      const q = query(collection(db, "users"), where("rfid", "==", rfid.trim()));
      const snap = await getDocs(q);
      if (snap.empty) {
        setRfidError("RFID not found. Please use Google login or contact the librarian.");
        setRfidLoading(false);
        return;
      }
      const userData = snap.docs[0].data();
      sessionStorage.setItem("rfidUser", JSON.stringify(userData));
      navigate("/welcome");
    } catch (err) {
      setRfidError("Error: " + err.message);
    }
    setRfidLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f8f9fa' }}>
      {/* White navbar */}
      <div className="bg-white shadow-sm px-6 py-3 flex items-center gap-3 border-b border-gray-200">
        <div className="w-11 h-11 rounded-full border-2 border-yellow-400 bg-yellow-50 flex items-center justify-center shadow">
          <span className="text-xs font-black text-blue-900">NEU</span>
        </div>
        <h1 className="text-lg font-bold" style={{ color: '#1a237e' }}>New Era University</h1>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="bg-white rounded-xl shadow-md w-full max-w-md overflow-hidden border border-gray-100">
          <div className="h-2 w-full" style={{ backgroundColor: '#f0a500' }}></div>
          <div className="px-8 pt-7 pb-5 text-center border-b border-gray-100">
            <div className="w-16 h-16 rounded-full border-4 border-yellow-400 bg-yellow-50 flex items-center justify-center mx-auto mb-3 shadow font-black text-blue-900 text-base">
              NEU
            </div>
            <h2 className="text-lg font-bold text-gray-800">Library Visitor Log</h2>
            <p className="text-gray-400 text-xs mt-1">Sign in to log your visit</p>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button onClick={() => setActiveTab("google")}
              className={`flex-1 py-3 text-sm font-medium transition-all ${activeTab === "google" ? "border-b-2" : "text-gray-400"}`}
              style={activeTab === "google" ? { borderBottomColor: '#00b4d8', color: '#1a237e' } : {}}>
              📧 Google Login
            </button>
            <button onClick={() => setActiveTab("rfid")}
              className={`flex-1 py-3 text-sm font-medium transition-all ${activeTab === "rfid" ? "border-b-2" : "text-gray-400"}`}
              style={activeTab === "rfid" ? { borderBottomColor: '#00b4d8', color: '#1a237e' } : {}}>
              💳 RFID Login
            </button>
          </div>

          <div className="px-8 py-7">
            {activeTab === "google" ? (
              <>
                <p className="text-center text-gray-500 text-sm mb-5">Use your NEU institutional email to sign in</p>
                <button onClick={handleGoogleLogin}
                  className="w-full flex items-center justify-center gap-3 border-2 border-gray-200 hover:border-cyan-400 text-gray-700 font-semibold py-3 px-6 rounded-full transition-all shadow-sm hover:shadow-md">
                  <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                  Sign in with Google
                </button>
              </>
            ) : (
              <>
                <p className="text-center text-gray-500 text-sm mb-5">Scan your ID card or enter your student/employee number</p>
                <input
                  type="text"
                  value={rfid}
                  onChange={e => setRfid(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleRFID()}
                  placeholder="e.g. 23-11472-452"
                  autoFocus
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm focus:outline-none transition-all mb-3"
                />
                {rfidError && <p className="text-red-500 text-xs mb-3 text-center">{rfidError}</p>}
                <button onClick={handleRFID} disabled={rfidLoading}
                  className="w-full text-white font-bold py-3 rounded-full transition-all disabled:opacity-60 shadow"
                  style={{ backgroundColor: '#00b4d8' }}>
                  {rfidLoading ? "Looking up..." : "Log In with RFID"}
                </button>
                <p className="text-xs text-center text-gray-400 mt-4">
                  Not registered? Contact the librarian.
                </p>
              </>
            )}
          </div>

          <div className="px-8 py-3 bg-gray-50 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400">© 2026 New Era University Library. All rights reserved.</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4" style={{ backgroundColor: '#111827' }}>
        <div className="flex items-center gap-6 text-xs text-gray-400">
          <span>📍 9 Central Ave, New Era, Quezon City</span>
          <span>✉️ info@neu.edu.ph</span>
          <span>📞 (02) 8981 4221</span>
        </div>
      </div>
    </div>
  );
}