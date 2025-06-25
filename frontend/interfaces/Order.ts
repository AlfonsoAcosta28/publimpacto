type OrderItem =
  | {
    type: 'product'
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
  | {
    type: 'cup'
    id: number
    cup_id: number
    cantidad: number
    precio_unitario: number
    image: string
    cup: {
      id: number
      name: string
      descripcion: string
    } | null
  }

export interface Order {
  id: number
  total: number
  envio: number
  status: string
  created_at: string
  telefono_contacto: string
  address: Address
  items: OrderItem[]
}

interface Address {
  id: number;
  nombre: string;
  calle: string;
  numero_calle: string;
  colonia: string;
  ciudad: string;
  estado: string;
  codigo_postal: string;
  referencias: string;
  descripcion_casa: string;
  horario_preferido: string;
}
