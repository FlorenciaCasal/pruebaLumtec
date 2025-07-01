import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const products = await prisma.product.findMany({
    include: {
      images: true,
      packages: true, // importante: traer los paquetes también si los vas a listar
    },
  });
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  const { name, brand, description, price, stock, category, images, type, packages } = await request.json();
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!name || !description || !price || !stock || !category || !type) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Primero crear el producto
  const product = await prisma.product.create({
    data: {
      name,
      brand,
      description,
      price: parseFloat(price),
      stock: parseInt(stock),
      category,
      type,
    },
  });

  // Crear paquetes si hay
  if (packages && packages.length > 0) {
    await prisma.package.createMany({
      data: packages.map((pkg: any) => ({
        productId: product.id,
        weightKg: parseFloat(pkg.weightKg),
        widthCm: parseFloat(pkg.widthCm),
        heightCm: parseFloat(pkg.heightCm),
        depthCm: parseFloat(pkg.depthCm),
        quantity: parseInt(pkg.quantity),
      })),
    });
  }

  // Si hay imágenes, las asociamos
  if (images && images.length > 0) {
    await prisma.productImage.createMany({
      data: images.map((url: string) => ({
        url,
        productId: product.id,
      })),
    });
  }

  // Devolvemos el producto con las imágenes
  const productWithImages = await prisma.product.findUnique({
    where: { id: product.id },
    include: { images: true, packages: true },
  });

  return NextResponse.json(productWithImages);
}
