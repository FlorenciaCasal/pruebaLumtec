'use client';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';

type Product = {
    id: string;
    name: string;
};

export default function EliminarProductos() {
    const [productos, setProductos] = useState<Product[]>([]);
    const [filtro, setFiltro] = useState('');

    const fetchProductos = async () => {
        const res = await fetch('/api/products');
        const data = await res.json();
        setProductos(data);
    };

    const handleEliminar = async (id: string) => {
        toast("¿Seguro que querés eliminar este producto?", {
            action: {
                label: "Eliminar",
                onClick: async () => {
                    const res = await fetch(`/api/products/${id}`, {
                        method: "DELETE",
                    });

                    if (res.ok) {
                        toast.success("Producto eliminado", {
                            duration: 3000,
                            position: 'top-center'
                        });
                        fetchProductos();
                    } else {
                        toast.error("Error al eliminar producto");
                    }
                },
            },
            duration: 5000,
            position: "top-center",
        });
    };

    useEffect(() => {
        fetchProductos();
    }, []);

    // Filtrar productos según el texto ingresado
    const productosFiltrados = productos.filter((producto) =>
        producto.name.toLowerCase().includes(filtro.toLowerCase())
    );

    return (
        <div className="p-6 max-w-3xl mx-auto">
            <h1 className="flex items-center gap-2 text-3xl font-bold mb-6"><Trash2 size={25} /> Eliminar Productos</h1>

            <input
                type="text"
                placeholder="Buscar producto..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                className="border px-3 py-2 rounded w-full mb-4"
            />

            {productosFiltrados.length > 0 ? (
                <ul className="space-y-2">
                    {productosFiltrados.map((producto) => (
                        <li
                            key={producto.id}
                            className="flex justify-between items-center border p-2 rounded"
                        >
                            {producto.name}
                            <button
                                onClick={() => handleEliminar(producto.id)}
                                className="text-red-500"
                            >
                                <Trash2 size={20} />
                            </button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-gray-500">No se encontraron productos.</p>
            )}
        </div>
    );
}
