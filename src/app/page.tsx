import { ProductWithImages } from "@/types/productImage.types";
import HomeClient from "@/components/HomeClient";
import PendingProductHandler from "@/components/pendingHome";

async function getProducts(): Promise<ProductWithImages[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/products`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

export default async function Home() {
  const products = await getProducts();

  return (
    <main className="p-4 max-w-4xl md:max-w-full mx-auto">
      <PendingProductHandler />
      <HomeClient products={products} />
    </main>
  );
}

