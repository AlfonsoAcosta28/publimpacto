"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import {
  Search,
  MoreHorizontal,
  Percent,
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

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | File[] | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDiscountOpen, setIsDiscountOpen] = useState(false);
  const [selectedProductForDiscount, setSelectedProductForDiscount] = useState<Product | null>(null);

  // Fetch products and categories on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData] = await Promise.all([
          productService.getAllProducts(),
        ]);

        console.log('Productos recibidos:', productsData);
        setProducts(productsData);
        // console.log(productsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        Swal.fire({
          title: "Error",
          text: "No se pudieron cargar los productos",
          icon: "error",
          timer: 1500,
        });
      }
      try {
        const [categoriesData] = await Promise.all([
          categoryService.getAllCategories()
        ])
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching data:', error);
        Swal.fire({
          title: "Error",
          text: "No se pudieron cargar las categorias",
          icon: "error",
          timer: 1500,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreateProduct = async (formData: FormData) => {
    try {
      const productData = {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        base_price: parseFloat(formData.get('base_price') as string),
        category_id: parseInt(formData.get('category') as string),
        badge: formData.get('badge') as string
      };

      const image = formData.get('mainImage') as File;
      const secondaryImages = formData.getAll('secondaryImages') as File[];

      if (!image || image.size === 0) {
        Swal.fire({
          title: "Error",
          text: "Por favor selecciona una imagen",
          icon: "error",
          timer: 1500
        });
        return;
      }

      // Wait for the product to be created
      await productService.createProduct(productData, image, secondaryImages);

      // Only if the creation was successful:
      const updatedProducts = await productService.getAllProducts();
      setProducts(updatedProducts);
      setIsOpen(false); // Close modal

      Swal.fire({
        title: "Éxito",
        text: "Producto creado correctamente",
        icon: "success",
        timer: 1500
      });
    } catch (error) {
      console.error('Error creating product:', error);
      Swal.fire({
        title: "Error",
        text: "No se pudo crear el producto",
        icon: "error",
        timer: 1500
      });
      // Don't close modal on error so user can correct the input
    }
  };

  const handleEditProduct = async (formData: FormData) => {
    try {
      if (!currentProduct) return;

      const productData = {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        base_price: parseFloat(formData.get('base_price') as string),
        category_id: parseInt(formData.get('category') as string),
        badge: formData.get('badge') as string
      };

      const mainImage = formData.get('mainImage') as File;
      const secondaryImages = formData.getAll('secondaryImages') as File[];

      // Solo enviar imágenes si se seleccionaron nuevas
      const hasMainImage = mainImage && mainImage.size > 0;
      const hasSecondaryImages = secondaryImages && secondaryImages.length > 0 &&
        secondaryImages.some(img => img.size > 0);

      await productService.updateProduct(
        currentProduct.id,
        productData,
        hasMainImage ? mainImage : null,
        hasSecondaryImages ? secondaryImages : []
      );

      // Refresh products list
      const updatedProducts = await productService.getAllProducts();
      setProducts(updatedProducts);

      setIsOpen(false);
      setCurrentProduct(null);
      Swal.fire({
        title: "Éxito",
        text: "Producto actualizado correctamente",
        icon: "success",
        timer: 1500
      });
    } catch (error) {
      console.error('Error updating product:', error);
      // Mostrar el mensaje de error específico del servidor si existe
      Swal.fire({
        title: "Error",
        text: "No se pudo actualizar el producto",
        icon: "error",
        timer: 1500
      });
    }
  };

  const handleDeleteProduct = async (id: number) => {
    // Show confirmation dialog before deleting
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
        await productService.deleteProduct(id);

        // Remove product from state
        setProducts(products.filter(product => product.id !== id));

        Swal.fire({
          title: "Eliminado",
          text: "Producto eliminado correctamente",
          icon: "success",
          timer: 1500
        });
      } catch (error) {
        console.error('Error deleting product:', error);
        Swal.fire({
          title: "Error",
          text: "No se pudo eliminar el producto",
          icon: "error",
          timer: 1500
        });
      }
    }
  };

  const handleApplyDiscount = async (formData: FormData) => {
    try {
      if (!selectedProductForDiscount) return;

      const discountType = formData.get('discountType') as 'percentage' | 'price';
      const value = parseFloat(formData.get('value') as string);

      await productService.applyDiscount(
        selectedProductForDiscount.id,
        discountType,
        value
      );

      // Actualizar la lista de productos
      const updatedProducts = await productService.getAllProducts();
      setProducts(updatedProducts);
      setIsDiscountOpen(false);
      setSelectedProductForDiscount(null);

      Swal.fire({
        title: "Éxito",
        text: "Descuento aplicado correctamente",
        icon: "success",
        timer: 1500
      });
    } catch (error) {
      console.error('Error applying discount:', error);
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
      await productService.removeDiscount(id);

      // Actualizar la lista de productos
      const updatedProducts = await productService.getAllProducts();
      setProducts(updatedProducts);

      Swal.fire({
        title: "Éxito",
        text: "Descuento eliminado correctamente",
        icon: "success",
        timer: 1500
      });
    } catch (error) {
      console.error('Error removing discount:', error);
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
        <h2 className="text-xl font-semibold">Gestión de Productos</h2>

      </div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button className="mb-6" onClick={() => {
            setCurrentProduct(null);
            setIsOpen(true);
          }}>
            Crear Nuevo Producto
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <form onSubmit={async (e) => {
            e.preventDefault();
            setIsSubmitting(true);
            try {
              const formData = new FormData(e.currentTarget);
              if (currentProduct) {
                await handleEditProduct(formData);
              } else {
                await handleCreateProduct(formData);
              }
            } catch (error) {
              console.error('Form submission error:', error);
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
              <DialogTitle>{currentProduct ? 'Editar Producto' : 'Crear Nuevo Producto'}</DialogTitle>
              <DialogDescription>
                {currentProduct ? 'Modifica los detalles del producto.' : 'Completa los detalles para añadir un nuevo producto.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">Nombre</Label>
                <Input
                  id="title"
                  name="title"
                  defaultValue={currentProduct?.title || ''}
                  placeholder="Nombre del producto"
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="base_price" className="text-right">Precio</Label>
                <Input
                  id="base_price"
                  name="base_price"
                  type="number"
                  step="0.01"
                  defaultValue={currentProduct?.base_price || ''}
                  placeholder="Precio de venta"
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">Categoría</Label>
                <Select name="category" defaultValue={currentProduct?.category_id?.toString()}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="badge" className="text-right">Etiqueta</Label>
                <Input
                  id="badge"
                  name="badge"
                  defaultValue={currentProduct?.badge || ''}
                  placeholder="Ej: Nuevo, Oferta, etc."
                  className="col-span-2"
                />
                <p className="text-xs text-gray-500 mt-1">
                      *Este campo puede estar vacio
                    </p>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">Descripción</Label>
                <textarea
                  id="description"
                  name="description"
                  defaultValue={currentProduct?.description || ''}
                  placeholder="Descripción del producto"
                  className="col-span-3 min-h-[100px] w-full border rounded-md p-2"
                  required
                />
              </div>
              {currentProduct && currentProduct.ProductImages && (
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label className="text-right">Imágenes Actuales</Label>
                  <div className="col-span-3">
                    <ProductImageDisplay images={currentProduct.ProductImages} />
                  <p className="text-xs text-gray-500 mt-1">
                      *Si no seleccionas imagenes nuevas, se mantendran las actuales
                    </p>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="mainImage" className="text-right">
                  {currentProduct ? 'Cambiar Imagen Principal' : 'Imagen Principal'}
                </Label>
                <Input
                  id="mainImage"
                  name="mainImage"
                  type="file"
                  className="col-span-3"
                  onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
                  required={!currentProduct}
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="secondaryImages" className="text-right">
                  {currentProduct ? 'Agregar Imágenes Secundarias' : 'Imágenes Secundarias'}
                </Label>
                <Input
                  id="secondaryImages"
                  name="secondaryImages"
                  type="file"
                  multiple
                  className="col-span-3"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    // Puedes agregar validación de cantidad máxima aquí
                    if (files.length > 4) {
                      Swal.fire({
                        title: "Error",
                        text: "Solo se permiten hasta 5 imágenes secundarias",
                        icon: "error",
                        timer: 1500
                      });
                      e.target.value = ''; // Limpiar el input
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
                  `${currentProduct ? 'Actualizar' : 'Guardar'} Producto`
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Card className="mb-6">
        <CardHeader className="p-4 pb-0">
          <CardTitle className="text-base font-medium">Lista de Productos</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row justify-between mb-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar producto por nombre"
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full md:w-[400px] text-sm"
              />
            </div>
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Imagen</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Descuento</TableHead>
                  <TableHead>Precio Final</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Etiqueta</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">#{product.id}</TableCell>
                    <TableCell>
                      <div className="h-10 w-10 rounded overflow-hidden">
                        <Image
                          src={product.image || '/placeholder.svg'}
                          alt={product.title}
                          width={40}
                          height={40}
                          className="object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder.svg';
                          }}
                        />
                      </div>
                    </TableCell>
                    <TableCell>{product.title}</TableCell>
                    <TableCell>${product.base_price}</TableCell>
                    <TableCell>
                      {product.discount_percentage && product.discount_percentage > 0 ? (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <Percent className="h-3 w-3" />
                          {Number(product.discount_percentage).toFixed(0)}%
                        </Badge>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      {product.personalization_price && product.personalization_price > 0 ? (
                        <span className="font-medium">${Number(product.personalization_price).toFixed(2)}</span>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      {categories.find((c) => c.id === product.category_id)?.title || "Sin categoría"}
                    </TableCell>
                    <TableCell>
                      {product.badge && <Badge variant="secondary">{product.badge}</Badge>}
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
                            setCurrentProduct(product);
                            setIsOpen(true);
                          }}>
                            Editar
                          </DropdownMenuItem>
                          {product.discount_percentage && product.discount_percentage > 0 ? (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleRemoveDiscount(product.id)}>
                                Eliminar Descuento
                              </DropdownMenuItem>
                            </>
                          ) : (
                            <>
                              <DropdownMenuItem onClick={() => {
                                setSelectedProductForDiscount(product);
                                setIsDiscountOpen(true);
                              }}>
                                Agregar Descuento
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                            </>

                          )}

                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeleteProduct(product.id)}
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
                Aplica un descuento al producto {selectedProductForDiscount?.title}
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

    </>
  )
}