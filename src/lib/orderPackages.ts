
import { Prisma } from "@prisma/client";



export async function createOrderPackages(
  tx: Prisma.TransactionClient,
    orderId: string,
    items: { id: string; quantity: number }[]
) {
    for (const item of items) {
        const packageInfo = await tx.package.findFirst({
            where: { productId: item.id },
        });

        if (!packageInfo) {
            console.warn(`⚠️ No se encontró Package info para productId: ${item.id}`);
            continue;
        }

        await tx.orderPackage.create({
            data: {
                orderId,
                productId: item.id,
                weightKg: packageInfo.weightKg,
                widthCm: packageInfo.widthCm,
                heightCm: packageInfo.heightCm,
                depthCm: packageInfo.depthCm,
                quantity: item.quantity,
            },
        });

        console.log(`📦 Paquete creado para producto ${item.id}, cantidad ${item.quantity}`);
    }
}
