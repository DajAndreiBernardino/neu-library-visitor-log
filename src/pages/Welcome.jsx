import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";

const REASONS = [
  "Reading",
  "Researching",
  "Use of Computer",
  "Meeting",
  "Borrowing Books",
  "Returning Books",
  "Other",
];

export default function Welcome() {
  const { user, userProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [checking, setChecking] = useState(true);
  const [saving, setSaving] = useState(false);

  const rfidUser = JSON.parse(sessionStorage.getItem("rfidUser") || "null");
  const activeUser = rfidUser || {
    name: user?.displayName,
    email: user?.email,
    photoURL: user?.photoURL,
    program: userProfile?.program,
    college: userProfile?.college,
    type: userProfile?.type,
  };

  useEffect(() => {
    const checkBlock = async () => {
      if (rfidUser) { setChecking(false); return; }
      if (!user) { setChecking(false); return; }
      try {
        const snap = await getDoc(doc(db, "blocklist", user.uid));
        if (snap.exists() && snap.data().blocked) setBlocked(true);
      } catch (err) {
        console.error(err);
      }
      setChecking(false);
    };
    checkBlock();
  }, [user]);

  const handleSubmit = async () => {
    if (!reason) return;
    setSaving(true);
    try {
      await addDoc(collection(db, "visits"), {
        uid: rfidUser ? "rfid-" + (rfidUser.rfid || "unknown") : user?.uid,
        name: activeUser.name || "Unknown",
        email: activeUser.email || "N/A",
        photoURL: activeUser.photoURL || null,
        reason,
        college: activeUser.college || "N/A",
        program: activeUser.program || "N/A",
        type: activeUser.type || "student",
        source: rfidUser ? "rfid" : "google",
        timestamp: serverTimestamp(),
      });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert("Failed to log visit. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    sessionStorage.removeItem("rfidUser");
    if (user) await logout();
    navigate("/login");
  };

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div
          className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: "#00b4d8", borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  if (blocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-xl shadow-md p-10 text-center max-w-sm border border-gray-100">
          <p className="text-5xl mb-4">🚫</p>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Access Restricted</h2>
          <p className="text-gray-500 text-sm mb-6">Your account has been blocked. Please contact the librarian.</p>
          <button
            onClick={handleSignOut}
            className="px-5 py-2 rounded-full text-white text-sm font-medium bg-red-500 hover:bg-red-600 transition"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#f8f9fa" }}>
        <div className="bg-white rounded-xl shadow-md w-full max-w-md border border-gray-100 overflow-hidden text-center">
          <div className="h-2 w-full" style={{ backgroundColor: "#f0a500" }} />
          <div className="p-10">
            {activeUser.photoURL && (
              <img
                src={activeUser.photoURL}
                alt="profile"
                className="w-20 h-20 rounded-full border-4 border-yellow-400 mx-auto mb-4 object-cover shadow"
              />
            )}
            <div className="text-4xl mb-3">✅</div>
            <h2 className="text-xl font-bold mb-1" style={{ color: "#1a237e" }}>
              Welcome, {activeUser.name?.split(" ")[0]}!
            </h2>
            <p className="text-gray-500 text-sm mb-1">{activeUser.college}</p>
            <p className="text-gray-400 text-xs mb-5">{activeUser.program}</p>
            <div
              className="inline-block px-4 py-1.5 rounded-full text-white text-xs font-medium mb-6"
              style={{ backgroundColor: "#00b4d8" }}
            >
              {reason}
            </div>
            <p className="text-gray-400 text-xs mb-6">Your visit has been logged successfully.</p>
            <button
              onClick={handleSignOut}
              className="px-6 py-2.5 rounded-full text-white text-sm font-medium transition"
              style={{ backgroundColor: "#1a237e" }}
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "#f8f9fa" }}>
      <div className="bg-white rounded-xl shadow-md w-full max-w-md border border-gray-100 overflow-hidden">
        <div className="h-2 w-full" style={{ backgroundColor: "#f0a500" }} />
        <div className="px-8 pt-7 pb-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            {activeUser.photoURL ? (
              <img src={activeUser.photoURL} alt="profile" className="w-12 h-12 rounded-full border-2 border-yellow-400 object-cover shadow" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-xl">👤</div>
            )}
            <div>
              <p className="font-bold text-gray-800">Hello, {activeUser.name?.split(",")[0] || activeUser.name}!</p>
              <p className="text-xs text-gray-400">{activeUser.college}</p>
            </div>
          </div>

          <h2 className="text-base font-bold mb-1" style={{ color: "#1a237e" }}>Select your purpose of visit</h2>
          <p className="text-xs text-gray-400 mb-5">Choose a reason to complete check-in.</p>

          {/* Progress */}
          <div className="flex items-center gap-2 mb-6">
            {["Sign In", "Purpose", "Welcome"].map((step, i) => (
              <div key={step} className="flex items-center gap-2 flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                    style={i <= 1 ? { backgroundColor: "#00b4d8", color: "white" } : { backgroundColor: "#e5e7eb", color: "#9ca3af" }}
                  >
                    {i + 1}
                  </div>
                  <span className="text-xs mt-1" style={{ color: i <= 1 ? "#00b4d8" : "#9ca3af" }}>{step}</span>
                </div>
                {i < 2 && <div className="flex-1 h-px bg-gray-200 mb-4" />}
              </div>
            ))}
          </div>

          {/* Reason grid */}
          <div className="grid grid-cols-2 gap-2 mb-6">
            {REASONS.map((r) => {
              const icons = { "Reading": "📖", "Researching": "🔬", "Use of Computer": "💻", "Meeting": "👥", "Borrowing Books": "📚", "Returning Books": "↩️", "Other": "📝" };
              return (
                <button
                  key={r}
                  onClick={() => setReason(r)}
                  className="flex flex-col items-center gap-1.5 py-4 px-2 rounded-xl border-2 text-sm font-medium transition-all"
                  style={
                    reason === r
                      ? { borderColor: "#00b4d8", backgroundColor: "#e0f7fc", color: "#00b4d8" }
                      : { borderColor: "#e5e7eb", color: "#374151" }
                  }
                >
                  <span className="text-xl">{icons[r]}</span>
                  {r}
                </button>
              );
            })}
          </div>

          <button
            onClick={handleSubmit}
            disabled={!reason || saving}
            className="w-full py-3 rounded-full text-white font-semibold text-sm transition disabled:opacity-50"
            style={{ backgroundColor: "#00b4d8" }}
          >
            {saving ? "Logging visit..." : "Check In →"}
          </button>
        </div>
      </div>
    </div>
  );
}