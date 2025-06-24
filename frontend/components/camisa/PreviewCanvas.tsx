import { useRef, useState, useEffect } from 'react'
import { motion, useDragControls } from 'framer-motion'
import { DesignElement } from './types'
import { Trash2, Move, RotateCw, Maximize2, RotateCcw } from 'lucide-react'

interface PreviewCanvasProps {
    elements: DesignElement[]
    selectedElement: string | null
    onElementSelect: (id: string | null) => void
    onElementUpdate: (id: string, updates: Partial<DesignElement>) => void
    onElementDelete: (id: string) => void
    containerRef?: React.RefObject<HTMLDivElement>
}

export default function PreviewCanvas({
    elements,
    selectedElement,
    onElementSelect,
    onElementUpdate,
    onElementDelete,
    containerRef: externalRef
}: PreviewCanvasProps) {
    const internalRef = useRef<HTMLDivElement>(null)
    const containerRef = externalRef || internalRef
    const dragControls = useDragControls()
    const [isScaling, setIsScaling] = useState(false)

    // Guardar la referencia globalmente para que Cup.tsx pueda acceder a ella
    useEffect(() => {
        if (containerRef?.current) {
            (window as any).previewCanvasRef = containerRef;
        }
    }, [containerRef]);

    const handleContainerClick = (e: React.MouseEvent) => {
        if (e.target === containerRef.current) {
            onElementSelect(null)
        }
    }

    const renderElement = (element: DesignElement) => {
        const isSelected = element.id === selectedElement

        let content
        switch (element.type) {
            case 'text':
                content = (
                    <div
                        style={{
                            fontFamily: element.style?.fontFamily || 'Arial',
                            fontSize: `${element.style?.fontSize || 20}px`,
                            color: element.style?.color || '#000000',
                            fontWeight: element.style?.isBold ? 'bold' : 'normal',
                            fontStyle: element.style?.isItalic ? 'italic' : 'normal',
                            textDecoration: element.style?.isUnderline ? 'underline' : 'none',
                            lineHeight: element.style?.lineHeight || 1.5,
                            position: 'relative',
                            padding: '6px',
                            userSelect: 'none',
                            backgroundColor: element.style?.backgroundColor || 'transparent',
                            borderRadius: '4px',
                            whiteSpace: 'normal',
                            width: element.style?.width || 'auto',
                            minWidth: '80px',
                            maxWidth: '400px',
                            wordWrap: 'break-word',
                            overflowWrap: 'break-word',
                            wordBreak: 'break-word',
                            display: 'inline-block',
                            textAlign: element.style?.textAlign || 'left'
                        }}
                    >
                        {element.content}
                        {element.type === 'text' && isSelected && (
                            <div
                                className="absolute top-0 right-0 w-4 h-full bg-blue-500/50 cursor-ew-resize hover:bg-blue-500 transition-all"
                                style={{
                                    transform: 'translateX(50%)',
                                    zIndex: 1000
                                }}
                                onMouseDown={(e) => {
                                    e.stopPropagation()
                                    e.preventDefault()
                                    setIsScaling(true)
                                    const startX = e.clientX
                                    const startWidth = element.style?.width || 250

                                    const handleMouseMove = (moveEvent: MouseEvent) => {
                                        moveEvent.preventDefault()
                                        const deltaX = moveEvent.clientX - startX
                                        const newWidth = Math.max(80, Math.min(400, startWidth + deltaX))
                                        onElementUpdate(element.id, {
                                            style: {
                                                ...element.style,
                                                width: newWidth
                                            }
                                        })
                                    }

                                    const handleMouseUp = () => {
                                        setIsScaling(false)
                                        document.removeEventListener('mousemove', handleMouseMove)
                                        document.removeEventListener('mouseup', handleMouseUp)
                                    }

                                    document.addEventListener('mousemove', handleMouseMove)
                                    document.addEventListener('mouseup', handleMouseUp)
                                }}
                            />
                        )}
                    </div>
                )
                break
            case 'image':
                content = (
                    <img
                        src={element.content}
                        alt="Elemento"
                        style={{
                            width: element.style?.width ? `${element.style.width}px` : '150px',
                            height: element.style?.height ? `${element.style.height}px` : '150px',
                            maxWidth: '300px',
                            maxHeight: '300px',
                            objectFit: 'contain',
                            position: 'relative',
                            userSelect: 'none'
                        }}
                    />
                )
                break
            case 'icon':
                content = (
                    <div style={{
                        fontSize: '32px',
                        position: 'relative',
                        padding: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: '60px',
                        minHeight: '60px',
                        userSelect: 'none'
                    }}>
                        {element.content}
                    </div>
                )
                break
            default:
                return null
        }

        return (
            <motion.div
                key={element.id}
                drag={!isScaling}
                dragMomentum={false}
                dragConstraints={containerRef}
                dragElastic={0}
                initial={{ x: element.position.x, y: element.position.y }}
                animate={{ x: element.position.x, y: element.position.y }}
                onDragStart={(event, info) => {
                    console.log("Inicio del drag");
                    console.log("Posición inicial:", info.point);
                }}
                // onDragEnd={(event, info) => {
                //     if (!containerRef.current) return;
                //     const containerBounds = containerRef.current.getBoundingClientRect();
                //     console.log("info.point", info.point);
                //     console.log("containerBounds.left", containerBounds.left);
                //     console.log("containerBounds.top", containerBounds.top);

                //     console.log("containerBounds " + containerBounds)

                //     const relativeX = info.point.x - containerBounds.left;
                //     const relativeY = info.point.y - containerBounds.top;

                //     console.log("relativeX " + relativeX)
                //     console.log("relativeY " + relativeY)

                //     // Obtener las dimensiones reales del elemento DOM
                //     const elementDOM = event.target as HTMLElement;
                //     const elementRect = elementDOM.getBoundingClientRect();
                //     const elementWidth = elementRect.width;
                //     const elementHeight = elementRect.height;

                //     console.log("elementWidth " + elementWidth)
                //     console.log("elementHeight " + elementHeight)

                //     const clampedX = Math.max(0, Math.min(containerBounds.width - elementWidth, relativeX));
                //     const clampedY = Math.max(0, Math.min(containerBounds.height - elementHeight, relativeY));

                //     console.log("Relative drop position:", { x: clampedX, y: clampedY });
                //     console.log("typeof elementWidth", typeof elementWidth, elementWidth);

                //     onElementUpdate(element.id, {
                //         position: {
                //             x: clampedX,
                //             y: clampedY
                //         }
                //     });
                // }}
                onDragEnd={(event, info) => {
                    const newX = element.position.x + info.offset.x;
                    const newY = element.position.y + info.offset.y;

                    onElementUpdate(element.id, {
                        position: {
                            x: newX,
                            y: newY
                        }
                    });
                }}


                onClick={(e) => {
                    e.stopPropagation();
                    onElementSelect(element.id);
                }}
                style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    rotate: element.rotation || 0,
                    scale: element.scale || 1,
                    zIndex: isSelected ? 100 : ((element as DesignElement).type === 'background' ? 1 : 10),
                    touchAction: 'none',
                    ...(element.type === 'text' && {
                        width: element.style?.width ? `${element.style.width}px` : 'auto',
                        height: element.style?.height ? `${element.style.height}px` : 'auto'
                    })
                }}
                className="touch-none"
            >

                <div className="relative">

                    {content}
                    {isSelected && (
                        <>
                            {/* Marco de control */}
                            <div
                                className="absolute inset-0 border-2 border-blue-500 rounded hover:cursor-pointer"
                                style={{
                                    margin: '-4px',
                                    padding: '4px'
                                }}
                            />

                            {element.type !== 'text' && (
                                <div className="absolute inset-0 hover:cursor-nw-resize">
                                    <div
                                        className="absolute top-0 left-0 w-3 h-3 bg-blue-500 rounded transform -translate-x-1/2 -translate-y-1/2 hover:cursor-nw-resize"
                                        onMouseDown={(e) => {
                                            e.stopPropagation()
                                            setIsScaling(true)
                                            const startX = e.clientX
                                            const startY = e.clientY
                                            const startScale = element.scale || 1

                                            const handleMouseMove = (moveEvent: MouseEvent) => {
                                                const deltaX = moveEvent.clientX - startX
                                                const deltaY = moveEvent.clientY - startY
                                                const newScale = Math.max(0.1, Math.min(3, startScale + (deltaX + deltaY) / 200))
                                                onElementUpdate(element.id, { scale: newScale })
                                            }

                                            const handleMouseUp = () => {
                                                setIsScaling(false)
                                                document.removeEventListener('mousemove', handleMouseMove)
                                                document.removeEventListener('mouseup', handleMouseUp)
                                            }

                                            document.addEventListener('mousemove', handleMouseMove)
                                            document.addEventListener('mouseup', handleMouseUp)
                                        }}
                                    />
                                    <div
                                        className="absolute top-0 right-0 w-3 h-3 bg-blue-500 rounded transform translate-x-1/2 -translate-y-1/2 hover:cursor-ne-resize"
                                        onMouseDown={(e) => {
                                            e.stopPropagation()
                                            setIsScaling(true)
                                            const startX = e.clientX
                                            const startY = e.clientY
                                            const startScale = element.scale || 1

                                            const handleMouseMove = (moveEvent: MouseEvent) => {
                                                const deltaX = moveEvent.clientX - startX
                                                const deltaY = moveEvent.clientY - startY
                                                const newScale = Math.max(0.1, Math.min(3, startScale + (deltaX + deltaY) / 200))
                                                onElementUpdate(element.id, { scale: newScale })
                                            }

                                            const handleMouseUp = () => {
                                                setIsScaling(false)
                                                document.removeEventListener('mousemove', handleMouseMove)
                                                document.removeEventListener('mouseup', handleMouseUp)
                                            }

                                            document.addEventListener('mousemove', handleMouseMove)
                                            document.addEventListener('mouseup', handleMouseUp)
                                        }}
                                    />
                                    <div
                                        className="absolute bottom-0 left-0 w-3 h-3 bg-blue-500 rounded transform -translate-x-1/2 translate-y-1/2 hover:cursor-sw-resize"
                                        onMouseDown={(e) => {
                                            e.stopPropagation()
                                            setIsScaling(true)
                                            const startX = e.clientX
                                            const startY = e.clientY
                                            const startScale = element.scale || 1

                                            const handleMouseMove = (moveEvent: MouseEvent) => {
                                                const deltaX = moveEvent.clientX - startX
                                                const deltaY = moveEvent.clientY - startY
                                                const newScale = Math.max(0.1, Math.min(3, startScale + (deltaX + deltaY) / 200))
                                                onElementUpdate(element.id, { scale: newScale })
                                            }

                                            const handleMouseUp = () => {
                                                setIsScaling(false)
                                                document.removeEventListener('mousemove', handleMouseMove)
                                                document.removeEventListener('mouseup', handleMouseUp)
                                            }

                                            document.addEventListener('mousemove', handleMouseMove)
                                            document.addEventListener('mouseup', handleMouseUp)
                                        }}
                                    />
                                    <div
                                        className="absolute bottom-0 right-0 w-3 h-3 bg-blue-500 rounded transform translate-x-1/2 translate-y-1/2 hover:cursor-se-resize"
                                        onMouseDown={(e) => {
                                            e.stopPropagation()
                                            setIsScaling(true)
                                            const startX = e.clientX
                                            const startY = e.clientY
                                            const startScale = element.scale || 1

                                            const handleMouseMove = (moveEvent: MouseEvent) => {
                                                const deltaX = moveEvent.clientX - startX
                                                const deltaY = moveEvent.clientY - startY
                                                const newScale = Math.max(0.1, Math.min(3, startScale + (deltaX + deltaY) / 200))
                                                onElementUpdate(element.id, { scale: newScale })
                                            }

                                            const handleMouseUp = () => {
                                                setIsScaling(false)
                                                document.removeEventListener('mousemove', handleMouseMove)
                                                document.removeEventListener('mouseup', handleMouseUp)
                                            }

                                            document.addEventListener('mousemove', handleMouseMove)
                                            document.addEventListener('mouseup', handleMouseUp)
                                        }}
                                    />
                                </div>
                            )}
                            {/* Botones de control */}
                            <div className="absolute -top-8 right-0 flex gap-2">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        const currentRotation = element.rotation || 0;
                                        onElementUpdate(element.id, { rotation: currentRotation - 45 })
                                    }}
                                    className="p-1.5 rounded-full bg-white shadow-lg hover:bg-blue-100 text-blue-500 transition-colors"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        const currentRotation = element.rotation || 0;
                                        onElementUpdate(element.id, { rotation: currentRotation + 45 })
                                    }}
                                    className="p-1.5 rounded-full bg-white shadow-lg hover:bg-blue-100 text-blue-500 transition-colors"
                                >
                                    <RotateCw className="w-4 h-4" />
                                </button>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onElementDelete(element.id)
                                    }}
                                    className="p-1 rounded bg-white shadow-lg hover:bg-red-100 text-red-500"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </motion.div>
        )
    }

    const backgroundElement = elements.find(el => el.type === 'background')

    return (
        <div className="flex justify-center items-center w-full">
            <div
                ref={containerRef}
                className="relative bg-white rounded-lg overflow-hidden border border-gray-300"
                style={{
                    backgroundImage: backgroundElement ? `url(${backgroundElement.content})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    width: '800px',
                    height: '350px'
                }}
                onClick={handleContainerClick}
            >
                {elements.filter(el => el.type !== 'background').map(renderElement)}

            </div>
        </div>
    )
} 