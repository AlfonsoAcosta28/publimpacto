'use client';
import React, { useEffect, useState } from 'react';
import camisaService from '@/services/camisasServices';
import { FaTshirt } from 'react-icons/fa';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Swal from 'sweetalert2';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Camisa {
    id?: number;
    descripcion: string;
    activo?: boolean;
}

interface Talla {
    id: number;
    id_camisa: number;
    talla: string;
}

interface Color {
    id: number;
    id_camisa: number;
    nombre_color: string;
    rgb: string;
}

interface Inventario {
    id: number;
    id_camisa: number;
    id_talla: number;
    id_color: number;
    //   stock: number;
    talla?: Talla;
    color?: Color;
    camisa?: Camisa;
    stock: number;
    reserved_quantity?: number;
    available_quantity?: number;
}

interface Combinacion {
    talla: string;
    color: string;
    rgb: string;
    stock: number;
}

interface PrecioRango {
    id?: number;
    id_camisa: number;
    min_cantidad: number;
    max_cantidad: number;
    precio_unitario: number;
}

export default function CustomThsirtsPage() {
    const [camisas, setCamisas] = useState<Camisa[]>([]);
    const [nuevaCamisa, setNuevaCamisa] = useState('');
    const [precioBasico, setPrecioBasico] = useState<number>(0);
    const [combinaciones, setCombinaciones] = useState<Combinacion[]>([]);
    const [talla, setTalla] = useState('');
    const [color, setColor] = useState('');
    const [rgb, setRgb] = useState('#000000');
    const [stock, setStock] = useState<number>(1);
    const [inventario, setInventario] = useState<Inventario[]>([]);
    const [editStockId, setEditStockId] = useState<number | null>(null);
    const [editStockValue, setEditStockValue] = useState<number>(0);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editInventario, setEditInventario] = useState<Inventario | null>(null);
    const [search, setSearch] = useState('');
    const [filterCamisa, setFilterCamisa] = useState('');
    const [filterTalla, setFilterTalla] = useState('');
    const [filterColor, setFilterColor] = useState('');
    const [preciosDialogOpen, setPreciosDialogOpen] = useState(false);
    const [selectedCamisaForPrecios, setSelectedCamisaForPrecios] = useState<Camisa | null>(null);
    const [rangosPrecios, setRangosPrecios] = useState<PrecioRango[]>([]);
    const [nuevoRango, setNuevoRango] = useState<PrecioRango>({ id_camisa: 0, min_cantidad: 1, max_cantidad: 1, precio_unitario: 0 });
    const [editRangoId, setEditRangoId] = useState<number | null>(null);
    const [editRango, setEditRango] = useState<PrecioRango>({ id_camisa: 0, min_cantidad: 1, max_cantidad: 1, precio_unitario: 0 });
    const [combinacionesDialogOpen, setCombinacionesDialogOpen] = useState(false);
    const [selectedCamisaForCombinaciones, setSelectedCamisaForCombinaciones] = useState<Camisa | null>(null);

    const tallasComunes = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];
    const coloresComunes = [
        { nombre: "Blanco", rgb: "#ffffff" },
        { nombre: "Negro", rgb: "#000000" },
        { nombre: "Gris", rgb: "#808080" },
        { nombre: "Rojo", rgb: "#ff0000" },
        { nombre: "Azul", rgb: "#0000ff" },
        { nombre: "Azul Marino", rgb: "#000080" },
        { nombre: "Verde", rgb: "#008000" },
        { nombre: "Amarillo", rgb: "#ffff00" },
        { nombre: "Naranja", rgb: "#ffa500" },
        { nombre: "Morado", rgb: "#800080" },
        { nombre: "Rosado", rgb: "#ffc0cb" },
    ];

    const handleColorChange = (colorNombre: string) => {
        const colorSeleccionado = coloresComunes.find(c => c.nombre === colorNombre);
        if (colorSeleccionado) {
            setColor(colorSeleccionado.nombre);
            setRgb(colorSeleccionado.rgb);
        }
    };

    useEffect(() => {
        cargarCamisas();
        cargarInventario();
    }, []);

    const cargarCamisas = async () => {
        const { data } = await camisaService.getAllCamisas();
        console.log(data)
        setCamisas(data);
    };

    const cargarInventario = async () => {
        const { data } = await camisaService.getAllInventario();
        console.log("Inventario " + data)
        setInventario(data);
    };

    const cargarRangosPrecios = async (idCamisa: number) => {
        const { data } = await camisaService.getAllPreciosCamisaRango();
        setRangosPrecios(data.filter((r: PrecioRango) => r.id_camisa === idCamisa));
    };

    // Añadir combinación a la lista temporal antes de guardar la camisa
    const handleAddCombinacion = (e: React.FormEvent) => {
        e.preventDefault();
        if (!talla || !color || !rgb || !stock) return;
        setCombinaciones([...combinaciones, { talla, color, rgb, stock }]);
        setTalla('');
        setColor('');
        setRgb('#000000');
        setStock(1);
    };

    // Eliminar combinación antes de guardar
    const handleRemoveCombinacion = (idx: number) => {
        setCombinaciones(combinaciones.filter((_, i) => i !== idx));
    };

    // Guardar camisa y sus combinaciones
    const handleAgregarCamisa = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nuevaCamisa || combinaciones.length === 0) {
            Swal.fire({
                title: "Error",
                text: "Debe agregar al menos 1 combinacion",
                icon: "error",
                timer: 3000
            });
            return;
        }
        if (precioBasico <= 0) {
            Swal.fire({
                title: "Error",
                text: "El precio por unidad no puede ser menor o igual a 0",
                icon: "error",
                timer: 3000
            });
            return;
        }
        // 1. Crear camisa
        const { data: camisa } = await camisaService.createCamisa({ descripcion: nuevaCamisa });
        for (const comb of combinaciones) {
            // Crear talla o buscar existente
            let tallaObj = null;
            const { data: tallasExist } = await camisaService.getAllTallas();
            tallaObj = tallasExist.find((t: Talla) => t.id_camisa === camisa.id && t.talla === comb.talla);
            if (!tallaObj) {
                const { data } = await camisaService.createTalla({ id_camisa: camisa.id, talla: comb.talla });
                tallaObj = data;
            }
            // Crear color o buscar existente
            let colorObj = null;
            const { data: coloresExist } = await camisaService.getAllColores();
            colorObj = coloresExist.find((c: Color) => c.id_camisa === camisa.id && c.nombre_color === comb.color && c.rgb === comb.rgb);
            if (!colorObj) {
                const { data } = await camisaService.createColor({ id_camisa: camisa.id, nombre_color: comb.color, rgb: comb.rgb });
                colorObj = data;
            }
            // Crear inventario
            try {
                await camisaService.createInventario({ id_camisa: camisa.id, id_talla: tallaObj.id, id_color: colorObj.id, stock: comb.stock });
            } catch (error: any) {
                if (error.response && error.response.status === 409) {
                    const { existingInventario } = error.response.data;
                    const result = await Swal.fire({
                        title: "Combinación existente",
                        text: "Esta combinación ya existe, ¿desea agregar el stock a la existente?",
                        icon: "question",
                        showCancelButton: true,
                        confirmButtonText: "Sí, agregar stock",
                        cancelButtonText: "No",
                    });

                    if (result.isConfirmed) {
                        const newStock = existingInventario.stock + comb.stock;
                        await camisaService.entradaStock(existingInventario.id, comb.stock);
                    }
                } else {
                    console.error('Error creating inventory:', error);
                    Swal.fire({
                        title: "Error",
                        text: "No se pudo crear la combinación.",
                        icon: "error"
                    });
                }
            }
        }
        // Crear precio básico para 1 unidad
        await camisaService.createPrecioCamisaRango({ id_camisa: camisa.id, min_cantidad: 1, max_cantidad: 1, precio_unitario: precioBasico });
        setNuevaCamisa('');
        setPrecioBasico(0);
        setCombinaciones([]);
        cargarCamisas();
        cargarInventario();
    };

    // Eliminar camisa
    const handleDeleteCamisa = async (id: number) => {
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
                await camisaService.deleteCamisa(id);
                cargarCamisas();
                cargarInventario();
                Swal.fire({
                    title: "Eliminado",
                    text: "Camisa eliminada correctamente",
                    icon: "success",
                    timer: 1500
                });
            } catch (error) {
                console.error('Error deleting camisa:', error);
                Swal.fire({
                    title: "Error",
                    text: "No se pudo eliminar la camisa",
                    icon: "error",
                    timer: 1500
                });
            }
        }
    };

    // Eliminar combinación específica (inventario)
    const handleDeleteCombinacion = async (inventario: Inventario) => {
        const result = await Swal.fire({
            title: "¿Estás seguro?",
            text: `¿Eliminar la combinación ${inventario.talla?.talla} - ${inventario.color?.nombre_color}?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar"
        });

        if (result.isConfirmed) {
            try {
                await camisaService.deleteInventario(inventario.id);
                cargarInventario();
                Swal.fire({
                    title: "Eliminado",
                    text: "Combinación eliminada correctamente",
                    icon: "success",
                    timer: 1500
                });
            } catch (error) {
                console.error('Error deleting combinacion:', error);
                Swal.fire({
                    title: "Error",
                    text: "No se pudo eliminar la combinación",
                    icon: "error",
                    timer: 1500
                });
            }
        }
    };

    // Abrir dialog para editar stock
    const handleOpenEditDialog = (inv: Inventario) => {
        setEditInventario(inv);
        setEditStockValue(inv.stock);
        setEditDialogOpen(true);
    };

    // Guardar stock editado
    const handleSaveStock = async () => {
        if (!editInventario) return;
        await camisaService.updateInventario(editInventario.id, { stock: editStockValue });
        setEditDialogOpen(false);
        setEditInventario(null);
        cargarInventario();
    };

    // Abrir dialog para precios
    const handleOpenPreciosDialog = async (camisa: Camisa) => {
        setSelectedCamisaForPrecios(camisa);
        await cargarRangosPrecios(camisa.id!);
        setPreciosDialogOpen(true);
    };

    // Agregar rango de precio
    const handleAddRangoPrecio = async () => {
        if (!selectedCamisaForPrecios) return;
        try {
            await camisaService.createPrecioCamisaRango({ ...nuevoRango, id_camisa: selectedCamisaForPrecios.id! });
        } catch (error: any) {
            if (error.response?.status === 400) {
                Swal.fire({
                    title: "Error",
                    text: error.response.data.error,
                    icon: "error",
                    timer: 5000
                });
            }
            return;
        }
        setNuevoRango({ id_camisa: 0, min_cantidad: 1, max_cantidad: 1, precio_unitario: 0 });
        await cargarRangosPrecios(selectedCamisaForPrecios.id!);
    };

    // Eliminar rango de precio
    const handleDeleteRangoPrecio = async (rango: PrecioRango) => {
        if (rango.min_cantidad === 1 && rango.max_cantidad === 1) {
            Swal.fire({
                title: "Error",
                text: "No se puede eliminar el precio para 1 unidad",
                icon: "error",
                timer: 2000
            });
            return;
        }
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
            await camisaService.deletePrecioCamisaRango(rango.id!);
            await cargarRangosPrecios(selectedCamisaForPrecios!.id!);
        }
    };

    // Filtros y búsqueda
    const inventarioFiltrado = inventario.filter(inv => {
        const camisaDesc = inv.camisa?.descripcion?.toLowerCase() || '';
        const tallaTxt = inv.talla?.talla?.toLowerCase() || '';
        const colorTxt = inv.color?.nombre_color?.toLowerCase() || '';
        return (
            (!search || camisaDesc.includes(search.toLowerCase()) || tallaTxt.includes(search.toLowerCase()) || colorTxt.includes(search.toLowerCase())) &&
            (!filterCamisa || camisaDesc === filterCamisa.toLowerCase()) &&
            (!filterTalla || tallaTxt === filterTalla.toLowerCase()) &&
            (!filterColor || colorTxt === filterColor.toLowerCase())
        );
    });

    // Obtener opciones únicas para filtros
    const camisasUnicas = Array.from(new Set(inventario.map(i => i.camisa?.descripcion))).filter(Boolean) as string[];
    const tallasUnicas = Array.from(new Set(inventario.map(i => i.talla?.talla))).filter(Boolean) as string[];
    const coloresUnicos = Array.from(new Set(inventario.map(i => i.color?.nombre_color))).filter(Boolean) as string[];

    // Abrir dialog para agregar combinaciones
    const handleOpenCombinacionesDialog = (camisa: Camisa) => {
        setSelectedCamisaForCombinaciones(camisa);
        setCombinaciones([]);
        setTalla('');
        setColor('');
        setRgb('#000000');
        setStock(1);
        setCombinacionesDialogOpen(true);
    };

    // Agregar combinaciones a camisa existente
    const handleAgregarCombinaciones = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCamisaForCombinaciones || combinaciones.length === 0) return;

        for (const comb of combinaciones) {
            // Crear talla o buscar existente
            let tallaObj = null;
            const { data: tallasExist } = await camisaService.getAllTallas();
            tallaObj = tallasExist.find((t: Talla) => t.id_camisa === selectedCamisaForCombinaciones.id && t.talla === comb.talla);
            if (!tallaObj) {
                const { data } = await camisaService.createTalla({ id_camisa: selectedCamisaForCombinaciones.id, talla: comb.talla });
                tallaObj = data;
            }
            // Crear color o buscar existente
            let colorObj = null;
            const { data: coloresExist } = await camisaService.getAllColores();
            colorObj = coloresExist.find((c: Color) => c.id_camisa === selectedCamisaForCombinaciones.id && c.nombre_color === comb.color && c.rgb === comb.rgb);
            if (!colorObj) {
                const { data } = await camisaService.createColor({ id_camisa: selectedCamisaForCombinaciones.id, nombre_color: comb.color, rgb: comb.rgb });
                colorObj = data;
            }
            // Crear inventario
            try {
                await camisaService.createInventario({ id_camisa: selectedCamisaForCombinaciones.id, id_talla: tallaObj.id, id_color: colorObj.id, stock: comb.stock });
            } catch (error: any) {
                setCombinacionesDialogOpen(false);
                if (error.response && error.response.status === 409) {
                    const { existingInventario } = error.response.data;
                    const mensaje = `[${selectedCamisaForCombinaciones.descripcion} - ${tallaObj.talla} - ${colorObj.nombre_color}] ya existe, ¿desea agregar el stock a la existente?`;
                    const result = await Swal.fire({
                        title: "Combinación existente",
                        text: mensaje,
                        icon: "question",
                        showCancelButton: true,
                        confirmButtonText: "Sí, agregar stock",
                        cancelButtonText: "No",
                    });

                    if (result.isConfirmed) {
                        await camisaService.entradaStock(existingInventario.id, comb.stock);
                    }
                } else {
                    console.error('Error creating inventory:', error);
                    Swal.fire({
                        title: "Error",
                        text: "No se pudo crear la combinación.",
                        icon: "error"
                    });
                }
            }
        }

        setCombinacionesDialogOpen(false);
        setSelectedCamisaForCombinaciones(null);
        setCombinaciones([]);
        cargarInventario();
    };

    // Abrir dialog para editar rango
    const handleOpenEditRangoDialog = (rango: PrecioRango) => {
        setEditRango(rango);
        setEditRangoId(rango.id!);
    };

    // Guardar rango editado
    const handleSaveEditRango = async () => {
        if (!editRangoId || !selectedCamisaForPrecios) return;
        await camisaService.updatePrecioCamisaRango(editRangoId, editRango);
        setEditRangoId(null);
        setEditRango({ id_camisa: 0, min_cantidad: 1, max_cantidad: 1, precio_unitario: 0 });
        await cargarRangosPrecios(selectedCamisaForPrecios.id!);
    };

    return (
        <div className="p-4 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold flex items-center gap-2"><FaTshirt className="text-blue-600" /> Inventario de Camisas</h2>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button className="">Registrar Nueva Camisa</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
                        <form onSubmit={handleAgregarCamisa}>
                            <DialogHeader>
                                <DialogTitle>Registrar Nueva Camisa</DialogTitle>
                                <DialogDescription>Agrega una camisa y sus combinaciones de talla, color y stock.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                    <label htmlFor="descripcion" className="text-sm font-medium text-gray-700">
                                        Descripción de la camisa
                                    </label>
                                    <Input
                                        id="descripcion"
                                        type="text"
                                        placeholder="Ej: Camisa de algodón premium"
                                        value={nuevaCamisa}
                                        onChange={e => setNuevaCamisa(e.target.value)}
                                        className="w-full"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="precioBasico" className="text-sm font-medium text-gray-700">
                                        Precio básico por unidad
                                    </label>
                                    <Input
                                        id="precioBasico"
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={precioBasico}
                                        onChange={e => setPrecioBasico(Number(e.target.value))}
                                        className="w-full"
                                        required
                                    />
                                </div>
                                <div className="border-t pt-4">
                                    <h3 className="font-semibold mb-2">Combinaciones talla/color/stock</h3>
                                    <div className="flex gap-2 mb-2">
                                        <div className="space-y-1 flex-1">
                                            <label htmlFor="talla" className="text-xs font-medium text-gray-600">
                                                Talla
                                            </label>
                                            <Select onValueChange={setTalla} value={talla}>
                                                <SelectTrigger id="talla">
                                                    <SelectValue placeholder="Seleccione una talla" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {tallasComunes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-1 flex-1">
                                            <label htmlFor="color" className="text-xs font-medium text-gray-600">
                                                Color
                                            </label>
                                            <Select onValueChange={handleColorChange} value={color}>
                                                <SelectTrigger id="color">
                                                    <SelectValue placeholder="Seleccione un color" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {coloresComunes.map(c => <SelectItem key={c.nombre} value={c.nombre}>{c.nombre}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid w-20">
                                            <label htmlFor="rgb" className="text-xs font-medium text-gray-600">
                                                Color RGB
                                            </label>
                                            <input
                                                id="rgb"
                                                type="color"
                                                value={rgb}
                                                onChange={e => setRgb(e.target.value)}
                                                className="w-12 h-10 p-0 border rounded"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label htmlFor="stock" className="text-xs font-medium text-gray-600">
                                                Stock
                                            </label>
                                            <Input
                                                id="stock"
                                                type="number"
                                                min={1}
                                                placeholder="10"
                                                value={stock}
                                                onChange={e => setStock(Number(e.target.value))}
                                                className="w-20"
                                            />
                                        </div>
                                        <div className="space-y-1 mt-5">
                                            <label className="text-xs font-medium text-gray-600 opacity-0">
                                                Acción
                                            </label>
                                            <Button type="button" onClick={handleAddCombinacion} className="bg-green-600 text-white h-10">Añadir</Button>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {combinaciones.map((comb, idx) => (
                                            <div key={idx} className="flex items-center gap-2 bg-gray-100 rounded px-3 py-1">
                                                <span className="font-semibold">{comb.talla}</span>
                                                <span className="flex items-center gap-1">
                                                    <span className="inline-block w-5 h-5 rounded-full border" style={{ background: comb.rgb }}></span>
                                                    {comb.color}
                                                </span>
                                                <span className="text-xs text-gray-600">Stock: {comb.stock}</span>
                                                <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveCombinacion(idx)} className="text-red-500 ml-2">✕</Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <DialogFooter className='mt-5'>
                                <Button type="submit" className="bg-blue-600 text-white">Guardar camisa</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Lista de Camisas */}
            <Card className="mb-6">
                <CardHeader className="p-4 pb-0">
                    <CardTitle className="text-base font-medium">Camisas Registradas</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                    <div className="grid gap-3">
                        {camisas.map(camisa => (
                            <div key={camisa.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                                <div className="flex items-center gap-3">
                                    <FaTshirt className="text-blue-600 text-xl" />
                                    <span className="font-medium">{camisa.descripcion}</span>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleOpenPreciosDialog(camisa)}
                                    >
                                        Modificar Precios
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleOpenCombinacionesDialog(camisa)}
                                    >
                                        Agregar Combinaciones
                                    </Button>
                                    <Button

                                        className='text-white'
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleDeleteCamisa(camisa.id!)}
                                    >
                                        Eliminar
                                    </Button>
                                </div>
                            </div>
                        ))}
                        {camisas.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                <FaTshirt className="text-4xl mx-auto mb-2 text-gray-300" />
                                <p>No hay camisas registradas</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card className="mb-6">
                <CardHeader className="p-4 pb-0">
                    <CardTitle className="text-base font-medium">Inventario de Camisas</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row justify-between mb-4 gap-4">
                        <div className="space-y-1">
                            <label htmlFor="search" className="text-sm font-medium text-gray-700">
                                Buscar en inventario
                            </label>
                            <Input
                                id="search"
                                type="text"
                                placeholder="Buscar por camisa, talla o color"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full md:w-[300px]"
                            />
                        </div>
                        <div className="flex gap-2">
                            <div className="space-y-1">

                                <select id="filterCamisa" value={filterCamisa} onChange={e => setFilterCamisa(e.target.value)} className="border rounded px-2 py-1">
                                    <option value="">Todas las camisas</option>
                                    {camisasUnicas.map((c, i) => <option key={i} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1">

                                <select id="filterTalla" value={filterTalla} onChange={e => setFilterTalla(e.target.value)} className="border rounded px-2 py-1">
                                    <option value="">Todas las tallas</option>
                                    {tallasUnicas.map((t, i) => <option key={i} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1">

                                <select id="filterColor" value={filterColor} onChange={e => setFilterColor(e.target.value)} className="border rounded px-2 py-1">
                                    <option value="">Todos los colores</option>
                                    {coloresUnicos.map((c, i) => <option key={i} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Camisa</TableHead>
                                    <TableHead>Talla</TableHead>
                                    <TableHead>Color</TableHead>
                                    <TableHead>Stock Total</TableHead>
                                    <TableHead>Reservado</TableHead>
                                    <TableHead>Disponible</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {inventarioFiltrado.map(inv => (
                                    <TableRow key={inv.id}>
                                        <TableCell>{inv.camisa?.descripcion}</TableCell>
                                        <TableCell>{inv.talla?.talla || inv.id_talla}</TableCell>
                                        <TableCell>
                                            <span className="inline-block w-5 h-5 rounded-full border align-middle mr-2" style={{ background: inv.color?.rgb }}></span>
                                            {inv.color?.nombre_color || inv.id_color}
                                        </TableCell>
                                        <TableCell>{inv.stock}</TableCell>
                                        <TableCell>{inv.reserved_quantity ?? 0}</TableCell>
                                        <TableCell>{inv.available_quantity ?? ((inv.stock) - (inv.reserved_quantity ?? 0))}</TableCell>
                                        <TableCell className="flex  justify-end gap-2">
                                            <Button variant="outline" size="sm" onClick={() => handleOpenEditDialog(inv)}>
                                                Editar Stock
                                            </Button>

                                            <Button
                                                className='text-white'
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleDeleteCombinacion(inv)}
                                            >
                                                Eliminar Combinación
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>Editar Stock</DialogTitle>
                        <DialogDescription>
                            Modifica el stock de la combinación seleccionada.
                        </DialogDescription>
                    </DialogHeader>
                    {editInventario && (
                        <div className="mb-4">
                            <div className="mb-2"><b>Camisa:</b> {editInventario.camisa?.descripcion}</div>
                            <div className="mb-2"><b>Talla:</b> {editInventario.talla?.talla}</div>
                            <div className="mb-2 flex items-center gap-2"><b>Color:</b> <span className="inline-block w-5 h-5 rounded-full border" style={{ background: editInventario.color?.rgb }}></span> {editInventario.color?.nombre_color}</div>
                            <div className="mb-2"><b>Stock Total:</b> {editInventario.stock}</div>
                            <div className="mb-2"><b>Reservado:</b> {editInventario.reserved_quantity ?? 0}</div>
                            <div className="mb-2"><b>Disponible:</b> {editInventario.available_quantity ?? ((editInventario.stock) - (editInventario.reserved_quantity ?? 0))}</div>
                            <div className="flex gap-2 items-end mb-2">
                                <div className="flex flex-col mt-10">
                                    <label className="block font-semibold mb-1"><b>Ajustar Stock</b></label>
                                    <label htmlFor="editStockValue" className="block text-xs font-semibold mb-1">Cantidad a ajustar</label>
                                    <Input
                                        id="editStockValue"
                                        type="number"
                                        min={1}
                                        onChange={e => setEditStockValue(Number(e.target.value))}
                                        className="w-24"
                                    />
                                    <div className="flex gap-2 mt-2">
                                        <Button className="w-full" onClick={async () => {
                                            await camisaService.entradaStock(editInventario.id, editStockValue);
                                            setEditStockValue(1);
                                            setEditDialogOpen(false);
                                            setEditInventario(null);
                                            cargarInventario();
                                        }}>Entrada</Button>
                                        <Button className="w-full text-white" variant="destructive" onClick={async () => {

                                            try {
                                                await camisaService.salidaStock(editInventario.id, editStockValue);
                                                setEditStockValue(1);
                                                setEditDialogOpen(false);
                                                setEditInventario(null);
                                                cargarInventario();

                                            } catch (error: any) {
                                                if (error.status === 400) {
                                                    Swal.fire({
                                                        title: "Error",
                                                        text: "El numero no puede ser menor a el stock total",
                                                        icon: "error",
                                                        timer: 2000
                                                    });

                                                    return;
                                                }

                                            }



                                        }}>Salida</Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {/* <DialogFooter>
            <Button onClick={handleSaveStock} className="bg-blue-600 text-white">Editar directo</Button>
          </DialogFooter> */}
                </DialogContent>
            </Dialog>

            {/* Dialog para rangos de precios */}
            <Dialog open={preciosDialogOpen} onOpenChange={setPreciosDialogOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Rangos de Precios - {selectedCamisaForPrecios?.descripcion}</DialogTitle>
                        <DialogDescription>
                            Gestiona los rangos de precios para esta camisa.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mb-4">
                        <div className="flex gap-2 mb-4">
                            <div className="space-y-1">
                                <label htmlFor="minCantidad" className="text-xs font-medium text-gray-600">
                                    Cantidad mínima
                                </label>
                                <Input
                                    id="minCantidad"
                                    type="number"
                                    placeholder="1"
                                    value={nuevoRango.min_cantidad}
                                    onChange={e => setNuevoRango({ ...nuevoRango, min_cantidad: Number(e.target.value) })}
                                    className="w-24"
                                />
                            </div>
                            <div className="space-y-1">
                                <label htmlFor="maxCantidad" className="text-xs font-medium text-gray-600">
                                    Cantidad máxima
                                </label>
                                <Input
                                    id="maxCantidad"
                                    type="number"
                                    placeholder="10"
                                    value={nuevoRango.max_cantidad}
                                    onChange={e => setNuevoRango({ ...nuevoRango, max_cantidad: Number(e.target.value) })}
                                    className="w-24"
                                />
                            </div>
                            <div className="space-y-1">
                                <label htmlFor="precioUnitario" className="text-xs font-medium text-gray-600">
                                    Precio unitario
                                </label>
                                <Input
                                    id="precioUnitario"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={nuevoRango.precio_unitario}
                                    onChange={e => setNuevoRango({ ...nuevoRango, precio_unitario: Number(e.target.value) })}
                                    className="w-32"
                                />
                            </div>
                            <div className="space-y-1 mt-5">
                                <label className="text-xs font-medium text-gray-600 opacity-0">
                                    Acción
                                </label>
                                <Button onClick={handleAddRangoPrecio}>Agregar Rango</Button>
                            </div>
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Cantidad Mín</TableHead>
                                    <TableHead>Cantidad Máx</TableHead>
                                    <TableHead>Precio Unitario</TableHead>
                                    <TableHead>Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rangosPrecios.map(rango => (
                                    <TableRow key={rango.id}>
                                        <TableCell>{rango.min_cantidad}</TableCell>
                                        <TableCell>{rango.max_cantidad}</TableCell>
                                        <TableCell>${rango.precio_unitario}</TableCell>
                                        <TableCell>
                                            <Button
                                                className='text-white'
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleDeleteRangoPrecio(rango)}
                                                disabled={rango.min_cantidad === 1 && rango.max_cantidad === 1}
                                            >
                                                Eliminar
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleOpenEditRangoDialog(rango)}
                                                className="ml-2"
                                            >
                                                Editar
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Dialog para agregar combinaciones */}
            <Dialog open={combinacionesDialogOpen} onOpenChange={setCombinacionesDialogOpen}>
                <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
                    <form onSubmit={handleAgregarCombinaciones}>
                        <DialogHeader>
                            <DialogTitle>Agregar Combinaciones - {selectedCamisaForCombinaciones?.descripcion}</DialogTitle>
                            <DialogDescription>Agrega nuevas combinaciones de talla, color y stock para esta camisa.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="border-t pt-4">
                                <h3 className="font-semibold mb-2">Nuevas combinaciones talla/color/stock</h3>
                                <div className="flex gap-2 mb-2">
                                    <div className="space-y-1 flex-1">
                                        <label htmlFor="tallaCombinacion" className="text-xs font-medium text-gray-600">
                                            Talla
                                        </label>
                                        <Select onValueChange={setTalla} value={talla}>
                                            <SelectTrigger id="tallaCombinacion">
                                                <SelectValue placeholder="Seleccione una talla" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {tallasComunes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1 flex-1">
                                        <label htmlFor="colorCombinacion" className="text-xs font-medium text-gray-600">
                                            Color
                                        </label>
                                        <Select onValueChange={handleColorChange} value={color}>
                                            <SelectTrigger id="colorCombinacion">
                                                <SelectValue placeholder="Seleccione un color" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {coloresComunes.map(c => <SelectItem key={c.nombre} value={c.nombre}>{c.nombre}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid w-20">
                                        <label htmlFor="rgbCombinacion" className="text-xs font-medium text-gray-600">
                                            Color RGB
                                        </label>
                                        <input
                                            id="rgbCombinacion"
                                            type="color"
                                            value={rgb}
                                            onChange={e => setRgb(e.target.value)}
                                            className="w-12 h-10 p-0 border rounded"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label htmlFor="stockCombinacion" className="text-xs font-medium text-gray-600">
                                            Stock
                                        </label>
                                        <Input
                                            id="stockCombinacion"
                                            type="number"
                                            min={1}
                                            placeholder="10"
                                            value={stock}
                                            onChange={e => setStock(Number(e.target.value))}
                                            className="w-20"
                                        />
                                    </div>
                                    <div className="space-y-1 mt-5">
                                        <label className="text-xs font-medium text-gray-600 opacity-0">
                                            Acción
                                        </label>
                                        <Button type="button" onClick={handleAddCombinacion} className="bg-green-600 text-white h-10 -t-10">Añadir</Button>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {combinaciones.map((comb, idx) => (
                                        <div key={idx} className="flex items-center gap-2 bg-gray-100 rounded px-3 py-1">
                                            <span className="font-semibold">{comb.talla}</span>
                                            <span className="flex items-center gap-1">
                                                <span className="inline-block w-5 h-5 rounded-full border" style={{ background: comb.rgb }}></span>
                                                {comb.color}
                                            </span>
                                            <span className="text-xs text-gray-600">Stock: {comb.stock}</span>
                                            <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveCombinacion(idx)} className="text-red-500 ml-2">✕</Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <DialogFooter className='mt-5'>
                            <Button type="submit" className="bg-blue-600 text-white">Guardar combinaciones</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Dialog para editar rango de precio */}
            <Dialog open={editRangoId !== null} onOpenChange={() => setEditRangoId(null)}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>Editar Rango de Precio</DialogTitle>
                        <DialogDescription>
                            Modifica las cantidades y precio del rango seleccionado.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <label htmlFor="editMinCantidad" className="text-sm font-medium text-gray-700">
                                Cantidad mínima
                            </label>
                            <Input
                                id="editMinCantidad"
                                type="number"
                                placeholder="1"
                                value={editRango.min_cantidad}
                                onChange={e => setEditRango({ ...editRango, min_cantidad: Number(e.target.value) })}
                                className="w-full"
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="editMaxCantidad" className="text-sm font-medium text-gray-700">
                                Cantidad máxima
                            </label>
                            <Input
                                id="editMaxCantidad"
                                type="number"
                                placeholder="10"
                                value={editRango.max_cantidad}
                                onChange={e => setEditRango({ ...editRango, max_cantidad: Number(e.target.value) })}
                                className="w-full"
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="editPrecioUnitario" className="text-sm font-medium text-gray-700">
                                Precio unitario
                            </label>
                            <Input
                                id="editPrecioUnitario"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={editRango.precio_unitario}
                                onChange={e => setEditRango({ ...editRango, precio_unitario: Number(e.target.value) })}
                                className="w-full"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleSaveEditRango} className="bg-blue-600 text-white">Guardar cambios</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}