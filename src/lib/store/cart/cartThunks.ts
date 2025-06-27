import { AppDispatch } from '../../store'
import { addToCart, clearCart } from './cartSlice';
import { toast } from 'sonner'

type ProductImage = {
    id: string;
    url: string;
    productId: string;
};

type CartItemFromApi = {
    id: string;             // id del cartItem
    quantity: number;       // cantidad en el carrito
    product: {
        id: string;
        name: string;
        price: number;
        images: ProductImage[];
    };
};

type CartApiResponse = {
    items: CartItemFromApi[];
    removedProducts?: string[];
};

type AddProductToCartResponse = {
    cart: {
        items: CartItemFromApi[];
    };
    removedProducts?: string[];
};

export async function fetchCart(dispatch: AppDispatch) {
    const res = await fetch('/api/cart');
    // const data = await res.json();
    const data: CartApiResponse = await res.json();

    if (res.ok && data.items) {
        dispatch(clearCart());
        // data.items.forEach((item: any) => {
        data.items.forEach((item) => {
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

    // const data = await res.json();
    const data: AddProductToCartResponse = await res.json();
    console.log("Respuesta completa de addProductToCart API:", data);

    if (res.ok && data.cart) {
        dispatch(clearCart());
        // data.cart.items.forEach((item: any) => {
        data.cart.items.forEach((item) => {
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
