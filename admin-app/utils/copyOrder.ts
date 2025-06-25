import { Order } from "@/interfaces/Order";
import { toast } from "sonner";

export  const clipToboard = (order: Order) => {
    const addressInfo = `
      📦 Información de Envío - Pedido #${order.id}

      📱 Teléfono: ${order.telefono_contacto}

      📍 Dirección:
      🏠 ${order.address.nombre}
      ${order.address.calle} ${order.address.numero_calle}
      🏘️ ${order.address.colonia}
      🏙️ ${order.address.ciudad}, ${order.address.estado}
      📮 CP: ${order.address.codigo_postal}

      📝 Referencias: ${order.address.referencias || 'Sin referencias'}
      🏡 Detalles: ${order.address.descripcion_casa || 'Sin detalles adicionales'}
      ⏰ Horario Preferido: ${order.address.horario_preferido || 'No especificado'}
    `.trim();

    navigator.clipboard.writeText(addressInfo)
      .then(() => {
        toast.success("Información copiada al portapapeles");
      })
      .catch(() => {
        toast.error("Error al copiar la información");
      });
  };