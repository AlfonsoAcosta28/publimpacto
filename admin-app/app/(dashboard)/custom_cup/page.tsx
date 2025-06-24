'use client';
import React, { useEffect, useState } from 'react';
import cupService from '@/services/cupServices';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Swal from 'sweetalert2';
import { BsCupHotFill } from "react-icons/bs";

// Interfaces para tipado
interface Cup {
  id: number;
  name: string;
  descripcion: string;
}

interface InventarioCup {
  id: number;
  cup: Cup;
  stock: number;
  reserved_quantity?: number;
  available_quantity?: number;
}

export default function CustomCupsPage() {
  // Estados para el formulario y el inventario
  const [nombre, setNombre] = useState<string>('');
  const [descripcion, setDescripcion] = useState<string>('');
  const [tazas, setTazas] = useState<Cup[]>([]);
  const [inventario, setInventario] = useState<InventarioCup[]>([]);
  const [search, setSearch] = useState<string>('');
  const [stock, setStock] = useState<number>(0);
  const [precioBase, setPrecioBase] = useState<string>('');
  const [openDialog, setOpenDialog] = useState(false);
  const [ajustarStockOpen, setAjustarStockOpen] = useState(false);
  const [stockAjusteId, setStockAjusteId] = useState<number | null>(null);
  const [ajusteCantidad, setAjusteCantidad] = useState<number>(1);
  const [ajusteTipo, setAjusteTipo] = useState<'entrada' | 'salida'>('entrada');
  const [preciosDialogOpen, setPreciosDialogOpen] = useState(false);
  const [preciosTazaId, setPreciosTazaId] = useState<number | null>(null);
  const [precios, setPrecios] = useState<any[]>([]);
  const [nuevoMin, setNuevoMin] = useState<number>(1);
  const [nuevoMax, setNuevoMax] = useState<number>(1);
  const [nuevoPrecio, setNuevoPrecio] = useState<string>('');
  const [editPrecioId, setEditPrecioId] = useState<number | null>(null);
  const [editMin, setEditMin] = useState<number>(1);
  const [editMax, setEditMax] = useState<number>(1);
  const [editPrecio, setEditPrecio] = useState<string>('');

  useEffect(() => {
    cargarTazas();
    cargarInventario();
  }, []);

  const cargarTazas = async () => {
    const { data } = await cupService.getAllCups();
    console.log(data)
    setTazas(data);
  };

  const cargarInventario = async () => {
    const { data } = await cupService.getAllInventario();
    
    setInventario(data);
  };

  const handleAgregarTaza = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!nombre || !descripcion || stock === null || precioBase === '') {
      Swal.fire({
        title: 'Error',
        text: 'Debes completar todos los campos',
        icon: 'error',
        timer: 2000
      });
      return;
    }
    try {
      await cupService.createCup({ name: nombre, descripcion, stock: Number(stock), precio_base: Number(precioBase) });
      setNombre('');
      setDescripcion('');
      setStock(0);
      setPrecioBase('');
      setOpenDialog(false);
      cargarTazas();
      cargarInventario();
      Swal.fire({
        title: 'Éxito',
        text: 'Taza agregada correctamente',
        icon: 'success',
        timer: 1500
      });
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: 'No se pudo agregar la taza',
        icon: 'error',
        timer: 2000
      });
    }
  };

  const cargarPrecios = async (id: number) => {
    const { data } = await cupService.getAllPreciosCupRango();
    setPrecios(data.filter((p: any) => p.id_cup === id));
  };

  const handleOpenPreciosDialog = async(id: number) => {
    setPreciosTazaId(id);
    setPreciosDialogOpen(true);
    cargarPrecios(id);
  };

  const handleAgregarPrecio = async () => {
    if (!preciosTazaId || !nuevoMin || !nuevoMax || !nuevoPrecio) return;
    try{
        await cupService.createPrecioCupRango({ id_cup: preciosTazaId, min_cantidad: nuevoMin, max_cantidad: nuevoMax, precio_unitario: Number(nuevoPrecio) });
        
    }catch(error: any){
        console.log(error)
        if(error.status === 400){
            Swal.fire({
                title:"Error",
                text: error.response.data.error,
                icon:'error',
                timer: 3000
            })
        }
    }
    setNuevoMin(1);
    setNuevoMax(1);
    setNuevoPrecio('');
    cargarPrecios(preciosTazaId);
  };

  const handleEliminarPrecio = async (id: number) => {
    await cupService.deletePrecioCupRango(id);
    cargarPrecios(preciosTazaId!);
  };

  const handleDeletetaza = async(id: number) => {
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
            await cupService.deleteCup(id);
            cargarTazas();
            cargarInventario();
            Swal.fire({
                title: "Eliminado",
                text: "Taza eliminada correctamente",
                icon: "success",
                timer: 1500
            });
        } catch (error) {
            console.error('Error deleting Taza:', error);
            Swal.fire({
                title: "Error",
                text: "No se pudo eliminar la Taza",
                icon: "error",
                timer: 1500
            });
        }
    }
  }

  // Filtro de inventario
  const inventarioFiltrado = inventario.filter((inv) => {
    const tazaNombre = inv.cup?.name?.toLowerCase() || '';
    const tazaDesc = inv.cup?.descripcion?.toLowerCase() || '';
    return (
      !search || tazaNombre.includes(search.toLowerCase()) || tazaDesc.includes(search.toLowerCase())
    );
  });

  const openAjustarStockModal = (id: number) => {
    setStockAjusteId(id);
    setAjusteCantidad(1);
    setAjusteTipo('entrada');
    setAjustarStockOpen(true);
  };

  const handleAjustarStock = async () => {
    if (!stockAjusteId || ajusteCantidad <= 0) return;
    if (ajusteTipo === 'entrada') {
      await cupService.entradaStock(stockAjusteId, ajusteCantidad);
    } else {
      await cupService.salidaStock(stockAjusteId, ajusteCantidad);
    }
    setAjustarStockOpen(false);
    cargarInventario();
  };

  const startEditPrecio = (precio: any) => {
    setEditPrecioId(precio.id);
    setEditMin(precio.min_cantidad);
    setEditMax(precio.max_cantidad);
    setEditPrecio(precio.precio_unitario);
  };

  const cancelEditPrecio = () => {
    setEditPrecioId(null);
  };

  const handleGuardarEditPrecio = async (precio: any) => {
    try {
      await cupService.updatePrecioCupRango(precio.id, {
        id_cup: precio.id_cup,
        min_cantidad: editMin,
        max_cantidad: editMax,
        precio_unitario: Number(editPrecio)
      });
      setEditPrecioId(null);
      cargarPrecios(precio.id_cup);
    } catch (error: any) {
      if(error.status === 400){
        Swal.fire({
          title: 'Error',
          text: error.response.data.error,
          icon: 'error',
          timer:3000
        });
      }
    }
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Administrar Tazas</h2>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button>Registrar Nueva Taza</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <form onSubmit={handleAgregarTaza}>
              <DialogHeader>
                <DialogTitle>Registrar Nueva Taza</DialogTitle>
                <DialogDescription>Agrega una taza con su nombre, descripción, stock inicial y precio base.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="nombre" className="text-sm font-medium text-gray-700">
                    Nombre de la taza
                  </label>
                  <Input
                    id="nombre"
                    type="text"
                    placeholder="Ej: Taza de café grande"
                    value={nombre}
                    onChange={e => setNombre(e.target.value)}
                    className="w-full"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="descripcion" className="text-sm font-medium text-gray-700">
                    Descripción
                  </label>
                  <Input
                    id="descripcion"
                    type="text"
                    placeholder="Ej: Taza de cerámica blanca 350ml"
                    value={descripcion}
                    onChange={e => setDescripcion(e.target.value)}
                    className="w-full"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="stock" className="text-sm font-medium text-gray-700">
                    Stock inicial
                  </label>
                  <Input
                    id="stock"
                    type="number"
                    min={0}
                    placeholder="Ej: 10"
                    value={stock}
                    onChange={e => setStock(Number(e.target.value))}
                    className="w-full"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="precioBase" className="text-sm font-medium text-gray-700">
                    Precio base (unidad)
                  </label>
                  <Input
                    id="precioBase"
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="Ej: 50.00"
                    value={precioBase}
                    onChange={e => setPrecioBase(e.target.value)}
                    className="w-full"
                    required
                  />
                </div>
              </div>
              <DialogFooter className='mt-5'>
                <Button type="submit" className="bg-blue-600 text-white">Guardar taza</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>


      <Card className="mb-6">
                <CardHeader className="p-4 pb-0">
                    <CardTitle className="text-base font-medium">Tazas Registradas</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                    <div className="grid gap-3">
                        {tazas.map(taza => (
                            <div key={taza.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                                <div className="flex items-center gap-3">
                                    <BsCupHotFill className="text-blue-600 text-xl" />
                                    <span className="font-medium">{taza.name}</span>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleOpenPreciosDialog(taza.id)}
                                    >
                                        Modificar Precios
                                    </Button>
                                    <Button

                                        className='text-white'
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleDeletetaza(taza.id!)}
                                    >
                                        Eliminar
                                    </Button>
                                </div>
                            </div>
                        ))}
                        {tazas.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                <BsCupHotFill className="text-4xl mx-auto mb-2 text-gray-300" />
                                <p>No hay tazas registradas</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

      {/* Tabla de inventario de tazas */}
      <Card>
        <CardHeader className="p-4 pb-0">
          <CardTitle className="text-base font-medium">Inventario de Tazas</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="mb-4">
            <label htmlFor="search" className="text-sm font-medium text-gray-700">
              Buscar en inventario
            </label>
            <Input
              id="search"
              type="text"
              placeholder="Buscar por nombre o descripción"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full md:w-[300px]"
            />
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Reservado</TableHead>
                  <TableHead>Disponible</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventarioFiltrado.map(inv => (
                  <TableRow key={inv.id}>
                    <TableCell>{inv.cup?.name}</TableCell>
                    <TableCell>{inv.cup?.descripcion}</TableCell>
                    <TableCell>{inv.stock}</TableCell>
                    <TableCell>{inv.reserved_quantity ?? 0}</TableCell>
                    <TableCell>{inv.available_quantity ?? ((inv.stock) - (inv.reserved_quantity ?? 0))}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => openAjustarStockModal(inv.id)}>
                        Ajustar stock
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {inventarioFiltrado.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500">No hay tazas en inventario</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal para ajustar stock */}
      <Dialog open={ajustarStockOpen} onOpenChange={setAjustarStockOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Ajustar stock</DialogTitle>
            <DialogDescription>Introduce la cantidad y selecciona el tipo de ajuste.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium mb-1">Cantidad</label>
              <Input
                type="number"
                min={1}
                value={ajusteCantidad}
                onChange={e => setAjusteCantidad(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tipo de ajuste</label>
              <select
                className="w-full border rounded px-2 py-1"
                value={ajusteTipo}
                onChange={e => setAjusteTipo(e.target.value as 'entrada' | 'salida')}
              >
                <option value="entrada">Entrada (sumar stock)</option>
                <option value="salida">Salida (restar stock)</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAjustarStock} className="bg-blue-600 text-white">Aplicar ajuste</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para gestión de precios */}
      <Dialog open={preciosDialogOpen} onOpenChange={setPreciosDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Precios por rango</DialogTitle>
            <DialogDescription>Gestiona los precios por cantidad para esta taza.</DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Desde</TableHead>
                  <TableHead>Hasta</TableHead>
                  <TableHead>Precio unitario</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {precios.map((precio) => (
                  <TableRow key={precio.id}>
                    {editPrecioId === precio.id ? (
                      <>
                        {/* Si es precio base, solo editar max y precio */}
                        {(precio.min_cantidad === 1 && precio.max_cantidad === 1) ? (
                          <>
                            <TableCell>1</TableCell>
                            <TableCell>
                              <Input type="number" min={1} value={editMax} onChange={e => setEditMax(Number(e.target.value))} />
                            </TableCell>
                            <TableCell>
                              <Input type="number" min={0} step="0.01" value={editPrecio} onChange={e => setEditPrecio(e.target.value)} />
                            </TableCell>
                          </>
                        ) : (
                          <>
                            <TableCell>
                              <Input type="number" min={1} value={editMin} onChange={e => setEditMin(Number(e.target.value))} />
                            </TableCell>
                            <TableCell>
                              <Input type="number" min={editMin} value={editMax} onChange={e => setEditMax(Number(e.target.value))} />
                            </TableCell>
                            <TableCell>
                              <Input type="number" min={0} step="0.01" value={editPrecio} onChange={e => setEditPrecio(e.target.value)} />
                            </TableCell>
                          </>
                        )}
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" className="bg-blue-600 text-white" onClick={() => handleGuardarEditPrecio(precio)}>Guardar</Button>
                            <Button size="sm" variant="outline" onClick={cancelEditPrecio}>Cancelar</Button>
                          </div>
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell>{precio.min_cantidad}</TableCell>
                        <TableCell>{precio.max_cantidad}</TableCell>
                        <TableCell>${precio.precio_unitario}</TableCell>
                        <TableCell className='grid grid-cols-2 gap-2'>
                          {(precio.min_cantidad === 1) ? (
                            <Button size="sm" variant="outline" onClick={() => startEditPrecio(precio)}>Editar</Button>
                          ) : (
                            <>
                              <Button size="sm" variant="outline" onClick={() => startEditPrecio(precio)}>Editar</Button>
                              <Button size="sm" variant="destructive" onClick={() => handleEliminarPrecio(precio.id)}>Eliminar</Button>
                            </>
                          )}
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
                {precios.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-gray-500">No hay precios registrados</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <span className='text-sm'>Agregar Nuevos Precios</span>
          <div className="flex gap-2 items-end mt-4">
            
            <div>
              <label className="block text-xs">Desde</label>
              <Input type="number" min={1}  onChange={e => setNuevoMin(Number(e.target.value))} required/>
            </div>
            <div>
              <label className="block text-xs">Hasta</label>
              <Input type="number" min={nuevoMin}  onChange={e => setNuevoMax(Number(e.target.value))} required />
            </div>
            <div>
              <label className="block text-xs">Precio unitario</label>
              <Input type="number" min={0} step="0.01" onChange={e => setNuevoPrecio(e.target.value)} required />
            </div>
            <Button size="sm" className="bg-blue-600 text-white" onClick={handleAgregarPrecio}>Agregar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}