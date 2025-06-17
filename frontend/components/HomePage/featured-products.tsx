import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const featuredProducts = [
  { id: 1, name: "Camiseta Premium", price: 25.99, image: "/placeholder.svg?height=300&width=300" },
  { id: 2, name: "Termo Acero Inoxidable", price: 18.99, image: "/placeholder.svg?height=300&width=300" },
  { id: 3, name: "Mochila Ejecutiva", price: 45.99, image: "/placeholder.svg?height=300&width=300" },
  { id: 4, name: "Gorra Deportiva", price: 15.99, image: "/placeholder.svg?height=300&width=300" },
]

export default function FeaturedProducts() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Productos Destacados</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <Card key={product.id} className="group hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-4">
                <div className="aspect-square mb-4 overflow-hidden rounded-lg">
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    width={300}
                    height={300}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                <p className="text-2xl font-bold text-blue-600 mb-3">${product.price}</p>
                <Button className="w-full">Agregar al Carrito</Button>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link href="/catalog">
            <Button variant="outline" size="lg">
              Ver Todos los Productos
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
} 