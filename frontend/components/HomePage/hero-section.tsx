import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShoppingBag, Palette } from "lucide-react"
import BannerCarousel from "@/components/banner-carousel"

export default function HeroSection() {
  return (
    <>
      <section className="relative h-[600px] overflow-hidden">
        <BannerCarousel />
      </section>

      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6">
            Productos{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Personalizados
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Descubre nuestra amplia gama de productos y personalízalos con tu diseño único. Visualiza en 3D cómo quedará
            tu producto antes de comprarlo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/catalog">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                Ver Catálogo
              </Button>
            </Link>
            <Link href="/personalization">
              <Button size="lg" variant="outline">
                <Palette className="w-5 h-5 mr-2" />
                Personalizar Producto
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
} 