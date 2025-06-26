import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// export async function GET(_request: NextRequest) {
export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
        return new NextResponse("Unauthorized", { status: 401 });

    const orders = await prisma.orders.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        include: {
            items: {
                include: {
                    product: true,
                },
            },
            payment: true,
        },
    });

    return NextResponse.json(orders);
}
