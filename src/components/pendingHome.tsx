"use client";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
// import { addToCart } from "@/lib/store/cart/cartSlice";
import { setCartItems } from "@/lib/store/cart/cartSlice";
import { getPendingProduct, clearPendingProduct } from "@/lib/localStorage";
import { toast } from "sonner";

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
                        dispatch(setCartItems(data.cart.items.map((item: any) => ({
                            id: item.id,
                            name: item.product.name,
                            price: item.product.price,
                            quantity: item.quantity,
                            images: item.product.images,
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
//         const product = getPendingProduct();
//         if (product) {
//             dispatch(addToCart(product));
//             toast.success("Producto agregado al carrito", {
//                 description: 'Se guardaron los cambios correctamente.',
//                 duration: 3000,
//                 position: 'top-center'
//             });
//         }
//     }, [dispatch]);

//     return null;
// }