import React, { useState, useEffect } from "react";
import { UserPlus, Check, AlertCircle } from "lucide-react";
import AuthService from "../services/auth.service";
import api from "../services/api";

const Register = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [role, setRole] = useState("agent");
    const [departmentId, setDepartmentId] = useState("");
    const [departments, setDepartments] = useState([]);
    const [message, setMessage] = useState("");
    const [successful, setSuccessful] = useState(false);

    useEffect(() => {
        const fetchDepts = async () => {
            try {
                const response = await api.get("departments");
                setDepartments(response.data);
            } catch (error) {
                console.error("Could not fetch departments", error);
            }
        };
        fetchDepts();
    }, []);

    const handleRegister = async (e) => {
        e.preventDefault();
        setMessage("");
        setSuccessful(false);

        try {
            await AuthService.register(username, password, fullName, role, departmentId ? parseInt(departmentId) : null);
            setMessage("Utilisateur créé avec succès !");
            setSuccessful(true);
            setUsername("");
            setPassword("");
            setFullName("");
            setRole("agent");
            setDepartmentId("");
        } catch (error) {
            const resMessage = error.response?.data?.message || "Erreur lors de la création";
            setMessage(resMessage);
            setSuccessful(false);
        }
    };

    const roles = [
        { value: "agent", label: "Agent (Employé)", desc: "Employé standard affecté à une direction" },
        { value: "director", label: "Directeur", desc: "Responsable de direction" },
        { value: "guard", label: "Garde (Sécurité)", desc: "Scanne les entrées/sorties" },
        { value: "admin", label: "Administrateur", desc: "Gestion complète du système" },
    ];

    return (
        <div className="max-w-lg mx-auto animate-slide-up px-4">
            <div className="text-center mb-6">
                <div className="w-14 h-14 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-glow-primary">
                    <UserPlus size={24} className="text-white" />
                </div>
                <h2 className="text-2xl font-extrabold text-surface-900">Nouvel Utilisateur</h2>
                <p className="text-surface-500 text-sm mt-1">Créez un compte pour un membre FONAMIF</p>
            </div>

            <div className="glass-card p-6 md:p-8">
                <form onSubmit={handleRegister} className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-surface-700 mb-2">Nom complet</label>
                        <input type="text" className="input-field" placeholder="Ex: Aminata Diallo" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-surface-700 mb-2">Identifiant</label>
                            <input type="text" className="input-field" placeholder="aminata_d" value={username} onChange={(e) => setUsername(e.target.value)} required minLength={3} />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-surface-700 mb-2">Mot de passe</label>
                            <input type="password" className="input-field" placeholder="Min. 6 caractères" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-surface-700 mb-2">Rôle</label>
                        <div className="grid grid-cols-2 gap-2">
                            {roles.map((r) => (
                                <button
                                    key={r.value}
                                    type="button"
                                    onClick={() => setRole(r.value)}
                                    className={`text-left p-3 rounded-xl border-2 transition-all ${role === r.value
                                            ? "border-primary-500 bg-primary-50 shadow-sm"
                                            : "border-surface-200 hover:border-surface-300 bg-white"
                                        }`}
                                >
                                    <p className={`text-sm font-bold ${role === r.value ? "text-primary-700" : "text-surface-700"}`}>{r.label}</p>
                                    <p className="text-[11px] text-surface-400 mt-0.5 leading-tight">{r.desc}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-surface-700 mb-2">Direction</label>
                        <select className="input-field" value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
                            <option value="">-- Aucune --</option>
                            {departments.map((dept) => (
                                <option key={dept.id} value={dept.id}>
                                    {dept.code} — {dept.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
                        <UserPlus size={18} /> Créer l'utilisateur
                    </button>
                </form>

                {message && (
                    <div className={`mt-4 p-3 rounded-xl text-center text-sm font-medium animate-slide-up flex items-center justify-center gap-2 ${successful ? "bg-emerald-50 border border-emerald-200 text-emerald-700" : "bg-red-50 border border-red-200 text-red-600"
                        }`}>
                        {successful ? <Check size={16} /> : <AlertCircle size={16} />}
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Register;
