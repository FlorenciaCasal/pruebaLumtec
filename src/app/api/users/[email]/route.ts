import { NextResponse } from 'next/server';
import { authOptions } from "@/lib/auth";
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth";

// export async function DELETE(req: NextRequest, { params }: { params: { email: string } }) {
export async function DELETE(request: Request, context: { params: Promise<{ email: string }> }) {
    const params = await context.params;

    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Validar que el usuario que elimina sea admin
        if (session.user.role !== "admin") {
            return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
        }

        const emailToDelete = params.email;

        // Eliminar usuario por email
        const result = await prisma.user.deleteMany({
            where: { email: emailToDelete },
        });

        if (result.count === 0) {
            return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
        }

        return NextResponse.json({ message: "Usuario eliminado correctamente" });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}