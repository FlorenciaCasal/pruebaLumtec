"use client";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/lib/store";
import { removeFromCart, clearCart, incrementQuantity, decrementQuantity, addToCart } from "@/lib/store/cart/cartSlice";
import Link from "next/link";
import CheckoutCartButton from "../components/CheckoutCartButton";
import { Trash2, Plus, Minus } from 'lucide-react';



export default function Cart() {
    const items = useSelector((state: RootState) => state.cart.items);
    const dispatch = useDispatch();
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    // const shippingCost = items.length > 0 ? 500 : 0;
    // const total = subtotal + shippingCost;


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
                console.error("Error incrementando cantidad:", errorData.error);
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
                                key={item.cartItemId}
                                className="flex justify-between items-center p-2 rounded bg-gray-50"
                            >
                                <div className="flex items-center gap-4 sm:gap-8">
                                    <img
                                        src={Array.isArray(item.images) && item.images.length > 0 ? item.images[0].url : "/images/default.webp"}

                                        alt={item.name}
                                        className="w-16 h-16 object-cover rounded"
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
                        <p>
                            Envío: <span className="font-semibold">A coordinar</span>
                        </p>
                        <p>
                            El envío es sin cargo hasta el transporte acordado. Desde allí hasta el domicilio indicado por el cliente, el costo corre por cuenta del mismo.
                        </p>
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
            )}
        </div>
    );
}


