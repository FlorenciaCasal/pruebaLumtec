// /app/api/orders/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// export async function GET(request: NextRequest, { params }: { params: { id: string } } ) {
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
    const params = await context.params;

    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
        return new NextResponse("Unauthorized", { status: 401 });

    const orders = await prisma.orders.findUnique({
        where: { id: params.id },
        include: {
            items: {
                include: {
                    product: true,
                },
            },
            payment: true,
        },
    });

    if (!orders || orders.userId !== session.user.id)
        return new NextResponse("Not found", { status: 404 });

    return NextResponse.json(orders);
}
