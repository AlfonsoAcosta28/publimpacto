import { Shield, Headphones, Star } from "lucide-react"

export default function TrustIndicators() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div className="flex flex-col items-center">
            <Shield className="w-12 h-12 text-green-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Compra Segura</h3>
            <p className="text-gray-600">Transacciones 100% seguras y protegidas</p>
          </div>
          <div className="flex flex-col items-center">
            <Headphones className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Soporte 24/7</h3>
            <p className="text-gray-600">Atención al cliente disponible siempre</p>
          </div>
          <div className="flex flex-col items-center">
            <Star className="w-12 h-12 text-yellow-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Garantía de Calidad</h3>
            <p className="text-gray-600">Satisfacción garantizada o te devolvemos tu dinero</p>
          </div>
        </div>
      </div>
    </section>
  )
} 