import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"


interface Product {
  id: string
  name: string
  description: string
  icon: string
}

const products: Product[] = [
  {
    id: "tshirt",
    name: "Camiseta",
    description: "Personaliza tu camiseta con tu diseño favorito",
    icon: '/camisa.png'
  },
  {
    id: "cup",
    name: "Taza",
    description: "Crea una taza única con tu diseño personalizado",
    icon: '/taza.png'
  },
  // {
  //   id: "cap",
  //   name: "Gorra",
  //   description: "Diseña tu gorra con tu estilo personal",
  //   icon: '/gorra.png'
  // }
]

export default function ProductSelection() {
  const router = useRouter()

  const handleProductSelect = (productId: string) => {
    router.push(`/personalization/${productId}`)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Elige tu Producto</h1>
        <p className="text-gray-600 text-lg">
          Selecciona el producto que deseas personalizar
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {products.map((product) => (
          <Card key={product.id} className="hover:shadow-lg transition-shadow">
            <div className="flex justify-center items-center h-32">
              <img src={product.icon} alt={product.name} />
              
            </div>
            <CardHeader className="py-2">
              <CardTitle className="text-lg">{product.name}</CardTitle>
            </CardHeader>
            <CardContent className="pt-1 pb-3">
              <p className="text-sm text-gray-600 mb-2">{product.description}</p>
              <Button
                onClick={() => handleProductSelect(product.id)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 w-full"
              >
                Personalizar
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
