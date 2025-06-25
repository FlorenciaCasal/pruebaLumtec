import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const products = await prisma.product.findMany({
    include: {
      images: true,
    },
  });
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  const { name, description, price, stock, category, images, weightKg, widthCm, heightCm, depthCm } = await request.json();
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!name || !description || !price || !stock || !category) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Primero crear el producto
  const product = await prisma.product.create({
    data: {
      name,
      description,
      price: parseFloat(price),
      stock: parseInt(stock),
      category,
      weightKg: parseFloat(weightKg),
      widthCm: parseFloat(widthCm),
      heightCm: parseFloat(heightCm),
      depthCm: parseFloat(depthCm),
    },
  });

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
    include: { images: true },
  });

  return NextResponse.json(productWithImages);
}
