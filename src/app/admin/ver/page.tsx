import { prisma } from '@/lib/prisma'; // asegúrate de tener este cliente exportado
import ImagenProducto from '@/components/ImagenProducto';

// SSR (Server Side Rendering)
export const dynamic = 'force-dynamic';

export default async function VerProductos() {
    const productos = await prisma.product.findMany({
        include: { images: true },
        orderBy: { createdAt: 'desc' },
    });

    const formatearPrecio = (precio: number) => {
        return new Intl.NumberFormat("es-AR", {
            style: "currency",
            currency: "ARS",
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(precio);
    };

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">📦 Productos cargados</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {productos.map((producto) => (
                    <div key={producto.id} className="border rounded p-4">
                        <h2 className="font-semibold">{producto.name}</h2>
                        <p className="text-sm text-gray-600 mb-2">{producto.brand}</p>
                        <p className="text-sm text-gray-600 mb-2">{producto.description}</p>
                        <p>Precio: {formatearPrecio(producto.price)}</p>
                        <p>Stock: {producto.stock} unidades</p>

                        {producto.images[0] && (
                            <ImagenProducto
                                src={producto.images[0].url}
                                alt={producto.name}
                                width={200}
                                height={200}
                            // className="object-cover rounded mt-2"
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
