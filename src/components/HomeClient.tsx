"use client"
import { useSelector } from "react-redux";
import Link from 'next/link';
import { ProductWithImages } from "@/types/productImage.types";
import { RootState } from "@/lib/store";
import Image from "next/image";
import { formatearPrecio } from '@/utils/format';


interface Props {
    products: ProductWithImages[];
}

export default function HomeClient({ products }: Props) {
    const searchQuery = useSelector((state: RootState) => state.search.query);

    const filteredProducts = products.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            <main className="bg-gray-100 ">
                <h1 className="text-3xl font-bold mb-6">Nuestros productos</h1>
                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1">
                    {filteredProducts.map((p) => (
                        <li key={p.id} className="flex border p-1 rounded shadow bg-white min-h-40 sm:min-h-64 hover:shadow-lg hover:-translate-y-1 hover:scale-105
    transition-transform duration-300 ease-in-out">
                            <Link href={`/products/${p.id}`} className="flex md:flex-row gap-2 xs:gap-4 cursor-pointer items-stretch flex-1 h-full">
                                <div className="bg-gray-100 p-2 flex-shrink-0 w-32 xs:w-36 h-full flex items-center justify-center rounded">
                                    {/* <img src={p.images[0]?.url || "/images/default.webp"} alt={p.name} className="w-full h-full object-contain rounded" /> */}
                                    <div className="relative w-full h-full">
                                        <Image
                                            src={p.images[0]?.url || "/images/default.webp"}
                                            alt={p.name}
                                            className="object-contain rounded"
                                            fill
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col justify-around py-4 h-full">
                                    <h2 className="text-xl font-bold">{p.name}</h2>
                                    {/* <p>{truncate(p.description, 35)}</p> */}
                                    <p className="text-xl font-semibold text-gray-500">{p.brand}</p>
                                    <br />
                                    <p className="font-bold text-2xl text-[rgba(77,174,91,0.86)]">
                                        {formatearPrecio(p.price)}
                                    </p>
                                    <p className="text-gray-500 font-semibold">
                                        {p.stock > 1
                                            ? "Stock disponible"
                                            : p.stock === 1
                                                ? "¡Último disponible!"
                                                : "Sin stock"}
                                    </p>
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            </main>
        </>
    );
}
