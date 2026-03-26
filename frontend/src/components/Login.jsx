import React, { useState } from "react";
import { LogIn, Eye, EyeOff } from "lucide-react";
import AuthService from "../services/auth.service";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setMessage("");
        setLoading(true);

        try {
            const data = await AuthService.login(username, password);
            if (data && data.token) {
                // Wait a tiny bit to ensure localStorage is set (though it's sync)
                navigate("/dashboard");
                window.location.reload();
            } else {
                setMessage("Erreur de connexion : données invalides");
            }
        } catch (error) {
            const resMessage = error.response?.data?.message || "Identifiants incorrects";
            setMessage(resMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[75vh] px-4 animate-slide-up">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <img src="/assets/logo-fonamif.png" alt="FONAMIF" className="h-16 md:h-20 object-contain mx-auto mb-4" />
                    <h2 className="text-2xl font-extrabold text-surface-900">Bienvenue</h2>
                    <p className="text-surface-500 text-sm mt-1">Connectez-vous à votre espace FONAMIF</p>
                </div>

                {/* Login Card */}
                <div className="glass-card p-6 md:p-8">
                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-surface-700 mb-2">
                                Nom d'utilisateur
                            </label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="Votre identifiant"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                autoFocus
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-surface-700 mb-2">
                                Mot de passe
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="input-field pr-12"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 transition"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2" disabled={loading}>
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <><LogIn size={18} /> Se Connecter</>
                            )}
                        </button>
                    </form>

                    {message && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-center text-sm font-medium animate-slide-up">
                            {message}
                        </div>
                    )}
                </div>

                <p className="text-center text-xs text-surface-400 mt-6">
                    Contactez l'administrateur pour obtenir un compte
                </p>
            </div>
        </div>
    );
};

export default Login;
