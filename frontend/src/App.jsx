import React, { useState, useEffect } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { Menu, X, LayoutDashboard, ScanLine, UserPlus, LogOut, Shield, User, Building2 } from "lucide-react";
import AuthService from "./services/auth.service";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import ScanAttendance from "./components/ScanAttendance";

function App() {
    const [currentUser, setCurrentUser] = useState(undefined);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const user = AuthService.getCurrentUser();
        if (user) setCurrentUser(user);
    }, []);

    const logOut = () => {
        AuthService.logout();
        setCurrentUser(undefined);
        setMobileMenuOpen(false);
        navigate("/login");
    };

    const isAdmin = currentUser?.roles?.includes("ROLE_ADMIN");
    const isDirector = currentUser?.roles?.includes("ROLE_DIRECTOR");
    const isGuard = currentUser?.roles?.includes("ROLE_GUARD");

    const getRoleBadge = () => {
        if (!currentUser || !currentUser.roles) return { label: "...", bg: "bg-surface-200", icon: <User size={12} /> };
        if (isAdmin) return { label: "Admin", bg: "bg-gradient-danger", icon: <Shield size={12} /> };
        if (isDirector) return { label: "Directeur", bg: "bg-gradient-purple", icon: <Building2 size={12} /> };
        if (isGuard) return { label: "Sécurité", bg: "bg-gradient-warning", icon: <Shield size={12} /> };
        return { label: "Agent", bg: "bg-gradient-primary", icon: <User size={12} /> };
    };

    const badge = currentUser ? getRoleBadge() : null;

    return (
        <div className="min-h-screen font-sans">
            {/* === NAVBAR === */}
            <nav className="bg-white/80 backdrop-blur-xl border-b border-surface-200/50 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2 group" onClick={() => setMobileMenuOpen(false)}>
                            <img src="/assets/logo-fonamif.png" alt="FONAMIF" className="h-9 md:h-10 object-contain" />
                        </Link>

                        {/* Desktop Nav */}
                        {currentUser && (
                            <div className="hidden md:flex items-center gap-3">
                                <Link to="/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-xl text-surface-600 hover:text-primary-600 hover:bg-primary-50 transition-all text-sm font-medium">
                                    <LayoutDashboard size={16} /> Dashboard
                                </Link>
                                {isGuard && (
                                    <Link to="/scan" className="flex items-center gap-2 px-3 py-2 rounded-xl text-amber-700 bg-amber-50 hover:bg-amber-100 transition-all text-sm font-bold">
                                        <ScanLine size={16} /> Scanner
                                    </Link>
                                )}
                                {isAdmin && (
                                    <Link to="/register" className="flex items-center gap-2 px-3 py-2 rounded-xl text-surface-600 hover:text-primary-600 hover:bg-primary-50 transition-all text-sm font-medium">
                                        <UserPlus size={16} /> Utilisateur
                                    </Link>
                                )}

                                <div className="w-px h-8 bg-surface-200 mx-1"></div>

                                <span className={`badge text-white ${badge.bg}`}>
                                    {badge.icon} {badge.label}
                                </span>
                                <span className="text-sm font-semibold text-surface-700 max-w-[140px] truncate">
                                    {currentUser.fullName}
                                </span>
                                <button onClick={logOut} className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-xl transition-all font-medium">
                                    <LogOut size={14} /> Quitter
                                </button>
                            </div>
                        )}

                        {!currentUser && (
                            <Link to="/login" className="btn-primary text-sm hidden md:flex">
                                Se Connecter
                            </Link>
                        )}

                        {/* Mobile Menu Toggle */}
                        {currentUser && (
                            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-xl hover:bg-surface-100 transition">
                                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                            </button>
                        )}
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                {mobileMenuOpen && currentUser && (
                    <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-surface-100 animate-slide-up px-4 pb-4">
                        <div className="flex items-center gap-3 py-3 border-b border-surface-100">
                            <div className={`w-10 h-10 rounded-full ${badge.bg} flex items-center justify-center text-white text-sm font-bold`}>
                                {currentUser.fullName?.charAt(0)}
                            </div>
                            <div>
                                <p className="font-bold text-surface-800 text-sm">{currentUser.fullName}</p>
                                <span className={`badge text-white text-[10px] ${badge.bg}`}>{badge.label}</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1 mt-3">
                            <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-primary-50 text-surface-700 font-medium">
                                <LayoutDashboard size={18} /> Dashboard
                            </Link>
                            {isGuard && (
                                <Link to="/scan" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-xl bg-amber-50 text-amber-700 font-bold">
                                    <ScanLine size={18} /> Scanner
                                </Link>
                            )}
                            {isAdmin && (
                                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-primary-50 text-surface-700 font-medium">
                                    <UserPlus size={18} /> Nouvel Utilisateur
                                </Link>
                            )}
                            <button onClick={logOut} className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-red-50 text-red-500 font-medium mt-2 border-t border-surface-100 pt-4">
                                <LogOut size={18} /> Déconnexion
                            </button>
                        </div>
                    </div>
                )}
            </nav>

            {/* === CONTENT === */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8 animate-fade-in">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/scan" element={<ScanAttendance />} />
                </Routes>
            </main>
        </div>
    );
}

const Home = () => (
    <div className="flex flex-col items-center justify-center min-h-[70vh] animate-slide-up text-center px-4">
        <img src="/assets/logo-fonamif.png" alt="FONAMIF" className="h-24 md:h-32 object-contain mb-6 drop-shadow-lg" />
        <p className="text-lg md:text-xl text-surface-500 mb-2 font-medium">
            Système de Gestion des Présences
        </p>
        <p className="text-sm text-surface-400 mb-8 max-w-md">
            Identification par QR Code • Biométrie • Code-barres
        </p>
        <Link to="/login" className="btn-primary text-base">
            Se Connecter →
        </Link>
    </div>
);

export default App;
