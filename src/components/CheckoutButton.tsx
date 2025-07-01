"use client";
import { useDispatch } from "react-redux";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { savePendingProduct } from "@/lib/localStorage";
import { LogIn } from "lucide-react";
import { signIn, SignInResponse } from "next-auth/react";
import { addProductToCart } from "@/lib/store/cart/cartThunks";
import { AppDispatch } from "@/lib/store";

type ProductImage = {
  id: string;
  url: string;
  productId: string;
};

type Props = {
  id: string;
  name: string;
  price: number;
  images: ProductImage[];
  quantity?: number;
};


export default function CheckoutButton({ id, name, price, images, quantity = 1 }: Props) {
  const dispatch = useDispatch();
  const { data: session } = useSession();
  const router = useRouter();

  const handleAddToCart = async () => {
    if (!session) {
      // Guarda producto pendiente en localStorage
      savePendingProduct({ id, name, price, quantity, images });

      toast.custom((t) => (
        <div className="p-4 rounded-lg bg-white shadow flex items-start gap-4 max-w-sm">
          <LogIn className="text-orange-500" size={24} />
          <div className="flex-1">
            <p className="font-semibold text-orange-600">Iniciar sesión requerido</p>
            <p className="text-gray-700 mt-1 text-sm">Tenés que iniciar sesión para agregar productos al carrito.</p>
            <button
              onClick={async () => {
                toast.dismiss(t);
                const res = await signIn(undefined, {
                  redirect: false,
                  callbackUrl: "/"
                }) as SignInResponse | undefined;
                if (res?.url) {
                  router.push(res.url);
                }
              }}
              className="mt-3 bg-orange-500 text-white px-3 py-1 rounded hover:bg-orange-600 transition text-sm"
            >
              Iniciar sesión
            </button>
          </div>
        </div>
      ), { duration: 6000, position: 'top-center' });

      return;
    }

    console.log("productId: id y quantity", JSON.stringify({ productId: id, quantity }));

    try {
      await addProductToCart(id, quantity, dispatch as AppDispatch);
    } catch (error) {
      console.error("Error al agregar producto al carrito", error);
      toast.error("No se pudo conectar con el servidor");
    }
  };

  return (
    <button
      onClick={handleAddToCart}
      className="w-full xs:w-auto md:w-full bg-green-600 text-white px-4 py-2 rounded-xl text-lg font-medium shadow-lg hover:shadow-xl hover:bg-green-600/90 transition duration-300"
    >
      Agregar al carrito
    </button>
  );
}

// Mastercard
// 5031 7557 3453 0604
// 123
// 11/30
// Para probar diferentes resultados de pago, completa el estado deseado en el nombre del titular de la tarjeta:

// Estado de pago	Descripción	Documento de identidad
// APRO
// Pago aprobado
// (DNI) 12345678

// USUARIO DE PRUEBA comprador
// TESTUSER1281570129
// KNsRLiZiXl

// USUARIO DE PRUEBA vendedor
// TESTUSER839436645
// 5ia7ZDVL0Y

// user id: 064144

// visa
// 4509 9535 6623 3704