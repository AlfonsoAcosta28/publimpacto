"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Search, Eye, Clock, User, DollarSign } from "lucide-react"
import Swal from 'sweetalert2'
import { serviceOrderService } from '@/services/serviceOrderService'

interface ServiceOrder {
  id: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  total_price: number;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  comments: string;
  created_at: string;
  service: {
    id: number;
    name: string;
    base_price: number;
  };
  variant?: {
    id: number;
    variant_name: string;
    price_modifier: number;
  };
  items?: {
    id: number;
    option_name: string;
    option_value: string;
  }[];
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-orange-100 text-orange-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
};

const statusLabels = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  in_progress: 'En Progreso',
  completed: 'Completado',
  cancelled: 'Cancelado'
};

export default function ServiceOrdersPage() {
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await serviceOrderService.getAllOrders();
      setOrders(data);
    } catch (error) {
      console.error('Error al cargar órdenes:', error);
      Swal.fire({
        title: "Error",
        text: "No se pudieron cargar las órdenes",
        icon: "error",
        timer: 1500,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: number, newStatus: string) => {
    try {
      await serviceOrderService.updateOrderStatus(orderId, newStatus);
      
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: newStatus as any } : order
      ));

      Swal.fire({
        title: "Estado actualizado",
        text: "El estado de la orden ha sido actualizado exitosamente",
        icon: "success",
        timer: 1500,
      });
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      Swal.fire({
        title: "Error",
        text: "No se pudo actualizar el estado",
        icon: "error",
        timer: 1500,
      });
    }
  };

  const handleViewDetails = (order: ServiceOrder) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toString().includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getServiceOptions = (order: ServiceOrder) => {
    if (!order.items || order.items.length === 0) return null;
    
    const serviceOptionsItem = order.items.find(item => item.option_name === 'service_options');
    if (serviceOptionsItem) {
      try {
        return JSON.parse(serviceOptionsItem.option_value);
      } catch (error) {
        console.error('Error parsing service options:', error);
        return null;
      }
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Órdenes de Servicios</h1>
          <p className="text-gray-600">Gestiona las solicitudes de servicios de los clientes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar órdenes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="pending">Pendiente</SelectItem>
            <SelectItem value="confirmed">Confirmado</SelectItem>
            <SelectItem value="in_progress">En Progreso</SelectItem>
            <SelectItem value="completed">Completado</SelectItem>
            <SelectItem value="cancelled">Cancelado</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={fetchOrders} variant="outline">
          Actualizar
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Órdenes</p>
                <p className="text-2xl font-bold">{orders.length}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {orders.filter(o => o.status === 'pending').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">En Progreso</p>
                <p className="text-2xl font-bold text-orange-600">
                  {orders.filter(o => o.status === 'in_progress').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completadas</p>
                <p className="text-2xl font-bold text-green-600">
                  {orders.filter(o => o.status === 'completed').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Órdenes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Servicio</TableHead>
                <TableHead>Variante</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">#{order.id}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{order.customer_name}</div>
                      <div className="text-sm text-gray-500">{order.customer_email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{order.service.name}</TableCell>
                  <TableCell>
                    {order.variant ? order.variant.variant_name : 'Sin variante'}
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">${order.total_price}</span>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[order.status]}>
                      {statusLabels[order.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(order.created_at).toLocaleDateString('es-ES')}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewDetails(order)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Select
                        value={order.status}
                        onValueChange={(value) => handleStatusUpdate(order.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pendiente</SelectItem>
                          <SelectItem value="confirmed">Confirmado</SelectItem>
                          <SelectItem value="in_progress">En Progreso</SelectItem>
                          <SelectItem value="completed">Completado</SelectItem>
                          <SelectItem value="cancelled">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles de la Orden #{selectedOrder?.id}</DialogTitle>
            <DialogDescription>
              Información completa de la solicitud de servicio
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Información del Cliente
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Nombre</Label>
                    <Input value={selectedOrder.customer_name} readOnly />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input value={selectedOrder.customer_email} readOnly />
                  </div>
                  <div>
                    <Label>Teléfono</Label>
                    <Input value={selectedOrder.customer_phone} readOnly />
                  </div>
                  <div>
                    <Label>Fecha de solicitud</Label>
                    <Input 
                      value={new Date(selectedOrder.created_at).toLocaleString('es-ES')} 
                      readOnly 
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Información del Servicio
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Servicio</Label>
                    <Input value={selectedOrder.service.name} readOnly />
                  </div>
                  <div>
                    <Label>Precio base</Label>
                    <Input value={`$${selectedOrder.service.base_price}`} readOnly />
                  </div>
                  {selectedOrder.variant && (
                    <>
                      <div>
                        <Label>Variante</Label>
                        <Input value={selectedOrder.variant.variant_name} readOnly />
                      </div>
                      <div>
                        <Label>Precio adicional</Label>
                        <Input value={`$${selectedOrder.variant.price_modifier}`} readOnly />
                      </div>
                    </>
                  )}
                  <div>
                    <Label>Precio total</Label>
                    <Input value={`$${selectedOrder.total_price}`} readOnly className="font-bold" />
                  </div>
                </div>
              </div>

              {(() => {
                const serviceOptions = getServiceOptions(selectedOrder);
                if (serviceOptions && Object.keys(serviceOptions).length > 0) {
                  return (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Opciones del Servicio</h3>
                      <div className="space-y-3">
                        {Object.entries(serviceOptions).map(([key, value]) => (
                          <div key={key}>
                            <Label className="capitalize">{key}</Label>
                            <Input value={String(value)} readOnly />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              {selectedOrder.comments && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Comentarios</h3>
                  <Textarea 
                    value={selectedOrder.comments} 
                    readOnly 
                    rows={3}
                  />
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold mb-3">Estado Actual</h3>
                <div className="flex items-center gap-4">
                  <Badge className={statusColors[selectedOrder.status]}>
                    {statusLabels[selectedOrder.status]}
                  </Badge>
                  <Select
                    value={selectedOrder.status}
                    onValueChange={(value) => {
                      handleStatusUpdate(selectedOrder.id, value);
                      setSelectedOrder(prev => prev ? { ...prev, status: value as any } : null);
                    }}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendiente</SelectItem>
                      <SelectItem value="confirmed">Confirmado</SelectItem>
                      <SelectItem value="in_progress">En Progreso</SelectItem>
                      <SelectItem value="completed">Completado</SelectItem>
                      <SelectItem value="cancelled">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 