import React, { Suspense } from "react";
import OrderSuccess from "@/components/OrderSuccess";

export default function OrderSuccessPage() {
    return (
        <Suspense fallback={<div>Cargando...</div>}>
            <OrderSuccess />
        </Suspense>
    );
}

// "use client";

// import { useEffect } from "react";
// import { useDispatch } from "react-redux";
// import { clearCart } from "@/lib/store/cart/cartSlice";
// import { useRouter, useSearchParams } from "next/navigation";

// export default function OrderSuccess() {
//     const dispatch = useDispatch();
//     const router = useRouter();
//     const searchParams = useSearchParams();

//     const status = searchParams.get("status");

//     useEffect(() => {
//         if (status === "approved") {
//             dispatch(clearCart());
//         }
//     }, [dispatch, status]);

//     return (
//         <div className="p-4 max-w-2xl mx-auto text-center">
//             {status === "approved" ? (
//                 <>
//                     <h1 className="text-3xl font-bold mb-4">¡Gracias por tu compra!</h1>
//                     <p className="mb-4">Te enviamos un email con los detalles de tu pedido.</p>
//                     <button
//                         onClick={() => router.push("/")}
//                         className="bg-green-600 text-white px-4 py-2 rounded"
//                     >
//                         Volver al inicio
//                     </button>
//                 </>
//             ) : (
//                 <>
//                     <h1 className="text-3xl font-bold mb-4">Pago no completado</h1>
//                     <p className="mb-4">No pudimos procesar tu pago. Por favor, intentá nuevamente.</p>
//                     <button
//                         onClick={() => router.push("/cart")}
//                         className="bg-yellow-600 text-white px-4 py-2 rounded"
//                     >
//                         Volver al carrito
//                     </button>
//                 </>
//             )}
//         </div>
//     );
// }
