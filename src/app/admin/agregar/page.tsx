'use client';
import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { toast } from 'sonner';
import Image from "next/image";


type PackageInput = {
  weightKg: string;
  widthCm: string;
  heightCm: string;
  depthCm: string;
  quantity: string;
};

type ProductFormData = {
  name: string;
  brand: string;
  description: string;
  price: string;
  stock: string;
  category: string;
  type: string;
  packages: PackageInput[];
};

async function compressImage(file: File, quality = 0.8): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error("No se pudo obtener contexto del canvas"));

      ctx.drawImage(img, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Error al convertir imagen"));
        },
        'image/jpeg', // formato comprimido
        quality      // calidad entre 0 y 1
      );
    };

    img.onerror = () => reject(new Error("Error cargando la imagen"));

    img.src = URL.createObjectURL(file);
  });
}

const AgregarProductos = () => {
  const { register, handleSubmit, reset, control } = useForm<ProductFormData>({
    defaultValues: {
      name: '',
      brand: '',
      description: '',
      price: '',
      stock: '',
      category: '',
      type: 'SINGLE',
      packages: [{ weightKg: '', widthCm: '', heightCm: '', depthCm: '', quantity: '' }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'packages'
  });

  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const maxFileSize = 10 * 1024 * 1024; // 10MB antes de compresión

    const uploadedUrls: string[] = [];
    setLoading(true);

    for (const file of files) {
      if (file.size > maxFileSize) {
        toast.error(`❌ El archivo ${file.name} supera los 10MB`, {
          duration: 3000,
          position: 'top-center'
        });
        setLoading(false);
        return;
      }

      // Comprimir la imagen antes de subirla
      try {
        const compressedBlob = await compressImage(file, 0.8);
        if (compressedBlob.size > 2 * 1024 * 1024) {
          toast.error(`❌ La imagen comprimida ${file.name} sigue siendo mayor a 2MB`);
          continue;
        }
        const compressedFile = new File([compressedBlob], file.name, { type: 'image/jpeg' });

        const formData = new FormData();
        formData.append('file', compressedFile);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (data.url) {
          uploadedUrls.push(data.url);
        }
      } catch (error) {
        toast.error(`❌ Error comprimiendo la imagen ${file.name}: ${error}`, {
          duration: 3000,
          position: 'top-center'
        });
        setLoading(false);
        return;
      }
    }

    setImages((prev) => [...prev, ...uploadedUrls]);
    setLoading(false);
  };

  const onSubmit = async (data: ProductFormData) => {
    if (images.length === 0) {
      setError('Por favor, subí al menos una imagen.');
      return;
    }
    setError(null);

    const productData = { ...data, images };

    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    });

    if (res.ok) {
      toast.success('✅ Producto creado exitosamente', {
        description: 'Se guardaron los cambios correctamente.',
        duration: 3000,
        position: 'top-center'
      });
      reset();
      setImages([]);
    } else {
      setError('Error al crear producto');
    }
  };


  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Cargar nuevo producto</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* inputs de producto (igual que vos) */}

        <input type="text" placeholder="Nombre" {...register('name', { required: true })} className="border p-2 w-full" />
        <input type="text" placeholder="Marca" {...register('brand', { required: true })} className="border p-2 w-full" />
        <textarea placeholder="Descripción" {...register('description', { required: true })} className="border p-2 w-full" />
        <input type="number" placeholder="Precio" {...register('price', { required: true })} className="border p-2 w-full" />
        <input type="number" placeholder="Stock" {...register('stock', { required: true })} className="border p-2 w-full" />
        <input type="text" placeholder="Categoría" {...register('category', { required: true })} className="border p-2 w-full" />

        <select {...register('type')} className="border p-2 w-full">
          <option value="SINGLE">SINGLE</option>
          <option value="KIT">KIT</option>
        </select>

        <div className="border p-3 rounded">
          <p className="font-semibold mb-2">Bultos:</p>
          {fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-5 gap-2 mb-2 items-center">
              <input type="number" placeholder="Peso (Kg)" {...register(`packages.${index}.weightKg`, { required: true })} className="border p-1" />
              <input type="number" placeholder="Ancho (cm)" {...register(`packages.${index}.widthCm`, { required: true })} className="border p-1" />
              <input type="number" placeholder="Alto (cm)" {...register(`packages.${index}.heightCm`, { required: true })} className="border p-1" />
              <input type="number" placeholder="Prof. (cm)" {...register(`packages.${index}.depthCm`, { required: true })} className="border p-1" />
              <input type="number" placeholder="Cantidad de bultos" {...register(`packages.${index}.quantity`, { required: true })} className="border p-1" />
              {fields.length > 1 && (
                <button type="button" onClick={() => remove(index)} className="text-red-600 text-sm">Eliminar</button>
              )}
            </div>
          ))}

          <button type="button" onClick={() => append({ weightKg: '', widthCm: '', heightCm: '', depthCm: '', quantity: '' })} className="mt-2 bg-gray-200 px-2 py-1 rounded text-sm">
            + Agregar Bulto
          </button>
        </div>

        <div>
          <input type="file" accept="image/*" multiple onChange={handleFileUpload} />
          {loading && <p>Subiendo imágenes...</p>}
          {error && <p className="text-red-600">{error}</p>}
          <div className="flex flex-wrap gap-2 mt-2">
            {images.map((url, idx) => (
              <Image key={idx} src={url} alt={`Imagen ${idx}`} width={96} height={96} className="object-cover rounded" />
            ))}
          </div>
        </div>

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Guardar Producto</button>
      </form>
    </div>
  );
};

export default AgregarProductos;


