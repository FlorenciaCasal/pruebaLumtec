import Navbar from "@/components/Navbar";
import "./globals.css";
import { Providers } from "@/lib/Providers";
import Footer from "@/components/Footer";
import { Toaster } from "sonner";
import CartSyncHandler from "@/components/CartSyncHandler";


export const metadata = {
  title: "Lumtec E-commerce",
  description: "Productos de energías renovables",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <script
          src="https://sdk.mercadopago.com/js/v2"
          data-public-key={process.env.NEXT_PUBLIC_MP_PUBLIC_KEY}>
        </script>
      </head>
      <body className="min-h-screen flex flex-col bg-gray-100">
        <Providers>
          <Navbar />
          <CartSyncHandler />
          {/* Main content que se expande */}
          <main className="flex-grow">{children}</main>
          <Toaster richColors position="top-center" />
          <Footer />
        </Providers>
      </body>
    </html>
  );
}

