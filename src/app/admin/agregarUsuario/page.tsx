"use client";
import { useState } from "react";
import { toast } from 'sonner';

export default function AddUserPage() {
    const [form, setForm] = useState({
        name: "",
        email: "",
        role: "user",  // 👈 este es el campo que te permite elegir entre user/admin
        password: "",
    });
    const [loading, setLoading] = useState(false);
    

    const resetForm = () => {
        setForm({
            name: "",
            email: "",
            role: "user",
            password: "",
        });
    };
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const res = await fetch("/api/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });

        if (res.ok) {
            toast.success('✅ Producto creado exitosamente', {
                description: 'Se guardaron los cambios correctamente.',
                duration: 3000,
                position: 'top-center'
            });
            resetForm();
        } else {
            const error = await res.json();
            toast.error(error.error, {
                duration: 3000,
                position: 'top-center'
            });
        }

        setLoading(false);
    };

    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow mt-8">
            <h2 className="text-2xl font-bold mb-4">Agregar Usuario</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block font-medium mb-1">Nombre</label>
                    <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                    />
                </div>

                <div>
                    <label className="block font-medium mb-1">Email *</label>
                    <input
                        type="email"
                        name="email"
                        required
                        value={form.email}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                    />
                </div>

                <div>
                    <label className="block font-medium mb-1">Rol *</label>
                    <select
                        name="role"
                        required
                        value={form.role}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                    >
                        <option value="user">Usuario</option>
                        <option value="admin">Administrador</option>
                    </select>
                </div>

                <div>
                    <label className="block font-medium mb-1">Contraseña</label>
                    <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full p-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                >
                    {loading ? "Guardando..." : "Agregar"}
                </button>
            </form>
        </div>
    );
}
