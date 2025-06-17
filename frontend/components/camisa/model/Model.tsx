import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

import { Tshirt } from './'
import { Loader } from '../containers'
import { Irgb } from '../types'

interface ModelProps {
	isMobile: boolean
	color: Irgb
	logoF: string
	logoT: string
	logoMD: string
	logoMI: string
	isLogo: boolean
	frontalScale?: number
	frontalX?: number
	frontalY?: number
	traseroScale?: number
	traseroX?: number
	traseroY?: number
}

const Model = ({
	isMobile,
	color,
	logoF,
	logoT,
	logoMD,
	logoMI,
	isLogo,
	frontalScale,
	frontalX,
	frontalY,
	traseroScale,
	traseroX,
	traseroY
}: ModelProps) => {
	return (
		<Canvas
			shadows
			gl={{ preserveDrawingBuffer: true }}
			camera={{
				fov: 10,
				position: [0, 5, 20],
			}}
		>
			<Suspense fallback={<Loader />}>
				<hemisphereLight groundColor={'#111'} intensity={0.01} />
				<Tshirt
					logoF={logoF}
					logoT={logoT}
					logoMD={logoMD}
					logoMI={logoMI}
					color={color}
					isMobile={isMobile}
					isLogo={isLogo}
					frontalScale={frontalScale}
					frontalX={frontalX}
					frontalY={frontalY}
					traseroScale={traseroScale}
					traseroX={traseroX}
					traseroY={traseroY}
				/>
				<OrbitControls
					target={[0, isMobile ? 0.8 : 0.4, 0]}
					maxDistance={30}
					minDistance={8}
					maxPolarAngle={Math.PI / 1.94}
					minPolarAngle={Math.PI / 4}
					enablePan={false}
				/>
			</Suspense>
		</Canvas>
	)
}

export default Model
