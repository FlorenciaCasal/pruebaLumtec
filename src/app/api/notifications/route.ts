import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { PaymentStatus, OrderStatus } from '@prisma/client';
import { createOrderPackages } from "@/lib/orderPackages";

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
    console.log("🔔 Notificación recibida");
    console.log("📝 Body:", bodyText);
    const body = JSON.parse(bodyText);
    console.log("📦 Body parsed:", body);

    const topic = body.topic || body.type;

    // if (["payment", "merchant_order"].includes(topic)) {
    //   if (process.env.NODE_ENV === "production" && body.live_mode === true) {
    //     const signature = request.headers.get("x-signature");
    //     if (!signature) {
    //       console.error("❌ Firma faltante");
    //       return NextResponse.json({ error: "Signature missing" }, { status: 400 });
    //     }

    //     const ts = signature.match(/t=([^,]*)/)?.[1];
    //     const v1Hash = signature.match(/v1=([^,]*)/)?.[1];

    //     if (!ts || !v1Hash) {
    //       console.error("❌ Formato de firma inválido");
    //       return NextResponse.json({ error: "Invalid signature format" }, { status: 400 });
    //     }

    //     const generatedHash = crypto
    //       .createHmac('sha256', MP_SECRET)
    //       .update(`t=${ts}.${bodyText}`)
    //       .digest('hex');

    //     if (v1Hash !== generatedHash) {
    //       console.error("❌ Firma inválida", { recibida: v1Hash, calculada: generatedHash });
    //       return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    //     }
    //   }
    // } else {
    //   console.log("📤 Tipo de notificación no manejada:", topic);
    //   return NextResponse.json({ message: "Tipo de notificación no manejada" }, { status: 200 });
    // }
    if (["payment", "merchant_order"].includes(topic)) {
      // Solo validamos firma si está en producción Y la notificación es en live_mode
      if (process.env.NODE_ENV === "production" && body.live_mode === true) {
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
          .createHmac("sha256", MP_SECRET)
          .update(`t=${ts}.${bodyText}`)
          .digest("hex");

        if (v1Hash !== generatedHash) {
          console.error("❌ Firma inválida", { recibida: v1Hash, calculada: generatedHash });
          return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
        }
      } else {
        console.log("📝 Notificación en desarrollo o modo test, sin validar firma");
      }
    } else {
      console.log("📤 Tipo de notificación no manejada:", topic);
      return NextResponse.json({ message: "Tipo de notificación no manejada" }, { status: 200 });
    }


    let paymentId: string | undefined;

    if (topic === "merchant_order") {
      const orderResponse = await fetch(body.resource, {
        headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` },
      });
      const orderData = await orderResponse.json();
      if (orderData.payments.length > 0) {
        paymentId = orderData.payments?.[0]?.id;
      }
    } else if (topic === "payment") {
      paymentId = body.data.id || body.resource;
    }

    console.log("📨 Webhook completo:", JSON.stringify(body, null, 2));

    if (!paymentId) {
      console.warn("❌ No se pudo obtener paymentId");
      return NextResponse.json({ message: "Notificación sin paymentId" }, { status: 200 });
    }

    console.log("🔍 Procesando paymentId:", paymentId);

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

    if (!paymentData.live_mode) {
      console.log("🛑 Pago de prueba, ignorando");
      return NextResponse.json({ message: "Test payment ignored" }, { status: 200 });
    }

    const { status, metadata, additional_info } = paymentData;
    const userId = metadata?.userId || metadata?.user_id;
    const items = additional_info?.items || [];
    const cartId = metadata?.cartId;

    if (!userId) {
      console.warn("⚠️ userId no definido en metadata, se omite procesamiento");
      return NextResponse.json({ message: "Missing userId, ignoring" }, { status: 200 });
    }

    if (items.length === 0) {
      console.warn("⚠️ No hay items en el pago, se omite procesamiento");
      return NextResponse.json({ message: "Missing items, ignoring" }, { status: 200 });
    }

    console.log("📊 Metadata:", { userId, cartId, items });

    const existingPayment = await prisma.payment.findUnique({
      where: { paymentId: paymentId.toString() }
    });

    if (existingPayment?.status === "approved") {
      console.log("🔄 Pago ya aprobado");
      return NextResponse.json({ message: "Payment already processed" }, { status: 200 });
    }

    await prisma.$transaction(async (tx) => {
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

      if (mapPaymentStatus(status) !== "approved") {
        console.log(`⏳ Pago no aprobado (${status}), sin procesar stock ni orden`);
        return;
      }

      if (cartId) {
        await tx.cart.update({
          where: { id: cartId },
          data: { status: "closed" }
        });
      }

      const order = await tx.orders.create({
        data: {
          userId,
          paymentId: paymentId.toString(),
          total: paymentData.transaction_amount,
          status: "paid" as OrderStatus
        }
      });
      console.log("📦 Orden creada:", order.id);

      // Crear paquetes
      await createOrderPackages(tx, order.id, items);

      console.log("📦 Orden creada y paquetes generados:", order.id);

      for (const item of items) {
        const productId = item.id;
        const quantity = Math.max(1, typeof item.quantity === "string"
          ? parseInt(item.quantity, 10)
          : item.quantity || 1);

        console.log(`🛒 Procesando item: ${productId}, cantidad: ${quantity}`);

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
            unitPrice: parseFloat(item.unit_price),
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
