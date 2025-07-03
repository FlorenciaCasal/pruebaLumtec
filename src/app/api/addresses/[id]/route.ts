import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

interface Params {
    params: { id: string };
}

export async function DELETE(request: Request, { params }: Params) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const address = await prisma.address.findUnique({ where: { id: params.id } });
    if (!address || address.userId !== session.user.id) {
        return NextResponse.json({ error: "Dirección no encontrada" }, { status: 404 });
    }

    await prisma.address.delete({ where: { id: params.id } });

    return NextResponse.json(null, { status: 204 });
}

export async function PUT(request: Request, { params }: Params) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { isDefault } = await request.json();

    if (typeof isDefault !== "boolean") {
        return NextResponse.json({ error: "Falta campo isDefault" }, { status: 400 });
    }

    const address = await prisma.address.findUnique({ where: { id: params.id } });
    if (!address || address.userId !== session.user.id) {
        return NextResponse.json({ error: "Dirección no encontrada" }, { status: 404 });
    }

    if (isDefault) {
        // Desmarcar otras predeterminadas
        await prisma.address.updateMany({
            where: { userId: session.user.id, isDefault: true },
            data: { isDefault: false },
        });
    }

    const updated = await prisma.address.update({
        where: { id: params.id },
        data: { isDefault },
    });

    return NextResponse.json(updated);
}
