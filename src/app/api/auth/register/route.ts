import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        const { email, password, name } = await request.json();

        if (!email || !password || !name) {
            return NextResponse.json({ message: "Email, nombre y contraseña son obligatorios" }, { status: 400 });
        }

        // Verificar si ya existe usuario con ese email
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json({ message: "El email ya está registrado" }, { status: 400 });
        }

        // Hashear contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Crear usuario
        await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name: name || email.split("@")[0],
                role: "user",
            },
        });

        return NextResponse.json({ message: "Usuario creado correctamente" }, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Error en el servidor" }, { status: 500 });
    }
}
