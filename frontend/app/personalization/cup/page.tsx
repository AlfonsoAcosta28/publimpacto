"use client"

import { useState, useRef, useEffect } from "react"
import { ArrowLeft, ShoppingCart, Type, Image, Layout, Star, Plus } from "lucide-react"
import Link from "next/link"
import { reader } from "@/components/camisa/helper"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment } from "@react-three/drei"
import Cup from "@/components/camisa/model/Cup"
import PreviewCanvas from "@/components/camisa/PreviewCanvas"
import { motion, AnimatePresence } from "framer-motion"
import { DesignElement, DEFAULT_IMAGES, DEFAULT_BACKGROUNDS, ElementType } from "@/components/camisa/types"

export default function CupPersonalizationPage() {
    const canvasRef = useRef<HTMLDivElement>(null)

    // Resto del estado y efectos
    const [file, setFile] = useState<File | null>(null)
    const [img, setImg] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [nombre, setNombre] = useState("")
    const [cantidad, setCantidad] = useState(1)
    const [posicion, setPosicion] = useState("centro")
    const [activeMenu, setActiveMenu] = useState<ElementType | null>(null)
    const [elements, setElements] = useState<DesignElement[]>([])
    const [selectedElement, setSelectedElement] = useState<string | null>(null)
    const [textStyle, setTextStyle] = useState({
        fontSize: 16,
        fontFamily: 'Arial',
        color: '#000000',
        isBold: false,
        isItalic: false,
        isUnderline: false,
        lineHeight: 1.5,
        backgroundColor: 'transparent'
    })
    const [availableImages, setAvailableImages] = useState(DEFAULT_IMAGES)
    const [availableBackgrounds, setAvailableBackgrounds] = useState(DEFAULT_BACKGROUNDS)
    const [customImage, setCustomImage] = useState<File | null>(null)
    const [customBackground, setCustomBackground] = useState<File | null>(null)

    const precioBase = 15.99
    const precioPersonalizacion = 3.99

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
                    fontSize: element.style.fontSize || 16,
                    fontFamily: element.style.fontFamily || 'Arial',
                    color: element.style.color || '#000000',
                    isBold: element.style.isBold || false,
                    isItalic: element.style.isItalic || false,
                    isUnderline: element.style.isUnderline || false,
                    lineHeight: element.style.lineHeight || 1.5,
                    backgroundColor: element.style.backgroundColor || 'transparent'
                })
            }
        }
    }, [selectedElement, elements])

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
                style: type === 'text' ? { ...textStyle } : undefined
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

    const getPosicionIndex = () => {
        switch (posicion) {
            case "izquierda":
                return 0
            case "centro":
                return 1
            case "derecha":
                return 2
            default:
                return 1
        }
    }

    const handleAgregarAlCarrito = () => {
        console.log({
            nombre,
            cantidad,
            posicion,
            elements,
            imagen: file ? URL.createObjectURL(file) : null,
            precioTotal: (precioBase + precioPersonalizacion) * cantidad
        })
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

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">


                <div className="flex flex-col md:flex-row ">
                    {/* Sección de la Taza 3D */}
                    <div className="w-full md:w-1/2 m-2">
                        <div className="mb-8">
                            <Link href="/personalization" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Volver a la selección de productos
                            </Link>
                            <h1 className="text-4xl font-bold text-gray-800 mb-4">
                                Personaliza tu Taza
                            </h1>
                            <p className="text-gray-600 text-lg">
                                Diseña tu taza única con elementos personalizados
                            </p>
                        </div>
                        <div className="h-[500px]  rounded-lg shadow-lg p-6">
                            <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
                                <ambientLight intensity={0.5} />
                                <directionalLight position={[10, 10, 10]} intensity={1} />
                                <Cup
                                    key={elements.length}
                                    logo={img || '/logo.png'}
                                    logoP={getPosicionIndex()}
                                    elements={elements}
                                    canvasRef={(window as any).previewCanvasRef}
                                />
                                <OrbitControls
                                    enablePan={true}
                                    enableZoom={true}
                                    enableRotate={true}
                                    minDistance={2}
                                    maxDistance={10}
                                />
                                <Environment preset="studio" />
                            </Canvas>
                        </div>
                        {selectedElementData && (
                            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                <h4 className="font-medium text-blue-800 mb-2">
                                    Elemento seleccionado: {selectedElementData.type === 'text' ? 'Texto' :
                                        selectedElementData.type === 'image' ? 'Imagen' :
                                            selectedElementData.type === 'icon' ? 'Icono' : 'Fondo'}
                                </h4>
                                <p className="text-sm text-blue-600">
                                    Usa los controles azules para mover, rotar, redimensionar o eliminar este elemento.
                                </p>
                            </div>
                        )}
                    </div>


                    {/* Sección derecha: Preview y Controles */}
                    <div className="w-full md:w-1/2 space-y-6">

                        {/* Preview Canvas */}
                        <div className="w-full aspect-[2/1] bg-white rounded-lg shadow-lg">
                            <PreviewCanvas
                                elements={elements}
                                selectedElement={selectedElement}
                                onElementSelect={setSelectedElement}
                                onElementUpdate={handleUpdateElement}
                                onElementDelete={handleDeleteElement}
                                containerRef={canvasRef}
                            />
                        </div>




                        {/* Menú de Personalización */}
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <h3 className="text-lg font-semibold mb-4">Personalización</h3>

                            {/* Submenús */}
                            <div className="mb-6">


                                <AnimatePresence>
                                    {activeMenu && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="border-t pt-4"
                                        >
                                            {activeMenu === 'text' && (
                                                <div className="space-y-4">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <button
                                                            onClick={() => handleAddElement('text')}
                                                            className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                                        >
                                                            Agregar Texto
                                                        </button>
                                                        <select
                                                            className="p-2 border rounded"
                                                            value={textStyle.fontFamily}
                                                            onChange={(e) => handleTextStyleChange({ fontFamily: e.target.value })}
                                                            disabled={!selectedElement || selectedElementData?.type !== 'text'}
                                                        >
                                                            <option>Arial</option>
                                                            <option>Times New Roman</option>
                                                            <option>Helvetica</option>
                                                            <option>Roboto</option>
                                                            <option>Open Sans</option>
                                                        </select>
                                                    </div>

                                                    {/* Editor de contenido de texto */}
                                                    {selectedElementData?.type === 'text' && (
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                Contenido del texto
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={selectedElementData.content}
                                                                onChange={(e) => handleTextContentChange(e.target.value)}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                placeholder="Escribe tu texto..."
                                                            />
                                                        </div>
                                                    )}
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div className="grid grid-cols-3 gap-2">
                                                            <button
                                                                className={`rounded transition-colors ${textStyle.isBold ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                                                                onClick={() => handleTextStyleChange({ isBold: !textStyle.isBold })}
                                                                disabled={!selectedElement || selectedElementData?.type !== 'text'}
                                                            >
                                                                <strong>B</strong>
                                                            </button>
                                                            <button
                                                                className={`rounded transition-colors ${textStyle.isItalic ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                                                                onClick={() => handleTextStyleChange({ isItalic: !textStyle.isItalic })}
                                                                disabled={!selectedElement || selectedElementData?.type !== 'text'}
                                                            >
                                                                <em>I</em>
                                                            </button>
                                                            <button
                                                                className={`rounded transition-colors ${textStyle.isUnderline ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                                                                onClick={() => handleTextStyleChange({ isUnderline: !textStyle.isUnderline })}
                                                                disabled={!selectedElement || selectedElementData?.type !== 'text'}
                                                            >
                                                                <u>U</u>
                                                            </button>
                                                        </div>

                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                Color del texto
                                                            </label>
                                                            <input
                                                                type="color"
                                                                value={textStyle.color}
                                                                onChange={(e) => handleTextStyleChange({ color: e.target.value })}
                                                                className="w-full h-10 rounded border"
                                                                disabled={!selectedElement || selectedElementData?.type !== 'text'}
                                                            />
                                                        </div>



                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                Tamaño: {textStyle.fontSize}px
                                                            </label>
                                                            <input
                                                                type="range"
                                                                min="8"
                                                                max="72"
                                                                value={textStyle.fontSize}
                                                                onChange={(e) => handleTextStyleChange({ fontSize: parseInt(e.target.value) })}
                                                                className="w-full"
                                                                disabled={!selectedElement || selectedElementData?.type !== 'text'}
                                                            />
                                                        </div>

                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                Color de fondo
                                                            </label>
                                                            <input
                                                                type="color"
                                                                value={textStyle.backgroundColor === 'transparent' ? '#ffffff' : textStyle.backgroundColor}
                                                                onChange={(e) => handleTextStyleChange({ backgroundColor: e.target.value })}
                                                                className="w-full h-10 rounded border"
                                                                disabled={!selectedElement || selectedElementData?.type !== 'text'}
                                                            />
                                                        </div>

                                                    </div>
                                                    {(!selectedElement || selectedElementData?.type !== 'text') && (
                                                        <p className="text-sm text-gray-500 bg-gray-50 p-2 rounded">
                                                            💡 Selecciona un texto para editarlo
                                                        </p>
                                                    )}
                                                </div>

                                            )}

                                            {activeMenu === 'image' && (
                                                <div className="space-y-4">
                                                    <div className="grid grid-cols-3 gap-4 max-h-[300px] overflow-y-auto p-2">
                                                        {availableImages.map((image, index) => (
                                                            <button
                                                                key={index}
                                                                onClick={() => handleAddElement('image', image)}
                                                                className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 hover:border-blue-500 transition-all duration-200 hover:scale-105"
                                                            >
                                                                <img
                                                                    src={image}
                                                                    alt={`Imagen ${index + 1}`}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            </button>
                                                        ))}
                                                    </div>
                                                    <div className="mt-4">
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Agregar imagen personalizada
                                                        </label>
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="file"
                                                                accept=".png,.jpg,.jpeg,.webp"
                                                                onChange={handleAddCustomImage}
                                                                className="hidden"
                                                                id="custom-image"
                                                            />
                                                            <label
                                                                htmlFor="custom-image"
                                                                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer transition-colors duration-200"
                                                            >
                                                                <Plus className="w-4 h-4" />
                                                                <span>Seleccionar imagen</span>
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {activeMenu === 'background' && (
                                                <div className="space-y-4">
                                                    <div className="grid grid-cols-3 gap-4 max-h-[300px] overflow-y-auto p-2">
                                                        {availableBackgrounds.map((background, index) => (
                                                            <button
                                                                key={index}
                                                                onClick={() => handleAddElement('background', background)}
                                                                className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 hover:border-blue-500 transition-all duration-200 hover:scale-105"
                                                            >
                                                                <img
                                                                    src={background}
                                                                    alt={`Fondo ${index + 1}`}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            </button>
                                                        ))}
                                                    </div>
                                                    <div className="mt-4">
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Agregar fondo personalizado
                                                        </label>
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="file"
                                                                accept=".png,.jpg,.jpeg,.webp"
                                                                onChange={handleAddCustomBackground}
                                                                className="hidden"
                                                                id="custom-background"
                                                            />
                                                            <label
                                                                htmlFor="custom-background"
                                                                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer transition-colors duration-200"
                                                            >
                                                                <Plus className="w-4 h-4" />
                                                                <span>Seleccionar fondo</span>
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {activeMenu === 'icon' && (
                                                <div className="space-y-4">
                                                    <div className="grid grid-cols-4 gap-4">
                                                        {['❤️', '⭐', '🌟', '��', '🔥', '⚡', '🎯', '🏆', '🎨', '🎵', '🌈', '🦋'].map((icon) => (
                                                            <button
                                                                key={icon}
                                                                onClick={() => handleAddElement('icon', icon)}
                                                                className="p-3 bg-gray-100 rounded hover:bg-gray-200 text-2xl transition-colors"
                                                            >
                                                                {icon}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                            {/* Botones principales */}
                            <div className="grid grid-cols-4 gap-4 mb-6">
                                <button
                                    onClick={() => setActiveMenu(activeMenu === 'text' ? null : 'text')}
                                    className={`p-3 rounded-lg flex flex-col items-center gap-2 transition-colors ${activeMenu === 'text' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 hover:bg-gray-200'
                                        }`}
                                >
                                    <Type className="w-6 h-6" />
                                    <span>Texto</span>
                                </button>
                                <button
                                    onClick={() => setActiveMenu(activeMenu === 'image' ? null : 'image')}
                                    className={`p-3 rounded-lg flex flex-col items-center gap-2 transition-colors ${activeMenu === 'image' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 hover:bg-gray-200'
                                        }`}
                                >
                                    <Image className="w-6 h-6" />
                                    <span>Imágenes</span>
                                </button>
                                <button
                                    onClick={() => setActiveMenu(activeMenu === 'background' ? null : 'background')}
                                    className={`p-3 rounded-lg flex flex-col items-center gap-2 transition-colors ${activeMenu === 'background' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 hover:bg-gray-200'
                                        }`}
                                >
                                    <Layout className="w-6 h-6" />
                                    <span>Fondo</span>
                                </button>
                                <button
                                    onClick={() => setActiveMenu(activeMenu === 'icon' ? null : 'icon')}
                                    className={`p-3 rounded-lg flex flex-col items-center gap-2 transition-colors ${activeMenu === 'icon' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 hover:bg-gray-200'
                                        }`}
                                >
                                    <Star className="w-6 h-6" />
                                    <span>Iconos</span>
                                </button>
                            </div>


                        </div>

                        {/* Detalles del producto */}
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nombre del Producto
                                    </label>
                                    <input
                                        type="text"
                                        value={nombre}
                                        onChange={(e) => setNombre(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Ej: Taza Personalizada"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Cantidad
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={cantidad}
                                        onChange={(e) => setCantidad(Math.max(1, parseInt(e.target.value) || 1))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            {/* Resumen de elementos */}
                            {elements.length > 0 && (
                                <div className="mt-4 bg-gray-50 p-3 rounded-lg">
                                    <h4 className="font-medium text-gray-700 mb-2">Elementos en el diseño:</h4>
                                    <div className="text-sm text-gray-600">
                                        {elements.filter(el => el.type !== 'background').length} elemento(s) agregado(s)
                                        {elements.find(el => el.type === 'background') && ' + 1 fondo'}
                                    </div>
                                </div>
                            )}

                            {/* Resumen de precios */}
                            <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Resumen de Precios</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Precio Base:</span>
                                        <span className="font-medium">${precioBase.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Personalización:</span>
                                        <span className="font-medium">${precioPersonalizacion.toFixed(2)}</span>
                                    </div>
                                    <div className="border-t pt-2 mt-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-800 font-semibold">Total:</span>
                                            <span className="text-blue-600 font-bold">
                                                ${((precioBase + precioPersonalizacion) * cantidad).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleAgregarAlCarrito}
                                className="w-full mt-6 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <ShoppingCart className="w-5 h-5" />
                                Agregar al Carrito
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}