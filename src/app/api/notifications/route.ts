// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import crypto from "crypto";

// const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN!;
// const MP_SECRET = process.env.MP_SECRET!;

// const isDevelopment = process.env.NODE_ENV !== "production";

// export async function POST(request: NextRequest) {
//   let body;

//   if (!isDevelopment) {
//     const signature = request.headers.get("x-mercadopago-signature");
//     if (!signature) {
//       return new NextResponse("Signature missing", { status: 400 });
//     }

//     const bodyText = await request.text();

//     const computedSignature = crypto
//       .createHmac("sha256", MP_SECRET)
//       .update(bodyText)
//       .digest("hex");

//     if (computedSignature !== signature) {
//       return new NextResponse("Invalid signature", { status: 403 });
//     }

//     body = JSON.parse(bodyText);
//   } else {
//     body = await request.json();
//   }

//   console.log("Webhook recibido:", body);

//   if (body.type === "payment") {
//     const paymentId = body.data.id;

//     const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
//       headers: {
//         Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
//       },
//     });

//     if (!res.ok) {
//       console.error("Error al consultar payment:", await res.text());
//       return new NextResponse("Payment not found", { status: 404 });
//     }

//     const paymentData = await res.json();

//     console.log("Pago consultado:", paymentData);

//     if (!paymentData.live_mode) {
//       console.log("Notificación de prueba recibida.");
//       return new NextResponse("Prueba recibida OK", { status: 200 });
//     }

//     if (!paymentData.id || paymentData.id.toString() !== paymentId.toString()) {
//       console.error("ID de pago inconsistente");
//       return new NextResponse("ID inconsistente", { status: 400 });
//     }

//     if (!paymentData.status) {
//       console.error("Payment sin status");
//       return new NextResponse("Payment sin status", { status: 400 });
//     }

//     const items = paymentData.additional_info?.items || [];

//     if (items.length === 0) {
//       console.warn("Sin items en paymentData, posiblemente notificación de prueba.");
//       return new NextResponse("No items, posiblemente prueba.", { status: 200 });
//     }

//     const firstItem = items[0];
//     const productId = firstItem.id;
//     const quantity = parseInt(firstItem.quantity, 10);
//     const status = paymentData.status;

//     const existingPayment = await prisma.payment.findUnique({
//       where: { paymentId: paymentData.id.toString() },
//     });

//     if (existingPayment && existingPayment.status === "approved") {
//       console.log("Este pago ya fue procesado.");
//       return new NextResponse("Payment already processed", { status: 200 });
//     }

//     const userId = paymentData.metadata?.userId || paymentData.metadata?.user_id;
//     if (!userId) {
//       console.error("Falta userId en metadata");
//       return new NextResponse("Falta userId", { status: 400 });
//     }

//     // Hacer upsert
//     await prisma.payment.upsert({
//       where: { paymentId: paymentData.id.toString() },
//       update: {
//         status,
//         quantity,
//         amount: paymentData.transaction_amount,
//       },
//       create: {
//         paymentId: paymentData.id.toString(),
//         status,
//         productId,
//         quantity,
//         amount: paymentData.transaction_amount,
//         userId,
//       },
//     });


//     // Si está aprobado → actualizar stock y registrar venta

//     if (status === "approved") {

//       const cartId = paymentData.metadata?.cartId;
//       if (cartId) {
//         await prisma.cart.update({
//           where: { id: cartId },
//           data: { status: "closed" },
//         });
//         console.log(`Carrito ${cartId} cerrado correctamente.`);
//       } else {
//         console.warn("No se recibió cartId en metadata para cerrar carrito.");
//       }

//       for (const item of items) {
//         const productId = item.id;
//         const quantity = parseInt(item.quantity, 10);

//         const product = await prisma.product.findUnique({
//           where: { id: productId },
//         });

//         if (!product) {
//           console.error(`Producto ${productId} no encontrado para descontar stock`);
//           continue;
//         }

//         if (product.stock < quantity) {
//           console.warn(`Stock insuficiente para producto ${productId}`);
//           continue;
//         }

//         const newStock = product.stock - quantity;

//         await prisma.product.update({
//           where: { id: productId },
//           data: { stock: newStock },
//         });

//         console.log(`Stock de producto ${productId} actualizado a ${newStock}`);

//         // Registrar venta
//         await prisma.sale.create({
//           data: {
//             paymentId: paymentData.id.toString(),
//             productId,
//             quantity,
//             amount: item.unit_price * quantity,
//             userId,
//           },
//         });

//         console.log(`Venta registrada para producto ${productId}`);
//       }
//     }
//   }

//   return new NextResponse("OK", { status: 200 });
// }


import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN!;
const MP_SECRET = process.env.MP_SECRET!;

const isDevelopment = process.env.NODE_ENV !== "production";

export async function POST(request: NextRequest) {
  let body;

  if (!isDevelopment) {
    const signature = request.headers.get("x-mercadopago-signature");
    if (!signature) return new NextResponse("Signature missing", { status: 400 });

    const bodyText = await request.text();
    const computedSignature = crypto
      .createHmac("sha256", MP_SECRET)
      .update(bodyText)
      .digest("hex");

    if (computedSignature !== signature)
      return new NextResponse("Invalid signature", { status: 403 });

    body = JSON.parse(bodyText);
  } else {
    body = await request.json();
  }

  if (body.type !== "payment") return new NextResponse("OK", { status: 200 });

  const paymentId = body.data.id;

  const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: {
      Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
    },
  });

  if (!res.ok) return new NextResponse("Payment not found", { status: 404 });

  const paymentData = await res.json();
  if (!paymentData.live_mode) return new NextResponse("Prueba recibida OK", { status: 200 });

  const { status, metadata, additional_info } = paymentData;
  if (!metadata?.userId || !additional_info?.items?.length)
    return new NextResponse("Faltan datos en metadata o items", { status: 400 });

  const userId = metadata.userId;
  const cartId = metadata.cartId;

  // Evitar reprocesar pagos aprobados
  const existingPayment = await prisma.payment.findUnique({
    where: { paymentId: paymentId.toString() },
  });

  if (existingPayment && existingPayment.status === "approved") {
    return new NextResponse("Payment already processed", { status: 200 });
  }

  // Transacción segura
  await prisma.$transaction(async (tx) => {
    // Actualizar o crear registro de pago
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
      if (cartId) {
        await tx.cart.update({
          where: { id: cartId },
          data: { status: "closed" },
        });
      }

      // Crear Order principal
      const orders = await tx.orders.create({
        data: {
          userId,
          paymentId: paymentId.toString(),
          total: paymentData.transaction_amount,
          status: "paid",
        },
      });

      for (const item of additional_info.items) {
        const productId = item.id;
        const quantity = parseInt(item.quantity, 10);

        const product = await tx.product.findUnique({
          where: { id: productId },
        });

        if (!product) continue;
        if (product.stock < quantity) continue;

        await tx.product.update({
          where: { id: productId },
          data: { stock: { decrement: quantity } },
        });

        // Registrar venta
        await tx.sale.create({
          data: {
            paymentId: paymentId.toString(),
            productId,
            quantity,
            amount: item.unit_price * quantity,
            userId,
          },
        });

        // Asociar item a la order
        await tx.orderItem.create({
          data: {
            orderId: orders.id,
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






