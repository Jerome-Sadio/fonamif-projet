import axios from "axios";

// Configuration de base d'Axios
const baseURL = import.meta.env.VITE_API_URL || "/api";
console.log("API Base URL active:", baseURL);

const api = axios.create({
    baseURL: baseURL,
    timeout: 60000,
    headers: {
        "Content-Type": "application/json",
    },
});

// Intercepteur pour ajouter le token JWT à chaque requête
api.interceptors.request.use(
    (config) => {
        const user = JSON.parse(localStorage.getItem("user"));
        if (user && user.token) {
            config.headers["Authorization"] = 'Bearer ' + user.token;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Intercepteur pour gérer les erreurs d'authentification (401)
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem("user");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default api;
