import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// export async function GET(request: Request, { params }: { params: { id: string } }) {
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { images: true },
  });

  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(product);
}

// export async function PUT(request: Request, { params }: { params: { id: string } }) {
export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const { name, description, price, stock, category, images } = await request.json();
  try {
    const updatedProduct = await prisma.product.update({
      where: { id: params.id },
      data: {
        name,
        description,
        price,
        stock,
        category,
        images: {
          deleteMany: {}, // borra todas las imágenes asociadas primero
          create: images.map((url: string) => ({ url })), // crea las nuevas
        },
      },
      include: { images: true }, // para devolver las imágenes nuevas también
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al actualizar producto" }, { status: 500 });
  }
}

// export async function DELETE(request: Request, { params }: { params: { id: string } }) {
export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  try {
    await prisma.product.delete({ where: { id: params.id } });
    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al eliminar producto" }, { status: 500 });
  }
}
