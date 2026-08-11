import React, { useState, useEffect } from "react";
import BookingModal from "../components/BookingModal";
import ScheduleModal from "../components/ScheduleModal";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import api from "../services/api";

import {
  Trophy,
  Layers,
  Lightbulb,
  Users,
  Star,
  ParkingCircle,
  Volleyball,
  Dumbbell,
  Binary,
  CircleDot,
} from "lucide-react";

import {
  GiSoccerBall,
  GiVolleyballBall,
  GiShuttlecock,
  GiTrophy,
} from "react-icons/gi";

export default function PublicBooking({
  selectedDate,
  selectedCourt,
  adminWhatsapp,
  courtStatuses = {},
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedCourtType, setSelectedCourtType] = useState("futsal");

  const currentYear = new Date().getFullYear();
  const [settings, setSettings] = useState({});

  useEffect(() => {
    if (window.AOS) {
      window.AOS.init({
        duration: 900,
        once: true,
        offset: 100,
        easing: "cubic-bezier(0.16, 1, 0.3, 1)",
      });
    }

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

  const isCourtActive = (type) => {
    const key = `court_active_${type}`;
    if (settings[key] !== undefined) {
      return (
        settings[key] === true ||
        settings[key] === "true" ||
        settings[key] === 1 ||
        settings[key] === "1"
      );
    }
    return courtStatuses[type] ?? true;
  };

  const getMinCourtPrice = (type) => {
    const priceKey = `${type}_price_day`;
    const price = settings[priceKey] || settings.price_day || 50000;
    return Math.round(price / 1000);
  };

  const isFutsalActive = isCourtActive("futsal");
  const isVoliActive = isCourtActive("volleyball");
  const isBadmintonActive = isCourtActive("badminton");

  const handleOpenBookingPopup = (type) => {
    if (!isCourtActive(type)) return;
    setSelectedCourtType(type);
    setIsModalOpen(true);
  };

  const scrollToBooking = () => {
    const section = document.getElementById("booking-section");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="antialiased text-slate-800 bg-[#f8faf9] font-sans min-h-screen overflow-x-hidden selection:bg-[#0d3a2d] selection:text-white relative">
      <link
        href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet" />

      <style>{`
        ::-webkit-scrollbar { display: none !important; }
        html, body {
            -ms-overflow-style: none !important;
            scrollbar-width: none !important;
            font-family: 'Plus Jakarta Sans', sans-serif;
            overflow-x: hidden;
        }
        h1, h2, h3, h4, .font-heading {
            font-family: 'Montserrat', sans-serif;
            letter-spacing: -0.02em;
        }
        .hero-gradient {
            background: linear-gradient(135deg, #0d3a2d 0%, #165643 50%, #0f4435 100%);
        }
        .hero-bottom-shadow {
            background: linear-gradient(180deg, rgba(13, 58, 45, 0) 0%, rgba(9, 41, 32, 0.65) 100%);
        }

        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-16px) rotate(12deg); }
        }
        @keyframes floatReverse {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(14px) rotate(-10deg); }
        }
        @keyframes floatPulse {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-10px) scale(1.08); }
        }

        .animate-float-slow {
          animation: floatSlow 5s ease-in-out infinite;
        }
        .animate-float-reverse {
          animation: floatReverse 6s ease-in-out infinite;
        }
        .animate-float-pulse {
          animation: floatPulse 4.5s ease-in-out infinite;
        }
      `}</style>

      {/* HERO SECTION */}
      <div className="relative mb-20 w-full overflow-hidden">
        <section className="hero-gradient text-white rounded-b-[2rem] md:rounded-b-[2.5rem] pt-6 pb-20 md:pb-24 shadow-2xl relative w-full overflow-hidden">
          <div className="absolute inset-x-0 bottom-0 h-32 hero-bottom-shadow pointer-events-none rounded-b-[2.5rem]"></div>

          {/* ORNAMEN MELAYANG HERO SECTION */}
          {/* 1. Bola Futsal - Kiri Atas */}
          <div className="absolute top-10 left-4 sm:left-10 text-emerald-300/20 pointer-events-none animate-float-slow z-0">
            <GiSoccerBall className="w-16 h-16 sm:w-24 sm:h-24" />
          </div>

          {/* 2. Shuttlecock - Kanan Atas */}
          <div className="absolute top-8 right-6 sm:right-12 text-emerald-200/25 pointer-events-none animate-float-reverse z-0">
            <GiShuttlecock className="w-16 h-16 sm:w-24 sm:h-24 -rotate-45" />
          </div>

          {/* 3. Bola Voli - Kanan Tengah */}
          <div className="absolute top-1/3 right-4 sm:right-8 text-emerald-100/20 pointer-events-none animate-float-slow z-0">
            <GiVolleyballBall className="w-14 h-14 sm:w-20 sm:h-20" />
          </div>

          {/* 4. Bola Voli - Kiri Bawah */}
          <div className="absolute bottom-10 left-1/4 sm:left-1/3 text-emerald-200/15 pointer-events-none animate-float-pulse z-0">
            <GiVolleyballBall className="w-14 h-14 sm:w-20 sm:h-20" />
          </div>

          {/* 5. PIALA DENGAN WARNA EMAS SOFT & TRANSPARAN */}
          <div className="absolute top-1/2 left-2 sm:left-6 text-amber-400/25 pointer-events-none animate-float-reverse z-0">
            <GiTrophy className="w-12 h-12 sm:w-16 sm:h-16" />
          </div>

          {/* 6. Bola Futsal - Kanan Bawah */}
          <div className="absolute bottom-16 right-1/4 sm:right-1/3 text-emerald-200/20 pointer-events-none animate-float-slow z-0">
            <GiSoccerBall className="w-14 h-14 sm:w-18 sm:h-18" />
          </div>

          <Navbar />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-6xl mx-auto px-6 md:px-8 relative z-10">
            <div
              className="lg:col-span-7 flex flex-col"
              data-aos="fade-up"
              data-aos-duration="900"
            >
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-3.5 py-1 text-xs font-bold tracking-widest mb-5 border border-white/20 w-fit shadow-inner">
                <span className="text-yellow-400">🏆</span> KARANG TARUNA DESA
                TRUTUP
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-[2.75rem] font-black leading-[1.2] mb-5 tracking-tight font-heading text-white">
                Digerakkan Oleh{" "}
                <span className="text-emerald-300">Komunitas</span>, Untuk Semua{" "}
                <span className="text-amber-300">Pecinta Olahraga</span>
              </h1>
              <p className="text-gray-200/90 mb-8 max-w-lg text-sm md:text-base font-normal leading-relaxed">
                Fasilitas olahraga modern dengan sistem pemesanan online yang
                mudah, didedikasikan untuk komunitas desa dan pecinta olahraga
                di manapun.
              </p>

              <div className="flex flex-row items-center gap-3">
                <button
                  onClick={scrollToBooking}
                  className="bg-white text-[#0d3a2d] font-bold px-5 sm:px-7 py-3 rounded-full hover:bg-gray-100 hover:scale-105 active:scale-95 transition-all duration-500 ease-out shadow-lg text-xs sm:text-base text-center shrink-0 cursor-pointer"
                >
                  Pesan Sekarang
                </button>
                <button
                  onClick={() => setIsScheduleModalOpen(true)}
                  className="border-2 border-white/80 text-white font-bold px-5 sm:px-7 py-3 rounded-full hover:bg-white/10 hover:scale-105 active:scale-95 transition-all duration-500 ease-out text-xs sm:text-base text-center shrink-0 cursor-pointer backdrop-blur-xs"
                >
                  Lihat Jadwal
                </button>
              </div>
            </div>

            {/* GAMBAR HERO LOKAL */}
            <div
              className="lg:col-span-5 relative mt-6 lg:mt-0 flex flex-col items-end"
              data-aos="fade-up"
              data-aos-duration="900"
              data-aos-delay="200"
            >
              <img
                alt="Sport Center Aerial View"
                className="rounded-3xl shadow-2xl object-cover w-full h-[240px] lg:h-[280px]"
                src="/images/hero-venue.png"
              />

              <div className="flex items-center gap-2 mt-[-35px] mr-4 relative z-25">
                <div className="bg-white rounded-xl p-1.5 pb-2 shadow-xl transform -rotate-3 hover:rotate-0 hover:scale-105 transition-all duration-500 ease-out w-[85px] shrink-0">
                  <img
                    alt="Futsal"
                    className="w-full h-14 object-cover rounded-lg mb-1"
                    src="/images/hero-futsal.jpeg"
                  />
                  <span className="text-[#0d3a2d] font-extrabold text-[10px] px-0.5 block font-heading">
                    Futsal
                  </span>
                </div>
                <div className="bg-white rounded-xl p-1.5 pb-2 shadow-xl transform rotate-2 hover:rotate-0 hover:scale-105 transition-all duration-500 ease-out w-[85px] shrink-0">
                  <img
                    alt="Badminton"
                    className="w-full h-14 object-cover rounded-lg mb-1"
                    src="/images/hero-badminton.jpeg"
                  />
                  <span className="text-[#0d3a2d] font-extrabold text-[10px] px-0.5 block font-heading">
                    Badminton
                  </span>
                </div>
                <div className="bg-white rounded-xl p-1.5 pb-2 shadow-xl transform -rotate-2 hover:rotate-0 hover:scale-105 transition-all duration-500 ease-out w-[85px] shrink-0">
                  <img
                    alt="Voli"
                    className="w-full h-14 object-cover rounded-lg mb-1"
                    src="/images/hero-voli.jpeg"
                  />
                  <span className="text-[#0d3a2d] font-extrabold text-[10px] px-0.5 block font-heading">
                    Voli
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* BOOKING SECTION */}
      <section
        id="booking-section"
        className="py-12 max-w-6xl mx-auto px-6 md:px-8 space-y-12 relative"
      >
        <div className="absolute top-10 -left-6 sm:-left-10 text-emerald-800/10 pointer-events-none animate-float-slow">
          <GiVolleyballBall className="w-18 h-18 sm:w-24 sm:h-24" />
        </div>
        <div className="absolute bottom-4 -right-6 sm:-right-10 text-emerald-800/10 pointer-events-none animate-float-reverse">
          <GiSoccerBall className="w-20 h-20 sm:w-28 sm:h-28" />
        </div>

        <div
          className="text-center relative z-10"
          data-aos="fade-up"
          data-aos-duration="900"
        >
          <span className="bg-[#e2ebe8] text-[#0d3a2d] text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider font-heading shadow-2xs inline-block">
            E-BOOKING SYSTEM
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 mt-3 font-heading">
            PILIH LAPANGAN
          </h2>
          <p className="text-slate-500 text-sm mt-2 max-w-md mx-auto">
            Pilih jenis lapangan yang kamu inginkan dan cek ketersediaan jam
            bermain secara langsung.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch relative z-10">
          {/* Futsal Card */}
          <div
            className="bg-white rounded-3xl shadow-sm border border-slate-100 p-4 flex flex-col justify-between hover:shadow-md hover:border-slate-200 transition-all duration-300 ease-out active:scale-[0.99]"
            data-aos="fade-up"
            data-aos-duration="900"
            data-aos-delay="100"
          >
            <div className="flex flex-col h-full justify-between">
              <div>
                <div className="relative mb-4 overflow-hidden rounded-2xl">
                  <img
                    alt="Futsal"
                    className="w-full h-[180px] object-cover transform hover:scale-105 transition-transform duration-500 ease-out"
                    src="/images/booking-futsal.png"
                  />
                  <span
                    className={`absolute top-3 left-3 text-[10px] font-bold px-3 py-1 rounded-full text-white shadow-xs ${isFutsalActive ? "bg-emerald-500" : "bg-rose-500"}`}
                  >
                    {isFutsalActive ? "Buka Hari Ini" : "Tutup"}
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 mb-2 font-heading">
                  Futsal Arena
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm mb-4 min-h-[60px]">
                  Lapangan futsal type hard court yang kokoh dan responsif,
                  cocok untuk permainan cepat bersama tim.
                </p>
              </div>

              <div className="border-t border-b border-slate-100 py-3 mb-5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2 font-heading">
                  Fasilitas Lapangan
                </span>
                <ul className="grid grid-cols-2 gap-2 text-xs text-slate-600 font-medium">
                  <li className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#0d3a2d]" /> Lantai
                    Hard Court
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-[#0d3a2d]" /> Lampu
                    Sorot LED
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Dumbbell className="w-3.5 h-3.5 text-[#0d3a2d]" /> Bola
                    Futsal
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Binary className="w-3.5 h-3.5 text-[#0d3a2d]" /> Papan Skor
                    Manual
                  </li>
                  <li className="flex items-center gap-1.5 col-span-2">
                    <ParkingCircle className="w-3.5 h-3.5 text-[#0d3a2d]" />{" "}
                    Area Parkir Luas
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <span className="text-[11px] text-slate-400 font-semibold block uppercase tracking-wider">
                  Mulai Dari
                </span>
                <span className="font-extrabold text-slate-900 text-lg font-heading">
                  Rp {getMinCourtPrice("futsal")}rb
                  <span className="text-xs font-normal text-slate-500">
                    /jam
                  </span>
                </span>
              </div>
              {isFutsalActive ? (
                <button
                  onClick={() => handleOpenBookingPopup("futsal")}
                  className="bg-[#0d3a2d] text-white px-4 py-2.5 rounded-full text-xs font-bold hover:bg-[#165643] active:scale-95 transition-all duration-300 ease-out shadow-xs cursor-pointer"
                >
                  Pesan Lapangan
                </button>
              ) : (
                <button
                  disabled
                  className="bg-slate-100 text-slate-400 px-4 py-2.5 rounded-full text-xs font-bold cursor-not-allowed border border-slate-200"
                >
                  Lapangan Tutup
                </button>
              )}
            </div>
          </div>

          {/* Voli Card */}
          <div
            className="bg-white rounded-3xl shadow-sm border border-slate-100 p-4 flex flex-col justify-between hover:shadow-md hover:border-slate-200 transition-all duration-300 ease-out active:scale-[0.99]"
            data-aos="fade-up"
            data-aos-duration="900"
            data-aos-delay="200"
          >
            <div className="flex flex-col h-full justify-between">
              <div>
                <div className="relative mb-4 overflow-hidden rounded-2xl">
                  <img
                    alt="Voli"
                    className="w-full h-[180px] object-cover transform hover:scale-105 transition-transform duration-500 ease-out"
                    src="/public/images/booking-voli.png"
                  />
                  <span
                    className={`absolute top-3 left-3 text-[10px] font-bold px-3 py-1 rounded-full text-white shadow-xs ${isVoliActive ? "bg-emerald-500" : "bg-rose-500"}`}
                  >
                    {isVoliActive ? "Buka Hari Ini" : "Tutup"}
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 mb-2 font-heading">
                  Lapangan Voli
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm mb-4 min-h-[60px]">
                  Lapangan bola voli type hard court dengan rata lantai presisi
                  untuk kenyamanan smash dan pergerakan tim.
                </p>
              </div>

              <div className="border-t border-b border-slate-100 py-3 mb-5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2 font-heading">
                  Fasilitas Lapangan
                </span>
                <ul className="grid grid-cols-2 gap-2 text-xs text-slate-600 font-medium">
                  <li className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#0d3a2d]" /> Lantai
                    Hard Court
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-[#0d3a2d]" /> Lampu
                    Sorot LED
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Volleyball className="w-3.5 h-3.5 text-[#0d3a2d]" /> Bola
                    Voli
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Binary className="w-3.5 h-3.5 text-[#0d3a2d]" /> Papan Skor
                    Manual
                  </li>
                  <li className="flex items-center gap-1.5 col-span-2">
                    <ParkingCircle className="w-3.5 h-3.5 text-[#0d3a2d]" />{" "}
                    Area Parkir Luas
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <span className="text-[11px] text-slate-400 font-semibold block uppercase tracking-wider">
                  Mulai Dari
                </span>
                <span className="font-extrabold text-slate-900 text-lg font-heading">
                  Rp {getMinCourtPrice("volleyball")}rb
                  <span className="text-xs font-normal text-slate-500">
                    /jam
                  </span>
                </span>
              </div>
              {isVoliActive ? (
                <button
                  onClick={() => handleOpenBookingPopup("volleyball")}
                  className="bg-[#0d3a2d] text-white px-4 py-2.5 rounded-full text-xs font-bold hover:bg-[#165643] active:scale-95 transition-all duration-300 ease-out shadow-xs cursor-pointer"
                >
                  Pesan Lapangan
                </button>
              ) : (
                <button
                  disabled
                  className="bg-slate-100 text-slate-400 px-4 py-2.5 rounded-full text-xs font-bold cursor-not-allowed border border-slate-200"
                >
                  Lapangan Tutup
                </button>
              )}
            </div>
          </div>

          {/* Badminton Card */}
          <div
            className="bg-white rounded-3xl shadow-sm border border-slate-100 p-4 flex flex-col justify-between hover:shadow-md hover:border-slate-200 transition-all duration-300 ease-out active:scale-[0.99]"
            data-aos="fade-up"
            data-aos-duration="900"
            data-aos-delay="300"
          >
            <div className="flex flex-col h-full justify-between">
              <div>
                <div className="relative mb-4 overflow-hidden rounded-2xl">
                  <img
                    alt="Badminton"
                    className="w-full h-[180px] object-cover transform hover:scale-105 transition-transform duration-500 ease-out"
                    src="/images/booking-badminton.png"
                  />
                  <span
                    className={`absolute top-3 left-3 text-[10px] font-bold px-3 py-1 rounded-full text-white shadow-xs ${isBadmintonActive ? "bg-emerald-500" : "bg-rose-500"}`}
                  >
                    {isBadmintonActive ? "Buka Hari Ini" : "Tutup"}
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 mb-2 font-heading">
                  Lapangan Badminton
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm mb-4 min-h-[60px]">
                  Lapangan badminton type hard court standar dengan pencahayaan
                  terang dan siap digunakan.
                </p>
              </div>

              <div className="border-t border-b border-slate-100 py-3 mb-5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2 font-heading">
                  Fasilitas Lapangan{" "}
                  <span className="text-red-600">(Dalam Perbaikan)</span>
                </span>
                <ul className="grid grid-cols-2 gap-2 text-xs text-slate-600 font-medium">
                  <li className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#0d3a2d]" /> Lantai
                    Hard Court
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-[#0d3a2d]" /> Lampu
                    Sorot LED
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CircleDot className="w-3.5 h-3.5 text-[#0d3a2d]" /> Kok
                    Bawa Sendiri
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Binary className="w-3.5 h-3.5 text-[#0d3a2d]" /> Papan Skor
                    Manual
                  </li>
                  <li className="flex items-center gap-1.5 col-span-2">
                    <ParkingCircle className="w-3.5 h-3.5 text-[#0d3a2d]" />{" "}
                    Area Parkir Luas
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <span className="text-[11px] text-slate-400 font-semibold block uppercase tracking-wider">
                  Mulai Dari
                </span>
                <span className="font-extrabold text-slate-900 text-lg font-heading">
                  Rp {getMinCourtPrice("badminton")}rb
                  <span className="text-xs font-normal text-slate-500">
                    /jam
                  </span>
                </span>
              </div>
              {isBadmintonActive ? (
                <button
                  onClick={() => handleOpenBookingPopup("badminton")}
                  className="bg-[#0d3a2d] text-white px-4 py-2.5 rounded-full text-xs font-bold hover:bg-[#165643] active:scale-95 transition-all duration-300 ease-out shadow-xs cursor-pointer"
                >
                  Pesan Lapangan
                </button>
              ) : (
                <button
                  disabled
                  className="bg-slate-100 text-slate-400 px-4 py-2.5 rounded-full text-xs font-bold cursor-not-allowed border border-slate-200"
                >
                  Lapangan Tutup
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT US SECTION */}
      <section
        id="about-section"
        className="py-16 max-w-6xl mx-auto px-6 md:px-8 relative"
      >
        <div className="absolute top-1/3 left-2 sm:left-6 text-emerald-800/10 pointer-events-none animate-float-pulse">
          <GiShuttlecock className="w-16 h-16 sm:w-20 sm:h-20 -rotate-12" />
        </div>

        {/* PIALA EMAS SOFT DI ABOUT SECTION */}
        <div className="absolute bottom-10 right-2 sm:right-10 text-amber-500/20 pointer-events-none animate-float-slow">
          <GiTrophy className="w-16 h-16 sm:w-20 sm:h-20" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          <div
            className="lg:col-span-5 grid grid-cols-2 gap-4"
            data-aos="fade-up"
            data-aos-duration="900"
          >
            <div className="space-y-4">
              <img
                alt="Komunitas Warga Trutup"
                className="rounded-2xl w-full h-[140px] md:h-[160px] object-cover shadow-sm hover:scale-[1.03] transition-transform duration-500 ease-out"
                src="/images/about-1.png"
              />
              <img
                alt="Pertandingan Olahraga"
                className="rounded-2xl w-full h-[180px] md:h-[200px] object-cover shadow-sm hover:scale-[1.03] transition-transform duration-500 ease-out"
                src="/images/about-3.png"
              />
            </div>
            <div className="pt-6">
              <img
                alt="Pembinaan Karang Taruna"
                className="rounded-2xl w-full h-[260px] md:h-[300px] object-cover shadow-md hover:scale-[1.03] transition-transform duration-500 ease-out"
                src="/images/about-2.png"
              />
            </div>
          </div>

          <div
            className="lg:col-span-7"
            data-aos="fade-up"
            data-aos-duration="900"
            data-aos-delay="200"
          >
            <span className="bg-[#e2ebe8] text-[#0d3a2d] text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider font-heading inline-block mb-4 shadow-2xs">
              TENTANG KAMI
            </span>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-slate-900 mb-5 leading-tight font-heading">
              Lebih Dari Sekedar Lapangan, Kami Adalah Komunitas.
            </h2>
            <p className="text-slate-600 text-sm md:text-base leading-relaxed mb-8">
              Trutup Sport Center dikelola secara mandiri oleh Karang Taruna
              Desa Trutup untuk mewadahi semangat berolahraga, mempererat
              kebersamaan warga, serta mencetak bibit-bibit atlet muda yang
              berprestasi. Website resmi ini dikembangkan bersama oleh{" "}
              <strong className="text-slate-900">
                Kelompok 12 KKN 2026 Desa Trutup
              </strong>{" "}
              untuk mendukung digitalisasi fasilitas olahraga desa.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-500 ease-out">
                <div className="w-10 h-10 rounded-xl bg-[#0d3a2d]/10 text-[#0d3a2d] flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-slate-700 font-semibold text-sm md:text-base">
                  Fokus pada pengembangan atlet muda & pembinaan warga
                </span>
              </div>
              <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-500 ease-out">
                <div className="w-10 h-10 rounded-xl bg-[#0d3a2d]/10 text-[#0d3a2d] flex items-center justify-center shrink-0">
                  <Trophy className="w-5 h-5" />
                </div>
                <span className="text-slate-700 font-semibold text-sm md:text-base">
                  Kolaborasi pembangunan sistem digital oleh Kelompok 12 KKN
                  2026 Desa Trutup
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONI SECTION */}
      <section className="py-16 pb-28 max-w-6xl mx-auto px-6 md:px-8 relative">
        <div className="absolute top-12 left-4 sm:left-10 text-emerald-800/10 pointer-events-none animate-float-slow">
          <GiSoccerBall className="w-16 h-16 sm:w-20 sm:h-20" />
        </div>
        <div className="absolute bottom-16 right-4 sm:right-16 text-emerald-800/10 pointer-events-none animate-float-reverse">
          <GiVolleyballBall className="w-18 h-18 sm:w-24 sm:h-24" />
        </div>

        <div
          className="text-center mb-12 relative z-10"
          data-aos="fade-up"
          data-aos-duration="900"
        >
          <span className="bg-[#e2ebe8] text-[#0d3a2d] text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider font-heading inline-block mb-3 shadow-2xs">
            ULASAN PENGUNJUNG
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tight font-heading">
            TESTIMONI
          </h2>
          <p className="text-slate-500 text-sm mt-2 max-w-md mx-auto">
            Pengalaman langsung dari para pemain dan warga setempat di Trutup
            Sport Center.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          <div
            className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4"
            data-aos="fade-up"
            data-aos-duration="900"
          >
            {/* TESTIMONI 1 - IRSYADUL IBAD */}
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1.5 transition-all duration-500 ease-out">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <img
                    alt="Irsyadul Ibad"
                    className="w-10 h-10 rounded-full object-cover shrink-0 bg-emerald-50 border border-emerald-200"
                    src="https://api.dicebear.com/7.x/bottts/svg?seed=Irsyad"
                  />
                  <div>
                    <h4 className="text-slate-900 text-xs font-bold font-heading">
                      Irsyadul Ibad
                    </h4>
                    <span className="text-[10px] text-slate-400 block font-medium">
                      Pengunjung Luar Desa
                    </span>
                  </div>
                </div>
                <p className="text-slate-700 text-xs font-medium mb-4 leading-relaxed italic">
                  "Sistem e-booking sangat membantu! Dari luar desa tinggal
                  pilih jam, datang ke lokasi, dan lapangan sudah siap pakai
                  tanpa ribet."
                </p>
              </div>
              <div className="text-yellow-400 text-[10px] flex gap-0.5 pt-3 border-t border-slate-100">
                <Star className="w-3.5 h-3.5 fill-current" />
                <Star className="w-3.5 h-3.5 fill-current" />
                <Star className="w-3.5 h-3.5 fill-current" />
                <Star className="w-3.5 h-3.5 fill-current" />
                <Star className="w-3.5 h-3.5 fill-current" />
              </div>
            </div>

            {/* TESTIMONI 2 - OKTA DWI F */}
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1.5 transition-all duration-500 ease-out">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <img
                    alt="Okta Dwi F"
                    className="w-10 h-10 rounded-full object-cover shrink-0 bg-emerald-50 border border-emerald-200"
                    src="https://api.dicebear.com/7.x/bottts/svg?seed=Okta"
                  />
                  <div>
                    <h4 className="text-slate-900 text-xs font-bold font-heading">
                      Okta Dwi F
                    </h4>
                    <span className="text-[10px] text-slate-400 block font-medium">
                      Warga Trutup
                    </span>
                  </div>
                </div>
                <p className="text-slate-700 text-xs font-medium mb-4 leading-relaxed italic">
                  "Fasilitas kebanggaan warga Desa Trutup. Lapangan dan area
                  parkir bersih, lampu penerangannya juga terang kalau main
                  malam."
                </p>
              </div>
              <div className="text-yellow-400 text-[10px] flex gap-0.5 pt-3 border-t border-slate-100">
                <Star className="w-3.5 h-3.5 fill-current" />
                <Star className="w-3.5 h-3.5 fill-current" />
                <Star className="w-3.5 h-3.5 fill-current" />
                <Star className="w-3.5 h-3.5 fill-current" />
                <Star className="w-3.5 h-3.5 fill-current" />
              </div>
            </div>

            {/* TESTIMONI 3 - RAMADHAN A. P */}
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1.5 transition-all duration-500 ease-out">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <img
                    alt="Ramadhan A. P"
                    className="w-10 h-10 rounded-full object-cover shrink-0 bg-emerald-50 border border-emerald-200"
                    src="https://api.dicebear.com/7.x/bottts/svg?seed=Rama"
                  />
                  <div>
                    <h4 className="text-slate-900 text-xs font-bold font-heading">
                      Ramadhan A. P
                    </h4>
                    <span className="text-[10px] text-slate-400 block font-medium">
                      Pengunjung Luar Desa
                    </span>
                  </div>
                </div>
                <p className="text-slate-700 text-xs font-medium mb-4 leading-relaxed italic">
                  "Kondisi lantai hard court sangat nyaman untuk main futsal
                  maupun voli. Respon admin WhatsApp juga cepat dan ramah."
                </p>
              </div>
              <div className="text-yellow-400 text-[10px] flex gap-0.5 pt-3 border-t border-slate-100">
                <Star className="w-3.5 h-3.5 fill-current" />
                <Star className="w-3.5 h-3.5 fill-current" />
                <Star className="w-3.5 h-3.5 fill-current" />
                <Star className="w-3.5 h-3.5 fill-current" />
                <Star className="w-3.5 h-3.5 fill-current" />
              </div>
            </div>
          </div>

          {/* SUASANA VENUE (SISI KANAN) */}
          <div
            className="lg:col-span-5 h-full"
            data-aos="fade-up"
            data-aos-duration="900"
            data-aos-delay="200"
          >
            <div className="relative rounded-[2.5rem] overflow-hidden shadow-lg h-full min-h-[280px] group">
              <img
                alt="Suasana Venue"
                className="w-full h-full object-cover min-h-[280px] group-hover:scale-105 transition-transform duration-700 ease-out"
                src="/images/hero-image3.png"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d3a2d]/85 via-transparent to-transparent flex items-end p-6">
                <div className="text-white">
                  <span className="bg-white/20 backdrop-blur-md text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2 inline-block">
                    SUASANA VENUE
                  </span>
                  <p className="text-sm font-semibold leading-snug">
                    "Ramai, sportif, dan menjadi pusat berkumpulnya warga
                    positif setiap hari."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer
        currentYear={currentYear}
        openBookingModal={scrollToBooking}
        openScheduleModal={() => setIsScheduleModalOpen(true)}
        adminWhatsapp={adminWhatsapp}
      />

      {/* Booking Pop-up Modal */}
      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialCourtType={selectedCourtType}
        adminWhatsapp={adminWhatsapp}
      />

      {/* Schedule Check Pop-up Modal */}
      <ScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        initialCourtType={selectedCourtType}
        onOpenBooking={(court) => {
          setSelectedCourtType(court);
          setIsModalOpen(true);
        }}
      />
    </div>
  );
}
