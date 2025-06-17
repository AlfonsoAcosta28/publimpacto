import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">P</span>
              </div>
              <span className="text-xl font-bold">Publimpacto</span>
            </div>
            <p className="text-gray-400">Tu tienda de confianza para productos personalizados de alta calidad.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Productos</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/catalog" className="hover:text-white">
                  Camisetas
                </Link>
              </li>
              <li>
                <Link href="/catalog" className="hover:text-white">
                  Termos
                </Link>
              </li>
              <li>
                <Link href="/catalog" className="hover:text-white">
                  Mochilas
                </Link>
              </li>
              <li>
                <Link href="/catalog" className="hover:text-white">
                  Gorras
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Servicios</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/personalization" className="hover:text-white">
                  Personalización 3D
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white">
                  Diseño Gráfico
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white">
                  Envío Express
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Contacto</h4>
            <ul className="space-y-2 text-gray-400">
              <li>Email: info@publimpacto.com</li>
              <li>Teléfono: +1 (555) 123-4567</li>
              <li>Dirección: 123 Calle Principal</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 Publimpacto. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
} 