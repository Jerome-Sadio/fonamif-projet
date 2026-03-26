import React, { useState, useEffect } from "react";
import { Users, UserCheck, Clock, UserX, QrCode, ArrowRight, RefreshCw, Shield, Building2, Activity, CalendarDays, ScanLine } from "lucide-react";
import api from "../services/api";
import AuthService from "../services/auth.service";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
    const [stats, setStats] = useState({ presentCount: 0, lateCount: 0, absentCount: 0, totalAgents: 0, recentLogs: [] });
    const [guardScans, setGuardScans] = useState([]);
    const [myRecords, setMyRecords] = useState([]);
    const [user, setUser] = useState(undefined);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const currentUser = AuthService.getCurrentUser();
        setUser(currentUser);
        if (currentUser) fetchData(currentUser);
    }, []);

    const fetchData = async (currentUser) => {
        setLoading(true);
        const isAdmin = currentUser?.roles?.includes("ROLE_ADMIN");
        const isDirector = currentUser?.roles?.includes("ROLE_DIRECTOR");
        const isGuard = currentUser?.roles?.includes("ROLE_GUARD");

        try {
            if (isAdmin) {
                const response = await api.get("dashboard/admin");
                setStats(response.data || { presentCount: 0, lateCount: 0, absentCount: 0, totalAgents: 0, recentLogs: [] });
            } else if (isDirector) {
                const response = await api.get("dashboard/director");
                setStats(response.data || { presentCount: 0, lateCount: 0, absentCount: 0, totalAgents: 0, recentLogs: [] });
            } else if (isGuard) {
                const response = await api.get("dashboard/guard");
                setGuardScans(response.data || []);
            } else {
                const response = await api.get("attendance/my-records");
                setMyRecords(response.data || []);
            }
        } catch (error) {
            console.error("Error fetching data", error);
            setError("Impossible de charger les données. Vérifiez votre connexion.");
            // Fallback for stats to avoid crashes
            if (isAdmin || isDirector) setStats({ presentCount: 0, lateCount: 0, absentCount: 0, totalAgents: 0, recentLogs: [] });
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    const isAdmin = user?.roles?.includes("ROLE_ADMIN");
    const isDirector = user?.roles?.includes("ROLE_DIRECTOR");
    const isGuard = user?.roles?.includes("ROLE_GUARD");

    const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    // =====================================================
    // LOADING
    // =====================================================
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                    <p className="text-surface-500 font-medium">Chargement...</p>
                    {error && (
                        <div className="mt-4 p-3 bg-danger-50 text-danger-600 rounded-lg text-sm font-medium animate-bounce-in">
                            {error}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // =====================================================
    // VUE AGENT — Badge QR + Historique personnel
    // =====================================================
    if (!isAdmin && !isDirector && !isGuard) {
        return (
            <div className="max-w-3xl mx-auto animate-slide-up">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                    <div>
                        <h2 className="text-xl md:text-2xl font-extrabold text-surface-900">Mon Espace</h2>
                        <p className="text-surface-500 text-sm capitalize">{today}</p>
                    </div>
                    <button onClick={() => fetchData(user)} className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium">
                        <RefreshCw size={14} /> Actualiser
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Info Card */}
                    <div className="glass-card p-5">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-sm">
                                {user.fullName?.charAt(0)}
                            </div>
                            <div>
                                <p className="font-bold text-surface-800">{user.fullName}</p>
                                <p className="text-xs text-surface-400">Agent FONAMIF</p>
                            </div>
                        </div>
                        {user.departmentName && (
                            <div className="flex items-center gap-2 text-sm text-surface-600 bg-surface-50 rounded-xl px-3 py-2">
                                <Building2 size={14} className="text-primary-500" />
                                <span className="font-medium">{user.departmentName}</span>
                            </div>
                        )}
                    </div>

                    {/* QR Badge */}
                    <div className="glass-card p-5 flex flex-col items-center border-t-4 border-primary-500">
                        <div className="flex items-center gap-2 mb-4">
                            <QrCode size={18} className="text-primary-600" />
                            <h3 className="text-sm font-bold text-primary-700 uppercase tracking-wider">Mon Badge</h3>
                        </div>
                        <div className="p-3 bg-white rounded-xl border-2 border-dashed border-surface-200 mb-3">
                            <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=QR-${user.username}&color=4f46e5`}
                                alt="QR Code Badge"
                                className="w-28 h-28 md:w-32 md:h-32"
                            />
                        </div>
                        <p className="text-xs text-surface-500 font-mono bg-surface-100 px-3 py-1.5 rounded-lg">
                            QR-{user.username}
                        </p>
                    </div>
                </div>

                {/* Today's Records */}
                <div className="glass-card p-5 mt-5">
                    <div className="flex items-center gap-2 mb-4">
                        <CalendarDays size={18} className="text-primary-500" />
                        <h3 className="font-bold text-surface-800">Pointage du jour</h3>
                    </div>
                    {myRecords.length > 0 ? (
                        <div className="space-y-2">
                            {myRecords.map((record, index) => (
                                <div key={index} className="flex items-center gap-3 p-3 bg-surface-50 rounded-xl animate-slide-in-right" style={{ animationDelay: `${index * 0.1}s` }}>
                                    <span className={`badge ${record.type === "ENTRÉE" ? "badge-in" : "badge-out"}`}>
                                        {record.type}
                                    </span>
                                    <span className="font-mono text-surface-600 text-sm">{record.timestamp}</span>
                                    <span className={`badge ${record.status === "EN RETARD" ? "badge-late" : "badge-ontime"}`}>
                                        {record.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-surface-400">
                            <Clock size={32} className="mx-auto mb-2 opacity-40" />
                            <p className="text-sm">Aucun pointage enregistré aujourd'hui</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // =====================================================
    // VUE GUARD — Scanner + Derniers scans
    // =====================================================
    if (isGuard) {
        return (
            <div className="max-w-3xl mx-auto animate-slide-up">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                    <div>
                        <div className="flex items-center gap-2">
                            <Shield size={22} className="text-amber-500" />
                            <h2 className="text-xl md:text-2xl font-extrabold text-surface-900">Espace Sécurité</h2>
                        </div>
                        <p className="text-surface-500 text-sm capitalize mt-1">{today}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
                    {/* Scanner CTA */}
                    <a href="/scan" className="glass-card p-6 flex flex-col items-center justify-center group border-2 border-amber-200 hover:border-amber-400 hover:bg-amber-50/50 transition-all">
                        <div className="w-16 h-16 bg-gradient-warning rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform">
                            <ScanLine size={28} />
                        </div>
                        <h3 className="font-bold text-surface-800 mb-1">Scanner d'Accès</h3>
                        <p className="text-xs text-surface-400 mb-3 text-center">Ouvrir le contrôle d'accès</p>
                        <span className="flex items-center gap-1 text-sm font-bold text-amber-600">
                            Ouvrir <ArrowRight size={14} />
                        </span>
                    </a>

                    {/* Today count */}
                    <div className="stat-card bg-gradient-primary">
                        <div className="flex items-center gap-2 opacity-80 mb-2">
                            <Activity size={16} />
                            <p className="text-sm font-semibold">Scans aujourd'hui</p>
                        </div>
                        <p className="text-4xl font-black">{guardScans.length}</p>
                    </div>
                </div>

                {/* Recent Scans Table */}
                {guardScans.length > 0 && (
                    <div className="glass-card overflow-hidden">
                        <div className="p-4 border-b border-surface-100">
                            <h3 className="font-bold text-surface-800 flex items-center gap-2">
                                <Clock size={16} className="text-primary-500" /> Derniers Scans
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="table-premium">
                                <thead>
                                    <tr>
                                        <th>Heure</th>
                                        <th>Agent</th>
                                        <th className="hidden sm:table-cell">Direction</th>
                                        <th>Action</th>
                                        <th>Statut</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {guardScans.map((scan, index) => (
                                        <tr key={index} className="animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
                                            <td className="font-mono text-surface-500 text-xs">{scan.timestamp}</td>
                                            <td className="font-semibold text-surface-800">{scan.agentName}</td>
                                            <td className="hidden sm:table-cell text-surface-500 text-xs">{scan.departmentName}</td>
                                            <td><span className={`badge ${scan.type === "ENTRÉE" ? "badge-in" : "badge-out"}`}>{scan.type}</span></td>
                                            <td><span className={`badge ${scan.status === "EN RETARD" ? "badge-late" : "badge-ontime"}`}>{scan.status}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // =====================================================
    // VUE ADMIN / DIRECTOR — Stats + Activité
    // =====================================================
    return (
        <div className="max-w-6xl mx-auto animate-slide-up">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                <div>
                    <h2 className="text-xl md:text-2xl font-extrabold text-surface-900">
                        {isAdmin ? "Tableau de Bord" : stats.departmentName || "Ma Direction"}
                    </h2>
                    <p className="text-surface-500 text-sm capitalize mt-1">
                        {isAdmin ? "Vue globale du FONAMIF • " : ""}
                        {today}
                    </p>
                </div>
                <button onClick={() => fetchData(user)} className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium self-start">
                    <RefreshCw size={14} /> Actualiser
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5 mb-6">
                <StatCard icon={<Users size={20} />} title="Effectif" value={stats.totalAgents || 0} gradient="bg-gradient-primary" />
                <StatCard icon={<UserCheck size={20} />} title="Présents" value={stats.presentCount || 0} gradient="bg-gradient-success" />
                <StatCard icon={<Clock size={20} />} title="Retards" value={stats.lateCount || 0} gradient="bg-gradient-warning" />
                <StatCard icon={<UserX size={20} />} title="Absents" value={stats.absentCount || 0} gradient="bg-gradient-danger" />
            </div>

            {/* Recent Activity */}
            {stats.recentLogs && stats.recentLogs.length > 0 && (
                <div className="glass-card overflow-hidden">
                    <div className="p-4 md:p-5 border-b border-surface-100 flex items-center justify-between">
                        <h3 className="font-bold text-surface-800 flex items-center gap-2">
                            <Activity size={16} className="text-primary-500" /> Activité en Temps Réel
                        </h3>
                        <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse-soft"></span>
                            En direct
                        </span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="table-premium">
                            <thead>
                                <tr>
                                    <th>Heure</th>
                                    <th>Agent</th>
                                    <th>Action</th>
                                    <th className="hidden sm:table-cell">Direction</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.recentLogs.map((log, index) => (
                                    <tr key={log.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
                                        <td className="font-mono text-surface-500 text-xs">{log.time}</td>
                                        <td className="font-semibold text-surface-800">{log.user}</td>
                                        <td><span className={`badge ${log.action === "ENTRÉE" ? "badge-in" : "badge-out"}`}>{log.action}</span></td>
                                        <td className="hidden sm:table-cell">
                                            <span className="text-xs bg-surface-100 text-surface-600 px-2 py-1 rounded-lg font-medium">{log.location}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {(!stats.recentLogs || stats.recentLogs.length === 0) && (
                <div className="glass-card p-10 text-center">
                    <Activity size={40} className="mx-auto mb-3 text-surface-300" />
                    <p className="text-surface-500 font-medium">Aucune activité enregistrée aujourd'hui</p>
                    <p className="text-xs text-surface-400 mt-1">Les pointages apparaîtront ici en temps réel</p>
                </div>
            )}
        </div>
    );
};

const StatCard = ({ icon, title, value, gradient }) => (
    <div className={`stat-card ${gradient}`}>
        <div className="flex items-center gap-2 opacity-80 mb-1">
            {icon}
            <p className="text-xs md:text-sm font-semibold">{title}</p>
        </div>
        <p className="text-2xl md:text-4xl font-black mt-1">{value}</p>
    </div>
);

export default Dashboard;
