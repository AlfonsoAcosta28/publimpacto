"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
} from "@/components/ui/dialog"
import { Search, Package, Clock, DollarSign } from "lucide-react"
import Swal from 'sweetalert2'
import { serviceOrderService } from '@/services/serviceOrderService'
import { servicesService } from '@/services/servicesService'
import { Service } from "@/interfaces/Service"
import { useRouter } from "next/navigation"

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [orderForm, setOrderForm] = useState<any>({});
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

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

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setOrderForm({});
    setIsOrderOpen(true);
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedService) {
      Swal.fire({
        title: "Error",
        text: "Por favor selecciona un servicio",
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
        total_price: selectedService.base_price,
        comments: orderForm.comments || '',
      };

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
    } catch (error: any) {
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
          <Card key={service.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push(`/services/${service.id}`)}>
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
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <CardTitle className="text-lg mb-2">{service.name}</CardTitle>
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {service.short_description}
              </p>
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="font-semibold text-lg">
                    {service.base_price}
                  </span>
                </div>
              </div>
              <Button 
                onClick={() => router.push(`/services/${service.id}`)}
                className="w-full hover:bg-blue-700"
              >
                Ver mas
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
