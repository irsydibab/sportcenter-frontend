import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  Settings,
  User,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Save,
  Trash2,
  CalendarCheck,
  Building2,
  Clock,
  TrendingUp,
  Plus,
  X,
  Filter,
  ChevronDown,
  Calendar as CalendarIcon,
  PhoneCall,
  SlidersHorizontal,
  Dumbbell,
  Lock,
  Eye,
  EyeOff,
  Phone,
  Menu,
  Sun,
  Moon,
  Banknote,
  LogOut as LogoutIcon,
} from "lucide-react";
import api from "../../services/api";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Modal State untuk Konfirmasi Hapus Jadwal
  const [deleteModal, setDeleteModal] = useState({
    show: false,
    id: null,
  });

  // Filter States
  const [filterDate, setFilterDate] = useState("");
  const [filterCourt, setFilterCourt] = useState("all");

  // Form State untuk Tambah Manual
  const [newSchedule, setNewSchedule] = useState({
    date: new Date().toISOString().split("T")[0],
    court_type: "futsal",
    start_time: "08:00",
    duration: 1,
    renter_name: "",
    status: "booked",
    price: 50000,
  });

  // Data States Tarif & Ketersediaan Lapangan Spesifik
  const [settings, setSettings] = useState({
    admin_whatsapp: "",
    time_night_start: 18,
    courts: {
      futsal: {
        active: true,
        price_day: 80000,
        price_night: 120000,
      },
      volleyball: {
        active: true,
        price_day: 50000,
        price_night: 80000,
      },
      badminton: {
        active: false,
        price_day: 40000,
        price_night: 60000,
      },
    },
  });

  const [schedules, setSchedules] = useState([]);

  // Profile & Password States
  const [adminProfile, setAdminProfile] = useState({
    name: "Admin Trutup Sport",
    whatsapp: "6288200994714",
    role: "Administrator",
  });
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      navigate("/login");
      return;
    }
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    api
      .get("/settings")
      .then((res) => {
        const data = res.data?.data || res.data || {};
        setSettings((prev) => ({
          ...prev,
          admin_whatsapp: data.admin_whatsapp || prev.admin_whatsapp,
          time_night_start: data.time_night_start || prev.time_night_start,
          courts: {
            futsal: {
              active: Boolean(
                data.court_active_futsal ?? prev.courts.futsal.active,
              ),
              price_day: data.futsal_price_day || prev.courts.futsal.price_day,
              price_night:
                data.futsal_price_night || prev.courts.futsal.price_night,
            },
            volleyball: {
              active: Boolean(
                data.court_active_volleyball ?? prev.courts.volleyball.active,
              ),
              price_day:
                data.volleyball_price_day || prev.courts.volleyball.price_day,
              price_night:
                data.volleyball_price_night ||
                prev.courts.volleyball.price_night,
            },
            badminton: {
              active: Boolean(
                data.court_active_badminton ?? prev.courts.badminton.active,
              ),
              price_day:
                data.badminton_price_day || prev.courts.badminton.price_day,
              price_night:
                data.badminton_price_night || prev.courts.badminton.price_night,
            },
          },
        }));
        if (data.admin_whatsapp) {
          setAdminProfile((prev) => ({
            ...prev,
            whatsapp: data.admin_whatsapp,
          }));
        }
      })
      .catch((err) => console.error("Gagal memuat settings:", err));

    api
      .get("/admin/schedules")
      .then((res) => {
        setSchedules(res.data?.data || res.data || []);
      })
      .catch((err) => console.error("Gagal memuat schedules:", err));
  };

  const handleConfirmLogout = () => {
    api.post("/admin/logout").finally(() => {
      localStorage.removeItem("admin_token");
      navigate("/");
    });
  };

  const handleAddSchedule = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });
    try {
      const res = await api.post("/admin/schedules", newSchedule);
      setSchedules([res.data?.data || res.data, ...schedules]);
      setShowAddModal(false);
      setMessage({
        type: "success",
        text: "Jadwal baru berhasil ditambahkan!",
      });
      setNewSchedule({
        date: new Date().toISOString().split("T")[0],
        court_type: "futsal",
        start_time: "08:00",
        duration: 1,
        renter_name: "",
        status: "booked",
        price: settings.courts.futsal.price_day || 50000,
      });
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Gagal menambahkan jadwal.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await api.put(`/admin/schedules/${id}`, { status: newStatus });
      setSchedules(
        schedules.map((s) => (s.id === id ? { ...s, status: newStatus } : s)),
      );
      setMessage({
        type: "success",
        text: "Status label berhasil diperbarui!",
      });
    } catch (err) {
      setMessage({ type: "error", text: "Gagal mengubah status label." });
    }
  };

  // Membuka Modal Konfirmasi Hapus
  const handleOpenDeleteModal = (id) => {
    setDeleteModal({ show: true, id });
  };

  // Eksekusi Hapus dari Modal Custom Pop-Up
  const handleConfirmDeleteSchedule = async () => {
    if (!deleteModal.id) return;
    setLoading(true);
    try {
      await api.delete(`/admin/schedules/${deleteModal.id}`);
      setSchedules(schedules.filter((s) => s.id !== deleteModal.id));
      setMessage({ type: "success", text: "Jadwal berhasil dihapus!" });
    } catch (err) {
      setMessage({ type: "error", text: "Gagal menghapus jadwal." });
    } finally {
      setLoading(false);
      setDeleteModal({ show: false, id: null });
    }
  };

  const handleSaveCourtsAndPrices = async (e) => {
    if (e) e.preventDefault();
    setMessage({ type: "", text: "" });
    setLoading(true);

    const payload = {
      time_night_start: settings.time_night_start,

      court_active_futsal: settings.courts.futsal.active,
      court_active_volleyball: settings.courts.volleyball.active,
      court_active_badminton: settings.courts.badminton.active,

      futsal_price_day: settings.courts.futsal.price_day,
      futsal_price_night: settings.courts.futsal.price_night,

      volleyball_price_day: settings.courts.volleyball.price_day,
      volleyball_price_night: settings.courts.volleyball.price_night,

      badminton_price_day: settings.courts.badminton.price_day,
      badminton_price_night: settings.courts.badminton.price_night,
    };

    try {
      await api.put("/admin/settings/pricing", payload);
      setMessage({
        type: "success",
        text: "Pengaturan tarif dan ketersediaan semua lapangan berhasil disimpan!",
      });
    } catch (err) {
      setMessage({
        type: "error",
        text:
          err.response?.data?.message ||
          "Gagal menyimpan pengaturan tarif & fasilitas.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveWhatsapp = async (e) => {
    if (e) e.preventDefault();
    setMessage({ type: "", text: "" });
    setLoading(true);
    try {
      await api.put("/admin/settings/whatsapp", {
        admin_whatsapp: settings.admin_whatsapp,
      });
      setAdminProfile((prev) => ({
        ...prev,
        whatsapp: settings.admin_whatsapp,
      }));
      setMessage({
        type: "success",
        text: "Nomor WhatsApp berhasil diperbarui!",
      });
    } catch (err) {
      setMessage({ type: "error", text: "Gagal memperbarui WhatsApp." });
    } finally {
      setLoading(false);
    }
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });
    setLoading(true);
    try {
      await api.put("/admin/settings/password", {
        old_password: oldPassword,
        new_password: newPassword,
      });
      setMessage({ type: "success", text: "Kata sandi berhasil diperbarui!" });
      setOldPassword("");
      setNewPassword("");
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Gagal mengubah kata sandi.",
      });
    } finally {
      setLoading(false);
    }
  };

  const getFormattedDate = () => {
    return new Date().toLocaleDateString("id-ID", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const todayStr = new Date().toISOString().split("T")[0];

  const filteredSchedules = schedules.filter((s) => {
    const matchCourt = filterCourt === "all" || s.court_type === filterCourt;
    const matchDate = filterDate ? s.date === filterDate : s.date >= todayStr;
    return matchCourt && matchDate;
  });

  return (
    <div className="flex h-screen bg-[#f8fafb] font-sans antialiased overflow-hidden">
      <link
        href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />
      <style>{`
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
        ::-webkit-scrollbar { display: none !important; }
        html, body { -ms-overflow-style: none !important; scrollbar-width: none !important; }
      `}</style>

      {/* OVERLAY MOBILE SIDEBAR */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-30 lg:hidden"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between shrink-0 z-40 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div>
          <div className="h-16 lg:h-20 flex items-center px-6 border-b border-slate-100 justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 flex items-center justify-center shrink-0">
                <img
                  src="/images/logo-green.png"
                  alt="Logo Trutup Sport Center"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="font-extrabold text-[#0a8754] text-base lg:text-lg leading-tight tracking-tight font-heading">
                Trutup
                <br />
                <span className="text-emerald-600">Sport Center</span>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="p-3 lg:p-4 space-y-1.5">
            {[
              { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
              {
                id: "schedules",
                label: "Manajemen Jadwal",
                icon: CalendarDays,
              },
              {
                id: "utilities",
                label: "Pengaturan & Utilitas",
                icon: Settings,
              },
              { id: "profile", label: "Profil", icon: User },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setMessage({ type: "", text: "" });
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 lg:px-4 py-2.5 lg:py-3 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                    active
                      ? "bg-[#0a8754] text-white shadow-md shadow-emerald-900/10"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-3 lg:p-4 border-t border-slate-100">
          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center gap-3 px-3.5 lg:px-4 py-2.5 lg:py-3 rounded-xl font-bold text-xs text-rose-500 hover:bg-rose-50 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0" /> Keluar
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden w-full">
        <header className="h-16 bg-white flex items-center justify-between lg:hidden px-4 sm:px-6 shrink-0 relative z-10 border-b border-slate-200/80">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto">
          {message.text && (
            <div
              className={`mx-4 sm:mx-6 lg:mx-8 mt-4 p-3.5 lg:p-4 rounded-2xl text-xs font-bold flex items-center justify-between shadow-sm z-50 relative ${message.type === "success" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-rose-50 text-rose-800 border border-rose-200"}`}
            >
              <span className="flex items-center gap-2 pr-2">
                {message.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                {message.text}
              </span>
              <button
                onClick={() => setMessage({ type: "", text: "" })}
                className="cursor-pointer text-slate-400 hover:text-slate-700 shrink-0"
              >
                ✕
              </button>
            </div>
          )}

          {/* TAB: DASHBOARD */}
          {activeTab === "dashboard" && (
            <div className="pb-10">
              <div className="bg-[#0a8754] pt-6 lg:pt-8 pb-20 lg:pb-24 px-4 sm:px-6 lg:px-8 rounded-b-3xl flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 shadow-sm">
                <div className="text-white">
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight mb-1 font-heading">
                    Halo, Admin!
                  </h2>
                  <p className="text-emerald-100 text-xs font-medium opacity-90">
                    Berikut ringkasan operasional Trutup Sport Center hari ini.
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/20 text-white text-xs font-bold w-fit">
                  <CalendarDays className="w-3.5 h-3.5 shrink-0" />{" "}
                  {getFormattedDate()}
                </div>
              </div>

              {/* STAT CARDS */}
              <div className="px-4 sm:px-6 lg:px-8 -mt-14 sm:-mt-16">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
                  
                  {/* CARD 1: BOOKING HARI INI */}
                  <div className="bg-white p-4 lg:p-5 rounded-2xl shadow-xs border border-slate-200/80 flex flex-col justify-between hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#0a8754] flex items-center justify-center shrink-0">
                          <CalendarCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase block">
                            BOOKING HARI INI
                          </span>
                          <h3 className="text-xl lg:text-2xl font-black text-slate-800 leading-tight mt-0.5">
                            {
                              schedules.filter(
                                (s) =>
                                  s.status === "booked" && s.date === todayStr,
                              ).length
                            }
                          </h3>
                        </div>
                      </div>
                      <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                        <TrendingUp className="w-4 h-4" />
                      </span>
                    </div>
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="font-bold text-emerald-600 flex items-center gap-1">
                        Realtime hari ini
                      </span>
                      <span className="text-slate-400 font-medium">
                        Hari Ini
                      </span>
                    </div>
                  </div>

                  {/* CARD 2: TOTAL SEMUA BOOKING */}
                  <div className="bg-white p-4 lg:p-5 rounded-2xl shadow-xs border border-slate-200/80 flex flex-col justify-between hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase block">
                            TOTAL SEMUA BOOKING
                          </span>
                          <h3 className="text-xl lg:text-2xl font-black text-slate-800 leading-tight mt-0.5">
                            {
                              schedules.filter((s) => s.status === "booked").length
                            }
                          </h3>
                        </div>
                      </div>
                      <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
                        <Building2 className="w-4 h-4" />
                      </span>
                    </div>
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-500 truncate pr-2">
                        Sewa berbayar terakumulasi
                      </span>
                      <span className="text-slate-400 font-medium shrink-0">
                        Keseluruhan
                      </span>
                    </div>
                  </div>

                  {/* CARD 3: ESTIMASI PENDAPATAN */}
                  <div className="bg-white p-4 lg:p-5 rounded-2xl shadow-xs border border-slate-200/80 flex flex-col justify-between hover:shadow-md transition sm:col-span-2 lg:col-span-1">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                          <Banknote className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase block">
                            ESTIMASI PENDAPATAN
                          </span>
                          <h3 className="text-xl lg:text-2xl font-black text-slate-800 leading-tight mt-0.5">
                            Rp{" "}
                            {schedules
                              .filter((s) => s.status === "booked")
                              .reduce(
                                (sum, s) => sum + (Number(s.price) || 0),
                                0,
                              )
                              .toLocaleString("id-ID")}
                          </h3>
                        </div>
                      </div>
                      <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                        <Banknote className="w-4 h-4" />
                      </span>
                    </div>
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-500">
                        Total omzet sewa lapangan
                      </span>
                      <span className="text-slate-400 font-medium">Total</span>
                    </div>
                  </div>

                </div>
              </div>

              <div className="px-4 sm:px-6 lg:px-8 mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-2xl shadow-xs border border-slate-200/80">
                  <div className="flex justify-between items-center mb-5">
                    <h3 className="text-sm sm:text-base font-extrabold text-slate-800">
                      Aktivitas Terbaru
                    </h3>
                    <button
                      onClick={() => setActiveTab("schedules")}
                      className="text-xs font-bold text-[#0a8754] hover:underline cursor-pointer"
                    >
                      Lihat Semua
                    </button>
                  </div>
                  <div className="space-y-4">
                    {schedules
                      .filter((s) => s.date >= todayStr)
                      .slice(0, 4)
                      .map((s, idx) => (
                        <div
                          key={idx}
                          className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 last:border-0 last:pb-0 gap-3"
                        >
                          <div className="flex gap-3 items-start">
                            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0 mt-0.5">
                              <User className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-slate-800">
                                {s.renter_name || s.name || "Pengunjung"}
                              </h4>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                Membooking{" "}
                                <span className="capitalize font-semibold">
                                  {s.court_type}
                                </span>{" "}
                                untuk {s.date},{" "}
                                {s.start_time?.substring(0, 5)} -{" "}
                                {s.end_time?.substring(0, 5)} WIB
                              </p>
                            </div>
                          </div>
                          <span
                            className={`text-[10px] font-extrabold px-3 py-1 rounded-full shrink-0 uppercase tracking-wider w-fit ${
                              s.status === "booked"
                                ? "bg-rose-100 text-rose-700"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {s.status === "booked" ? "BOOKED" : "EVENT"}
                          </span>
                        </div>
                      ))}
                    {schedules.filter((s) => s.date >= todayStr).length ===
                      0 && (
                      <p className="text-xs text-slate-400 text-center py-6">
                        Belum ada aktivitas terbaru hari ini.
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-xs border border-slate-200/80 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm sm:text-base font-extrabold text-slate-800 mb-4 sm:mb-5">
                      Status Lapangan
                    </h3>
                    <div className="space-y-3.5 mb-6">
                      {[
                        {
                          label: "Futsal Arena",
                          active: settings.courts.futsal.active,
                        },
                        {
                          label: "Badminton",
                          active: settings.courts.badminton.active,
                        },
                        {
                          label: "Bola Voli",
                          active: settings.courts.volleyball.active,
                        },
                      ].map((court, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-2 h-2 rounded-full shrink-0 ${court.active ? "bg-emerald-500" : "bg-rose-500"}`}
                            />
                            <span className="text-xs font-bold text-slate-700">
                              {court.label}
                            </span>
                          </div>
                          <span
                            className={`text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${court.active ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-700"}`}
                          >
                            {court.active ? "Buka" : "Tutup"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab("schedules")}
                    className="w-full bg-[#eaf4f0] text-[#0a8754] font-bold text-xs py-3 rounded-xl hover:bg-emerald-100 transition cursor-pointer"
                  >
                    Lihat Jadwal Penuh
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: SCHEDULE MANAGER */}
          {activeTab === "schedules" && (
            <div className="p-4 sm:p-6 lg:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-800">
                    Manajemen Jadwal
                  </h2>
                  <p className="text-xs text-slate-500">
                    Kelola status slot jam operasional dan input booking manual.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2.5 bg-[#0a8754] text-white font-bold text-xs rounded-xl shadow-xs hover:bg-[#086c43] transition cursor-pointer flex items-center justify-center gap-2 shrink-0 w-full sm:w-auto"
                >
                  <Plus className="w-4 h-4" /> Input Jadwal Manual
                </button>
              </div>

              {/* Filter Bar */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 flex flex-wrap gap-3 items-center justify-between shadow-xs">
                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                  <div className="relative flex items-center w-full sm:w-auto">
                    <CalendarIcon className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                    <input
                      type="date"
                      value={filterDate}
                      onChange={(e) => setFilterDate(e.target.value)}
                      className="w-full sm:w-auto pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-[#0a8754] cursor-pointer"
                    />
                  </div>
                  {filterDate && (
                    <button
                      onClick={() => setFilterDate("")}
                      className="text-xs text-rose-500 font-bold hover:underline cursor-pointer"
                    >
                      Reset Tanggal
                    </button>
                  )}

                  <div className="relative flex items-center w-full sm:w-auto">
                    <Filter className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                    <select
                      value={filterCourt}
                      onChange={(e) => setFilterCourt(e.target.value)}
                      className="w-full sm:w-auto pl-9 pr-8 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-slate-50/50 appearance-none focus:outline-none focus:ring-2 focus:ring-[#0a8754] cursor-pointer capitalize"
                    >
                      <option value="all">Semua Lapangan</option>
                      <option value="futsal">Futsal Arena</option>
                      <option value="badminton">Badminton</option>
                      <option value="volleyball">Bola Voli</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 pointer-events-none" />
                  </div>
                </div>

                <span className="text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 w-full sm:w-auto text-center sm:text-left">
                  {filteredSchedules.length} Jadwal Ditemukan
                </span>
              </div>

              {/* Tabel Jadwal */}
              <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider">
                        <th className="py-4 px-6">Tanggal</th>
                        <th className="py-4 px-4">Lapangan</th>
                        <th className="py-4 px-4">Jam Rentang</th>
                        <th className="py-4 px-4">Nama Pemesan</th>
                        <th className="py-4 px-4">Status Label</th>
                        <th className="py-4 px-6 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {filteredSchedules.map((s) => (
                        <tr
                          key={s.id}
                          className="hover:bg-slate-50/60 transition"
                        >
                          <td className="py-4 px-6 font-bold text-slate-800">
                            {s.date}
                          </td>
                          <td className="py-4 px-4 capitalize font-semibold text-slate-700">
                            {s.court_type}
                          </td>
                          <td className="py-4 px-4 font-extrabold text-[#0a8754]">
                            {s.start_time?.substring(0, 5)} -{" "}
                            {s.end_time?.substring(0, 5)} WIB
                          </td>
                          <td className="py-4 px-4 font-semibold text-slate-800">
                            {s.renter_name || s.name || "-"}
                          </td>

                          <td className="py-4 px-4">
                            <div
                              onClick={() =>
                                handleUpdateStatus(
                                  s.id,
                                  s.status === "booked" ? "event" : "booked",
                                )
                              }
                              className="relative inline-flex items-center bg-slate-100 p-1 rounded-full border border-slate-200/80 cursor-pointer select-none"
                              title="Klik untuk mengubah status antara BOOKED dan EVENT"
                            >
                              <div
                                className={`absolute top-1 bottom-1 w-[68px] rounded-full transition-all duration-200 ease-in-out shadow-xs ${
                                  s.status === "booked"
                                    ? "left-1 bg-rose-500"
                                    : "left-[73px] bg-amber-400"
                                }`}
                              />
                              <div
                                className={`relative z-10 w-[68px] py-1 text-center text-[10px] font-black uppercase tracking-wider transition-colors duration-200 ${
                                  s.status === "booked"
                                    ? "text-white"
                                    : "text-slate-400 hover:text-slate-600"
                                }`}
                              >
                                BOOKED
                              </div>
                              <div
                                className={`relative z-10 w-[68px] py-1 text-center text-[10px] font-black uppercase tracking-wider transition-colors duration-200 ${
                                  s.status === "event"
                                    ? "text-slate-900"
                                    : "text-slate-400 hover:text-slate-600"
                                }`}
                              >
                                EVENT
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-6 text-right">
                            <button
                              onClick={() => handleOpenDeleteModal(s.id)}
                              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                              title="Hapus / Batalkan Slot"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredSchedules.length === 0 && (
                        <tr>
                          <td
                            colSpan="6"
                            className="py-12 text-center text-slate-400 text-xs font-medium"
                          >
                            Tidak ada data reservasi jadwal ditemukan.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: SETTINGS & UTILITIES */}
          {activeTab === "utilities" && (
            <div className="p-4 sm:p-6 lg:p-8 space-y-6">
              <div className="bg-[#eaf1ff] p-5 sm:p-6 rounded-2xl border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                    Pengaturan & Utilitas
                  </h2>
                  <p className="text-xs text-slate-600 mt-1">
                    Kelola ketersediaan fasilitas, tarif sewa spesifik, dan
                    kontak pengelola.
                  </p>
                </div>

                <div className="bg-white px-4 py-2.5 rounded-xl border border-blue-200/80 shadow-xs flex items-center gap-3 shrink-0">
                  <div className="text-left">
                    <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                      Mulai Tarif Malam
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-[#0a8754]" />
                      <input
                        type="number"
                        min="0"
                        max="23"
                        value={settings.time_night_start}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            time_night_start: e.target.value,
                          })
                        }
                        className="w-10 text-xs font-black text-slate-800 bg-slate-50 border border-slate-200 rounded px-1 text-center focus:outline-none focus:ring-1 focus:ring-[#0a8754]"
                      />
                      <span className="text-xs font-bold text-slate-700">
                        :00 WIB
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSaveCourtsAndPrices} className="space-y-6">
                <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-xs border border-slate-200/80 space-y-4">
                  <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                    <SlidersHorizontal className="w-5 h-5 text-[#0a8754]" />
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm">
                        Status Operasional Lapangan (On / Off)
                      </h3>
                      <p className="text-[11px] text-slate-400 font-medium">
                        Aktifkan atau nonaktifkan fasilitas untuk mencegah
                        pemesanan baru.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                    {[
                      { key: "futsal", title: "Futsal Arena" },
                      { key: "volleyball", title: "Bola Voli" },
                      { key: "badminton", title: "Badminton" },
                    ].map((court) => {
                      const isActive = settings.courts[court.key].active;
                      return (
                        <div
                          key={court.key}
                          className="bg-slate-50/80 p-4 rounded-xl border border-slate-100 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center text-[#0a8754] font-bold shadow-2xs">
                              <Dumbbell className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-800 text-xs">
                                {court.title}
                              </h4>
                              <span
                                className={`text-[9px] font-extrabold uppercase tracking-wider block mt-0.5 ${
                                  isActive
                                    ? "text-emerald-600"
                                    : "text-rose-500"
                                }`}
                              >
                                {isActive ? "Buka" : "Tutup"}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              setSettings({
                                ...settings,
                                courts: {
                                  ...settings.courts,
                                  [court.key]: {
                                    ...settings.courts[court.key],
                                    active: !isActive,
                                  },
                                },
                              })
                            }
                            className={`w-11 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer relative shrink-0 ${
                              isActive ? "bg-[#0a8754]" : "bg-slate-300"
                            }`}
                          >
                            <div
                              className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${
                                isActive ? "translate-x-5" : "translate-x-0"
                              }`}
                            />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-xs border border-slate-200/80 space-y-4">
                  <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                    <Banknote className="w-5 h-5 text-[#0a8754]" />
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm">
                        Pengaturan Tarif Sewa Lapangan (Siang & Malam)
                      </h3>
                      <p className="text-[11px] text-slate-400 font-medium">
                        Atur nominal biaya sewa per jam untuk masing-masing
                        lapangan.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-1">
                    {[
                      { key: "futsal", title: "Futsal Arena" },
                      { key: "volleyball", title: "Bola Voli" },
                      { key: "badminton", title: "Badminton" },
                    ].map((court) => {
                      const courtData = settings.courts[court.key];
                      return (
                        <div
                          key={court.key}
                          className="bg-slate-50/50 p-4 rounded-xl border border-slate-200/80 space-y-3.5"
                        >
                          <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60">
                            <span className="w-2 h-2 rounded-full bg-[#0a8754]" />
                            <h4 className="font-extrabold text-slate-800 text-xs">
                              {court.title}
                            </h4>
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                              <Sun className="w-3.5 h-3.5 text-amber-500" />{" "}
                              Tarif Siang (per Jam)
                            </label>
                            <div className="relative">
                              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-bold text-slate-400 pointer-events-none">
                                Rp
                              </span>
                              <input
                                type="number"
                                value={courtData.price_day}
                                onChange={(e) =>
                                  setSettings({
                                    ...settings,
                                    courts: {
                                      ...settings.courts,
                                      [court.key]: {
                                        ...courtData,
                                        price_day: e.target.value,
                                      },
                                    },
                                  })
                                }
                                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0a8754]"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                              <Moon className="w-3.5 h-3.5 text-indigo-500" />{" "}
                              Tarif Malam (per Jam)
                            </label>
                            <div className="relative">
                              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-bold text-slate-400 pointer-events-none">
                                Rp
                              </span>
                              <input
                                type="number"
                                value={courtData.price_night}
                                onChange={(e) =>
                                  setSettings({
                                    ...settings,
                                    courts: {
                                      ...settings.courts,
                                      [court.key]: {
                                        ...courtData,
                                        price_night: e.target.value,
                                      },
                                    },
                                  })
                                }
                                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0a8754]"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#0a8754] text-white font-bold text-xs hover:bg-[#086c43] transition cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Save className="w-4 h-4" /> Simpan Pengaturan
                    </button>
                  </div>
                </div>
              </form>

              <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-xs border border-slate-200/80 space-y-4 max-w-xl">
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                  <PhoneCall className="w-5 h-5 text-[#0a8754]" />
                  <h3 className="font-bold text-slate-900 text-sm">
                    Pengaturan Kontak WhatsApp
                  </h3>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700">
                    Nomor WhatsApp Admin
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-xs font-bold text-slate-500 pointer-events-none">
                      +62
                    </span>
                    <input
                      type="text"
                      value={settings.admin_whatsapp
                        .replace(/^62/, "")
                        .replace(/^\+62/, "")}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          admin_whatsapp:
                            "62" + e.target.value.replace(/^0/, ""),
                        })
                      }
                      className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0a8754]"
                      placeholder="81234567890"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Nomor yang digunakan pengunjung untuk mengonfirmasi bukti
                    transfer pemesanan.
                  </p>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleSaveWhatsapp}
                    disabled={loading}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#0a8754] text-white font-bold text-xs hover:bg-[#086c43] transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" /> Perbarui Nomor WA
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: PROFILE */}
          {activeTab === "profile" && (
            <div className="p-4 sm:p-6 lg:p-8 space-y-6">
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-800">
                  Profil Admin
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Kelola informasi akun pengelola dan ubah kata sandi sistem.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-xs border border-slate-200/80 space-y-5">
                  <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                    <User className="w-5 h-5 text-[#0a8754]" />
                    <h3 className="font-bold text-sm text-slate-800">
                      Informasi Akun
                    </h3>
                  </div>

                  <div className="flex items-center gap-4 bg-slate-50/80 p-4 rounded-xl border border-slate-100">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100/80 border border-emerald-200 p-2 flex items-center justify-center shrink-0 shadow-sm">
                      <img
                        src="/images/logo-green.png"
                        alt="Trutup Sport Center Logo"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        {adminProfile.name}
                      </h4>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full inline-block mt-1">
                        {adminProfile.role}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3.5 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-500 mb-1">
                        Nama Akun
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                        <input
                          type="text"
                          disabled
                          value={adminProfile.name}
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-500 mb-1">
                        Nomor WhatsApp Pengelola
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                        <input
                          type="text"
                          disabled
                          value={
                            "+" +
                            (settings.admin_whatsapp || adminProfile.whatsapp)
                          }
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 cursor-not-allowed"
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Nomor WA aktif yang menerima pesanan (Ubah melalui menu
                        Pengaturan & Utilitas).
                      </p>
                    </div>
                  </div>
                </div>

                <form
                  onSubmit={handleSavePassword}
                  className="bg-white p-5 sm:p-6 rounded-2xl shadow-xs border border-slate-200/80 space-y-4"
                >
                  <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                    <Lock className="w-5 h-5 text-[#0a8754]" />
                    <h3 className="font-bold text-sm text-slate-800">
                      Ubah Kata Sandi
                    </h3>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Password Lama
                    </label>
                    <div className="relative">
                      <input
                        type={showOldPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0a8754]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowOldPassword(!showOldPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                      >
                        {showOldPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Password Baru
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0a8754]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                      >
                        {showNewPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full sm:w-auto py-2.5 px-5 rounded-xl bg-[#0a8754] text-white font-bold text-xs hover:bg-[#086c43] transition cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Save className="w-4 h-4" /> Perbarui Sandi
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL KONFIRMASI HAPUS JADWAL (CUSTOM POP-UP) */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-slate-100 text-center space-y-4 my-auto">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                Hapus Jadwal Ini?
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Slot jadwal ini akan dihapus permanen dari sistem dan ketersediaan lapangan akan terbuka kembali.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setDeleteModal({ show: false, id: null })}
                className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDeleteSchedule}
                disabled={loading}
                className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition cursor-pointer shadow-sm"
              >
                {loading ? "Deleting..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI KELUAR / LOGOUT */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-slate-100 text-center space-y-4 my-auto">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <LogoutIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                Konfirmasi Keluar
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Apakah Anda yakin ingin keluar dari halaman dashboard admin
                Trutup Sport Center?
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmLogout}
                className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition cursor-pointer shadow-sm"
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL INPUT JADWAL MANUAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl p-5 sm:p-6 w-full max-w-md shadow-2xl border border-slate-100 space-y-4 my-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-800">
                Tambah Jadwal Booking / Event
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form
              onSubmit={handleAddSchedule}
              className="space-y-3 text-xs font-semibold"
            >
              <div>
                <label className="block text-slate-500 mb-1">Tanggal</label>
                <input
                  type="date"
                  required
                  value={newSchedule.date}
                  onChange={(e) =>
                    setNewSchedule({ ...newSchedule, date: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>
              <div>
                <label className="block text-slate-500 mb-1">
                  Pilih Lapangan
                </label>
                <select
                  value={newSchedule.court_type}
                  onChange={(e) =>
                    setNewSchedule({
                      ...newSchedule,
                      court_type: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 font-bold capitalize"
                >
                  <option value="futsal">Futsal Arena</option>
                  <option value="badminton">Badminton</option>
                  <option value="volleyball">Bola Voli</option>
                </select>
              </div>

              {/* GRID JAM MULAI & DURASI SEWA */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 mb-1">Jam Mulai</label>
                  <input
                    type="time"
                    required
                    value={newSchedule.start_time}
                    onChange={(e) =>
                      setNewSchedule({
                        ...newSchedule,
                        start_time: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">
                    Durasi Sewa
                  </label>
                  <select
                    value={newSchedule.duration}
                    onChange={(e) =>
                      setNewSchedule({
                        ...newSchedule,
                        duration: Number(e.target.value),
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 font-bold"
                  >
                    <option value={1}>1 Jam</option>
                    <option value={2}>2 Jam</option>
                    <option value={3}>3 Jam</option>
                    <option value={4}>4 Jam</option>
                    <option value={5}>5 Jam</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-500 mb-1">
                  Status Label
                </label>
                <select
                  value={newSchedule.status}
                  onChange={(e) =>
                    setNewSchedule({ ...newSchedule, status: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 font-bold"
                >
                  <option value="booked">Booked (Merah)</option>
                  <option value="event">Event (Kuning)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 mb-1">
                  Nama Pemesan / Penanggung Jawab
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi (WA)"
                  value={newSchedule.renter_name}
                  onChange={(e) =>
                    setNewSchedule({
                      ...newSchedule,
                      renter_name: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#0a8754] text-white font-bold rounded-xl mt-2 cursor-pointer hover:bg-[#086c43] transition"
              >
                {loading ? "Menyimpan..." : "Simpan Jadwal"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}