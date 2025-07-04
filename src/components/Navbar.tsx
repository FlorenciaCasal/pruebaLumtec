'use client';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import Image from 'next/image';
import { useDispatch } from 'react-redux'
import { setSearchQuery } from '@/lib/store/searchSlice';
import { usePathname } from 'next/navigation';


export default function Navbar() {
    const { data: session } = useSession();
    const [menuOpen, setMenuOpen] = useState(false);
    const query = useSelector((state: RootState) => state.search.query);
    const dispatch = useDispatch();
    const pathname = usePathname();


    // Obtener total de items en el carrito
    const totalItems = useSelector((state: RootState) =>
        state.cart.items.reduce((sum, item) => sum + item.quantity, 0)
    );

    return (
        <nav className="flex items-center px-4 py-4 md:px-16 bg-[rgba(77,174,91,0.86)] shadow-lg relative">
            {/* justify-between */}
            {pathname === '/' ? (
                <div className="hidden sm:flex items-center space-x-4">
                    <Link href="/" className="flex items-center space-x-2">
                        <Image
                            src="/images/logo.png"
                            alt="Lumtec Logo"
                            width={120}
                            height={120}
                            className="rounded max-w-[120px] h-auto"
                            priority
                        />
                    </Link>
                </div>
            ) : (
                <div className="flex items-center space-x-4">
                    <Link href="/" className="flex items-center space-x-2">
                        <Image
                            src="/images/logo.png"
                            alt="Lumtec Logo"
                            width={120}
                            height={120}
                            className="rounded max-w-[120px] h-auto"
                            priority
                        />
                    </Link>
                </div>
            )}

            {/* Buscador */}
            <div className="flex-1 px-0 ">
                {pathname === '/' && session?.user.role !== 'admin' && (
                    <div className="flex-1 px-2 md:px-4 ">
                        <div className="relative">
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                                placeholder="Buscar productos..."
                                className="w-full px-2 py-2 md:px-4 rounded text-black placeholder-gray-500"
                            />
                            {/* Línea divisoria */}
                            <span className="absolute right-9 top-1/2 transform -translate-y-1/2 text-gray-400">|</span>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                                className="w-5 h-5 text-gray-600 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"
                                />
                            </svg>
                        </div>
                    </div>
                )}
            </div>


            <div className="hidden md:flex items-center px-0 ">
                {pathname !== '/' && (
                    <Link href="/" className="text-white pr-6 text-lg font-medium transition-all duration-400 ease-in-out hover:opacity-70">
                        Productos
                    </Link>
                )}
            </div>



            {/* Desktop Links */}
            <div className="hidden md:flex space-x-6 items-center">
                {session?.user?.name ? (
                    <>
                        {session?.user.role === 'admin' ? (
                            <Link href="/admin" className="text-white pr-4 ml-2 text-lg font-medium transition-all duration-400 ease-in-out hover:opacity-70">Administrar</Link>
                        ) : (
                            <Link href="/profile">
                                <span className="text-black font-medium bg-[#f9d275] ml-1 w-10 h-10 flex items-center justify-center rounded-full transition-all duration-400 ease-in-out hover:opacity-70">
                                    {session.user.name
                                        .split(' ')
                                        .map(word => word[0])
                                        .join('')
                                        .toUpperCase()}
                                </span>
                            </Link>
                        )}
                        <button onClick={() => signOut({ callbackUrl: '/' })}
                            className="text-white pr-4 ml-2 text-lg font-medium transition-all duration-400 ease-in-out hover:opacity-70 ">
                            Cerrar sesión
                        </button>
                    </>
                ) : (
                    <Link href="/login" className="text-white pr-4 ml-2 text-lg font-medium transition-all duration-400 ease-in-out hover:opacity-70">
                        Ingresar
                    </Link>
                )}

                {/* Ícono carrito con badge */}
                <Link href="/cart" className="relative text-white transition-all duration-400 ease-in-out hover:opacity-70">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-6 h-6"
                        aria-hidden="true"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 2.7A1 1 0 007 17h10a1 1 0 001-1v-1M7 13L5.4 5M16 21a1 1 0 11-2 0 1 1 0 012 0zm-8 0a1 1 0 11-2 0 1 1 0 012 0z"
                        />
                    </svg>

                    {totalItems > 0 && (
                        <span className="absolute -top-1 -right-2 bg-red-600 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center font-bold">
                            {totalItems}
                        </span>
                    )}
                </Link>
            </div>

            {/* Mobile: saludo a la izquierda, hamburguesa a la derecha */}
            <div className="flex items-center justify-end md:hidden">
                {session?.user?.name ? (
                    session.user.role === 'admin' && (
                        <Link href="/admin" className="text-white pl-0 sm:pl-4 xs:pl-0 pr-2 xs:pr-4 ml-2 text-[16px] sm:text-lg font-medium transition-all duration-400 ease-in-out hover:opacity-70">Administrar</Link>
                    )
                ) : (
                    <div /> // placeholder vacío para que no mueva el botón
                )}

                <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="text-xl text-white focus:outline-none ml-2 transition-all duration-400 ease-in-out hover:opacity-70"
                    aria-label="Toggle menu"
                >
                    ☰
                </button>

                {/* Ícono carrito con badge */}
                <Link href="/cart"
                    onClick={() => setMenuOpen(false)}
                    className="relative pl-2 text-white transition-all duration-400 ease-in-out hover:opacity-70">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-6 h-6"
                        aria-hidden="true"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 2.7A1 1 0 007 17h10a1 1 0 001-1v-1M7 13L5.4 5M16 21a1 1 0 11-2 0 1 1 0 012 0zm-8 0a1 1 0 11-2 0 1 1 0 012 0z"
                        />
                    </svg>

                    {totalItems > 0 && (
                        <span className="absolute -top-1 -right-2 bg-red-600 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center font-bold">
                            {totalItems}
                        </span>
                    )}
                </Link>


            </div>

            {/* Mobile Menu */}
            {
                menuOpen && (
                    <div
                        className="fixed top-0 right-0 h-full bg-[rgba(77,174,91,0.97)] border-2 border-gray-400 p-6 z-50 shadow-lg flex flex-col"
                        style={{ width: "30vw", minWidth: "200px" }}
                    >
                        <button
                            onClick={() => setMenuOpen(false)}
                            className="self-end text-3xl mb-6 focus:outline-none"
                            aria-label="Cerrar menú"
                        >
                            ×
                        </button>

                        <Link
                            href="/"
                            className="text-white hover:text-gray-500 transition mb-4"
                            onClick={() => setMenuOpen(false)}
                        >
                            Productos
                        </Link>
                        <Link
                            href="/profile"
                            className="text-white hover:text-gray-500 transition mb-4"
                            onClick={() => setMenuOpen(false)}
                        >
                            Mi cuenta
                        </Link>
                        <Link
                            href="/contacto"
                            className="text-white hover:text-gray-500 transition mb-6"
                            onClick={() => setMenuOpen(false)}
                        >
                            Contacto
                        </Link>

                        {session?.user ? (
                            <>
                                <button
                                    onClick={() => {
                                        signOut({ callbackUrl: '/' });
                                        setMenuOpen(false);
                                    }}
                                    className="w-full md:w-auto bg-white text-gray-700 py-1 rounded-lg text-lg font-medium transition-all duration-400 ease-in-out hover:opacity-70"
                                >
                                    Cerrar sesión
                                </button>
                            </>
                        ) : (
                            <Link href="/login" onClick={() => setMenuOpen(false)}>
                                <button
                                    className="w-full md:w-auto bg-white text-gray-700 py-1 rounded-lg text-lg font-medium transition-all duration-400 ease-in-out hover:opacity-70"
                                >Ingresar
                                </button>
                            </Link>
                        )}

                    </div>

                )
            }
        </nav >
    );
}
