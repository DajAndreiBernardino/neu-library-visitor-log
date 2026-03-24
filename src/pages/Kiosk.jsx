import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, query, where, getDocs, doc, getDoc, addDoc, serverTimestamp } from "firebase/firestore";

const REASONS = [
  "Reading",
  "Researching",
  "Use of Computer",
  "Meeting",
  "Borrowing Books",
  "Returning Books",
  "Other",
];

export default function Kiosk() {
  const [step, setStep] = useState("rfid"); // rfid → reason → done
  const [rfid, setRfid] = useState("");
  const [rfidError, setRfidError] = useState("");
  const [rfidLoading, setRfidLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (step === "done") {
      const timer = setTimeout(() => reset(), 5000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const reset = () => {
    setRfid("");
    setRfidError("");
    setUserData(null);
    setReason("");
    setStep("rfid");
  };

  const handleRFID = async () => {
    if (!rfid.trim()) {
      setRfidError("Please enter or scan your RFID number.");
      return;
    }
    setRfidLoading(true);
    setRfidError("");
    try {
      const q = query(collection(db, "users"), where("rfid", "==", rfid.trim()));
      const snap = await getDocs(q);

      if (snap.empty) {
        setRfidError("RFID not found. Please contact the librarian.");
        setRfidLoading(false);
        return;
      }

      const data = snap.docs[0].data();
      const uid = snap.docs[0].id;

      const blockSnap = await getDoc(doc(db, "blocklist", uid));
      if (blockSnap.exists() && blockSnap.data().blocked) {
        setRfidError("🚫 Access restricted. Please contact the librarian.");
        setRfidLoading(false);
        return;
      }

      setUserData({ ...data, uid });
      setStep("reason");
    } catch (err) {
      setRfidError("Error looking up RFID. Please try again.");
      console.error(err);
    } finally {
      setRfidLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!reason) return;
    setSaving(true);
    try {
      await addDoc(collection(db, "visits"), {
        uid: "rfid-" + (userData.rfid || userData.uid || "unknown"),
        name: userData.name || "Unknown",
        email: userData.email || "N/A",
        photoURL: userData.photoURL || null,
        reason,
        college: userData.college || "N/A",
        program: userData.program || "N/A",
        type: userData.type || "student",
        source: "kiosk",
        timestamp: serverTimestamp(),
      });
      setStep("done");
    } catch (err) {
      alert("Failed to log visit. Please try again.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const REASON_ICONS = { "Reading": "📖", "Researching": "🔬", "Use of Computer": "💻", "Meeting": "👥", "Borrowing Books": "📚", "Returning Books": "↩️", "Other": "📝" };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "linear-gradient(135deg, #0d1b5e 0%, #1a237e 50%, #0d2b60 100%)" }}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full border-2 border-yellow-400 bg-yellow-50 flex items-center justify-center font-black text-sm" style={{ color: "#1a237e" }}>
            NEU
          </div>
          <div>
            <p className="text-white font-bold text-sm">New Era University</p>
            <p className="text-white/50 text-xs">Library Visitor Log — Kiosk</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-white/60 text-xs">
            {time.toLocaleDateString("en-PH", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
          <p className="text-white font-bold text-lg tabular-nums">
            {time.toLocaleTimeString("en-PH")}
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
          <div className="h-2 w-full" style={{ backgroundColor: "#f0a500" }} />

          {/* RFID Step */}
          {step === "rfid" && (
            <div className="px-8 py-8 text-center">
              <div className="text-5xl mb-4">📟</div>
              <h2 className="text-xl font-bold mb-1" style={{ color: "#1a237e" }}>RFID Check-In</h2>
              <p className="text-gray-400 text-sm mb-6">Scan or type your RFID number to continue.</p>
              <input
                type="text"
                value={rfid}
                onChange={(e) => setRfid(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleRFID()}
                placeholder="Enter RFID number..."
                autoFocus
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-center text-lg font-mono focus:outline-none focus:border-cyan-400 mb-2"
              />
              {rfidError && <p className="text-red-500 text-sm mb-3">{rfidError}</p>}
              <button
                onClick={handleRFID}
                disabled={rfidLoading}
                className="w-full py-3 rounded-xl text-white font-bold text-sm transition disabled:opacity-60 mt-2"
                style={{ backgroundColor: "#00b4d8" }}
              >
                {rfidLoading ? "Checking..." : "Continue →"}
              </button>
              <div className="border-t border-gray-100 mt-6 pt-4">
                <a href="/login" className="text-xs text-gray-400 hover:text-cyan-500 transition">
                  ← Back to Google Login
                </a>
              </div>
            </div>
          )}

          {/* Reason Step */}
          {step === "reason" && userData && (
            <div className="px-8 py-8">
              <div className="flex items-center gap-3 mb-5">
                {userData.photoURL ? (
                  <img src={userData.photoURL} alt="profile" className="w-12 h-12 rounded-full border-2 border-yellow-400 object-cover shadow" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center text-xl">👤</div>
                )}
                <div>
                  <p className="font-bold text-gray-800">{userData.name}</p>
                  <p className="text-xs text-gray-400">{userData.college}</p>
                </div>
              </div>

              <h2 className="text-base font-bold mb-4" style={{ color: "#1a237e" }}>Select purpose of visit</h2>

              <div className="grid grid-cols-2 gap-2 mb-5">
                {REASONS.map((r) => (
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
                    <span className="text-xl">{REASON_ICONS[r]}</span>
                    {r}
                  </button>
                ))}
              </div>

              <button
                onClick={handleSubmit}
                disabled={!reason || saving}
                className="w-full py-3 rounded-xl text-white font-bold text-sm transition disabled:opacity-50"
                style={{ backgroundColor: "#00b4d8" }}
              >
                {saving ? "Logging visit..." : "Check In →"}
              </button>
              <button onClick={reset} className="w-full mt-2 text-xs text-gray-400 hover:text-red-400 transition py-2">
                Cancel
              </button>
            </div>
          )}

          {/* Done Step */}
          {step === "done" && userData && (
            <div className="px-8 py-10 text-center">
              {userData.photoURL && (
                <img src={userData.photoURL} alt="profile" className="w-20 h-20 rounded-full border-4 border-yellow-400 mx-auto mb-4 object-cover shadow" />
              )}
              <div className="text-4xl mb-3">✅</div>
              <h2 className="text-xl font-bold mb-1" style={{ color: "#1a237e" }}>
                Welcome, {userData.name?.split(" ")[0]}!
              </h2>
              <p className="text-gray-400 text-sm mb-2">{userData.college}</p>
              <div
                className="inline-block px-4 py-1.5 rounded-full text-white text-xs font-medium mb-5"
                style={{ backgroundColor: "#00b4d8" }}
              >
                {reason}
              </div>
              <p className="text-gray-400 text-xs">Visit logged. This screen resets in 5 seconds.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}