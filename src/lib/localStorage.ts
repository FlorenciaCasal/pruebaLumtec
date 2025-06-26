import { ProductImage } from '@/types/productImage.types';

type PendingProduct = {
    id: string;
    name: string;
    price: number;
    quantity: number;
    images: ProductImage[];
};

export const savePendingProduct = (product: PendingProduct) => {
    localStorage.setItem("pendingProduct", JSON.stringify(product));
};

export const getPendingProduct = () => {
    const item = localStorage.getItem("pendingProduct");
    if (!item) return null;
    localStorage.removeItem("pendingProduct");
    return JSON.parse(item);
};

export function clearPendingProduct() {
    localStorage.removeItem("pendingProduct");
}