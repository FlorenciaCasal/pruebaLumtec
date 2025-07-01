import { ProductType } from "@prisma/client";


export type ProductImage = {
  id: string;
  url: string;
  productId: string;
};

export type Package = {
  id: string;
  productId: string;
  weightKg: number;
  widthCm: number;
  heightCm: number;
  depthCm: number;
  quantity: number;
};

export type ProductWithImages = {
  id: string;
  name: string;
  brand: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  type: ProductType;  // 👈 ahora tipado como enum
  packages: Package[]; // 👈 array de Package
  createdAt: string;
  updatedAt: string;
  images: ProductImage[];
};