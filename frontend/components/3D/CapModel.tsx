import { useRef } from "react"
import { useFrame, useLoader } from "@react-three/fiber"
import { TextureLoader } from "three"
import type * as THREE from "three"

interface CapModelProps {
  customTexture: string | null
}

export default function CapModel({ customTexture }: CapModelProps) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.2
    }
  })

  const texture = useLoader(TextureLoader, customTexture || "/camisa.png")

  return (
    <group>
      {/* Crown */}
      <mesh ref={meshRef} position={[0, 0.2, 0]} scale={[2, 2, 2]}>
        <sphereGeometry args={[0.6, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
        <meshStandardMaterial map={texture} color="#ffffff" />
      </mesh>
      {/* Visor */}
      <mesh position={[0, -0.1, 0.8]} rotation={[0.2, 0, 0]} scale={[2, 2, 2]}>
        <cylinderGeometry args={[0.8, 1, 0.05, 32, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </group>
  )
} 