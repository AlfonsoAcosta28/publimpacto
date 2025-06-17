"use client"
import { usePathname } from 'next/navigation';
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function RootLayoutClient({
  children,
  geistSans,
  geistMono,
}: {
  children: React.ReactNode;
  geistSans: string;
  geistMono: string;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  return (
    <body className={`${geistSans} ${geistMono} antialiased`}>
      {isLoginPage ? children : <DashboardLayout>{children}</DashboardLayout>}
    </body>
  );
}