// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import crypto from "crypto";

// const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN!;
// const MP_SECRET = process.env.MP_SECRET!;
// const isDevelopment = process.env.NODE_ENV !== "production";

// export async function POST(request: NextRequest) {
//   console.log("Notificación recibida:", await request.text());

//   let body;
//    let topic: string | null = null;
//   let paymentId: string | null = null;

//    try {
//     const { searchParams } = new URL(request.url);
//     topic = searchParams.get("topic");
//     paymentId = searchParams.get("id");

//     if (!topic || !paymentId) {
//       // Si no vino por query params, intentamos leer body
//   if (!isDevelopment) {
//     const signature = request.headers.get("x-mercadopago-signature");
//     if (!signature) return new NextResponse("Signature missing", { status: 400 });

//     const bodyText = await request.text();
//     const computedSignature = crypto
//       .createHmac("sha256", MP_SECRET)
//       .update(bodyText)
//       .digest("hex");

//     if (computedSignature !== signature)
//       return new NextResponse("Invalid signature", { status: 403 });

//     body = JSON.parse(bodyText);
//   } else {
//     body = await request.json();
//   }

//   // if (topic !== "payment") return new NextResponse("OK", { status: 200 });
//   if (topic !== "payment" && topic !== "payment") {
//     return new NextResponse("OK", { status: 200 });
//   }

//   const paymentId = body.data.id;

//   const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
//     headers: {
//       Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
//     },
//   });

//   if (!res.ok) return new NextResponse("Payment not found", { status: 404 });

//   const paymentData = await res.json();
//   if (!paymentData.live_mode) return new NextResponse("Prueba recibida OK", { status: 200 });

//   const { status, metadata, additional_info } = paymentData;

//   // if (!metadata?.userId || !additional_info?.items?.length)
//   //   return new NextResponse("Faltan datos en metadata o items", { status: 400 });

//   // const userId = metadata.userId;
//   const userId = metadata?.userId;
//   const items = additional_info?.items;
//   const cartId = metadata.cartId;

//   if (!userId || !items || items.length === 0) {
//     return new NextResponse("Faltan datos en metadata o items", { status: 400 });
//   }

//   // Evitar reprocesar pagos aprobados
//   const existingPayment = await prisma.payment.findUnique({
//     where: { paymentId: paymentId.toString() },
//   });

//   if (existingPayment && existingPayment.status === "approved") {
//     return new NextResponse("Payment already processed", { status: 200 });
//   }

//   // Transacción segura
//   await prisma.$transaction(async (tx) => {
//     // Actualizar o crear registro de pago
//     await tx.payment.upsert({
//       where: { paymentId: paymentId.toString() },
//       update: {
//         status,
//         amount: paymentData.transaction_amount,
//       },
//       create: {
//         paymentId: paymentId.toString(),
//         status,
//         amount: paymentData.transaction_amount,
//         userId,
//       },
//     });

//     if (status === "approved") {
//       if (cartId) {
//         await tx.cart.update({
//           where: { id: cartId },
//           data: { status: "closed" },
//         });
//       }

//       // Crear Order principal
//       const orders = await tx.orders.create({
//         data: {
//           userId,
//           paymentId: paymentId.toString(),
//           total: paymentData.transaction_amount,
//           status: "paid",
//         },
//       });

//       // for (const item of additional_info.items) {
//       for (const item of items) {
//         const productId = item.id;
//         const quantity = parseInt(item.quantity, 10);

//         const product = await tx.product.findUnique({
//           where: { id: productId },
//         });

//         if (!product) continue;
//         if (product.stock < quantity) continue;

//         await tx.product.update({
//           where: { id: productId },
//           data: { stock: { decrement: quantity } },
//         });

//         // Registrar venta
//         await tx.sale.create({
//           data: {
//             paymentId: paymentId.toString(),
//             productId,
//             quantity,
//             amount: item.unit_price * quantity,
//             userId,
//           },
//         });

//         // Asociar item a la order
//         await tx.orderItem.create({
//           data: {
//             orderId: orders.id,
//             productId,
//             quantity,
//             unitPrice: item.unit_price,
//           },
//         });
//       }
//     }
//   });

//   return new NextResponse("OK", { status: 200 });
// } 


// api/notifications/route.ts


import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { PaymentStatus, OrderStatus } from '@prisma/client';

const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN!;
const MP_SECRET = process.env.MP_SECRET!;

function mapPaymentStatus(mpStatus: string): PaymentStatus {
  const statusMap: Record<string, PaymentStatus> = {
    pending: 'pending',
    approved: 'approved',
    rejected: 'rejected',
    cancelled: 'cancelled',
    in_process: 'pending',
    in_mediation: 'pending',
    charged_back: 'rejected'
  };
  return statusMap[mpStatus.toLowerCase()] || 'pending';
}

