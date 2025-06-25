import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const adminUser = await prisma.user.upsert({
      where: { email: 'florenciacasal88.fc@gmail.com' },
      update: {},
      create: {
        name: 'Admin',
        email: 'florenciacasal88.fc@gmail.com',
        password: hashedPassword,
        role: 'admin',
      },
    });
    console.log('Admin user upserted:', adminUser);

    const products = [
      {
        name: 'Termotanque Solar 200L',
        description: 'Ideal para agua caliente sanitaria',
        price: 1,
        stock: 5,
        category: 'Termotanques',
        weightKg: 80,
        widthCm: 60,
        heightCm: 200,
        depthCm: 60,
        images: [
          'https://nexum.com.ar/wp-content/uploads/2024/06/N100S-Perfil-Izquierdo-1.webp',
          'https://nexum.com.ar/wp-content/uploads/2024/06/N100S-Frente-1.webp',
        ],
      },
      {
        name: 'Panel Solar 400W',
        description: 'Panel monocristalino alta eficiencia',
        price: 2,
        stock: 10,
        category: 'Paneles',
        weightKg: 25,
        widthCm: 100,
        heightCm: 200,
        depthCm: 5,
        images: [
          'https://http2.mlstatic.com/D_NQ_NP_2X_794803-MLA73152459089_112023-F.webp',
          'https://http2.mlstatic.com/D_NQ_NP_2X_755701-MLA73746431726_122023-F.webp',
        ],
      },
    ];

    for (const product of products) {
      const upsertedProduct = await prisma.product.upsert({
        where: { name: product.name },
        update: {
          description: product.description,
          price: product.price,
          stock: product.stock,
          category: product.category,
          weightKg: product.weightKg,
          widthCm: product.widthCm,
          heightCm: product.heightCm,
          depthCm: product.depthCm,
        },
        create: {
          name: product.name,
          description: product.description,
          price: product.price,
          stock: product.stock,
          category: product.category,
          weightKg: product.weightKg,
          widthCm: product.widthCm,
          heightCm: product.heightCm,
          depthCm: product.depthCm,
        },
      });
      console.log('Product upserted:', upsertedProduct);
      // Cargar imágenes asociadas
      for (const images of product.images) {
        const image = await prisma.productImage.create({
          data: {
            url: images,
            productId: upsertedProduct.id,
          },
        });
        console.log('Image created:', image);
      }
    }

    console.log('Base de datos poblada 🚀');
  } catch (error) {
    console.error('Error en seed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

