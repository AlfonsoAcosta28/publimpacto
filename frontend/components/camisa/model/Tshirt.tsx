import { useEffect } from 'react'
import { useGLTF, useTexture, Decal } from '@react-three/drei'
import * as THREE from 'three'

import modelGltf from '../assets/3d/tshirt.glb'
import { Irgb } from '../types'

interface TshirtProps {
	color: Irgb
	logoF: string
	logoT: string
	logoMD: string
	logoMI: string
	isMobile: boolean
	isLogo: boolean
	frontalScale?: number
	frontalX?: number
	frontalY?: number
	traseroScale?: number
	traseroX?: number
	traseroY?: number
}

const Tshirt = ({
	logoF,
	logoT,
	logoMD,
	logoMI,
	color,
	isMobile,
	isLogo,
	frontalScale = 0.03,
	frontalX = 0.075,
	frontalY = -0.12,
	traseroScale = 0.03,
	traseroX = 0.075,
	traseroY = 0.08
}: TshirtProps) => {
	const { nodes, materials } = useGLTF(modelGltf) as any

	const logoTexF = useTexture(logoF)
	const logoTexT = useTexture(logoT)
	const logoTexMD = useTexture(logoMD)
	const logoTexMI = useTexture(logoMI)

	useEffect(() => { }, [logoF, logoT, logoMD, logoMI])

	logoTexF.colorSpace = THREE.SRGBColorSpace
	logoTexT.colorSpace = THREE.SRGBColorSpace
	logoTexMD.colorSpace = THREE.SRGBColorSpace
	logoTexMI.colorSpace = THREE.SRGBColorSpace

	useEffect(() => {
		if (color.r < 5 && color.g < 5 && color.b < 5) {
			materials.color.color.r = 5
			materials.color.color.g = 5
			materials.color.color.b = 5
		} else {
			materials.color.color.r = color.r
			materials.color.color.g = color.g
			materials.color.color.b = color.b
		}
	}, [color])

	return (
		<group scale={isMobile ? 4 : 6}>
			<mesh
				castShadow
				receiveShadow
				name="tshirt"
				geometry={nodes.tshirt.geometry}
				material={materials.color}
				position={[0, isMobile ? 0.35 : 0.1, 0]}
				dispose={null}
			>
				{/* Frontal */}
				<Decal
					position={[frontalX, frontalY, 0.12]}
					rotation={[0, 0, 0]}
					scale={frontalScale}
					map={logoTexF}
					depthTest={true}
				/>
				{/* Trasera */}
				<Decal
					position={[traseroX, traseroY, -0.11]}
					rotation={[0, Math.PI, 0]}
					scale={traseroScale}
					map={logoTexT}
				/>
				{/* Manga Derecha */}
				<Decal
					position={[-0.25, 0.09, 0.0001]}
					rotation={[0, -1, 0]}
					scale={0.1}
					map={logoTexMD}
				/>
				{/* Manga Izquierda */}
				<Decal
					position={[0.23, 0.09, 0.0001]}
					rotation={[0, 1, 0]}
					scale={0.1}
					map={logoTexMI}
				/>
			</mesh>
		</group>
	)
}

export default Tshirt
