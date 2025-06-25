"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession, getSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Button } from '@/components/ui/Button';
import { useForm } from 'react-hook-form';

type FormValues = {
    email: string;
    password: string;
    name?: string;
};


export default function LoginPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isRegister, setIsRegister] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
        reset,
    } = useForm<FormValues>();


    useEffect(() => {
        const error = searchParams.get("error");
        if (error === "OAuthAccountNotLinked") {
            setErrorMsg("Este email ya está registrado. Por favor, iniciá sesión con tu email y contraseña.");
        }
    }, [searchParams]);

    // Redireccionar según el rol cuando se autentica
    useEffect(() => {
        if (status === "authenticated") {
            if (session?.user.role === "admin") {
                router.push("/admin");
            } else {
                router.push("/");
            }
        }
    }, [status, session, router]);

    const onSubmit = async (data: FormValues) => {
        setErrorMsg('');

        if (isRegister) {
            try {
                const res = await fetch("/api/auth/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    // body: JSON.stringify({ email, password }),
                    body: JSON.stringify(data),
                });

                if (!res.ok) {
                    const resData = await res.json();
                    setErrorMsg(resData.message || 'Error en el registro');
                    return;
                }

                const loginRes = await signIn("credentials", {
                    ...data,
                    redirect: false,
                });

                if (loginRes?.error) {
                    setErrorMsg("Error al iniciar sesión");
                    return;
                }

                await redirectByRole();
            } catch {
                setErrorMsg("Error en la comunicación con el servidor");
            }
        } else {
            const res = await signIn("credentials", {
                ...data,
                redirect: false,
            });

            if (res?.error) {
                setErrorMsg("Email o contraseña incorrectos");
                return;
            }

            await redirectByRole();
        }
    };

    const handleGoogleLogin = () => {
        signIn("google", { callbackUrl: "/" });
    };

    const redirectByRole = async () => {
        const updatedSession = await getSession();

        if (updatedSession?.user.role === "admin") {
            router.push("/admin");
        } else {
            router.push("/");
        }
    };

    return (
        <div className="max-w-sm mx-auto p-6 bg-white rounded-xl shadow-md space-y-6 mt-10">
            <h1 className="text-2xl font-bold text-center">{isRegister ? 'Registrarse' : 'Iniciar sesión'}</h1>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {isRegister && (
                    <div>
                        <input
                            type="text"
                            placeholder="Nombre"
                            {...register('name', {
                                required: isRegister ? 'El nombre es obligatorio' : false,
                            })}
                            className="w-full border border-gray-300 rounded-md p-2"
                        />
                        {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                    </div>
                )}
                <div>
                    <input
                        type="email"
                        placeholder="Email"
                        {...register('email', { required: 'El email es obligatorio' })}
                        className="w-full border border-gray-300 rounded-md p-2"
                    />
                    {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                </div>

                <div>
                    <input
                        type="password"
                        placeholder="Contraseña"
                        {...register('password', { required: 'La contraseña es obligatoria' })}
                        className="w-full border border-gray-300 rounded-md p-2"
                    />
                    {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
                </div>

                {errorMsg && <p className="text-red-500 text-sm">{errorMsg}</p>}

                <Button type="submit" className="w-full bg-green-500 text-white px-4 py-2 rounded-xl text-lg font-medium shadow-lg hover:shadow-xl hover:bg-green-500/90 transition duration-300">
                    {isRegister ? 'Registrarse' : 'Ingresar'}
                </Button>

                <Button onClick={handleGoogleLogin} className="w-full bg-green-700 text-white px-4 py-2 rounded-xl text-lg font-medium shadow-lg hover:shadow-xl hover:bg-green-700/90 transition duration-300">
                    Continuar con Google
                </Button>
            </form>

            <p className="text-center text-sm">
                {isRegister ? '¿Ya tenés cuenta?' : '¿No tenés cuenta aún?'}{' '}
                <button
                    type="button"
                    onClick={() => {
                        setErrorMsg('');
                        reset();
                        setIsRegister(!isRegister);
                    }}
                    className="text-blue-600 underline"
                >
                    {isRegister ? 'Iniciar sesión' : 'Registrarse'}
                </button>
            </p>
            {!isRegister && (
                <p className="text-center text-sm mt-2">
                    <button
                        type="button"
                        onClick={() => router.push("/forgot-password")}
                        className="text-blue-600 underline"
                    >
                        ¿Olvidaste tu contraseña?
                    </button>
                </p>
            )}
        </div>
    );
}


