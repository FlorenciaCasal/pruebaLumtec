"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function ResetPasswordPage() {
    const params = useSearchParams();
    const token = params.get("token");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirm) {
            toast.error(`❌ Las contraseñas no coinciden`, {
                duration: 3000,
                position: 'top-center'
            });
            return;
        }

        setLoading(true);
        const res = await fetch("/api/auth/reset-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, password }),
        });

        const data = await res.json();
        setLoading(false);

        if (res.ok) {
            toast.success('✅ Contraseña actualizada correctamente', {
                duration: 3000,
                position: 'top-center'
            });
            router.push("/login");
        } else {
            toast.error(data.error || `❌ Error al actualizar contraseña`, {
                duration: 3000,
                position: 'top-center'
            });
        }
    };

    if (!token) return <p>Token inválido.</p>;

    return (
        <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Restablecer contraseña</h1>
            <input
                type="password"
                placeholder="Nueva contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border p-2 mb-2 w-full"
                required
            />
            <input
                type="password"
                placeholder="Confirmar contraseña"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="border p-2 mb-4 w-full"
                required
            />
            <button
                type="submit"
                disabled={loading}
                className="bg-blue-500 text-white px-4 py-2 rounded"
            >
                {loading ? "Guardando..." : "Cambiar contraseña"}
            </button>
        </form>
    );
}
