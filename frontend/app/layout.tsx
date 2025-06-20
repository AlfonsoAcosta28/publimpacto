"use client";

import { Toaster } from 'sonner'
import { Inter } from "next/font/google";
import "./globals.css";
import { usePathname } from "next/navigation";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/cartContext";
import Header from '@/components/HomePage/header';
import Footer from '@/components/HomePage/footer';
import { ShippingProvider } from "@/contexts/ShippingContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

// Nota: metadata no se puede usar en Client Components
// Este objeto se moverá a una configuración separada

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Usamos usePathname para obtener la ruta actual
  const pathname = usePathname();
  
  // Verificamos si estamos en la ruta /login
  const isLoginPage = pathname === "/login";

  return (
    <html lang="es">
      <body>
      <AuthProvider>
        <CartProvider>
          <ShippingProvider>
            <div className="flex min-h-screen flex-col">
              {!isLoginPage && <Header />}
              
              <main className="flex-grow">
                {children}
              </main>
              
              {!isLoginPage && <Footer />}
            </div>
            <Toaster />
          </ShippingProvider>
        </CartProvider>
      </AuthProvider>
      </body>
    </html>
  );
}