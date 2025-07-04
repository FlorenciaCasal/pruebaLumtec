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

type Address = {
    id: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone?: string;
    isDefault: boolean;
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
    addresses: Address[]; // <-- acá
};


export default function ProfilePage() {
    // const [profile, setProfile] = useState<any>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [openSection, setOpenSection] = useState<string | null>(null);
    const [isSettingDefault, setIsSettingDefault] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const { status } = useSession();

    // Solo cargar perfil cuando la sesión esté autenticada
    useEffect(() => {
        if (status === "authenticated") {
            const fetchProfile = async () => {
                const res = await fetch("/api/profile");
                if (res.ok) {
                    const data = await res.json();
                    setProfile({
                        ...data,
                        addresses: data.addresses || [],
                        sales: data.sales || [],
                        payments: data.payments || [],
                        orders: data.orders || [],
                        carts: data.carts || []
                    });
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

    // Estados para el formulario dirección
    const [newAddress, setNewAddress] = useState({
        street: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
        phone: "",
        isDefault: false,
    });
    const [loadingAddress, setLoadingAddress] = useState(false);
    const [errorAddress, setErrorAddress] = useState<string | null>(null);

    const toggleSection = (section: string) => {
        setOpenSection(openSection === section ? null : section);
    };

    // Función para manejar cambios en el formulario de dirección
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setNewAddress(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    // Función para agregar nueva dirección
    const addAddress = async () => {
        setErrorAddress(null);
        if (!newAddress.street || !newAddress.city || !newAddress.state || !newAddress.postalCode || !newAddress.country) {
            setErrorAddress("Por favor completa todos los campos obligatorios.");
            return;
        }
        setLoadingAddress(true);
        try {
            const res = await fetch("/api/addresses", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newAddress),
            });
            if (!res.ok) throw new Error("Error al guardar dirección");
            const savedAddress = await res.json();
            setProfile(prev => prev ? { ...prev, addresses: [...prev.addresses, savedAddress] } : prev);
            setNewAddress({
                street: "",
                city: "",
                state: "",
                postalCode: "",
                country: "",
                phone: "",
                isDefault: false,
            });
        } catch {
            setErrorAddress("Error desconocido");
        }
        setLoadingAddress(false);
    };

    // Función para eliminar dirección
    const deleteAddress = async (id: string) => {
        if (!confirm("¿Eliminar esta dirección?")) return;
        try {
            const res = await fetch(`/api/addresses/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("No se pudo eliminar");
            setProfile(prev => prev ? { ...prev, addresses: prev.addresses.filter(addr => addr.id !== id) } : prev);
        } catch {
            alert("Error desconocido");
        }
    };

    // Función para marcar dirección por defecto
    const setDefaultAddress = async (id: string) => {
        setIsSettingDefault(true);
        try {
            const res = await fetch(`/api/addresses/${id}/set-default`, { method: "PUT" });
            if (!res.ok) throw new Error("No se pudo establecer dirección por defecto");
            setProfile(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    addresses: prev.addresses.map(addr => ({
                        ...addr,
                        isDefault: addr.id === id,
                    })),
                };
            });
            setToastMessage("Dirección establecida como predeterminada ✔️");
        } catch {
            setToastMessage("Error al establecer dirección por defecto ❌");
        } finally {
            setIsSettingDefault(false);
            setTimeout(() => setToastMessage(null), 3000);
        }
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
            {
                toastMessage && (
                    <div className="fixed bottom-5 right-5 bg-black bg-opacity-70 text-white px-4 py-2 rounded shadow-md z-50">
                        {toastMessage}
                    </div>
                )
            }
            {/* Header */}
            <div className="flex items-center space-x-4">
                {profile.image ? (
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

            {/* Accordion Sections */}
            {[

                // Carrito actual, Ventas, Pagos, Pedidos, etc. igual que tenés

                {
                    title: "🏠 Direcciones", key: "addresses", content: (
                        <>
                            {profile.addresses.length === 0 && <p className="text-gray-500 mb-2">No tienes direcciones guardadas.</p>}

                            <ul className="mb-4 space-y-3">
                                {profile.addresses.map(addr => (
                                    <li key={addr.id} className="border p-3 rounded flex justify-between items-center">
                                        <div>
                                            <p className="font-medium">{addr.street}, {addr.city}, {addr.state}, {addr.postalCode}, {addr.country}</p>
                                            {addr.phone && <p className="text-sm text-gray-500">Tel: {addr.phone}</p>}
                                            {addr.isDefault && <span className="inline-block mt-1 px-2 py-0.5 bg-green-200 text-green-800 text-xs rounded">Predeterminada</span>}
                                        </div>
                                        <div className="flex space-x-2">
                                            {!addr.isDefault && (
                                                <button
                                                    disabled={isSettingDefault}
                                                    onClick={() => setDefaultAddress(addr.id)}
                                                    className={`text-sm px-2 py-1 rounded ${addr.isDefault ? "bg-green-500 text-white cursor-default" : "bg-blue-500 text-white hover:bg-blue-600"
                                                        }`}
                                                >
                                                    {addr.isDefault ? "Predeterminada" : isSettingDefault ? "Estableciendo..." : "Establecer por defecto"}
                                                </button>
                                            )}
                                            <button
                                                onClick={() => deleteAddress(addr.id)}
                                                className="text-sm px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>

                            {/* Formulario para nueva dirección */}
                            <div className="border p-4 rounded space-y-3">
                                <h3 className="font-semibold mb-2">Agregar nueva dirección</h3>
                                {errorAddress && <p className="text-red-600">{errorAddress}</p>}
                                <input
                                    type="text"
                                    name="street"
                                    placeholder="Calle y número"
                                    value={newAddress.street}
                                    onChange={handleInputChange}
                                    className="w-full border rounded p-2"
                                />
                                <input
                                    type="text"
                                    name="city"
                                    placeholder="Ciudad"
                                    value={newAddress.city}
                                    onChange={handleInputChange}
                                    className="w-full border rounded p-2"
                                />
                                <input
                                    type="text"
                                    name="state"
                                    placeholder="Provincia/Estado"
                                    value={newAddress.state}
                                    onChange={handleInputChange}
                                    className="w-full border rounded p-2"
                                />
                                <input
                                    type="text"
                                    name="postalCode"
                                    placeholder="Código Postal"
                                    value={newAddress.postalCode}
                                    onChange={handleInputChange}
                                    className="w-full border rounded p-2"
                                />
                                <input
                                    type="text"
                                    name="country"
                                    placeholder="País"
                                    value={newAddress.country}
                                    onChange={handleInputChange}
                                    className="w-full border rounded p-2"
                                />
                                <input
                                    type="text"
                                    name="phone"
                                    placeholder="Teléfono (opcional)"
                                    value={newAddress.phone}
                                    onChange={handleInputChange}
                                    className="w-full border rounded p-2"
                                />
                                <label className="inline-flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        name="isDefault"
                                        checked={newAddress.isDefault}
                                        onChange={handleInputChange}
                                    />
                                    <span>Establecer como dirección predeterminada</span>
                                </label>

                                <button
                                    onClick={addAddress}
                                    disabled={loadingAddress}
                                    className="mt-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-green-300"
                                >
                                    {loadingAddress ? "Guardando..." : "Agregar dirección"}
                                </button>
                            </div>
                        </>
                    )
                },

            ].concat([
                // Tus otras secciones actuales:
                {
                    title: "🛒 Carrito actual", key: "cart", content: (
                        (!profile.carts?.[0]?.items || profile.carts[0].items.length === 0) ? (
                            <p className="text-gray-500">Sin productos en carrito.</p>
                        ) : (
                            <ul className="divide-y">
                                {profile.carts?.[0]?.items?.map((item) => (
                                    <li key={item.product.name} className="py-2 flex items-center space-x-3">
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
                                {profile.sales.map((sale) => (
                                    <li key={sale.id} className="border p-2 rounded">
                                        <p>{sale.product.name}</p>
                                        <p>Cantidad: {sale.quantity}</p>
                                        <p>Importe: ${sale.amount}</p>
                                        <p className="text-xs text-gray-400">{new Date(sale.createdAt).toLocaleString()}</p>
                                    </li>
                                ))}
                            </ul>
                        )
                    )
                },
                {
                    title: "💰 Pagos", key: "payments", content: (
                        profile.payments.length === 0 ? (
                            <p className="text-gray-500">Sin pagos registrados.</p>
                        ) : (
                            <ul className="space-y-2">
                                {profile.payments.map((pay) => (
                                    <li key={pay.id} className="border p-2 rounded">
                                        <p>Importe: ${pay.amount}</p>
                                        <p>Estado: {pay.status}</p>
                                        <p className="text-xs text-gray-400">{new Date(pay.createdAt).toLocaleString()}</p>
                                    </li>
                                ))}
                            </ul>
                        )
                    )
                },
                {
                    title: "📦 Pedidos", key: "orders", content: (
                        profile.orders.length === 0 ? (
                            <p className="text-gray-500">No tienes pedidos.</p>
                        ) : (
                            <ul className="space-y-3">
                                {profile.orders.map((order) => (
                                    <li key={order.id} className="border rounded p-3">
                                        <p>Total: ${order.total}</p>
                                        <p>Estado: {order.status}</p>
                                        <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleString()}</p>
                                        <ul className="mt-2 space-y-1">
                                            {order.orderItems.map((item) => (
                                                <li key={item.id} className="flex justify-between text-sm">
                                                    <span>{item.product.name} x {item.quantity}</span>
                                                    <span>${item.unitPrice}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </li>
                                ))}
                            </ul>
                        )
                    )
                }

            ]).map(({ title, key, content }) => (
                <div key={key} className="border rounded">
                    <button
                        onClick={() => toggleSection(key)}
                        className="w-full text-left px-4 py-3 font-semibold flex justify-between items-center"
                    >
                        {title}
                        <span>{openSection === key ? "▲" : "▼"}</span>
                    </button>
                    {openSection === key && <div className="px-4 py-3">{content}</div>}
                </div>
            ))}
        </div>
    );
}