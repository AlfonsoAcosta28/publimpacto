"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment } from "@react-three/drei"
import Cup from "@/components/camisa/model/Cup"
import { DesignElement } from "@/components/camisa/types"

interface Cup3DProps {
    img: string | null;
    posicion: string;
    elements: DesignElement[];
}

export default function Cup3D({ img, posicion, elements }: Cup3DProps) {
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

    return (
        <div className="h-[500px] rounded-lg shadow-lg p-6 bg-white">
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
    )
} 