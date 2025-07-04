import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // asegurate de tener prisma client configurado ahí

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { name, email, role, password } = data;

    if (!email) {
      return NextResponse.json({ error: 'Email es requerido' }, { status: 400 });
    }

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        role: role || 'user',
        password, // Si querés podés encriptarlo antes con bcrypt acá
      },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error creando usuario' }, { status: 500 });
  }
}

// DELETE → eliminar usuario por email
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email es requerido' }, { status: 400 });
    }

    const result = await prisma.user.deleteMany({
      where: { email },
    });

    return NextResponse.json({ message: 'Usuario(s) eliminado(s)', result });

  } catch (error: any) {
    console.error('Error eliminando usuario:', error.message, error);
    return NextResponse.json({ error: error.message || 'Error eliminando usuario' }, { status: 500 });
  }
}