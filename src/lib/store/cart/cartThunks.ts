import { AppDispatch } from '../../store'
import { addToCart, clearCart } from './cartSlice';
import { toast } from 'sonner'

export async function fetchCart(dispatch: AppDispatch) {
    const res = await fetch('/api/cart');
    const data = await res.json();

    if (res.ok && data.items) {
        dispatch(clearCart());
        data.items.forEach((item: any) => {
            dispatch(addToCart({
                cartItemId: item.id,
                productId: item.product.id,
                name: item.product?.name || 'Sin nombre',
                price: item.product?.price ?? 0,
                quantity: item.quantity,
                images: item.product?.images || [],
            }));
        });
        if (data.removedProducts && data.removedProducts.length > 0) {
            toast.warning(
                `Se eliminaron del carrito por falta de stock: ${data.removedProducts.join(", ")}`,
                { duration: 4500, position: "top-center" }
            )
        }
    }
    console.log(data)
}



export async function addProductToCart(productId: string, quantity: number, dispatch: AppDispatch) {
    const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity }),
    });

    const data = await res.json();

    if (res.ok && data.cart) {
        dispatch(clearCart());
        data.cart.items.forEach((item: any) => {
            console.log("ITEM DESDE POST API", item);
            dispatch(addToCart({
                cartItemId: item.id,
                productId: item.product.id,
                name: item.product.name,
                price: item.product.price,
                quantity: item.quantity,
                images: item.product.images,
            }));
        });
        if (data.removedProducts && data.removedProducts.length > 0) {
            toast.warning(
                `Se eliminaron del carrito por falta de stock: ${data.removedProducts.join(", ")}`,
                { duration: 4500, position: "top-center" }
            )
        }
    }
    console.log(data)
}
