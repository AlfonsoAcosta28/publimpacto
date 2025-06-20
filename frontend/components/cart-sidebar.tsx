"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ShoppingBag, Plus, Minus, Trash2 } from "lucide-react"
import { useCart } from "@/contexts/cartContext"
import shippingpriceService from "@/services/shippingpricesService"
import { toast } from "sonner"

export default function CartSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const { cart, updateQuantity, removeFromCart } = useCart();

  const [shippingPrice, setShippingPrice] = useState<number>(0);
  const [minOrder, setMinOrder] = useState<number>(0);

  useEffect(() => {
    const fetchShipping = async () => {
      const { valorEnvio, min_order } = await shippingpriceService.getCurrentPrice();
      setShippingPrice(valorEnvio);
      setMinOrder(min_order);
      console.log("Se ejecuto");
    };
    fetchShipping();
  }, []);
  

  const handleUpdateQuantity = (id: string, newQuantity: number, availableQuantity?: number) => {
    if (newQuantity === 0) {
      removeFromCart(id)
      return
    }
    if (availableQuantity && newQuantity > availableQuantity) {
      toast.warning(`No puedes agregar más de ${availableQuantity} productos.`);
      return;
    }
    updateQuantity(id, newQuantity)
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  const envioGratis = subtotal >= minOrder;

  return (
    <div className="">

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="relative">
            <ShoppingBag className="w-4 h-4 mr-2" />
            Carrito
            {itemCount > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                {itemCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>

        <SheetContent className="w-full sm:max-w-lg pt-5 pl-10 pr-10 pb-5">
          <SheetHeader>
            <SheetTitle className="flex items-center justify-between ">
              <span>Carrito de Compras</span>
              <Badge variant="secondary">{itemCount} productos</Badge>
            </SheetTitle>
          </SheetHeader>

          <div className="flex flex-col h-full">
            {cart.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">Tu carrito está vacío</h3>
                <p className="text-gray-500 mb-6">¡Agrega algunos productos increíbles!</p>
                <Button onClick={() => setIsOpen(false)} asChild>
                  <Link href="/catalog">Explorar Productos</Link>
                </Button>
              </div>
            ) : (
              <>
                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex gap-3 p-3 border rounded-lg">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.title}
                        width={80}
                        height={80}
                        className="w-20 h-20 object-cover rounded-md flex-shrink-0"
                      />

                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium text-sm line-clamp-2">{item.title}</h4>
                            {/* {item.type === "custom" && (
                              <Badge variant="secondary" className="text-xs mt-1">
                                Personalizado
                              </Badge>
                            )} */}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-500 hover:text-red-700 p-1 h-auto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                              className="h-8 w-8 p-0"
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="w-8 text-center text-sm">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1, item.available_quantity)}
                              className="h-8 w-8 p-0"
                              disabled={item.available_quantity ? item.quantity >= item.available_quantity : false}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>

                          <span className="font-semibold text-blue-600">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Cart Summary */}
                <div className="border-t pt-4 space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Envío:</span>
                      <div className="text-right text-sm">
                        {envioGratis ? (
                          <>
                            <span className="line-through text-gray-400 mr-2 ">
                              ${shippingPrice.toFixed(2)}
                            </span>
                            <span className="text-green-600 font-semibold">Gratis</span>
                          </>
                        ) : (
                          <>
                            ${shippingPrice.toFixed(2)}
                            <div className="text-xs text-green-600 mt-1">
                              Envío gratis para compras arriba de ${minOrder}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span className="text-blue-600">${(subtotal + (subtotal > 50 ? 0 : 5.99)).toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Button
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      onClick={() => setIsOpen(false)}
                      asChild
                    >
                      <Link href="/checkout">Finalizar Compra</Link>
                    </Button>
                    <Button variant="outline" className="w-full" onClick={() => setIsOpen(false)} asChild>
                      <Link href="/catalog">Seguir Comprando</Link>
                    </Button>
                  </div>

                  {subtotal < 50 && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-blue-700">
                        💡 Agrega ${(50 - subtotal).toFixed(2)} más para envío gratis
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
