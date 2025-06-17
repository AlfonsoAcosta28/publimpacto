"use client"

import Image from "next/image"
import {
  Plus,
  MoreHorizontal
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useEffect, useState } from "react"
import { categoryService } from '@/services/categoryService';
import { Category } from "@/interfaces/category"
import Swal from 'sweetalert2';

const getImageUrl = (imagePath: string) => {
  if (!imagePath) return "/placeholder.svg";
  if (imagePath.startsWith('http')) return imagePath;
  return `${process.env.NEXT_PUBLIC_API_URL}${imagePath}`;
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  
  const fetchCategories = async () => {
    try {
      const data = await categoryService.getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      Swal.fire({
        title: "Error",
        text: "No se pudieron cargar las categorías",
        icon: "error",
        confirmButtonText: "Aceptar",
        timer: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (formData: FormData) => {
    try {
      const title = formData.get('title') as string;
      const description = formData.get('description') as string;
      const imageFile = formData.get('image') as File;

      // Validación para título (siempre requerido)
      if (!title) {
        Swal.fire({
          title: "Error",
          text: "Por favor ingresa un título para la categoría",
          icon: "error",
          confirmButtonText: "Aceptar",
          timer: 2000,
        });
        return;
      }

      // Validación para imagen (requerida solo al crear, no al editar)
      if (!currentCategory && (!imageFile || imageFile.size === 0)) {
        Swal.fire({
          title: "Error",
          text: "Por favor selecciona una imagen para la nueva categoría",
          icon: "error",
          confirmButtonText: "Aceptar",
          timer: 2000,
        });
        return;
      }

      if (currentCategory) {
        // Actualizar categoría - la imagen es opcional
        await categoryService.updateCategory(
          currentCategory.id, 
          { title, description }, 
          imageFile && imageFile.size > 0 ? imageFile : null
        );
        
        Swal.fire({
          title: "Éxito",
          text: "Categoría actualizada correctamente",
          icon: "success",
          confirmButtonText: "Aceptar",
          timer: 2000,
        });
      } else {
        // Crear nueva categoría - imagen requerida (ya validado arriba)
        await categoryService.createCategory({ title, description }, imageFile);
        
        Swal.fire({
          title: "Éxito",
          text: "Categoría creada correctamente",
          icon: "success",
          confirmButtonText: "Aceptar",
          timer: 2000,
        });
      }

      setIsOpen(false);
      setCurrentCategory(null);
      fetchCategories(); // Recargar las categorías
    } catch (error) {
      console.error('Error al procesar la categoría:', error);
      Swal.fire({
        title: "Error",
        text: "Hubo un problema al guardar la categoría",
        icon: "error",
        confirmButtonText: "Aceptar",
        timer: 2000,
      });
    }
  };

  const handleDeleteCategory = async (id: number) => {
    // Reemplazamos el confirm nativo con SweetAlert2
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "¿Deseas eliminar esta categoría? Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar"
    });
    
    if (!result.isConfirmed) {
      return;
    }
    
    try {
      await categoryService.deleteCategory(id);
      Swal.fire({
        title: "Eliminada",
        text: "Categoría eliminada correctamente",
        icon: "success",
        confirmButtonText: "Aceptar"
      });
      fetchCategories();
    } catch (error: any) {
      console.error('Error al eliminar categoría:', error);
      Swal.fire({
        title: "Error",
        text: error.response?.data?.message || "No se pudo eliminar la categoría",
        icon: "error",
        confirmButtonText: "Aceptar"
      });
    }
  };

  const openEditDialog = (category: Category) => {
    setCurrentCategory(category);
    setIsOpen(true);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

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
        <h2 className="text-xl font-semibold">Gestión de Categorías</h2>
        <div className="flex gap-2">
          <Button 
            size="sm" 
            className="flex items-center gap-1" 
            onClick={() => {
              setCurrentCategory(null);
              setIsOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Nueva Categoría
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {categories.map((category) => (
          <Card key={category.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="h-12 w-12 rounded-md overflow-hidden">
                  <Image
                    src={getImageUrl(category.image)}
                    alt={category.title}
                    width={60}
                    height={60}
                    className="object-cover"
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEditDialog(category)}>Editar</DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-red-600"
                      onClick={() => handleDeleteCategory(category.id)}
                    >
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <h3 className="text-lg font-medium">{category.title}</h3>
              <p className="text-sm text-gray-800 mb-2">
                {category.description}
              </p>
              <p className="text-sm text-gray-500">
                Creada: {new Date(category.created_at).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {currentCategory ? 'Editar Categoría' : 'Crear Nueva Categoría'}
            </DialogTitle>
            <DialogDescription>
              {currentCategory 
                ? 'Modifica los datos de la categoría.' 
                : 'Añade una nueva categoría para tus productos.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            handleCreateCategory(formData);
          }}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Título
                </Label>
                <Input 
                  id="title" 
                  name="title"
                  placeholder="Nombre de la categoría" 
                  className="col-span-3" 
                  defaultValue={currentCategory?.title || ''}
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Descripcion
                </Label>
                <Input 
                  id="description" 
                  name="description"
                  placeholder="Descripcion de la categoría" 
                  className="col-span-3" 
                  defaultValue={currentCategory?.description || ''}
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="image" className="text-right">
                  Imagen
                </Label>
                <Input 
                  id="image" 
                  name="image"
                  type="file" 
                  className="col-span-3"
                  required={!currentCategory} // Solo requerido si es nueva categoría
                />
                {!currentCategory && (
                  <p className="col-span-3 col-start-2 text-xs text-gray-500">
                    *La imagen es obligatoria al crear una nueva categoría
                  </p>
                )}
              </div>
              {currentCategory && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="text-right">Actual</div>
                  <div className="col-span-3">
                    <div className="h-20 w-20 rounded-md overflow-hidden">
                      <Image
                        src={getImageUrl(currentCategory.image)}
                        alt={currentCategory.title}
                        width={80}
                        height={80}
                        className="object-cover"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      *Si no seleccionas una nueva imagen, se mantendrá la actual
                    </p>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
              <Button type="submit">
                {currentCategory ? 'Actualizar' : 'Guardar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}