import React, { useState, useEffect } from "react";
import { ScanLine, ArrowLeft, CheckCircle, XCircle, Clock, Building2, User2 } from "lucide-react";
import api from "../services/api";
import AuthService from "../services/auth.service";
import { Html5QrcodeScanner } from "html5-qrcode";

const ScanAttendance = () => {
    const [scanData, setScanData] = useState("");
    const [scanResult, setScanResult] = useState(null);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [recentScans, setRecentScans] = useState([]);
    const [scanCount, setScanCount] = useState(0);

    useEffect(() => {
        const u = AuthService.getCurrentUser();
        setUser(u);
    }, []);

    const isGuard = user?.roles?.includes("ROLE_GUARD");

    // Initialize QR Scanner
    useEffect(() => {
        if (user && isGuard) {
            const timer = setTimeout(() => {
                const scanner = new Html5QrcodeScanner(
                    "reader",
                    { fps: 10, qrbox: { width: 220, height: 220 } },
                    false
                );
                scanner.render(
                    (decodedText) => handleAutoScan(decodedText),
                    () => { }
                );
                return () => scanner.clear().catch(() => { });
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [user]);

    const handleAutoScan = async (data) => {
        setScanData(data);
        await processScan(data);
    };

    const processScan = async (data) => {
        setLoading(true);
        setMessage("");
        setScanResult(null);

        try {
            const response = await api.post("/attendance/scan", { method: "QR_CODE", data });
            setScanResult(response.data);
            setMessage(response.data.message);
            setScanCount(prev => prev + 1);
            setRecentScans(prev => [response.data, ...prev].slice(0, 20));
        } catch (error) {
            const errMsg = error.response?.data?.message || "❌ Erreur. Réessayez.";
            setMessage(errMsg);
            setScanResult(null);
        } finally {
            setLoading(false);
        }
    };

    const handleManualSubmit = async (e) => {
        e.preventDefault();
        if (!scanData) return;
        await processScan(scanData);
    };

    if (!user) return null;

    // --- Non-guard ---
    if (!isGuard) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] px-4">
                <div className="glass-card p-8 text-center max-w-sm animate-slide-up">
                    <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <XCircle size={28} className="text-red-500" />
                    </div>
                    <h2 className="text-xl font-bold text-surface-900 mb-2">Accès Refusé</h2>
                    <p className="text-sm text-surface-500 mb-4">Seuls les agents de sécurité peuvent scanner.</p>
                    <a href="/dashboard" className="btn-outline inline-flex items-center gap-2 text-sm">
                        <ArrowLeft size={16} /> Retour
                    </a>
                </div>
            </div>
        );
    }

    // --- VUE GUARD — Scanner ---
    return (
        <div className="min-h-screen bg-gradient-dark -mx-4 sm:-mx-6 -mt-6 md:-mt-8 px-4 py-6 text-white">
            <div className="max-w-md mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
                            <ScanLine size={20} className="text-amber-400" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold">Scanner Actif</h1>
                            <p className="text-xs text-surface-400">{scanCount} scan{scanCount !== 1 ? 's' : ''} ce jour</p>
                        </div>
                    </div>
                    <a href="/dashboard" className="text-xs bg-white/10 hover:bg-white/20 px-3 py-2 rounded-xl transition flex items-center gap-1">
                        <ArrowLeft size={12} /> Retour
                    </a>
                </div>

                {/* Camera Zone */}
                <div className="rounded-2xl overflow-hidden mb-5 border-2 border-emerald-500/50 shadow-glow-green relative">
                    <div id="reader" className="w-full bg-black"></div>
                    {loading && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm z-10">
                            <div className="w-10 h-10 border-3 border-white/20 border-t-white rounded-full animate-spin"></div>
                        </div>
                    )}
                </div>

                {/* Manual Input */}
                <form onSubmit={handleManualSubmit} className="mb-5">
                    <p className="text-[10px] text-surface-500 font-bold uppercase tracking-widest mb-2 text-center">Saisie Manuelle</p>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-center font-mono text-lg text-white placeholder:text-surface-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition"
                            value={scanData}
                            onChange={(e) => setScanData(e.target.value)}
                            placeholder="QR-username..."
                        />
                        <button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 rounded-xl transition-all active:scale-95 disabled:opacity-50">
                            {loading ? "..." : "OK"}
                        </button>
                    </div>
                </form>

                {/* Scan Result */}
                {scanResult && (
                    <div className={`mb-5 p-4 rounded-2xl border animate-slide-up ${scanResult.type === "ENTRÉE"
                            ? "border-emerald-500/30 bg-emerald-950/40"
                            : "border-red-500/30 bg-red-950/40"
                        }`}>
                        <div className="flex items-center justify-between mb-3">
                            <span className={`badge text-white text-xs ${scanResult.type === "ENTRÉE" ? "bg-emerald-600" : "bg-red-500"}`}>
                                {scanResult.type === "ENTRÉE" ? <CheckCircle size={12} /> : <XCircle size={12} />}
                                {scanResult.type}
                            </span>
                            <span className="font-mono text-surface-400 text-xs flex items-center gap-1">
                                <Clock size={10} /> {scanResult.timestamp}
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-sm font-bold">
                                {scanResult.agentName?.charAt(0)}
                            </div>
                            <div>
                                <p className="font-bold text-white flex items-center gap-2">
                                    <User2 size={14} /> {scanResult.agentName}
                                </p>
                                <p className="text-xs text-surface-400 flex items-center gap-1">
                                    <Building2 size={10} /> {scanResult.departmentName}
                                </p>
                            </div>
                        </div>
                        <div className="mt-3">
                            <span className={`badge text-[10px] ${scanResult.status === "EN RETARD" ? "bg-amber-500/20 text-amber-400" : "bg-emerald-500/20 text-emerald-400"}`}>
                                {scanResult.status}
                            </span>
                        </div>
                    </div>
                )}

                {/* Error fallback */}
                {!scanResult && message && (
                    <div className="mb-5 p-3 rounded-xl bg-red-950/40 border border-red-500/30 animate-slide-up">
                        <p className="text-sm font-semibold text-red-300">{message}</p>
                    </div>
                )}

                {/* Session Log */}
                {recentScans.length > 0 && (
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                        <h3 className="text-[10px] font-bold text-surface-500 uppercase tracking-widest mb-3">Journal de Session</h3>
                        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                            {recentScans.map((scan, index) => (
                                <div key={index} className="flex items-center justify-between p-2.5 bg-white/5 rounded-xl text-sm animate-slide-in-right" style={{ animationDelay: `${index * 0.05}s` }}>
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${scan.type === "ENTRÉE" ? "bg-emerald-500" : "bg-red-500"}`}></span>
                                        <span className="font-medium truncate">{scan.agentName}</span>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${scan.type === "ENTRÉE" ? "text-emerald-400" : "text-red-400"}`}>
                                            {scan.type}
                                        </span>
                                        <span className="text-surface-500 font-mono text-[10px]">{scan.timestamp}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ScanAttendance;
