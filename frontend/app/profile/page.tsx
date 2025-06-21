"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Camera, Save, User, Mail, Phone, MapPin, Loader2 } from "lucide-react"
import orderService from "@/services/orderService"
import { authService } from "@/services/authService"
import { toast } from "sonner"
import { useAuth } from "@/contexts/AuthContext"
import AddressManager from "@/components/AddressManager"

interface Order {
  id: number
  total: number
  envio: number
  status: string
  created_at: string
  items: Array<{
    id: number
    cantidad: number
    product: {
      title: string
    }
  }>
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<Order[]>([])
  const { user, isAuthenticated, logout, updateUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    nombre: user?.nombre || "",
    telefono: user?.telefono || ""
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [])

  useEffect(() => {
    if (user) {
      setFormData({
        nombre: user.nombre || "",
        telefono: user.telefono || ""
      })
    }
  }, [user])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await orderService.getUserOrders(1, 2)
      setOrders(response.orders)
    } catch (error: any) {
      toast.error("Error al cargar las órdenes")
      console.error("Error fetching orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    if (!formData.nombre.trim()) {
      toast.error("El nombre es requerido")
      return
    }

    if (formData.telefono.length !== 10) {
      toast.error("El teléfono debe contener 10 dígitos exactamente")
      const telefono = document.getElementById('phone')
      telefono?.focus()
      return
    }

    try {
      setSaving(true)
      
      // Enviar datos al backend usando el servicio
      const response = await authService.updateProfile({
        nombre: formData.nombre,
        telefono: formData.telefono
      })
      
      // Actualizar el contexto local con los datos del servidor
      if (updateUser) {
        await updateUser(response.user)
      }
      
      toast.success("Perfil actualizado correctamente")
      setIsEditing(false)
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al actualizar el perfil")
      console.error("Error updating profile:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      nombre: user?.nombre || "",
      telefono: user?.telefono || ""
    })
    setIsEditing(false)
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "pendiente":
        return { label: "Pendiente", color: "bg-yellow-100 text-yellow-800" }
      case "procesando":
        return { label: "Procesando", color: "bg-blue-100 text-blue-800" }
      case "enviado":
        return { label: "Enviado", color: "bg-purple-100 text-purple-800" }
      case "entregado":
        return { label: "Entregado", color: "bg-green-100 text-green-800" }
      case "cancelado":
        return { label: "Cancelado", color: "bg-red-100 text-red-800" }
      default:
        return { label: "Desconocido", color: "bg-gray-100 text-gray-800" }
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Mi Perfil</h1>
          <p className="text-gray-600 text-lg text[100px] text-[#FF5733]">Gestiona tu información personal y preferencias</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Profile Information */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Información Personal</CardTitle>
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      disabled={saving}
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Guardar
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                  >
                    Editar
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="name"
                      value={formData.nombre}
                      onChange={(e) => handleInputChange("nombre", e.target.value)}
                      disabled={!isEditing}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="email"
                      type="email"
                      value={user?.correo}
                      disabled={true}
                      className="pl-10 bg-gray-50"
                    />
                  </div>
                  <p className="text-xs text-gray-500">El correo electrónico no se puede editar</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="phone"
                      value={formData.telefono}
                      onChange={(e) => handleInputChange("telefono", e.target.value)}
                      disabled={!isEditing}
                      className="pl-10"
                      placeholder="715 000 0000"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Pedidos Recientes</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((order) => {
                    const statusInfo = getStatusInfo(order.status)
                    const itemNames = order.items.map(item => item.product.title).join(", ")
                    
                    return (
                      <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm">Pedido #{order.id}</p>
                          <p className="text-sm text-gray-600 truncate">{itemNames}</p>
                          <p className="text-xs text-gray-500">{formatDate(order.created_at)}</p>
                        </div>
                        <div className="text-right ml-4">
                          <p className="font-semibold text-sm">${Number(order.total).toFixed(2)}</p>
                          <span className={`text-xs px-2 py-1 rounded-full ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No tienes pedidos aún</p>
                </div>
              )}
              
              <div className="mt-6">
                <Link href="/orders">
                  <Button variant="outline" className="w-full">
                    Ver Todos los Pedidos
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Address Manager */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Mis Direcciones</CardTitle>
            </CardHeader>
            <CardContent>
              <AddressManager />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
