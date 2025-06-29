"use client";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { useState } from "react";
import { toast } from "sonner";

declare global {
  interface Window {
    MercadoPago?: new (publicKey: string, options?: { locale: string }) => {
      checkout: (options: { preference: { id: string }, autoOpen: boolean }) => void;
    };
  }
}

export default function CheckoutCartButton() {
  const items = useSelector((state: RootState) => state.cart.items);
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast.error(`❌ Tu carrito está vacío`, {
        duration: 3000,
        position: 'top-center'
      });
      return;
    }

    setLoading(true);

    // 🎯 Mapear los items al formato de Mercado Pago
    // const mpItems = items.map((item) => ({
    //   id: item.cartItemId,
    //   productId: item.productId,
    //   title: item.name, // tu carrito usa `name`, MP espera `title`
    //   quantity: item.quantity,
    //   currency_id: "ARS",
    //   unit_price: item.price,
    // }));
    
    // Para MercadoPago: id debe ser productId
    const mpItems = items.map((item) => ({
      id: item.productId,      // ✅ usar el id del producto, no del cartItem
      productId: item.productId,
      title: item.name,
      quantity: item.quantity,
      currency_id: "ARS",
      unit_price: item.price,
    }));

    console.log("Items para MP:", mpItems);


    const res = await fetch("/api/mp/create_cart_preference", {
      // const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/mp/create_cart_preference`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mpItems),
    });

    const data = await res.json();

    if (data.id) {
      // const MercadoPago = (window as any).MercadoPago;
      const MercadoPago = window.MercadoPago;
      if (!MercadoPago) {
        toast.error(`❌ Mercado Pago SDK no cargado`, {
          duration: 3000,
          position: 'top-center'
        });
        setLoading(false);
        return;
      }

      const mp = new MercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY!, {
        locale: "es-AR",
      });

      mp.checkout({
        preference: { id: data.id },
        autoOpen: true,
      });
    } else {
      toast.error(`❌ Error al crear la preferencia`, {
        duration: 3000,
        position: 'top-center'
      });
    }

    setLoading(false);
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className="bg-green-600 text-white px-4 py-2 rounded-xl shadow-lg hover:shadow-xl hover:bg-green-700/90 transition duration-300"
    >
      {loading ? "Procesando..." : "Ir a pagar"}
    </button>
  );
}
