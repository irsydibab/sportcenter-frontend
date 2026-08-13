import React, { useState, useEffect } from "react";
import {
  X,
  Calendar,
  User,
  Phone,
  MapPin,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  QrCode,
  Banknote,
  AlertCircle,
  Sun,
  Moon,
} from "lucide-react";
import api from "../services/api";

export default function BookingModal({
  isOpen,
  onClose,
  initialCourtType,
  adminWhatsapp,
}) {
  if (!isOpen) return null;

  const [step, setStep] = useState("slots"); // 'slots' | 'form' | 'summary'
  const [courtType, setCourtType] = useState(initialCourtType || "futsal");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [startTime, setStartTime] = useState("16:00");
  const [duration, setDuration] = useState(1);
  const [bookedSchedules, setBookedSchedules] = useState([]);
  const [settings, setSettings] = useState({});

  // Loading State saat Simpan API
  const [loading, setLoading] = useState(false);

  // Validation Error State
  const [timeConflictError, setTimeConflictError] = useState("");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("ewallet");
  const [phoneError, setPhoneError] = useState("");
  const [nameError, setNameError] = useState("");

  useEffect(() => {
    setCourtType(initialCourtType || "futsal");
  }, [initialCourtType]);

  useEffect(() => {
    api
      .get("/settings")
      .then((res) => {
        if (res.data && res.data.data) {
          setSettings(res.data.data);
        } else if (res.data) {
          setSettings(res.data);
        }
      })
      .catch((err) => console.error("Gagal memuat pengaturan", err));
  }, []);

  useEffect(() => {
    if (date && courtType) {
      api
        .get(`/schedules?court_type=${courtType}&date=${date}`)
        .then((res) => {
          setBookedSchedules(res.data?.data || res.data || []);
          setTimeConflictError("");
        })
        .catch((err) => console.error("Gagal memuat jadwal", err));
    }
  }, [courtType, date]);

  const isCourtActive = (type) => {
    const val = settings[`court_active_${type}`];
    if (val !== undefined) {
      return val === true || val === "true" || val === 1 || val === "1";
    }
    return true;
  };

  const getMinCourtPrice = (type) => {
    const priceKey = `${type}_price_day`;
    const price = settings[priceKey] || settings.price_day || 50000;
    return Math.round(price / 1000);
  };

  const getSingleHourPrice = (timeStr, currentCourt) => {
    if (!timeStr) return 50000;
    const hour = parseInt(timeStr.split(":")[0]);
    const nightStart = parseInt(settings.time_night_start || 18);
    const isNight = hour >= nightStart;

    const dayPriceKey = `${currentCourt}_price_day`;
    const nightPriceKey = `${currentCourt}_price_night`;

    if (isNight) {
      return parseInt(settings[nightPriceKey] || settings.price_night || 100000);
    }
    return parseInt(settings[dayPriceKey] || settings.price_day || 50000);
  };

  const isNightRate = () => {
    if (!startTime) return false;
    const hour = parseInt(startTime.split(":")[0]);
    const nightStart = parseInt(settings.time_night_start || 18);
    return hour >= nightStart;
  };

  const getTotalPrice = () => {
    const hourlyRate = getSingleHourPrice(startTime, courtType);
    return Math.round(hourlyRate * duration);
  };

  // CEK BENTROKAN WAKTU & JAM WARGA
  const checkTimeConflict = () => {
    if (!startTime) return false;

    const [startHour, startMin] = startTime.split(":").map(Number);
    const userStartMinutes = startHour * 60 + startMin;
    const userEndMinutes = userStartMinutes + duration * 60;

    // Jam Warga (15:00 - 18:00)
    const wargaStartMinutes = 15 * 60;
    const wargaEndMinutes = 18 * 60;

    if (
      userStartMinutes < wargaEndMinutes &&
      userEndMinutes > wargaStartMinutes
    ) {
      return "Jam 15:00 - 18:00 WIB tidak dapat dipesan (digunakan khusus untuk kegiatan warga desa).";
    }

    // Cek Bentrok dengan Jadwal Pending, Booked, dan Event
    const filledSchedules = bookedSchedules.filter(
      (s) => s.status === "pending" || s.status === "booked" || s.status === "event",
    );

    for (let s of filledSchedules) {
      if (!s.start_time) continue;
      const [bHour, bMin] = s.start_time.split(":").map(Number);
      const bookedStartMinutes = bHour * 60 + bMin;
      const bookedEndMinutes = bookedStartMinutes + 60;

      if (
        userStartMinutes < bookedEndMinutes &&
        userEndMinutes > bookedStartMinutes
      ) {
        return `Jam ${startTime} WIB bentrok dengan jadwal yang sudah dipesan/menunggu konfirmasi`;
      }
    }
    return "";
  };

  const handleProceedToForm = (e) => {
    e.preventDefault();

    const conflict = checkTimeConflict();
    if (conflict) {
      setTimeConflictError(conflict);
      return;
    }

    setTimeConflictError("");
    setStep("form");
  };

  const handleProceedToSummary = (e) => {
    e.preventDefault();
    let isValid = true;

    const cleanName = name.trim();
    if (cleanName.split(/\s+/).length < 2 || cleanName.length < 3) {
      setNameError("Mohon masukkan nama lengkap minimal 2 kata");
      isValid = false;
    } else {
      setNameError("");
    }

    const cleanPhone = phone.trim().replace(/[-()\s]/g, "");
    const phoneRegex = /^(?:08|\+628|628)[0-9]{8,11}$/;
    if (!phoneRegex.test(cleanPhone)) {
      setPhoneError("Nomor WhatsApp tidak valid (misal: 08123456789)");
      isValid = false;
    } else {
      setPhoneError("");
    }

    if (!isValid) return;
    setStep("summary");
  };

  // INTEGRASI API PUBLIK + WHATSAPP
  const handleSendToWhatsApp = async () => {
    setLoading(true);
    const totalPrice = getTotalPrice();

    const payload = {
      court_type: courtType,
      date: date,
      start_time: startTime,
      duration: duration,
      renter_name: name,
      price: totalPrice,
    };

    try {
      // 1. Simpan ke Backend Laravel (Status 'pending')
      const res = await api.post("/schedules/booking", payload);

      if (res.data?.success || res.status === 200) {
        const adminPhone = settings.admin_whatsapp || adminWhatsapp || "6288200994714";
        const formattedPaymentMethod =
          paymentMethod === "ewallet"
            ? "QRIS / E-Wallet Instant"
            : "Cash / Bayar di Tempat";

        const message = `*KONFIRMASI PEMESANAN LAPANGAN*
*Trutup Sport Center*

Halo Admin, saya ingin mengkonfirmasi pemesanan lapangan dengan rincian berikut:

*Rincian Booking:*
*Lapangan:* ${courtType.toUpperCase()}
*Tanggal:* ${formatReadableDate(date)}
*Waktu:* ${startTime} WIB (${duration} Jam)

*Data Pemesan:*
*Nama:* ${name}
*No. WA:* ${phone}
*Alamat:* ${address ? address : "-"}

*Pembayaran:*
*Metode:* ${formattedPaymentMethod}
*Total Biaya:* Rp ${totalPrice.toLocaleString("id-ID")}

Mohon instruksi selanjutnya. Terima kasih!`;

        // 2. Buka WhatsApp Admin
        window.open(
          `https://wa.me/${adminPhone}?text=${encodeURIComponent(message)}`,
          "_blank",
        );
        onClose();
      }
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Gagal membuat pesanan. Silakan coba lagi.",
      );
    } finally {
      setLoading(false);
    }
  };

  const formatReadableDate = (dateString) => {
    if (!dateString) return "";
    const options = {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    };
    return new Date(dateString).toLocaleDateString("id-ID", options);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/60 backdrop-blur-xs transition-all">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[88vh] border border-slate-100">
        {/* Header & Step Indicator */}
        <div className="px-5 pt-4 pb-3 border-b border-slate-100 shrink-0 bg-white space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#0d3a2d]/10 text-[#0d3a2d] flex items-center justify-center font-bold">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm md:text-base font-heading tracking-tight">
                  Pesan Lapangan Olahraga
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  {step === "slots" && "Pilih jam mulai fleksibel & durasi sewa."}
                  {step === "form" && "Lengkapi data Anda untuk konfirmasi."}
                  {step === "summary" && "Tinjau pesanan & metode pembayaran."}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center hover:bg-slate-200 hover:text-slate-700 transition cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1 pt-0.5">
            <div className="grid grid-cols-3 gap-1.5">
              <div
                className={`h-1.5 rounded-full transition-all ${["slots", "form", "summary"].includes(step) ? "bg-[#0d3a2d]" : "bg-slate-100"}`}
              />
              <div
                className={`h-1.5 rounded-full transition-all ${["form", "summary"].includes(step) ? "bg-[#0d3a2d]" : "bg-slate-100"}`}
              />
              <div
                className={`h-1.5 rounded-full transition-all ${step === "summary" ? "bg-[#0d3a2d]" : "bg-slate-100"}`}
              />
            </div>
            <div className="flex justify-between text-[10px] font-bold text-slate-400 px-0.5">
              <span className={step === "slots" ? "text-[#0d3a2d] font-extrabold" : ""}>
                Step 1: Jadwal
              </span>
              <span className={step === "form" ? "text-[#0d3a2d] font-extrabold" : ""}>
                Step 2: Detail
              </span>
              <span className={step === "summary" ? "text-[#0d3a2d] font-extrabold" : ""}>
                Step 3: Bayar
              </span>
            </div>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* STEP 1: JADWAL FLEKSIBEL */}
          {step === "slots" && (
            <div className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-900 uppercase tracking-wider mb-2 font-heading">
                  Pilih Lapangan
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "futsal", label: "Futsal", key: "futsal" },
                    { id: "volleyball", label: "Volleyball", key: "volleyball" },
                    { id: "badminton", label: "Badminton", key: "badminton" },
                  ].map((item) => {
                    const isAvailable = isCourtActive(item.key);
                    const isSelected = courtType === item.id;
                    const minPrice = getMinCourtPrice(item.key);

                    return (
                      <button
                        key={item.id}
                        type="button"
                        disabled={!isAvailable}
                        onClick={() => {
                          if (isAvailable) setCourtType(item.id);
                        }}
                        className={`py-2.5 px-2 rounded-xl border text-center transition flex flex-col items-center justify-center gap-0.5 ${
                          !isAvailable
                            ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60 line-through"
                            : isSelected
                              ? "bg-[#0d3a2d] text-white border-[#0d3a2d] shadow-xs"
                              : "border-slate-200 bg-white text-slate-800 hover:border-slate-300 cursor-pointer"
                        }`}
                      >
                        <span className={`font-bold text-xs capitalize font-heading ${isSelected && isAvailable ? "text-white" : "text-slate-900"}`}>
                          {item.label}
                        </span>
                        <span className={`text-[9px] font-medium ${!isAvailable ? "text-rose-500 font-bold no-underline" : isSelected ? "text-emerald-200" : "text-slate-400"}`}>
                          {isAvailable ? `Mulai Rp ${minPrice}rb` : "TUTUP"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-extrabold text-slate-900 uppercase tracking-wider font-heading">
                  Pilih Tanggal
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0d3a2d] bg-slate-50/50 cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-extrabold text-slate-900 uppercase tracking-wider font-heading">
                    Jam Mulai Main
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => {
                      setStartTime(e.target.value);
                      setTimeConflictError("");
                    }}
                    className={`w-full px-3 py-2.5 rounded-xl border text-xs font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0d3a2d] bg-slate-50/50 cursor-pointer ${timeConflictError ? "border-rose-500 ring-1 ring-rose-500" : "border-slate-200"}`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-extrabold text-slate-900 uppercase tracking-wider font-heading">
                    Durasi Main
                  </label>
                  <select
                    value={duration}
                    onChange={(e) => {
                      setDuration(Number(e.target.value));
                      setTimeConflictError("");
                    }}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0d3a2d] bg-slate-50/50 cursor-pointer"
                  >
                    <option value={1}>1 Jam</option>
                    <option value={2}>2 Jam</option>
                    <option value={3}>3 Jam</option>
                    <option value={4}>4 Jam</option>
                    <option value={5}>5 Jam</option>
                  </select>
                </div>
              </div>

              {timeConflictError && (
                <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl flex items-start gap-2.5 text-rose-800 text-xs font-bold">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{timeConflictError}</span>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: DETAIL DATA DIRI */}
          {step === "form" && (
            <form onSubmit={handleProceedToSummary} className="space-y-3">
              <div className="space-y-1">
                <label className="block text-[11px] font-extrabold text-slate-900 font-heading">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="Masukkan nama lengkap minimal 2 kata"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (nameError) setNameError("");
                    }}
                    className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-xs font-bold text-slate-900 bg-slate-50/50 focus:outline-none focus:ring-1 ${nameError ? "border-rose-500 ring-rose-500/20" : "border-slate-200 focus:ring-[#0d3a2d]"}`}
                  />
                </div>
                {nameError && (
                  <p className="text-[10px] text-rose-600 font-semibold flex items-center gap-1 mt-0.5">
                    <AlertCircle className="w-3 h-3" /> {nameError}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-extrabold text-slate-900 font-heading">
                  Nomor WhatsApp
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="tel"
                    required
                    placeholder="Contoh: 081234567890"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (phoneError) setPhoneError("");
                    }}
                    className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-xs font-bold text-slate-900 bg-slate-50/50 focus:outline-none focus:ring-1 ${phoneError ? "border-rose-500 ring-rose-500/20" : "border-slate-200 focus:ring-[#0d3a2d]"}`}
                  />
                </div>
                {phoneError && (
                  <p className="text-[10px] text-rose-600 font-semibold flex items-center gap-1 mt-0.5">
                    <AlertCircle className="w-3 h-3" /> {phoneError}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-extrabold text-slate-900 font-heading">
                  Alamat{" "}
                  <span className="text-slate-400 font-normal">(Opsional)</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <MapPin className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="text"
                    placeholder="Contoh: Desa Trutup"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#0d3a2d] text-xs font-bold text-slate-900 bg-slate-50/50"
                  />
                </div>
              </div>

              <div className="bg-[#0d3a2d] text-white p-3 rounded-xl flex items-start gap-2.5 shadow-xs">
                <div className="p-1.5 bg-white/10 rounded-lg text-emerald-300 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="font-bold text-[11px] text-white font-heading">
                    Privasi Terjamin
                  </h5>
                  <p className="text-[10px] text-emerald-100/90 font-medium mt-0.5 leading-tight">
                    Data Anda aman dan hanya digunakan untuk konfirmasi pesanan
                    lapangan.
                  </p>
                </div>
              </div>
            </form>
          )}

          {/* STEP 3: RINGKASAN & PEMBAYARAN */}
          {step === "summary" && (
            <div className="space-y-3.5">
              <div className="bg-slate-50 rounded-xl border border-slate-200/80 overflow-hidden shadow-2xs">
                <div className="px-3.5 py-2.5 bg-slate-100/80 border-b border-slate-200/60 flex justify-between items-center">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block font-heading">
                      Ringkasan
                    </span>
                    <h4 className="font-bold text-slate-900 text-xs capitalize font-heading">
                      Lapangan {courtType}
                    </h4>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-100 text-[#0d3a2d] text-[9px] font-black rounded-full uppercase">
                    Terkonfirmasi
                  </span>
                </div>

                <div className="p-3.5 space-y-2.5">
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="bg-white p-2 rounded-lg border border-slate-200/60">
                      <span className="text-[9px] text-slate-400 block uppercase font-bold">
                        Nama
                      </span>
                      <span className="font-bold text-slate-900 truncate block">
                        {name}
                      </span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-200/60">
                      <span className="text-[9px] text-slate-400 block uppercase font-bold">
                        WhatsApp
                      </span>
                      <span className="font-bold text-slate-900 truncate block">
                        {phone}
                      </span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-200/60">
                      <span className="text-[9px] text-slate-400 block uppercase font-bold">
                        Alamat
                      </span>
                      <span className="font-bold text-slate-900 truncate block">
                        {address ? address : "-"}
                      </span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-200/60">
                      <span className="text-[9px] text-slate-400 block uppercase font-bold">
                        Jam & Durasi
                      </span>
                      <span className="font-bold text-slate-900 truncate block">
                        {startTime} WIB ({duration} Jam)
                      </span>
                    </div>
                  </div>

                  <div className="bg-white p-2.5 rounded-lg border border-slate-200/60 text-[11px]">
                    <span className="text-[9px] text-slate-400 block uppercase font-bold">
                      Tanggal
                    </span>
                    <span className="font-bold text-slate-900 block mt-0.5">
                      {formatReadableDate(date)}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex justify-between items-center px-0.5">
                    <span className="text-[11px] font-extrabold text-slate-700 uppercase">
                      Total Pembayaran
                    </span>
                    <span className="text-sm font-black text-[#0d3a2d]">
                      Rp {getTotalPrice().toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] font-extrabold text-slate-900 uppercase tracking-wider font-heading">
                  Pilih Metode Pembayaran
                </label>
                <div className="space-y-1.5">
                  <div
                    onClick={() => setPaymentMethod("ewallet")}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${paymentMethod === "ewallet" ? "border-[#0d3a2d] bg-[#0d3a2d] text-white shadow-xs" : "border-slate-200 bg-white text-slate-900"}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${paymentMethod === "ewallet" ? "bg-white/10 text-emerald-300" : "bg-emerald-100 text-[#0d3a2d]"}`}
                      >
                        <QrCode className="w-4 h-4" />
                      </div>
                      <div>
                        <h5
                          className={`font-bold text-[11px] font-heading ${paymentMethod === "ewallet" ? "text-white" : "text-slate-900"}`}
                        >
                          QRIS / E-Wallet Instant
                        </h5>
                        <p
                          className={`text-[9px] ${paymentMethod === "ewallet" ? "text-emerald-100/80" : "text-slate-500"}`}
                        >
                          Konfirmasi otomatis via QRIS / Transfer
                        </p>
                      </div>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === "ewallet" ? "border-white bg-white" : "border-slate-300"}`}
                    >
                      {paymentMethod === "ewallet" && (
                        <div className="w-1.5 h-1.5 rounded-full bg-[#0d3a2d]" />
                      )}
                    </div>
                  </div>

                  <div
                    onClick={() => setPaymentMethod("cash")}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${paymentMethod === "cash" ? "border-[#0d3a2d] bg-[#0d3a2d] text-white shadow-xs" : "border-slate-200 bg-white text-slate-900"}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${paymentMethod === "cash" ? "bg-white/10 text-emerald-300" : "bg-emerald-100 text-[#0d3a2d]"}`}
                      >
                        <Banknote className="w-4 h-4" />
                      </div>
                      <div>
                        <h5
                          className={`font-bold text-[11px] font-heading ${paymentMethod === "cash" ? "text-white" : "text-slate-900"}`}
                        >
                          Bayar di Tempat (Cash)
                        </h5>
                        <p
                          className={`text-[9px] ${paymentMethod === "cash" ? "text-emerald-100/80" : "text-slate-500"}`}
                        >
                          Bayar langsung di lokasi venue
                        </p>
                      </div>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === "cash" ? "border-white bg-white" : "border-slate-300"}`}
                    >
                      {paymentMethod === "cash" && (
                        <div className="w-1.5 h-1.5 rounded-full bg-[#0d3a2d]" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions & Realtime Total Price */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
          {step === "slots" ? (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-[#0d3a2d] flex items-center justify-center shrink-0">
                {isNightRate() ? (
                  <Moon className="w-3.5 h-3.5 text-indigo-600" />
                ) : (
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider font-heading">
                  Estimasi Total ({duration} Jam)
                </span>
                <span className="text-xs font-black text-[#0d3a2d] font-heading">
                  Rp {getTotalPrice().toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          ) : (
            <button
              type="button"
              disabled={loading}
              onClick={() => {
                if (step === "form") setStep("slots");
                if (step === "summary") setStep("form");
              }}
              className="text-[11px] font-bold text-slate-600 hover:text-slate-900 transition cursor-pointer px-2 py-2"
            >
              Kembali
            </button>
          )}

          {step === "slots" && (
            <button
              type="button"
              onClick={handleProceedToForm}
              className="px-5 py-2.5 rounded-xl font-bold text-[11px] tracking-wide uppercase bg-[#0d3a2d] text-white hover:bg-[#165643] transition cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              Lanjut ke Detail <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}

          {step === "form" && (
            <button
              type="button"
              onClick={handleProceedToSummary}
              className="px-5 py-2.5 rounded-xl font-bold text-[11px] tracking-wide uppercase bg-[#0d3a2d] text-white hover:bg-[#165643] transition cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              Lanjut ke Bayar <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}

          {step === "summary" && (
            <button
              type="button"
              disabled={loading}
              onClick={handleSendToWhatsApp}
              className="px-5 py-2.5 rounded-xl font-bold text-[11px] tracking-wide uppercase bg-[#0d3a2d] text-white hover:bg-[#165643] transition cursor-pointer shadow-md flex items-center gap-1.5"
            >
              {loading ? (
                "Memproses..."
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" /> Konfirmasi WhatsApp
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}