import { useEffect, useState } from "react";
import {
  getHabits,
  createHabit,
  deleteHabit,
  toggleHabit,
} from "../services/habitService";

const CATEGORIES = [
  { label: "Health", icon: "🫀", color: "#ff6b6b" },
  { label: "Study", icon: "📚", color: "#4ecdc4" },
  { label: "Fitness", icon: "💪", color: "#ffe66d" },
  { label: "Mindfulness", icon: "🧘", color: "#a29bfe" },
  { label: "Finance", icon: "💰", color: "#55efc4" },
];

const NAV_ITEMS = [
  { icon: "▦", label: "Dashboard", active: true },
  { icon: "📈", label: "Analytics" },
  { icon: "🔥", label: "Streaks" },
  { icon: "🏆", label: "Achievements" },
  { icon: "⚙️", label: "Settings" },
];

function getMotivationalQuote() {
  const quotes = [
    { text: "Small steps every day.", author: "James Clear" },
    { text: "Discipline is freedom.", author: "Jocko Willink" },
    { text: "Be the change you wish to see.", author: "Gandhi" },
    { text: "You are what you repeatedly do.", author: "Aristotle" },
    { text: "Consistency beats intensity.", author: "Anonymous" },
  ];
  return quotes[new Date().getDay() % quotes.length];
}

