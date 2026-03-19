import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const REASONS = ["Reading", "Researching", "Use of Computer", "Meeting", "Borrowing Books", "Returning Books", "Other"];

export default function Welcome() {
  const { user, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [checking, setChecking] = useState(true);
  const [saving, setSaving] = useState(false);

  // Check if RFID user
  const rfidUser = JSON.parse(sessionStorage.getItem("rfidUser") || "null");
  const activeUser = rfidUser || {
    uid: user?.uid,
    name: user?.displayName,
    email: user?.email,
    photoURL: user?.photoURL,
    program: userProfile?.program,
    college: userProfile?.college,
    type: userProfile?.type,
  };

  useEffect(() => {
    const checkBlock = async () => {
      const uid = rfidUser ? rfidUser.uid : user?.uid;
      if (!uid) { setChecking(false); return; }
      try {
        const ref = doc(db, "blocklist", uid);
        const snap = await getDoc(ref);
        if (snap.exists() && snap.data().blocked) setBlocked(true);
      } catch {
        // Error checking blocklist - continue anyway
      }
      setChecking(false);
    };
    checkBlock();
  }, [rfidUser, user]);

  const handleSubmit = async () => {
    if (!reason) return alert("Please select a reason.");
    setSaving(true);
    try {
      await addDoc(collection(db, "visits"), {
  uid: activeUser.uid || "rfid-unknown",
  name: activeUser.name || "Unknown",
  email: activeUser.email || "N/A",
  photoURL: activeUser.photoURL || "",
  program: activeUser.program || "N/A",
  college: activeUser.college || "N/A",
  type: activeUser.type || "student",
  reason,
  loginMethod: rfidUser ? "rfid" : "google",
  timestamp: serverTimestamp(),
  date: new Date().toISOString().split("T")[0],
});
      if (rfidUser) sessionStorage.removeItem("rfidUser");
      setSubmitted(true);
    } catch (err) {
      alert("Error: " + err.message);
    }
    setSaving(false);
  };

  if (checking) return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-500">Verifying access...</p>
    </div>
  );

  if (blocked) return (
    <div className="min-h-screen flex items-center justify-center bg-red-50">
      <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md text-center border border-red-200">
        <div className="text-5xl mb-4">🚫</div>
        <h2 className="text-xl font-bold text-red-700 mb-2">Access Restricted</h2>
        <p className="text-gray-600 mb-6">You are not allowed to use the NEU Library. Please contact the librarian.</p>
        <button onClick={() => { 
  sessionStorage.removeItem("rfidUser");
  setSubmitted(false);
  setReason("");
  if (!rfidUser) {
    navigate("/login");
  } else {
    navigate("/login");
  }
}}
          className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700">
          Sign Out
        </button>
      </div>
    </div>
  );

  if (submitted) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md text-center border-t-4" style={{ borderTopColor: '#f0a500' }}>
        {activeUser.photoURL ? (
          <img src={activeUser.photoURL} alt={activeUser.name} className="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-yellow-400" />
        ) : (
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold"
            style={{ backgroundColor: '#1a237e' }}>
            {activeUser.name?.charAt(0)}
          </div>
        )}
        <h2 className="text-2xl font-bold mb-1" style={{ color: '#1a237e' }}>Welcome to NEU Library!</h2>
        <p className="text-lg font-semibold text-gray-800">{activeUser.name}</p>
        <p className="text-sm text-gray-500 mb-1">{activeUser.program || activeUser.email}</p>
        <p className="text-sm font-medium mt-2" style={{ color: '#00b4d8' }}>📚 Purpose: {reason}</p>
        <p className="text-xs text-gray-400 mt-4">{new Date().toLocaleString()}</p>
        <div className="flex gap-3 justify-center mt-6">
          <button onClick={async () => { 
  sessionStorage.removeItem("rfidUser");
  if (!rfidUser && logout) await logout();
  navigate("/login"); 
}}
  className="text-white px-6 py-2 rounded-full text-sm shadow"
  style={{ backgroundColor: '#00b4d8' }}>
  Log Another Visit
</button>
          {userProfile?.role === "admin" && !rfidUser && (
            <button onClick={() => navigate("/admin")}
              className="text-white px-6 py-2 rounded-full text-sm shadow"
              style={{ backgroundColor: '#1a237e' }}>
              Admin Panel
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md border-t-4" style={{ borderTopColor: '#f0a500' }}>
        <div className="flex items-center gap-4 mb-6">
          {activeUser.photoURL ? (
            <img src={activeUser.photoURL} alt={activeUser.name} className="w-14 h-14 rounded-full border-2 border-yellow-400" />
          ) : (
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl"
              style={{ backgroundColor: '#1a237e' }}>
              {activeUser.name?.charAt(0)}
            </div>
          )}
          <div>
            <p className="font-bold text-gray-800 text-lg">{activeUser.name}</p>
            <p className="text-sm text-gray-500">{activeUser.email || activeUser.program || "NEU Student"}</p>
          </div>
        </div>

        <h2 className="text-xl font-bold mb-4" style={{ color: '#1a237e' }}>
          Why are you visiting the library today?
        </h2>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {REASONS.map(r => (
            <button key={r} onClick={() => setReason(r)}
              className={`py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all ${
                reason === r ? "bg-blue-50" : "border-gray-200 hover:border-blue-300 text-gray-600"}`}
              style={reason === r ? { borderColor: '#1a237e', color: '#1a237e' } : {}}>
              {r}
            </button>
          ))}
        </div>

        <button onClick={handleSubmit} disabled={!reason || saving}
          className="w-full text-white font-bold py-3 rounded-full transition-all disabled:opacity-50 shadow"
          style={{ backgroundColor: reason ? '#00b4d8' : '#9ca3af' }}>
          {saving ? "Logging visit..." : "Log My Visit"}
        </button>
      </div>
    </div>
  );
}