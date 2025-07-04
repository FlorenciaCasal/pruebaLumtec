"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    const res = await fetch("/api/users"); // 👈 este endpoint lo armamos abajo
    const data = await res.json();
    setUsers(data);
    setLoading(false);
  };

  const handleDelete = async (email: string) => {
    if (!window.confirm(`¿Eliminar al usuario ${email}?`)) return;

    const res = await fetch(`/api/users/${email}`, {
      method: "DELETE",
    });

    if (res.ok) {
      toast.success("✅ Usuario eliminado");
      fetchUsers(); // recargar lista
    } else {
      const error = await res.json();
      toast.error(error.error || "Error eliminando usuario");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow mt-8">
      <h2 className="text-2xl font-bold mb-4">Usuarios registrados</h2>
      {loading ? (
        <p>Cargando...</p>
      ) : (
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Nombre</th>
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left">Rol</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t">
                <td className="p-2">{user.name || "-"}</td>
                <td className="p-2">{user.email}</td>
                <td className="p-2 capitalize">{user.role}</td>
                <td className="p-2 text-right">
                  <button
                    onClick={() => handleDelete(user.email)}
                    className="text-red-600 hover:underline"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
