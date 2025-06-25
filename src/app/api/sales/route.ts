import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/sales
export async function GET(request: NextRequest) {
    try {
        // Traemos todas las ventas con la info del producto asociado
        const sales = await prisma.sale.findMany({
            orderBy: {
                createdAt: "desc",
            },
            include: {
                product: true, // Trae los datos del producto
            },
        });

        return NextResponse.json(sales);
    } catch (error) {
        console.error("Error al obtener ventas:", error);
        return new NextResponse("Error al obtener ventas", { status: 500 });
    }
}
