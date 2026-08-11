import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  ShieldCheck,
  ArrowLeft,
  Eye,
  EyeOff,
} from "lucide-react";
import api from "../../services/api";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    // Validasi Frontend: Cek input kosong
    if (!email.trim() || !password.trim()) {
      setError("Email dan password wajib diisi!");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/admin/login", {
        email: email.trim(),
        password: password.trim(),
      });

      // Perbaikan penangkapan token:
      // Mengecek berbagai kemungkinan struktur data dari Laravel
      const token =
        res.data?.token || res.data?.data?.token || res.data?.access_token;

      if (token) {
        localStorage.setItem("admin_token", token);
        navigate("/admin/dashboard");
      } else if (res.status === 200 || res.status === 201) {
        // Fallback: Jika sukses tapi token tidak terdeteksi (misal pakai cookie Sanctum)
        navigate("/admin/dashboard");
      } else {
        setError("Login gagal memproses token autentikasi.");
      }
    } catch (err) {
      // Validasi Backend: Jika status 401 / 422 (Kredensial Salah)
      if (err.response?.status === 401 || err.response?.status === 422) {
        setError("Email atau password salah!");
      } else {
        setError(
          err.response?.data?.message ||
            "Terjadi kesalahan sistem. Silakan coba lagi.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8faf9] font-sans antialiased flex items-center justify-center p-4">
      <link
        href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      <style>{`
                body {
                    font-family: 'Plus Jakarta Sans', sans-serif;
                }
                h1, h2, h3, h4, .font-heading {
                    font-family: 'Montserrat', sans-serif;
                    letter-spacing: -0.02em;
                }
            `}</style>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        {/* Header Portal */}
        <div className="bg-gradient-to-br from-[#0d3a2d] via-[#165643] to-[#0f4435] text-white p-7 text-center relative">
          <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 text-white flex items-center justify-center mx-auto mb-3 shadow-inner">
            <ShieldCheck className="w-6 h-6 text-emerald-300" />
          </div>
          <h2 className="text-xl md:text-2xl font-black font-heading tracking-tight">
            Admin Portal
          </h2>
          <p className="text-xs text-emerald-100/80 font-medium mt-1">
            Trutup Sport Center Management System
          </p>
        </div>

        {/* Form Input */}
        <form onSubmit={handleLogin} className="p-7 space-y-4">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl text-xs font-semibold flex items-start gap-2.5 leading-relaxed animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-[11px] font-extrabold text-slate-900 uppercase tracking-wider font-heading">
              Email Admin
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                placeholder="nama@trutupsportcenter.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-[#0d3a2d] transition"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-extrabold text-slate-900 uppercase tracking-wider font-heading">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-[#0d3a2d] transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-[#0d3a2d] text-white hover:bg-[#165643] transition shadow-md flex items-center justify-center gap-2 cursor-pointer mt-2 ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {loading ? "Memproses Authentikasi..." : "Masuk Dashboard"}{" "}
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Tombol Kembali ke Beranda Utama */}
          <div className="pt-3 border-t border-slate-100 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#0d3a2d] transition py-1 px-3 rounded-lg hover:bg-slate-50"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Beranda Utama
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
