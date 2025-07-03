import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // ajusta path a donde tengas authOptions
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const addresses = await prisma.address.findMany({
    where: { userId: session.user.id },
    orderBy: { isDefault: "desc" },
  });

  return NextResponse.json(addresses);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const { street, city, state, postalCode, country, phone, isDefault } = body;

  if (!street || !city || !state || !postalCode || !country) {
    return NextResponse.json({ error: "Faltan datos obligatorios" }, { status: 400 });
  }

  if (isDefault) {
    // Desmarcar otras predeterminadas
    await prisma.address.updateMany({
      where: { userId: session.user.id, isDefault: true },
      data: { isDefault: false },
    });
  }

  const newAddress = await prisma.address.create({
    data: {
      userId: session.user.id,
      street,
      city,
      state,
      postalCode,
      country,
      phone,
      isDefault: Boolean(isDefault),
    },
  });

  return NextResponse.json(newAddress, { status: 201 });
}
