import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { sendResetPasswordEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
    const { email } = await request.json();

    if (!email) {
        return NextResponse.json({ error: "Email requerido" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        // Devuelvo siempre genérico para no exponer qué mails existen
        return NextResponse.json({ message: "Si existe una cuenta con ese email, se enviará un correo." });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hora

    await prisma.user.update({
        where: { email },
        data: {
            resetToken: token,
            resetTokenExp: expires,
        },
    });

    const resetLink = `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password?token=${token}`;

    try {
        await sendResetPasswordEmail(email, resetLink);
        console.log(`📧 Email de recuperación enviado a ${email}`);
    } catch (error) {
        console.error("❌ Error enviando email de recuperación:", error);
        // Opcional: podés notificar a algún admin o log externo
    }

    return NextResponse.json({ message: "Si existe una cuenta con ese email, se enviará un correo." });
}
