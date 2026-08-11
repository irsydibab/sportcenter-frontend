import React from "react";
import { Link } from "react-router-dom";
import { UserCircle } from "lucide-react";

export default function Navbar() {
  return (
    <header
      className="flex justify-between items-center mb-12 max-w-6xl mx-auto px-6 md:px-8 relative z-10 pt-6"
      data-aos="fade-down"
    >
      {/* BRAND TEXT SAJA */}
      <div className="font-extrabold text-[#ffffff] text-lg md:text-xl leading-tight tracking-tight font-heading">
        Trutup
        <br />
        <span className="text-emerald-400">Sport Center</span>
      </div>

      <nav className="flex items-center">
        <Link
          to="/admin/login"
          className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-5 py-2 rounded-full font-semibold transition text-sm backdrop-blur-md shadow-sm flex items-center gap-2 cursor-pointer"
        >
          <UserCircle className="w-4 h-4 text-yellow-400" /> Admin Login
        </Link>
      </nav>
    </header>
  );
}