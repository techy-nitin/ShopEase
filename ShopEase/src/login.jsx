import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "./config";
export default function SlidingAuth() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [formdata, setFormdata] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormdata({ ...formdata, [e.target.name]: e.target.value });
  };

  // Particle animation
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animId;
    let particles = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      initParticles();
    };

    const rand = (a, b) => a + Math.random() * (b - a);

    const initParticles = () => {
      particles = [];
      const count = Math.floor((canvas.width * canvas.height) / 9000);
      const colors = ["#7c3aed", "#2563eb", "#0891b2", "#ffffff"];
      for (let i = 0; i < count; i++) {
        particles.push({
          x: rand(0, canvas.width), y: rand(0, canvas.height),
          r: rand(0.5, 2), vx: rand(-0.15, 0.15), vy: rand(-0.2, -0.05),
          alpha: rand(0.2, 0.7),
          color: colors[Math.floor(rand(0, 4))],
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
        p.x += p.vx; p.y += p.vy;
        if (p.y < -4) { p.y = canvas.height + 4; p.x = rand(0, canvas.width); }
        if (p.x < -4) p.x = canvas.width + 4;
        if (p.x > canvas.width + 4) p.x = -4;
      }
      ctx.globalAlpha = 1;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 90) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(255,255,255,${0.04 * (1 - dist / 90)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);

  const handleSubmit = async () => {
    setError("");
    try {
      const url = isSignUp
        ? `${API_BASE}/api/auth/signup`
        : `${API_BASE}/api/auth/login`;
      const payload = isSignUp
        ? { name: formdata.name, email: formdata.email, password: formdata.password }
        : { email: formdata.email, password: formdata.password };
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      if (isSignUp) {
        alert("Signup successful! Please login.");
        setIsSignUp(false);
        setFormdata({ name: "", email: "", password: "" });
      } else {
        const savedUser = data.user || data;
        localStorage.setItem("token", savedUser.token || data.token || "");
        localStorage.setItem("user", JSON.stringify(savedUser));
        localStorage.setItem("userId", String(savedUser.id || ""));
        localStorage.setItem("email", savedUser.email || "");
        localStorage.setItem("role", savedUser.role || "");
        localStorage.setItem("name", savedUser.name || "");
        navigate("/");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const inputCls = "w-full px-5 py-[10px] rounded-full bg-white/5 border border-white/10 text-white placeholder-[#444] text-sm focus:outline-none focus:border-white/25 focus:bg-white/[0.08] mb-4 transition-all";
  const labelCls = "block text-[10px] font-semibold tracking-widest text-[#555] mb-1";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] relative overflow-hidden">
      {/* Glow orbs */}
      <div className="absolute w-[380px] h-[380px] rounded-full bg-violet-700 opacity-20 blur-[80px] -top-20 -left-20 pointer-events-none" />
      <div className="absolute w-[300px] h-[300px] rounded-full bg-blue-700 opacity-20 blur-[80px] -bottom-16 right-[10%] pointer-events-none" />
      <div className="absolute w-[220px] h-[220px] rounded-full bg-cyan-600 opacity-15 blur-[80px] top-1/3 left-1/3 pointer-events-none" />

      {/* Grid overlay */}
      <div className="absolute inset-0"
        style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)", backgroundSize: "48px 48px" }} />

      {/* Canvas particles */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Auth Card */}
      <div className="relative z-10 w-[900px] max-w-[95%] h-[500px] flex rounded-2xl overflow-hidden"
        style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.08), 0 32px 80px rgba(0,0,0,0.7)" }}>

        {/* Form Side */}
        <div className="w-1/2 relative overflow-hidden" style={{ background: "rgba(15,15,20,0.92)", backdropFilter: "blur(20px)" }}>
          <div className="flex w-[200%] h-full transition-transform duration-500"
            style={{ transform: isSignUp ? "translateX(-50%)" : "translateX(0%)" }}>

            {/* Sign In */}
            <div className="w-1/2 flex flex-col justify-center px-14">
              <h2 className="text-3xl font-light text-white mb-6">Sign In</h2>
              <label className={labelCls}>EMAIL</label>
              <input type="email" name="email" placeholder="you@example.com"
                value={formdata.email} onChange={handleChange} className={inputCls} />
              <label className={labelCls}>PASSWORD</label>
              <input type="password" name="password" placeholder="Password"
                value={formdata.password} onChange={handleChange} className={inputCls} />
              {error && <p className="text-red-400 text-xs mb-2">{error}</p>}
              <button onClick={handleSubmit}
                className="w-full py-3 rounded-full bg-white text-[#0a0a0f] font-medium text-base hover:bg-gray-200 active:scale-95 transition-all">
                Sign In
              </button>
              <div className="flex justify-between mt-3 text-xs text-[#666]">
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" /> Remember me</label>
                <span className="cursor-pointer hover:text-white transition">Forgot password</span>
              </div>
            </div>

            {/* Sign Up */}
            <div className="w-1/2 flex flex-col justify-center px-14">
              <h2 className="text-3xl font-light text-white mb-6">Create Account</h2>
              <label className={labelCls}>NAME</label>
              <input type="text" name="name" placeholder="Full Name"
                value={formdata.name} onChange={handleChange} className={inputCls} />
              <label className={labelCls}>EMAIL</label>
              <input type="email" name="email" placeholder="you@example.com"
                value={formdata.email} onChange={handleChange} className={inputCls} />
              <label className={labelCls}>PASSWORD</label>
              <input type="password" name="password" placeholder="Password"
                value={formdata.password} onChange={handleChange} className={inputCls} />
              {error && <p className="text-red-400 text-xs mb-2">{error}</p>}
              <button onClick={handleSubmit}
                className="w-full py-3 rounded-full bg-white text-[#0a0a0f] font-medium text-base hover:bg-gray-200 active:scale-95 transition-all">
                Sign Up
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-1/2 flex flex-col items-center justify-center text-center px-12 relative overflow-hidden"
          style={{ background: "rgba(20,20,30,0.7)", backdropFilter: "blur(20px)", borderLeft: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="absolute inset-0"
            style={{ background: "radial-gradient(ellipse at 60% 30%,rgba(124,58,237,0.12) 0%,transparent 65%),radial-gradient(ellipse at 30% 80%,rgba(37,99,235,0.1) 0%,transparent 60%)" }} />
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl border border-white/15 bg-white/5 flex items-center justify-center mb-5" style={{ backdropFilter: "blur(8px)" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="2" strokeLinecap="round">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
            </div>
            <h2 className="text-3xl font-semibold text-white mb-3">
              {isSignUp ? "Welcome Back!" : "Welcome to ShopEase"}
            </h2>
            <p className="text-sm text-[#666] mb-8">
              {isSignUp ? "Already have an account? Sign in." : "Don't have an account? Join us today."}
            </p>
            <button onClick={() => { setError(""); setIsSignUp(!isSignUp); }}
              className="px-8 py-3 rounded-full text-sm text-[#ccc] border border-white/20 bg-white/5 hover:bg-white hover:text-[#0a0a0f] hover:border-white transition-all"
              style={{ backdropFilter: "blur(8px)" }}>
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}