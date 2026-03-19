import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs, doc, setDoc, deleteDoc, query, orderBy } from "firebase/firestore";
import { format, isWithinInterval, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function AdminDashboard() {
  const [visits, setVisits] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [filterReason, setFilterReason] = useState("");
  const [filterCollege, setFilterCollege] = useState("");
  const [filterType, setFilterType] = useState("");
  const [dateRange, setDateRange] = useState("today");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [blocklist, setBlocklist] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const [vSnap, uSnap, bSnap] = await Promise.all([
        getDocs(query(collection(db, "visits"), orderBy("timestamp", "desc"))),
        getDocs(collection(db, "users")),
        getDocs(collection(db, "blocklist")),
      ]);
      setVisits(vSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setUsers(uSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setBlocklist(bSnap.docs.map(d => d.id));
      setLoading(false);
    };
    fetchData();
  }, []);

  const getDateFilter = () => {
    const now = new Date();
    if (dateRange === "today") return { start: startOfDay(now), end: endOfDay(now) };
    if (dateRange === "week") return { start: startOfWeek(now), end: endOfWeek(now) };
    if (dateRange === "month") return { start: startOfMonth(now), end: endOfMonth(now) };
    if (dateRange === "custom" && startDate && endDate)
      return { start: startOfDay(new Date(startDate)), end: endOfDay(new Date(endDate)) };
    return null;
  };

  const filteredVisits = visits.filter(v => {
    const range = getDateFilter();
    if (range && v.timestamp) {
      const ts = v.timestamp.toDate ? v.timestamp.toDate() : new Date(v.timestamp);
      if (!isWithinInterval(ts, range)) return false;
    }
    if (filterReason && v.reason !== filterReason) return false;
    if (filterCollege && v.college !== filterCollege) return false;
    if (filterType) {
     if (filterType === "employee") {
      if (v.type !== "faculty" && v.type !== "staff") return false;
    } else {
      if (v.type !== filterType) return false;
  }
}
    if (search) {
      const q = search.toLowerCase();
      if (!v.name?.toLowerCase().includes(q) && !v.program?.toLowerCase().includes(q) && !v.reason?.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const stats = {
    total: filteredVisits.length,
    students: filteredVisits.filter(v => v.type === "student").length,
    faculty: filteredVisits.filter(v => v.type === "faculty").length,
    staff: filteredVisits.filter(v => v.type === "staff").length,
  };

  const reasons = [
  "Reading",
  "Researching",
  "Use of Computer",
  "Meeting",
  "Borrowing Books",
  "Returning Books",
  "Other",
];
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

const colleges = [...new Set([
  ...NEU_COLLEGES,
  ...visits.map(v => v.college).filter(c => c && c !== "N/A")
])];

  const toggleBlock = async (userId, currentlyBlocked) => {
    const ref = doc(db, "blocklist", userId);
    if (currentlyBlocked) {
      await deleteDoc(ref);
      setBlocklist(prev => prev.filter(id => id !== userId));
    } else {
      await setDoc(ref, { blocked: true, blockedAt: new Date() });
      setBlocklist(prev => [...prev, userId]);
    }
    alert(currentlyBlocked ? "User unblocked." : "User blocked.");
  };

  const exportPDF = () => {
    const docPDF = new jsPDF();
    docPDF.setFontSize(16);
    docPDF.setTextColor(17, 101, 48);
    docPDF.text("NEU Library Visitor Log", 14, 15);
    docPDF.setFontSize(10);
    docPDF.setTextColor(100);
    docPDF.text(`Generated: ${format(new Date(), "PPpp")} | Filter: ${dateRange}`, 14, 22);
    autoTable(docPDF, {
      startY: 28,
      head: [["Name", "Email", "Program", "Type", "Reason", "Date"]],
      body: filteredVisits.map(v => [
        v.name || "", v.email || "", v.program || "", v.type || "",
        v.reason || "",
        v.timestamp?.toDate ? format(v.timestamp.toDate(), "MMM d, yyyy h:mm a") : ""
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [17, 101, 48] },
    });
    docPDF.save("NEU-Library-Visitor-Log.pdf");
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-4 border-t-transparent mx-auto mb-3 animate-spin" style={{ borderColor: '#116530', borderTopColor: 'transparent' }}></div>
        <p className="text-gray-500 text-sm">Loading dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header - NEU styled */}
      <div className="text-white px-6 py-6" style={{ background:'#111827' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-400 text-sm mt-0.5">NEU Library — Visitor Statistics & Management</p>
          </div>
          <button
            onClick={exportPDF}
            className="flex items-center gap-2 text-white font-semibold px-5 py-2 rounded-full text-sm shadow hover:shadow-md transition-all"
            style={{ backgroundColor: '#00b4d8' }}
          >
            📄 Export PDF
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* Gold accent divider */}
        <div className="h-1 rounded-full mb-6" style={{ backgroundColor: '#e9c980' }}></div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Visits", value: stats.total, icon: "👥", bg: '#116530', text: 'white' },
            { label: "Students", value: stats.students, icon: "🎓", bg: '#1a4f8a', text: 'white' },
            { label: "Faculty", value: stats.faculty, icon: "👨‍🏫", bg: '#7c3aed', text: 'white' },
            { label: "Staff", value: stats.staff, icon: "💼", bg: '#b45309', text: 'white' },
          ].map(s => (
            <div key={s.label} className="rounded-xl p-5 shadow-sm text-white" style={{ backgroundColor: s.bg }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{s.icon}</span>
                <span className="text-3xl font-bold">{s.value}</span>
              </div>
              <p className="text-sm font-medium opacity-90">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Date Range Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-5">
          <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">Filter by Date</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {["today", "week", "month", "custom"].map(d => (
              <button key={d} onClick={() => setDateRange(d)}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all border"
                style={dateRange === d
                  ? { backgroundColor: '#00b4d8', color: 'white', borderColor: '#00b4d8' }
                  : { backgroundColor: 'white', color: '#374151', borderColor: '#d1d5db' }}>
                {d === "today" ? "Today" : d === "week" ? "This Week" : d === "month" ? "This Month" : "Custom Range"}
              </button>
            ))}
          </div>
          {dateRange === "custom" && (
            <div className="flex gap-3 items-center">
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-600" />
              <span className="text-gray-400">to</span>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-600" />
            </div>
          )}
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-5">
          <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">Search & Filter</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="🔍 Search name, program, reason..."
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-600 md:col-span-2" />
            <select value={filterReason} onChange={e => setFilterReason(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-600">
              <option value="">All Reasons</option>
              {reasons.map(r => <option key={r}>{r}</option>)}
            </select>
            <select value={filterCollege} onChange={e => setFilterCollege(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-600">
              <option value="">All Colleges</option>
              {colleges.map(c => <option key={c}>{c}</option>)}
            </select>
            <select value={filterType} onChange={e => setFilterType(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-600">
              <option value="">All Types</option>
              <option value="student">🎓 Student</option>
              <option value="faculty">👨‍🏫 Faculty (Employee)</option>
              <option value="staff">💼 Staff (Employee)</option>
              <option value="employee">👔 All Employees</option>
            </select>
          </div>
        </div>

        {/* Visitor Log Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between" style={{ borderLeftWidth: 4, borderLeftColor: '#116530' }}>
            <h2 className="font-bold text-gray-800">Visitor Log
              <span className="ml-2 text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{filteredVisits.length} records</span>
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead style={{ backgroundColor: '#1a237e' }}>
                <tr>
                  {["Name", "Email", "Program", "Type", "Reason", "Date & Time", "Action"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredVisits.slice(0, 100).map((v, i) => (
                  <tr key={v.id} className={i % 2 === 0 ? "bg-white hover:bg-green-50" : "bg-gray-50 hover:bg-green-50"}>
                    <td className="px-4 py-3 font-medium text-gray-800">{v.name}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{v.email}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{v.program || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        v.type === "faculty" ? "bg-purple-100 text-purple-700" :
                        v.type === "staff" ? "bg-amber-100 text-amber-700" :
                        "bg-blue-100 text-blue-700"}`}>
                        {v.type || "student"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{v.reason}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {v.timestamp?.toDate ? format(v.timestamp.toDate(), "MMM d, yyyy h:mm a") : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleBlock(v.uid, blocklist.includes(v.uid))}
                        className={`text-xs px-3 py-1 rounded-lg font-medium border ${
                          blocklist.includes(v.uid)
                            ? "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                            : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"}`}>
                        {blocklist.includes(v.uid) ? "Unblock" : "Block"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredVisits.length === 0 && (
              <div className="text-center py-12">
                <p className="text-4xl mb-2">📭</p>
                <p className="text-gray-400 text-sm">No records found for the selected filters.</p>
              </div>
            )}
          </div>
        </div>

        {/* Users Management */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100" style={{ borderLeftWidth: 4, borderLeftColor: '#e9c980' }}>
            <h2 className="font-bold text-gray-800">Registered Users
              <span className="ml-2 text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{users.length} users</span>
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead style={{ backgroundColor: '#1a237e' }}>
                <tr>
                  {["Name", "Email", "Role", "Status", "Action"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u, i) => (
                  <tr key={u.id} className={i % 2 === 0 ? "bg-white hover:bg-green-50" : "bg-gray-50 hover:bg-green-50"}>
                    <td className="px-4 py-3 font-medium text-gray-800">{u.name}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        u.role === "admin" ? "text-white" : "bg-gray-100 text-gray-600"}`}
                        style={u.role === "admin" ? { backgroundColor: '#116530' } : {}}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        blocklist.includes(u.id) ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"}`}>
                        {blocklist.includes(u.id) ? "🚫 Blocked" : "✅ Active"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleBlock(u.id, blocklist.includes(u.id))}
                        className={`text-xs px-3 py-1 rounded-lg font-medium border ${
                          blocklist.includes(u.id)
                            ? "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                            : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"}`}>
                        {blocklist.includes(u.id) ? "Unblock" : "Block"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}