import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// export async function GET(request: Request, { params }: { params: { id: string } }) {
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { images: true, packages: true },  // ahora trae paquetes también
  });

  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(product);
}

// export async function PUT(request: Request, { params }: { params: { id: string } }) {
export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const { name, brand, description, price, stock, category, type, images, packages } = await request.json();
  try {
    const updatedProduct = await prisma.product.update({
      where: { id: params.id },
      data: {
        name,
        brand,
        description,
        price,
        stock,
        category,
        type,
        images: {
          deleteMany: {}, // borra todas las imágenes asociadas primero
          create: images.map((url: string) => ({ url })), // crea las nuevas
        },
      },
      include: { images: true }, // para devolver las imágenes nuevas también
    });


    // Borrar paquetes anteriores
    await prisma.package.deleteMany({
      where: { productId: params.id },
    });

    // Crear nuevos paquetes si hay
    if (packages && packages.length > 0) {
      await prisma.package.createMany({
        data: packages.map((pkg: any) => ({
          productId: params.id,
          weightKg: parseFloat(pkg.weightKg),
          widthCm: parseFloat(pkg.widthCm),
          heightCm: parseFloat(pkg.heightCm),
          depthCm: parseFloat(pkg.depthCm),
          quantity: parseInt(pkg.quantity),
        })),
      });
    }

    // Devolver producto actualizado con imágenes y paquetes
    const productWithDetails = await prisma.product.findUnique({
      where: { id: params.id },
      include: { images: true, packages: true },
    });


    // return NextResponse.json(updatedProduct);
    return NextResponse.json(productWithDetails);
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
