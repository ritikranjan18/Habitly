import axios from "axios";

// Backend ka base URL
const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// 🔐 Har request me token add karega
API.interceptors.request.use((req) => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (user?.token) {
    req.headers.Authorization = `Bearer ${user.token}`;
  }

  return req;
});

export default API;