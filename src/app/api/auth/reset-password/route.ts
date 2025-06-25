import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
    const { token, password } = await request.json();

    if (!token || !password) {
        return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
        where: {
            resetToken: token,
            resetTokenExp: { gte: new Date() },
        },
    });

    if (!user) {
        return NextResponse.json({ error: "Token inválido o expirado" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
        where: { id: user.id },
        data: {
            password: hashedPassword,
            resetToken: null,
            resetTokenExp: null,
        },
    });

    return NextResponse.json({ message: "Contraseña actualizada correctamente" });
}
