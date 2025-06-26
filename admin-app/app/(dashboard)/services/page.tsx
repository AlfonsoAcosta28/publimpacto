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
import { Service } from "@/interfaces/Service"
import serviceInventoryService from "@/services/serviceInventoryService"

// Lista de emojis sugeridos para iconos
const EMOJI_LIST = [
  "🎨", // diseño gráfico
  "🖌️", // pincel para diseño o arte
  "🖍️", // crayones (creatividad, bocetos)
  "🖋️", // pluma estilográfica
  "✏️", // lápiz (bocetos, correcciones)
  "📐", // reglas, precisión en cortes
  "📏", // medida y exactitud
  "📸", // fotografía de productos
  "🖼️", // imagen, arte final
  "🖨️", // impresora
  "📇", // tarjetas impresas
  "🏷️", // etiquetas
  "🎁", // empaques
  "📦", // entrega de productos
  "🚚", // envío, logística
  "⚙️", // maquinaria de impresión o corte
  "🔧", // ajustes personalizados
  "🧵", // bordado
  "🧶", // hilos decorativos
  "👕", // camisetas
  "🧢", // gorras
  "🧥", // ropa personalizada
  "🎽", // camisetas deportivas
  "👜", // bolsas promocionales
  "🎒", // mochilas
  "📣", // marketing BTL
  "📢", // perifoneo
  "💬", // atención al cliente
  "⭐", // calidad, reputación
  "💎", // excelencia
  "🔥", // diseños llamativos
  "⚡", // rapidez
  "🛡️", // garantía, confianza
  "🔒", // protección de marca
  "🔄", // cambios, revisiones
  "💡", // ideas creativas
  "🧠", // estrategia y diseño inteligente
  "🧰", // herramientas de diseño
  "📊", // resultados de campañas
  "🗂️", // portafolio de servicios
  "🧾", // cotizaciones
  "💰", // precios accesibles
  "🎯", // objetivo cumplido
  "✅", // cumplimiento
  "📍", // ubicación
  "📞", // contacto
  "⌛", // entrega puntual
  "📆", // plazos programados
  "🤝", // trato con el cliente
  "🧑‍🎨", // diseñador
  "🏭", // planta o taller de producción
  "📋", // checklist de producción
  "🚀", // lanzamientos promocionales
  "🌟", // destacado
];


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

  // Estados para inventario
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [selectedServiceForInventory, setSelectedServiceForInventory] = useState<Service | null>(null);
  const [isAddingInventory, setIsAddingInventory] = useState(false);

  // Estados para features y applications
  const [features, setFeatures] = useState<{ icon: string; title: string; desc: string }[]>([]);
  const [applications, setApplications] = useState<string[]>([]);

  const handleServiceTypeChange = (serviceType: string) => {
    setSelectedServiceType(serviceType);
  };

  // Inicializar opciones cuando se está editando un servicio
  useEffect(() => {
    if (currentService) {
      setSelectedServiceType(currentService.name);
      setFeatures(currentService.features || []);
      setApplications(currentService.applications || []);
    } else {
      setSelectedServiceType('');
      setFeatures([]);
      setApplications([]);
    }
  }, [currentService]);


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
        short_description: formData.get('short_description') as string,
        base_price: parseFloat(formData.get('base_price') as string),
        features,
        applications,
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
        short_description: formData.get('short_description') as string,
        base_price: parseFloat(formData.get('base_price') as string),
        features,
        applications,
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
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <form onSubmit={async (e) => {
            e.preventDefault();
            setIsSubmitting(true);
            // Validación de features y applications
            const hasEmptyFeature = features.some(f => !f.title.trim() || !f.desc.trim());
            const hasEmptyApplication = applications.some(a => !a.trim());
            if (hasEmptyFeature) {
              Swal.fire({
                title: "Error",
                text: "Todas las características deben tener título y descripción.",
                icon: "error",
                timer: 2000
              });
              setIsSubmitting(false);
              return;
            }
            if (hasEmptyApplication) {
              Swal.fire({
                title: "Error",
                text: "No puede haber aplicaciones vacías.",
                icon: "error",
                timer: 2000
              });
              setIsSubmitting(false);
              return;
            }
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
            <div>
              <div className="grid grid-cols-1 gap-3 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Nombre</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    defaultValue={currentService?.name}
                    placeholder="Nombre del servicio"
                    className="col-span-3"
                    required
                  />
                </div>

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
                  <Label htmlFor="short_description" className="text-right">Descripción corta</Label>
                  <input
                    id="short_description"
                    name="short_description"
                    defaultValue={currentService?.short_description || ''}
                    placeholder="Descripción corta para este servicio"
                    className="col-span-3 w-full border rounded-md p-2"
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
                {currentService && currentService.images && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <span></span>
                    <p className="text-xs text-gray-500 mt-1 col-span-3">
                      *Si no seleccionas imagenes nuevas, se mantendrán la actuales
                    </p>
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

              {/* Features dinámicas */}
              <div className="col-span-4">
                <Label className="block mb-2">Características</Label>
                {features.map((feature, idx) => (
                  <div key={idx} className="flex flex-col md:flex-row gap-2 mb-2 items-center w-full">
                    <Select
                      value={feature.icon}
                      onValueChange={icon => setFeatures(f => f.map((ft, i) => i === idx ? { ...ft, icon } : ft))}
                    >
                      <SelectTrigger className="w-16">
                        <SelectValue>{feature.icon}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <div className="grid grid-cols-4 gap-2 p-2 h-48 overflow-y-auto">
                          {EMOJI_LIST.map(e => (
                            <SelectItem
                              key={e}
                              value={e}
                              className="flex items-center justify-center text-2xl cursor-pointer p-2 hover:bg-gray-100"
                            >
                              {e}
                            </SelectItem>
                          ))}
                        </div>
                      </SelectContent>

                    </Select>
                    <Input
                      placeholder="Título"
                      value={feature.title}
                      onChange={e => setFeatures(f => f.map((ft, i) => i === idx ? { ...ft, title: e.target.value } : ft))}
                      className="w-full md:w-40"
                    />
                    <Input
                      placeholder="Descripción"
                      value={feature.desc}
                      onChange={e => setFeatures(f => f.map((ft, i) => i === idx ? { ...ft, desc: e.target.value } : ft))}
                      className="flex-1"
                    />
                    <Button type="button" variant="destructive" size="icon" onClick={() => setFeatures(f => f.filter((_, i) => i !== idx))}>✕</Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => setFeatures(f => [...f, { icon: EMOJI_LIST[0], title: '', desc: '' }])}>
                  + Agregar característica
                </Button>
              </div>

              {/* Applications dinámicas */}
              <div className="col-span-4 mt-4">
                <Label className="block mb-2">Aplicaciones perfectas</Label>
                {applications.map((app, idx) => (
                  <div key={idx} className="flex gap-2 mb-2 items-center">
                    <Input
                      placeholder="Aplicación (ej: Camisetas)"
                      value={app}
                      onChange={e => setApplications(a => a.map((ap, i) => i === idx ? e.target.value : ap))}
                      className="flex-1"
                    />
                    <Button type="button" variant="destructive" size="icon" onClick={() => setApplications(a => a.filter((_, i) => i !== idx))}>✕</Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => setApplications(a => [...a, ''])}>
                  + Agregar aplicación
                </Button>
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
                  <TableHead>Descripcion</TableHead>
                  <TableHead>Caracteristicas</TableHead>
                  <TableHead>Aplicaciones</TableHead>
                  <TableHead>Precio Base</TableHead>
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
                    <TableCell>{service.short_description}</TableCell>

                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {service.features?.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <span className="text-xl">{feature.icon}</span>
                            <div>
                              <div className="font-medium">{feature.title}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </TableCell>

                    <TableCell>{service.applications}</TableCell>

                    <TableCell>
                      <span className="font-medium">
                        ${Number(service.base_price).toFixed(2)}
                      </span>
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
    </>
  );
}