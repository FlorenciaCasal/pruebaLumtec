import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN!;
const MP_SECRET = process.env.MP_SECRET!;

const isDevelopment = process.env.NODE_ENV !== "production";

export async function POST(request: NextRequest) {
  console.log("Notificación recibida:", await request.text());
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

  // if (body.type !== "payment") return new NextResponse("OK", { status: 200 });
  if (body.type !== "payment" && body.topic !== "payment") {
    return new NextResponse("OK", { status: 200 });
  }

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

  // if (!metadata?.userId || !additional_info?.items?.length)
  //   return new NextResponse("Faltan datos en metadata o items", { status: 400 });

  // const userId = metadata.userId;
  const userId = metadata?.userId;
  const items = additional_info?.items;
  const cartId = metadata.cartId;

  if (!userId || !items || items.length === 0) {
    return new NextResponse("Faltan datos en metadata o items", { status: 400 });
  }

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

      // for (const item of additional_info.items) {
      for (const item of items) {
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






