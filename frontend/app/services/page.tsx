"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Search, Package, Clock, DollarSign } from "lucide-react"
import Swal from 'sweetalert2'
import { serviceOrderService } from '@/services/serviceOrderService'
import { servicesService } from '@/services/servicesService'

interface Service {
  id: number;
  name: string;
  description: string;
  base_price: number;
  discount_percentage?: number;
  options: ServiceOption[];
  images?: {
    id: number;
    image_url: string;
    is_primary: boolean;
  }[];
  inventory?: ServiceInventory[];
}

interface ServiceOption {
  name: string;
  input_type: 'text' | 'number' | 'select' | 'file' | 'time';
  options?: string[];
}

interface ServiceInventory {
  id: number;
  variant_name: string;
  quantity: number;
  price_modifier: number;
  is_active: boolean;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [orderForm, setOrderForm] = useState<any>({});
  const [selectedVariant, setSelectedVariant] = useState<ServiceInventory | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Cargar servicios al montar el componente
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await servicesService.getAllServices();
        setServices(data);
      } catch (error) {
        console.error('Error al cargar servicios:', error);
        Swal.fire({
          title: "Error",
          text: "No se pudieron cargar los servicios",
          icon: "error",
          timer: 1500,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Cargar inventario cuando se selecciona un servicio
  useEffect(() => {
    const fetchInventory = async () => {
      if (selectedService) {
        try {
          const inventory = await servicesService.getServiceInventory(selectedService.id);
          setSelectedService(prev => prev ? { ...prev, inventory } : null);
        } catch (error) {
          console.error('Error al cargar inventario:', error);
        }
      }
    };

    fetchInventory();
  }, [selectedService?.id]);

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setOrderForm({});
    setSelectedVariant(null);
    setIsOrderOpen(true);
  };

  const handleVariantSelect = (variant: ServiceInventory) => {
    setSelectedVariant(variant);
    setOrderForm(prev => ({
      ...prev,
      variant: variant.variant_name,
      price: selectedService!.base_price + variant.price_modifier
    }));
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedService || !selectedVariant) {
      Swal.fire({
        title: "Error",
        text: "Por favor selecciona una variante del servicio",
        icon: "error",
        timer: 1500,
      });
      return;
    }

    // Validar campos requeridos
    if (!orderForm.name || !orderForm.email || !orderForm.phone) {
      Swal.fire({
        title: "Error",
        text: "Por favor completa todos los campos requeridos",
        icon: "error",
        timer: 1500,
      });
      return;
    }

    try {
      // Preparar los datos de la orden
      const orderData = {
        customer_name: orderForm.name,
        customer_email: orderForm.email,
        customer_phone: orderForm.phone,
        service_id: selectedService.id,
        variant_id: selectedVariant.id,
        total_price: selectedService.base_price + selectedVariant.price_modifier,
        comments: orderForm.comments || '',
        service_options: {}
      };

      // Agregar las opciones del servicio al objeto service_options
      if (selectedService.options) {
        selectedService.options.forEach(option => {
          if (orderForm[option.name]) {
            orderData.service_options[option.name] = orderForm[option.name];
          }
        });
      }

      // Enviar la orden al backend
      const result = await serviceOrderService.createOrder(orderData);

      Swal.fire({
        title: "¡Pedido enviado exitosamente!",
        text: `Tu orden #${result.id} ha sido creada. Nos pondremos en contacto contigo pronto.`,
        icon: "success",
        timer: 3000,
      });
      
      setIsOrderOpen(false);
      setSelectedService(null);
      setOrderForm({});
      setSelectedVariant(null);
    } catch (error) {
      console.error('Error al enviar pedido:', error);
      Swal.fire({
        title: "Error",
        text: error.message || "No se pudo enviar el pedido",
        icon: "error",
        timer: 2000,
      });
    }
  };

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Nuestros Servicios</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Ofrecemos una amplia gama de servicios de impresión y personalización. 
          Encuentra el servicio perfecto para tus necesidades.
        </p>
      </div>

      {/* Barra de búsqueda */}
      <div className="mb-8">
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar servicios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Grid de servicios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((service) => (
          <Card key={service.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="p-0">
              <div className="relative h-48 w-full">
                <Image
                  src={service.images?.find(img => img.is_primary)?.image_url || '/placeholder.svg'}
                  alt={service.name}
                  fill
                  className="object-cover rounded-t-lg"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.svg';
                  }}
                />
                {service.discount_percentage && service.discount_percentage > 0 && (
                  <Badge variant="destructive" className="absolute top-2 right-2">
                    -{Number(service.discount_percentage).toFixed(0)}%
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <CardTitle className="text-lg mb-2">{service.name}</CardTitle>
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {service.description}
              </p>
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="font-semibold text-lg">
                    ${service.discount_percentage ? 
                      (service.base_price * (1 - service.discount_percentage / 100)).toFixed(2) : 
                      service.base_price}
                  </span>
                  {service.discount_percentage && (
                    <span className="text-sm text-gray-500 line-through">
                      ${service.base_price}
                    </span>
                  )}
                </div>
                {service.inventory && service.inventory.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Package className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-gray-600">
                      {service.inventory.length} variantes
                    </span>
                  </div>
                )}
              </div>

              <Button 
                onClick={() => handleServiceSelect(service)}
                className="w-full"
              >
                Solicitar Servicio
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal de pedido */}
      <Dialog open={isOrderOpen} onOpenChange={setIsOrderOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Solicitar {selectedService?.name}</DialogTitle>
            <DialogDescription>
              Completa los detalles para solicitar este servicio
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleOrderSubmit} className="space-y-4">
            {/* Información del servicio */}
            {selectedService && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Información del Servicio</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Precio base:</span>
                    <span className="ml-2 font-medium">${selectedService.base_price}</span>
                  </div>
                  {selectedService.discount_percentage && (
                    <div>
                      <span className="text-gray-600">Descuento:</span>
                      <span className="ml-2 font-medium text-green-600">
                        -{Number(selectedService.discount_percentage).toFixed(0)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Selección de variante */}
            {selectedService?.inventory && selectedService.inventory.length > 0 && (
              <div>
                <Label>Selecciona una variante</Label>
                <div className="grid grid-cols-1 gap-2 mt-2">
                  {selectedService.inventory.map((variant) => (
                    <div
                      key={variant.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedVariant?.id === variant.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleVariantSelect(variant)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{variant.variant_name}</div>
                          <div className="text-sm text-gray-600">
                            Stock: {variant.quantity} unidades
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            ${Number(selectedService.base_price).toFixed(2) + Number(variant.price_modifier).toFixed(2)}
                          </div>
                          {variant.price_modifier > 0 && (
                            <div className="text-xs text-green-600">
                              +${variant.price_modifier}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Campos dinámicos del servicio */}
            {selectedService?.options && selectedService.options.length > 0 && (
              <div>
                <Label>Detalles del servicio</Label>
                <div className="space-y-3 mt-2">
                  {selectedService.options.map((option, index) => (
                    <div key={index}>
                      <Label htmlFor={`option-${index}`} className="text-sm">
                        {option.name}
                        {option.input_type === 'file' && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </Label>
                      
                      {option.input_type === 'text' && (
                        <Input
                          id={`option-${index}`}
                          placeholder={option.options?.[0] || `Ingresa ${option.name}`}
                          value={orderForm[option.name] || ''}
                          onChange={(e) => setOrderForm(prev => ({
                            ...prev,
                            [option.name]: e.target.value
                          }))}
                        />
                      )}
                      
                      {option.input_type === 'number' && (
                        <Input
                          id={`option-${index}`}
                          type="number"
                          min="1"
                          placeholder="Cantidad"
                          value={orderForm[option.name] || ''}
                          onChange={(e) => setOrderForm(prev => ({
                            ...prev,
                            [option.name]: e.target.value
                          }))}
                        />
                      )}
                      
                      {option.input_type === 'select' && (
                        <Select
                          value={orderForm[option.name] || ''}
                          onValueChange={(value) => setOrderForm(prev => ({
                            ...prev,
                            [option.name]: value
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={`Selecciona ${option.name}`} />
                          </SelectTrigger>
                          <SelectContent>
                            {option.options?.map((opt) => (
                              <SelectItem key={opt} value={opt}>
                                {opt}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      
                      {option.input_type === 'file' && (
                        <Input
                          id={`option-${index}`}
                          type="file"
                          accept="image/*,.pdf,.doc,.docx"
                          onChange={(e) => setOrderForm(prev => ({
                            ...prev,
                            [option.name]: e.target.files?.[0]
                          }))}
                        />
                      )}
                      
                      {option.input_type === 'time' && (
                        <Input
                          id={`option-${index}`}
                          type="time"
                          value={orderForm[option.name] || ''}
                          onChange={(e) => setOrderForm(prev => ({
                            ...prev,
                            [option.name]: e.target.value
                          }))}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Información de contacto */}
            <div>
              <Label>Información de contacto</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <Input
                  placeholder="Nombre completo"
                  value={orderForm.name || ''}
                  onChange={(e) => setOrderForm(prev => ({
                    ...prev,
                    name: e.target.value
                  }))}
                  required
                />
                <Input
                  placeholder="Teléfono"
                  value={orderForm.phone || ''}
                  onChange={(e) => setOrderForm(prev => ({
                    ...prev,
                    phone: e.target.value
                  }))}
                  required
                />
              </div>
              <Input
                placeholder="Email"
                type="email"
                className="mt-3"
                value={orderForm.email || ''}
                onChange={(e) => setOrderForm(prev => ({
                  ...prev,
                  email: e.target.value
                }))}
                required
              />
            </div>

            {/* Comentarios adicionales */}
            <div>
              <Label>Comentarios adicionales (opcional)</Label>
              <Textarea
                placeholder="Describe cualquier detalle específico o requerimiento especial..."
                value={orderForm.comments || ''}
                onChange={(e) => setOrderForm(prev => ({
                  ...prev,
                  comments: e.target.value
                }))}
                className="mt-2"
                rows={3}
              />
            </div>

            {/* Resumen del pedido */}
            {selectedVariant && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Resumen del pedido</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Servicio:</span>
                    <span>{selectedService?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Variante:</span>
                    <span>{selectedVariant.variant_name}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Precio total:</span>
                    <span>${(selectedService!.base_price + selectedVariant.price_modifier).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOrderOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                Enviar Solicitud
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
