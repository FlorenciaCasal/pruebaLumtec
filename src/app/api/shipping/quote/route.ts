// app/api/shipping/quote/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    // const { cartId, postalCode } = await req.json();
    const { cartId} = await req.json();

    if (!cartId) {
      return NextResponse.json({ error: "CartId requerido" }, { status: 400 });
    }

    const items = await prisma.cartItem.findMany({
      where: { cartId },
      include: {
        product: {
          include: { packages: true },
        },
      },
    });
    if (items.length === 0) {
      return NextResponse.json({ error: "No hay items en el carrito" }, { status: 404 });
    }

    // Armamos listado de paquetes reales
    // const packages = items.flatMap((item) =>
    //   item.product.packages.map((pack) => ({
    //     weightKg: pack.weightKg * item.quantity,
    //     widthCm: pack.widthCm,
    //     heightCm: pack.heightCm,
    //     depthCm: pack.depthCm,
    //     quantity: pack.quantity * item.quantity,
    //   }))
    // );

    // Ahora llamarías a la API de Cruz del Sur acá
    // const response = await fetch("https://api.cruzdelsur.com/cotizar", {
    //   method: "POST",
    //   headers: {
    //     Authorization: `Bearer ${process.env.CRUZ_DEL_SUR_TOKEN}`,
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({
    //     originPostalCode: "1234", // tu depósito
    //     destinationPostalCode: postalCode,
    //     packages,
    //   }),
    // });

    // Simulamos respuesta por ahora:
    const formatearPrecio = (precio: number) => {
      return new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }).format(precio);
    };

    const shippingCost = 1; // Por ejemplo; // Por ejemplo

    return NextResponse.json({ shippingCost });
  } catch (error) {
    console.error("❌ Error en shipping quote:", error);
    return NextResponse.json({ error: "Error interno en la cotización" }, { status: 500 });
  }
}
