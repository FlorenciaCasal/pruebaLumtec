"use client";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setCartItems, clearCart } from "@/lib/store/cart/cartSlice";
import { useSession } from "next-auth/react";

export default function CartSyncHandler() {
    const dispatch = useDispatch();
    const { status } = useSession();


    useEffect(() => {
        const fetchCart = async () => {
            const res = await fetch("/api/cart", {
                credentials: 'include'
            });
            const data = await res.json();
            if (data.items) {
                const items = data.items.map((item: any) => ({
                    cartItemId: item.id, // 👈 ahora traemos el cartItem.id
                    productId: item.product.id,
                    name: item.product.name,
                    price: item.product.price,
                    quantity: item.quantity,
                    images: item.product.images
                }));
                dispatch(setCartItems(items));
            }
        };

        //     fetchCart();
        // }, [dispatch]);
        if (status === "authenticated") {
            fetchCart();
        }

        if (status === "unauthenticated") {
            dispatch(clearCart());
        }
    }, [status, dispatch]);

    return null;
}
