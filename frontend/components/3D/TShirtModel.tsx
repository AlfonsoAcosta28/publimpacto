import { useRef } from "react"
import { useFrame, useLoader } from "@react-three/fiber"
import { TextureLoader } from "three"
import type * as THREE from "three"

interface TShirtModelProps {
  customTexture: string | null
}

export default function TShirtModel({ customTexture }: TShirtModelProps) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
    }
  })

  const texture = useLoader(TextureLoader, customTexture || '/camisa.png')

  return (
    <mesh ref={meshRef} position={[0, 0, 0]} scale={[2, 2, 2]}>
      <boxGeometry args={[1, 1.3, 0.1]} />
      <meshStandardMaterial map={texture} color="#ffffff" />
    </mesh>
  )
}