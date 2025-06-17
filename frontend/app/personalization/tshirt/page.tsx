"use client"

import { useState, useRef, useEffect } from "react"
import { ArrowLeft, ShoppingCart } from "lucide-react"

import Link from "next/link"

import { reader } from "@/components/camisa/helper"

import { Model } from "@/components/camisa/model"
import Controls from "@/components/camisa/containers/Controls"
import { Irgb } from "@/components/camisa/types/Irgb"



export default function ProductPersonalizationPage() {

    const [isMobile, setIsMobile] = useState(false)
    const [color, setColor] = useState({ r: 19, g: 97, b: 189 })
    const [isLogo, setIsLogo] = useState(true)
    const [isFull, setIsFull] = useState(false)
    const [logoS, setLogoS] = useState(0)
    const [logoP, setLogoP] = useState(2)
    const [logoF, setLogoF] = useState<string>('/logo.png')
    const [logoT, setLogoT] = useState<string>('/logo.png')
    const [logoMD, setLogoMD] = useState<string>('/logo.png')
    const [logoMI, setLogoMI] = useState<string>('/logo.png')
    const [error, setError] = useState<string | null>(null)
    const [nombre, setNombre] = useState("")
    const [cantidad, setCantidad] = useState(1)
    const [talla, setTalla] = useState("M")

    // Estados para el control de posición y escala
    const [frontalScale, setFrontalScale] = useState(0.2)
    const [frontalX, setFrontalX] = useState(0)
    const [frontalY, setFrontalY] = useState(0.05)
    const [traseroScale, setTraseroScale] = useState(0.2)
    const [traseroX, setTraseroX] = useState(0)
    const [traseroY, setTraseroY] = useState(0.05)

    const tallas = ["XS", "S", "M", "L", "XL", "XXL"]
    const precioBase = 25.99
    const precioPersonalizacion = 5.99

    const tref = useRef(null)

    const handleFileChange = async (file: File | null, parte: 'frontal' | 'trasero' | 'mangaDerecha' | 'mangaIzquierda') => {
        if (file) {
            try {
                const result = await reader(file)
                switch (parte) {
                    case 'frontal':
                        setLogoF(result)
                        break
                    case 'trasero':
                        setLogoT(result)
                        break
                    case 'mangaDerecha':
                        setLogoMD(result)
                        break
                    case 'mangaIzquierda':
                        setLogoMI(result)
                        break
                }
                setError(null)
            } catch (err) {
                setError('Error al procesar la imagen')
            }
        }
    }

    const handleLogo = () => {
        setIsLogo(!isLogo)
    }
    const handleFull = () => {
        setIsFull(!isFull)
    }

    const handleLogoP = (ind: number) => {
        setLogoP(ind)
    }
    const handleLogoS = (ind: number) => {
        setLogoS(ind)
    }

    const changeColor = (rgb: Irgb) => {
        setColor({ r: rgb.r, g: rgb.g, b: rgb.b })
    }

    useEffect(() => {
        if (window.innerWidth < 768) setIsMobile(true)
    }, [])

    const checkScreen = () => {
        if (window.innerWidth < 768) setIsMobile(true)
        else setIsMobile(false)
    }

    const handleAgregarAlCarrito = () => {
        // Aquí iría la lógica para agregar al carrito
        console.log({
            nombre,
            cantidad,
            talla,
            color,
            logoF,
            logoT,
            logoMD,
            logoMI,
            precioTotal: (precioBase + precioPersonalizacion) * cantidad
        })
    }

    const handleFrontalChange = (scale: number, x: number, y: number) => {
        setFrontalScale(scale)
        setFrontalX(x)
        setFrontalY(y)
    }

    const handleTraseroChange = (scale: number, x: number, y: number) => {
        setTraseroScale(scale)
        setTraseroX(x)
        setTraseroY(y)
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <Link href="/personalization" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Volver a la selección de productos
                    </Link>
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">
                        Personaliza tu Camisa
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Diseña tu producto único con nuestra herramienta de personalización en tiempo real
                    </p>
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


                {/* Sección de Detalles y Carrito */}
                {/* <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                    placeholder="Ej: Camisa Empresarial"
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
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Talla
                                </label>
                                <select
                                    value={talla}
                                    onChange={(e) => setTalla(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {tallas.map((t) => (
                                        <option key={t} value={t}>
                                            {t}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
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
                                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <ShoppingCart className="w-5 h-5" />
                                Agregar al Carrito
                            </button>
                        </div>
                    </div>
                </div> */}
            </div>
        </div>
    )
} 