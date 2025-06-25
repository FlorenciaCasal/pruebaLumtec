'use client';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';



type Product = {
    id: string;
    name: string;
    price: number;
    stock: number;
    category: string;
    description: string;
    images: { id: string; url: string }[];
};

async function compressImage(file: File, quality = 0.8): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;

            const ctx = canvas.getContext('2d');
            if (!ctx) return reject(new Error("No se pudo obtener contexto del canvas"));

            ctx.drawImage(img, 0, 0);

            canvas.toBlob(
                (blob) => {
                    if (blob) resolve(blob);
                    else reject(new Error("Error al convertir imagen"));
                },
                'image/jpeg', // formato comprimido
                quality      // calidad entre 0 y 1
            );
        };

        img.onerror = () => reject(new Error("Error cargando la imagen"));

        img.src = URL.createObjectURL(file);
    });
}

export default function EditarProductos() {
    const [productos, setProductos] = useState<Product[]>([]);
    const [selected, setSelected] = useState<Product | null>(null);
    const [newImageUrl, setNewImageUrl] = useState<string>('');
    const [loadingImage, setLoadingImage] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filtro, setFiltro] = useState('');

    const fetchProductos = async () => {
        const res = await fetch('/api/products');
        const data = await res.json();
        setProductos(data);
    };

    const handleUpdate = async () => {
        if (!selected) return;

        const res = await fetch(`/api/products/${selected.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: selected.name,
                price: selected.price,
                stock: selected.stock,
                category: selected.category,
                description: selected.description,
                images: selected.images.map((img) => img.url),
            }),
        });

        if (res.ok) {
            toast.success('✅ Producto actualizado exitosamente', {
                description: 'Se guardaron los cambios correctamente.',
                duration: 3000,
                position: 'top-center'
            });
            setSelected(null);
            fetchProductos();
        } else {
            toast.error('❌ Error al actualizar el producto', {
                duration: 3000,
                position: 'top-center'
            });
        }
    };

    const handleAddImage = () => {
        if (!newImageUrl.trim() || !selected) return;
        setSelected({
            ...selected,
            images: [...selected.images, { id: crypto.randomUUID(), url: newImageUrl }],
        });
        setNewImageUrl('');
    };

    const handleRemoveImage = (id: string) => {
        if (!selected) return;
        setSelected({
            ...selected,
            images: selected.images.filter((img) => img.id !== id),
        });
    };


    // 👉 subir desde archivo, comprimir y agregar imagen
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || !selected) return;

        const maxFileSize = 10 * 1024 * 1024; // 10MB antes de comprimir

        setLoadingImage(true);

        for (const file of files) {
            if (file.size > maxFileSize) {
                toast.error(`❌ El archivo ${file.name} supera los 10MB`, {
                    duration: 3000,
                    position: 'top-center'
                });
                continue;
            }

            try {
                const compressedBlob = await compressImage(file, 0.8);
                const compressedFile = new File([compressedBlob], file.name, { type: 'image/jpeg' });

                const formData = new FormData();
                formData.append('file', compressedFile);

                const res = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });

                const data = await res.json();

                if (data.url) {
                    setSelected((prev) =>
                        prev
                            ? {
                                ...prev,
                                images: [...prev.images, { id: crypto.randomUUID(), url: data.url }],
                            }
                            : prev
                    );
                }
            } catch (error) {
                toast.error(`❌ Error subiendo la imagen ${file.name}: ${error}`, {
                    duration: 3000,
                    position: 'top-center'
                });
            }
        }

        setLoadingImage(false);
    };

    useEffect(() => {
        fetchProductos();
    }, []);

    // Filtrar productos según el texto ingresado
    const productosFiltrados = productos.filter((producto) =>
        producto.name.toLowerCase().includes(filtro.toLowerCase())
    );

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">✏️ Editar Productos</h1>

            <input
                type="text"
                placeholder="Buscar producto..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                className="border px-3 py-2 rounded w-full mb-4"
            />

            {productosFiltrados.length > 0 ? (
                <ul className="space-y-2 mb-8">
                    {productosFiltrados.map((producto) => (
                        <li key={producto.id} className="flex justify-between items-center border p-2 rounded">
                            {producto.name}
                            <button
                                onClick={() => setSelected(producto)}
                                className="bg-yellow-500 text-white px-3 py-1 rounded"
                            >
                                Editar
                            </button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-gray-500">No se encontraron productos.</p>
            )}


            {selected && (
                <div className="border p-4 rounded space-y-3">
                    <h2 className="text-xl font-semibold">Editando: {selected.name}</h2>

                    <input
                        type="text"
                        value={selected.name}
                        onChange={(e) => setSelected({ ...selected, name: e.target.value })}
                        className="border p-2 w-full"
                        placeholder="Nombre"
                    />
                    <input
                        type="number"
                        value={selected.price}
                        onChange={(e) => setSelected({ ...selected, price: parseFloat(e.target.value) })}
                        className="border p-2 w-full"
                        placeholder="Precio"
                    />
                    <input
                        type="number"
                        value={selected.stock}
                        onChange={(e) => setSelected({ ...selected, stock: parseInt(e.target.value) })}
                        className="border p-2 w-full"
                        placeholder="Stock"
                    />
                    <input
                        type="text"
                        value={selected.category}
                        onChange={(e) => setSelected({ ...selected, category: e.target.value })}
                        className="border p-2 w-full"
                        placeholder="Categoría"
                    />
                    <textarea
                        value={selected.description}
                        onChange={(e) => setSelected({ ...selected, description: e.target.value })}
                        className="border p-2 w-full"
                        placeholder="Descripción"
                    />

                    <div>
                        <h3 className="font-medium">Imágenes</h3>
                        <ul className="space-y-1">
                            {selected.images.map((img) => (
                                <li key={img.id} className="flex items-center justify-between border p-1 rounded">
                                    <span className="truncate">{img.url}</span>
                                    <button
                                        onClick={() => handleRemoveImage(img.id)}
                                        className="text-red-600 ml-2 text-sm"
                                    >
                                        Quitar
                                    </button>
                                </li>
                            ))}
                        </ul>
                        <div className="flex mt-2 space-x-2">
                            <input
                                type="text"
                                value={newImageUrl}
                                onChange={(e) => setNewImageUrl(e.target.value)}
                                className="border p-2 flex-1"
                                placeholder="Nueva URL de imagen"
                            />
                        </div>
                        <div className="mt-2">
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleFileUpload}
                            />
                            {loadingImage && <p className="text-sm text-gray-500 mt-1">Subiendo imágenes...</p>}
                            {error && <p className="text-red-600 mt-2">{error}</p>}

                            <div className="flex flex-wrap gap-2 mt-2">
                                {selected.images.map((img) => (
                                    <div key={img.id} className="relative">
                                        <img src={img.url} alt="Imagen producto" className="w-24 h-24 object-cover rounded" />
                                        <button
                                            onClick={() => handleRemoveImage(img.id)}
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex space-x-2 mt-4">
                        <button
                            onClick={handleUpdate}
                            className="bg-green-600 text-white px-4 py-2 rounded"
                        >
                            Guardar cambios
                        </button>
                        <button
                            onClick={() => setSelected(null)}
                            className="bg-gray-400 text-white px-4 py-2 rounded"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}