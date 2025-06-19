"use client"

import { useState, useRef, useEffect } from "react"
import { ArrowLeft, ShoppingCart, ArrowRight, Plus, X } from "lucide-react"
import Link from "next/link"
import { reader } from "@/components/camisa/helper"
import { Model } from "@/components/camisa/model"
import Controls from "@/components/camisa/containers/Controls"
import { Irgb } from "@/components/camisa/types/Irgb"
import camisaService from "@/services/camisasServices"
import { FaTshirt } from "react-icons/fa";

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

    // const precioPersonalizacion = 5.99;

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

    // Obtener el precio base (rango 1-1) para una camisa
    const getPrecioBase = (camisaId: number) => {
        const rangosCamisa = rangosPrecios.filter(r => r.id_camisa === camisaId);
        const precioBase = rangosCamisa.find(r => r.min_cantidad === 1 && r.max_cantidad === 1);
        return precioBase ? precioBase.precio_unitario : null;
    };

    // Obtener todos los rangos de precios para una camisa
    const getRangosPreciosCamisa = (camisaId: number) => {
        return rangosPrecios
            .filter(r => r.id_camisa === camisaId)
            .sort((a, b) => a.min_cantidad - b.min_cantidad);
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

    // Agregar item a la selección
    const agregarItem = () => {
        if (!selectedCamisa || !selectedTalla || !selectedColor || cantidad <= 0) return;

        // Buscar si ya existe un item con la misma camisa, talla y color
        const itemExistente = itemsSeleccionados.find(item =>
            item.camisa.id === selectedCamisa.id &&
            item.talla === selectedTalla &&
            item.color.id === selectedColor.id
        );

        if (itemExistente) {
            // Si existe, actualizar la cantidad
            setItemsSeleccionados(itemsSeleccionados.map(item =>
                item.id === itemExistente.id
                    ? { ...item, cantidad: item.cantidad + cantidad }
                    : item
            ));
        } else {
            // Si no existe, crear nuevo item
            const nuevoItem: ItemSeleccionado = {
                id: `${selectedCamisa.id}-${selectedTalla}-${selectedColor.id}-${Date.now()}`,
                camisa: selectedCamisa,
                talla: selectedTalla,
                color: selectedColor,
                cantidad: cantidad
            };

            setItemsSeleccionados([...itemsSeleccionados, nuevoItem]);
        }

        // Resetear selección
        setSelectedCamisa(null);
        setSelectedTalla("");
        setSelectedColor(null);
        setCantidad(1);
        const nombre = document.getElementById("nombre_producto")
        nombre?.focus()
    };

    // Eliminar item de la selección
    const eliminarItem = (itemId: string) => {
        setItemsSeleccionados(itemsSeleccionados.filter(item => item.id !== itemId));
    };

    // Obtener información del descuento aplicado por camisa
    const getDescuentoAplicado = (camisaId: number) => {
        const itemsAgrupados = getItemsAgrupadosPorCamisa();
        const itemsCamisa = itemsAgrupados[camisaId];

        if (!itemsCamisa) return null;

        const cantidadTotal = itemsCamisa.reduce((sum, item) => sum + item.cantidad, 0);
        const rangoInfo = getRangoPrecioInfo(camisaId, cantidadTotal);
        const precioBase = getPrecioBase(camisaId);

        if (!rangoInfo || !precioBase) return null;

        const descuento = ((precioBase - rangoInfo.precio) / precioBase) * 100;

        return {
            cantidadTotal,
            precioUnitario: rangoInfo.precio,
            precioOriginal: precioBase,
            descuento: descuento,
            rango: rangoInfo
        };
    };

    // Obtener items agrupados por camisa para cálculo de precios
    const getItemsAgrupadosPorCamisa = () => {
        const agrupados: { [camisaId: number]: ItemSeleccionado[] } = {};

        itemsSeleccionados.forEach(item => {
            if (!agrupados[item.camisa.id]) {
                agrupados[item.camisa.id] = [];
            }
            agrupados[item.camisa.id].push(item);
        });

        return agrupados;
    };

    // Calcular precio total de todos los items
    const calcularPrecioTotal = () => {
        const itemsAgrupados = getItemsAgrupadosPorCamisa();
        let total = 0;

        Object.values(itemsAgrupados).forEach(itemsCamisa => {
            // Sumar todas las cantidades de esta camisa
            const cantidadTotal = itemsCamisa.reduce((sum, item) => sum + item.cantidad, 0);

            // Calcular precio basado en la cantidad total de la camisa
            const precioBase = calcularPrecio(itemsCamisa[0].camisa.id, cantidadTotal);
            total += precioBase;
        });

        return total;
    };

    // Calcular precio para un item específico (considerando agrupación por camisa)
    const calcularPrecioItem = (item: ItemSeleccionado) => {
        const itemsAgrupados = getItemsAgrupadosPorCamisa();
        const itemsCamisa = itemsAgrupados[item.camisa.id];

        if (!itemsCamisa) return 0;

        // Sumar todas las cantidades de esta camisa
        const cantidadTotal = itemsCamisa.reduce((sum, i) => sum + i.cantidad, 0);

        // Calcular precio total de la camisa
        const precioTotalCamisa = calcularPrecio(item.camisa.id, cantidadTotal);

        // Distribuir el precio proporcionalmente según la cantidad de este item
        const proporcion = item.cantidad / cantidadTotal;
        return precioTotalCamisa * proporcion;
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
                            {/* Izquierda: Formulario para agregar camisas */}
                            <div className="bg-white rounded-lg shadow-lg p-6">
                                <h3 className="text-xl font-semibold mb-6">Agregar Camisa</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Seleccionar Camisa
                                        </label>
                                        {/* <select
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
                                        </select> */}


                                        <div className="flex flex-wrap gap-4">
                                            {camisas.map((camisa) => (
                                                <button
                                                    key={camisa.id}
                                                    onClick={() => {
                                                        setSelectedCamisa(camisa);
                                                        setSelectedTalla("");
                                                        setSelectedColor(null);
                                                    }}
                                                    className={`w-32 h-32 border rounded-lg flex flex-col items-center justify-center transition-all duration-200 ${selectedCamisa?.id === camisa.id
                                                            ? "bg-blue-200 border-blue-700"
                                                            : "bg-white text-gray-700 hover:bg-gray-100"
                                                        }`}
                                                >
                                                    <FaTshirt size={32} className="text-blue-600" />
                                                    <span className="mt-2 text-sm text-center">{camisa.descripcion}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {selectedCamisa && (
                                        <>
                                            {/* Tabla de precios */}
                                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                                <h5 className="font-semibold text-blue-800 mb-3">Tabla de Precios por Cantidad</h5>
                                                <div className="space-y-2">
                                                    {getRangosPreciosCamisa(selectedCamisa.id).map((rango, index) => (
                                                        <div key={rango.id} className="flex justify-between items-center text-sm">
                                                            <span className="text-gray-700">
                                                                {rango.min_cantidad === rango.max_cantidad
                                                                    ? `${rango.min_cantidad} camisa`
                                                                    : `${rango.min_cantidad} - ${rango.max_cantidad} camisas`
                                                                }
                                                            </span>
                                                            <span className="font-medium text-blue-600">
                                                                ${Number(rango.precio_unitario).toFixed(0)}/unidad
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

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
                                        </>
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

                            {/* Derecha: Detalles del pedido y resumen */}
                            <div className="bg-white rounded-lg shadow-lg p-6">
                                <h3 className="text-xl font-semibold mb-6">Detalles del Pedido</h3>
                                <div className="space-y-6">
                                    {/* Items seleccionados */}
                                    {itemsSeleccionados.length > 0 && (
                                        <div className="border rounded-lg p-4">
                                            <h4 className="font-semibold mb-3">Camisas Seleccionadas:</h4>
                                            <div className="space-y-3">
                                                {Object.keys(getItemsAgrupadosPorCamisa()).map((camisaId) => {
                                                    const camisaIdNum = parseInt(camisaId);
                                                    const itemsCamisa = getItemsAgrupadosPorCamisa()[camisaIdNum];
                                                    const descuentoInfo = getDescuentoAplicado(camisaIdNum);

                                                    if (!itemsCamisa) return null;

                                                    return (
                                                        <div key={camisaId} className="bg-gray-50 p-3 rounded border">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <span className="font-semibold text-gray-800">
                                                                    {itemsCamisa[0].camisa.descripcion}
                                                                </span>
                                                                {descuentoInfo && descuentoInfo.descuento > 0 && (
                                                                    <span className="text-green-600 text-sm font-medium">
                                                                        ¡{descuentoInfo.descuento.toFixed(0)}% descuento!
                                                                    </span>
                                                                )}
                                                            </div>

                                                            <div className="space-y-1">
                                                                {itemsCamisa.map((item) => (
                                                                    <div key={item.id} className="flex items-center justify-between text-sm pl-4">
                                                                        <div className="flex items-center gap-3">
                                                                            <div
                                                                                className="w-3 h-3 rounded-full border border-gray-300"
                                                                                style={{ backgroundColor: item.color.rgb }}
                                                                            ></div>
                                                                            <span className="text-gray-600">
                                                                                {item.talla} - {item.color.nombre_color} (x{item.cantidad})
                                                                            </span>
                                                                        </div>
                                                                        <button
                                                                            onClick={() => eliminarItem(item.id)}
                                                                            className="text-red-500 hover:text-red-700 ml-2"
                                                                        >
                                                                            <X className="w-3 h-3" />
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                            </div>

                                                            {/* {descuentoInfo && (
                                                                <div className="mt-2 pt-2 border-t border-gray-200">
                                                                    <div className="text-xs text-gray-600">
                                                                        Total: {descuentoInfo.cantidadTotal} camisas •
                                                                        {descuentoInfo.descuento > 0 ? (
                                                                            <>
                                                                                <span className="text-green-600 font-medium">
                                                                                    ¡A partir de {descuentoInfo.rango.min} camisa{descuentoInfo.rango.min > 1 ? 's' : ''} el precio es ${Number(descuentoInfo.precioUnitario).toFixed(0)}/unidad!
                                                                                </span>
                                                                                <div className="mt-1">
                                                                                    <span className="text-gray-400 line-through">
                                                                                        ${Number(descuentoInfo.precioOriginal).toFixed(2)}/unidad
                                                                                    </span>
                                                                                    <span className="ml-2 text-green-600 font-medium">
                                                                                        ${Number(descuentoInfo.precioUnitario).toFixed(0)}/unidad
                                                                                    </span>
                                                                                </div>
                                                                            </>
                                                                        ) : (
                                                                            <span>
                                                                                Precio por unidad: ${Number(descuentoInfo.precioUnitario).toFixed(0)}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )} */}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Resumen de precios */}
                                    {itemsSeleccionados.length > 0 && (
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <h4 className="text-lg font-semibold text-gray-800 mb-4">Resumen de Precios</h4>
                                            <div className="space-y-4">
                                                {/* Mostrar descuentos por camisa */}
                                                {Object.keys(getItemsAgrupadosPorCamisa()).map((camisaId) => {
                                                    const camisaIdNum = parseInt(camisaId);
                                                    const descuentoInfo = getDescuentoAplicado(camisaIdNum);
                                                    const itemsCamisa = getItemsAgrupadosPorCamisa()[camisaIdNum];

                                                    if (!descuentoInfo || !itemsCamisa) return null;

                                                    return (
                                                        <div key={camisaId} className="bg-white p-3 rounded-lg border border-green-200">
                                                            <div className="flex justify-between items-center mb-2">
                                                                <span className="font-semibold text-gray-800">
                                                                    {itemsCamisa[0].camisa.descripcion}
                                                                </span>
                                                                {descuentoInfo.descuento > 0 && (
                                                                    <span className="text-green-600 text-sm font-medium">
                                                                        ¡{descuentoInfo.descuento.toFixed(0)}% descuento!
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="text-sm text-gray-600 mb-2">
                                                                Cantidad total: {descuentoInfo.cantidadTotal} camisas
                                                            </div>
                                                            <div className="text-sm text-gray-600 mb-2">
                                                                {descuentoInfo.descuento > 0 ? (
                                                                    <>
                                                                        <span className="text-green-600 font-medium">
                                                                            ¡A partir de {descuentoInfo.rango.min} camisa{descuentoInfo.rango.min > 1 ? 's' : ''} el precio es ${Number(descuentoInfo.precioUnitario).toFixed(0)}/unidad!
                                                                        </span>
                                                                        <div className="mt-1">
                                                                            <span className="text-gray-400 line-through">
                                                                                ${Number(descuentoInfo.precioOriginal).toFixed(2)}/unidad
                                                                            </span>
                                                                            <span className="ml-2 text-green-600 font-medium">
                                                                                ${Number(descuentoInfo.precioUnitario).toFixed(0)}/unidad
                                                                            </span>
                                                                        </div>
                                                                    </>
                                                                ) : (
                                                                    <span>
                                                                        Precio por unidad: ${Number(descuentoInfo.precioUnitario).toFixed(0)}
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {/* Items individuales de esta camisa */}
                                                            <div className="space-y-1 mt-2">
                                                                {itemsCamisa.map((item) => {
                                                                    const precioItem = calcularPrecioItem(item);
                                                                    return (
                                                                        <div key={item.id} className="flex justify-between text-sm pl-4">
                                                                            <span className="text-gray-600">
                                                                                • {item.talla} - {item.color.nombre_color} (x{item.cantidad})
                                                                            </span>
                                                                            <span className="font-medium">
                                                                                ${precioItem.toFixed(2)}
                                                                            </span>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    );
                                                })}

                                                <div className="border-t pt-4 mt-4">
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
                                        id="nombre_producto"
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
                            disabled={itemsSeleccionados.length === 0 || !nombre.trim()}
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
                                    <div className="space-y-3 mb-4">
                                        {Object.keys(getItemsAgrupadosPorCamisa()).map((camisaId) => {
                                            const camisaIdNum = parseInt(camisaId);
                                            const itemsCamisa = getItemsAgrupadosPorCamisa()[camisaIdNum];
                                            const descuentoInfo = getDescuentoAplicado(camisaIdNum);

                                            if (!itemsCamisa) return null;

                                            return (
                                                <div key={camisaId} className="bg-gray-50 p-3 rounded-lg">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="font-semibold text-gray-800">
                                                            {itemsCamisa[0].camisa.descripcion}
                                                        </span>
                                                        {descuentoInfo && descuentoInfo.descuento > 0 && (
                                                            <span className="text-green-600 text-sm font-medium">
                                                                ¡{descuentoInfo.descuento.toFixed(0)}% descuento!
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="space-y-1">
                                                        {itemsCamisa.map((item) => (
                                                            <div key={item.id} className="flex items-center justify-between text-sm pl-4">
                                                                <div className="flex items-center gap-2">
                                                                    <div
                                                                        className="w-3 h-3 rounded-full border border-gray-300"
                                                                        style={{ backgroundColor: item.color.rgb }}
                                                                    ></div>
                                                                    <span className="text-gray-600">
                                                                        {item.talla} - {item.color.nombre_color} (x{item.cantidad})
                                                                    </span>
                                                                </div>
                                                                <span className="font-medium">
                                                                    ${calcularPrecioItem(item).toFixed(2)}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {descuentoInfo && (
                                                        <div className="mt-2 pt-2 border-t border-gray-200">
                                                            <div className="text-xs text-gray-600">
                                                                Total: {descuentoInfo.cantidadTotal} camisas •
                                                                {descuentoInfo.descuento > 0 ? (
                                                                    <>
                                                                        <span className="text-green-600 font-medium">
                                                                            ¡A partir de {descuentoInfo.rango.min} camisa{descuentoInfo.rango.min > 1 ? 's' : ''} el precio es ${Number(descuentoInfo.precioUnitario).toFixed(0)}/unidad!
                                                                        </span>
                                                                        <div className="mt-1">
                                                                            <span className="text-gray-400 line-through">
                                                                                ${Number(descuentoInfo.precioOriginal).toFixed(2)}/unidad
                                                                            </span>
                                                                            <span className="ml-2 text-green-600 font-medium">
                                                                                ${Number(descuentoInfo.precioUnitario).toFixed(0)}/unidad
                                                                            </span>
                                                                        </div>
                                                                    </>
                                                                ) : (
                                                                    <span>
                                                                        Precio por unidad: ${Number(descuentoInfo.precioUnitario).toFixed(0)}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
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