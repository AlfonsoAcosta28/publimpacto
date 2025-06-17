"use client"

import { useRef } from "react"
import PreviewCanvas from "@/components/camisa/PreviewCanvas"
import { DesignElement, ElementType } from "@/components/camisa/types"

interface PreviewSectionProps {
    elements: DesignElement[];
    selectedElement: string | null;
    onElementSelect: (id: string | null) => void;
    onElementUpdate: (id: string, updates: Partial<DesignElement>) => void;
    onElementDelete: (id: string) => void;
}

export default function PreviewSection({
    elements,
    selectedElement,
    onElementSelect,
    onElementUpdate,
    onElementDelete,
}: PreviewSectionProps) {
    const canvasRef = useRef<HTMLDivElement>(null)

    const selectedElementData = selectedElement ? elements.find(el => el.id === selectedElement) : null

    return (
        <div className="w-full space-y-6">
            {/* Preview Canvas */}
            <div className="w-full aspect-[2/1] bg-white rounded-lg shadow-lg">
                <PreviewCanvas
                    elements={elements}
                    selectedElement={selectedElement}
                    onElementSelect={onElementSelect}
                    onElementUpdate={onElementUpdate}
                    onElementDelete={onElementDelete}
                    containerRef={canvasRef}
                />
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
    )
} 