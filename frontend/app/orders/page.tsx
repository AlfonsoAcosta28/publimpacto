"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Search, Package, Truck, CheckCircle, Clock } from "lucide-react"

export default function OrdersPage() {
  const orders = [
    {
      id: "#12345",
      date: "15 Nov 2024",
      status: "delivered",
      total: 45.99,
      items: [
        {
          name: "Camiseta Premium Personalizada",
          image: "/placeholder.svg?height=80&width=80",
          quantity: 1,
          price: 30.99,
        },
        {
          name: "Termo Acero Inoxidable",
          image: "/placeholder.svg?height=80&width=80",
          quantity: 1,
          price: 14.99,
        },
      ],
    },
    {
      id: "#12344",
      date: "10 Nov 2024",
      status: "shipping",
      total: 28.99,
      items: [
        {
          name: "Gorra Personalizada",
          image: "/placeholder.svg?height=80&width=80",
          quantity: 1,
          price: 23.99,
        },
      ],
    },
    {
      id: "#12343",
      date: "5 Nov 2024",
      status: "delivered",
      total: 67.99,
      items: [
        {
          name: "Mochila Ejecutiva",
          image: "/placeholder.svg?height=80&width=80",
          quantity: 1,
          price: 45.99,
        },
        {
          name: "Taza Personalizada",
          image: "/placeholder.svg?height=80&width=80",
          quantity: 1,
          price: 17.99,
        },
      ],
    },
    {
      id: "#12342",
      date: "1 Nov 2024",
      status: "processing",
      total: 89.99,
      items: [
        {
          name: "Set de Productos Personalizados",
          image: "/placeholder.svg?height=80&width=80",
          quantity: 1,
          price: 84.99,
        },
      ],
    },
  ]

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "processing":
        return {
          label: "Procesando",
          color: "bg-yellow-100 text-yellow-800",
          icon: Clock,
        }
      case "shipping":
        return {
          label: "En tránsito",
          color: "bg-blue-100 text-blue-800",
          icon: Truck,
        }
      case "delivered":
        return {
          label: "Entregado",
          color: "bg-green-100 text-green-800",
          icon: CheckCircle,
        }
      default:
        return {
          label: "Desconocido",
          color: "bg-gray-100 text-gray-800",
          icon: Package,
        }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Mis Compras</h1>
          <p className="text-gray-600 text-lg">Revisa el estado de todos tus pedidos</p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input placeholder="Buscar por número de pedido..." className="pl-10" />
                </div>
              </div>
              <div className="md:w-48">
                <Select defaultValue="all">
                  <SelectTrigger>
                    <SelectValue placeholder="Estado del pedido" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="processing">Procesando</SelectItem>
                    <SelectItem value="shipping">En tránsito</SelectItem>
                    <SelectItem value="delivered">Entregado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        <div className="space-y-6">
          {orders.map((order) => {
            const statusInfo = getStatusInfo(order.status)
            const StatusIcon = statusInfo.icon

            return (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader className="bg-gray-50">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-lg">{order.id}</CardTitle>
                      <p className="text-gray-600">Pedido realizado el {order.date}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge className={statusInfo.color}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusInfo.label}
                      </Badge>
                      <span className="text-lg font-bold text-blue-600">${order.total.toFixed(2)}</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  <div className="space-y-4">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          width={80}
                          height={80}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-gray-600">Cantidad: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${item.price.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col md:flex-row gap-4 mt-6 pt-4 border-t">
                    <Button variant="outline" className="flex-1">
                      Ver Detalles
                    </Button>
                    {order.status === "delivered" && (
                      <Button variant="outline" className="flex-1">
                        Volver a Comprar
                      </Button>
                    )}
                    {order.status === "shipping" && (
                      <Button variant="outline" className="flex-1">
                        Rastrear Envío
                      </Button>
                    )}
                    <Button variant="outline" className="flex-1">
                      Descargar Factura
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Empty State */}
        {orders.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No tienes pedidos aún</h3>
              <p className="text-gray-500 mb-6">¡Explora nuestro catálogo y realiza tu primera compra!</p>
              <Link href="/catalog">
                <Button>Explorar Productos</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {orders.length > 0 && (
          <div className="flex justify-center mt-8">
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" disabled>
                Anterior
              </Button>
              <Button variant="default" size="sm">
                1
              </Button>
              <Button variant="outline" size="sm">
                2
              </Button>
              <Button variant="outline" size="sm">
                3
              </Button>
              <Button variant="outline" size="sm">
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
