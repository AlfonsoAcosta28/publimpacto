"use client"

import { Type, Image, Layout, Star, Plus, Trash2, AlignLeft, AlignCenter, AlignRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { DesignElement, ElementType, DEFAULT_IMAGES, DEFAULT_BACKGROUNDS } from "@/components/camisa/types"
import { reader } from "@/components/camisa/helper"
import { useState } from "react"

interface ControlsProps {
    activeMenu: ElementType | null;
    setActiveMenu: (menu: ElementType | null) => void;
    elements: DesignElement[];
    selectedElement: string | null;
    handleAddElement: (type: ElementType, content?: string) => void;
    handleUpdateElement: (id: string, updates: Partial<DesignElement>) => void;
    handleDeleteElement: (id: string) => void;
    textStyle: {
        fontSize: number;
        fontFamily: string;
        color: string;
        isBold: boolean;
        isItalic: boolean;
        isUnderline: boolean;
        lineHeight: number;
        backgroundColor: string;
        textAlign: string;
    };
    handleTextStyleChange: (updates: Partial<typeof textStyle>) => void;
    handleTextContentChange: (newContent: string) => void;
    availableImages: string[];
    setAvailableImages: React.Dispatch<React.SetStateAction<string[]>>;
    availableBackgrounds: string[];
    setAvailableBackgrounds: React.Dispatch<React.SetStateAction<string[]>>;
    setError: (error: string | null) => void;
}

export default function Controls({
    activeMenu,
    setActiveMenu,
    elements,
    selectedElement,
    handleAddElement,
    handleUpdateElement,
    handleDeleteElement,
    textStyle,
    handleTextStyleChange,
    handleTextContentChange,
    availableImages,
    setAvailableImages,
    availableBackgrounds,
    setAvailableBackgrounds,
    setError,
}: ControlsProps) {
    const selectedElementData = selectedElement ? elements.find(el => el.id === selectedElement) : null

    const handleAddCustomImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            if (file.type !== 'image/png' && file.type !== 'image/jpeg' && file.type !== 'image/webp') {
                setError('Solo se permiten archivos PNG, JPG y WEBP')
                return
            }
            reader(file).then((result) => {
                setAvailableImages([...availableImages, result])
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
            reader(file).then((result) => {
                setAvailableBackgrounds([...availableBackgrounds, result])
                handleAddElement('background', result)
            })
        }
    }

    return (
        <div className="relative">
            {/* Botones principales verticales */}
            <div className="flex flex-col gap-2">
                <button
                    onClick={() => setActiveMenu(activeMenu === 'text' ? null : 'text')}
                    className={`p-3 rounded-lg flex flex-col items-center gap-2 transition-colors ${activeMenu === 'text' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                    title="Texto"
                >
                    <Type className="w-6 h-6" />
                </button>
                <button
                    onClick={() => setActiveMenu(activeMenu === 'image' ? null : 'image')}
                    className={`p-3 rounded-lg flex flex-col items-center gap-2 transition-colors ${activeMenu === 'image' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                    title="Imágenes"
                >
                    <Image className="w-6 h-6" />
                </button>
                <button
                    onClick={() => setActiveMenu(activeMenu === 'background' ? null : 'background')}
                    className={`p-3 rounded-lg flex flex-col items-center gap-2 transition-colors ${activeMenu === 'background' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                    title="Fondo"
                >
                    <Layout className="w-6 h-6" />
                </button>
                <button
                    onClick={() => setActiveMenu(activeMenu === 'icon' ? null : 'icon')}
                    className={`p-3 rounded-lg flex flex-col items-center gap-2 transition-colors ${activeMenu === 'icon' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                    title="Iconos"
                >
                    <Star className="w-6 h-6" />
                </button>
            </div>

            {/* Menú overlay */}
            <AnimatePresence>
                {activeMenu && (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="absolute left-full top-0 ml-2 w-64 bg-white rounded-lg shadow-lg p-4 z-50"
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
                                    {selectedElement && selectedElementData?.type === 'text' && (
                                        <select
                                            className="p-2 border rounded"
                                            value={textStyle.fontFamily}
                                            onChange={(e) => handleTextStyleChange({ fontFamily: e.target.value })}
                                        >
                                            <option>Arial</option>
                                            <option>Times New Roman</option>
                                            <option>Helvetica</option>
                                            <option>Roboto</option>
                                        </select>
                                    )}
                                </div>

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

                                {selectedElementData?.type === 'text' && (
                                    <>
                                        <div className="grid grid-cols-2 gap-2">
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
                                                />
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
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Espaciado entre líneas: {textStyle.lineHeight.toFixed(1)}
                                                </label>
                                                <input
                                                    type="range"
                                                    min="1"
                                                    max="3"
                                                    step="0.1"
                                                    value={textStyle.lineHeight}
                                                    onChange={(e) => handleTextStyleChange({ lineHeight: parseFloat(e.target.value) })}
                                                    className="w-full"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Color de fondo
                                                </label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="color"
                                                        value={textStyle.backgroundColor === 'transparent' ? '#ffffff' : textStyle.backgroundColor}
                                                        onChange={(e) => handleTextStyleChange({ backgroundColor: e.target.value })}
                                                        className="w-full h-10 rounded border"
                                                    />
                                                    <button
                                                        onClick={() => handleTextStyleChange({ backgroundColor: 'transparent' })}
                                                        className="px-3 bg-gray-100 hover:bg-gray-200 rounded border"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Alineación
                                                </label>
                                                <div className="grid grid-cols-3 gap-2">
                                                    <button
                                                        onClick={() => handleTextStyleChange({ textAlign: 'left' })}
                                                        className={`p-2 rounded transition-colors ${textStyle.textAlign === 'left' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                                                    >
                                                        <AlignLeft className="w-4 h-4 mx-auto" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleTextStyleChange({ textAlign: 'center' })}
                                                        className={`p-2 rounded transition-colors ${textStyle.textAlign === 'center' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                                                    >
                                                        <AlignCenter className="w-4 h-4 mx-auto" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleTextStyleChange({ textAlign: 'right' })}
                                                        className={`p-2 rounded transition-colors ${textStyle.textAlign === 'right' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                                                    >
                                                        <AlignRight className="w-4 h-4 mx-auto" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Estilo
                                                </label>
                                                <div className="grid grid-cols-3 gap-2">
                                                    <button
                                                        className={`p-1 rounded transition-colors ${textStyle.isBold ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                                                        onClick={() => handleTextStyleChange({ isBold: !textStyle.isBold })}
                                                    >
                                                        <strong>B</strong>
                                                    </button>
                                                    <button
                                                        className={`p-1 rounded transition-colors ${textStyle.isItalic ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                                                        onClick={() => handleTextStyleChange({ isItalic: !textStyle.isItalic })}
                                                    >
                                                        <em>I</em>
                                                    </button>
                                                    <button
                                                        className={`p-1 rounded transition-colors ${textStyle.isUnderline ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                                                        onClick={() => handleTextStyleChange({ isUnderline: !textStyle.isUnderline })}
                                                    >
                                                        <u>U</u>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

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
                                    {['❤️', '⭐', '🌟', '✨', '🔥', '⚡', '🎯', '🏆', '🎨', '🎵', '🌈', '🦋'].map((icon) => (
                                        <button
                                            key={icon}
                                            onClick={() => handleAddElement('icon', icon)}
                                            className="p-2 bg-gray-100 rounded hover:bg-gray-200 text-1xl transition-colors"
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
    )
} 