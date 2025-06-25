export const savePendingProduct = (product: any) => {
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