"use client";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/lib/store";
import { removeFromCart, clearCart, incrementQuantity, decrementQuantity } from "@/lib/store/cart/cartSlice";
import Link from "next/link";
import CheckoutCartButton from "../components/CheckoutCartButton";
import { Trash2, Plus, Minus } from 'lucide-react';
import Image from "next/image";
import { toast } from "sonner";
import { useState } from "react";
import { setCartId, setCartItems } from "@/lib/store/cart/cartSlice";
import { useEffect } from "react";

type ProductImage = {
    id: string;
    url: string;
    productId: string;
};

type Package = {
    id: string;
    weightKg: number;
    widthCm: number;
    heightCm: number;
    depthCm: number;
    quantity: number;
};

type CartItemFromApi = {
    id: string;             // id del cartItem
    quantity: number;       // cantidad en el carrito
    product: {
        id: string;
        name: string;
        brand: string | null;
        price: number;
        images: ProductImage[];
        type: string;
        packages: Package[];
    };
};

export type CartApiResponse = {
    id: string;
    items: CartItemFromApi[];
    removedProducts: string[];
};

export default function Cart() {
    const items = useSelector((state: RootState) => state.cart.items);
    const dispatch = useDispatch();
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const [postalCode, setPostalCode] = useState("");
    const [shippingCost, setShippingCost] = useState<number | null>(null);
    const cartId = useSelector((state: RootState) => state.cart.cartId);

    useEffect(() => {
        async function loadCart() {
            try {
                const res = await fetch("/api/cart");
                if (!res.ok) throw new Error("Error cargando carrito");
                const data: CartApiResponse = await res.json();
                // Asumiendo que `data.cart.id` y `data.cart.items` vienen del backend
                dispatch(setCartId(data.id));
                dispatch(setCartItems(
                    data.items.map((item) => ({
                        cartItemId: item.id,
                        productId: item.product.id,
                        name: item.product.name,
                        price: item.product.price,
                        quantity: item.quantity,
                        images: item.product.images,
                        type: item.product.type || 'default', // o lo que corresponda
                        packages: item.product.packages || [],
                    }))
                ));
                console.log("data.items", data.items)
            } catch (error) {
                console.error(error);
            }
        }

        loadCart();
    }, [dispatch]);



    const handleRemoveFromCart = async (cartItemId: string) => {
        try {
            const res = await fetch(`/api/cart/item/${cartItemId}`, {
                method: 'DELETE',
            });
            if (!res.ok) {
                const errorData = await res.json();
                console.error("Error eliminando producto:", errorData.error);
                return;
            }
            // Si todo bien → actualiza Redux
            dispatch(removeFromCart(cartItemId));
        } catch (error) {
            console.error("Error de red:", error);
        }
    };

    const handleIncrement = async (cartItemId: string, currentQuantity: number) => {
        try {
            const res = await fetch(`/api/cart/item/${cartItemId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quantity: currentQuantity + 1 }),
            });
            if (!res.ok) {
                const errorData = await res.json();
                toast.error(errorData.error || "No se pudo actualizar cantidad");
                return;
            }
            dispatch(incrementQuantity(cartItemId));
        } catch (error) {
            console.error("Error de red:", error);
        }
    };

    const handleDecrement = async (cartItemId: string, currentQuantity: number) => {
        if (currentQuantity <= 1) return; // Evitar decrementar a menos de 1
        try {
            const res = await fetch(`/api/cart/item/${cartItemId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quantity: currentQuantity - 1 }),
            });
            if (!res.ok) {
                const errorData = await res.json();
                console.error("Error decrementando cantidad:", errorData.error);
                return;
            }
            dispatch(decrementQuantity(cartItemId));
        } catch (error) {
            console.error("Error de red:", error);
        }
    };

    const handleClearCart = async () => {
        try {
            const res = await fetch("/api/cart", {
                method: "DELETE",
            });
            if (!res.ok) {
                const errorData = await res.json();
                console.error("Error al vaciar carrito:", errorData.error);
                return;
            }
            dispatch(clearCart());
        } catch (error) {
            console.error("Error de red:", error);
        }
    };

    const handleGetShippingCost = async () => {
        if (!cartId) {
            toast.error("No hay carrito activo para cotizar.");
            return;
        }

        if (!postalCode) {
            toast.error("Por favor ingrese un código postal.");
            return;
        }
        try {
            const res = await fetch("/api/shipping/quote", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cartId, postalCode }),
            });
            const data = await res.json();
            console.log("Shipping res data:", data);
            setShippingCost(data.shippingCost);
        } catch (err) {
            console.error("Error obteniendo shipping:", err);
        }
    };

    return (
        <div className="p-4 sm:p-8 border rounded w-full bg-white">
            <h2 className="text-2xl font-bold mb-4">Carrito</h2>
            {items.length === 0 ? (
                <p>El carrito está vacío.</p>
            ) : (
                <>
                    <ul className="space-y-4">
                        {items.map((item) => (
                            <li
                                // key={item.cartItemId}
                                key={item.cartItemId}
                                className="flex justify-between items-center p-2 rounded bg-gray-50"
                            >
                                <div className="flex items-center gap-4 sm:gap-8">
                                    <Image
                                        src={Array.isArray(item.images) && item.images.length > 0 ? item.images[0].url : "/images/default.webp"}
                                        alt={item.name}
                                        className="object-cover rounded"
                                        width={64}
                                        height={64}
                                    />
                                    <div>
                                        <h3 className="font-semibold">{item.name}</h3>
                                        <p>${item.price ? item.price.toFixed(2) : "0.00"} c/u</p>
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2">
                                            <div className="flex items-center gap-2 border rounded p-1">
                                                <button
                                                    onClick={() => handleDecrement(item.cartItemId, item.quantity)}
                                                    className="p-1 text-gray-700 hover:text-black transition"
                                                >
                                                    <Minus size={16} />
                                                </button>
                                                <span className="w-6 text-center">{item.quantity}</span>
                                                <button
                                                    onClick={() => handleIncrement(item.cartItemId, item.quantity)}
                                                    className="p-1 text-gray-700 hover:text-black transition"
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </div>
                                            <span className="font-semibold sm:ml-4">
                                                Subtotal: ${(item.price * item.quantity).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    className="text-red-500 hover:text-red-600 transition"
                                    onClick={() => handleRemoveFromCart(item.cartItemId)}
                                >
                                    <Trash2 size={20} />
                                </button>
                            </li>
                        ))}
                    </ul>

                    <div className="mt-6 p-2 space-y-2 bg-gray-50">
                        {/* <p>
                            Envío: <span className="font-semibold">A coordinar</span>
                        </p>
                        <p>
                            El envío es sin cargo hasta el transporte acordado. Desde allí hasta el domicilio indicado por el cliente, el costo corre por cuenta del mismo.
                        </p> */}
                        <div className="flex gap-2 items-center">
                            <input
                                type="text"
                                value={postalCode}
                                onChange={(e) => setPostalCode(e.target.value)}
                                placeholder="Código postal"
                                className="border rounded p-2 w-32"
                            />
                            <button
                                onClick={handleGetShippingCost}
                                className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700"
                            >
                                Calcular envío
                            </button>
                        </div>

                        {shippingCost && <p>Costo estimado de envío: {shippingCost}</p>}
                    </div>

                    <div className="mt-6 p-2 space-y-2 bg-gray-50">
                        <h3 className="text-xl font-bold">Total: ${subtotal.toFixed(2)}</h3>
                    </div>

                    <div className="flex gap-2 mt-4 flex-wrap">
                        <Link
                            href="/"
                            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
                        >
                            Seguir comprando
                        </Link>

                        <button
                            onClick={handleClearCart}
                            className="border border-red-500 text-red-500 px-4 py-2 rounded-lg hover:bg-red-50 transition"
                        >
                            Vaciar carrito
                        </button>

                        <CheckoutCartButton />
                    </div>
                </>
            )
            }
        </div >
    );
}


