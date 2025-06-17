import Image from "next/image"
import { Banner } from "@/interfaces/Banner"
import { Button } from "@/components/ui/button"
import { Palette, ShoppingBag } from "lucide-react"
import Link from "next/link"

interface BannerPromocionalProps {
  banner: Banner
}

export default function BannerPromocional({ banner }: BannerPromocionalProps) {
  return (
    <div className="relative w-full h-[400px] overflow-hidden rounded-lg">
      <div className={`relative w-full h-full bg-gradient-to-r ${banner.color}`}>
        {/* Background Image */}
        <div className="absolute inset-0 opacity-20">
          <Image
            src={banner.imagen || "/placeholder.svg"}
            alt={banner.titulo}
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
          <div className="grid lg:grid-cols-2 gap-12 items-center w-full">
            <div className="text-white space-y-6 m-10">
              <div className="space-y-4">
                <h2 className="text-sm font-semibold uppercase tracking-wider opacity-90">{banner.subtitulo}</h2>
                <h1 className="text-4xl md:text-6xl font-bold leading-tight">{banner.titulo}</h1>
                <p className="text-xl opacity-90 max-w-lg">{banner.descripcion}</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href={banner.linkBoton}>
                  <Button size="lg" className="bg-white text-gray-800 hover:bg-gray-100 font-semibold">
                    {banner.tituloBoton === "Personalizar Ahora" && <Palette className="w-5 h-5 mr-2" />}
                    {banner.tituloBoton.includes("Catálogo") && <ShoppingBag className="w-5 h-5 mr-2" />}
                    {banner.tituloBoton === "Comprar Ahora" && <ShoppingBag className="w-5 h-5 mr-2" />}
                    {banner.tituloBoton}
                  </Button>
                </Link>
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="relative">
                <Image
                  src={banner.imagen || "/placeholder.svg"}
                  alt={banner.titulo}
                  width={600}
                  height={400}
                  className="rounded-lg shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 