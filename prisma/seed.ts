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


    console.log('Base de datos poblada 🚀');
  } catch (error) {
    console.error('Error en seed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

