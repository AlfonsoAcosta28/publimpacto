"use client"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ChartArea,
  BarChart,
  ChevronLeft,
  Bell,
  ShoppingBag,
  Menu,
  Package,
  Users,
  Layout,
  FileText,
  Tag,
  Info,
  User,
  Truck,
  PackageOpen
} from "lucide-react"

import { GrServices } from "react-icons/gr";
import { MdCategory } from "react-icons/md";
import { FaTshirt } from "react-icons/fa";


import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/hooks/useAuth"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, logout } = useAuth();
  const [isMobile, setIsMobile] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userName, setUserName] = useState("")
  const pathname = usePathname()
  
  // Define las rutas de navegación ajustadas a tu estructura de archivos
  const navigationItems = [
    { path: '/dashboard', label: 'Dashboard', icon: ChartArea },
    { path: '/products', label: 'Productos', icon: Package },
    { path: '/services', label: 'Servicios', icon: GrServices },
    { path: '/custom_tshirt', label: 'Camisas', icon: FaTshirt },
    { path: '/service-orders', label: 'Órdenes de Servicios', icon: ShoppingBag },
    { path: '/categories', label: 'Categorías', icon: MdCategory },
    { path: '/inventory', label:'Inventario', icon: PackageOpen },
    { path: '/orders', label: 'Pedidos', icon: ShoppingBag },
    { path: '/users', label: 'Usuarios', icon: Users },
    { path: '/shipping-price', label: 'Precio de Envío', icon: Truck },
    { path: '/banners', label: 'Banners', icon: Layout },
    { path: '/about-us', label: 'Acerca de Nosotros', icon: Info },
    { path: '/footer', label: 'Footer', icon: FileText },
  ]

  // Effect to handle user data persistence
  useEffect(() => {
    // If user data is available from the hook, update the userName state
    if (user && user.nombre) {
      setUserName(user.nombre);
    } else {
      // If no user data from hook, try to get it from localStorage
      const storedUser = localStorage.getItem('userData');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUserName(parsedUser.nombre || "Usuario");
        } catch (error) {
          console.error("Error parsing stored user data:", error);
          setUserName("Usuario");
        }
      }
    }
  }, [user]);

  const handleLogout = () => {
    try {
      // Clear local storage data
      localStorage.removeItem('userData');
      localStorage.removeItem('token');
      // Call the logout function from the hook
      logout();
      // Redirect to login page
      window.location.href = '/login';
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile Sidebar Toggle */}
      {isMobile && (
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-4 right-4 z-50 rounded-full h-12 w-12 shadow-lg bg-white"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </Button>
      )}

      {/* Sidebar */}
      <div
        className={`${isMobile ? "fixed inset-0 z-50 transform transition-transform duration-300 ease-in-out" : "w-64"} ${isMobile && !sidebarOpen ? "-translate-x-full" : "translate-x-0"} bg-white border-r border-gray-200 flex flex-col`}
      >
        {isMobile && (
          <div className="flex justify-end p-4">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
              <ChevronLeft className="h-6 w-6" />
            </Button>
          </div>
        )}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-semibold text-purple-600">Administracion PUBLIMPACTO</h1>
        </div>
        <div className="flex-1 py-4 overflow-y-auto">
          <nav className="space-y-1 px-2">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.path ||
                (item.path !== '/dashboard' && pathname.startsWith(item.path));

              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-r-md ${isActive
                    ? "text-blue-600 bg-blue-50 border-l-4 border-blue-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 flex items-center justify-between px-4 py-4 md:px-6">
          <div className="flex items-center">
            {isMobile && (
              <Button variant="ghost" size="icon" className="mr-2" onClick={() => setSidebarOpen(true)}>
                <Menu className="h-5 w-5" />
              </Button>
            )}
            <h1 className="text-xl font-semibold text-gray-800">
              {navigationItems.find(item => pathname === item.path ||
                (item.path !== '/dashboard' && pathname.startsWith(item.path)))?.label || 'Dashboard'}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            {/* <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
            </Button> */}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span className="text-sm font-medium">{userName || "Usuario"}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="text-red-600" onClick={handleLogout}>
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  )
}