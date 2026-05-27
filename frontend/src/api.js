import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api"
});

export const fileUrl = (path) => `http://localhost:5000${path}`;

export default api;
