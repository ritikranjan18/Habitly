import { useState, useEffect } from "react";
import { register } from "../services/authService";

function Register({ setShowRegister }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  // 🔥 SAME HABIT BACKGROUND
  useEffect(() => {
    const canvas = document.getElementById("bgCanvas");
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let items = [];

    for (let i = 0; i < 30; i++) {
      items.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 30,
        speed: Math.random() * 0.5 + 0.2,
        checked: Math.random() > 0.5,
      });
    }

    function drawBox(x, y, size, checked) {
      ctx.strokeStyle = "rgba(255,255,255,0.3)";
      ctx.strokeRect(x, y, size, size);

      if (checked) {
        ctx.strokeStyle = "#00ffcc";
        ctx.beginPath();
        ctx.moveTo(x + 5, y + size / 2);
        ctx.lineTo(x + size / 2, y + size - 5);
        ctx.lineTo(x + size - 5, y + 5);
        ctx.stroke();
      }
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      items.forEach((item) => {
        drawBox(item.x, item.y, item.size, item.checked);

        item.y -= item.speed;

        if (item.y < -50) {
          item.y = canvas.height;
          item.x = Math.random() * canvas.width;
          item.checked = Math.random() > 0.5;
        }
      });

      requestAnimationFrame(animate);
    }

    animate();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await register(form);
      alert("Registered Successfully ✅");
      setShowRegister(false);
    } catch {
      alert("Error ❌");
    }
  };

  return (
    <div className="container">

      {/* 🔥 CANVAS BACKGROUND */}
      <canvas id="bgCanvas"></canvas>

      <div className="card">
        <h1>Create Account</h1>
        <p>Start building habits 🚀</p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Name"
            required
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />

          <input
            type="email"
            placeholder="Email"
            required
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
          />

          <input
            type="password"
            placeholder="Password"
            required
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
          />

          <button type="submit">Register 🚀</button>
        </form>

        <p onClick={() => setShowRegister(false)}>
          Already have an account? Login
        </p>
      </div>

      <style>{`
        .container {
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
          overflow: hidden;
          font-family: sans-serif;
        }

        canvas {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
          z-index: 0;
        }

        .card {
          position: relative;
          z-index: 2;
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(20px);
          padding: 40px;
          border-radius: 20px;
          color: white;
          text-align: center;
          width: 320px;
        }

        input {
          display: block;
          width: 100%;
          margin: 10px 0;
          padding: 10px;
          border-radius: 5px;
          border: none;
        }

        button {
          padding: 10px;
          border: none;
          border-radius: 5px;
          background: #00c6ff;
          color: white;
          cursor: pointer;
        }

        p {
          margin-top: 15px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}

export default Register;