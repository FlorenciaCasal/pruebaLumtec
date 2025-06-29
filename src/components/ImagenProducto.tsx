'use client';
import Image from 'next/image';


const dominiosPermitidos = [
    'res.cloudinary.com',
    'http2.mlstatic.com',
    'nexum.com.ar'
];

export default function ImagenProducto({
    src,
    alt,
    width = 200,
    height = 200
}: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
}) {
    try {
        const url = new URL(src);
        if (dominiosPermitidos.includes(url.hostname)) {
            return <Image src={src} alt={alt} width={width} height={height} />;
        }
    } catch (err) {
        console.error('URL inválida:', src, err);
    }

    // Fallback si no está permitido o es inválida
    return <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
    />
}
