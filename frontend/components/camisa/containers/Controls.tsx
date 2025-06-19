import { Irgb } from '../types'
import { useState } from 'react'

type ParteCamisa = 'frontal' | 'trasero' | 'mangaDerecha' | 'mangaIzquierda'

interface ControlsProps {
    color: Irgb
    changeColor: (rgb: Irgb) => void
    setFile: (file: File | null, parte: ParteCamisa) => void
    error: string | null
    onFrontalChange?: (scale: number, x: number, y: number) => void
    onTraseroChange?: (scale: number, x: number, y: number) => void
    onMangaDerechaChange?: (scale: number, x: number, y: number) => void
    onMangaIzquierdaChange?: (scale: number, x: number, y: number) => void
}

const Controls = ({
    color,
    changeColor,
    setFile,
    error,
    onFrontalChange,
    onTraseroChange,
    onMangaDerechaChange,
    onMangaIzquierdaChange
}: ControlsProps) => {
    const [parteSeleccionada, setParteSeleccionada] = useState<ParteCamisa>('frontal')
    const [imagenes, setImagenes] = useState<Record<ParteCamisa, string | null>>({
        frontal: null,
        trasero: null,
        mangaDerecha: null,
        mangaIzquierda: null
    })

    // Estados para el frontal
    const [frontalScale, setFrontalScale] = useState(0.2)
    const [frontalX, setFrontalX] = useState(0)
    const [frontalY, setFrontalY] = useState(0.05)
    const [traseroScale, setTraseroScale] = useState(0.2)
    const [traseroX, setTraseroX] = useState(0)
    const [traseroY, setTraseroY] = useState(0.05)

    // Estados para las mangas
    const [mangaDerechaScale, setMangaDerechaScale] = useState(0.03)
    const [mangaIzquierdaScale, setMangaIzquierdaScale] = useState(0.03)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            setFile(file, parteSeleccionada)
            
            // Crear URL para previsualización
            const imageUrl = URL.createObjectURL(file)
            setImagenes(prev => ({
                ...prev,
                [parteSeleccionada]: imageUrl
            }))
        }
    }

    // Handlers para el frontal
    const handleFrontalScale = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value)
        setFrontalScale(value)
        onFrontalChange?.(value, frontalX, frontalY)
    }

    const handleFrontalX = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value)
        setFrontalX(value)
        onFrontalChange?.(frontalScale, value, frontalY)
    }

    const handleFrontalY = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value)
        setFrontalY(value)
        onFrontalChange?.(frontalScale, frontalX, value)
    }

    // Handlers para el trasero
    const handleTraseroScale = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value)
        setTraseroScale(value)
        onTraseroChange?.(value, traseroX, traseroY)
    }

    const handleTraseroX = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value)
        setTraseroX(value)
        onTraseroChange?.(traseroScale, value, traseroY)
    }

    const handleTraseroY = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value)
        setTraseroY(value)
        onTraseroChange?.(traseroScale, traseroX, value)
    }

    // Handlers para manga derecha
    const handleMangaDerechaScale = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value)
        setMangaDerechaScale(value)
    }

    // Handlers para manga izquierda
    const handleMangaIzquierdaScale = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value)
        setMangaIzquierdaScale(value)
    }

    const renderControles = () => {
        switch (parteSeleccionada) {
            case 'frontal':
                return (
                    <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                        <h4 className="font-medium text-gray-700">Frontal</h4>
                        <div className="space-y-3">
                            <div className="flex items-center gap-4">
                                <span className="w-24 text-sm text-gray-600">Escala</span>
                                <input 
                                    type="range" 
                                    min={0.03} 
                                    max={0.25} 
                                    step={0.001}
                                    value={frontalScale}
                                    onChange={handleFrontalScale}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                />
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="w-24 text-sm text-gray-600">Posición X</span>
                                <input 
                                    type="range" 
                                    min={-0.075} 
                                    max={0.075} 
                                    step={0.001}
                                    value={frontalX}
                                    onChange={handleFrontalX}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                />
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="w-24 text-sm text-gray-600">Posición Y</span>
                                <input 
                                    type="range" 
                                    min={-0.12} 
                                    max={0.1} 
                                    step={0.001}
                                    value={frontalY}
                                    onChange={handleFrontalY}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                />
                            </div>
                        </div>
                    </div>
                )
            case 'trasero':
                return (
                    <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                        <h4 className="font-medium text-gray-700">Trasero</h4>
                        <div className="space-y-3">
                            <div className="flex items-center gap-4">
                                <span className="w-24 text-sm text-gray-600">Escala</span>
                                <input 
                                    type="range" 
                                    min={0.03} 
                                    max={0.25} 
                                    step={0.001}
                                    value={traseroScale}
                                    onChange={handleTraseroScale}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                />
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="w-24 text-sm text-gray-600">Posición X</span>
                                <input 
                                    type="range" 
                                    min={-0.075} 
                                    max={0.075} 
                                    step={0.001}
                                    value={traseroX}
                                    onChange={handleTraseroX}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                />
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="w-24 text-sm text-gray-600">Posición Y</span>
                                <input 
                                    type="range" 
                                    min={-0.12} 
                                    max={0.1} 
                                    step={0.001}
                                    value={traseroY}
                                    onChange={handleTraseroY}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                />
                            </div>
                        </div>
                    </div>
                )
            case 'mangaDerecha':
                return (
                    <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                        <h4 className="font-medium text-gray-700">Manga Derecha</h4>
                        <div className="space-y-3">
                            <div className="flex items-center gap-4">
                                <span className="w-24 text-sm text-gray-600">Escala</span>
                                <input 
                                    type="range" 
                                    min={0.03} 
                                    max={0.25} 
                                    step={0.001}
                                    value={mangaDerechaScale}
                                    onChange={handleMangaDerechaScale}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                />
                            </div>
                        </div>
                    </div>
                )
            case 'mangaIzquierda':
                return (
                    <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                        <h4 className="font-medium text-gray-700">Manga Izquierda</h4>
                        <div className="space-y-3">
                            <div className="flex items-center gap-4">
                                <span className="w-24 text-sm text-gray-600">Escala</span>
                                <input 
                                    type="range" 
                                    min={0.03} 
                                    max={0.25} 
                                    step={0.001}
                                    value={mangaIzquierdaScale}
                                    onChange={handleMangaIzquierdaScale}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                />
                            </div>
                        </div>
                    </div>
                )
        }
    }

    return (
        <div className="h-full flex flex-col bg-white rounded-lg shadow-lg p-6 overflow-y-auto">
            <div className="space-y-8 w-full">
                {/* Selector de Color */}
                {/* <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-800">Color de la Camisa</h3>
                    <div className="flex gap-3">
                        <button
                            onClick={() => changeColor({ r: 19, g: 97, b: 189 })}
                            className="w-10 h-10 rounded-full bg-blue-600 hover:ring-2 ring-offset-2 ring-blue-600 transition-all"
                        />
                        <button
                            onClick={() => changeColor({ r: 220, g: 38, b: 38 })}
                            className="w-10 h-10 rounded-full bg-red-600 hover:ring-2 ring-offset-2 ring-red-600 transition-all"
                        />
                        <button
                            onClick={() => changeColor({ r: 34, g: 197, b: 94 })}
                            className="w-10 h-10 rounded-full bg-green-500 hover:ring-2 ring-offset-2 ring-green-500 transition-all"
                        />
                        <button
                            onClick={() => changeColor({ r: 234, g: 179, b: 8 })}
                            className="w-10 h-10 rounded-full bg-yellow-500 hover:ring-2 ring-offset-2 ring-yellow-500 transition-all"
                        />
                        <button
                            onClick={() => changeColor({ r: 0, g: 0, b: 0 })}
                            className="w-10 h-10 rounded-full bg-black hover:ring-2 ring-offset-2 ring-black transition-all"
                        />
                    </div>
                </div> */}

                {/* Selector de Parte */}
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-800">Seleccionar Parte</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => setParteSeleccionada('frontal')}
                            className={`p-4 rounded-lg border-2 transition-all ${
                                parteSeleccionada === 'frontal'
                                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                                    : 'border-gray-200 hover:border-blue-200'
                            }`}
                        >
                            Frontal
                        </button>
                        <button
                            onClick={() => setParteSeleccionada('trasero')}
                            className={`p-4 rounded-lg border-2 transition-all ${
                                parteSeleccionada === 'trasero'
                                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                                    : 'border-gray-200 hover:border-blue-200'
                            }`}
                        >
                            Trasero
                        </button>
                        <button
                            onClick={() => setParteSeleccionada('mangaDerecha')}
                            className={`p-4 rounded-lg border-2 transition-all ${
                                parteSeleccionada === 'mangaDerecha'
                                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                                    : 'border-gray-200 hover:border-blue-200'
                            }`}
                        >
                            Manga Derecha
                        </button>
                        <button
                            onClick={() => setParteSeleccionada('mangaIzquierda')}
                            className={`p-4 rounded-lg border-2 transition-all ${
                                parteSeleccionada === 'mangaIzquierda'
                                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                                    : 'border-gray-200 hover:border-blue-200'
                            }`}
                        >
                            Manga Izquierda
                        </button>
                    </div>
                </div>

                {/* Subir Logo */}
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-800">Subir Imagen</h3>
                    <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
                        imagenes[parteSeleccionada] 
                            ? 'border-green-500 bg-green-50' 
                            : 'border-gray-300 hover:border-blue-300'
                    }`}>
                        {imagenes[parteSeleccionada] ? (
                            <div className="space-y-4">
                                <img 
                                    src={imagenes[parteSeleccionada]!} 
                                    alt="Imagen subida" 
                                    className="mx-auto max-h-32 object-contain"
                                />
                                <button
                                    onClick={() => {
                                        setFile(null, parteSeleccionada)
                                        setImagenes(prev => ({
                                            ...prev,
                                            [parteSeleccionada]: null
                                        }))
                                    }}
                                    className="text-sm text-red-600 hover:text-red-700"
                                >
                                    Eliminar imagen
                                </button>
                            </div>
                        ) : (
                            <>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="block w-full text-sm text-gray-500
                                        file:mr-4 file:py-2 file:px-4
                                        file:rounded-full file:border-0
                                        file:text-sm file:font-semibold
                                        file:bg-blue-50 file:text-blue-700
                                        hover:file:bg-blue-100"
                                />
                                <p className="mt-2 text-sm text-gray-500">
                                    Arrastra tu imagen o haz clic para seleccionar
                                </p>
                            </>
                        )}
                        {error && (
                            <p className="mt-2 text-sm text-red-500">
                                {error}
                            </p>
                        )}
                    </div>
                </div>

                {/* Controles */}
                <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-gray-800">Controles de Posición</h3>
                    {renderControles()}
                </div>
            </div>
        </div>
    )
}

export default Controls 