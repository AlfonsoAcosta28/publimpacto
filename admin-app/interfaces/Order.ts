import { Address } from "./Address"

interface ProductItem {
  id: number
  product_id: number
  cantidad: number
  precio_unitario: string
  product: {
    id: number
    title: string
    image: string
  }
}

interface CupItem {
  id: number
  id_order: number
  id_cup: number
  image_url: string
  cantidad: number
  precio_unitario: string
  subtotal: string
  cup: {
    id: number
    name: string
    descripcion: string
  }
}



interface User {
  id: number;
  nombre: string;
  correo: string;
}

export interface Order {
  id: number
  user_id: number
  address_id: number
  total: string
  status: string
  telefono_contacto: string
  created_at: string
  updated_at: string
  deleted_at: string | null
  envio: string
  activo: boolean
  user?: User
  address: Address
  products: ProductItem[]
  cups: CupItem[]
}
