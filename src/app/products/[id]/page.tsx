import { ProductWithImages } from '@/types/productImage.types';
import ProductImages from '@/components/ProductImages';
import CheckoutButton from '@/components/CheckoutButton';


async function getProduct(id: string): Promise<ProductWithImages> {
        // const res = await fetch(`${process.env.BASE_URL}/api/products/${id}`, { cache: 'no-store' });
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/products/${id}`, { cache: 'no-store' });

        if (!res.ok) throw new Error("Failed to fetch product");
        return res.json();
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
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
                                                {product.description}
                                        </p>

                                        <div>
                                                <span className="text-2xl md:text-3xl font-bold text-primary block">
                                                        ${product.price.toFixed(2)}
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
}







