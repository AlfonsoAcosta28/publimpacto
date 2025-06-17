import { useRef } from "react"
import { useFrame, useLoader } from "@react-three/fiber"
import { TextureLoader } from "three"
import type * as THREE from "three"

interface MugModelProps {
  customTexture: string | null
}

export default function MugModel({ customTexture }: MugModelProps) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3
    }
  })

  const texture = useLoader(TextureLoader, customTexture || "/camisa.png")

  return (
    <group>
      <mesh ref={meshRef} position={[0, 0, 0]} scale={[1.5, 1.5, 1.5]}>
        <cylinderGeometry args={[0.8, 0.8, 1.2, 32]} />
        <meshPhysicalMaterial 
          map={texture}
          color="#ffffff"
          roughness={0.1}
          metalness={0.1}
          clearcoat={1.0}
          clearcoatRoughness={0.1}
          envMapIntensity={1.0}
        />
      </mesh>
      {/* Handle */}
      <mesh position={[1, 0, 0]} scale={[1.5, 1.5, 1.5]}>
        <torusGeometry args={[0.3, 0.1, 8, 16]} />
        <meshPhysicalMaterial 
          color="#ffffff"
          roughness={0.1}
          metalness={0.1}
          clearcoat={1.0}
          clearcoatRoughness={0.1}
          envMapIntensity={1.0}
        />
      </mesh>
    </group>
  )
} 