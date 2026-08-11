import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PublicBooking from "./pages/PublicBooking";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PublicBooking />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}
