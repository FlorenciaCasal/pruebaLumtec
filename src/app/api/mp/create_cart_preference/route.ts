import { NextRequest, NextResponse } from "next/server";
import { mercadopago } from "@/lib/mercadopago";
import { Preference } from 'mercadopago';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";


type CartItem = {
  id: string;
  title: string;
  quantity: number;
  unit_price: number;
}

// Instanciamos la clase Preference del SDK con mercadopago configurado
const preferences = new Preference(mercadopago);

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  // Validar rol permitido (opcional si querés restringir)
  if (session.user.role !== 'user' && session.user.role !== 'admin') {
    return NextResponse.json({ error: "Permiso denegado" }, { status: 403 });
  }
  try {
    const items: CartItem[] = await request.json();
    // Validación básica de que items sea array y tenga contenido
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Items inválidos" }, { status: 400 });
    }
    // Validar stock disponible de cada producto
    const productIds = [...new Set(items.map(item => item.id))];

    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });
    for (const item of items) {
      const product = products.find(p => p.id === item.id);
      if (!product) {
        return NextResponse.json({ error: `Producto ${item.title} no encontrado` }, { status: 404 });
      }
      if (product.stock < item.quantity) {
        return NextResponse.json({ error: `Stock insuficiente para ${item.title}` }, { status: 400 });
      }
    }

    console.log("Session user id:", session.user.id);

    // Buscar carrito open del usuario
    const cart = await prisma.cart.findFirst({
      where: {
        userId: session.user.id,
        status: "open",
      },
    });
    if (!cart) {
      return NextResponse.json({ error: "No hay carrito activo" }, { status: 400 });
    }

    // Configurar preferencia de pago
    const preference = {
      items: items.map((item: CartItem) => ({
        id: item.id,
        title: item.title,
        quantity: item.quantity,
        unit_price: item.unit_price,
        currency_id: "ARS",
      })),
      back_urls: {
        success: " http://localhost:3000/order-success?status=approved",
        failure: " http://localhost:3000/order-success?status=failed",
        pending: " http://localhost:3000/order-success?status=pending",
      },
      auto_return: "approved",
      // notification_url: "https://b84c-148-222-130-216.ngrok-free.app/api/notifications",
      notification_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/notifications`,
      metadata: {
        userId: session.user.id,
        cartId: cart.id,  // 👈 le pasamos el id del carrito activo
      },
    };

    // Creamos la preferencia usando la instancia Preference
    const result = await preferences.create({ body: preference });

    return NextResponse.json({ id: result.id });
  } catch (error) {
    console.error("Error al crear preferencia:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}







