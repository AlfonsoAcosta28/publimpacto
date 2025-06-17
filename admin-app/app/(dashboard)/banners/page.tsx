"use client"

import Image from "next/image"
import { Edit, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useState, useEffect } from "react"
import BannerPromocional from "@/components/banners/BannerPromocional"
import "@/styles/Banner.css"
import { bannerService } from "@/services/bannerService"
import { toast } from "sonner"
import { Banner, BannerData } from "@/interfaces/Banner"
import { IoMdReturnLeft } from "react-icons/io";
import Swal from 'sweetalert2'

const gradientModels = [
  { id: 1, color: "from-blue-600 to-purple-600" },
  { id: 2, color: "from-green-500 to-lime-500" },
  { id: 3, color: "from-red-500 to-yellow-500" },
  { id: 4, color: "from-pink-500 to-indigo-500" },
  { id: 5, color: "from-teal-500 to-cyan-500" },
  { id: 6, color: "from-orange-500 to-rose-500" },
  { id: 7, color: "from-emerald-500 to-fuchsia-500" },
  { id: 8, color: "from-yellow-500 to-sky-500" },
  { id: 9, color: "from-violet-600 to-amber-500" },
  { id: 10, color: "from-gray-700 to-zinc-500" }
]

const solidColors = [
  { id: 1, color: "bg-red-600" },
  { id: 2, color: "bg-blue-600" },
  { id: 3, color: "bg-green-600" },
  { id: 4, color: "bg-yellow-600" },
  { id: 5, color: "bg-purple-600" },
  { id: 6, color: "bg-pink-600" },
  { id: 7, color: "bg-indigo-600" },
  { id: 8, color: "bg-teal-600" },
  { id: 9, color: "bg-orange-600" },
  { id: 10, color: "bg-cyan-600" },
  { id: 11, color: "bg-rose-600" },
  { id: 12, color: "bg-emerald-600" },
  { id: 13, color: "bg-violet-600" },
  { id: 14, color: "bg-fuchsia-600" },
  { id: 15, color: "bg-sky-600" },
  { id: 16, color: "bg-lime-600" },
  { id: 17, color: "bg-amber-600" },
  { id: 18, color: "bg-slate-600" },
  { id: 19, color: "bg-zinc-600" },
  { id: 20, color: "bg-neutral-600" },
]

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [currentBanner, setCurrentBanner] = useState<Banner | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    loadBanners()
  }, [])

  const loadBanners = async () => {
    try {
      const data = await bannerService.getAllBanners()
      setBanners(data)
    } catch (error) {
      toast.error("Error al cargar los banners")
    }
  }

  const handleCreateBanner = () => {
    setCurrentBanner({
      id: 0,
      titulo: "",
      subtitulo: "",
      descripcion: "",
      tituloBoton: "",
      linkBoton: "",
      imagen: "",
      color: gradientModels[0].color
    })
    setIsCreating(true)
    setEditMode(true)
  }

  const handleEditBanner = (banner: Banner) => {
    setCurrentBanner(banner)
    setEditMode(true)
    setIsCreating(false)
  }

  const handleDeleteBanner = async (id: number) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "No podrás revertir esta acción",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await bannerService.deleteBanner(id)
        Swal.fire(
          '¡Eliminado!',
          'El banner ha sido eliminado correctamente.',
          'success'
        )
        loadBanners()
      } catch (error) {
        Swal.fire(
          'Error',
          'Hubo un error al eliminar el banner.',
          'error'
        )
      }
    }
  }

  const handleSaveBanner = async () => {
    if (!currentBanner) return

    try {
      const bannerData: BannerData = {
        titulo: currentBanner.titulo,
        subtitulo: currentBanner.subtitulo,
        descripcion: currentBanner.descripcion,
        tituloBoton: currentBanner.tituloBoton,
        linkBoton: currentBanner.linkBoton,
        color: currentBanner.color
      }

      if (isCreating) {
        await bannerService.createBanner(bannerData, selectedImage || undefined)
        toast.success("Banner creado correctamente")
      } else {
        await bannerService.updateBanner(currentBanner.id, bannerData, selectedImage || undefined)
        toast.success("Banner actualizado correctamente")
      }

      setEditMode(false)
      setSelectedImage(null)
      setIsCreating(false)
      loadBanners()
    } catch (error) {
      console.log(error)
      toast.error("Error al guardar el banner")
    }
  }

  const handleColorSelect = (color: string) => {
    if (!currentBanner) return
    setCurrentBanner({ ...currentBanner, color })
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Gestión de Banners</h2>
        <div className="flex gap-2">
          {!editMode && (
            <Button size="sm" className="flex items-center gap-1" onClick={handleCreateBanner}>
              <Plus className="h-4 w-4 mr-1" />
              Crear Nuevo Banner
            </Button>
          )}
        </div>
      </div>

      {editMode && currentBanner ? (
        <>
          <div className="flex mb-4">
            <Button
              className="ml-auto"
              variant="outline"
              onClick={() => {
                setEditMode(false);
                setIsCreating(false);
                setSelectedImage(null);
              }}
            >
              <IoMdReturnLeft />
              Regresar
            </Button>
          </div>

          <Card className="mb-6">
            <CardHeader className="p-4 pb-0">

              <CardTitle className="text-base font-medium">
                {isCreating ? "Crear Nuevo Banner" : "Editar Banner"}
              </CardTitle>
              <CardDescription>
                {isCreating ? "Complete los datos del nuevo banner" : "Modifique los datos del banner"}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="titulo">Título</Label>
                  <Input
                    id="titulo"
                    value={currentBanner.titulo}
                    onChange={(e) => setCurrentBanner({ ...currentBanner, titulo: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="subtitulo">Subtítulo</Label>
                  <Input
                    id="subtitulo"
                    value={currentBanner.subtitulo}
                    onChange={(e) => setCurrentBanner({ ...currentBanner, subtitulo: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Textarea
                    id="descripcion"
                    value={currentBanner.descripcion}
                    onChange={(e) => setCurrentBanner({ ...currentBanner, descripcion: e.target.value })}
                    className="mt-1"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="tituloBoton">Título del Botón</Label>
                  <Input
                    id="tituloBoton"
                    value={currentBanner.tituloBoton}
                    onChange={(e) => setCurrentBanner({ ...currentBanner, tituloBoton: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="linkBoton">Link del Botón</Label>
                  <Input
                    id="linkBoton"
                    value={currentBanner.linkBoton}
                    onChange={(e) => setCurrentBanner({ ...currentBanner, linkBoton: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="imagen">Imagen</Label>
                  <div className="flex items-center mt-1">
                    <Input
                      id="imagen"
                      type="file"
                      className="flex-1"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setSelectedImage(e.target.files[0])
                        }
                      }}
                    />
                  </div>
                </div>

                <div>
                  <Label>Gradientes</Label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-2">
                    {gradientModels.map((model) => (
                      <div
                        key={model.id}
                        className={`h-10 rounded cursor-pointer transition-all bg-gradient-to-r ${currentBanner.color === model.color
                          ? "ring-2 ring-blue-500"
                          : "hover:ring-2 hover:ring-blue-300"
                          } ${model.color}`}
                        onClick={() => handleColorSelect(model.color)}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Colores Sólidos</Label>
                  <div className="grid grid-cols-4 md:grid-cols-10 gap-2 mt-2">
                    {solidColors.map((color) => (
                      <div
                        key={color.id}
                        className={`h-10 rounded cursor-pointer transition-all ${currentBanner.color === color.color
                          ? "ring-2 ring-blue-500"
                          : "hover:ring-2 hover:ring-blue-300"
                          } ${color.color}`}
                        onClick={() => handleColorSelect(color.color)}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2">

                  <Button onClick={handleSaveBanner}>
                    {isCreating ? "Crear Banner" : "Guardar Cambios"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="mb-6">
            <CardHeader className="p-4 pb-0">
              <CardTitle className="text-base font-medium">Vista Previa</CardTitle>
              <CardDescription>Así se verá el banner en tu tienda</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <BannerPromocional banner={currentBanner} />
            </CardContent>
          </Card>

        </>
      ) : (
        <Card>
          <CardHeader className="p-4 pb-0">
            <CardTitle className="text-base font-medium">Lista de Banners</CardTitle>
            <CardDescription>Gestiona todos tus banners</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Subtítulo</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Botón</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {banners.map((banner) => (
                  <TableRow key={banner.id}>
                    <TableCell>{banner.titulo}</TableCell>
                    <TableCell>{banner.subtitulo}</TableCell>
                    <TableCell>{banner.descripcion}</TableCell>
                    <TableCell>{banner.tituloBoton}</TableCell>
                    <TableCell>
                      <div
                        className={`w-6 h-6 rounded ${banner.color.includes("from") ? "bg-gradient-to-r" : ""
                          } ${banner.color}`}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditBanner(banner)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteBanner(banner.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </>
  )
}