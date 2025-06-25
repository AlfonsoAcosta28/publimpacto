"use client"

import {
  Search,
  Truck,
  Clock,
  MoreHorizontal,
  Package,
  XCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useEffect, useState } from "react"
import { orderService } from "@/services/orderService"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Order } from "@/interfaces/Order"
import { useRouter } from "next/navigation"
import { clipToboard } from "@/utils/copyOrder"
import Swal from "sweetalert2"

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [openOrderId, setOpenOrderId] = useState<number | null>(null)
  const [openCancelShippingId, setOpenCancelShippingId] = useState<number | null>(null)
  const [openCancelOrderId, setOpenCancelOrderId] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState("products")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const [stats, setStats] = useState({
    total: 0,
    entregados: 0,
    enProceso: 0,
    pendientes: 0
  })

  const router = useRouter();

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const data = await orderService.getAllOrders()

      console.log(data)
      setOrders(data)

      const stats = data.reduce((acc: { total: number; entregados: number; enProceso: number; pendientes: number }, order: Order) => {
        acc.total++
        if (order.status === "entregado") acc.entregados++
        else if (["procesando", "enviado"].includes(order.status)) acc.enProceso++
        else acc.pendientes++
        return acc
      }, { total: 0, entregados: 0, enProceso: 0, pendientes: 0 })

      setStats(stats)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast("No se pudieron cargar los pedidos")
    }
  }

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus)
      toast("Estado del pedido actualizado")
      fetchOrders()
    } catch (error) {
      toast("No se pudo actualizar el estado del pedido")
    }
  }

  const handleCancelOrder = async (orderId: number) => {
    try {
      await orderService.cancelOrder(orderId)
      toast("Pedido cancelado correctamente")
      setOpenCancelOrderId(null)
      fetchOrders()
    } catch (error:any) {
      Swal.fire({
        title: 'Error al cancelar',
        text: error.response.data.message,
        timer: 4500,
        icon:"error"
      })
      console.log(error)
      toast("No se pudo cancelar el pedido")
    }
  }

  const handleSendOrder = async (orderId: number) => {
    try {
      await orderService.updateOrderStatus(orderId, "enviado")
      toast.success("Pedido marcado como enviado")
      setOpenOrderId(null)
      fetchOrders()
    } catch (error) {
      toast.error("No se pudo marcar el pedido como enviado")
    }
  }

  const handleDeliverOrder = async (orderId: number) => {
    try {
      await orderService.updateOrderStatus(orderId, "entregado")
      toast("Pedido marcado como entregado")
      fetchOrders()
    } catch (error) {
      console.log(error)
      toast("No se pudo marcar el pedido como entregado")
    }
  }

  const handleCancelShipping = async (orderId: number) => {
    try {
      await orderService.updateOrderStatus(orderId, "pendiente")
      toast("Envío cancelado, pedido regresado a pendiente")
      setOpenCancelShippingId(null)
      fetchOrders()
    } catch (error) {
      toast("No se pudo cancelar el envío")
    }
  }

  // Filtrar órdenes por tipo de item
  const getOrdersByItemType = (type: 'products' | 'cups') => {
    return orders.filter(order =>
      order[type].length > 0
    )
  }

  const filteredOrders = (type: 'products' | 'cups') => {
    const ordersWithType = getOrdersByItemType(type)
    return ordersWithType.filter(order => {
      const matchesStatus = filterStatus === "all" || order.status === filterStatus
      const matchesSearch = searchQuery === "" ||
        order.id.toString().includes(searchQuery) ||
        order.telefono_contacto?.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesStatus && matchesSearch
    })
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
    </div>
  }



  const abrirModalInfo = (order: Order) => {
    // setOpenOrderId(order.id)
    return (
      <Dialog
        open={openOrderId === order.id} onOpenChange={(open) => {
          console.log(openOrderId)
          if (!open) setOpenOrderId(null);
        }}
      >
        <DialogTrigger asChild>
          <Button
            variant="default"
            size="sm"
            onClick={() => setOpenOrderId(order.id)}
          >
            Preparar Envio
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto p-6 rounded-lg">
          <DialogHeader>
            <DialogTitle>Detalles del Pedido #{order.id}</DialogTitle>
            <DialogDescription>
              Información completa del pedido
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="font-medium">Teléfono:</span>
              <span className="col-span-3">{order.telefono_contacto}</span>
            </div>
            <div className="space-y-2">
              <span className="font-medium">Dirección de Entrega:</span>
              <div className="pl-4 space-y-1">
                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="text-sm text-gray-500">Nombre:</span>
                  <span className="col-span-3">{order.address.nombre}</span>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="text-sm text-gray-500">Calle:</span>
                  <span className="col-span-3">{order.address.calle}</span>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="text-sm text-gray-500">Número:</span>
                  <span className="col-span-3">{order.address.numero_calle}</span>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="text-sm text-gray-500">Colonia:</span>
                  <span className="col-span-3">{order.address.colonia}</span>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="text-sm text-gray-500">Ciudad:</span>
                  <span className="col-span-3">{order.address.ciudad}</span>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="text-sm text-gray-500">Estado:</span>
                  <span className="col-span-3">{order.address.estado}</span>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="text-sm text-gray-500">CP:</span>
                  <span className="col-span-3">{order.address.codigo_postal}</span>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="text-sm text-gray-500">Referencias:</span>
                  <span className="col-span-3">{order.address.referencias}</span>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="text-sm text-gray-500">Detalles de la casa:</span>
                  <span className="col-span-3">{order.address.descripcion_casa}</span>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="text-sm text-gray-500">Horario preferido:</span>
                  <span className="col-span-3">{order.address.horario_preferido}</span>
                </div>
              </div>
            </div>

            {order.products.length > 0 && (
              <div className="space-y-2">
                <span className="font-medium">Productos:</span>
                <div className="pl-4 space-y-4">
                  {order.products.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-2 border rounded-lg">
                      <img
                        src={item.product.image}
                        alt={item.product.title}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium">{item.product.title}</h4>
                        <p className="text-lg font-bold text-blue-600">Cantidad: {item.cantidad}</p>
                        <p className="text-sm text-gray-600">Precio: ${item.precio_unitario}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {order.cups.length > 0 && (
              <div className="space-y-2">
                <span className="font-medium">Tazas:</span>
                <div className="pl-4 space-y-4">
                  {order.cups.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-2 border rounded-lg">
                      <img
                        src={item.image_url}
                        alt={item.cup.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium">{item.cup.name}</h4>
                        <p className="text-lg font-bold text-blue-600">Cantidad: {item.cantidad}</p>
                        <p className="text-sm text-gray-600">Precio: ${item.precio_unitario}</p>
                        <p className="text-sm text-gray-500">{item.cup.descripcion}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-4 items-center gap-4">
              <span className="font-medium">Envío:</span>
              <span className="col-span-3">${order.envio}</span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="font-medium">Total:</span>
              <span className="col-span-3">${order.total}</span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="font-medium">Fecha de compra:</span>
              <span className="col-span-3">{new Date(order.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => clipToboard(order)}
              className="flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
              </svg>
              Copiar Info
            </Button>
            <Button
              onClick={() => handleSendOrder(order.id)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Confirmar Envío
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const renderOrdersTable = (orders: Order[], type?: 'products' | 'cups') => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Teléfono</TableHead>
          <TableHead>Fecha</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Dirección</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id} onDoubleClick={() => router.push(`/orders/item/${order.id}`)}>
            <TableCell className="font-medium">#{order.id}</TableCell>
            <TableCell>{order.telefono_contacto}</TableCell>
            <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
            <TableCell>${order.total}</TableCell>
            <TableCell>
              <Badge
                variant={
                  order.status === "entregado"
                    ? "entregado"
                    : order.status === "enviado"
                      ? "enviado"
                      : order.status === "procesando"
                        ? "procesando"
                        : "pendiente"
                }
              >
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Badge>
            </TableCell>
            <TableCell className="truncate max-w-[200px]">
              {order.address.nombre} - {order.address.calle} {order.address.numero_calle}, {order.address.colonia}, {order.address.ciudad}, {order.address.estado}, {order.address.codigo_postal}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex gap-2 justify-end">
                {/* Botón Preparar pedido solo para tazas */}
                {type === 'cups' && order.status === "pendiente" && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => router.push(`/orders/item/${order.id}`)}
                  >
                    Preparar pedido
                  </Button>
                )}
                {/* Acciones existentes */}
                {order.status === "pendiente" ? (
                  <>
                    {abrirModalInfo(order)}
                    <Dialog open={openCancelOrderId === order.id} onOpenChange={(open) => {
                      if (!open) setOpenCancelOrderId(null);
                    }}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-500 text-red-600 hover:bg-red-50"
                          onClick={() => setOpenCancelOrderId(order.id)}
                        >
                          Cancelar Pedido
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Cancelar Pedido - #{order.id}</DialogTitle>
                          <DialogDescription>
                            ¿Estás seguro de que deseas cancelar este pedido? Esta acción no se puede deshacer.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <span className="font-medium">Teléfono:</span>
                            <span className="col-span-3">{order.telefono_contacto}</span>
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <span className="font-medium">Total:</span>
                            <span className="col-span-3">${order.total}</span>
                          </div>
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <p className="text-sm text-red-800">
                              <strong>Advertencia:</strong> Al cancelar el pedido, se notificará al cliente y se procesará el reembolso si corresponde.
                            </p>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            onClick={() => setOpenCancelOrderId(null)}
                          >
                            Cancelar
                          </Button>
                          <Button
                            onClick={() => handleCancelOrder(order.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Confirmar Cancelación
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </>
                ) : order.status === "enviado" ? (
                  <>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => setSelectedOrder(order)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Entregar
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Confirmar Entrega - Pedido #{order.id}</DialogTitle>
                          <DialogDescription>
                            Confirma que el pedido ha sido entregado al cliente
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <span className="font-medium">Teléfono:</span>
                            <span className="col-span-3">{order.telefono_contacto}</span>
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <span className="font-medium">Dirección:</span>
                            <span className="col-span-3">{order.address.calle} {order.address.numero_calle}, {order.address.colonia}</span>
                          </div>
                          <div className="space-y-2">
                            <span className="font-medium">Productos entregados:</span>
                            <div className="space-y-2">
                              {order.products.map((item) => (
                                <div key={item.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                                  <img
                                    src={item.product.image}
                                    alt={item.product.title}
                                    className="w-10 h-10 object-cover rounded"
                                  />
                                  <div className="flex-1">
                                    <p className="text-sm font-medium">{item.product.title}</p>
                                    <p className="text-sm text-blue-600 font-bold">Cantidad: {item.cantidad}</p>
                                  </div>
                                </div>
                              ))}

                              {order.cups.length > 0 && (
                                <div className="flex items-center gap-4 p-2 rounded-lg">
                                  <img
                                    src={order.cups[0].image_url}
                                    alt={'taza personalizada'}
                                    className="w-20 object-cover rounded"
                                  />
                                  <div className="grid grid-cols-2 gap-2">
                                    {order.cups.map((item) => (
                                      <div key={item.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                                        <div className="flex-1">
                                          <p className="text-sm font-medium">{item.cup.name}</p>
                                          <p className="text-sm text-blue-600 font-bold">Cantidad: {item.cantidad}</p>
                                        </div>
                                      </div>
                                    ))}

                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <Button
                            onClick={() => handleDeliverOrder(order.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Confirmar Entrega
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Dialog open={openCancelShippingId === order.id} onOpenChange={(open) => {
                      if (!open) setOpenCancelShippingId(null);
                    }}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-500 text-red-600 hover:bg-red-50"
                          onClick={() => setOpenCancelShippingId(order.id)}
                        >
                          Cancelar Envío
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Cancelar Envío - Pedido #{order.id}</DialogTitle>
                          <DialogDescription>
                            ¿Estás seguro de que deseas cancelar el envío? El pedido regresará a estado pendiente.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <span className="font-medium">Teléfono:</span>
                            <span className="col-span-3">{order.telefono_contacto}</span>
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <span className="font-medium">Dirección:</span>
                            <span className="col-span-3">{order.address.calle} {order.address.numero_calle}, {order.address.colonia}</span>
                          </div>
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <p className="text-sm text-yellow-800">
                              <strong>Motivo común:</strong> No se encontró a la persona en la dirección especificada.
                            </p>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            onClick={() => setOpenCancelShippingId(null)}
                          >
                            Cancelar
                          </Button>
                          <Button
                            onClick={() => handleCancelShipping(order.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Confirmar Cancelación
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </>
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => router.push(`/orders/item/${order.id}`)}>Ver Detalles</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, "pendiente")}>Marcar como Pendiente</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, "procesando")}>Marcar como Procesando</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, "enviado")}>Marcar como Enviado</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, "entregado")}>Marcar como Entregado</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600" onClick={() => handleCancelOrder(order.id)}>
                        Cancelar Pedido
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Gestión de Pedidos</h2>
        <div className="flex gap-2">
          {/* <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Download className="h-4 w-4" />
            Exportar
          </Button> */}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center">
            <div className="bg-blue-50 p-3 rounded-full mr-4">
              <Package className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Pedidos</p>
              <h3 className="text-2xl font-bold">{stats.total}</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center">
            <div className="bg-green-50 p-3 rounded-full mr-4">
              <Truck className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Entregados</p>
              <h3 className="text-2xl font-bold">{stats.entregados}</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center">
            <div className="bg-amber-50 p-3 rounded-full mr-4">
              <Clock className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">En Proceso</p>
              <h3 className="text-2xl font-bold">{stats.enProceso}</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center">
            <div className="bg-red-50 p-3 rounded-full mr-4">
              <XCircle className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pendientes</p>
              <h3 className="text-2xl font-bold">{stats.pendientes}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader className="p-4 pb-0">
          <CardTitle className="text-base font-medium">Lista de Pedidos</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row justify-between mb-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar pedido por ID o teléfono"
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full md:w-[400px] text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por estado" />
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

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="products">Productos ({(orders.filter((order: Order) => order['products'].length > 0 && order.status !== 'entregado')).length})</TabsTrigger>
              <TabsTrigger value="cups">Tazas ({(orders.filter((order: Order) => order['cups'].length > 0 && order.status !== 'entregado')).length})</TabsTrigger>
            </TabsList>

            <TabsContent value="products" className="mt-6">
              <div className="overflow-x-auto">
                {filteredOrders('products').length > 0 ? (
                  renderOrdersTable(filteredOrders('products'), 'products')
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No hay pedidos de productos que coincidan con los filtros
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="cups" className="mt-6">
              <div className="overflow-x-auto">
                {filteredOrders('cups').length > 0 ? (
                  renderOrdersTable(filteredOrders('cups'), 'cups')
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No hay pedidos de tazas que coincidan con los filtros
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </>
  )
}