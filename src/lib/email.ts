import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendResetPasswordEmail(to: string, resetLink: string) {
    try {
        const data = await resend.emails.send({
            from: 'Lumtec <onboarding@resend.dev>',
            to,
            subject: 'Recuperá tu contraseña',
            html: `
        <p>Hola,</p>
        <p>Recibimos una solicitud para restablecer tu contraseña.</p>
        <p>Hacé click en el siguiente enlace para continuar:</p>
        <p><a href="${resetLink}">Restablecer contraseña</a></p>
        <p>Si no solicitaste este cambio, ignorá este mensaje.</p>
      `,
        });

        console.log("Email enviado:", data);
    } catch (error) {
        console.error("Error enviando email:", error);
    }
}

