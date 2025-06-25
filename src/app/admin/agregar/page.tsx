'use client';
import { useState } from 'react';
import { toast } from 'sonner';


async function compressImage(file: File, quality = 0.8): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
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
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [widthCm, setWidthCm] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [depthCm, setDepthCm] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setName('');
    setDescription('');
    setPrice('');
    setStock('');
    setCategory('');
    setWeightKg('');
    setWidthCm('');
    setHeightCm('');
    setDepthCm('');
    setImages([]);
    setError(null);
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (images.length === 0) {
      setError('Por favor, subí al menos una imagen del producto.');
      return;
    }

    setError(null);

    const product = {
      name,
      description,
      price,
      stock,
      category,
      weightKg,
      widthCm,
      heightCm,
      depthCm,
      images,
    };

    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });

    if (res.ok) {
      toast.success('✅ Producto creado exitosamente', {
        description: 'Se guardaron los cambios correctamente.',
        duration: 3000,
        position: 'top-center'
      });
      resetForm();
    } else {
      setError('Error al crear producto');
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Cargar nuevo producto</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* inputs de producto (igual que vos) */}

        <input type="text" placeholder="Nombre" value={name} onChange={(e) => setName(e.target.value)} required className="border p-2 w-full" />
        <textarea placeholder="Descripción" value={description} onChange={(e) => setDescription(e.target.value)} required className="border p-2 w-full" />
        <input type="number" placeholder="Precio" value={price} onChange={(e) => setPrice(e.target.value)} required className="border p-2 w-full" />
        <input type="number" placeholder="Stock" value={stock} onChange={(e) => setStock(e.target.value)} required className="border p-2 w-full" />
        <input type="text" placeholder="Categoría" value={category} onChange={(e) => setCategory(e.target.value)} required className="border p-2 w-full" />
        <input type="number" placeholder="Peso (Kg)" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} required className="border p-2 w-full" />
        <input type="number" placeholder="Ancho (cm)" value={widthCm} onChange={(e) => setWidthCm(e.target.value)} required className="border p-2 w-full" />
        <input type="number" placeholder="Alto (cm)" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} required className="border p-2 w-full" />
        <input type="number" placeholder="Profundidad (cm)" value={depthCm} onChange={(e) => setDepthCm(e.target.value)} required className="border p-2 w-full" />

        <div>
          <input type="file" accept="image/*" multiple onChange={handleFileUpload} />
          <p className="text-sm text-gray-500 mt-1">
            Formatos JPG, PNG o WebP. Tamaño máximo por imagen: 2MB.
          </p>
          {loading && <p>Subiendo imágenes...</p>}
          {error && <p className="text-red-600 mt-2">{error}</p>}

          <div className="flex flex-wrap gap-2 mt-2">
            {images.map((url, idx) => (
              <img key={idx} src={url} alt={`Imagen ${idx}`} className="w-24 h-24 object-cover rounded" />
            ))}
          </div>
        </div>

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Guardar Producto
        </button>
      </form>
    </div>
  );
};

export default AgregarProductos;


