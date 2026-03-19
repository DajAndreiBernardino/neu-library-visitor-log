import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const REASONS = ["Reading", "Researching", "Use of Computer", "Meeting", "Borrowing Books", "Returning Books", "Other"];

export default function WelcomeRFID() {
  const navigate = useNavigate();
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("rfidUser");
    if (!stored) { navigate("/login"); return; }
    setUserData(JSON.parse(stored));
  }, []);

  const handleSubmit = async () => {
    if (!reason) return alert("Please select a reason.");
    setSaving(true);
    setError("");
    try {
      await addDoc(collection(db, "visits"), {
        uid: userData.uid || "rfid-" + userData.rfid,
        name: userData.name,
        email: userData.email || "RFID User",
        photoURL: userData.photoURL || "",
        program: userData.program || "N/A",
        college: userData.college || "N/A",
        type: userData.type || "student",
        reason,
        loginMethod: "rfid",
        timestamp: serverTimestamp(),
        date: new Date().toISOString().split("T")[0],
      });
      sessionStorage.removeItem("rfidUser");
      setSubmitted(true);
    } catch (err) {
      setError("Failed to log visit: " + err.message);
    }
    setSaving(false);
  };

  if (!userData) return null;

  if (submitted) return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f8f9fa' }}>
      {/* Navbar */}
      <nav className="bg-white shadow-sm px-6 py-3 flex items-center border-b border-gray-200">
        <div className="w-11 h-11 rounded-full border-2 border-yellow-400 bg-yellow-50 flex items-center justify-center font-black text-blue-900 text-xs shadow mr-3">NEU</div>
        <div>
          <p className="font-bold text-sm" style={{ color: '#1a237e' }}>New Era University</p>
          <p className="text-xs text-gray-400">Library Visitor Log</p>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md text-center border-t-4" style={{ borderTopColor: '#f0a500' }}>
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold"
            style={{ backgroundColor: '#1a237e' }}>
            {userData.name?.charAt(0)}
          </div>
          <h2 className="text-2xl font-bold mb-1" style={{ color: '#1a237e' }}>Welcome to NEU Library!</h2>
          <p className="text-lg font-semibold text-gray-800">{userData.name}</p>
          <p className="text-sm text-gray-500 mb-1">{userData.program || "N/A"}</p>
          <p className="text-sm font-medium mt-2" style={{ color: '#00b4d8' }}>📚 Purpose: {reason}</p>
          <p className="text-xs text-gray-400 mt-4">{new Date().toLocaleString()}</p>
          <button onClick={() => navigate("/login")}
            className="mt-6 text-white px-6 py-2 rounded-full text-sm shadow"
            style={{ backgroundColor: '#00b4d8' }}>
            Done
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f8f9fa' }}>
      {/* Navbar */}
      <nav className="bg-white shadow-sm px-6 py-3 flex items-center border-b border-gray-200">
        <div className="w-11 h-11 rounded-full border-2 border-yellow-400 bg-yellow-50 flex items-center justify-center font-black text-blue-900 text-xs shadow mr-3">NEU</div>
        <div>
          <p className="font-bold text-sm" style={{ color: '#1a237e' }}>New Era University</p>
          <p className="text-xs text-gray-400">Library Visitor Log</p>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md border-t-4" style={{ borderTopColor: '#f0a500' }}>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl shadow"
              style={{ backgroundColor: '#1a237e' }}>
              {userData.name?.charAt(0)}
            </div>
            <div>
              <p className="font-bold text-gray-800 text-lg">{userData.name}</p>
              <p className="text-sm text-gray-500">💳 RFID Login • {userData.program || "N/A"}</p>
            </div>
          </div>

          <h2 className="text-xl font-bold mb-4" style={{ color: '#1a237e' }}>Why are you visiting today?</h2>

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

          {error && <p className="text-red-500 text-xs text-center mb-3">{error}</p>}

          <button onClick={handleSubmit} disabled={!reason || saving}
            className="w-full text-white font-bold py-3 rounded-full transition-all disabled:opacity-50 shadow"
            style={{ backgroundColor: reason ? '#00b4d8' : '#9ca3af' }}>
            {saving ? "Logging visit..." : "Log My Visit"}
          </button>
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