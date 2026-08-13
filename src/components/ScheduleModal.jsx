import React, { useState, useEffect } from 'react';
import { X, Clock, CheckCircle2, User, ChevronRight } from 'lucide-react';
import api from '../services/api';

export default function ScheduleModal({ isOpen, onClose, initialCourtType, onOpenBooking }) {
    if (!isOpen) return null;

    const [courtType, setCourtType] = useState(initialCourtType || 'futsal');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [schedules, setSchedules] = useState([]);
    const [settings, setSettings] = useState({});

    useEffect(() => {
        setCourtType(initialCourtType || 'futsal');
    }, [initialCourtType]);

    useEffect(() => {
        api.get('/settings')
            .then(res => {
                if (res.data && res.data.data) setSettings(res.data.data);
            })
            .catch(err => console.error("Gagal memuat pengaturan", err));
    }, []);

    useEffect(() => {
        if (date && courtType) {
            api.get(`/schedules?court_type=${courtType}&date=${date}`)
                .then(res => setSchedules(res.data.data || []))
                .catch(err => console.error("Gagal memuat jadwal", err));
        }
    }, [courtType, date]);

    const isCourtActive = (type) => {
        const val = settings[`court_active_${type}`];
        return val === true || val === 'true' || val === 1 || val === '1';
    };

    const formatReadableDate = (dateString) => {
        if (!dateString) return '';
        const options = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    };

    // Sertakan 'pending' untuk menampilkan slot yang sedang dalam proses persetujuan
    const filledSchedules = schedules.filter(s => s.status === 'pending' || s.status === 'booked' || s.status === 'event');

    const handleDirectBooking = () => {
        onClose();
        if (onOpenBooking) {
            onOpenBooking(courtType);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/60 backdrop-blur-xs transition-all">
            <style>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>

            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col border border-slate-100 relative">
                
                {/* Header */}
                <div className="px-5 pt-4 pb-3 border-b border-slate-100 shrink-0 bg-white flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-[#0d3a2d]/10 text-[#0d3a2d] flex items-center justify-center font-bold">
                            <Clock className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 text-sm md:text-base font-heading tracking-tight">
                                Cek Jadwal Terisi
                            </h3>
                            <p className="text-[11px] text-slate-500 font-medium">
                                Lihat ketersediaan jam booking / event.
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

                {/* Body Content */}
                <div className="p-4 space-y-4">
                    
                    {/* Pilih Lapangan */}
                    <div>
                        <label className="block text-[11px] font-extrabold text-slate-900 uppercase tracking-wider mb-2 font-heading">Pilih Lapangan</label>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { id: 'futsal', label: 'Futsal', key: 'futsal' },
                                { id: 'volleyball', label: 'Volleyball', key: 'volleyball' },
                                { id: 'badminton', label: 'Badminton', key: 'badminton' }
                            ].map((item) => {
                                const isAvailable = isCourtActive(item.key);
                                const isSelected = courtType === item.id;
                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        disabled={!isAvailable}
                                        onClick={() => { if (isAvailable) setCourtType(item.id); }}
                                        className={`py-2 px-2 rounded-xl border text-center transition flex flex-col items-center justify-center ${
                                            !isAvailable 
                                                ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60 line-through' 
                                                : isSelected 
                                                    ? 'bg-[#0d3a2d] text-white border-[#0d3a2d] shadow-xs' 
                                                    : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300 cursor-pointer'
                                        }`}
                                    >
                                        <span className={`font-bold text-xs capitalize font-heading ${isSelected && isAvailable ? 'text-white' : 'text-slate-900'}`}>{item.label}</span>
                                        <span className={`text-[9px] mt-0.5 font-bold ${!isAvailable ? 'text-rose-500 no-underline' : isSelected ? 'text-emerald-200' : 'text-slate-400'}`}>
                                            {isAvailable ? 'Tersedia' : 'TUTUP'}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Pilih Tanggal */}
                    <div className="space-y-1">
                        <label className="block text-[11px] font-extrabold text-slate-900 uppercase tracking-wider font-heading">Pilih Tanggal</label>
                        <input 
                            type="date" 
                            min={new Date().toISOString().split('T')[0]}
                            value={date} 
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0d3a2d] bg-slate-50/50 cursor-pointer"
                        />
                    </div>

                    {/* Daftar Jam Terisi */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-[11px] font-extrabold text-slate-900 uppercase tracking-wider font-heading">
                                Jadwal Terisi ({filledSchedules.length})
                            </label>
                            <span className="text-[10px] text-slate-500 font-extrabold">{formatReadableDate(date)}</span>
                        </div>

                        {filledSchedules.length > 0 ? (
                            <div className="space-y-1.5 max-h-[142px] overflow-y-auto no-scrollbar pr-0.5">
                                {filledSchedules.map((s, idx) => {
                                    const durationHours = s.duration || 1;
                                    const startTimeStr = s.start_time?.substring(0, 5) || '00:00';
                                    const [h, m] = startTimeStr.split(':').map(Number);
                                    const endMinutes = h * 60 + m + Math.round(durationHours * 60);
                                    const endH = String(Math.floor(endMinutes / 60) % 24).padStart(2, '0');
                                    const endM = String(endMinutes % 60).padStart(2, '0');
                                    const endTimeStr = s.end_time ? s.end_time.substring(0, 5) : `${endH}:${endM}`;

                                    return (
                                        <div 
                                            key={idx}
                                            className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between hover:border-slate-300 transition shrink-0"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500 shrink-0 border border-slate-100">
                                                    <User className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <h4 className="font-extrabold text-xs text-slate-800">
                                                        {startTimeStr} - {endTimeStr} WIB
                                                    </h4>
                                                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                                                        Pemesan: <span className="font-semibold text-slate-700">{s.renter_name || s.name || '-'}</span>
                                                    </p>
                                                </div>
                                            </div>

                                            <span className={`w-24 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider text-center shrink-0 block ${
                                                s.status === 'booked' 
                                                    ? 'bg-rose-500 text-white shadow-xs' 
                                                    : s.status === 'pending'
                                                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                                    : 'bg-amber-400 text-slate-900 shadow-xs'
                                            }`}>
                                                {s.status === 'pending' ? 'MENUNGGU' : s.status}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="bg-slate-50 border border-slate-200/80 p-5 rounded-2xl text-center space-y-1.5">
                                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-[#0d3a2d] flex items-center justify-center mx-auto mb-1">
                                    <CheckCircle2 className="w-5 h-5" />
                                </div>
                                <p className="text-slate-900 text-xs font-extrabold font-heading">
                                    Lapangan Kosong Sepenuhnya
                                </p>
                                <p className="text-[11px] text-slate-500 font-medium leading-relaxed max-w-xs mx-auto">
                                    Belum ada pemesanan ataupun event yang terdaftar pada tanggal ini. Silakan lakukan booking!
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2 shrink-0">
                    <span className="text-[11px] sm:text-xs text-slate-500 font-bold truncate">Mau booking jam kosong?</span>
                    <button
                        type="button"
                        onClick={handleDirectBooking}
                        className="px-4 py-2.5 rounded-xl font-bold text-xs tracking-wide uppercase bg-[#0d3a2d] text-white hover:bg-[#165643] transition-all duration-300 ease-out cursor-pointer shadow-xs flex items-center gap-1.5 shrink-0"
                    >
                        Pesan Sekarang <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                </div>

            </div>
        </div>
    );
}