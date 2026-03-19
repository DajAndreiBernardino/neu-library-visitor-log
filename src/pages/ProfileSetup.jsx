import { useState } from "react";
import { useAuth } from "../context/useAuth";
import { db } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const NEU_COLLEGES = [
  "College of Accountancy",
  "College of Agriculture",
  "College of Arts and Science",
  "College of Business Administration",
  "College of Communication",
  "College of Informatics and Computing Studies",
  "College of Criminology",
  "College of Education",
  "College of Engineering and Architecture",
  "College of Medical Technology",
  "College of Midwifery",
  "College of Music",
  "College of Nursing",
  "College of Physical Therapy",
  "College of Respiratory Therapy",
  "School of International Relations",
  "College of Law",
  "College of Medicine",
  "School of Graduate Studies",
  "Integrated School",
  "Expanded Tertiary Education Equivalency & Accreditation Program (ETEEAP)",
  "Alternative Learning System",
];

const PROGRAMS_BY_COLLEGE = {
  "College of Accountancy": ["BS Accountancy", "BS Management Accounting"],
  "College of Agriculture": ["BS Agriculture", "BS Agricultural Business"],
  "College of Arts and Science": ["BS Biology", "BS Psychology", "AB Communication", "BS Mathematics"],
  "College of Business Administration": ["BS Business Administration", "BS Marketing Management", "BS Financial Management", "BS Human Resource Management"],
  "College of Communication": ["AB Communication", "BS Broadcasting"],
  "College of Informatics and Computing Studies": ["BS Information Technology", "BS Computer Science", "BS Information Systems"],
  "College of Criminology": ["BS Criminology"],
  "College of Education": ["Bachelor of Elementary Education", "Bachelor of Secondary Education", "Bachelor of Physical Education"],
  "College of Engineering and Architecture": ["BS Civil Engineering", "BS Electrical Engineering", "BS Electronics Engineering", "BS Architecture"],
  "College of Medical Technology": ["BS Medical Technology"],
  "College of Midwifery": ["BS Midwifery"],
  "College of Music": ["Bachelor of Music"],
  "College of Nursing": ["BS Nursing"],
  "College of Physical Therapy": ["BS Physical Therapy"],
  "College of Respiratory Therapy": ["BS Respiratory Therapy"],
  "School of International Relations": ["BS International Relations"],
  "College of Law": ["Juris Doctor"],
  "College of Medicine": ["Doctor of Medicine"],
  "School of Graduate Studies": ["Master of Arts", "Master of Science", "Doctor of Philosophy"],
  "Integrated School": ["Junior High School", "Senior High School"],
  "Expanded Tertiary Education Equivalency & Accreditation Program (ETEEAP)": ["ETEEAP"],
  "Alternative Learning System": ["ALS"],
};

export default function ProfileSetup() {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const [college, setCollege] = useState("");
  const [program, setProgram] = useState("");
  const [type, setType] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!college || !program || !type) {
      return setError("Please fill in all fields.");
    }
    setSaving(true);
    try {
      const ref = doc(db, "users", user.uid);
      await updateDoc(ref, { college, program, type });
      // Redirect based on role
      if (userProfile?.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/welcome");
      }
    } catch (err) {
      setError("Error saving profile: " + err.message);
    }
    setSaving(false);
  };

  const programs = college ? (PROGRAMS_BY_COLLEGE[college] || []) : [];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-xl shadow-md w-full max-w-md overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="h-2 w-full" style={{ backgroundColor: '#f0a500' }}></div>
        <div className="px-8 pt-7 pb-5 text-center border-b border-gray-100">
          <div className="w-16 h-16 rounded-full border-4 border-yellow-400 bg-yellow-50 flex items-center justify-center mx-auto mb-3 shadow font-black text-blue-900 text-base">
            NEU
          </div>
          <h2 className="text-lg font-bold text-gray-800">Complete Your Profile</h2>
          <p className="text-gray-400 text-xs mt-1">This helps us track visitor statistics accurately</p>
        </div>

        <div className="px-8 py-7 space-y-4">
          {/* User info */}
          <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
            <img src={user?.photoURL} alt={user?.displayName} className="w-10 h-10 rounded-full border-2 border-yellow-400" />
            <div>
              <p className="font-semibold text-gray-800 text-sm">{user?.displayName}</p>
              <p className="text-xs text-gray-400">{user?.email}</p>
            </div>
          </div>

          {/* Type */}
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">I am a...</label>
            <div className="grid grid-cols-3 gap-2">
              {["student", "faculty", "staff"].map(t => (
                <button key={t} onClick={() => setType(t)}
                  className={`py-2 px-3 rounded-lg border-2 text-sm font-medium capitalize transition-all ${type === t ? "text-white" : "border-gray-200 text-gray-600 hover:border-blue-300"}`}
                  style={type === t ? { backgroundColor: '#1a237e', borderColor: '#1a237e' } : {}}>
                  {t === "student" ? "🎓 Student" : t === "faculty" ? "👨‍🏫 Faculty" : "💼 Staff"}
                </button>
              ))}
            </div>
          </div>

          {/* College */}
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">College / School</label>
            <select value={college} onChange={e => { setCollege(e.target.value); setProgram(""); }}
              className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none transition-all"
              style={{ focusBorderColor: '#00b4d8' }}>
              <option value="">Select college...</option>
              {NEU_COLLEGES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Program */}
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Program</label>
            <select value={program} onChange={e => setProgram(e.target.value)}
              disabled={!college}
              className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none transition-all disabled:bg-gray-50 disabled:text-gray-400">
              <option value="">Select program...</option>
              {programs.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            {!college && <p className="text-xs text-gray-400 mt-1">Select a college first</p>}
          </div>

          {error && <p className="text-red-500 text-xs text-center">{error}</p>}

          <button onClick={handleSave} disabled={saving}
            className="w-full text-white font-bold py-3 rounded-full transition-all disabled:opacity-60 shadow"
            style={{ backgroundColor: '#00b4d8' }}>
            {saving ? "Saving..." : "Save & Continue →"}
          </button>
        </div>
      </div>
    </div>
  );
}