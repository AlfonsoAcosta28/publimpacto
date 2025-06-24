"use client"

import { useState, useRef, useEffect } from "react"
import { ArrowLeft, ShoppingCart, ArrowRight, Plus, X } from "lucide-react"
import Link from "next/link"
import { reader } from "@/components/camisa/helper"
import Controls from "./Controls"
import Cup3D from "./Cup3D"
import PreviewSection from "./PreviewSection"
import cupService from '@/services/cupServices'
import { BsCupHotFill } from "react-icons/bs";
import { useShipping } from "@/contexts/ShippingContext"
import AddressManager from "@/components/AddressManager"
import { DesignElement, DEFAULT_IMAGES, DEFAULT_BACKGROUNDS, ElementType } from "@/components/camisa/types"
import { toast } from "sonner"
import orderService from "@/services/orderService"
import html2canvas from "html2canvas"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"

// Tipos para la lógica de selección y stock
interface Cup {
    id: number;
    name: string;
    descripcion: string;
}

interface InventarioCup {
    id: number;
    id_cup: number;
    available_quantity: number;
    cup: Cup;
}

interface PrecioCupRango {
    id: number;
    id_cup: number;
    min_cantidad: number;
    max_cantidad: number;
    precio_unitario: number;
}

interface ItemSeleccionadoCup {
    id: string;
    cup: Cup;
    cantidad: number;
}

