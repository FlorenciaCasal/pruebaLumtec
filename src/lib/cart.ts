import { prisma } from "@/lib/prisma";

export async function getOrCreateActiveCart(userId: string) {
    let cart = await prisma.cart.findFirst({
        where: {
            userId,
            status: "open",
        },
    });

    if (!cart) {
        cart = await prisma.cart.create({
            data: {
                userId,
                status: "open",
            },
        });
    }

    return cart;
}

export async function validateCartStock(cartId: string) {
    const cartItems = await prisma.cartItem.findMany({
        where: { cartId },
        include: { product: true },
    });

    const removedProducts: string[] = [];

    const validProductIds: string[] = [];

    for (const item of cartItems) {
        if (!item.product || item.product.stock < item.quantity) {
            removedProducts.push(item.product?.name || "Producto eliminado");
        } else {
            validProductIds.push(item.productId);
        }
    }

    if (validProductIds.length !== cartItems.length) {
        await prisma.cartItem.deleteMany({
            where: {
                cartId,
                productId: {
                    notIn: validProductIds,
                },
            },
        });
    }
    console.log("Productos eliminados del carrito:", removedProducts);
    return removedProducts;
}