"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, CreditCard, Truck, MapPin, User, Mail, Phone, Lock, CheckCircle, Package } from "lucide-react"
import UserMenu from "@/components/user-menu"
import CartSidebar from "@/components/cart-sidebar"

export default function CheckoutPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    // Información personal
    firstName: "",
    lastName: "",
    email: "",
    phone: "",

    // Dirección de envío
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "México",

    // Método de envío
    shippingMethod: "standard",

    // Método de pago
    paymentMethod: "card",

    // Información de tarjeta
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardName: "",

    // Opciones adicionales
    saveInfo: false,
    newsletter: false,
    notes: "",
  })

  const [cartItems] = useState([
    {
      id: 1,
      name: "Camiseta Premium Personalizada",
      price: 30.99,
      quantity: 2,
      type: "custom",
      image: "/placeholder.svg?height=80&width=80",
    },
    {
      id: 2,
      name: "Termo Acero Inoxidable 500ml",
      price: 18.99,
      quantity: 1,
      type: "regular",
      image: "/placeholder.svg?height=80&width=80",
    },
    {
      id: 3,
      name: "Taza Personalizada con Logo",
      price: 17.99,
      quantity: 1,
      type: "custom",
      image: "/placeholder.svg?height=80&width=80",
    },
  ])

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shippingCost = formData.shippingMethod === "express" ? 12.99 : formData.shippingMethod === "standard" ? 5.99 : 0
  const tax = subtotal * 0.08
  const total = subtotal + shippingCost + tax

  const shippingOptions = [
    {
      id: "free",
      name: "Envío Estándar Gratis",
      description: "7-10 días hábiles",
      price: 0,
      available: subtotal >= 50,
    },
    {
      id: "standard",
      name: "Envío Estándar",
      description: "3-5 días hábiles",
      price: 5.99,
      available: true,
    },
    {
      id: "express",
      name: "Envío Express",
      description: "1-2 días hábiles",
      price: 12.99,
      available: true,
    },
  ]

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = () => {
    // Aquí iría la lógica de procesamiento del pago
    alert("¡Pedido procesado exitosamente!")
  }

  const steps = [
    { number: 1, title: "Información", icon: User },
    { number: 2, title: "Envío", icon: Truck },
    { number: 3, title: "Pago", icon: CreditCard },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/catalog">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Seguir Comprando</span>
                  <span className="sm:hidden">Volver</span>
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">P</span>
                </div>
                <span className="text-xl font-bold text-gray-800 hidden sm:inline">Publimpacto</span>
              </div>
            </div>

            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="text-gray-700 hover:text-blue-600 font-medium">
                Inicio
              </Link>
              <Link href="/catalog" className="text-gray-700 hover:text-blue-600 font-medium">
                Catálogo
              </Link>
              <Link href="/personalization" className="text-gray-700 hover:text-blue-600 font-medium">
                Personalización
              </Link>
            </nav>

            <div className="flex items-center space-x-2">
              <div className="hidden sm:block">
                <CartSidebar />
              </div>
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-4 sm:py-8">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-800 mb-2 sm:mb-4">Finalizar Compra</h1>
          <p className="text-gray-600 text-sm sm:text-lg">Completa tu información para procesar el pedido</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between max-w-md mx-auto">
            {steps.map((step, index) => {
              const StepIcon = step.icon
              const isActive = currentStep === step.number
              const isCompleted = currentStep > step.number

              return (
                <div key={step.number} className="flex items-center">
                  <div className={`flex flex-col items-center ${index < steps.length - 1 ? "flex-1" : ""}`}>
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                        isCompleted
                          ? "bg-green-500 border-green-500 text-white"
                          : isActive
                            ? "bg-blue-600 border-blue-600 text-white"
                            : "bg-gray-200 border-gray-300 text-gray-500"
                      }`}
                    >
                      {isCompleted ? <CheckCircle className="w-5 h-5" /> : <StepIcon className="w-5 h-5" />}
                    </div>
                    <span
                      className={`text-xs mt-1 font-medium ${
                        isActive ? "text-blue-600" : isCompleted ? "text-green-600" : "text-gray-500"
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 ${currentStep > step.number ? "bg-green-500" : "bg-gray-300"}`}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Formulario Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Paso 1: Información Personal */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Información Personal
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Nombre *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        placeholder="Tu nombre"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Apellidos *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        placeholder="Tus apellidos"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Correo Electrónico *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="tu@email.com"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder="+52 555 123 4567"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      Dirección de Envío
                    </h3>

                    <div className="space-y-2">
                      <Label htmlFor="address">Dirección *</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => handleInputChange("address", e.target.value)}
                        placeholder="Calle, número, colonia"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">Ciudad *</Label>
                        <Input
                          id="city"
                          value={formData.city}
                          onChange={(e) => handleInputChange("city", e.target.value)}
                          placeholder="Ciudad"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">Estado *</Label>
                        <Input
                          id="state"
                          value={formData.state}
                          onChange={(e) => handleInputChange("state", e.target.value)}
                          placeholder="Estado"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="zipCode">Código Postal *</Label>
                        <Input
                          id="zipCode"
                          value={formData.zipCode}
                          onChange={(e) => handleInputChange("zipCode", e.target.value)}
                          placeholder="12345"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="country">País</Label>
                        <Select value={formData.country} onValueChange={(value) => handleInputChange("country", value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="México">México</SelectItem>
                            <SelectItem value="Estados Unidos">Estados Unidos</SelectItem>
                            <SelectItem value="Canadá">Canadá</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Paso 2: Método de Envío */}
            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Truck className="w-5 h-5 mr-2" />
                    Método de Envío
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={formData.shippingMethod}
                    onValueChange={(value) => handleInputChange("shippingMethod", value)}
                    className="space-y-4"
                  >
                    {shippingOptions.map((option) => (
                      <div key={option.id} className={`border rounded-lg p-4 ${!option.available ? "opacity-50" : ""}`}>
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value={option.id} disabled={!option.available} />
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <h4 className="font-medium">{option.name}</h4>
                                <p className="text-sm text-gray-600">{option.description}</p>
                                {!option.available && (
                                  <p className="text-xs text-red-500 mt-1">Requiere compra mínima de $50</p>
                                )}
                              </div>
                              <div className="mt-2 sm:mt-0">
                                <span className="font-bold text-blue-600">
                                  {option.price === 0 ? "Gratis" : `$${option.price.toFixed(2)}`}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </RadioGroup>

                  <div className="mt-6 space-y-2">
                    <Label htmlFor="notes">Notas de Entrega (Opcional)</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => handleInputChange("notes", e.target.value)}
                      placeholder="Instrucciones especiales para la entrega..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Paso 3: Método de Pago */}
            {currentStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Método de Pago
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <RadioGroup
                    value={formData.paymentMethod}
                    onValueChange={(value) => handleInputChange("paymentMethod", value)}
                    className="space-y-4"
                  >
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="card" />
                        <div className="flex-1">
                          <h4 className="font-medium">Tarjeta de Crédito/Débito</h4>
                          <p className="text-sm text-gray-600">Visa, Mastercard, American Express</p>
                        </div>
                        <div className="flex space-x-2">
                          <div className="w-8 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center">
                            VISA
                          </div>
                          <div className="w-8 h-5 bg-red-600 rounded text-white text-xs flex items-center justify-center">
                            MC
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="paypal" />
                        <div className="flex-1">
                          <h4 className="font-medium">PayPal</h4>
                          <p className="text-sm text-gray-600">Paga con tu cuenta de PayPal</p>
                        </div>
                        <div className="w-16 h-8 bg-blue-500 rounded text-white text-xs flex items-center justify-center">
                          PayPal
                        </div>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="transfer" />
                        <div className="flex-1">
                          <h4 className="font-medium">Transferencia Bancaria</h4>
                          <p className="text-sm text-gray-600">SPEI, OXXO, tiendas de conveniencia</p>
                        </div>
                      </div>
                    </div>
                  </RadioGroup>

                  {formData.paymentMethod === "card" && (
                    <div className="space-y-4 border-t pt-4">
                      <div className="space-y-2">
                        <Label htmlFor="cardNumber">Número de Tarjeta *</Label>
                        <div className="relative">
                          <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            id="cardNumber"
                            value={formData.cardNumber}
                            onChange={(e) => handleInputChange("cardNumber", e.target.value)}
                            placeholder="1234 5678 9012 3456"
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cardName">Nombre en la Tarjeta *</Label>
                        <Input
                          id="cardName"
                          value={formData.cardName}
                          onChange={(e) => handleInputChange("cardName", e.target.value)}
                          placeholder="Nombre como aparece en la tarjeta"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="expiryDate">Fecha de Vencimiento *</Label>
                          <Input
                            id="expiryDate"
                            value={formData.expiryDate}
                            onChange={(e) => handleInputChange("expiryDate", e.target.value)}
                            placeholder="MM/AA"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cvv">CVV *</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                              id="cvv"
                              value={formData.cvv}
                              onChange={(e) => handleInputChange("cvv", e.target.value)}
                              placeholder="123"
                              className="pl-10"
                              maxLength={4}
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3 border-t pt-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="saveInfo"
                        checked={formData.saveInfo}
                        onCheckedChange={(checked) => handleInputChange("saveInfo", checked as boolean)}
                      />
                      <Label htmlFor="saveInfo" className="text-sm">
                        Guardar información para futuras compras
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="newsletter"
                        checked={formData.newsletter}
                        onCheckedChange={(checked) => handleInputChange("newsletter", checked as boolean)}
                      />
                      <Label htmlFor="newsletter" className="text-sm">
                        Suscribirme al newsletter para ofertas especiales
                      </Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Botones de Navegación */}
            <div className="flex flex-col sm:flex-row gap-4 sm:justify-between">
              <Button
                variant="outline"
                onClick={handlePrevStep}
                disabled={currentStep === 1}
                className="order-2 sm:order-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Anterior
              </Button>

              {currentStep < 3 ? (
                <Button
                  onClick={handleNextStep}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 order-1 sm:order-2"
                >
                  Siguiente
                  <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 order-1 sm:order-2"
                  size="lg"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Finalizar Compra
                </Button>
              )}
            </div>
          </div>

          {/* Resumen del Pedido */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Resumen del Pedido
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Productos */}
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="relative">
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          width={50}
                          height={50}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                          {item.quantity}
                        </Badge>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{item.name}</h4>
                        {item.type === "custom" && (
                          <Badge variant="secondary" className="text-xs mt-1">
                            Personalizado
                          </Badge>
                        )}
                      </div>
                      <span className="font-semibold text-sm">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Cálculos */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} productos)</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Envío</span>
                    <span>{shippingCost === 0 ? "Gratis" : `$${shippingCost.toFixed(2)}`}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Impuestos (8%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-blue-600">${total.toFixed(2)}</span>
                </div>

                {/* Información de Seguridad */}
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="flex items-center text-green-700 text-sm">
                    <Lock className="w-4 h-4 mr-2" />
                    <span>Compra 100% segura y protegida</span>
                  </div>
                </div>

                {/* Información de Envío */}
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-center text-blue-700 text-sm mb-2">
                    <Truck className="w-4 h-4 mr-2" />
                    <span>Información de Envío</span>
                  </div>
                  <ul className="text-xs text-blue-600 space-y-1">
                    <li>• Envío gratis en pedidos mayores a $50</li>
                    <li>• Seguimiento incluido</li>
                    <li>• Empaque ecológico</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
