"use client";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setCartItems, clearCart, setCartId } from "@/lib/store/cart/cartSlice";
import { useSession } from "next-auth/react";


type ApiCartItem = {
    id: string;
    quantity: number;
    product: {
        id: string;
        name: string;
        brand: string;
        price: number;
        images: { url: string }[];
        packages: {
            weightKg: number;
            widthCm: number;
            heightCm: number;
            depthCm: number;
            quantity: number;
        }[];
    };
};

export default function CartSyncHandler() {
    const dispatch = useDispatch();
    const { status } = useSession();


    useEffect(() => {
        const fetchCart = async () => {
            const res = await fetch("/api/cart", {
                credentials: 'include'
            });
            const data = await res.json();
            console.log("data en cartSyncHandler: ", data)
            if (data.id && data.items) {
                const items = data.items.map((item: ApiCartItem) => ({
                    cartItemId: item.id, // 👈 ahora traemos el cartItem.id
                    productId: item.product.id,
                    name: item.product.name,
                    brand: item.product.brand,
                    price: item.product.price,
                    quantity: item.quantity,
                    images: item.product.images,
                    packages: item.product.packages
                }));
                dispatch(setCartItems(items));
                dispatch(setCartId(data.id));
            }
        };

        if (status === "authenticated") {
            fetchCart();
        }

        if (status === "unauthenticated") {
            dispatch(clearCart());
        }
    }, [status, dispatch]);

    return null;
}
