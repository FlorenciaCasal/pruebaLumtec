import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

interface Params {
    params: { id: string };
}

export async function PUT(request: Request, { params }: Params) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const address = await prisma.address.findUnique({
        where: { id: params.id },
    });

    if (!address || address.userId !== session.user.id) {
        return NextResponse.json({ error: "Dirección no encontrada" }, { status: 404 });
    }

    // Primero desmarcamos cualquier dirección default del usuario
    await prisma.address.updateMany({
        where: { userId: session.user.id, isDefault: true },
        data: { isDefault: false },
    });

    // Ahora marcamos esta como default
    const updatedAddress = await prisma.address.update({
        where: { id: params.id },
        data: { isDefault: true },
    });

    return NextResponse.json(updatedAddress);
}
