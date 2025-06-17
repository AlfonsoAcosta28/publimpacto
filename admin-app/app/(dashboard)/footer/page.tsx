"use client"

import { Edit, Facebook, Instagram, Twitter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { useEffect, useState } from "react"
import { footerService } from "@/services/footerService"
import useToast  from "@/components/ui/use-toast"
import { FooterData } from "@/interfaces/Footer"


export default function FooterPage() {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [footerData, setFooterData] = useState<FooterData>({
    nombre_tienda: "",
    branding: "",
    facebook: "",
    instagram: "",
    twitter: ""
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchFooterData()
  }, [])

  const fetchFooterData = async () => {
    try {
      const data = await footerService.getFooter()
      setFooterData(data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching footer data:', error)
      toast({
        title: "Error",
        description: "No se pudo cargar la información del footer",
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
        nombre_tienda: formData.get('nombre_tienda') as string,
        branding: formData.get('branding') as string,
        facebook: formData.get('facebook') as string,
        instagram: formData.get('instagram') as string,
        twitter: formData.get('twitter') as string,
      }

      await footerService.updateFooter(updatedData)
      await fetchFooterData()
      setIsOpen(false)
      
      toast({
        title: "Éxito",
        description: "Footer actualizado correctamente"
      })
    } catch (error) {
      console.error('Error updating footer:', error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el footer",
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
        <h2 className="text-xl font-semibold">Configuración del Footer</h2>
      </div>

      <Card className="mb-6">
        <CardHeader className="p-4 pb-0">
          <CardTitle className="text-base font-medium">Información del Footer</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium">Nombre de la Tienda</h3>
              <p className="text-gray-600 mt-1">{footerData.nombre_tienda}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium">Branding</h3>
              <p className="text-gray-600 mt-1">{footerData.branding}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium">Redes Sociales</h3>
              <div className="flex space-x-4 mt-2">
                <div className="flex items-center">
                  <Facebook className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="text-gray-600">{footerData.facebook}</span>
                </div>
                <div className="flex items-center">
                  <Instagram className="h-5 w-5 text-pink-600 mr-2" />
                  <span className="text-gray-600">{footerData.instagram}</span>
                </div>
                <div className="flex items-center">
                  <Twitter className="h-5 w-5 text-blue-400 mr-2" />
                  <span className="text-gray-600">{footerData.twitter}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button className="mb-6">Actualizar Footer</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Editar Footer</DialogTitle>
              <DialogDescription>
                Actualiza la información que aparece en el footer de tu sitio web.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nombre_tienda" className="text-right">
                  Nombre de la Tienda
                </Label>
                <Input
                  id="nombre_tienda"
                  name="nombre_tienda"
                  className="col-span-3"
                  defaultValue={footerData.nombre_tienda}
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="branding" className="text-right pt-2">
                  Branding
                </Label>
                <Textarea
                  id="branding"
                  name="branding"
                  className="col-span-3"
                  rows={3}
                  defaultValue={footerData.branding}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="facebook" className="text-right">
                  Facebook
                </Label>
                <Input
                  id="facebook"
                  name="facebook"
                  className="col-span-3"
                  defaultValue={footerData.facebook}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="instagram" className="text-right">
                  Instagram
                </Label>
                <Input
                  id="instagram"
                  name="instagram"
                  className="col-span-3"
                  defaultValue={footerData.instagram}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="twitter" className="text-right">
                  Twitter
                </Label>
                <Input
                  id="twitter"
                  name="twitter"
                  className="col-span-3"
                  defaultValue={footerData.twitter}
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