function FaseCirculos({ fase }: { fase: number }) {
    return (
        <div className="flex gap-1">
            <div className={`w-3 h-3 rounded-full ${fase >= 1 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            <div className={`w-3 h-3 rounded-full ${fase >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            <div className={`w-3 h-3 rounded-full ${fase === 3 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
        </div>
    );
}

export default function CupPersonalizationPage() {
    const { user, isAuthenticated, logout } = useAuth()
    const router = useRouter();

    const canvasRef = useRef<HTMLDivElement>(null)
    const controlsRef = useRef<HTMLDivElement>(null)
    const previewCanvasRef = useRef<HTMLDivElement>(null)

    // Resto del estado y efectos
    const [file, setFile] = useState<File | null>(null)
    const [img, setImg] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    // const [nombre, setNombre] = useState("")
    const [cantidad, setCantidad] = useState(1)
    const [posicion, setPosicion] = useState("centro")
    const [activeMenu, setActiveMenu] = useState<ElementType | null>(null)
    const [elements, setElements] = useState<DesignElement[]>([])
    const [selectedElement, setSelectedElement] = useState<string | null>(null)
    const [textStyle, setTextStyle] = useState({
        fontSize: 20,
        fontFamily: 'Arial',
        color: '#000000',
        isBold: false,
        isItalic: false,
        isUnderline: false,
        lineHeight: 1.5,
        backgroundColor: 'transparent',
        textAlign: 'left' as 'left' | 'center' | 'right'
    })
    const [availableImages, setAvailableImages] = useState(DEFAULT_IMAGES)
    const [availableBackgrounds, setAvailableBackgrounds] = useState(DEFAULT_BACKGROUNDS)
    const [customImage, setCustomImage] = useState<File | null>(null)
    const [customBackground, setCustomBackground] = useState<File | null>(null)

    // Estado para la imagen generada
    const [imagen, setImagen] = useState<string | null>(null);
    // Estado para la dirección y teléfono seleccionados
    const [selectedAddress, setSelectedAddress] = useState<any>(null)
    const [telefonoContacto, setTelefonoContacto] = useState("");

    useEffect(() => {
      if (user?.telefono) {
        setTelefonoContacto(user.telefono);
      }
    }, [user]);
    

    useEffect(() => {
        if (file) {
            if (file.type !== 'image/png' && file.type !== 'image/jpeg') {
                setError('Solo se permiten archivos PNG y JPG')
                setFile(null)
                return
            }
            setError(null)
            reader(file).then((result) => {
                setImg(result)
            })
        }
    }, [file])

    // Actualizar textStyle cuando se selecciona un elemento de texto
    useEffect(() => {
        if (selectedElement) {
            const element = elements.find(el => el.id === selectedElement)
            if (element?.type === 'text' && element.style) {
                setTextStyle({
                    fontSize: element.style.fontSize || 20,
                    fontFamily: element.style.fontFamily || 'Arial',
                    color: element.style.color || '#000000',
                    isBold: element.style.isBold || false,
                    isItalic: element.style.isItalic || false,
                    isUnderline: element.style.isUnderline || false,
                    lineHeight: element.style.lineHeight || 1.5,
                    backgroundColor: element.style.backgroundColor || 'transparent',
                    textAlign: element.style.textAlign || 'left'
                })
            }
        }
    }, [selectedElement, elements])

    // Agregar manejador de clic global
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // Si el clic fue fuera de los controles y no fue en un elemento del preview
            if (controlsRef.current && !controlsRef.current.contains(event.target as Node)) {
                setActiveMenu(null)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    const handleAddElement = (type: ElementType, content?: string) => {
        if (type === 'background') {
            // Si es un fondo, reemplazar el fondo existente o agregar uno nuevo
            const existingBackground = elements.find(el => el.type === 'background')
            if (existingBackground) {
                handleUpdateElement(existingBackground.id, {
                    content: content || availableBackgrounds[0]
                })
            } else {
                const newElement: DesignElement = {
                    id: Math.random().toString(36).substr(2, 9),
                    type: 'background',
                    content: content || availableBackgrounds[0],
                    position: { x: 0, y: 0 },
                    rotation: 0,
                    scale: 1
                }
                setElements([...elements, newElement])
            }
        } else {
            // Para otros elementos, agregar normalmente
            const newElement: DesignElement = {
                id: Math.random().toString(36).substr(2, 9),
                type,
                content: content || (type === 'text' ? 'Nuevo texto' :
                    type === 'image' ? availableImages[0] :
                        '❤️'),
                position: { x: 150, y: 100 },
                rotation: 0,
                scale: 1,
                style: type === 'text' ? { ...textStyle } :
                    type === 'image' ? { width: 150, height: 150 } : undefined
            }
            const newElements = [...elements, newElement]
            setElements(newElements)
            // Seleccionar automáticamente el nuevo elemento
            setSelectedElement(newElement.id)
            // Abrir el menú correspondiente si no está abierto
            if (activeMenu !== type) {
                setActiveMenu(type)
            }
        }
    }

    const handleUpdateElement = (id: string, updates: Partial<DesignElement>) => {
        setElements(prevElements =>
            prevElements.map(el =>
                el.id === id ? { ...el, ...updates } : el
            )
        )
    }

    const handleDeleteElement = (id: string) => {
        setElements(elements.filter(el => el.id !== id))
        if (selectedElement === id) {
            setSelectedElement(null)
        }
    }

    const handleTextStyleChange = (updates: Partial<typeof textStyle>) => {
        const newTextStyle = { ...textStyle, ...updates }
        setTextStyle(newTextStyle)

        // Si hay un elemento seleccionado y es texto, actualizarlo
        if (selectedElement) {
            const element = elements.find(el => el.id === selectedElement)
            if (element?.type === 'text') {
                handleUpdateElement(selectedElement, {
                    style: { ...element.style, ...updates }
                })
            }
        }
    }

    const handleTextContentChange = (newContent: string) => {
        if (selectedElement) {
            const element = elements.find(el => el.id === selectedElement)
            if (element?.type === 'text') {
                handleUpdateElement(selectedElement, {
                    content: newContent
                })
            }
        }
    }



    const handleAddCustomImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            if (file.type !== 'image/png' && file.type !== 'image/jpeg' && file.type !== 'image/webp') {
                setError('Solo se permiten archivos PNG, JPG y WEBP')
                return
            }
            setCustomImage(file)
            reader(file).then((result) => {
                setAvailableImages([...availableImages, result])
                // Agregar automáticamente la imagen al canvas
                handleAddElement('image', result)
            })
        }
    }

    const handleAddCustomBackground = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            if (file.type !== 'image/png' && file.type !== 'image/jpeg' && file.type !== 'image/webp') {
                setError('Solo se permiten archivos PNG, JPG y WEBP')
                return
            }
            setCustomBackground(file)
            reader(file).then((result) => {
                setAvailableBackgrounds([...availableBackgrounds, result])
                // Agregar automáticamente el fondo al canvas
                handleAddElement('background', result)
            })
        }
    }

    // Obtener el elemento seleccionado actual
    const selectedElementData = selectedElement ? elements.find(el => el.id === selectedElement) : null

    // Modificar el manejador de selección de elementos
    const handleElementSelect = (id: string | null) => {
        setSelectedElement(id)
        if (id) {
            const element = elements.find(el => el.id === id)
            if (element?.type === 'text') {
                setActiveMenu('text')
            }
        }
    }

    const { shippingPrice, minOrderForFreeShipping } = useShipping();
    // Personalización visual


    // Fases y selección de taza
    const [currentPhase, setCurrentPhase] = useState(1);
    // const [cups, setCups] = useState<Cup[]>([]);
    const [inventario, setInventario] = useState<InventarioCup[]>([]);
    const [rangosPrecios, setRangosPrecios] = useState<PrecioCupRango[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedCup, setSelectedCup] = useState<Cup | null>(null);
    const [itemsSeleccionados, setItemsSeleccionados] = useState<ItemSeleccionadoCup[]>([]);
    // const [mensajeConfirmacion, setMensajeConfirmacion] = useState<string | null>(null);

    // Efectos para personalización visual
    useEffect(() => {
        if (file) {
            if (file.type !== 'image/png' && file.type !== 'image/jpeg') {
                setError('Solo se permiten archivos PNG y JPG')
                setFile(null)
                return
            }
            setError(null)
            reader(file).then((result) => {
                setImg(result)
            })
        }
    }, [file])

    useEffect(() => {
        if (selectedElement) {
            const element = elements.find(el => el.id === selectedElement)
            if (element?.type === 'text' && element.style) {
                setTextStyle({
                    fontSize: element.style.fontSize || 20,
                    fontFamily: element.style.fontFamily || 'Arial',
                    color: element.style.color || '#000000',
                    isBold: element.style.isBold || false,
                    isItalic: element.style.isItalic || false,
                    isUnderline: element.style.isUnderline || false,
                    lineHeight: element.style.lineHeight || 1.5,
                    backgroundColor: element.style.backgroundColor || 'transparent',
                    textAlign: element.style.textAlign || 'left'
                })
            }
        }
    }, [selectedElement, elements])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (controlsRef.current && !controlsRef.current.contains(event.target as Node)) {
                setActiveMenu(null)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    // Fase 2: cargar datos
    useEffect(() => {
        if (currentPhase === 2) {
            cargarDatos();
        }
    }, [currentPhase]);

    // Cargar diseño guardado cuando se regrese a la fase 1
    useEffect(() => {
        if (currentPhase === 1) {
            cargarDiseñoGuardado();
        }
    }, [currentPhase]);

    const cargarDatos = async () => {
        setLoading(true);
        try {
            const [inventarioRes, preciosRes] = await Promise.all([
                cupService.getAllInventario(),
                cupService.getAllPreciosCupRango()
            ]);

            console.log(inventarioRes)
            setInventario(inventarioRes.data);
            setRangosPrecios(preciosRes.data);
        } catch (error) {
            setError('Error cargando datos de tazas');
        } finally {
            setLoading(false);
        }
    };

    // Helpers de stock y precios
    const getTazasDisponibles = () => {
        // Solo devolver tazas que realmente tienen stock disponible
        return inventario
            .filter(inv => getStockDisponible(inv.id_cup) > 0)
            .map(inv => inv.cup);
    };

    const getStockDisponible = (cupId: number) => {
        const inventarioItem = inventario.find(inv => inv.id_cup === cupId);
        if (!inventarioItem) return 0;

        // Calcular cuántos items de esta taza ya están seleccionados
        const itemsYaSeleccionados = itemsSeleccionados.filter(item => item.cup.id === cupId).reduce((total, item) => total + item.cantidad, 0);

        // Stock disponible = available_quantity del backend - items ya seleccionados
        return Math.max(0, inventarioItem.available_quantity - itemsYaSeleccionados);
    };
    const getRangosPreciosCup = (cupId: number) => {
        return rangosPrecios
            .filter(r => r.id_cup === cupId)
            .sort((a, b) => a.min_cantidad - b.min_cantidad);
    };

    const calcularPrecioBase = (cupId: number, cantidad: number) => {
        const rangosCup = rangosPrecios.filter(r => r.id_cup === cupId);
        const precioBasico = rangosCup.find(r => r.min_cantidad === 1 && r.max_cantidad === 1);
        return precioBasico ? Number(precioBasico.precio_unitario) * cantidad : 0;
    };

    const calcularPrecio = (cupId: number, cantidad: number) => {
        const rangosCup = rangosPrecios.filter(r => r.id_cup === cupId);
        const rangoAplicable = rangosCup.find(r => cantidad >= r.min_cantidad && cantidad <= r.max_cantidad);
        if (rangoAplicable) {
            return Number(rangoAplicable.precio_unitario) * cantidad;
        }
        const precioBasico = rangosCup.find(r => r.min_cantidad === 1 && r.max_cantidad === 1);
        return precioBasico ? Number(precioBasico.precio_unitario) * cantidad : 0;
    };

    const calcularDescuento = (cupId: number, cantidad: number) => {
        const precioBase = calcularPrecioBase(cupId, cantidad);
        const precioConDescuento = calcularPrecio(cupId, cantidad);
        const descuento = precioBase - precioConDescuento;
        const porcentajeDescuento = precioBase > 0 ? (descuento / precioBase) * 100 : 0;
        return {
            descuento,
            porcentajeDescuento,
            tieneDescuento: descuento > 0
        };
    };

    const calcularPrecioTotal = () => {
        let total = 0;
        itemsSeleccionados.forEach(item => {
            total += calcularPrecio(item.cup.id, item.cantidad);
        });
        return total;
    };

    const calcularPrecioTotalBase = () => {
        let total = 0;
        itemsSeleccionados.forEach(item => {
            total += calcularPrecioBase(item.cup.id, item.cantidad);
        });
        return total;
    };

    const calcularDescuentoTotal = () => {
        const precioTotalBase = calcularPrecioTotalBase();
        const precioTotalConDescuento = calcularPrecioTotal();
        const descuentoTotal = precioTotalBase - precioTotalConDescuento;
        const porcentajeDescuentoTotal = precioTotalBase > 0 ? (descuentoTotal / precioTotalBase) * 100 : 0;
        return {
            descuentoTotal,
            porcentajeDescuentoTotal,
            tieneDescuento: descuentoTotal > 0
        };
    };


    const tazaRender = () => {
        return (
            <Cup3D
                img={img}
                posicion={posicion}
                elements={elements}
            />
        )
    }

    // Función para guardar el estado del diseño
    const guardarDiseño = () => {
        // Crear un objeto con el estado actual del diseño
        const diseñoGuardado = {
            elements: elements,
            img: img,
            posicion: posicion,
            timestamp: new Date().toISOString()
        };

        // Guardar en localStorage
        localStorage.setItem('tazaDiseñoGuardado', JSON.stringify(diseñoGuardado));

        // También se puede guardar en el estado si es necesario
        console.log('Diseño guardado:', diseñoGuardado);
    };

    // Función para cargar el diseño guardado
    const cargarDiseñoGuardado = () => {
        const diseñoGuardado = localStorage.getItem('tazaDiseñoGuardado');
        if (diseñoGuardado) {
            try {
                const diseño = JSON.parse(diseñoGuardado);

                // Asegurar que los elementos de imagen tengan valores por defecto para width y height
                const elementosConDefaults = (diseño.elements || []).map((element: any) => {
                    if (element.type === 'image' && (!element.style || !element.style.width || !element.style.height)) {
                        return {
                            ...element,
                            style: {
                                ...element.style,
                                width: element.style?.width || 150,
                                height: element.style?.height || 150
                            }
                        };
                    }
                    return element;
                });

                setElements(elementosConDefaults);
                setImg(diseño.img || null);
                setPosicion(diseño.posicion || 'centro');
                // setNombre(diseño.nombre || '');
                console.log('Diseño cargado:', diseño);
            } catch (error) {
                console.error('Error al cargar el diseño:', error);
            }
        }
    };

    const guardarImagen = async () => {
        setSelectedElement(null)
        await new Promise(requestAnimationFrame);

        if (!previewCanvasRef.current) {
            toast.error("No se pudo obtener la imagen de la taza");
            return;
        }
        // Usa html2canvas para capturar el div
        const canvas = await html2canvas(previewCanvasRef.current);
        const image = canvas.toDataURL("image/png");
        setImagen(image);
    }
    const pasarAFase2 = async () => {
        await guardarImagen();     // Espera a que termine guardarImagen
        guardarDiseño();           // Luego guarda el diseño

        setError(null);
        toast.success('¡Diseño guardado exitosamente!');
        setCurrentPhase(2);
    };


    // Guardar automáticamente el diseño en localStorage cuando cambie algo relevante
    useEffect(() => {
        const diseñoGuardado = {
            elements: elements,
            img: img,
            posicion: posicion,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('tazaDiseñoGuardado', JSON.stringify(diseñoGuardado));
    }, [elements, img, posicion]);

    const handleInputChange = (field: string, value: string | boolean) => {
        if (field === "phone") setTelefonoContacto(value as string);
        // Puedes agregar más campos si es necesario
    };

    // Fase 1: Personalización visual
    const renderPhase1 = () => (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-800 mb-2">
                                Fase 1: Personaliza tu Taza
                            </h1>
                            <p className="text-gray-600 text-lg">
                                Diseña tu taza con imágenes, texto y fondos personalizados
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">Fase 1 de 3</span>
                            <FaseCirculos fase={1} />
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-12 gap-6">
                    <div className="col-span-1" ref={controlsRef}>
                        <Controls
                            activeMenu={activeMenu}
                            setActiveMenu={setActiveMenu}
                            elements={elements}
                            selectedElement={selectedElement}
                            handleAddElement={handleAddElement}
                            handleUpdateElement={handleUpdateElement}
                            handleDeleteElement={handleDeleteElement}
                            textStyle={textStyle}
                            handleTextStyleChange={handleTextStyleChange}
                            handleTextContentChange={handleTextContentChange}
                            availableImages={availableImages}
                            setAvailableImages={setAvailableImages}
                            availableBackgrounds={availableBackgrounds}
                            setAvailableBackgrounds={setAvailableBackgrounds}
                            setError={setError}
                        />
                    </div>
                    <div className="col-span-5">
                        {/* "h-[500px] rounded-lg shadow-lg p-6 bg-white" */}
                        {tazaRender()}
                    </div>
                    <div className="col-span-6">
                        <PreviewSection
                            elements={elements}
                            selectedElement={selectedElement}
                            onElementSelect={handleElementSelect}
                            onElementUpdate={handleUpdateElement}
                            onElementDelete={handleDeleteElement}
                            containerRef={previewCanvasRef}
                        />
                    </div>
                </div>
                <div className="mt-8 flex justify-end">
                    <button
                        onClick={pasarAFase2}
                        className="bg-blue-600 text-white py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        Continuar a Selección
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );

    // Fase 2: Selección de taza y detalles
    const renderPhase2 = () => (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-800 mb-2">
                                Fase 2: Agrega tu Taza
                            </h1>
                            <p className="text-gray-600 text-lg">
                                Selecciona la taza, cantidad y revisa los detalles del producto
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">Fase 2 de 3</span>
                            <FaseCirculos fase={2} />
                        </div>
                    </div>
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
                            {error}
                        </div>
                    )}
                </div>
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="text-lg">Cargando opciones disponibles...</div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Izquierda: Agregar taza */}
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <h3 className="text-xl font-semibold mb-6">Agregar Taza</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Seleccionar Taza
                                    </label>
                                    <div className="grid grid-cols-2 gap-4">
                                        {inventario.length === 0 && (
                                            <div className="w-32 h-32 flex flex-col items-center justify-center transition-all duration-200 text-gray-700 bg-gray-100">
                                                <span className="text-2xl">☕</span>
                                                <span className="mt-2 text-x text-center">No hay tazas disponibles</span>
                                            </div>
                                        )}
                                        {inventario.map((inventaryCup) => {
                                            const stockDisponible = getStockDisponible(inventaryCup.id_cup);
                                            const tieneStock = stockDisponible > 0;

                                            return (
                                                <button
                                                    key={inventaryCup.id}
                                                    onClick={() => tieneStock && setSelectedCup(inventaryCup.cup)}
                                                    disabled={!tieneStock}
                                                    className={`h-30 border rounded-lg flex flex-col items-center justify-center transition-all duration-200 p-4 ${!tieneStock
                                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                        : selectedCup?.id === inventaryCup.cup.id
                                                            ? "bg-blue-200 border-blue-700"
                                                            : "bg-white text-gray-700 hover:bg-gray-100"
                                                        }`}
                                                >
                                                    <span className="text-2xl">☕</span>
                                                    <span className="font-bold text-lg">{inventaryCup.cup.name}</span>
                                                    <span className="text-xs text-gray-500 text-center p-2">{inventaryCup.cup.descripcion}</span>
                                                    <span className={`mt-1 text-sm font-medium ${tieneStock ? 'text-green-600' : 'text-red-500'}`}>
                                                        Stock: {stockDisponible}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                                {selectedCup && (
                                    <>
                                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                                            <h5 className="font-semibold text-blue-800 mb-3">Tabla de Precios por Cantidad</h5>
                                            <div className="space-y-2">
                                                {getRangosPreciosCup(selectedCup.id).map((rango) => (
                                                    <div key={rango.id} className="flex justify-between items-center text-sm">
                                                        <span className="text-gray-700">
                                                            {rango.min_cantidad === rango.max_cantidad
                                                                ? `${rango.min_cantidad} taza`
                                                                : `${rango.min_cantidad} - ${rango.max_cantidad} tazas`
                                                            }
                                                        </span>
                                                        <span className="font-medium text-blue-600">
                                                            ${Number(rango.precio_unitario).toFixed(0)}/unidad
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 mb-4">
                                            <label className="block text-sm font-medium text-gray-700">Cantidad</label>
                                            <button
                                                onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                                                className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center text-gray-700 font-semibold"
                                            >-</button>
                                            <span className="w-12 text-center font-semibold">{cantidad}</span>
                                            <button
                                                onClick={() => {
                                                    const stockDisponible = getStockDisponible(selectedCup.id);
                                                    setCantidad(Math.min(stockDisponible, cantidad + 1));
                                                }}
                                                disabled={cantidad >= getStockDisponible(selectedCup.id)}
                                                className="w-8 h-8 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-full flex items-center justify-center text-white font-semibold"
                                            >+</button>
                                            <span className="text-sm text-gray-600">Stock disponible: <span className="font-semibold">{getStockDisponible(selectedCup.id)}</span></span>
                                        </div>
                                        <button
                                            onClick={() => {
                                                if (!selectedCup || cantidad <= 0) return;

                                                // Verificar que no se exceda el stock disponible
                                                const stockDisponible = getStockDisponible(selectedCup.id);
                                                if (cantidad > stockDisponible) {
                                                    setError(`No hay suficiente stock. Solo quedan ${stockDisponible} unidades disponibles.`);
                                                    return;
                                                }

                                                const itemExistente = itemsSeleccionados.find(item => item.cup.id === selectedCup.id);
                                                if (itemExistente) {
                                                    setItemsSeleccionados(itemsSeleccionados.map(item =>
                                                        item.id === itemExistente.id
                                                            ? { ...item, cantidad: item.cantidad + cantidad }
                                                            : item
                                                    ));
                                                } else {
                                                    const nuevoItem: ItemSeleccionadoCup = {
                                                        id: `${selectedCup.id}-${Date.now()}`,
                                                        cup: selectedCup,
                                                        cantidad: cantidad
                                                    };
                                                    setItemsSeleccionados([...itemsSeleccionados, nuevoItem]);
                                                }
                                                setSelectedCup(null);
                                                setCantidad(1);
                                                setError(null); // Limpiar errores previos
                                            }}
                                            disabled={!selectedCup || cantidad <= 0 || cantidad > getStockDisponible(selectedCup.id)}
                                            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Agregar a la Selección
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                        {/* Derecha: Detalles del pedido y resumen */}
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <h3 className="text-xl font-semibold mb-6">Detalles del Producto</h3>
                            <div className="space-y-6">
                                {itemsSeleccionados.length > 0 && (
                                    <div className="border rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="font-semibold">Tazas Seleccionadas:</h4>
                                            {(() => {
                                                const descuentoTotal = calcularDescuentoTotal();
                                                return descuentoTotal.tieneDescuento ? (
                                                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                                                        {descuentoTotal.porcentajeDescuentoTotal.toFixed(0)}% de descuento!
                                                    </span>
                                                ) : null;
                                            })()}
                                        </div>

                                        <div className="space-y-3 ">
                                            {itemsSeleccionados.map((item) => (
                                                <div key={item.id} className="flex items-center justify-between text-sm pl-4 bg-gray-200 p-2 border border-gray-500 rounded-md">
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-semibold">{item.cup.name}</span>
                                                        <span className="text-gray-600">(x{item.cantidad})</span>
                                                    </div>
                                                    <button
                                                        onClick={() => setItemsSeleccionados(itemsSeleccionados.filter(i => i.id !== item.id))}
                                                        className="text-red-500 hover:text-red-700 ml-2"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {itemsSeleccionados.length > 0 && (
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h4 className="text-lg font-semibold text-gray-800 mb-4">Resumen de Precios</h4>
                                        <div className="space-y-4">
                                            {itemsSeleccionados.map((item) => {
                                                const descuento = calcularDescuento(item.cup.id, item.cantidad);
                                                return (
                                                    <div key={item.id} className="flex justify-between items-center text-sm pl-4">
                                                        <span className="text-gray-600">
                                                            • {item.cup.name} (x{item.cantidad})
                                                        </span>
                                                        <div className="flex items-center gap-2">
                                                            {descuento.tieneDescuento && (
                                                                <span className="text-gray-400 line-through text-xs">
                                                                    ${calcularPrecioBase(item.cup.id, item.cantidad).toFixed(2)}
                                                                </span>
                                                            )}
                                                            <span className={`font-medium ${descuento.tieneDescuento ? 'text-green-600' : 'text-gray-800'}`}>
                                                                ${calcularPrecio(item.cup.id, item.cantidad).toFixed(2)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            <div className="border-t pt-4 mt-4">
                                                {(() => {
                                                    const descuentoTotal = calcularDescuentoTotal();
                                                    return (
                                                        <>
                                                            {descuentoTotal.tieneDescuento && (
                                                                <div className="flex justify-between text-sm mb-2">
                                                                    <span className="text-gray-600">Precio base:</span>
                                                                    <span className="text-gray-400 line-through">
                                                                        ${calcularPrecioTotalBase().toFixed(2)}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            <div className="flex justify-between font-semibold text-lg">
                                                                <span>Total:</span>
                                                                <span className={descuentoTotal.tieneDescuento ? 'text-green-600' : 'text-gray-800'}>
                                                                    ${calcularPrecioTotal().toFixed(2)}
                                                                </span>
                                                            </div>
                                                            {descuentoTotal.tieneDescuento && (
                                                                <div className="text-right text-sm text-green-600 font-medium mt-1">
                                                                    ¡Ahorras ${descuentoTotal.descuentoTotal.toFixed(2)}!
                                                                </div>
                                                            )}
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {/* <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nombre del Producto
                                    </label>
                                    <input
                                        type="text"
                                        value={nombre}
                                        onChange={(e) => setNombre(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Ej: Taza personalizada para regalo"
                                    />
                                </div> */}
                            </div>
                        </div>
                    </div>
                )}
                <div className="mt-8 flex justify-between">
                    <button
                        onClick={() => setCurrentPhase(1)}
                        className="bg-gray-500 text-white py-3 px-8 rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Volver al Diseño
                    </button>
                    <button
                        onClick={() => setCurrentPhase(3)}
                        className="bg-blue-600 text-white py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        disabled={itemsSeleccionados.length === 0}
                    >
                        Continuar al Pago
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );

    // Fase 3: Resumen y pago (sin lógica de pago)
    const renderPhase3 = () => {
        const precioTotal = calcularPrecioTotal();
        const envioGratis = precioTotal >= minOrderForFreeShipping;
        const precioEnvioMostrar = envioGratis ? 0 : shippingPrice;

        // Handler para completar la compra
        const handleCompleteOrder = async () => {
            // Si no hay imagen, genera la imagen antes de enviar
            if (!imagen) {
                await guardarImagen();
            }
            if (!imagen) {
                toast.error("No se pudo obtener la imagen de la taza");
                return;
            }
            if (!selectedAddress || !selectedAddress.id) {
                toast.error("Selecciona una dirección de envío");
                return;
            }
            if (!telefonoContacto) {
                toast.error("Ingresa un teléfono de contacto");
                return;
            }
            if (telefonoContacto.length !== 10) {
                toast.error("El telefono debe contener 10 digitos");
                return;
            }

            try {
                // Convertir base64 a blob
                const response = await fetch(imagen);
                const blob = await response.blob();
                
                // Crear FormData
                const formData = new FormData();
                
                // Agregar la imagen como archivo
                formData.append('cupImage', blob, 'cup-image.png');
                
                // Agregar los datos del pedido
                formData.append('items', JSON.stringify(itemsSeleccionados.map(item => ({
                    id_cup: item.cup.id,
                    cantidad: item.cantidad
                }))));
                formData.append('address_id', selectedAddress.id.toString());
                formData.append('telefono_contacto', telefonoContacto);

                // Enviar usando el servicio modificado
                await orderService.createOrderCup(formData);
                toast.success("¡Pedido realizado con éxito!");
                // Limpiar todo
                setElements([]);
                setSelectedElement(null);
                setImagen(null);
                setSelectedAddress(null);
                setTelefonoContacto("");
                setCantidad(1);
                setActiveMenu(null);
                setCustomImage(null);
                setCustomBackground(null);
                setAvailableImages(DEFAULT_IMAGES);
                setAvailableBackgrounds(DEFAULT_BACKGROUNDS);
                // Redirigir
                router.push("/orders");
            } catch (error) {
                toast.error("Error al crear el pedido");
                console.error(error);
            }
        };

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
                                <FaseCirculos fase={3} />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Resumen del pedido */}
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <h3 className="text-xl font-semibold mb-4">Resumen del Pedido</h3>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 gap-4">
                                    <Input
                                        id="phone"
                                        value={telefonoContacto}
                                        onChange={(e) => handleInputChange("phone", e.target.value)}
                                        placeholder="715 000 0000"
                                        className="pl-10"
                                        required
                                    />
                                    <div className="w-30 h-30 rounded-lg flex items-center justify-center">
                                        {/* <div className="h-full w-full block text-6xl">🍵</div> */}
                                        {imagen && (
                                            <div className="mt-4">
                                                <img src={imagen} alt="Vista previa de la taza" />
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <h4 className="font-semibold">{"Taza Personalizada"}</h4>
                                        <p className="text-gray-600">{itemsSeleccionados.length} tipo(s) de taza(s) seleccionada(s)</p>
                                    </div>
                                </div>

                                <div className="border-t pt-4">
                                    <div className="space-y-3 mb-4">
                                        {itemsSeleccionados.map((item) => {
                                            const descuento = calcularDescuento(item.cup.id, item.cantidad);
                                            return (
                                                <div key={item.id} className="bg-gray-50 p-3 rounded-lg">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="font-semibold text-gray-800">
                                                            {item.cup.name}
                                                        </span>
                                                        {descuento.tieneDescuento && (
                                                            <span className="text-green-600 text-sm font-medium">
                                                                ¡{descuento.porcentajeDescuento.toFixed(0)}% descuento!
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center justify-between text-sm pl-4">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-gray-600">
                                                                Cantidad: {item.cantidad}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {descuento.tieneDescuento && (
                                                                <span className="text-gray-400 line-through text-xs">
                                                                    ${calcularPrecioBase(item.cup.id, item.cantidad).toFixed(2)}
                                                                </span>
                                                            )}
                                                            <span className={`font-medium ${descuento.tieneDescuento ? 'text-green-600' : 'text-gray-800'}`}>
                                                                ${calcularPrecio(item.cup.id, item.cantidad).toFixed(2)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="border-t pt-4">
                                        {(() => {
                                            const descuentoTotal = calcularDescuentoTotal();
                                            return (
                                                <>
                                                    {descuentoTotal.tieneDescuento && (
                                                        <div className="flex justify-between text-sm mb-2">
                                                            <span className="text-gray-600">Precio base:</span>
                                                            <span className="text-gray-400 line-through">
                                                                ${calcularPrecioTotalBase().toFixed(2)}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <div className="flex justify-between mb-2">
                                                        <span>Subtotal:</span>
                                                        <span className={descuentoTotal.tieneDescuento ? 'text-green-600' : 'text-gray-800'}>
                                                            ${precioTotal.toFixed(2)}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between mb-2">
                                                        <span>Envío:</span>
                                                        <div className="text-right">
                                                            {envioGratis ? (
                                                                <>
                                                                    <span className="line-through text-gray-400 mr-2">
                                                                        ${shippingPrice.toFixed(2)}
                                                                    </span>
                                                                    <span className="text-green-600 font-semibold">Gratis</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    ${shippingPrice.toFixed(2)}
                                                                    <div className="text-xs text-red-600 mt-1">
                                                                        Envío gratis para compras arriba de ${minOrderForFreeShipping}
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex justify-between font-semibold text-lg">
                                                        <span>Total:</span>
                                                        <span className={descuentoTotal.tieneDescuento ? 'text-green-600' : 'text-gray-800'}>
                                                            ${(precioTotal + precioEnvioMostrar).toFixed(2)}
                                                        </span>
                                                    </div>
                                                    {descuentoTotal.tieneDescuento && (
                                                        <div className="text-right text-sm text-green-600 font-medium mt-1">
                                                            ¡Ahorras ${descuentoTotal.descuentoTotal.toFixed(2)}!
                                                        </div>
                                                    )}
                                                </>
                                            );
                                        })()}
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

                                <hr className="my-4 border-gray-300" />

                                <AddressManager
                                    showSelectButton={true}
                                    onAddressSelect={setSelectedAddress}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Botones de navegación */}
                    <div className="mt-8 flex justify-between">
                        <button
                            onClick={() => setCurrentPhase(2)}
                            className="bg-gray-500 text-white py-3 px-8 rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Volver a Selección
                        </button>
                        <button
                            className="bg-green-600 text-white py-3 px-8 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            onClick={handleCompleteOrder}
                            disabled={itemsSeleccionados.length === 0 /* o si falta address */}
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