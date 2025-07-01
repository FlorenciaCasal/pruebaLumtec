"use client";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setCartItems } from "@/lib/store/cart/cartSlice";
import { getPendingProduct, clearPendingProduct } from "@/lib/localStorage";
import { toast } from "sonner";

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

type Product = {
    id: string;
    name: string;
    price: number;
    images: ProductImage[];
    type: string;
    packages: Package[];
};

type CartItem = {
    id: string;
    quantity: number;
    product: Product;
};


export default function PendingProductHandler() {
    const dispatch = useDispatch();

    useEffect(() => {
        const product = getPendingProduct();
        if (product) {
            async function addPendingToServer() {
                try {
                    const res = await fetch("/api/cart", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ productId: product.id, quantity: product.quantity }),
                    });

                    const data = await res.json();

                    if (res.ok) {
                        // dispatch(setCartItems(data.cart.items.map((item: any) => ({
                        dispatch(setCartItems(data.items.map((item: CartItem) => ({
                            id: item.id,
                            name: item.product.name,
                            price: item.product.price,
                            quantity: item.quantity,
                            images: item.product.images,
                            type: item.product.type,       // <- si lo necesitás
                            packages: item.product.packages // <- si lo necesitás
                        }))));

                        toast.success("Producto agregado al carrito", {
                            description: 'Se guardaron los cambios correctamente.',
                            duration: 3000,
                            position: 'top-center'
                        });
                        clearPendingProduct(); // lo eliminamos del localStorage
                    } else {
                        toast.error(data.error || "Error al agregar el producto al carrito");
                    }
                } catch (error) {
                    console.error("Error al procesar producto pendiente:", error);
                    toast.error("No se pudo conectar con el servidor");
                }
            }

            addPendingToServer();
        }
    }, [dispatch]);

    return null;
}
