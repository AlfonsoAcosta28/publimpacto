"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Search, Package, Truck, CheckCircle, Clock, Loader2 } from "lucide-react"
import { orderService } from "@/services/orderService"
import { toast } from "sonner"
import { getStatusInfo } from "@/utils/OrderStatus"

interface OrderItem {
  id: number
  product_id: number
  cantidad: number
  precio_unitario: number
  product: {
    id: number
    title: string
    image: string
  }
}

interface Order {
  id: number
  total: number
  envio: number
  status: string
  created_at: string
  telefono_contacto: string
  address: {
    nombre: string
    calle: string
    numero_calle: string
    colonia: string
    ciudad: string
    estado: string
    codigo_postal: string
  }
  items: OrderItem[]
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalOrders: 0,
    hasNextPage: false,
    hasPrevPage: false,
    limit: 4
  })

  useEffect(() => {
    fetchOrders()
  }, [currentPage])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await orderService.getUserOrders(currentPage, 4)
      setOrders(response.orders)
      setPagination(response.pagination)
    } catch (error: any) {
      toast.error("Error al cargar las órdenes")
      console.error("Error fetching orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toString().includes(searchTerm)
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    let endPage = Math.min(pagination.totalPages, startPage + maxVisiblePages - 1)
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }
    return pages
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando órdenes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Mis Compras</h1>
          <p className="text-gray-600 text-lg">Revisa el estado de todos tus pedidos</p>
          {pagination.totalOrders > 0 && (
            <p className="text-sm text-gray-500 mt-2">
              Mostrando {((currentPage - 1) * pagination.limit) + 1} - {Math.min(currentPage * pagination.limit, pagination.totalOrders)} de {pagination.totalOrders} pedidos
            </p>
          )}
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input 
                    placeholder="Buscar por número de pedido..." 
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="md:w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Estado del pedido" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="pendiente">Pendiente</SelectItem>
                    <SelectItem value="procesando">Procesando</SelectItem>
                    <SelectItem value="enviado">Enviado</SelectItem>
                    <SelectItem value="entregado">Entregado</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        <div className="space-y-6">
          {filteredOrders.map((order) => {
            const statusInfo = getStatusInfo(order.status)
            const StatusIcon = statusInfo.icon

            return (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader className="bg-gray-50">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-lg">Pedido #{order.id}</CardTitle>
                      <p className="text-gray-600">Pedido realizado el {formatDate(order.created_at)}</p>
                      <p className="text-sm text-gray-500">
                        Dirección: {order.address.calle} {order.address.numero_calle}, {order.address.colonia}, {order.address.ciudad}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge className={statusInfo.color}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusInfo.label}
                      </Badge>
                      <div className="text-right">
                        <span className="text-lg font-bold text-blue-600">${Number(order.total).toFixed(2)}</span>
                        {Number(order.envio) > 0 && (
                          <p className="text-sm text-gray-500">Envío: ${Number(order.envio).toFixed(2)}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  <div className="space-y-4">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-4">
                        <Image
                          src={item.product.image || "/placeholder.svg"}
                          alt={item.product.title}
                          width={80}
                          height={80}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium">{item.product.title}</h4>
                          <p className="text-gray-600">Cantidad: {item.cantidad}</p>
                          <p className="text-sm text-gray-500">Precio unitario: ${Number(item.precio_unitario).toFixed(2)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${(Number(item.precio_unitario) * Number(item.cantidad)).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Order Summary */}
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Subtotal:</span>
                      <span>${(Number(order.total) - Number(order.envio)).toFixed(2)}</span>
                    </div>
                    {Number(order.envio) > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Envío:</span>
                        <span>${Number(order.envio).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center font-bold text-lg mt-2 pt-2 border-t border-gray-200">
                      <span>Total:</span>
                      <span className="text-blue-600">${Number(order.total).toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={!pagination.hasPrevPage}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                Anterior
              </Button>
              
              {getPageNumbers().map((pageNum) => (
                <Button
                  key={pageNum}
                  variant={pageNum === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </Button>
              ))}
              
              <Button 
                variant="outline" 
                size="sm" 
                disabled={!pagination.hasNextPage}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredOrders.length === 0 && !loading && (
          <Card className="text-center py-12">
            <CardContent>
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                {pagination.totalOrders === 0 ? "No tienes pedidos aún" : "No se encontraron pedidos"}
              </h3>
              <p className="text-gray-500 mb-6">
                {pagination.totalOrders === 0 
                  ? "¡Explora nuestro catálogo y realiza tu primera compra!" 
                  : "Intenta ajustar los filtros de búsqueda"
                }
              </p>
              {pagination.totalOrders === 0 && (
                <Link href="/catalog">
                  <Button>Explorar Productos</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
