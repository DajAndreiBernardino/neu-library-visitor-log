import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";

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
];

const PROGRAMS_BY_COLLEGE = {
  "College of Accountancy": ["BS Accountancy", "BS Management Accounting"],
  "College of Agriculture": ["BS Agriculture", "BS Agricultural Business"],
  "College of Arts and Science": ["BS Biology", "BS Psychology", "AB Communication", "BS Mathematics"],
  "College of Business Administration": ["BS Business Administration", "BS Marketing Management", "BS Financial Management", "BS Human Resource Management"],
  "College of Communication": ["AB Communication", "BS Broadcasting"],
  "College of Informatics and Computing Studies": ["BS Information Technology", "BS Computer Science", "BS Information Systems", "Bachelor of Library and Information Science"],
  "College of Criminology": ["BS Criminology"],
  "College of Education": ["Bachelor of Elementary Education", "Bachelor of Secondary Education", "Bachelor of Physical Education"],
  "College of Engineering and Architecture": ["BS Civil Engineering", "BS Electrical Engineering", "BS Electronics Engineering", "BS Architecture"],
  "College of Medical Technology": ["BS Medical Technology"],
  "College of Midwifery": ["BS Midwifery"],
  "College of Music": ["BS Music"],
  "College of Nursing": ["BS Nursing"],
  "College of Physical Therapy": ["BS Physical Therapy"],
  "College of Respiratory Therapy": ["BS Respiratory Therapy"],
  "School of International Relations": ["BS International Relations"],
  "College of Law": ["Bachelor of Laws (LLB)"],
  "College of Medicine": ["Doctor of Medicine (MD)"],
  "School of Graduate Studies": ["Master of Arts", "Master of Science", "Doctor of Philosophy"],
  "Integrated School": ["K-12 / SHS"],
};

const YEAR_LEVELS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year", "Graduate", "N/A"];

export default function ProfileSetup() {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();

  const [type, setType] = useState("student");
  const [college, setCollege] = useState("");
  const [collegeSearch, setCollegeSearch] = useState("");
  const [showCollegeList, setShowCollegeList] = useState(false);
  const [program, setProgram] = useState("");
  const [yearLevel, setYearLevel] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const collegeRef = useRef(null);

  const filteredColleges = NEU_COLLEGES.filter((c) =>
    c.toLowerCase().includes(collegeSearch.toLowerCase())
  );

  const handleCollegeSelect = (c) => {
    setCollege(c);
    setCollegeSearch(c);
    setProgram("");
    setShowCollegeList(false);
  };

  const handleSubmit = async () => {
    if (!college || !program) {
      setError("Please fill in all required fields.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await updateDoc(doc(db, "users", user.uid), {
        type,
        college,
        program,
        yearLevel: type === "student" ? yearLevel : "N/A",
        name: userProfile?.name || user.displayName,
      });
      navigate("/welcome");
    } catch (err) {
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#f8f9fa" }}>
      <div className="bg-white shadow-sm px-6 py-3 flex items-center gap-3 border-b border-gray-200">
        <div
          className="w-11 h-11 rounded-full border-2 border-yellow-400 bg-yellow-50 flex items-center justify-center shadow font-black text-xs"
          style={{ color: "#1a237e" }}
        >
          NEU
        </div>
        <p className="text-lg font-bold" style={{ color: "#1a237e" }}>
          Library Visitor Log
        </p>
      </div>

      <div className="flex-1 flex items-start justify-center px-4 py-10">
        <div className="bg-white rounded-xl shadow-md w-full max-w-md border border-gray-100 overflow-hidden">
          <div className="h-2 w-full" style={{ backgroundColor: "#f0a500" }} />

          <div className="px-8 pt-7 pb-2">
            {/* Profile photo */}
            <div className="flex items-center gap-4 mb-6">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="profile" className="w-14 h-14 rounded-full border-2 border-yellow-400 object-cover shadow" />
              ) : (
                <div className="w-14 h-14 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center text-xl">👤</div>
              )}
              <div>
                <p className="font-semibold text-gray-800">{user?.displayName}</p>
                <p className="text-xs text-gray-400">{user?.email}</p>
              </div>
            </div>

            <h2 className="text-lg font-bold mb-1" style={{ color: "#1a237e" }}>Complete your profile</h2>
            <p className="text-xs text-gray-400 mb-5">This will be used for all your library visit logs.</p>

            {/* Type */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-600 mb-2">I am a...</label>
              <div className="flex gap-2">
                {["student", "faculty", "staff"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    className="flex-1 py-2 rounded-lg text-sm font-medium border transition-all capitalize"
                    style={
                      type === t
                        ? { backgroundColor: "#1a237e", color: "white", borderColor: "#1a237e" }
                        : { borderColor: "#e5e7eb", color: "#6b7280" }
                    }
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* College */}
            <div className="mb-4 relative" ref={collegeRef}>
              <label className="block text-xs font-semibold text-gray-600 mb-2">College / Department *</label>
              <input
                type="text"
                value={collegeSearch}
                onChange={(e) => { setCollegeSearch(e.target.value); setShowCollegeList(true); }}
                onFocus={() => setShowCollegeList(true)}
                placeholder="Search college..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-cyan-400"
              />
              {showCollegeList && filteredColleges.length > 0 && (
                <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
                  {filteredColleges.map((c) => (
                    <button
                      key={c}
                      onClick={() => handleCollegeSelect(c)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition"
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Program */}
            {college && (
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-600 mb-2">Program *</label>
                <select
                  value={program}
                  onChange={(e) => setProgram(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-cyan-400 bg-white"
                >
                  <option value="">Select program</option>
                  {(PROGRAMS_BY_COLLEGE[college] || []).map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Year Level — students only */}
            {type === "student" && (
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-600 mb-2">Year Level</label>
                <select
                  value={yearLevel}
                  onChange={(e) => setYearLevel(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-cyan-400 bg-white"
                >
                  <option value="">Select year level</option>
                  {YEAR_LEVELS.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            )}

            {error && <p className="text-red-500 text-xs mb-3">{error}</p>}

            <button
              onClick={handleSubmit}
              disabled={saving}
              className="w-full py-3 rounded-lg text-white font-semibold text-sm transition mb-6 disabled:opacity-60"
              style={{ backgroundColor: "#00b4d8" }}
            >
              {saving ? "Saving..." : "Complete Registration →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}