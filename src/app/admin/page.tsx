'use client';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';

const AdminPage = () => {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Panel de Administración</h1>

      <div className="space-y-4">
        <div className="flex justify-center">
          <span className="text-lg font-semibold">Productos</span>
        </div>
        <Link href="/admin/agregar" className="block bg-blue-600 text-white p-4 rounded text-center hover:bg-blue-700 transition">
          ➕ Agregar Producto
        </Link>
        <Link href="/admin/editar" className="block bg-yellow-500 text-white p-4 rounded text-center hover:bg-yellow-600 transition">
          ✏️ Editar Producto
        </Link>
        <Link href="/admin/eliminar" className="flex items-center justify-center gap-2 bg-red-600 text-white p-4 rounded text-center hover:bg-red-700 transition">
          <Trash2 size={20} /> Eliminar Producto
        </Link>
        <Link href="/admin/ver" className="block bg-violet-700 text-white p-4 rounded text-center hover:bg-gray-800 transition">
          📦 Ver Productos
        </Link>
<div className="flex justify-center">
          <span className="text-lg font-semibold">Usuarios</span>
        </div>
        <Link href="/admin/agregarUsuario" className="block bg-gray-700 text-white p-4 rounded text-center hover:bg-gray-800 transition">
          ➕ Agregar Usuario
        </Link>
        <Link href="/admin/eliminarUsuarios" className="flex items-center justify-center gap-2 bg-black text-white p-4 rounded text-center hover:bg-red-700 transition">
          <Trash2 size={20} /> Eliminar Usuario
        </Link>
      </div>
    </div>
  );
};

export default AdminPage;
