"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ShoppingBag, Search, Filter, ArrowLeft } from "lucide-react"
import UserMenu from "@/components/user-menu"
import CartSidebar from "@/components/cart-sidebar"

export default function CatalogPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [cart, setCart] = useState<any[]>([])

  const products = [
    {
      id: 1,
      name: "Camiseta Premium Algodón",
      price: 25.99,
      category: "camisetas",
      image: "/placeholder.svg?height=300&width=300",
      description: "Camiseta 100% algodón, perfecta para personalizar",
    },
    {
      id: 2,
      name: "Termo Acero Inoxidable 500ml",
      price: 18.99,
      category: "termos",
      image: "/placeholder.svg?height=300&width=300",
      description: "Mantiene la temperatura por 12 horas",
    },
    {
      id: 3,
      name: "Mochila Ejecutiva Negra",
      price: 45.99,
      category: "mochilas",
      image: "/placeholder.svg?height=300&width=300",
      description: "Mochila resistente con compartimento para laptop",
    },
    {
      id: 4,
      name: "Gorra Deportiva Ajustable",
      price: 15.99,
      category: "gorras",
      image: "/placeholder.svg?height=300&width=300",
      description: "Gorra con cierre ajustable, ideal para deportes",
    },
    {
      id: 5,
      name: "Camiseta Polo Empresarial",
      price: 32.99,
      category: "camisetas",
      image: "/placeholder.svg?height=300&width=300",
      description: "Polo elegante para uso corporativo",
    },
    {
      id: 6,
      name: "Termo Deportivo 750ml",
      price: 22.99,
      category: "termos",
      image: "/placeholder.svg?height=300&width=300",
      description: "Termo con boquilla deportiva",
    },
    {
      id: 7,
      name: "Mochila Casual Colorida",
      price: 35.99,
      category: "mochilas",
      image: "/placeholder.svg?height=300&width=300",
      description: "Mochila perfecta para el día a día",
    },
    {
      id: 8,
      name: "Gorra Snapback Premium",
      price: 19.99,
      category: "gorras",
      image: "/placeholder.svg?height=300&width=300",
      description: "Gorra estilo snapback de alta calidad",
    },
  ]

  const categories = [
    { value: "all", label: "Todos los productos" },
    { value: "camisetas", label: "Camisetas" },
    { value: "termos", label: "Termos" },
    { value: "mochilas", label: "Mochilas" },
    { value: "gorras", label: "Gorras" },
  ]

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const addToCart = (product: any) => {
    setCart([...cart, { ...product, quantity: 1, type: "regular" }])
  }

  return (
    <div className="min-h-screen bg-gray-50">
     

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Catálogo de Productos</h1>
          <p className="text-gray-600 text-lg">Descubre nuestra amplia selección de productos de alta calidad</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="md:w-64">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-0">
                <div className="aspect-square overflow-hidden rounded-t-lg">
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    width={300}
                    height={300}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <Badge variant="secondary" className="mb-2 capitalize">
                    {product.category}
                  </Badge>
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-blue-600">${product.price}</span>
                    <Button
                      onClick={() => addToCart(product)}
                      size="sm"
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      <ShoppingBag className="w-4 h-4 mr-1" />
                      Agregar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No se encontraron productos</h3>
            <p className="text-gray-500">Intenta con otros términos de búsqueda o categorías</p>
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">¿Quieres personalizar tu producto?</h2>
          <p className="text-lg mb-6">Usa nuestra herramienta de personalización 3D para crear productos únicos</p>
          <Link href="/personalization">
            <Button size="lg" variant="secondary">
              Personalizar Ahora
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
