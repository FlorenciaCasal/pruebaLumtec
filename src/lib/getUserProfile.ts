import prisma from "@/lib/prisma";

export const getUserProfile = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            image: true,
            carts: {
                where: { status: "open" },
                select: {
                    id: true,
                    items: {
                        select: {
                            product: {
                                select: {
                                    name: true,
                                    images: { select: { url: true }, take: 1 }
                                },
                            },
                            quantity: true
                        }
                    }
                }
            },
            sales: {
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    quantity: true,
                    amount: true,
                    createdAt: true,
                    product: { select: { name: true } }
                }
            },
            payments: {
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    amount: true,
                    status: true,
                    createdAt: true
                }
            },
            orders: {
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    total: true,
                    status: true,
                    createdAt: true,
                    items: {
                        select: {
                            id: true,
                            quantity: true,
                            unitPrice: true,
                            product: {
                                select: {
                                    name: true,
                                    images: { select: { url: true }, take: 1 },
                                },
                            },
                        },
                    },
                },
            },
        },
    });
    return user;
};
