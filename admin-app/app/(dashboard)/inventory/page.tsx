'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { inventoryService, InventoryItem } from '@/services/inventoryService';
import { productService } from '@/services/productService';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from 'sonner';

export default function InventoryPage() {
  const router = useRouter();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isAdjustDialogOpen, setIsAdjustDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [adjustQuantity, setAdjustQuantity] = useState('');
  const [adjustType, setAdjustType] = useState<'in' | 'out'>('in');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [products, setProducts] = useState<Array<{ id: number; title: string }>>([]);
  
  // Nuevo estado para el formulario de creación
  const [newInventory, setNewInventory] = useState({
    product_id: '',
    stock_quantity: '',
    min_stock_level: '',
    cost_per_unit: '',
    notes: ''
  });

  const [editValues, setEditValues] = useState({
    min_stock_level: '',
    cost_per_unit: ''
  });

  useEffect(() => {
    loadProducts();
    loadInventory();
  }, [page, selectedStatus]);

  const loadProducts = async () => {
    try {
      const response = await productService.getAllProducts();
      setProducts(response);
    } catch (error) {
      toast.error('Error al cargar los productos');
    }
  };

  const loadInventory = async () => {
    try {
      setLoading(true);
      const response = await inventoryService.getAllInventory(
        page,
        10,
        selectedStatus || undefined
      );
      setInventory(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      toast.error('Error al cargar el inventario');
    } finally {
      setLoading(false);
    }
  };

  const filteredInventory = inventory
    .filter(item => {
      // Si hay un término de búsqueda, incluir todos los productos que coincidan
      if (searchTerm) {
        return item.product.title.toLowerCase().includes(searchTerm.toLowerCase());
      }
      
      // Si no hay término de búsqueda, aplicar el filtro de estado normal
      if (!selectedStatus && item.status === 'discontinued') {
        return false;
      }
      if (selectedStatus && item.status !== selectedStatus) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      // Primero ordenar por stock bajo solo si el producto está activo
      const aIsLowStock = a.status === 'active' && a.stock_quantity <= a.min_stock_level;
      const bIsLowStock = b.status === 'active' && b.stock_quantity <= b.min_stock_level;
      if (aIsLowStock && !bIsLowStock) return -1;
      if (!aIsLowStock && bIsLowStock) return 1;
      
      // Luego ordenar por estado (inactivos al final)
      if (a.status === 'inactive' && b.status !== 'inactive') return 1;
      if (a.status !== 'inactive' && b.status === 'inactive') return -1;
      
      return 0;
    });

  const handleAdjustStock = async () => {
    if (!selectedItem || !adjustQuantity) return;

    try {
      await inventoryService.adjustStock(
        selectedItem.id,
        parseInt(adjustQuantity),
        adjustType
      );

      setAdjustQuantity(prev => '')
      toast.success('Stock ajustado exitosamente');
      setIsAdjustDialogOpen(false);
      loadInventory();
    } catch (error) {
      toast.error('Error al ajustar el stock');
    }
  };

  const handleCreateInventory = async () => {
    try {
      await inventoryService.createInventory({
        product_id: parseInt(newInventory.product_id),
        stock_quantity: parseInt(newInventory.stock_quantity),
        min_stock_level: parseInt(newInventory.min_stock_level),
        cost_per_unit: parseFloat(newInventory.cost_per_unit),
        notes: newInventory.notes,
        status: 'active'
      });
      
      toast.success('Inventario creado exitosamente');
    //   setIsCreateDialogOpen(false);
      setNewInventory({
        product_id: '',
        stock_quantity: '',
        min_stock_level: '',
        cost_per_unit: '',
        notes: ''
      });
      loadInventory();
    } catch (error) {
      toast.error('Error al crear el inventario');
    }
  };

  const handleStatusChange = async (id: number, newStatus: 'active' | 'inactive' | 'discontinued') => {
    try {
      await inventoryService.changeInventoryStatus(id, newStatus);
      toast.success('Estado actualizado exitosamente');
      loadInventory();
    } catch (error) {
      toast.error('Error al cambiar el estado');
    }
  };

  const handleEditSubmit = async () => {
    if (!selectedItem) return;

    try {
      await inventoryService.updateInventory(selectedItem.id, {
        min_stock_level: parseInt(editValues.min_stock_level),
        cost_per_unit: parseFloat(editValues.cost_per_unit)
      });
      toast.success('Valores actualizados exitosamente');
      setIsEditDialogOpen(false);
      loadInventory();
    } catch (error) {
      toast.error('Error al actualizar los valores');
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Inventario</h1>
        <div className="flex gap-2">
          <Button onClick={() => router.push('/inventory/add')}>
            Crear Inventario
          </Button>
          <Button onClick={() => loadInventory()}>Actualizar</Button>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <Input
          type="text"
          placeholder="Buscar por nombre de producto..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />

        <select
          className="p-2 border rounded"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
        >
          <option value="">Todos los estados</option>
          <option value="active">Activo</option>
          <option value="inactive">Inactivo</option>
          <option value="discontinued">Descontinuado</option>
        </select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead>Stock Actual</TableHead>
              <TableHead>Stock Mínimo</TableHead>
              <TableHead>Reservado</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInventory.map((item) => {
              const isLowStock = item.stock_quantity <= item.min_stock_level;
              return (
                <TableRow 
                  key={item.id}
                  className={isLowStock ? 'bg-red-50' : ''}
                >
                  <TableCell className={isLowStock ? 'text-red-600 font-medium' : ''}>
                    {item.product.title}
                  </TableCell>
                  <TableCell className={isLowStock ? 'text-red-600 font-medium' : ''}>
                    {item.stock_quantity}
                  </TableCell>
                  <TableCell>{item.min_stock_level}</TableCell>
                  <TableCell>{item.reserved_quantity}</TableCell>
                  <TableCell>
                    <select
                      className={`p-2 border rounded ${isLowStock ? 'border-red-300' : ''}`}
                      value={item.status}
                      onChange={(e) => handleStatusChange(item.id, e.target.value as 'active' | 'inactive' | 'discontinued')}
                    >
                      <option value="active">Activo</option>
                      <option value="inactive">Inactivo</option>
                      <option value="discontinued">Descontinuado</option>
                    </select>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog open={isAdjustDialogOpen} onOpenChange={setIsAdjustDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            onClick={() => setSelectedItem(item)}
                            className={isLowStock ? 'border-red-300 text-red-600 hover:bg-red-50' : ''}
                          >
                            Ajustar Stock
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-white border shadow-lg">
                          <DialogHeader>
                            <DialogTitle>Ajustar Stock - {item.product.title}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium mb-1">
                                Tipo de Ajuste
                              </label>
                              <select
                                className="w-full p-2 border rounded"
                                value={adjustType}
                                onChange={(e) => setAdjustType(e.target.value as 'in' | 'out')}
                              >
                                <option value="in">Entrada</option>
                                <option value="out">Salida</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">
                                Cantidad
                              </label>
                              <Input
                                type="number"
                                value={adjustQuantity}
                                onChange={(e) => setAdjustQuantity(e.target.value)}
                                min="1"
                              />
                            </div>
                            <Button onClick={handleAdjustStock}>
                              Confirmar Ajuste
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setSelectedItem(item);
                              setEditValues({
                                min_stock_level: item.min_stock_level.toString(),
                                cost_per_unit: item.cost_per_unit.toString()
                              });
                            }}
                          >
                            Editar Valores
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-white border shadow-lg">
                          <DialogHeader>
                            <DialogTitle>Editar Valores - {item.product.title}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium mb-1">
                                Stock Mínimo
                              </label>
                              <Input
                                type="number"
                                value={editValues.min_stock_level}
                                onChange={(e) => setEditValues(prev => ({
                                  ...prev,
                                  min_stock_level: e.target.value
                                }))}
                                min="0"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">
                                Precio por Unidad
                              </label>
                              <Input
                                type="number"
                                value={editValues.cost_per_unit}
                                onChange={(e) => setEditValues(prev => ({
                                  ...prev,
                                  cost_per_unit: e.target.value
                                }))}
                                min="0"
                                step="0.01"
                              />
                            </div>
                            <Button onClick={handleEditSubmit}>
                              Guardar Cambios
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-center gap-2 mt-4">
        <Button
          variant="outline"
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Anterior
        </Button>
        <span className="py-2">
          Página {page} de {totalPages}
        </span>
        <Button
          variant="outline"
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
}
