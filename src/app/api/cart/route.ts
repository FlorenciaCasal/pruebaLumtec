import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOrCreateActiveCart } from "@/lib/cart";
import { validateCartStock } from "@/lib/cart";


export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { productId, quantity } = await request.json();

    if (!productId || !quantity || quantity <= 0) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    // ✅ Usamos la función nueva
    const cart = await getOrCreateActiveCart(userId);

    await prisma.cartItem.upsert({
      where: { cartId_productId: { cartId: cart.id, productId } },
      update: { quantity: { increment: quantity } },
      create: { cartId: cart.id, productId, quantity },
    });

    // actualizamos la última actividad
    await prisma.cart.update({
      where: { id: cart.id },
      data: {
        updatedAt: new Date(),
      },
    });

    // 🚨 Validamos stock
    const removedProducts = await validateCartStock(cart.id);

    const updatedCart = await prisma.cart.findFirst({
      where: { id: cart.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true,  // aquí traemos las imágenes del producto
                packages: true,
              }
            }
          }
        }
      },
    });

    return NextResponse.json({
      cart: {
        id: updatedCart!.id,
        items: updatedCart!.items.map(item => ({
          id: item.id,
          quantity: item.quantity,
          product: {
            id: item.product.id, // asegurado
            name: item.product.name,
            brand: item.product.brand,
            price: item.product.price,
            images: item.product.images,
            type: item.product.type,
            packages: item.product.packages
          }
        }))
      }, removedProducts
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}


export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const cart = await prisma.cart.findFirst({
      where: {
        userId: session.user.id,
        status: "open",
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true,
                packages: true, // traer las imágenes del producto
              }
            }
          }
        }
      }
    });
    if (!cart) {
      return NextResponse.json({ items: [], removedProducts: [] });
    }
    // 🚨 Validamos stock
    const removedProducts = await validateCartStock(cart.id);

    const updatedCart = await prisma.cart.findFirst({
      where: { id: cart.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true,
                packages: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      id: updatedCart!.id,
      items: updatedCart!.items.map(item => ({
        id: item.id,
        quantity: item.quantity,
        product: {
          id: item.product.id, // asegurado
          name: item.product.name,
          brand: item.product.brand,
          price: item.product.price,
          images: item.product.images,
          type: item.product.type,
          packages: item.product.packages
        }
      })), removedProducts
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Buscar el carrito del usuario
    const cart = await prisma.cart.findFirst({
      where: {
        userId,
        status: "open",
      },
    });

    if (!cart) {
      return NextResponse.json({ error: "Carrito no encontrado" }, { status: 404 });
    }

    // Eliminar todos los cartItems asociados a ese carrito
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    await prisma.cart.update({
      where: { id: cart.id },
      data: {
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ message: "Carrito vaciado" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

