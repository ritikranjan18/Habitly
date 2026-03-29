import { useState, useEffect, useRef } from "react";
import { login } from "../services/authService";

const HABITS = ["💧 Drink Water", "📚 Read 30 min", "🏃 Morning Run", "🧘 Meditate", "💪 Workout", "🌙 Sleep 8hrs", "✍️ Journal", "🥗 Eat Healthy"];

function Login({ setShowRegister }) {
  const canvasRef = useRef(null);
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [focusedField, setFocusedField] = useState(null);
  const [floatingHabits, setFloatingHabits] = useState([]);

  // Generate floating habit pills
  useEffect(() => {
    const habits = Array.from({ length: 10 }, (_, i) => ({
      id: i,
      label: HABITS[i % HABITS.length],
      x: Math.random() * 80 + 5,
      y: Math.random() * 80 + 5,
      delay: Math.random() * 6,
      duration: 8 + Math.random() * 8,
      size: 0.75 + Math.random() * 0.4,
    }));
    setFloatingHabits(habits);
  }, []);

  // Live canvas — orbiting ring + dots
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    let t = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Particles
    const particles = Array.from({ length: 120 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: 0.5 + Math.random() * 1.5,
      dx: (Math.random() - 0.5) * 0.4,
      dy: (Math.random() - 0.5) * 0.4,
      opacity: 0.2 + Math.random() * 0.5,
    }));

    // Rings
    const rings = Array.from({ length: 3 }, (_, i) => ({
      radius: 180 + i * 90,
      speed: 0.0008 + i * 0.0003,
      dots: 6 + i * 4,
      color: ["#7c6aff", "#a855f7", "#4ecdc4"][i],
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t += 1;

      const cx = canvas.width * 0.72;
      const cy = canvas.height * 0.5;

      // Soft bg glow
      const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, 500);
      grd.addColorStop(0, "rgba(124,106,255,0.08)");
      grd.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Rings + orbiting dots
      rings.forEach((ring) => {
        // Ring
        ctx.beginPath();
        ctx.arc(cx, cy, ring.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255,255,255,0.04)`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Orbiting dots
        for (let d = 0; d < ring.dots; d++) {
          const angle = (d / ring.dots) * Math.PI * 2 + t * ring.speed;
          const x = cx + Math.cos(angle) * ring.radius;
          const y = cy + Math.sin(angle) * ring.radius;
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, Math.PI * 2);
          ctx.fillStyle = ring.color;
          ctx.globalAlpha = 0.7;
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      });

      // Center glow circle
      const innerGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 140);
      innerGlow.addColorStop(0, "rgba(124,106,255,0.18)");
      innerGlow.addColorStop(0.5, "rgba(168,85,247,0.06)");
      innerGlow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = innerGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, 140, 0, Math.PI * 2);
      ctx.fill();

      // Center icon
      ctx.font = "52px serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.globalAlpha = 0.85;
      ctx.fillText("🔥", cx, cy);
      ctx.globalAlpha = 1;

      // Floating particles
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,190,255,${p.opacity})`;
        ctx.fill();
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
      });

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(form);
      window.location.reload();
    } catch {
      setError("Invalid email or password. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-root">
      <canvas ref={canvasRef} className="bg-canvas" />

      {/* Floating habit pills */}
      <div className="floating-layer">
        {floatingHabits.map((h) => (
          <div
            key={h.id}
            className="float-pill"
            style={{
              left: `${h.x}%`,
              top: `${h.y}%`,
              animationDelay: `${h.delay}s`,
              animationDuration: `${h.duration}s`,
              fontSize: `${h.size * 13}px`,
              opacity: 0.18 + h.size * 0.1,
            }}
          >
            {h.label}
          </div>
        ))}
      </div>

      {/* Card */}
      <div className="login-card">
        {/* Left accent bar */}
        <div className="card-accent" />

        <div className="card-inner">
          {/* Header */}
          <div className="card-header">
            <div className="brand-badge">🔥 Habitly</div>
            <h1 className="card-title">Welcome back</h1>
            <p className="card-sub">Track. Improve. Repeat.</p>
          </div>

          {/* Streak bar */}
          <div className="streak-bar">
            {["M","T","W","T","F","S","S"].map((d, i) => (
              <div key={i} className={`streak-day ${i < 5 ? "streak-active" : ""}`}>
                <div className="streak-dot" />
                <span>{d}</span>
              </div>
            ))}
            <span className="streak-label">🔥 5 day streak</span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="login-form">
            {/* Email */}
            <div className={`field-wrap ${focusedField === "email" ? "focused" : ""} ${form.email ? "has-val" : ""}`}>
              <label className="field-label">Email address</label>
              <div className="field-box">
                <span className="field-icon">✉</span>
                <input
                  type="email"
                  required
                  value={form.email}
                  className="field-input"
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div className={`field-wrap ${focusedField === "password" ? "focused" : ""} ${form.password ? "has-val" : ""}`}>
              <label className="field-label">Password</label>
              <div className="field-box">
                <span className="field-icon">🔒</span>
                <input
                  type="password"
                  required
                  value={form.password}
                  className="field-input"
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="form-meta">
              <label className="remember-check">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <span className="forgot-link">Forgot password?</span>
            </div>

            {error && (
              <div className="error-msg">⚠ {error}</div>
            )}

            <button type="submit" className={`submit-btn ${loading ? "loading" : ""}`} disabled={loading}>
              {loading ? (
                <><span className="btn-spinner" /> Signing in...</>
              ) : (
                <> Sign In →</>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="divider"><span>or continue with</span></div>

          {/* Social */}
          <div className="social-row">
            <button className="social-btn">
              <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20H24v8h11.3C33.7 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.7-.1-4z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.1 19 12 24 12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.1 6.5 29.3 4 24 4c-7.6 0-14.2 4.3-17.7 10.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5L31.4 33c-2 1.4-4.5 2-7.4 2-5.2 0-9.6-3.5-11.2-8.2L6.3 31.5C9.8 39.4 16.4 44 24 44z"/><path fill="#1976D2" d="M43.6 20H24v8h11.3c-.8 2.3-2.3 4.2-4.3 5.5l6.1 5c3.7-3.3 5.9-8.3 5.9-14.5 0-1.3-.1-2.7-.1-4z"/></svg>
              Google
            </button>
            <button className="social-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.37.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.54-1.38-1.33-1.75-1.33-1.75-1.09-.74.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.49 1 .1-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.14-.3-.54-1.52.1-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 3-.4c1.02.005 2.04.14 3 .4 2.28-1.55 3.29-1.23 3.29-1.23.65 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.81 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.21.7.82.58C20.56 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z"/></svg>
              GitHub
            </button>
          </div>

          <p className="register-link">
            New here?{" "}
            <span onClick={() => setShowRegister(true)}>Create an account →</span>
          </p>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,400&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .login-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          padding: 24px;
          background: #070710;
          font-family: 'DM Sans', sans-serif;
          color: #e8e8f0;
          overflow: hidden;
          position: relative;
        }

        .bg-canvas {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
        }

        /* ── Floating Pills ── */
        .floating-layer {
          position: fixed;
          inset: 0;
          z-index: 1;
          pointer-events: none;
        }
        .float-pill {
          position: absolute;
          background: rgba(124,106,255,0.12);
          border: 1px solid rgba(124,106,255,0.2);
          color: rgba(200,190,255,0.9);
          padding: 6px 14px;
          border-radius: 50px;
          white-space: nowrap;
          animation: floatDrift linear infinite;
          backdrop-filter: blur(4px);
          font-size: 13px;
        }
        @keyframes floatDrift {
          0%   { transform: translateY(0px) rotate(-1deg); }
          33%  { transform: translateY(-18px) rotate(1deg); }
          66%  { transform: translateY(10px) rotate(-0.5deg); }
          100% { transform: translateY(0px) rotate(-1deg); }
        }

        /* ── Card ── */
        .login-card {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 430px;
          margin-left: 6vw;
          background: rgba(19,19,28,0.85);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 28px;
          backdrop-filter: blur(32px);
          box-shadow: 0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(124,106,255,0.08);
          animation: cardIn 0.6s cubic-bezier(0.22,1,0.36,1) both;
          overflow: hidden;
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateX(-30px) scale(0.97); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }

        .card-accent {
          height: 3px;
          background: linear-gradient(90deg, #7c6aff, #a855f7, #4ecdc4, #ff6b6b);
          background-size: 200% 100%;
          animation: accentShift 4s linear infinite;
        }
        @keyframes accentShift {
          0%   { background-position: 0% 0%; }
          100% { background-position: 200% 0%; }
        }

        .card-inner { padding: 36px 40px 40px; }

        /* ── Header ── */
        .card-header { margin-bottom: 24px; }
        .brand-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(124,106,255,0.12);
          border: 1px solid rgba(124,106,255,0.25);
          color: #a29bfe;
          padding: 5px 14px;
          border-radius: 50px;
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 16px;
          letter-spacing: 0.5px;
        }
        .card-title {
          font-family: 'Syne', sans-serif;
          font-size: 32px;
          font-weight: 800;
          line-height: 1.1;
          background: linear-gradient(135deg, #fff 40%, #a29bfe);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 6px;
        }
        .card-sub { color: #6b6b80; font-size: 14px; }

        /* ── Streak Bar ── */
        .streak-bar {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          padding: 12px 16px;
          margin-bottom: 28px;
        }
        .streak-day {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }
        .streak-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: rgba(255,255,255,0.12);
          transition: background 0.3s;
        }
        .streak-active .streak-dot { background: #ff6b6b; box-shadow: 0 0 6px rgba(255,107,107,0.5); }
        .streak-day span { font-size: 10px; color: #6b6b80; font-weight: 500; }
        .streak-active span { color: #e8e8f0; }
        .streak-label {
          margin-left: auto;
          font-size: 12px;
          color: #ff6b6b;
          font-weight: 600;
          white-space: nowrap;
        }

        /* ── Form ── */
        .login-form { display: flex; flex-direction: column; gap: 16px; }

        .field-wrap { display: flex; flex-direction: column; gap: 6px; }
        .field-label {
          font-size: 12px;
          font-weight: 600;
          color: #6b6b80;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          transition: color 0.2s;
        }
        .focused .field-label { color: #a29bfe; }
        .field-box {
          display: flex;
          align-items: center;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          padding: 0 16px;
          transition: all 0.2s;
          gap: 10px;
        }
        .focused .field-box {
          border-color: #7c6aff;
          background: rgba(124,106,255,0.06);
          box-shadow: 0 0 0 3px rgba(124,106,255,0.1);
        }
        .field-icon { font-size: 16px; opacity: 0.5; }
        .field-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: #e8e8f0;
          font-size: 15px;
          font-family: 'DM Sans', sans-serif;
          padding: 14px 0;
        }
        .field-input::placeholder { color: rgba(255,255,255,0.2); }

        .form-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: -4px;
        }
        .remember-check {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-size: 13px;
          color: #6b6b80;
        }
        .remember-check input { accent-color: #7c6aff; width: 14px; height: 14px; cursor: pointer; }
        .forgot-link {
          font-size: 13px;
          color: #7c6aff;
          cursor: pointer;
          transition: color 0.2s;
        }
        .forgot-link:hover { color: #a29bfe; }

        .error-msg {
          background: rgba(255,107,107,0.1);
          border: 1px solid rgba(255,107,107,0.25);
          color: #ff6b6b;
          border-radius: 10px;
          padding: 11px 14px;
          font-size: 13px;
        }

        .submit-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 15px;
          border-radius: 14px;
          border: none;
          background: linear-gradient(135deg, #7c6aff, #a855f7);
          color: white;
          font-size: 15px;
          font-weight: 700;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 24px rgba(124,106,255,0.4);
          letter-spacing: 0.3px;
          margin-top: 4px;
        }
        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(124,106,255,0.5);
        }
        .submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        .submit-btn.loading { background: linear-gradient(135deg, #5a4fd1, #8b3fc7); }

        .btn-spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          display: inline-block;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── Divider ── */
        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #3a3a4a;
          font-size: 12px;
          margin: 20px 0;
        }
        .divider::before, .divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.07);
        }
        .divider span { color: #4a4a5a; white-space: nowrap; font-size: 12px; }

        /* ── Social ── */
        .social-row { display: flex; gap: 10px; margin-bottom: 22px; }
        .social-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.03);
          color: #e8e8f0;
          font-size: 13px;
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: all 0.2s;
        }
        .social-btn:hover {
          background: rgba(255,255,255,0.07);
          border-color: rgba(255,255,255,0.15);
          transform: translateY(-1px);
        }

        /* ── Register Link ── */
        .register-link {
          text-align: center;
          font-size: 13px;
          color: #6b6b80;
        }
        .register-link span {
          color: #7c6aff;
          cursor: pointer;
          font-weight: 600;
          transition: color 0.2s;
        }
        .register-link span:hover { color: #a29bfe; }

        /* ── Responsive ── */
        @media (max-width: 640px) {
          .login-root { justify-content: center; padding: 16px; }
          .login-card { margin-left: 0; }
          .card-inner { padding: 28px 24px 32px; }
          .card-title { font-size: 26px; }
          .float-pill { display: none; }
        }
      `}</style>
    </div>
  );
}

export default Login;