import React, { useState, useEffect } from "react";
import {
  MapPin,
  Phone,
  Mail,
  Share2,
  X,
  ShieldCheck,
  FileText,
} from "lucide-react";
import { FaInstagram, FaFacebookF, FaTiktok } from "react-icons/fa";
import api from "../services/api";

export default function Footer({
  currentYear,
  openBookingModal,
  openScheduleModal,
  adminWhatsapp,
}) {
  const [settings, setSettings] = useState({});
  const [modalType, setModalType] = useState(null);

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
      .catch((err) => console.error("Gagal memuat pengaturan footer", err));
  }, []);

  const rawPhone = settings.admin_whatsapp || adminWhatsapp || "6281234567890";
  const formattedPhone = rawPhone.startsWith("62")
    ? `+62 ${rawPhone.slice(2, 5)}-${rawPhone.slice(5, 9)}-${rawPhone.slice(9)}`
    : rawPhone;

  return (
    <footer
      className="bg-[#121824] text-slate-400 pt-16 pb-12 px-6 md:px-8 w-full border-t border-slate-800 font-sans relative"
      data-aos="fade-up"
    >
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-10 pb-12 border-b border-slate-800/80">
        {/* BRANDING & SOSIAL MEDIA */}
        <div className="sm:col-span-2 md:col-span-5 space-y-4">
          <div className="flex items-center gap-2">
            <div className="font-extrabold text-white text-lg md:text-xl leading-tight font-heading">
              Trutup
              <br />
              <span className="text-emerald-500">Sport Center</span>
            </div>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
            Fasilitas olahraga modern hasil kolaborasi dan dikelola secara
            mandiri oleh Karang Taruna Desa Trutup untuk mendukung gaya hidup
            sehat dan prestasi warga.
          </p>

          {/* SOSMED & AKSES APLIKASI */}
          <div className="flex items-center gap-3 pt-2">
            <a
              href="https://www.instagram.com/desatrutup?igsh=MWc4cnlzY2ZwOW9m"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram Desa Trutup"
              title="Instagram Desa Trutup"
              className="w-9 h-9 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition shadow-sm text-sm"
            >
              <FaInstagram className="w-4 h-4" />
            </a>

            <a
              href="https://www.facebook.com/pemdes.trutup?mibextid=rS40aB7S9Ucbxw6v"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook Pemdes Trutup"
              title="Facebook Pemdes Trutup"
              className="w-9 h-9 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition shadow-sm text-sm"
            >
              <FaFacebookF className="w-4 h-4" />
            </a>

            <a
              href="https://www.tiktok.com/@desatrutup?_r=1&_t=ZS-98kwGkLIZZE"
              target="_blank"
              rel="noreferrer"
              aria-label="TikTok Pemdes Trutup"
              title="TikTok Pemdes Trutup"
              className="w-9 h-9 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition shadow-sm text-sm"
            >
              <FaTiktok className="w-4 h-4" />
            </a>

            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: "Trutup Sport Center",
                    text: "Pesan lapangan olahraga online di Trutup Sport Center!",
                    url: window.location.href,
                  });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Link website berhasil disalin!");
                }
              }}
              aria-label="Bagikan Website"
              title="Bagikan Website"
              className="w-9 h-9 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition shadow-sm text-sm cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* TAUTAN */}
        <div className="sm:col-span-1 md:col-span-2 space-y-4">
          <h4 className="text-white font-bold text-sm tracking-wider uppercase font-heading">
            Tautan
          </h4>
          <ul className="space-y-2.5 text-sm font-medium">
            <li>
              <a
                onClick={(e) => {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="hover:text-emerald-400 transition cursor-pointer"
                href="#"
              >
                Beranda
              </a>
            </li>
            <li>
              <button
                onClick={() => openBookingModal("futsal")}
                className="hover:text-emerald-400 transition text-left cursor-pointer"
              >
                E-Booking
              </button>
            </li>
            <li>
              <button
                onClick={openScheduleModal}
                className="hover:text-emerald-400 transition text-left cursor-pointer"
              >
                Jadwal Lapangan
              </button>
            </li>
            <li>
              <a
                className="hover:text-emerald-400 transition"
                href="#about-section"
              >
                Tentang Kami
              </a>
            </li>
          </ul>
        </div>

        {/* FASILITAS (NON-CLICKABLE) */}
        <div className="sm:col-span-1 md:col-span-2 space-y-4">
          <h4 className="text-white font-bold text-sm tracking-wider uppercase font-heading">
            Fasilitas
          </h4>
          <ul className="space-y-2.5 text-sm font-medium text-slate-400">
            <li>
              <span className="select-none cursor-default">Futsal Arena</span>
            </li>
            <li>
              <span className="select-none cursor-default">Lapangan Voli</span>
            </li>
            <li>
              <span className="select-none cursor-default">
                Lapangan Badminton
              </span>
            </li>
            <li>
              <span className="select-none cursor-default">
                Area Parkir Luas
              </span>
            </li>
          </ul>
        </div>

        {/* PUSAT BANTUAN */}
        <div className="sm:col-span-2 md:col-span-3 space-y-4">
          <h4 className="text-white font-bold text-sm tracking-wider uppercase font-heading">
            Pusat Bantuan
          </h4>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-emerald-500 mt-1 shrink-0" />
              <span className="leading-relaxed">
                Jl. Raya Desa Trutup, Kec. Plumpang, Kab. Tuban, Jawa Timur
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
              <a
                href={`https://wa.me/${rawPhone}`}
                target="_blank"
                rel="noreferrer"
                className="hover:text-emerald-400 transition"
              >
                {formattedPhone}
              </a>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-emerald-500 shrink-0" />
              <a
                href="mailto:trutupsportcenter@gmail.com"
                className="hover:text-emerald-400 transition"
              >
                trutupsportcenter@gmail.com
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER BOTTOM */}
      <div className="max-w-6xl mx-auto pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <p>
          &copy; {currentYear || new Date().getFullYear()} Trutup Sport Center
          &bull; Dibuat oleh Kelompok 12 KKN Desa Trutup 2026
        </p>
        <div className="flex items-center gap-6">
          <button
            onClick={() => setModalType("privacy")}
            className="hover:text-slate-300 transition cursor-pointer"
          >
            Kebijakan Privasi
          </button>
          <button
            onClick={() => setModalType("terms")}
            className="hover:text-slate-300 transition cursor-pointer"
          >
            Syarat & Ketentuan
          </button>
        </div>
      </div>

      {/* MODAL POP-UP */}
      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs transition-all">
          <div className="bg-[#121824] text-slate-300 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-base font-heading">
                {modalType === "privacy" ? (
                  <>
                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    <span>Kebijakan Privasi</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-5 h-5 text-emerald-500" />
                    <span>Syarat & Ketentuan</span>
                  </>
                )}
              </div>
              <button
                onClick={() => setModalType(null)}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs space-y-3 max-h-[55vh] overflow-y-auto leading-relaxed text-slate-300 pr-1">
              {modalType === "privacy" ? (
                <>
                  <p>
                    <strong>1. Pengumpulan Data:</strong> Data pemesan yang
                    diminta (Nama, Nomor WhatsApp, dan Alamat) hanya digunakan
                    untuk proses verifikasi dan konfirmasi booking lapangan.
                  </p>
                  <p>
                    <strong>2. Kerahasiaan Informasi:</strong> Pengelola Trutup
                    Sport Center tidak akan menjual, menyebarkan, atau
                    membagikan data pribadi Anda kepada pihak ketiga.
                  </p>
                  <p>
                    <strong>3. Keamanan Transaksi:</strong> Seluruh riwayat
                    pemesanan disimpan dalam database lokal internal untuk
                    kepentingan transparansi laporan Karang Taruna Desa Trutup.
                  </p>
                  <p>
                    <strong>4. Kontak Pengelola:</strong> Jika Anda ingin
                    memperbarui atau menghapus data pemesanan, silakan hubungi
                    admin melalui kontak WhatsApp yang tersedia.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    <strong>1. Jam Operasional Warga:</strong> Pemesanan umum
                    tidak berlaku pada jam 15:00 - 18:00 WIB karena lapangan
                    diperuntukkan khusus kegiatan warga desa.
                  </p>
                  <p>
                    <strong>2. Pembatalan & Perubahan Jadwal:</strong> Wajib
                    mengonfirmasi kepada Admin WhatsApp maksimal 2 jam sebelum
                    waktu bermain yang telah dipesan.
                  </p>
                  <p>
                    <strong>3. Kebersihan & Fasilitas:</strong> Pengunjung wajib
                    menjaga kebersihan venue dan merawat fasilitas pendukung
                    selama beraktivitas.
                  </p>
                  <p>
                    <strong>4. Tepat Waktu:</strong> Durasi sewa dihitung sesuai
                    dengan waktu mulainya jam booking. Keterlambatan tidak
                    menambah durasi bermain.
                  </p>
                </>
              )}
            </div>

            <div className="pt-2 flex justify-end border-t border-slate-800/80">
              <button
                onClick={() => setModalType(null)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition cursor-pointer"
              >
                Saya Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
