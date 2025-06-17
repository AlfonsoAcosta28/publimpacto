"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ShoppingBag, Palette } from "lucide-react"
import bannerService from "@/services/bannerService"
import { Banner } from "@/interfaces/Banner"

const colorMap: { [key: string]: string } = {
  // Gradientes
  'from-blue-600 to-purple-600': 'bg-gradient-to-r from-blue-600 to-purple-600',
  'from-green-500 to-lime-500': 'bg-gradient-to-r from-green-500 to-lime-500',
  'from-red-500 to-yellow-500': 'bg-gradient-to-r from-red-500 to-yellow-500',
  'from-pink-500 to-indigo-500': 'bg-gradient-to-r from-pink-500 to-indigo-500',
  'from-teal-500 to-cyan-500': 'bg-gradient-to-r from-teal-500 to-cyan-500',
  'from-orange-500 to-rose-500': 'bg-gradient-to-r from-orange-500 to-rose-500',
  'from-emerald-500 to-fuchsia-500': 'bg-gradient-to-r from-emerald-500 to-fuchsia-500',
  'from-yellow-500 to-sky-500': 'bg-gradient-to-r from-yellow-500 to-sky-500',
  'from-violet-600 to-amber-500': 'bg-gradient-to-r from-violet-600 to-amber-500',
  'from-gray-700 to-zinc-500': 'bg-gradient-to-r from-gray-700 to-zinc-500',
  
  // Colores sólidos
  'bg-red-600': 'bg-red-600',
  'bg-blue-600': 'bg-blue-600',
  'bg-green-600': 'bg-green-600',
  'bg-yellow-600': 'bg-yellow-600',
  'bg-purple-600': 'bg-purple-600',
  'bg-pink-600': 'bg-pink-600',
  'bg-indigo-600': 'bg-indigo-600',
  'bg-teal-600': 'bg-teal-600',
  'bg-orange-600': 'bg-orange-600',
  'bg-cyan-600': 'bg-cyan-600',
  'bg-rose-600': 'bg-rose-600',
  'bg-emerald-600': 'bg-emerald-600',
  'bg-violet-600': 'bg-violet-600',
  'bg-fuchsia-600': 'bg-fuchsia-600',
  'bg-sky-600': 'bg-sky-600',
  'bg-lime-600': 'bg-lime-600',
  'bg-amber-600': 'bg-amber-600',
  'bg-slate-600': 'bg-slate-600',
  'bg-zinc-600': 'bg-zinc-600',
  'bg-neutral-600': 'bg-neutral-600'
};

export default function BannerCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [banners, setBanners] = useState<Banner[]>([])

  useEffect(() => {
    const fetchBanners = async () => {
      const data = await bannerService.getAllBanners()
      setBanners(data)
    }
    fetchBanners()
  }, [])

  useEffect(() => {
    if (banners.length === 0) return

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length)
    }, 6000) 

    return () => clearInterval(timer)
  }, [banners.length])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  if (banners.length === 0) {
    return null // or a loading state
  }

  return (
    <div className="relative w-full h-full overflow-hidden">
      {banners.map((banner, index) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
            index === currentSlide ? "translate-x-0" : index < currentSlide ? "-translate-x-full" : "translate-x-full"
          }`}
        >
          <div className={`relative w-full h-full ${colorMap[banner.color] || 'bg-gradient-to-r from-blue-600 to-purple-600'}`}>
            {/* Background Image */}
            <div className="absolute inset-0 opacity-20">
              <Image
                src={banner.imagen || "/placeholder.svg"}
                alt={banner.titulo}
                fill
                className="object-cover"
                priority={index === 0}
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
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-colors ${index === currentSlide ? "bg-white" : "bg-white/50"}`}
          />
        ))}
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20 z-20">
        <div
          className="h-full bg-white transition-all duration-5000 ease-linear"
          style={{
            width: `${((currentSlide + 1) / banners.length) * 100}%`,
          }}
        />
      </div>
    </div>
  )
}