import { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection, getDocs, setDoc, deleteDoc, doc,
  query, orderBy
} from "firebase/firestore";
import { format, isWithinInterval, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import * as XLSX from "xlsx";

const NEU_COLLEGES = [
  "College of Accountancy", "College of Agriculture", "College of Arts and Science",
  "College of Business Administration", "College of Communication",
  "College of Informatics and Computing Studies", "College of Criminology",
  "College of Education", "College of Engineering and Architecture",
  "College of Medical Technology", "College of Midwifery", "College of Music",
  "College of Nursing", "College of Physical Therapy", "College of Respiratory Therapy",
  "School of International Relations", "College of Law", "College of Medicine",
  "School of Graduate Studies", "Integrated School",
];

const ALL_REASONS = [
  "Reading", "Researching", "Use of Computer",
  "Meeting", "Borrowing Books", "Returning Books", "Other",
];

export default function AdminDashboard() {
  const [visits, setVisits] = useState([]);
  const [users, setUsers] = useState([]);
  const [blocklist, setBlocklist] = useState({}); // { uid: { reason, blockedAt } }
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("visits");

  // Filters
  const [search, setSearch] = useState("");
  const [filterReason, setFilterReason] = useState("");
  const [filterCollege, setFilterCollege] = useState("");
  const [filterType, setFilterType] = useState("");
  const [dateRange, setDateRange] = useState("today");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // User search
  const [userSearch, setUserSearch] = useState("");
  const [filterUserStatus, setFilterUserStatus] = useState(""); // "active" | "blocked"

  // Block modal
  const [blockModal, setBlockModal] = useState(null); // { user, isBlocked }
  const [blockReason, setBlockReason] = useState("");
  const [blockLoading, setBlockLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [vSnap, uSnap, bSnap] = await Promise.all([
      getDocs(query(collection(db, "visits"), orderBy("timestamp", "desc"))),
      getDocs(collection(db, "users")),
      getDocs(collection(db, "blocklist")),
    ]);
    setVisits(vSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
    setUsers(uSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
    const bl = {};
    bSnap.docs.forEach((d) => { bl[d.id] = d.data(); });
    setBlocklist(bl);
    setLoading(false);
  };

  const getDateInterval = () => {
    const now = new Date();
    if (dateRange === "today") return { start: startOfDay(now), end: endOfDay(now) };
    if (dateRange === "week") return { start: startOfWeek(now), end: endOfWeek(now) };
    if (dateRange === "month") return { start: startOfMonth(now), end: endOfMonth(now) };
    if (dateRange === "custom" && startDate && endDate)
      return { start: startOfDay(new Date(startDate)), end: endOfDay(new Date(endDate)) };
    return null;
  };

  const filteredVisits = visits.filter((v) => {
    const interval = getDateInterval();
    if (interval && v.timestamp?.toDate) {
      if (!isWithinInterval(v.timestamp.toDate(), interval)) return false;
    }
    if (search && !v.name?.toLowerCase().includes(search.toLowerCase()) && !v.email?.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterReason && v.reason !== filterReason) return false;
    if (filterCollege && v.college !== filterCollege) return false;
    if (filterType && v.type !== filterType) return false;
    return true;
  });

  const filteredUsers = users.filter((u) => {
    const isBlocked = !!blocklist[u.id];
    if (userSearch && !u.name?.toLowerCase().includes(userSearch.toLowerCase()) && !u.email?.toLowerCase().includes(userSearch.toLowerCase())) return false;
    if (filterUserStatus === "active" && isBlocked) return false;
    if (filterUserStatus === "blocked" && !isBlocked) return false;
    return true;
  });

  const openBlockModal = (user, isBlocked) => {
    setBlockModal({ user, isBlocked });
    setBlockReason("");
  };

  const confirmBlock = async () => {
    if (!blockModal) return;
    setBlockLoading(true);
    const { user, isBlocked } = blockModal;
    try {
      if (isBlocked) {
        await deleteDoc(doc(db, "blocklist", user.id));
        setBlocklist((prev) => {
          const next = { ...prev };
          delete next[user.id];
          return next;
        });
      } else {
        const data = {
          blocked: true,
          reason: blockReason.trim() || "No reason provided",
          blockedAt: new Date().toISOString(),
          name: user.name,
          email: user.email,
        };
        await setDoc(doc(db, "blocklist", user.id), data);
        setBlocklist((prev) => ({ ...prev, [user.id]: data }));
      }
    } catch (err) {
      alert("Failed to update block status.");
    } finally {
      setBlockLoading(false);
      setBlockModal(null);
    }
  };

  const exportExcel = () => {
    const rows = filteredVisits.map((v) => ({
      Name: v.name || "N/A",
      Email: v.email || "N/A",
      College: v.college || "N/A",
      Program: v.program || "N/A",
      Reason: v.reason || "N/A",
      Type: v.type || "N/A",
      Source: v.source || "N/A",
      "Date & Time": v.timestamp?.toDate ? format(v.timestamp.toDate(), "MMM d, yyyy h:mm a") : "N/A",
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Visit Logs");

    // Auto column widths
    const colWidths = Object.keys(rows[0] || {}).map((key) => ({
      wch: Math.max(key.length, ...rows.map((r) => String(r[key] || "").length)) + 2,
    }));
    ws["!cols"] = colWidths;

    XLSX.writeFile(wb, `NEU-Library-Report-${format(new Date(), "yyyy-MM-dd")}.xlsx`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#00b4d8", borderTopColor: "transparent" }} />
      </div>
    );
  }

  const blockedCount = Object.keys(blocklist).length;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f8f9fa" }}>
      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#1a237e" }}>Admin Dashboard</h1>
            <p className="text-sm text-gray-400">{filteredVisits.length} visit(s) shown</p>
          </div>
          <button
            onClick={exportExcel}
            className="px-4 py-2 rounded-lg text-white text-sm font-medium transition"
            style={{ backgroundColor: "#1a237e" }}
          >
            📊 Export Excel
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5">
          {[
            { id: "visits", label: "📋 Visit Logs" },
            { id: "users", label: `👥 Users${blockedCount > 0 ? ` (${blockedCount} blocked)` : ""}` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition"
              style={activeTab === tab.id
                ? { backgroundColor: "#1a237e", color: "white" }
                : { backgroundColor: "white", color: "#6b7280", border: "1px solid #e5e7eb" }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── VISITS TAB ── */}
        {activeTab === "visits" && (
          <>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-5 flex flex-wrap gap-3">
              <input
                type="text"
                placeholder="Search name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-400 flex-1 min-w-[180px]"
              />
              <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none bg-white">
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="all">All Time</option>
                <option value="custom">Custom Range</option>
              </select>
              {dateRange === "custom" && (
                <>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
                </>
              )}
              <select value={filterReason} onChange={(e) => setFilterReason(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none bg-white">
                <option value="">All Reasons</option>
                {ALL_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              <select value={filterCollege} onChange={(e) => setFilterCollege(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none bg-white">
                <option value="">All Colleges</option>
                {NEU_COLLEGES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none bg-white">
                <option value="">All Types</option>
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
                <option value="staff">Staff</option>
              </select>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-left" style={{ backgroundColor: "#f8f9fa" }}>
                      <th className="px-4 py-3 text-xs font-semibold text-gray-500">Visitor</th>
                      <th className="px-4 py-3 text-xs font-semibold text-gray-500">College</th>
                      <th className="px-4 py-3 text-xs font-semibold text-gray-500">Reason</th>
                      <th className="px-4 py-3 text-xs font-semibold text-gray-500">Type</th>
                      <th className="px-4 py-3 text-xs font-semibold text-gray-500">Date & Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredVisits.length === 0 ? (
                      <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-sm">No visits found.</td></tr>
                    ) : (
                      filteredVisits.map((v) => (
                        <tr key={v.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {v.photoURL
                                ? <img src={v.photoURL} alt="" className="w-7 h-7 rounded-full object-cover border border-gray-200" />
                                : <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs">👤</div>
                              }
                              <div>
                                <p className="font-medium text-gray-800">{v.name}</p>
                                <p className="text-xs text-gray-400">{v.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-600 text-xs max-w-[160px] truncate">{v.college}</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: "#e0f7fc", color: "#00b4d8" }}>
                              {v.reason}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-500 capitalize text-xs">{v.type}</td>
                          <td className="px-4 py-3 text-gray-500 text-xs">
                            {v.timestamp?.toDate ? format(v.timestamp.toDate(), "MMM d, yyyy h:mm a") : "—"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ── USERS TAB ── */}
        {activeTab === "users" && (
          <>
            {/* User filters */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-5 flex flex-wrap gap-3">
              <input
                type="text"
                placeholder="Search name or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-400 flex-1 min-w-[200px]"
              />
              <select value={filterUserStatus} onChange={(e) => setFilterUserStatus(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none bg-white">
                <option value="">All Users</option>
                <option value="active">Active Only</option>
                <option value="blocked">Blocked Only</option>
              </select>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-left" style={{ backgroundColor: "#f8f9fa" }}>
                      <th className="px-4 py-3 text-xs font-semibold text-gray-500">User</th>
                      <th className="px-4 py-3 text-xs font-semibold text-gray-500">College / Program</th>
                      <th className="px-4 py-3 text-xs font-semibold text-gray-500">Role</th>
                      <th className="px-4 py-3 text-xs font-semibold text-gray-500">Status</th>
                      <th className="px-4 py-3 text-xs font-semibold text-gray-500">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-sm">No users found.</td></tr>
                    ) : (
                      filteredUsers.map((u) => {
                        const blockData = blocklist[u.id];
                        const isBlocked = !!blockData;
                        return (
                          <tr key={u.id} className={`border-b border-gray-50 transition ${isBlocked ? "bg-red-50/40" : "hover:bg-gray-50"}`}>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                {u.photoURL
                                  ? <img src={u.photoURL} alt="" className="w-8 h-8 rounded-full object-cover border border-gray-200" />
                                  : <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs">👤</div>
                                }
                                <div>
                                  <p className="font-medium text-gray-800">{u.name}</p>
                                  <p className="text-xs text-gray-400">{u.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <p className="text-xs text-gray-600 truncate max-w-[160px]">{u.college || "—"}</p>
                              <p className="text-xs text-gray-400 truncate max-w-[160px]">{u.program || ""}</p>
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className="px-2 py-0.5 rounded-full text-xs font-medium capitalize"
                                style={u.role === "admin"
                                  ? { backgroundColor: "#e8eaf6", color: "#1a237e" }
                                  : { backgroundColor: "#f3f4f6", color: "#6b7280" }}
                              >
                                {u.role || "student"}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              {isBlocked ? (
                                <div>
                                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-600">
                                    🚫 Blocked
                                  </span>
                                  {blockData?.reason && (
                                    <p className="text-xs text-gray-400 mt-1 max-w-[140px] truncate" title={blockData.reason}>
                                      "{blockData.reason}"
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-600">
                                  ✅ Active
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {u.role !== "admin" && (
                                <button
                                  onClick={() => openBlockModal(u, isBlocked)}
                                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition border"
                                  style={isBlocked
                                    ? { backgroundColor: "#f0fdf4", color: "#16a34a", borderColor: "#bbf7d0" }
                                    : { backgroundColor: "#fff1f2", color: "#dc2626", borderColor: "#fecaca" }}
                                >
                                  {isBlocked ? "✅ Unblock" : "🚫 Block"}
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── BLOCK CONFIRMATION MODAL ── */}
      {blockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="h-1.5 w-full" style={{ backgroundColor: blockModal.isBlocked ? "#16a34a" : "#dc2626" }} />
            <div className="p-6">
              {/* User info */}
              <div className="flex items-center gap-3 mb-5">
                {blockModal.user.photoURL
                  ? <img src={blockModal.user.photoURL} alt="" className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                  : <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg">👤</div>
                }
                <div>
                  <p className="font-semibold text-gray-800">{blockModal.user.name}</p>
                  <p className="text-xs text-gray-400">{blockModal.user.email}</p>
                </div>
              </div>

              {blockModal.isBlocked ? (
                <>
                  <h3 className="text-base font-bold text-gray-800 mb-1">Unblock this user?</h3>
                  <p className="text-sm text-gray-500 mb-5">They will be able to log visits again.</p>
                </>
              ) : (
                <>
                  <h3 className="text-base font-bold text-gray-800 mb-1">Block this user?</h3>
                  <p className="text-sm text-gray-500 mb-3">They won't be able to access the library log.</p>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Reason (optional)</label>
                  <textarea
                    value={blockReason}
                    onChange={(e) => setBlockReason(e.target.value)}
                    placeholder="e.g. Violation of library rules"
                    rows={3}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-300 resize-none mb-4"
                  />
                </>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => setBlockModal(null)}
                  className="flex-1 py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmBlock}
                  disabled={blockLoading}
                  className="flex-1 py-2 rounded-lg text-sm font-medium text-white transition disabled:opacity-60"
                  style={{ backgroundColor: blockModal.isBlocked ? "#16a34a" : "#dc2626" }}
                >
                  {blockLoading ? "Please wait..." : blockModal.isBlocked ? "Yes, Unblock" : "Yes, Block"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}