"use client"

import { useState, useRef, useEffect } from "react"
import { ArrowLeft, ShoppingCart, ArrowRight, Plus, X } from "lucide-react"
import Link from "next/link"
import { reader } from "@/components/camisa/helper"
import { Model } from "@/components/camisa/model"
import Controls from "@/components/camisa/containers/Controls"
import { Irgb } from "@/components/camisa/types/Irgb"
import camisaService from "@/services/camisasServices"

// Tipos para el diseño de la camisa
interface CamisaDesign {
    color: { r: number; g: number; b: number };
    logoF: string;
    logoT: string;
    logoMD: string;
    logoMI: string;
    isLogo: boolean;
    frontalScale: number;
    frontalX: number;
    frontalY: number;
    traseroScale: number;
    traseroX: number;
    traseroY: number;
}

interface Camisa {
    id: number;
    descripcion: string;
    activo: boolean;
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
    stock: number;
    reserved_quantity?: number;
    available_quantity?: number;
    talla?: Talla;
    color?: Color;
    camisa?: Camisa;
}

interface PrecioRango {
    id: number;
    id_camisa: number;
    min_cantidad: number;
    max_cantidad: number;
    precio_unitario: number;
}

interface ItemSeleccionado {
    id: string;
    camisa: Camisa;
    talla: string;
    color: Color;
    cantidad: number;
}

