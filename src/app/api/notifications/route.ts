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

//   // if (body.type !== "payment") return new NextResponse("OK", { status: 200 });
//   if (body.type !== "payment" && body.topic !== "payment") {
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

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN!;
const MP_SECRET = process.env.MP_SECRET!;

const isDevelopment = process.env.NODE_ENV !== "production";

// Type guards para discriminar tipos
function isPaymentTypeNotification(
  obj: unknown
): obj is { type: "payment"; data: { id: string | number } } {
  if (typeof obj !== "object" || obj === null) return false;
  const data = obj as Record<string, unknown>;
  return (
    data.type === "payment" &&
    typeof (data.data as Record<string, unknown>)?.id !== "undefined"
  );
}

function isPaymentTopicNotification(
  obj: unknown
): obj is { topic: "payment"; resource: string | number } {
  if (typeof obj !== "object" || obj === null) return false;
  const data = obj as Record<string, unknown>;
  return (
    data.topic === "payment" &&
    typeof data.resource !== "undefined"
  );
}

export async function POST(request: NextRequest) {
  const bodyText = await request.text();
  console.log("Notificación recibida:", bodyText);

  // let body: MercadoPagoNotification;


  if (!isDevelopment) {
    const signature = request.headers.get("x-mercadopago-signature");
    if (!signature) return new NextResponse("Signature missing", { status: 400 });

    const computedSignature = crypto
      .createHmac("sha256", MP_SECRET)
      .update(bodyText)
      .digest("hex");

    if (computedSignature !== signature)
      return new NextResponse("Invalid signature", { status: 403 });
  }
  // Ahora sí parsear el body una vez
  const body = JSON.parse(bodyText) as unknown;


  let paymentId: string | number;
  // if (!isPaymentTypeNotification(body) && !isPaymentTopicNotification(body)) {
  //   return new NextResponse("OK", { status: 200 });
  // }
  if (isPaymentTypeNotification(body)) {
    paymentId = body.data.id;
  } else if (isPaymentTopicNotification(body)) {
    paymentId = body.resource;
  } else {
    // Notificación no relevante (ej: merchant_order)
    return new NextResponse("OK", { status: 200 });
  }




  console.log("Procesando paymentId:", paymentId);

  // Buscar el pago en la API de Mercado Pago
  const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: {
      Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
    },
  });

  if (!res.ok) return new NextResponse("Payment not found", { status: 404 });

  const paymentData = await res.json();
  if (!paymentData.live_mode) return new NextResponse("Prueba recibida OK", { status: 200 });

  const { status, metadata, additional_info } = paymentData;
  const userId = metadata?.userId;

  type Item = {
    id: string;
    quantity: number | string;
    unit_price: number;
  };

  const items: Item[] = additional_info?.items;
  const cartId = metadata?.cartId;

  if (!userId || !items || items.length === 0) {
    return new NextResponse("Faltan datos en metadata o items", { status: 400 });
  }

  // Verificar si el pago ya se procesó
  const existingPayment = await prisma.payment.findUnique({
    where: { paymentId: paymentId.toString() },
  });

  if (existingPayment && existingPayment.status === "approved") {
    return new NextResponse("Payment already processed", { status: 200 });
  }

  // Transacción segura
  await prisma.$transaction(async (tx) => {
    // Registrar o actualizar el pago
    await tx.payment.upsert({
      where: { paymentId: paymentId.toString() },
      update: {
        status,
        amount: paymentData.transaction_amount,
      },
      create: {
        paymentId: paymentId.toString(),
        status,
        amount: paymentData.transaction_amount,
        userId,
      },
    });

    if (status === "approved") {
      // Cerrar carrito
      if (cartId) {
        await tx.cart.update({
          where: { id: cartId },
          data: { status: "closed" },
        });
      }

      // Crear orden
      const order = await tx.orders.create({
        data: {
          userId,
          paymentId: paymentId.toString(),
          total: paymentData.transaction_amount,
          status: "paid",
        },
      });

      // Procesar cada item vendido
      for (const item of items) {
        const productId = item.id;
        const quantity = typeof item.quantity === "string" ? parseInt(item.quantity, 10) : item.quantity;

        const product = await tx.product.findUnique({
          where: { id: productId },
        });

        if (!product) continue;
        if (product.stock < quantity) continue;

        await tx.product.update({
          where: { id: productId },
          data: { stock: { decrement: quantity } },
        });

        await tx.sale.create({
          data: {
            paymentId: paymentId.toString(),
            productId,
            quantity,
            amount: item.unit_price * quantity,
            userId,
          },
        });

        await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId,
            quantity,
            unitPrice: item.unit_price,
          },
        });
      }
    }
  });

  return new NextResponse("OK", { status: 200 });
}








