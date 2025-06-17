"use client"

import { Edit, Image as ImageIcon } from "lucide-react"
import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../components/ui/dialog"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Textarea } from "../../../components/ui/textarea"
import { useEffect, useState } from "react"
import { aboutUsService } from "@/services/aboutUsService"
import useToast  from "@/components/ui/use-toast"
import { AboutUsData } from "@/interfaces/AboutUs"



export default function AboutUsPage() {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [aboutUsData, setAboutUsData] = useState<AboutUsData>({
    descripcion: "",
    ubicacion_texto: "",
    ubicacion_maps: "",
    telefono: "",
    correo: ""
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchAboutUsData()
  }, [])

  const fetchAboutUsData = async () => {
    try {
      const data = await aboutUsService.getAboutUs()
      setAboutUsData(data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching about us data:', error)
      toast({
        title: "Error",
        description: "No se pudo cargar la información",
        variant: "destructive"
      })
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      const formData = new FormData(e.currentTarget)
      const updatedData = {
        descripcion: formData.get('descripcion') as string,
        ubicacion_texto: formData.get('ubicacion_texto') as string,
        ubicacion_maps: formData.get('ubicacion_maps') as string,
        telefono: formData.get('telefono') as string,
        correo: formData.get('correo') as string,
      }

      await aboutUsService.updateAboutUs(updatedData)
      await fetchAboutUsData()
      setIsOpen(false)
      
      toast({
        title: "Éxito",
        description: "Información actualizada correctamente"
      })
    } catch (error) {
      console.error('Error updating about us:', error)
      toast({
        title: "Error",
        description: "No se pudo actualizar la información",
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
    </div>
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Acerca de Nosotros</h2>
      </div>

      <Card className="mb-6">
        <CardHeader className="p-4 pb-0">
          <CardTitle className="text-base font-medium">Información de la Empresa</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium">Descripción</h3>
              <p className="text-gray-600 mt-1">{aboutUsData.descripcion}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium">Ubicación</h3>
              <p className="text-gray-600 mt-1">{aboutUsData.ubicacion_texto}</p>
              {aboutUsData.ubicacion_maps && (
                <div className="mt-2 h-48">
                  <iframe
                    src={aboutUsData.ubicacion_maps}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              )}
            </div>
            <div>
              <h3 className="text-sm font-medium">Contacto</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
                <div>
                  <p className="text-gray-600">
                    <span className="font-medium">Teléfono:</span> {aboutUsData.telefono}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">
                    <span className="font-medium">Correo:</span> {aboutUsData.correo}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button className="mb-6">Actualizar Información</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Editar Información de la Empresa</DialogTitle>
              <DialogDescription>Actualiza la información de "Acerca de Nosotros".</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="descripcion" className="text-right pt-2">
                  Descripción
                </Label>
                <Textarea
                  id="descripcion"
                  name="descripcion"
                  className="col-span-3"
                  rows={4}
                  defaultValue={aboutUsData.descripcion}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="ubicacion_texto" className="text-right">
                  Ubicación
                </Label>
                <Input
                  id="ubicacion_texto"
                  name="ubicacion_texto"
                  className="col-span-3"
                  defaultValue={aboutUsData.ubicacion_texto}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="ubicacion_maps" className="text-right">
                  Enlace de Maps
                </Label>
                <Input
                  id="ubicacion_maps"
                  name="ubicacion_maps"
                  className="col-span-3"
                  defaultValue={aboutUsData.ubicacion_maps}
                  placeholder="URL de Google Maps"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="telefono" className="text-right">
                  Teléfono
                </Label>
                <Input
                  id="telefono"
                  name="telefono"
                  className="col-span-3"
                  defaultValue={aboutUsData.telefono}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="correo" className="text-right">
                  Correo
                </Label>
                <Input
                  id="correo"
                  name="correo"
                  className="col-span-3"
                  defaultValue={aboutUsData.correo}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Guardar Cambios</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}