import api from "./api";

const AuthService = {
    login: async (username, password) => {
        const response = await api.post("auth/signin", {
            username,
            password,
        });
        if (response.data.token) {
            localStorage.setItem("user", JSON.stringify(response.data));
        }
        return response.data;
    },

    logout: () => {
        localStorage.removeItem("user");
    },

    register: (username, password, fullName, role, departmentId) => {
        return api.post("auth/signup", {
            username,
            password,
            fullName,
            role,
            departmentId,
        });
    },

    getCurrentUser: () => {
        return JSON.parse(localStorage.getItem("user"));
    },

    // Helper to check roles
    hasRole: (roleName) => {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user || !user.roles) return false;
        return user.roles.includes("ROLE_" + roleName);
    },

    isAdmin: () => AuthService.hasRole("ADMIN"),
    isDirector: () => AuthService.hasRole("DIRECTOR"),
    isGuard: () => AuthService.hasRole("GUARD"),
    isAgent: () => AuthService.hasRole("AGENT"),
};

export default AuthService;
