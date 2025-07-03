import { NextRequest, NextResponse } from "next/server";
import { mercadopago } from "@/lib/mercadopago";
import { Preference } from 'mercadopago';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";


type CartItem = {
  id: string;
  productId: string;
  title: string;
  quantity: number;
  unit_price: number;
}

// Instanciamos la clase Preference del SDK con mercadopago configurado
const preferences = new Preference(mercadopago);

export async function POST(request: NextRequest) {
  console.log("handler llamado");
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  // Validar rol permitido (opcional si querés restringir)
  if (session.user.role !== 'user' && session.user.role !== 'admin') {
    return NextResponse.json({ error: "Permiso denegado" }, { status: 403 });
  }
  try {
    // const items: CartItem[] = await request.json();
    const body = await request.json();
    console.log("Body recibido en create_cart_preference:", body);
    const items: CartItem[] = body.items;
    // Validación básica de que items sea array y tenga contenido
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Items inválidos" }, { status: 400 });
    }
    // Validar stock disponible de cada producto
    // const productIds = [...new Set(items.map(item => item.productId))];
    const productIds = [...new Set(items
      .filter(item => item.productId !== undefined)
      .map(item => item.productId)
    )];

    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });
    for (const item of items) {
      const product = products.find(p => p.id === item.productId);
      if (!product) {
        return NextResponse.json({ error: `Producto ${item.title} no encontrado` }, { status: 404 });
      }
      if (product.stock < item.quantity) {
        return NextResponse.json({ error: `Stock insuficiente para ${item.title}` }, { status: 400 });
      }
    }

    console.log("Session user id:", session.user.id);
    console.log("Product IDs:", productIds);
    console.log("Items:", items);

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

    const preference = {
      items: items.map((item: CartItem) => {
        //   const product = products.find(p => p.id === item.productId);
        //   return {
        //     id: item.id,
        //     title: item.title,
        //     quantity: item.quantity,
        //     unit_price: product ? product.price : 0,  // Tomamos el precio real desde la DB
        //     currency_id: "ARS",
        //   };
        // }),
        // Si es el ítem de envío lo dejamos como viene
        if (item.id === "shipping") {
          return {
            id: "shipping",
            title: "Costo de envío",
            quantity: 1,
            unit_price: item.unit_price,
            currency_id: "ARS",
          };
        }
        const product = products.find(p => p.id === item.productId);
        if (!product) throw new Error(`Producto ${item.title} no encontrado al crear preferencia`);
        return {
          id: item.id,
          title: item.title,
          quantity: item.quantity,
          unit_price: product.price,
          currency_id: "ARS",
        };
      }),
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_BASE_URL}/order-success?status=approved`,
        failure: `${process.env.NEXT_PUBLIC_BASE_URL}/order-success?status=failed`,
        pending: `${process.env.NEXT_PUBLIC_BASE_URL}/order-success?status=pending`,
      },

      auto_return: "approved",
      // notification_url: "https://8074-2803-9810-335b-3210-e000-21e8-f369-8816.ngrok-free.app/api/notifications",
      // Produccion:
      notification_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/notifications`,
      metadata: {
        userId: session.user.id,
        cartId: cart.id,  // 👈 le pasamos el id del carrito activo
      },
    };

    // Aquí justo antes de llamar a MP:
    console.log("back_urls en preferencia:", preference.back_urls);
    console.log("Preferencia completa antes de crear:", preference);

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







