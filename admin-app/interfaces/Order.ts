interface Order {
  id: number
  user_id: number
  total: number
  status: string
  direccion_entrega: string
  telefono_contacto: string
  created_at: string
  updated_at: string
  user: {
    correo: string
  }
  items: Array<{
    product_id: number
    cantidad: number
    precio_unitario: number
  }>
}