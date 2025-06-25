
import { type AuthOptions, type Session } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcrypt";
import type { JWT } from "next-auth/jwt";
import { PrismaClient, Prisma } from "@prisma/client";


const prisma = new PrismaClient();

export const authOptions: AuthOptions = {
    adapter: PrismaAdapter(prisma),
    session: {
        strategy: "jwt",
        maxAge: 30 * 60, // 30 minutos
        updateAge: 5 * 60, // se renueva si hace actividad a los 5 min
    },

    cookies: {
        sessionToken: {
            name: process.env.NODE_ENV === 'production'
                ? '__Secure-next-auth.session-token'
                : 'next-auth.session-token',
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: process.env.NODE_ENV === 'production',
            },
        },
    },
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_ID!,
            clientSecret: process.env.GOOGLE_SECRET!,
        }),
        CredentialsProvider({
            name: "Email y Contraseña",
            credentials: {
                email: { label: "Email", type: "email", placeholder: "email@ejemplo.com" },
                password: { label: "Contraseña", type: "password" },
            },
            async authorize(credentials): Promise<any> {
                if (!credentials?.email || !credentials?.password) return null;

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        role: true,
                        password: true,
                    },
                });

                if (!user || !user.password) return null;

                const isValid = await bcrypt.compare(credentials.password, user.password);
                if (!isValid) return null;

                // return user;
                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user, account }) {
            if (user) {
                token.id = user.id;  // 👉 esto faltaba
                token.role = user.role;
                console.log("JWT Callback token", token);
            }
            if (account) {
                const existingUser = await prisma.user.findUnique({
                    where: { email: token.email as string },
                });
                if (existingUser) {
                    token.role = existingUser.role;
                    // 👉 Si es login con Google y no tiene googleId, actualizalo
                    if (account.provider === 'google' && !existingUser.googleId) {
                        await prisma.user.update({
                            where: { email: token.email as string },
                            data: { googleId: account.providerAccountId },
                        });
                    }
                } else if (account.provider === 'google') {
                    try {
                        // Si no existe y es Google, crearlo
                        const newUser = await prisma.user.create({
                            data: {
                                email: token.email as string,
                                name: token.name || "",
                                googleId: account.providerAccountId,
                                role: "user",
                            },
                        });
                        token.id = newUser.id;   // 👉 también acá en caso de creación
                        token.role = newUser.role;

                    } catch (error) {
                        if (
                            error instanceof Prisma.PrismaClientKnownRequestError &&
                            error.code === "P2002"
                        ) {
                            const existingUserRetry = await prisma.user.findUnique({
                                where: { email: token.email as string },
                            });
                            if (existingUserRetry) {
                                token.id = existingUserRetry.id;
                                token.role = existingUserRetry.role;
                            }
                        } else {
                            console.error("Error creando usuario Google:", error);
                        }
                    }
                }
            }

            return token;
        },
        async session({ session, token }: { session: Session; token: JWT }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;

                // 👉 Verificar si existe carrito para este userId
                const existingCart = await prisma.cart.findFirst({
                    where: { userId: token.id as string },
                });

                if (!existingCart) {
                    await prisma.cart.create({
                        data: {
                            userId: token.id as string,
                        },
                    });
                }
            }
            return session;
        },
        async signIn({ user, account }) {
            if (account?.provider === 'google' && user?.email) {
                // Buscar usuario por email
                const existingUser = await prisma.user.findUnique({
                    where: { email: user.email }
                });
                if (existingUser && !existingUser.googleId) {
                    // Usuario ya registrado sin Google, rechazar inicio de sesión
                    return '/login?error=OAuthAccountNotLinked';
                }
            }
            console.log("NEXTAUTH_SECRET:", process.env.NEXTAUTH_SECRET);
            return true;
        },
    },
    pages: {
        signIn: "/login",
    },
    secret: process.env.NEXTAUTH_SECRET,
};