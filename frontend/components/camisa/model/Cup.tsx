import { useEffect, useRef, useState } from 'react'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { DesignElement } from '../types'
import html2canvas from 'html2canvas'

const Cup = ({
    elements = [],
    canvasRef
}: {
    elements?: DesignElement[]
    canvasRef: React.RefObject<HTMLDivElement>
}) => {
    const cafeTex = useTexture('/texturas/taza/cafe.jpg')
    const tazaTex = useTexture('/texturas/taza/porcelana.jpg')
    const groupRef = useRef<THREE.Group>(null)
    const [designTexture, setDesignTexture] = useState<THREE.Texture | null>(null)
    const updateTimeoutRef = useRef<NodeJS.Timeout>()

    useEffect(() => {
        const updateTexture = async () => {
            if (!canvasRef.current) return

            try {
                // Esperar a que todos los elementos estén cargados
                await new Promise(resolve => setTimeout(resolve, 100))

                // Capturar el contenido del div como canvas
                const canvas = await html2canvas(canvasRef.current as HTMLElement, {
                    backgroundColor: null,
                    logging: false,
                    useCORS: true,
                    scale: 2 // Mayor calidad
                })
                
                // Crear textura desde el canvas
                const texture = new THREE.CanvasTexture(canvas)
                texture.needsUpdate = true
                
                // Ajustar la textura
                texture.wrapS = THREE.RepeatWrapping
                texture.wrapT = THREE.RepeatWrapping
                texture.repeat.set(1, 1)
                
                setDesignTexture(texture)
            } catch (error) {
                console.error('Error al crear la textura:', error)
            }
        }

        // Limpiar el timeout anterior si existe
        if (updateTimeoutRef.current) {
            clearTimeout(updateTimeoutRef.current)
        }

        // Establecer un nuevo timeout
        updateTimeoutRef.current = setTimeout(() => {
            updateTexture()
        }, 300) // Esperar 500ms después del último cambio

        // Limpiar la textura anterior al desmontar
        return () => {
            if (designTexture) {
                designTexture.dispose()
            }
            if (updateTimeoutRef.current) {
                clearTimeout(updateTimeoutRef.current)
            }
        }
    }, [elements, canvasRef]) // Se actualiza cuando cambian los elementos o el ref

    return (
        <group ref={groupRef} scale={9}>

            {/* Boquilla */}
            <mesh position={[0, 0.15, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.14, 0.01, 16, 32]} />
                <meshBasicMaterial
                    map={tazaTex}
                    transparent
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Taza interior */}
            <mesh position={[0, 0, 0]}>
                <cylinderGeometry args={[0.15, 0.15, 0.3, 32, 1, true]} />
                <meshBasicMaterial
                    map={tazaTex}
                    transparent
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Base (solo abajo) */}
            <mesh position={[0, -0.14, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <circleGeometry args={[0.15, 32]} />
                <meshBasicMaterial
                    map={tazaTex}
                    transparent
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Base arriba (cafe) */}
            <mesh position={[0, 0.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[0.15, 32]} />
                <meshBasicMaterial
                    map={cafeTex}
                    transparent
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Asa de la taza */}
            <mesh position={[-0.14, 0, 0]} rotation={[0, 0, 0]}>
                <torusGeometry args={[0.09, 0.02, 16, 32, Math.PI * 2]} />
                <meshBasicMaterial
                    map={tazaTex}
                    transparent
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Textura en la taza - AQUÍ SE APLICA LA TEXTURA DINÁMICA */}
            <mesh position={[0, 0, 0]}>
                <cylinderGeometry
                    args={[0.151, 0.151, 0.3, 300, 1, true, 4.9, 5.9]}
                />
                <meshBasicMaterial
                    map={designTexture}
                    transparent
                    side={THREE.DoubleSide}
                    // opacity={0.9} // Ajustar según sea necesario
                />
            </mesh>

        </group>
    )
}

export default Cup