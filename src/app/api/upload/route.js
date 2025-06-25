import { NextResponse } from 'next/server';
import cloudinary from '@/utils/cloudinary';

export const POST = async (req) => {
  const formData = await req.formData();
  const file = formData.get('file');

   if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  // Validar tamaño del archivo antes de subir a Cloudinary (por seguridad)
  const maxFileSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxFileSize) {
    return NextResponse.json(
      { error: `El archivo supera los 10MB (${(file.size / 1024 / 1024).toFixed(2)}MB)` },
      { status: 400 }
    );
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  try {
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream({ folder: 'products' }, (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }).end(buffer);
    });

    return NextResponse.json({ url: uploadResult.secure_url });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};