function StatCard({ value, label, icon, color }) {
  return (
    <div className="stat-card" style={{ "--accent": color }}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

function HabitCard({ habit, onToggle, onDelete, categoryMeta }) {
  const cat = categoryMeta || { color: "#4ecdc4", icon: "✦" };
  return (
    <div className={`habit-card ${habit.completed ? "done" : ""}`} style={{ "--cat-color": cat.color }}>
      <div className="habit-card-glow" />
      <div className="habit-card-top">
        <span className="habit-cat-badge" style={{ background: cat.color + "22", color: cat.color }}>
          {cat.icon} {habit.category}
        </span>
        <button className="delete-btn" onClick={() => onDelete(habit._id)} title="Delete">✕</button>
      </div>
      <div className="habit-card-body">
        <h3 className="habit-title">{habit.title}</h3>
        <div className="habit-streak">
          <span>🔥</span>
          <span>{habit.streak} day streak</span>
        </div>
      </div>
      <div className="habit-card-footer">
        <div className={`status-pill ${habit.completed ? "status-done" : "status-pending"}`}>
          {habit.completed ? "✓ Completed" : "◯ Pending"}
        </div>
        <button
          className={`toggle-btn ${habit.completed ? "toggle-undo" : "toggle-do"}`}
          onClick={() => onToggle(habit._id)}
        >
          {habit.completed ? "Undo" : "Mark Done"}
        </button>
      </div>
    </div>
  );
}

function Dashboard() {
  const [habits, setHabits] = useState([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Health");
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [filterCat, setFilterCat] = useState("All");
  const [addOpen, setAddOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const quote = getMotivationalQuote();

  useEffect(() => { loadHabits(); }, []);

  const loadHabits = async () => {
    setLoading(true);
    const data = await getHabits();
    setHabits(data);
    setLoading(false);
  };

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  const handleAdd = async () => {
    if (!title.trim()) return;
    await createHabit({ title, category });
    setTitle("");
    setAddOpen(false);
    loadHabits();
    showToast(`"${title}" added!`);
  };

  const handleDelete = async (id) => {
    await deleteHabit(id);
    loadHabits();
    showToast("Habit removed", "error");
  };

  const handleToggle = async (id) => {
    await toggleHabit(id);
    loadHabits();
    showToast("Progress updated! 🎉");
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.reload();
  };

  const completed = habits.filter((h) => h.completed).length;
  const percent = habits.length ? Math.round((completed / habits.length) * 100) : 0;
  const totalStreak = habits.reduce((a, h) => a + (h.streak || 0), 0);
  const bestStreak = habits.reduce((a, h) => Math.max(a, h.streak || 0), 0);

  const filtered = filterCat === "All" ? habits : habits.filter(h => h.category === filterCat);

  const getCatMeta = (label) => CATEGORIES.find(c => c.label === label) || { color: "#aaa", icon: "✦" };

  return (
    <div className="app">

      {/* Toast */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>{toast.msg}</div>
      )}

      {/* Add Modal */}
      {addOpen && (
        <div className="modal-overlay" onClick={() => setAddOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">New Habit</h2>
            <p className="modal-sub">What do you want to build?</p>
            <input
              className="modal-input"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Meditate for 10 minutes"
              onKeyDown={e => e.key === "Enter" && handleAdd()}
              autoFocus
            />
            <div className="modal-cats">
              {CATEGORIES.map(c => (
                <button
                  key={c.label}
                  className={`cat-chip ${category === c.label ? "cat-chip-active" : ""}`}
                  style={{ "--chip-color": c.color }}
                  onClick={() => setCategory(c.label)}
                >
                  {c.icon} {c.label}
                </button>
              ))}
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setAddOpen(false)}>Cancel</button>
              <button className="btn-create" onClick={handleAdd}>Create Habit</button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="logo-icon">🔥</span>
          <span className="logo-text">Habitly</span>
        </div>
        <nav className="sidebar-nav">
          {NAV_ITEMS.map(item => (
            <div
              key={item.label}
              className={`nav-item ${activeNav === item.label ? "nav-active" : ""}`}
              onClick={() => setActiveNav(item.label)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {activeNav === item.label && <span className="nav-indicator" />}
            </div>
          ))}
        </nav>
        <div className="sidebar-user">
          <div className="user-avatar">{(user?.name || "U")[0].toUpperCase()}</div>
          <div className="user-info">
            <div className="user-name">{user?.name || "You"}</div>
            <div className="user-role">Habit Builder</div>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Logout">↩</button>
        </div>
      </aside>

      {/* Main */}
      <main className="main">

        {/* Header */}
        <div className="top-bar">
          <div>
            <h1 className="page-title">My Dashboard</h1>
            <p className="page-sub">
              <em>"{quote.text}"</em> — {quote.author}
            </p>
          </div>
          <button className="add-fab" onClick={() => setAddOpen(true)}>
            <span>+</span> New Habit
          </button>
        </div>

        {/* Stats */}
        <div className="stats-row">
          <StatCard value={habits.length} label="Total Habits" icon="📋" color="#4ecdc4" />
          <StatCard value={completed} label="Completed Today" icon="✅" color="#55efc4" />
          <StatCard value={`${percent}%`} label="Completion Rate" icon="🎯" color="#ffe66d" />
          <StatCard value={bestStreak} label="Best Streak" icon="🔥" color="#ff6b6b" />
          <StatCard value={totalStreak} label="Total Streak Days" icon="⚡" color="#a29bfe" />
        </div>

        {/* Progress */}
        <div className="progress-section">
          <div className="progress-header">
            <span>Daily Progress</span>
            <span className="progress-pct">{percent}%</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${percent}%` }}>
              <div className="progress-shine" />
            </div>
          </div>
          <div className="progress-labels">
            <span>{completed} done</span>
            <span>{habits.length - completed} remaining</span>
          </div>
        </div>

        {/* Filter */}
        <div className="filter-row">
          <button
            className={`filter-btn ${filterCat === "All" ? "filter-active" : ""}`}
            onClick={() => setFilterCat("All")}
          >All</button>
          {CATEGORIES.map(c => (
            <button
              key={c.label}
              className={`filter-btn ${filterCat === c.label ? "filter-active" : ""}`}
              style={{ "--fc": c.color }}
              onClick={() => setFilterCat(c.label)}
            >
              {c.icon} {c.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="empty-state">
            <div className="spinner" />
            <p>Loading your habits...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🌱</div>
            <h3>No habits yet</h3>
            <p>Start building your best self — add your first habit!</p>
            <button className="add-fab" onClick={() => setAddOpen(true)}>+ Add Habit</button>
          </div>
        ) : (
          <div className="habit-grid">
            {filtered.map(h => (
              <HabitCard
                key={h._id}
                habit={h}
                onToggle={handleToggle}
                onDelete={handleDelete}
                categoryMeta={getCatMeta(h.category)}
              />
            ))}
          </div>
        )}

      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,400&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg: #0a0a0f;
          --surface: #13131a;
          --surface2: #1c1c27;
          --border: rgba(255,255,255,0.07);
          --text: #e8e8f0;
          --muted: #6b6b80;
          --accent: #7c6aff;
          --accent2: #ff6b6b;
          --green: #00ffaa;
          --radius: 16px;
        }

        body { margin: 0; background: var(--bg); }

        .app {
          display: flex;
          min-height: 100vh;
          font-family: 'DM Sans', sans-serif;
          background: var(--bg);
          color: var(--text);
          position: relative;
        }

        /* ── Toast ── */
        .toast {
          position: fixed;
          bottom: 32px;
          left: 50%;
          transform: translateX(-50%);
          padding: 12px 24px;
          border-radius: 50px;
          font-size: 14px;
          font-weight: 500;
          z-index: 9999;
          animation: toastIn 0.3s ease;
          backdrop-filter: blur(20px);
        }
        .toast-success { background: rgba(0,255,170,0.15); border: 1px solid rgba(0,255,170,0.3); color: #00ffaa; }
        .toast-error { background: rgba(255,107,107,0.15); border: 1px solid rgba(255,107,107,0.3); color: #ff6b6b; }
        @keyframes toastIn { from { opacity:0; transform: translateX(-50%) translateY(12px); } to { opacity:1; transform: translateX(-50%) translateY(0); } }

        /* ── Modal ── */
        .modal-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.7);
          backdrop-filter: blur(8px);
          z-index: 1000;
          display: flex; align-items: center; justify-content: center;
        }
        .modal {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 24px;
          padding: 36px;
          width: 480px;
          max-width: 95vw;
          animation: modalIn 0.25s ease;
        }
        @keyframes modalIn { from { opacity:0; transform: scale(0.95) translateY(10px); } to { opacity:1; transform: scale(1) translateY(0); } }
        .modal-title { font-family: 'Syne', sans-serif; font-size: 26px; font-weight: 700; margin-bottom: 4px; }
        .modal-sub { color: var(--muted); font-size: 14px; margin-bottom: 24px; }
        .modal-input {
          width: 100%;
          background: var(--surface2);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 14px 16px;
          color: var(--text);
          font-size: 15px;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          margin-bottom: 20px;
          transition: border-color 0.2s;
        }
        .modal-input:focus { border-color: var(--accent); }
        .modal-cats { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 28px; }
        .cat-chip {
          padding: 7px 14px;
          border-radius: 50px;
          border: 1px solid rgba(255,255,255,0.1);
          background: transparent;
          color: var(--muted);
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'DM Sans', sans-serif;
        }
        .cat-chip:hover { border-color: var(--chip-color); color: var(--chip-color); }
        .cat-chip-active { background: var(--chip-color) !important; color: #000 !important; border-color: var(--chip-color) !important; font-weight: 600; }
        .modal-actions { display: flex; gap: 12px; justify-content: flex-end; }
        .btn-cancel {
          padding: 12px 22px; border-radius: 12px; border: 1px solid var(--border);
          background: transparent; color: var(--muted); cursor: pointer;
          font-family: 'DM Sans', sans-serif; font-size: 14px; transition: all 0.2s;
        }
        .btn-cancel:hover { color: var(--text); border-color: rgba(255,255,255,0.2); }
        .btn-create {
          padding: 12px 24px; border-radius: 12px; border: none;
          background: linear-gradient(135deg, var(--accent), #a855f7);
          color: white; cursor: pointer; font-weight: 600;
          font-family: 'DM Sans', sans-serif; font-size: 14px;
          box-shadow: 0 4px 20px rgba(124,106,255,0.4); transition: all 0.2s;
        }
        .btn-create:hover { transform: translateY(-1px); box-shadow: 0 6px 28px rgba(124,106,255,0.5); }

        /* ── Sidebar ── */
        .sidebar {
          width: 240px;
          min-height: 100vh;
          background: var(--surface);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          padding: 28px 16px 24px;
          position: sticky;
          top: 0;
          height: 100vh;
        }
        .sidebar-logo {
          display: flex; align-items: center; gap: 10px;
          padding: 0 8px; margin-bottom: 36px;
        }
        .logo-icon { font-size: 26px; }
        .logo-text {
          font-family: 'Syne', sans-serif;
          font-size: 22px; font-weight: 800;
          background: linear-gradient(135deg, #fff, #a29bfe);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .sidebar-nav { flex: 1; display: flex; flex-direction: column; gap: 4px; }
        .nav-item {
          display: flex; align-items: center; gap: 12px;
          padding: 11px 12px; border-radius: 12px;
          cursor: pointer; transition: all 0.2s;
          color: var(--muted); font-size: 14px; position: relative;
        }
        .nav-item:hover { background: var(--surface2); color: var(--text); }
        .nav-active { background: rgba(124,106,255,0.12) !important; color: var(--accent) !important; }
        .nav-icon { font-size: 16px; }
        .nav-indicator {
          position: absolute; right: 0; top: 50%;
          transform: translateY(-50%);
          width: 3px; height: 20px;
          background: var(--accent);
          border-radius: 4px 0 0 4px;
        }
        .sidebar-user {
          display: flex; align-items: center; gap: 10px;
          padding: 14px 12px;
          border-top: 1px solid var(--border);
          margin-top: 16px;
        }
        .user-avatar {
          width: 36px; height: 36px; border-radius: 50%;
          background: linear-gradient(135deg, var(--accent), #ff6b6b);
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 15px; color: white; flex-shrink: 0;
        }
        .user-info { flex: 1; overflow: hidden; }
        .user-name { font-size: 13px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .user-role { font-size: 11px; color: var(--muted); }
        .logout-btn {
          background: none; border: 1px solid var(--border);
          color: var(--muted); border-radius: 8px;
          width: 30px; height: 30px; cursor: pointer;
          font-size: 14px; transition: all 0.2s; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
        }
        .logout-btn:hover { color: var(--accent2); border-color: var(--accent2); }

        /* ── Main ── */
        .main {
          flex: 1;
          padding: 36px 40px;
          overflow-y: auto;
          min-width: 0;
        }

        /* ── Top Bar ── */
        .top-bar {
          display: flex; align-items: flex-start; justify-content: space-between;
          margin-bottom: 32px; flex-wrap: wrap; gap: 16px;
        }
        .page-title {
          font-family: 'Syne', sans-serif;
          font-size: 34px; font-weight: 800;
          letter-spacing: -0.5px;
          background: linear-gradient(135deg, #fff 40%, #a29bfe);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          line-height: 1.1; margin-bottom: 6px;
        }
        .page-sub { color: var(--muted); font-size: 14px; font-style: italic; }
        .add-fab {
          display: flex; align-items: center; gap: 8px;
          padding: 13px 22px;
          background: linear-gradient(135deg, var(--accent), #a855f7);
          border: none; border-radius: 14px;
          color: white; font-weight: 600; font-size: 14px;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          box-shadow: 0 4px 24px rgba(124,106,255,0.4);
          transition: all 0.2s; white-space: nowrap;
        }
        .add-fab:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(124,106,255,0.5); }
        .add-fab span { font-size: 20px; line-height: 1; }

        /* ── Stats ── */
        .stats-row {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 14px;
          margin-bottom: 24px;
        }
        .stat-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 18px 16px;
          transition: all 0.25s;
          cursor: default;
          position: relative;
          overflow: hidden;
        }
        .stat-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: var(--accent);
          opacity: 0;
          transition: opacity 0.25s;
        }
        .stat-card:hover::before { opacity: 1; }
        .stat-card:hover { background: var(--surface2); transform: translateY(-2px); }
        .stat-icon { font-size: 22px; margin-bottom: 10px; }
        .stat-value {
          font-family: 'Syne', sans-serif;
          font-size: 28px; font-weight: 800;
          color: var(--accent);
          line-height: 1;
          margin-bottom: 4px;
        }
        .stat-label { font-size: 12px; color: var(--muted); font-weight: 500; }

        /* ── Progress ── */
        .progress-section {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 22px 24px;
          margin-bottom: 24px;
        }
        .progress-header {
          display: flex; justify-content: space-between;
          font-size: 14px; font-weight: 600; margin-bottom: 12px;
        }
        .progress-pct { color: var(--green); font-family: 'Syne', sans-serif; font-size: 18px; }
        .progress-track {
          height: 10px;
          background: var(--surface2);
          border-radius: 10px;
          overflow: hidden;
          margin-bottom: 8px;
          border: 1px solid var(--border);
        }
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--accent), var(--green));
          border-radius: 10px;
          position: relative;
          transition: width 0.8s cubic-bezier(0.4,0,0.2,1);
          min-width: 4px;
        }
        .progress-shine {
          position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
          animation: shine 2s infinite;
        }
        @keyframes shine { 0%,100% { opacity:0; transform: translateX(-100%); } 50% { opacity:1; transform: translateX(100%); } }
        .progress-labels {
          display: flex; justify-content: space-between;
          font-size: 12px; color: var(--muted);
        }

        /* ── Filter ── */
        .filter-row {
          display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 24px;
        }
        .filter-btn {
          padding: 7px 16px;
          border-radius: 50px;
          border: 1px solid var(--border);
          background: var(--surface);
          color: var(--muted);
          font-size: 13px; font-weight: 500;
          cursor: pointer; transition: all 0.2s;
          font-family: 'DM Sans', sans-serif;
        }
        .filter-btn:hover { border-color: rgba(255,255,255,0.2); color: var(--text); }
        .filter-active {
          background: var(--surface2) !important;
          border-color: var(--fc, var(--accent)) !important;
          color: var(--fc, var(--accent)) !important;
        }

        /* ── Habit Grid ── */
        .habit-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }
        .habit-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 18px;
          padding: 20px;
          transition: all 0.25s;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .habit-card-glow {
          position: absolute;
          top: -40px; right: -40px;
          width: 100px; height: 100px;
          background: var(--cat-color, var(--accent));
          border-radius: 50%;
          opacity: 0;
          filter: blur(40px);
          transition: opacity 0.3s;
          pointer-events: none;
        }
        .habit-card:hover { transform: translateY(-3px); border-color: rgba(255,255,255,0.12); }
        .habit-card:hover .habit-card-glow { opacity: 0.15; }
        .habit-card.done { border-color: rgba(0,255,170,0.2); }
        .habit-card.done .habit-card-glow { opacity: 0.08; background: #00ffaa; }

        .habit-card-top { display: flex; justify-content: space-between; align-items: center; }
        .habit-cat-badge {
          padding: 5px 12px; border-radius: 50px;
          font-size: 12px; font-weight: 600;
        }
        .delete-btn {
          width: 28px; height: 28px;
          border-radius: 8px;
          border: 1px solid var(--border);
          background: transparent;
          color: var(--muted);
          cursor: pointer; font-size: 12px;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s;
          padding: 0;
        }
        .delete-btn:hover { background: rgba(255,107,107,0.15); color: var(--accent2); border-color: rgba(255,107,107,0.3); }

        .habit-card-body { flex: 1; }
        .habit-title {
          font-family: 'Syne', sans-serif;
          font-size: 17px; font-weight: 700;
          margin-bottom: 8px; line-height: 1.3;
        }
        .habit-streak {
          display: flex; align-items: center; gap: 6px;
          font-size: 13px; color: var(--muted);
        }

        .habit-card-footer {
          display: flex; justify-content: space-between; align-items: center;
          border-top: 1px solid var(--border);
          padding-top: 14px;
        }
        .status-pill {
          padding: 5px 12px; border-radius: 50px;
          font-size: 12px; font-weight: 600;
        }
        .status-done { background: rgba(0,255,170,0.1); color: #00ffaa; }
        .status-pending { background: rgba(255,255,255,0.06); color: var(--muted); }
        .toggle-btn {
          padding: 8px 16px;
          border-radius: 10px; border: none;
          font-size: 13px; font-weight: 600;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          transition: all 0.2s;
        }
        .toggle-do {
          background: linear-gradient(135deg, var(--accent), #a855f7);
          color: white;
          box-shadow: 0 2px 12px rgba(124,106,255,0.3);
        }
        .toggle-do:hover { transform: translateY(-1px); box-shadow: 0 4px 18px rgba(124,106,255,0.4); }
        .toggle-undo {
          background: var(--surface2);
          color: var(--muted);
          border: 1px solid var(--border);
        }
        .toggle-undo:hover { color: var(--text); }

        /* ── Empty State ── */
        .empty-state {
          text-align: center; padding: 80px 20px;
          display: flex; flex-direction: column; align-items: center; gap: 12px;
          color: var(--muted);
        }
        .empty-icon { font-size: 52px; }
        .empty-state h3 { font-family: 'Syne', sans-serif; font-size: 20px; color: var(--text); }
        .empty-state p { font-size: 14px; }

        /* ── Spinner ── */
        .spinner {
          width: 36px; height: 36px;
          border: 3px solid var(--surface2);
          border-top-color: var(--accent);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin-bottom: 8px;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── Responsive ── */
        @media (max-width: 1100px) {
          .stats-row { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 768px) {
          .sidebar { display: none; }
          .main { padding: 20px; }
          .stats-row { grid-template-columns: repeat(2, 1fr); }
          .top-bar { flex-direction: column; }
          .page-title { font-size: 26px; }
        }
      `}</style>
    </div>
  );
}

export default Dashboard;