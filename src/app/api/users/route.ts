import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // asegurate de tener prisma client configurado ahí
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { name, email, role, password } = data;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email y password son requeridos' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        role: role || 'user',
        password: hashedPassword, // Si querés podés encriptarlo antes con bcrypt acá
      },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error creando usuario' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
      orderBy: {
        email: 'desc',
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error listando usuarios:', error);
    return NextResponse.json({ error: 'Error listando usuarios' }, { status: 500 });
  }
}

// // DELETE → eliminar usuario por email
// export async function DELETE(req: NextRequest) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const email = searchParams.get('email');

//     if (!email) {
//       return NextResponse.json({ error: 'Email es requerido' }, { status: 400 });
//     }

//     const result = await prisma.user.delete({
//       where: { email },
//     });

//     return NextResponse.json({ message: 'Usuario(s) eliminado(s)', result });

//   } catch (error: any) {
//     console.error('Error eliminando usuario:', error.message, error);
//     return NextResponse.json({ error: error.message || 'Error eliminando usuario' }, { status: 500 });
//   }
// }