import { Address } from "./Address"

export interface Quote {
    id: number
    description: string
    Address: Address
    quantity: number
    dimensions?: string
    colors?: string
    desired_delivery_date?: string
    created_at?: string
    status: string
    phone?: string
    Service?: { id: number; name: string }
    User?: { id: number; nombre: string; correo: string }
  }