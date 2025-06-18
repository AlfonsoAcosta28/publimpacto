"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import {
  Search,
  MoreHorizontal,
  Percent,
  Package,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

import { categoryService } from '@/services/categoryService';
import Swal from 'sweetalert2';
import { ProductImageDisplay } from "@/components/ProductImageDisplay";
import { Product, Category } from '@/interfaces/Product';
import productService from "@/services/productService"
import servicesService from "@/services/servicesService"
import { Service, ServiceOption, ServiceInventory } from "@/interfaces/Service"
import serviceInventoryService from "@/services/serviceInventoryService"


// Plantillas predefinidas de servicios
const SERVICE_TEMPLATES: { [key: string]: ServiceOption[] } = {
  'DTF': [
    { name: 'ancho', input_type: 'text', options: ['58'] },
    { name: 'largo', input_type: 'text' },
    { name: 'archivo', input_type: 'file' }
  ],
  'Bordado': [
    { name: 'ancho', input_type: 'text' },
    { name: 'largo', input_type: 'text' },
    { name: 'archivo', input_type: 'file' }
  ],
  'Lona': [
    { name: 'ancho', input_type: 'text' },
    { name: 'largo', input_type: 'text' },
    { name: 'archivo', input_type: 'file' }
  ],
  'Impresión de vinil': [
    { name: 'ancho', input_type: 'text' },
    { name: 'largo', input_type: 'text' },
    { name: 'archivo', input_type: 'file' }
  ],
  'Corte de vinil': [
    { name: 'ancho', input_type: 'text' },
    { name: 'largo', input_type: 'text' },
    { name: 'archivo', input_type: 'file' }
  ],
  'Grabado láser': [
    { name: 'ancho', input_type: 'text' },
    { name: 'largo', input_type: 'text' },
    { name: 'archivo', input_type: 'file' },
    { name: 'producto', input_type: 'text' }
  ],
  'Perifoneo': [
    { name: 'dias', input_type: 'select', options: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'] },
    { name: 'horario', input_type: 'time' },
    { name: 'archivo', input_type: 'file' }
  ],
  'Tazas personalizadas': [
    { name: 'archivo', input_type: 'file' },
    { name: 'cantidad', input_type: 'number' },
    { name: 'tipo_taza', input_type: 'select', options: ['normal', 'mágica'] }
  ],
  'Camisas personalizadas': [
    { name: 'archivo', input_type: 'file' },
    { name: 'color', input_type: 'select', options: ['Blanco', 'Negro', 'Azul', 'Rojo', 'Verde', 'Amarillo', 'Gris', 'Rosa', 'Naranja', 'Morado'] },
    { name: 'talla', input_type: 'select', options: ['S', 'M', 'L', 'XL', 'XXL'] },
    { name: 'cantidad', input_type: 'number' }
  ]
};

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [currentService, setCurrentService] = useState<Service | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | File[] | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDiscountOpen, setIsDiscountOpen] = useState(false);
  const [selectedServiceForDiscount, setSelectedServiceForDiscount] = useState<Service | null>(null);
  const [selectedServiceType, setSelectedServiceType] = useState<string>('');
  const [serviceOptions, setServiceOptions] = useState<ServiceOption[]>([]);
  
  // Estados para inventario
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [selectedServiceForInventory, setSelectedServiceForInventory] = useState<Service | null>(null);
  const [serviceInventory, setServiceInventory] = useState<ServiceInventory[]>([]);
  const [isAddingInventory, setIsAddingInventory] = useState(false);

  const handleServiceTypeChange = (serviceType: string) => {
    setSelectedServiceType(serviceType);
    setServiceOptions(SERVICE_TEMPLATES[serviceType] || []);
  };

  // Inicializar opciones cuando se está editando un servicio
  useEffect(() => {
    if (currentService) {
      setSelectedServiceType(currentService.name);
      setServiceOptions(SERVICE_TEMPLATES[currentService.name] || []);
    } else {
      setSelectedServiceType('');
      setServiceOptions([]);
    }
  }, [currentService]);

  // Función para abrir el modal de inventario
  const handleOpenInventory = async (service: Service) => {
    try {
      setSelectedServiceForInventory(service);
      setIsInventoryOpen(true);
      
      // Cargar el inventario del servicio
      const inventory = await serviceInventoryService.getServiceInventory(service.id!);
      setServiceInventory(inventory);
    } catch (error) {
      console.error('Error al cargar inventario:', error);
      Swal.fire({
        title: "Error",
        text: "No se pudo cargar el inventario",
        icon: "error",
        timer: 1500
      });
    }
  };

  // Función para agregar item al inventario
  const handleAddInventoryItem = async (formData: FormData) => {
    try {
      if (!selectedServiceForInventory) return;

      const item = {
        variant_name: formData.get('variant_name') as string,
        quantity: parseInt(formData.get('quantity') as string),
        price_modifier: parseFloat(formData.get('price_modifier') as string) || 0
      };

      await serviceInventoryService.addInventoryItem(selectedServiceForInventory.id!, item);
      
      // Recargar inventario
      const inventory = await serviceInventoryService.getServiceInventory(selectedServiceForInventory.id!);
      setServiceInventory(inventory);

      Swal.fire({
        title: "Éxito",
        text: "Item agregado al inventario",
        icon: "success",
        timer: 1500
      });
    } catch (error) {
      console.error('Error al agregar item:', error);
      Swal.fire({
        title: "Error",
        text: "No se pudo agregar el item",
        icon: "error",
        timer: 1500
      });
    }
  };

  // Función para eliminar item del inventario
  const handleDeleteInventoryItem = async (itemId: number) => {
    try {
      const result = await Swal.fire({
        title: "¿Estás seguro?",
        text: "No podrás revertir esta acción",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar"
      });

      if (result.isConfirmed) {
        await serviceInventoryService.deleteInventoryItem(itemId);
        
        // Recargar inventario
        if (selectedServiceForInventory) {
          const inventory = await serviceInventoryService.getServiceInventory(selectedServiceForInventory.id!);
          setServiceInventory(inventory);
        }

        Swal.fire({
          title: "Eliminado",
          text: "Item eliminado correctamente",
          icon: "success",
          timer: 1500
        });
      }
    } catch (error) {
      console.error('Error al eliminar item:', error);
      Swal.fire({
        title: "Error",
        text: "No se pudo eliminar el item",
        icon: "error",
        timer: 1500
      });
    }
  };

  // Cargar servicios al montar el componente
  useEffect(() => {
    const fetchServices = async () => {
      try {
        console.log('Cargando servicios al montar componente...');
        const servicesData = await servicesService.getAllServices();
        console.log('Servicios cargados:', servicesData);
        setServices(servicesData);
      } catch (error) {
        console.error('Error al cargar servicios:', error);
        
        let errorMessage = "No se pudieron cargar los servicios";
        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (typeof error === 'object' && error !== null && 'message' in error) {
          errorMessage = (error as any).message;
        }
        
        Swal.fire({
          title: "Error",
          text: errorMessage,
          icon: "error",
          timer: 3000,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const handleCreateService = async (formData: FormData) => {
    try {
      console.log('Iniciando creación de servicio...');
      
      const serviceName = formData.get('name') as string;
      const serviceData: Service = {
        name: serviceName,
        description: formData.get('description') as string,
        base_price: parseFloat(formData.get('base_price') as string),
        options: SERVICE_TEMPLATES[serviceName] || []
      };

      const mainImage = formData.get('mainImage') as File;
      const secondaryImages = formData.getAll('secondaryImages') as File[];

      if (!mainImage || mainImage.size === 0) {
        Swal.fire({
          title: "Error",
          text: "Por favor selecciona una imagen principal",
          icon: "error",
          timer: 1500
        });
        return;
      }

      console.log('Llamando a createService...');
      const createdService = await servicesService.createService(serviceData, mainImage, secondaryImages);
      console.log('Servicio creado:', createdService);

      console.log('Actualizando lista de servicios...');
      const updatedServices = await servicesService.getAllServices();
      console.log('Servicios actualizados:', updatedServices);
      
      setServices(updatedServices);
      setIsOpen(false);

      Swal.fire({
        title: "Éxito",
        text: "Servicio creado correctamente",
        icon: "success",
        timer: 1500
      });
    } catch (error) {
      console.error('Error completo al crear servicio:', error);
      
      // Mostrar error más específico
      let errorMessage = "No se pudo crear el servicio";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
        errorMessage = (error as any).message;
      }
      
      Swal.fire({
        title: "Error",
        text: errorMessage,
        icon: "error",
        timer: 3000
      });
    }
  };

  const handleEditService = async (formData: FormData) => {
    try {
      if (!currentService) return;

      const serviceName = formData.get('name') as string;
      const serviceData: Service = {
        name: serviceName,
        description: formData.get('description') as string,
        base_price: parseFloat(formData.get('base_price') as string),
        options: SERVICE_TEMPLATES[serviceName] || []
      };

      const mainImage = formData.get('mainImage') as File;
      const secondaryImages = formData.getAll('secondaryImages') as File[];

      const hasMainImage = mainImage && mainImage.size > 0;
      const hasSecondaryImages = secondaryImages && secondaryImages.length > 0 && 
        secondaryImages.some(img => img.size > 0);

      await servicesService.updateService(
        currentService.id!,
        serviceData,
        hasMainImage ? mainImage : undefined,
        hasSecondaryImages ? secondaryImages : undefined
      );

      const updatedServices = await servicesService.getAllServices();
      setServices(updatedServices);
      setIsOpen(false);
      setCurrentService(null);

      Swal.fire({
        title: "Éxito",
        text: "Servicio actualizado correctamente",
        icon: "success",
        timer: 1500
      });
    } catch (error) {
      console.error('Error al actualizar servicio:', error);
      Swal.fire({
        title: "Error",
        text: "No se pudo actualizar el servicio",
        icon: "error",
        timer: 1500
      });
    }
  };

  const handleDeleteService = async (id: number) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "No podrás revertir esta acción",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar"
    });

    if (result.isConfirmed) {
      try {
        await servicesService.deleteService(id);
        setServices(services.filter(service => service.id !== id));
        Swal.fire({
          title: "Eliminado",
          text: "Servicio eliminado correctamente",
          icon: "success",
          timer: 1500
        });
      } catch (error) {
        console.error('Error al eliminar servicio:', error);
        Swal.fire({
          title: "Error",
          text: "No se pudo eliminar el servicio",
          icon: "error",
          timer: 1500
        });
      }
    }
  };

  const handleApplyDiscount = async (formData: FormData) => {
    try {
      if (!selectedServiceForDiscount) return;

      const discountType = formData.get('discountType') as 'percentage' | 'price';
      const value = parseFloat(formData.get('value') as string);

      await servicesService.applyDiscount(
        selectedServiceForDiscount.id!,
        discountType,
        value
      );

      const updatedServices = await servicesService.getAllServices();
      setServices(updatedServices);
      setIsDiscountOpen(false);
      setSelectedServiceForDiscount(null);

      Swal.fire({
        title: "Éxito",
        text: "Descuento aplicado correctamente",
        icon: "success",
        timer: 1500
      });
    } catch (error) {
      console.error('Error al aplicar descuento:', error);
      Swal.fire({
        title: "Error",
        text: "No se pudo aplicar el descuento",
        icon: "error",
        timer: 1500
      });
    }
  };

  const handleRemoveDiscount = async (id: number) => {
    try {
      await servicesService.removeDiscount(id);
      const updatedServices = await servicesService.getAllServices();
      setServices(updatedServices);
      Swal.fire({
        title: "Éxito",
        text: "Descuento eliminado correctamente",
        icon: "success",
        timer: 1500
      });
    } catch (error) {
      console.error('Error al eliminar descuento:', error);
      Swal.fire({
        title: "Error",
        text: "No se pudo eliminar el descuento",
        icon: "error",
        timer: 1500
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Gestión de Servicios</h2>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button className="mb-6" onClick={() => {
            setCurrentService(null);
            setIsOpen(true);
          }}>
            Crear Nuevo Servicio
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <form onSubmit={async (e) => {
            e.preventDefault();
            setIsSubmitting(true);
            try {
              const formData = new FormData(e.currentTarget);
              if (currentService) {
                await handleEditService(formData);
              } else {
                await handleCreateService(formData);
              }
            } catch (error) {
              console.error('Error en el formulario:', error);
              Swal.fire({
                title: "Error",
                text: "Hubo un error al procesar el formulario",
                icon: "error",
                timer: 1500
              });
            } finally {
              setIsSubmitting(false);
            }
          }}>
            <DialogHeader className="top-0 bg-white z-10 pb-4 border-b">
              <DialogTitle>{currentService ? 'Editar Servicio' : 'Crear Nuevo Servicio'}</DialogTitle>
              <DialogDescription>
                {currentService ? 'Modifica los detalles del servicio.' : 'Completa los detalles para añadir un nuevo servicio.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Nombre</Label>
                <Select 
                  name="name" 
                  defaultValue={currentService?.name}
                  onValueChange={handleServiceTypeChange}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecciona un tipo de servicio" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(SERVICE_TEMPLATES).map((serviceName) => (
                      <SelectItem key={serviceName} value={serviceName}>
                        {serviceName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Mostrar opciones del servicio seleccionado */}
              {serviceOptions.length > 0 && (
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label className="text-right">Opciones del Servicio</Label>
                  <div className="col-span-3">
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                      <h4 className="font-medium mb-3 text-blue-800">Campos requeridos para "{selectedServiceType}":</h4>
                      <div className="space-y-3">
                        {serviceOptions.map((option, index) => (
                          <div key={index} className="flex items-center gap-3 text-sm bg-white p-2 rounded border">
                            <Badge variant="secondary" className="text-xs">
                              {option.input_type === 'text' && 'Texto'}
                              {option.input_type === 'number' && 'Número'}
                              {option.input_type === 'select' && 'Selección'}
                              {option.input_type === 'file' && 'Archivo'}
                              {option.input_type === 'time' && 'Hora'}
                            </Badge>
                            <span className="font-medium text-gray-800">{option.name}</span>
                            {option.options && option.input_type === 'select' && (
                              <span className="text-gray-600 text-xs">
                                Opciones: {option.options.join(', ')}
                              </span>
                            )}
                            {option.options && option.input_type === 'text' && (
                              <span className="text-gray-600 text-xs">
                                Valor sugerido: {option.options[0]}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-blue-600 mt-3">
                        💡 Estos campos se mostrarán al cliente cuando solicite este servicio
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="base_price" className="text-right">Precio Base</Label>
                <Input
                  id="base_price"
                  name="base_price"
                  type="number"
                  step="0.01"
                  defaultValue={currentService?.base_price || ''}
                  placeholder="Precio base del servicio"
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">Descripción</Label>
                <textarea
                  id="description"
                  name="description"
                  defaultValue={currentService?.description || ''}
                  placeholder="Descripción del servicio"
                  className="col-span-3 min-h-[100px] w-full border rounded-md p-2"
                  required
                />
              </div>
              {currentService && currentService.images && (
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label className="text-right">Imágenes Actuales</Label>
                  <div className="col-span-3">
                    <ProductImageDisplay images={currentService.images} />
                  </div>
                </div>
              )}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="mainImage" className="text-right">
                  {currentService ? 'Cambiar Imagen Principal' : 'Imagen Principal'}
                </Label>
                <Input
                  id="mainImage"
                  name="mainImage"
                  type="file"
                  className="col-span-3"
                  onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
                  required={!currentService}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="secondaryImages" className="text-right">
                  {currentService ? 'Cambiar Imágenes Secundarias' : 'Imágenes Secundarias'}
                </Label>
                <Input
                  id="secondaryImages"
                  name="secondaryImages"
                  type="file"
                  multiple
                  className="col-span-3"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length > 4) {
                      Swal.fire({
                        title: "Error",
                        text: "Solo se permiten hasta 4 imágenes secundarias",
                        icon: "error",
                        timer: 1500
                      });
                      e.target.value = '';
                    } else {
                      setSelectedImage(files);
                    }
                  }}
                />
              </div>
            </div>
            <DialogFooter className="bottom-0 bg-white z-10 pt-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <span className="flex items-center">
                    <span className="animate-spin mr-2">⏳</span>
                    Procesando...
                  </span>
                ) : (
                  `${currentService ? 'Actualizar' : 'Guardar'} Servicio`
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Card className="mb-6">
        <CardHeader className="p-4 pb-0">
          <CardTitle className="text-base font-medium">Lista de Servicios</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row justify-between mb-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar servicio por nombre"
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full md:w-[400px] text-sm"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Imagen</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Precio Base</TableHead>
                  <TableHead>Descuento</TableHead>
                  <TableHead>Precio Final</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell className="font-medium">#{service.id}</TableCell>
                    <TableCell>
                      <div className="h-10 w-10 rounded overflow-hidden">
                        <Image
                          src={service.images?.find(img => img.is_primary)?.image_url || '/placeholder.svg'}
                          alt={service.name}
                          width={40}
                          height={40}
                          className="object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder.svg';
                          }}
                        />
                      </div>
                    </TableCell>
                    <TableCell>{service.name}</TableCell>
                    <TableCell>${service.base_price}</TableCell>
                    <TableCell>
                      {service.discount_percentage && service.discount_percentage > 0 ? (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <Percent className="h-3 w-3" />
                          {Number(service.discount_percentage).toFixed(0)}%
                        </Badge>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      {service.discount_percentage ? (
                        <span className="font-medium">
                          ${(service.base_price * (1 - service.discount_percentage / 100)).toFixed(2)}
                        </span>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            setCurrentService(service);
                            setIsOpen(true);
                          }}>
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleOpenInventory(service)}>
                            <Package className="h-4 w-4 mr-2" />
                            Gestionar Inventario
                          </DropdownMenuItem>
                          {Number(service.discount_percentage) > 0 ? (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleRemoveDiscount(service.id!)}
                              >
                                Eliminar Descuento
                              </DropdownMenuItem>
                            </>
                          ) : (
                            <>
                              <DropdownMenuItem onClick={() => {
                                setSelectedServiceForDiscount(service);
                                setIsDiscountOpen(true);
                              }}>
                                Agregar Descuento
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                            </>
                          )}
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeleteService(service.id!)}
                          >
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Diálogo de Descuento */}
      <Dialog open={isDiscountOpen} onOpenChange={setIsDiscountOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={async (e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            await handleApplyDiscount(formData);
          }}>
            <DialogHeader>
              <DialogTitle>Aplicar Descuento</DialogTitle>
              <DialogDescription>
                Aplica un descuento al servicio {selectedServiceForDiscount?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="discountType" className="text-right">Tipo</Label>
                <Select name="discountType" defaultValue="percentage">
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecciona el tipo de descuento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Porcentaje</SelectItem>
                    <SelectItem value="price">Precio Final</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="value" className="text-right">Valor</Label>
                <Input
                  id="value"
                  name="value"
                  type="number"
                  step="0.01"
                  placeholder="Ingresa el valor"
                  className="col-span-3"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Aplicar Descuento</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Inventario */}
      <Dialog open={isInventoryOpen} onOpenChange={setIsInventoryOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gestionar Inventario - {selectedServiceForInventory?.name}</DialogTitle>
            <DialogDescription>
              Agrega y gestiona el inventario disponible para este servicio
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Formulario para agregar item */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-3">Agregar Nuevo Item</h4>
              <form onSubmit={async (e) => {
                e.preventDefault();
                setIsAddingInventory(true);
                try {
                  const formData = new FormData(e.currentTarget);
                  await handleAddInventoryItem(formData);
                  (e.target as HTMLFormElement).reset();
                } finally {
                  setIsAddingInventory(false);
                }
              }}>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="variant_name">Variante</Label>
                    <Input
                      id="variant_name"
                      name="variant_name"
                      placeholder="ej: Camisa Blanca S, Taza Normal"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="quantity">Cantidad</Label>
                    <Input
                      id="quantity"
                      name="quantity"
                      type="number"
                      min="0"
                      placeholder="0"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="price_modifier">Precio Adicional</Label>
                    <Input
                      id="price_modifier"
                      name="price_modifier"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <Button type="submit" className="mt-3" disabled={isAddingInventory}>
                  {isAddingInventory ? 'Agregando...' : 'Agregar Item'}
                </Button>
              </form>
            </div>

            {/* Tabla de inventario */}
            <div>
              <h4 className="font-medium mb-3">Inventario Actual</h4>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Variante</TableHead>
                      <TableHead>Cantidad</TableHead>
                      <TableHead>Precio Adicional</TableHead>
                      <TableHead>Precio Total</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {serviceInventory.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                          No hay items en el inventario
                        </TableCell>
                      </TableRow>
                    ) : (
                      serviceInventory.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.variant_name}</TableCell>
                          <TableCell>
                            <Badge variant={item.quantity > 0 ? "default" : "destructive"}>
                              {item.quantity}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {item.price_modifier && item.price_modifier > 0 ? (
                              <span className="text-green-600">+${item.price_modifier}</span>
                            ) : item.price_modifier && item.price_modifier < 0 ? (
                              <span className="text-red-600">${item.price_modifier}</span>
                            ) : (
                              <span className="text-gray-500">$0.00</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">
                              ${(Number(selectedServiceForInventory?.base_price) || 0) + (Number(item.price_modifier) || 0)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteInventoryItem(item.id!)}
                              className="text-red-600 hover:text-red-700"
                            >
                              Eliminar
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}