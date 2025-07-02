import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type PackageInput = {
  weightKg: number | string;
  widthCm: number | string;
  heightCm: number | string;
  depthCm: number | string;
  quantity: number | string;
};

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
    await prisma.product.update({
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
        data: (packages as PackageInput[]).map((pkg) => ({
          productId: params.id,
          weightKg: parseFloat(pkg.weightKg.toString()),
          widthCm: parseFloat(pkg.widthCm.toString()),
          heightCm: parseFloat(pkg.heightCm.toString()),
          depthCm: parseFloat(pkg.depthCm.toString()),
          quantity: parseInt(pkg.quantity.toString()),
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
