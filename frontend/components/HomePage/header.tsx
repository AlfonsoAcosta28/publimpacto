import Link from "next/link"
import CartSidebar from "@/components/cart-sidebar"
import UserMenu from "@/components/user-menu"

export default function Header() {
  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href='/'>
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">P</span>
              </div>
              <span className="text-2xl font-bold text-gray-800">Publimpacto</span>
            </div>
          </Link>

          <nav className="hidden md:flex space-x-8">
            <Link href="/" className="text-gray-700 hover:text-blue-600 font-medium">
              Inicio
            </Link>
            <Link href="/catalog" className="text-gray-700 hover:text-blue-600 font-medium">
              Catálogo
            </Link>
            <Link href="/personalization" className="text-gray-700 hover:text-blue-600 font-medium">
              Personalización
            </Link>
            {/* <Link href="/checkout" className="text-gray-700 hover:text-blue-600 font-medium">
              Carrito
            </Link> */}
          </nav>

          <div className="flex items-center space-x-4">
            <CartSidebar />
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  )
} 