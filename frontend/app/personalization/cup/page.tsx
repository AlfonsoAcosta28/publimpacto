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
import Controls from "./Controls"
import Cup3D from "./Cup3D"
import PreviewSection from "./PreviewSection"

export default function CupPersonalizationPage() {
    const canvasRef = useRef<HTMLDivElement>(null)
    const controlsRef = useRef<HTMLDivElement>(null)

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
        backgroundColor: 'transparent',
        textAlign: 'left' as 'left' | 'center' | 'right'
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

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <Link href="/personalization" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                        <ArrowLeft className="w-5 h-5" />
                        <span>Volver</span>
                    </Link>
                    <button
                        onClick={handleAgregarAlCarrito}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <ShoppingCart className="w-5 h-5" />
                        <span>Agregar al carrito</span>
                    </button>
                </div>

                {/* Main content */}
                <div className="grid grid-cols-12 gap-6">
                    {/* Controls - Left column */}
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

                    {/* Cup 3D - Middle column */}
                    <div className="col-span-5">
                        <Cup3D
                            img={img}
                            posicion={posicion}
                            elements={elements}
                        />
                    </div>

                    {/* Preview - Right column */}
                    <div className="col-span-6">
                        <PreviewSection
                            elements={elements}
                            selectedElement={selectedElement}
                            onElementSelect={handleElementSelect}
                            onElementUpdate={handleUpdateElement}
                            onElementDelete={handleDeleteElement}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}