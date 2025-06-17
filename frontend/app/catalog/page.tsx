"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ShoppingBag, Search, Filter, ArrowLeft } from "lucide-react"
import { productService } from "@/services/productService"
import { categoryService } from "@/services/categoryService"
import { ProductInterface } from "@/interfaces/Product"

export default function CatalogPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [cart, setCart] = useState<any[]>([])
  const [products, setProducts] = useState<ProductInterface[]>([])
  const [categories, setCategories] = useState<{ id: string; title: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  })

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getAllCategories()
      setCategories(response)
    } catch (err) {
      console.error('Error al cargar las categorías:', err)
    }
  }

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params: any = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm || undefined,
        category_id: selectedCategory !== 'all' ? selectedCategory : undefined,
      }

      const response = await productService.getPaginatedProducts(params)
      console.log(response)
      setProducts(response.data)
      setPagination({
        ...pagination,
        total: response.pagination.total,
        totalPages: response.pagination.totalPages
      })
    } catch (err) {
      setError('Error al cargar los productos')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [pagination.page, selectedCategory, searchTerm])

  const addToCart = (product: ProductInterface) => {
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
                  <SelectItem value="all">Todos los productos</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando productos...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="text-red-500 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">{error}</h3>
            <Button onClick={fetchProducts} variant="outline">
              Intentar de nuevo
            </Button>
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <Card key={product.id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-0 relative">
                      {product.badge && (
                        <Badge
                          variant="secondary"
                          className="absolute top-2 right-2 z-10 capitalize bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                        >
                          {product.badge}
                        </Badge>
                      )}
                    <div className="aspect-square overflow-hidden rounded-t-lg">
                      <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.title}
                        width={300}
                        height={300}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4">
                      <Badge variant="secondary" className="mb-2 capitalize">
                        {categories.find(cat => String(cat.id) === String(product.category_id))?.title || 'Sin categoría'}
                      </Badge>
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.title}</h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          {product.personalization_price > 0 ? (
                            <>
                              <span className="text-sm text-gray-500 line-through">${product.base_price}</span>
                              <span className="text-2xl font-bold text-blue-600">
                                ${Number(product.personalization_price) }
                              </span>
                            </>
                          ) : (
                            <span className="text-2xl font-bold text-blue-600">${product.base_price}</span>
                          )}
                          {product.personalization_price > 0 && (
                            <span className="text-xs text-gray-500">
                              {Number(product.discount_percentage)}% de descuento
                            </span>
                          )}
                        </div>
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

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center mt-8 gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                  disabled={pagination.page === 1}
                >
                  Anterior
                </Button>
                <span className="flex items-center px-4">
                  Página {pagination.page} de {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                  disabled={pagination.page === pagination.totalPages}
                >
                  Siguiente
                </Button>
              </div>
            )}
          </>
        )}

        {!loading && !error && products.length === 0 && (
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
