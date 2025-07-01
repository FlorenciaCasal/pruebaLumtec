import { ProductWithImages } from '@/types/productImage.types';
import ProductImages from '@/components/ProductImages';
import CheckoutButton from '@/components/CheckoutButton';


async function getProduct(id: string): Promise<ProductWithImages> {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/products/${id}`, { cache: 'no-store' });
        if (!res.ok) throw new Error("Failed to fetch product");
        return res.json();
}

const formatearPrecio = (precio: number) => {
        return new Intl.NumberFormat("es-AR", {
                style: "currency",
                currency: "ARS",
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
        }).format(precio);
};

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
        try {
                const resolvedParams = await params;
                const product = await getProduct(resolvedParams.id);

                return (
                        <main className="p-4 md:p-6 max-w-6xl mx-auto">
                                <div className="grid grid-cols-1 md:grid-cols-[60%_40%] gap-6 md:gap-2 items-start">

                                        {/* Imágenes */}
                                        <div className="rounded overflow-hidden shadow-md">
                                                {product.images?.length ? (
                                                        <ProductImages images={product.images} productName={product.name} />
                                                ) : (
                                                        <p className="text-gray-500 p-4">No hay imágenes disponibles</p>
                                                )}
                                        </div>

                                        {/* Detalles */}
                                        <div className="space-y-6 md:space-y-8 p-2 md:p-6 h-[100%] bg-white rounded">
                                                <h1 className="text-2xl md:text-4xl font-bold tracking-tight leading-snug">
                                                        {product.name}
                                                </h1>
                                                <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                                                        {product.brand}
                                                </p>

                                                <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                                                        {product.description}
                                                </p>

                                                {/* <p className="text-gray-700">Tipo: {product.type}</p> */}
                                                {product.packages?.length > 0 && (
                                                        <div>
                                                                <h3 className="font-semibold">Paquetes disponibles:</h3>
                                                                <ul>
                                                                        {product.packages.map(pkg => (
                                                                                <li key={pkg.id}>
                                                                                        {pkg.quantity} unidad(es) - {pkg.weightKg} kg - {pkg.widthCm}x{pkg.heightCm}x{pkg.depthCm} cm
                                                                                </li>
                                                                        ))}
                                                                </ul>
                                                        </div>
                                                )}

                                                <p className="text-gray-500 font-semibold">
                                                        {product.stock > 1
                                                                ? "Stock disponible"
                                                                : product.stock === 1
                                                                        ? "¡Último disponible!"
                                                                        : "Sin stock"}
                                                </p>

                                                <div>
                                                        <span className="text-2xl md:text-3xl font-bold text-primary block">
                                                                {formatearPrecio(product.price)}
                                                        </span>
                                                </div>

                                                <div className="md:px-0">
                                                        <CheckoutButton
                                                                id={product.id}
                                                                name={product.name}
                                                                price={product.price}
                                                                images={product.images}
                                                        />
                                                </div>
                                        </div>

                                </div>
                        </main>
                );
        } catch {
                return (
                        <main className="p-4">
                                <p className="text-red-600">No se pudo cargar el producto.</p>
                        </main>
                );
        }
}







