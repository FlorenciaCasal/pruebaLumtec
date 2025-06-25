export type ProductImage = {
  id: string;
  url: string;
  productId: string;
};

export type ProductWithImages = {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  weightKg: number;
  widthCm: number;
  heightCm: number;
  depthCm: number;
  createdAt: string;
  updatedAt: string;
  images: ProductImage[];
};