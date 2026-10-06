import axios from "axios";

const api = axios.create({
    baseURL: "https://janseva-n6bp.onrender.com/api"
});

export default api;