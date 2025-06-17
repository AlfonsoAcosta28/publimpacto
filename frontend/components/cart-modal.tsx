"use client"


import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, Minus, Plus, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useCart } from "@/contexts/cartContext"

interface CartModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CartModal({ isOpen, onClose }: CartModalProps) {
  const { cart, removeFromCart, updateQuantity } = useCart()

  const totalItems = cart.reduce((total, item) => total + item.quantity, 0)
  const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex justify-end" onClick={onClose}>
      <div
        className="bg-white w-full max-w-md h-full overflow-auto animate-in slide-in-from-right"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h2 className="font-medium">
              Tu carrito ({totalItems} producto{totalItems !== 1 ? "s" : ""})
            </h2>
          </div>
        </div>

        <div className="divide-y">
          {cart.length > 0 ? (
            cart.map((item) => (
              <div key={item.id} className="p-4 flex gap-4">
                <div className="relative w-20 h-20 rounded-md overflow-hidden flex-shrink-0 border">
                  <Image src={item.image || "/placeholder.svg"} alt={item.title} fill className="object-cover" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h3 className="font-medium">{item.title}</h3>
                    <span className="font-medium">${item.price}</span>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center border rounded-md">
                      <button
                        className="w-8 h-8 flex items-center justify-center text-gray-500"
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        className="w-8 h-8 flex items-center justify-center text-gray-500"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <button
                      className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">Tu carrito está vacío</div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-4 border-t mt-auto sticky bottom-0 bg-white">
            <div className="flex justify-between items-center mb-4">
              <span className="font-medium">Total:</span>
              <span className="font-bold text-xl">${totalPrice}</span>
            </div>
            <Link href="/checkout">
              <Button className="w-full bg-red-500 hover:bg-red-600">Pagar ahora</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default CartModal