export default function ProductPersonalizationPage() {
    const [currentPhase, setCurrentPhase] = useState(1);
    const [isMobile, setIsMobile] = useState(false);
    const [color, setColor] = useState({ r: 19, g: 97, b: 189 });
    const [isLogo, setIsLogo] = useState(true);
    const [isFull, setIsFull] = useState(false);
    const [logoS, setLogoS] = useState(0);
    const [logoP, setLogoP] = useState(2);
    const [logoF, setLogoF] = useState<string>('/logo.png');
    const [logoT, setLogoT] = useState<string>('/logo.png');
    const [logoMD, setLogoMD] = useState<string>('/logo.png');
    const [logoMI, setLogoMI] = useState<string>('/logo.png');
    const [error, setError] = useState<string | null>(null);
    const [nombre, setNombre] = useState("");

    // Estados para datos de la API
    const [camisas, setCamisas] = useState<Camisa[]>([]);
    const [inventario, setInventario] = useState<Inventario[]>([]);
    const [rangosPrecios, setRangosPrecios] = useState<PrecioRango[]>([]);
    const [loading, setLoading] = useState(false);

    // Estados para múltiples selecciones
    const [itemsSeleccionados, setItemsSeleccionados] = useState<ItemSeleccionado[]>([]);
    const [selectedCamisa, setSelectedCamisa] = useState<Camisa | null>(null);
    const [selectedTalla, setSelectedTalla] = useState<string>("");
    const [selectedColor, setSelectedColor] = useState<Color | null>(null);
    const [cantidad, setCantidad] = useState(1);

    // Estados para el control de posición y escala
    const [frontalScale, setFrontalScale] = useState(0.2);
    const [frontalX, setFrontalX] = useState(0);
    const [frontalY, setFrontalY] = useState(0.05);
    const [traseroScale, setTraseroScale] = useState(0.2);
    const [traseroX, setTraseroX] = useState(0);
    const [traseroY, setTraseroY] = useState(0.05);

    const precioPersonalizacion = 5.99;

    const tref = useRef(null);

    // Cargar datos cuando se entra a la fase 2
    useEffect(() => {
        if (currentPhase === 2) {
            cargarDatos();
        }
    }, [currentPhase]);

    const cargarDatos = async () => {
        setLoading(true);
        try {
            const [camisasRes, inventarioRes, preciosRes] = await Promise.all([
                camisaService.getAllCamisas(),
                camisaService.getAllInventario(),
                camisaService.getAllPreciosCamisaRango()
            ]);

            setCamisas(camisasRes.data);
            setInventario(inventarioRes.data);
            setRangosPrecios(preciosRes.data);
        } catch (error) {
            console.error('Error cargando datos:', error);
        } finally {
            setLoading(false);
        }
    };

    // Obtener tallas disponibles para una camisa
    const getTallasDisponibles = (camisaId: number) => {
        const inventarioCamisa = inventario.filter(inv => inv.id_camisa === camisaId);
        const tallasUnicas = Array.from(new Set(inventarioCamisa.map(inv => inv.talla?.talla))).filter(Boolean);
        return tallasUnicas;
    };

    // Obtener colores disponibles para una camisa y talla
    const getColoresDisponibles = (camisaId: number, talla: string) => {
        const inventarioFiltrado = inventario.filter(inv =>
            inv.id_camisa === camisaId &&
            inv.talla?.talla === talla &&
            inv.available_quantity && inv.available_quantity > 0
        );
        return inventarioFiltrado.map(inv => inv.color).filter(Boolean);
    };

    // Obtener stock disponible para una combinación específica (considerando items ya seleccionados)
    const getStockDisponible = (camisaId: number, talla: string, colorId: number) => {
        const inventarioItem = inventario.find(inv =>
            inv.id_camisa === camisaId &&
            inv.talla?.talla === talla &&
            inv.color?.id === colorId
        );

        if (!inventarioItem) return 0;

        // Calcular cuántos items de esta combinación ya están seleccionados
        const itemsYaSeleccionados = itemsSeleccionados.filter(item =>
            item.camisa.id === camisaId &&
            item.talla === talla &&
            item.color.id === colorId
        ).reduce((total, item) => total + item.cantidad, 0);

        // Stock disponible = stock original - items ya seleccionados
        return Math.max(0, (inventarioItem.available_quantity || 0) - itemsYaSeleccionados);
    };

    // Obtener colores disponibles considerando stock real disponible
    const getColoresDisponiblesConStock = (camisaId: number, talla: string) => {
        const inventarioFiltrado = inventario.filter(inv =>
            inv.id_camisa === camisaId &&
            inv.talla?.talla === talla
        );

        return inventarioFiltrado
            .map(inv => inv.color)
            .filter(Boolean)
            .filter(color => {
                const stockDisponible = getStockDisponible(camisaId, talla, color!.id);
                return stockDisponible > 0;
            });
    };

    // Calcular precio basado en la cantidad y rangos de precios
    const calcularPrecio = (camisaId: number, cantidad: number) => {
        const rangosCamisa = rangosPrecios.filter(r => r.id_camisa === camisaId);
        const rangoAplicable = rangosCamisa.find(r =>
            cantidad >= r.min_cantidad && cantidad <= r.max_cantidad
        );

        if (rangoAplicable) {
            return rangoAplicable.precio_unitario * cantidad;
        }

        // Si no encuentra rango, usar el precio básico (rango 1-1)
        const precioBasico = rangosCamisa.find(r => r.min_cantidad === 1 && r.max_cantidad === 1);
        return precioBasico ? precioBasico.precio_unitario * cantidad : 0;
    };

    // Obtener información del rango de precios aplicable
    const getRangoPrecioInfo = (camisaId: number, cantidad: number) => {
        const rangosCamisa = rangosPrecios.filter(r => r.id_camisa === camisaId);
        const rangoAplicable = rangosCamisa.find(r =>
            cantidad >= r.min_cantidad && cantidad <= r.max_cantidad
        );

        if (rangoAplicable) {
            return {
                precio: rangoAplicable.precio_unitario,
                min: rangoAplicable.min_cantidad,
                max: rangoAplicable.max_cantidad
            };
        }

        const precioBasico = rangosCamisa.find(r => r.min_cantidad === 1 && r.max_cantidad === 1);
        return precioBasico ? {
            precio: precioBasico.precio_unitario,
            min: 1,
            max: 1
        } : null;
    };

    // Obtener el precio más bajo para una camisa
    const getPrecioMasBajo = (camisaId: number) => {
        const rangosCamisa = rangosPrecios.filter(r => r.id_camisa === camisaId);
        if (rangosCamisa.length === 0) return null;

        const precioMasBajo = Math.min(...rangosCamisa.map(r => r.precio_unitario));
        const rangoMasBajo = rangosCamisa.find(r => r.precio_unitario === precioMasBajo);

        return rangoMasBajo ? {
            precio: rangoMasBajo.precio_unitario,
            min: rangoMasBajo.min_cantidad,
            max: rangoMasBajo.max_cantidad
        } : null;
    };

    // Agregar item a la selección
    const agregarItem = () => {
        if (!selectedCamisa || !selectedTalla || !selectedColor || cantidad <= 0) return;

        const nuevoItem: ItemSeleccionado = {
            id: `${selectedCamisa.id}-${selectedTalla}-${selectedColor.id}-${Date.now()}`,
            camisa: selectedCamisa,
            talla: selectedTalla,
            color: selectedColor,
            cantidad: cantidad
        };

        setItemsSeleccionados([...itemsSeleccionados, nuevoItem]);

        // Resetear selección
        setSelectedCamisa(null);
        setSelectedTalla("");
        setSelectedColor(null);
        setCantidad(1);
    };

    // Eliminar item de la selección
    const eliminarItem = (itemId: string) => {
        setItemsSeleccionados(itemsSeleccionados.filter(item => item.id !== itemId));
    };

    // Calcular precio total de todos los items
    const calcularPrecioTotal = () => {
        return itemsSeleccionados.reduce((total, item) => {
            const precioBase = calcularPrecio(item.camisa.id, item.cantidad);
            const precioPersonalizacionTotal = precioPersonalizacion * item.cantidad;
            return total + precioBase + precioPersonalizacionTotal;
        }, 0);
    };

    const handleFileChange = async (file: File | null, parte: 'frontal' | 'trasero' | 'mangaDerecha' | 'mangaIzquierda') => {
        if (file) {
            try {
                const result = await reader(file);
                switch (parte) {
                    case 'frontal':
                        setLogoF(result);
                        break;
                    case 'trasero':
                        setLogoT(result);
                        break;
                    case 'mangaDerecha':
                        setLogoMD(result);
                        break;
                    case 'mangaIzquierda':
                        setLogoMI(result);
                        break;
                }
                setError(null);
            } catch (err) {
                setError('Error al procesar la imagen');
            }
        }
    };

    const handleLogo = () => {
        setIsLogo(!isLogo);
    };

    const handleFull = () => {
        setIsFull(!isFull);
    };

    const handleLogoP = (ind: number) => {
        setLogoP(ind);
    };

    const handleLogoS = (ind: number) => {
        setLogoS(ind);
    };

    const changeColor = (rgb: Irgb) => {
        setColor({ r: rgb.r, g: rgb.g, b: rgb.b });
    };

    useEffect(() => {
        if (window.innerWidth < 768) setIsMobile(true);
    }, []);

    const checkScreen = () => {
        if (window.innerWidth < 768) setIsMobile(true);
        else setIsMobile(false);
    };

    const handleNextPhase = () => {
        if (currentPhase < 3) {
            setCurrentPhase(currentPhase + 1);
        }
    };

    const handlePrevPhase = () => {
        if (currentPhase > 1) {
            setCurrentPhase(currentPhase - 1);
        }
    };

    const handleAgregarAlCarrito = () => {
        const precioTotal = calcularPrecioTotal();
        console.log({
            nombre,
            items: itemsSeleccionados,
            logoF,
            logoT,
            logoMD,
            logoMI,
            precioTotal: precioTotal
        });
    };

    const handleFrontalChange = (scale: number, x: number, y: number) => {
        setFrontalScale(scale);
        setFrontalX(x);
        setFrontalY(y);
    };

    const handleTraseroChange = (scale: number, x: number, y: number) => {
        setTraseroScale(scale);
        setTraseroX(x);
        setTraseroY(y);
    };

    // Renderizar fase 1: Diseño de la camisa
    const renderPhase1 = () => (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <Link href="/personalization" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Volver a la selección de productos
                    </Link>
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-800 mb-2">
                                Fase 1: Diseña tu Camisa
                            </h1>
                            <p className="text-gray-600 text-lg">
                                Personaliza el diseño de tu camisa con nuestra herramienta en tiempo real
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">Fase 1 de 3</span>
                            <div className="flex gap-1">
                                <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                                <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                                <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex h-[650px]">
                    {/* Sección de la Camisa */}
                    <div className="w-1/2 h-full overflow-hidden bg-center bg-main-img relative">
                        <section className="h-full">
                            <Model
                                isMobile={isMobile}
                                color={color}
                                logoF={logoF}
                                logoT={logoT}
                                logoMD={logoMD}
                                logoMI={logoMI}
                                isLogo={isLogo}
                                frontalScale={frontalScale}
                                frontalX={frontalX}
                                frontalY={frontalY}
                                traseroScale={traseroScale}
                                traseroX={traseroX}
                                traseroY={traseroY}
                            />
                        </section>
                    </div>

                    {/* Sección de Controles */}
                    <div className="w-1/2 h-full overflow-y-auto p-6">
                        <Controls
                            color={color}
                            changeColor={changeColor}
                            setFile={handleFileChange}
                            error={error}
                            onFrontalChange={handleFrontalChange}
                            onTraseroChange={handleTraseroChange}
                        />
                    </div>
                </div>

                {/* Botón para continuar a la siguiente fase */}
                <div className="mt-8 flex justify-end">
                    <button
                        onClick={handleNextPhase}
                        className="bg-blue-600 text-white py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        Continuar a Selección
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );

    // Renderizar fase 2: Selección de camisa, talla, color, cantidad
    const renderPhase2 = () => {
        const tallasDisponibles = selectedCamisa ? getTallasDisponibles(selectedCamisa.id) : [];
        const coloresDisponibles = selectedCamisa && selectedTalla ? getColoresDisponiblesConStock(selectedCamisa.id, selectedTalla) : [];
        const precioMasBajo = selectedCamisa ? getPrecioMasBajo(selectedCamisa.id) : null;

        return (
            <div className="min-h-screen bg-gray-50">
                <div className="container mx-auto px-4 py-8">
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h1 className="text-4xl font-bold text-gray-800 mb-2">
                                    Fase 2: Selecciona tus Camisas
                                </h1>
                                <p className="text-gray-600 text-lg">
                                    Elige las camisas, tallas, colores y cantidades que deseas
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">Fase 2 de 3</span>
                                <div className="flex gap-1">
                                    <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                                    <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="text-lg">Cargando opciones disponibles...</div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Vista previa del diseño */}
                            <div className="bg-white rounded-lg shadow-lg p-6">
                                <h3 className="text-xl font-semibold mb-4">Vista Previa del Diseño</h3>
                                <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <Model
                                        isMobile={isMobile}
                                        color={color}
                                        logoF={logoF}
                                        logoT={logoT}
                                        logoMD={logoMD}
                                        logoMI={logoMI}
                                        isLogo={isLogo}
                                        frontalScale={frontalScale}
                                        frontalX={frontalX}
                                        frontalY={frontalY}
                                        traseroScale={traseroScale}
                                        traseroX={traseroX}
                                        traseroY={traseroY}
                                    />
                                </div>
                            </div>

                            {/* Formulario de selección */}
                            <div className="bg-white rounded-lg shadow-lg p-6">
                                <h3 className="text-xl font-semibold mb-6">Detalles del Pedido</h3>

                                <div className="space-y-6">
                                   

                                    {/* Items seleccionados */}
                                    {itemsSeleccionados.length > 0 && (
                                        <div className="border rounded-lg p-4">
                                            <h4 className="font-semibold mb-3">Camisas Seleccionadas:</h4>
                                            <div className="space-y-2">
                                                {itemsSeleccionados.map((item) => (
                                                    <div key={item.id} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                                                        <div className="flex items-center gap-3">
                                                            <div
                                                                className="w-4 h-4 rounded-full border border-gray-300"
                                                                style={{ backgroundColor: item.color.rgb }}
                                                            ></div>
                                                            <span className="text-sm">
                                                                {item.camisa.descripcion} - {item.talla} - {item.color.nombre_color} (x{item.cantidad})
                                                            </span>
                                                        </div>
                                                        <button
                                                            onClick={() => eliminarItem(item.id)}
                                                            className="text-red-500 hover:text-red-700"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Formulario para agregar nuevo item */}
                                    <div className="border-t pt-4">
                                        <h4 className="font-semibold mb-3">Agregar Camisa:</h4>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Seleccionar Camisa
                                                </label>
                                                <select
                                                    value={selectedCamisa?.id || ""}
                                                    onChange={(e) => {
                                                        const camisa = camisas.find(c => c.id === parseInt(e.target.value));
                                                        setSelectedCamisa(camisa || null);
                                                        setSelectedTalla("");
                                                        setSelectedColor(null);
                                                    }}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                >
                                                    <option value="">Selecciona una camisa</option>
                                                    {camisas.map((camisa) => (
                                                        <option key={camisa.id} value={camisa.id}>
                                                            {camisa.descripcion}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            {selectedCamisa && (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Talla
                                                    </label>
                                                    <div className="grid grid-cols-3 gap-2">
                                                        {tallasDisponibles.map((t) => (
                                                            <button
                                                                key={t}
                                                                onClick={() => {
                                                                    if (t) {
                                                                        setSelectedTalla(t);
                                                                        setSelectedColor(null);
                                                                    }
                                                                }}
                                                                className={`p-3 border rounded-md hover:bg-gray-50 transition-colors ${selectedTalla === t ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300'
                                                                    }`}
                                                            >
                                                                {t}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {selectedTalla && (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Color
                                                    </label>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {coloresDisponibles.map((color) => (
                                                            <button
                                                                key={color?.id}
                                                                onClick={() => setSelectedColor(color || null)}
                                                                className={`flex items-center gap-2 p-2 border rounded-md hover:bg-gray-50 ${selectedColor?.id === color?.id ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                                                                    }`}
                                                            >
                                                                <div
                                                                    className="w-6 h-6 rounded-full border border-gray-300"
                                                                    style={{ backgroundColor: color?.rgb }}
                                                                ></div>
                                                                <span className="text-sm">{color?.nombre_color}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {selectedColor && (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Cantidad
                                                    </label>
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                                                                className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center text-gray-700 font-semibold"
                                                            >
                                                                -
                                                            </button>
                                                            <span className="w-12 text-center font-semibold">{cantidad}</span>
                                                            <button
                                                                onClick={() => {
                                                                    const stockDisponible = getStockDisponible(selectedCamisa!.id, selectedTalla, selectedColor.id);
                                                                    setCantidad(Math.min(stockDisponible, cantidad + 1));
                                                                }}
                                                                disabled={cantidad >= getStockDisponible(selectedCamisa!.id, selectedTalla, selectedColor.id)}
                                                                className="w-8 h-8 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-full flex items-center justify-center text-white font-semibold"
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                        <div className="text-sm text-gray-600">
                                                            Stock disponible: <span className="font-semibold">{getStockDisponible(selectedCamisa!.id, selectedTalla, selectedColor.id)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {precioMasBajo && (
                                                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                                    <p className="text-sm text-green-800">
                                                        <strong>¡Promoción!</strong> En la compra de {precioMasBajo.min} camisa{precioMasBajo.min > 1 ? 's' : ''} el precio es de ${precioMasBajo.precio.toFixed(2)} por unidad
                                                    </p>
                                                </div>
                                            )}

                                            <button
                                                onClick={agregarItem}
                                                disabled={!selectedCamisa || !selectedTalla || !selectedColor || cantidad <= 0}
                                                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                            >
                                                <Plus className="w-4 h-4" />
                                                Agregar a la Selección
                                            </button>
                                        </div>
                                    </div>

                                    {/* Resumen de precios */}
                                    {itemsSeleccionados.length > 0 && (
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <h4 className="text-lg font-semibold text-gray-800 mb-4">Resumen de Precios</h4>
                                            <div className="space-y-2">
                                                {itemsSeleccionados.map((item) => {
                                                    const precioBase = calcularPrecio(item.camisa.id, item.cantidad);
                                                    console.log(precioBase);
                                                    console.log(precioPersonalizacion);
                                                    const precioPersonalizacionTotal = precioPersonalizacion * item.cantidad;
                                                    console.log(precioPersonalizacionTotal);
                                                    return (
                                                        <div key={item.id} className="flex justify-between text-sm">
                                                            <span className="text-gray-600">
                                                                {item.camisa.descripcion} - {item.talla} - {item.color.nombre_color} (x{item.cantidad})
                                                            </span>
                                                            <span className="font-medium">
                                                                ${(precioBase + precioPersonalizacionTotal).toFixed(2)}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                                <div className="border-t pt-2 mt-2">
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-800 font-semibold">Total:</span>
                                                        <span className="text-blue-600 font-bold">
                                                            ${calcularPrecioTotal().toFixed(2)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                     <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Nombre del Producto
                                        </label>
                                        <input
                                            type="text"
                                            value={nombre}
                                            onChange={(e) => setNombre(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Ej: Camisa Empresarial"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Botones de navegación */}
                    <div className="mt-8 flex justify-between">
                        <button
                            onClick={handlePrevPhase}
                            className="bg-gray-500 text-white py-3 px-8 rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Volver al Diseño
                        </button>
                        <button
                            onClick={handleNextPhase}
                            disabled={itemsSeleccionados.length === 0}
                            className="bg-blue-600 text-white py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            Continuar al Pago
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // Renderizar fase 3: Pago (esqueleto)
    const renderPhase3 = () => {
        const precioTotal = calcularPrecioTotal();

        return (
            <div className="min-h-screen bg-gray-50">
                <div className="container mx-auto px-4 py-8">
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h1 className="text-4xl font-bold text-gray-800 mb-2">
                                    Fase 3: Finalizar Compra
                                </h1>
                                <p className="text-gray-600 text-lg">
                                    Completa tu pedido y procede al pago
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">Fase 3 de 3</span>
                                <div className="flex gap-1">
                                    <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                                    <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Resumen del pedido */}
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <h3 className="text-xl font-semibold mb-4">Resumen del Pedido</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                                        <Model
                                            isMobile={isMobile}
                                            color={color}
                                            logoF={logoF}
                                            logoT={logoT}
                                            logoMD={logoMD}
                                            logoMI={logoMI}
                                            isLogo={isLogo}
                                            frontalScale={frontalScale}
                                            frontalX={frontalX}
                                            frontalY={frontalY}
                                            traseroScale={traseroScale}
                                            traseroX={traseroX}
                                            traseroY={traseroY}
                                        />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold">{nombre || "Camisa Personalizada"}</h4>
                                        <p className="text-gray-600">{itemsSeleccionados.length} tipo(s) de camisa(s) seleccionada(s)</p>
                                    </div>
                                </div>

                                <div className="border-t pt-4">
                                    <div className="space-y-2 mb-4">
                                        {itemsSeleccionados.map((item) => (
                                            <div key={item.id} className="flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="w-4 h-4 rounded-full border border-gray-300"
                                                        style={{ backgroundColor: item.color.rgb }}
                                                    ></div>
                                                    <span>
                                                        {item.camisa.descripcion} - {item.talla} - {item.color.nombre_color} (x{item.cantidad})
                                                    </span>
                                                </div>
                                                <span>
                                                    ${(calcularPrecio(item.camisa.id, item.cantidad) + (precioPersonalizacion * item.cantidad)).toFixed(2)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="border-t pt-4">
                                        <div className="flex justify-between mb-2">
                                            <span>Subtotal:</span>
                                            <span>${precioTotal.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between mb-2">
                                            <span>Envío:</span>
                                            <span>$5.99</span>
                                        </div>
                                        <div className="flex justify-between font-semibold text-lg">
                                            <span>Total:</span>
                                            <span>${(precioTotal + 5.99).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Formulario de pago (esqueleto) */}
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <h3 className="text-xl font-semibold mb-4">Información de Pago</h3>
                            <div className="space-y-4">
                                <div className="bg-gray-100 p-4 rounded-lg text-center">
                                    <p className="text-gray-600">Formulario de pago</p>
                                    <p className="text-sm text-gray-500">(Por implementar)</p>
                                </div>

                                <div className="bg-gray-100 p-4 rounded-lg text-center">
                                    <p className="text-gray-600">Información de envío</p>
                                    <p className="text-sm text-gray-500">(Por implementar)</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Botones de navegación */}
                    <div className="mt-8 flex justify-between">
                        <button
                            onClick={handlePrevPhase}
                            className="bg-gray-500 text-white py-3 px-8 rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Volver a Selección
                        </button>
                        <button
                            onClick={handleAgregarAlCarrito}
                            className="bg-green-600 text-white py-3 px-8 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                        >
                            <ShoppingCart className="w-5 h-5" />
                            Completar Compra
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // Renderizar la fase correspondiente
    switch (currentPhase) {
        case 1:
            return renderPhase1();
        case 2:
            return renderPhase2();
        case 3:
            return renderPhase3();
        default:
            return renderPhase1();
    }
} 