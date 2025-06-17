'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { productService } from '@/services/productService';
import { inventoryService } from '@/services/inventoryService';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from 'sonner';

interface Product {
  id: number;
  title: string;
  base_price: string;
  description: string;
  category_id: number;
  image: string;
  category: {
    id: number;
    title: string;
  };
  ProductImages: Array<{
    id: number;
    image: string;
  }>;
}

interface InventoryItem {
  product_id: number;
  stock_quantity: number;
  min_stock_level: number;
  cost_per_unit: number;
  notes: string;
  status: string;
}

export default function AddInventoryPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [inventoryData, setInventoryData] = useState({
    stock_quantity: '',
    min_stock_level: '',
    cost_per_unit: '',
    notes: ''
  });

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = products.filter(product =>
        product.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [searchTerm, products]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getAllProducts();
      const inventoryResponse = await inventoryService.getAllInventory(1, 1000);
      const productsWithInventory = new Set(inventoryResponse.data.map((item: InventoryItem) => item.product_id));
      
      const availableProducts = response.filter((product: Product) => !productsWithInventory.has(product.id));
      
      if (Array.isArray(availableProducts)) {
        setProducts(availableProducts);
        setFilteredProducts(availableProducts);
      } else {
        setProducts([]);
        setFilteredProducts([]);
        toast.error('Formato de respuesta inválido');
      }
    } catch (error) {
      console.error('Error al cargar productos:', error);
      setProducts([]);
      setFilteredProducts([]);
      toast.error('Error al cargar los productos');
    } finally {
      setLoading(false);
    }
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleCreateInventory = async () => {
    if (!selectedProduct) return;

    if (!inventoryData.stock_quantity || !inventoryData.min_stock_level || !inventoryData.cost_per_unit) {
      toast.error('Por favor complete todos los campos requeridos');
      return;
    }

    try {
      await inventoryService.createInventory({
        product_id: selectedProduct.id,
        stock_quantity: parseInt(inventoryData.stock_quantity),
        min_stock_level: parseInt(inventoryData.min_stock_level),
        cost_per_unit: parseFloat(inventoryData.cost_per_unit),
        notes: inventoryData.notes,
        status: 'active'
      });
      
      toast.success('Inventario creado exitosamente');
      router.push('/inventory');
    } catch (error) {
      console.error('Error al crear inventario:', error);
      toast.error('Error al crear el inventario');
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Agregar Inventario</h1>
        <Button variant="outline" onClick={() => router.push('/inventory')}>
          Volver
        </Button>
      </div>

      <div className="mb-6">
        <Input
          type="text"
          placeholder="Buscar producto por nombre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-4">
                    Cargando productos...
                  </TableCell>
                </TableRow>
              ) : filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-4">
                    No se encontraron productos
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => (
                  <TableRow 
                    key={product.id}
                    className={selectedProduct?.id === product.id ? 'bg-gray-100' : ''}
                  >
                    <TableCell>{product.title}</TableCell>
                    <TableCell>${product.base_price}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        onClick={() => handleProductSelect(product)}
                      >
                        Seleccionar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {selectedProduct && (
          <div className="space-y-4 p-4 border rounded-md">
            <h2 className="text-xl font-semibold mb-4">
              Agregar Inventario - {selectedProduct.title}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Cantidad Inicial *
                </label>
                <Input
                  type="number"
                  value={inventoryData.stock_quantity}
                  onChange={(e) => setInventoryData(prev => ({ ...prev, stock_quantity: e.target.value }))}
                  placeholder="Cantidad inicial"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Stock Mínimo *
                </label>
                <Input
                  type="number"
                  value={inventoryData.min_stock_level}
                  onChange={(e) => setInventoryData(prev => ({ ...prev, min_stock_level: e.target.value }))}
                  placeholder="Stock mínimo"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Costo por Unidad *
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={inventoryData.cost_per_unit}
                  onChange={(e) => setInventoryData(prev => ({ ...prev, cost_per_unit: e.target.value }))}
                  placeholder="Costo por unidad"
                  required
                />
              </div>
              {/* <div>
                <label className="block text-sm font-medium mb-1">
                  Notas
                </label>
                <Input
                  type="text"
                  value={inventoryData.notes}
                  onChange={(e) => setInventoryData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Notas adicionales"
                />
              </div> */}
              <Button onClick={handleCreateInventory}>
                Crear Inventario
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 