export async function POST(request: NextRequest) {
  try {
    const bodyText = await request.text();
    // const headers = Object.fromEntries(request.headers.entries());
    console.log("🔔 Notificación recibida");
    console.log("📝 Body:", bodyText);
    const body = JSON.parse(bodyText);
    console.log("📦 Body parsed:", body);

    // Validación de firma en prod o live_mode
    // if (process.env.NODE_ENV === "production" || body.live_mode === true) {
    if (process.env.NODE_ENV === "production" && body.live_mode === true) {
      // Solo validar firma en producción o live_mode=true
      const signature = request.headers.get("x-signature");
      if (!signature) {
        console.error("❌ Firma faltante");
        return NextResponse.json({ error: "Signature missing" }, { status: 400 });
      }

      const ts = signature.match(/t=([^,]*)/)?.[1];
      const v1Hash = signature.match(/v1=([^,]*)/)?.[1];

      if (!ts || !v1Hash) {
        console.error("❌ Formato de firma inválido");
        return NextResponse.json({ error: "Invalid signature format" }, { status: 400 });
      }

      const generatedHash = crypto
        .createHmac('sha256', MP_SECRET)
        .update(`t=${ts}.${bodyText}`)
        .digest('hex');

      if (v1Hash !== generatedHash) {
        console.error("❌ Firma inválida", { recibida: v1Hash, calculada: generatedHash });
        return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
      }
    }

    const topic = body.topic || body.type;

    if (!["payment", "merchant_order"].includes(topic)) {
      console.log("📤 Tipo de notificación no manejada:", topic);
      return NextResponse.json({ message: "Tipo de notificación no manejada" }, { status: 200 });
    }

    // Extraer paymentId
    let paymentId: string | undefined;

    if (topic === "merchant_order") {
      // Obtener el ID de la orden y luego el pago asociado
      const orderResponse = await fetch(body.resource, {
        headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` },
      });
      const orderData = await orderResponse.json();
      paymentId = orderData.payments?.[0]?.id;
    } else if (topic === "payment") {
      paymentId = body.data.id;
    }
    // Validar que se haya podido obtener paymentId
    if (!paymentId) {
      console.log("❌ No se pudo obtener paymentId");
      return NextResponse.json({ message: "Notificación sin paymentId" }, { status: 200 });
    }

    console.log("🔍 Procesando paymentId:", paymentId);

    // Obtener detalles del pago
    const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
        "Content-Type": "application/json"
      }
    });

    if (!mpResponse.ok) {
      console.error("❌ Error al obtener pago de MP");
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    const paymentData = await mpResponse.json();
    console.log("💳 Datos del pago:", paymentData);

    // Ignorar pagos de prueba
    if (!paymentData.live_mode) {
      console.log("🛑 Pago de prueba, ignorando");
      return NextResponse.json({ message: "Test payment ignored" }, { status: 200 });
    }

    // const { status, metadata, additional_info } = paymentData;
    // const userId = metadata?.userId;
    // if (!userId) {
    //   console.error("❌ userId no definido en metadata");
    //   return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    // }

    const { status, metadata, additional_info } = paymentData;
    const userId = metadata?.userId || metadata?.user_id;
    if (!userId) {
      console.error("❌ userId no definido en metadata");
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const items = additional_info?.items || [];
    if (items.length === 0) {
      console.error("❌ No hay items en el pago");
      return NextResponse.json({ error: "Missing items" }, { status: 400 });
    }
    const cartId = metadata?.cartId;

    console.log("📊 Metadata:", { userId, cartId, items });

    // Verificar si el pago ya existe
    const existingPayment = await prisma.payment.findUnique({
      where: { paymentId: paymentId.toString() }
    });

    if (existingPayment?.status === "approved") {
      console.log("🔄 Pago ya aprobado");
      return NextResponse.json({ message: "Payment already processed" }, { status: 200 });
    }

    // Procesar el pago
    await prisma.$transaction(async (tx) => {
      // Actualizar/crear pago con el status mapeado
      await tx.payment.upsert({
        where: { paymentId: paymentId.toString() },
        update: {
          status: mapPaymentStatus(status),
          amount: paymentData.transaction_amount
        },
        create: {
          paymentId: paymentId.toString(),
          status: mapPaymentStatus(status),
          amount: paymentData.transaction_amount,
          userId
        }
      });

      // Solo continuar si el pago está aprobado
      if (mapPaymentStatus(status) !== "approved") {
        console.log(`⏳ Pago no aprobado (${status}), saltando actualización`);
        return;
      }

      // Cerrar carrito si existe
      if (cartId) {
        await tx.cart.update({
          where: { id: cartId },
          data: { status: "closed" }
        });
      }

      // Crear orden
      const order = await tx.orders.create({
        data: {
          userId,
          paymentId: paymentId.toString(),
          total: paymentData.transaction_amount,
          status: "paid" as OrderStatus
        }
      });

      console.log("📦 Orden creada:", order.id);

      // Procesar items
      for (const item of items) {
        const productId = item.id;
        const quantity = Math.max(1, typeof item.quantity === "string"
          ? parseInt(item.quantity, 10)
          : item.quantity || 1);

        console.log(`🛒 Procesando item: ${productId}, cantidad: ${quantity}`);

        // Actualizar stock y crear registros
        await tx.product.update({
          where: { id: productId },
          data: { stock: { decrement: quantity } }
        });

        await tx.sale.create({
          data: {
            paymentId: paymentId.toString(),
            productId,
            quantity,
            amount: item.unit_price * quantity,
            userId
          }
        });

        await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId,
            quantity,
            unitPrice: item.unit_price
          }
        });
      }
    });

    console.log("✅ Pago procesado correctamente");
    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error("🔥 Error en webhook:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}