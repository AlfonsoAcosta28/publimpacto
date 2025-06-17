import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment } from "@react-three/drei"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import TShirtModel from "./TShirtModel"
import MugModel from "./MugModel"
import CapModel from "./CapModel"

interface ProductViewerProps {
  selectedProduct: string
  customImage: string | null
}

const productComponents = {
  tshirt: TShirtModel,
  mug: MugModel,
  cap: CapModel,
}

export default function ProductViewer({ selectedProduct, customImage }: ProductViewerProps) {
  const ModelComponent = productComponents[selectedProduct as keyof typeof productComponents]

  return (
    <Card className="h-[600px]">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Vista 3D del Producto
          <Badge variant="secondary">Interactivo</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[500px] p-0">
        <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <ModelComponent customTexture={customImage} />
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={2}
            maxDistance={10}
          />
          <Environment preset="studio" />
        </Canvas>
      </CardContent>
    </Card>
  )
} 