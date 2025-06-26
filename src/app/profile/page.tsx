"use client";
import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import Image from "next/image";

type ProductImage = {
    url: string;
};

type Product = {
    name: string;
    images: ProductImage[];
};

type CartItem = {
    product: Product;
    quantity: number;
};

type Sale = {
    id: string;
    product: Product;
    quantity: number;
    amount: number;
    createdAt: string;
};

type Payment = {
    id: string;
    amount: number;
    status: string;
    createdAt: string;
};

type OrderItem = {
    id: string;
    product: Product;
    quantity: number;
    unitPrice: number;
};

type Order = {
    id: string;
    total: number;
    createdAt: string;
    status: string;
    orderItems: OrderItem[];
};

type Profile = {
    name: string;
    email: string;
    image?: string;
    role: string;
    carts?: { items: CartItem[] }[];
    sales: Sale[];
    payments: Payment[];
    orders: Order[];
};


export default function ProfilePage() {
    // const [profile, setProfile] = useState<any>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [openSection, setOpenSection] = useState<string | null>(null);
    const { status } = useSession();

    // Solo cargar perfil cuando la sesión esté autenticada
    useEffect(() => {
        if (status === "authenticated") {
            const fetchProfile = async () => {
                const res = await fetch("/api/profile");
                if (res.ok) {
                    const data = await res.json();
                    setProfile(data);
                }
            };
            fetchProfile();
        }
    }, [status]);

    // Si no está autenticado, redirigir a login
    useEffect(() => {
        if (status === "unauthenticated") {
            signIn(); // Esto redirige automáticamente a la página de login de NextAuth
        }
    }, [status]);

    const toggleSection = (section: string) => {
        setOpenSection(openSection === section ? null : section);
    };

    if (status === "loading") {
        return <p className="text-center mt-10">Cargando sesión...</p>;
    }

    if (status === "unauthenticated") {
        return <p className="text-center mt-10">Redirigiendo a login...</p>;
    }

    if (!profile) return <p className="text-center mt-10">Cargando perfil...</p>;


    return (
        <div className="max-w-2xl mx-auto p-4 space-y-4">
            {/* Header */}
            <div className="flex items-center space-x-4">
                {profile.image ? (
                    // <img src={profile.image} alt={profile.name} className="w-12 h-12 md:w-16 md:h-16 rounded-full" />
                    <div className="relative w-12 h-12 md:w-16 md:h-16">
                        <Image
                            src={profile.image}
                            alt={profile.name}
                            className="rounded-full object-cover"
                            fill
                        />
                    </div>
                ) : (
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gray-300 flex items-center justify-center text-xl font-bold">
                        {profile.name
                            ?.split(" ")
                            .map((n: string) => n[0])
                            .join("")}
                    </div>
                )}
                <div>
                    <p className="text-xl font-bold">{profile.name}</p>
                    <p className="text-gray-600 text-sm">{profile.email}</p>
                    <span className="text-sm px-2 py-1 rounded bg-gray-200">{profile.role}</span>
                </div>
            </div>

            {/* Accordion Section */}
            {[
                {
                    title: "🛒 Carrito actual", key: "cart", content: (
                        (!profile.carts?.[0]?.items || profile.carts[0].items.length === 0) ? (
                            <p className="text-gray-500">Sin productos en carrito.</p>
                        ) : (
                            <ul className="divide-y">
                                {/* {profile.carts?.[0]?.items?.map((item: any) => ( */}
                                {profile.carts?.[0]?.items?.map((item) => (
                                    <li key={item.product.name} className="py-2 flex items-center space-x-3">
                                        {/* <img src={item.product.images[0]?.url} alt="" className="w-10 h-10 rounded" /> */}
                                        <Image
                                            src={item.product.images[0]?.url}
                                            alt="carrito actual"
                                            className=" rounded"
                                            width={40}
                                            height={40}
                                        />
                                        <div>
                                            <p className="font-medium">{item.product.name}</p>
                                            <p className="text-sm text-gray-500">Cantidad: {item.quantity}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )
                    )
                },
                {
                    title: "📦 Compras", key: "sales", content: (
                        profile.sales.length === 0 ? (
                            <p className="text-gray-500">Aún no realizaste compras.</p>
                        ) : (
                            <ul className="space-y-2">
                                {/* {profile.sales.map((sale: any) => ( */}
                                {profile.sales.map((sale) => (
                                    <li key={sale.id} className="flex justify-between items-center">
                                        <div>
                                            <p className="font-medium">{sale.product.name}</p>
                                            <p className="text-sm text-gray-500">Cantidad: {sale.quantity}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold">${sale.amount}</p>
                                            <p className="text-xs text-gray-400">{new Date(sale.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )
                    )
                },
                {
                    title: "💳 Pagos", key: "payments", content: (
                        profile.payments.length === 0 ? (
                            <p className="text-gray-500">Sin pagos registrados.</p>
                        ) : (
                            <ul className="space-y-2">
                                {/* {profile.payments.map((payment: any) => ( */}
                                {profile.payments.map((payment) => (
                                    <li key={payment.id} className="flex justify-between items-center">
                                        <div>
                                            <p className="font-semibold">${payment.amount}</p>
                                            <p className="text-sm text-gray-500">{payment.status}</p>
                                        </div>
                                        <p className="text-xs text-gray-400">{new Date(payment.createdAt).toLocaleDateString()}</p>
                                    </li>
                                ))}
                            </ul>
                        )
                    )
                },
                {
                    title: "📑 Pedidos", key: "orders", content: (
                        profile.orders.length === 0 ? (
                            <p className="text-gray-500">Sin pedidos realizados.</p>
                        ) : (
                            <ul className="space-y-3">
                                {/* {profile.orders.map((orders: any) => ( */}
                                {profile.orders.map((orders) => (
                                    <li key={orders.id} className="p-3 border rounded-lg">
                                        <div className="flex justify-between mb-2">
                                            <p className="font-semibold">Total: ${orders.total}</p>
                                            <p className="text-sm">{new Date(orders.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <p className="text-sm mb-2">Estado: <span className="font-medium">{orders.status}</span></p>
                                        <ul className="text-sm space-y-1">
                                            {/* {orders.orderItems.map((item: any) => ( */}
                                            {orders.orderItems.map((item) => (
                                                <li key={item.id} className="flex items-center space-x-2">
                                                    {/* <img src={item.product.images[0]?.url} alt="" className="w-8 h-8 rounded" /> */}
                                                    <Image
                                                        src={item.product.images[0]?.url}
                                                        alt="pedidos"
                                                        className=" rounded"
                                                        width={32}
                                                        height={32}
                                                    />
                                                    <div>
                                                        <p>{item.product.name}</p>
                                                        <p className="text-xs text-gray-500">Cantidad: {item.quantity} - ${item.unitPrice}</p>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </li>
                                ))}
                            </ul>
                        )
                    )
                }
            ].map(section => (
                <div key={section.key} className="bg-white shadow rounded-xl">
                    <button
                        onClick={() => toggleSection(section.key)}
                        className="w-full flex justify-between items-center p-4 font-semibold text-left"
                    >
                        {section.title}
                        <span>{openSection === section.key ? "−" : "+"}</span>
                    </button>
                    {openSection === section.key && (
                        <div className="px-4 pb-4">
                            {section.content}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

