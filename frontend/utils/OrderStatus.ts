import { CheckCircle, Clock, Package, Truck } from "lucide-react"

export const getStatusInfo = (status: String) => {
  switch (status) {
    case "pendiente":
      return {
        label: "Hemos recibido tu pedido",
        color: "bg-yellow-100 text-yellow-800",
        icon: Clock,
      }
    case "procesando":
      return {
        label: "Procesando",
        color: "bg-blue-100 text-blue-800",
        icon: Clock,
      }
    case "enviado":
      return {
        label: "Tu pedido esta en camino",
        color: "bg-purple-100 text-purple-800",
        icon: Truck,
      }
    case "entregado":
      return {
        label: "Entregado",
        color: "bg-green-100 text-green-800",
        icon: CheckCircle,
      }
    case "cancelado":
      return {
        label: "Cancelado",
        color: "bg-red-100 text-red-800",
        icon: Package,
      }
    default:
      return {
        label: "Desconocido",
        color: "bg-gray-100 text-gray-800",
        icon: Package,
      }
  }
}