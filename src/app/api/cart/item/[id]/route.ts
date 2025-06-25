import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;
        const cartItemId = params.id;

        // Validar que el item pertenece al carrito del usuario
        const cartItem = await prisma.cartItem.findUnique({
            where: { id: cartItemId },
            include: { cart: true },
        });

        if (!cartItem || cartItem.cart.userId !== userId) {
            return NextResponse.json({ error: "Item no encontrado o no autorizado" }, { status: 404 });
        }

        await prisma.cartItem.delete({ where: { id: cartItemId } });

        await prisma.cart.update({
            where: { id: cartItem.cartId },
            data: {
                updatedAt: new Date(),
            },
        });

        return NextResponse.json({ message: "Item eliminado" });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}


export async function PATCH(request: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;
        const cartItemId = params.id;
        const { quantity } = await request.json();

        if (quantity < 1) {
            return NextResponse.json({ error: "Cantidad inválida" }, { status: 400 });
        }

        // Verificar que el item pertenece al carrito del usuario
        const cartItem = await prisma.cartItem.findUnique({
            where: { id: cartItemId },
            include: { cart: true },
        });

        if (!cartItem || cartItem.cart.userId !== userId) {
            return NextResponse.json({ error: "Item no encontrado o no autorizado" }, { status: 404 });
        }

        const updatedItem = await prisma.cartItem.update({
            where: { id: cartItemId },
            data: { quantity },
        });
        await prisma.cart.update({
            where: { id: cartItem.cartId },
            data: {
                updatedAt: new Date(),
            },
        });

        return NextResponse.json({ cartItem: updatedItem });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}
