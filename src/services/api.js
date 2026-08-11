import axios from "axios";

const api = axios.create({
  baseURL: "https://api.trutupsportcenter.com/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Menyisipkan token admin otomatis jika tersedia di localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
