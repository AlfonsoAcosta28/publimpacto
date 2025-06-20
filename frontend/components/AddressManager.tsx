import { useState, useEffect } from "react";
import { addressService } from "@/services/addressService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Swal from "sweetalert2";

interface Address {
  id?: number;
  nombre: string;
  calle: string;
  numero_calle: string;
  colonia: string;
  ciudad: string;
  estado: string;
  codigo_postal: string;
  referencias: string;
  descripcion_casa: string;
  horario_preferido: string;
  is_default?: boolean;
  es_principal: boolean;
}

interface AddressManagerProps {
  onAddressSelect?: (address: Address) => void;
  selectedAddressId?: number;
  showSelectButton?: boolean;
}

export default function AddressManager({ onAddressSelect, selectedAddressId, showSelectButton }: AddressManagerProps) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [currentAddress, setCurrentAddress] = useState<Partial<Address>>({
    nombre: '',
    calle: '',
    numero_calle: '',
    colonia: '',
    ciudad: '',
    estado: '',
    codigo_postal: '',
    referencias: '',
    descripcion_casa: '',
    horario_preferido: '',
    es_principal: false
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [errors, setErrors] = useState<Partial<Address>>({});
  const [selectedId, setSelectedId] = useState<number | null>(selectedAddressId || null);

  const horariosDisponibles = [
    "9:00 - 10:00",
    "10:00 - 11:00",
    "11:00 - 12:00",
    "12:00 - 13:00",
    "13:00 - 14:00",
    "14:00 - 15:00",
    "15:00 - 16:00",
    "16:00 - 17:00",
    "17:00 - 18:00"
  ];

  useEffect(() => {
    fetchAddresses();
  }, []);

  useEffect(() => {
    // Seleccionar automáticamente la dirección principal si no hay una seleccionada
    if (addresses.length > 0 && !selectedAddressId) {
      const defaultAddress = addresses.find(addr => addr.es_principal);
      if (defaultAddress && onAddressSelect) {
        onAddressSelect(defaultAddress);
        setSelectedId(defaultAddress.id!);
      }
    } else if (selectedAddressId) {
      setSelectedId(selectedAddressId);
    }
  }, [addresses, selectedAddressId, onAddressSelect]);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const data = await addressService.getAllAddresses();
      setAddresses(data);
      setError(null);
    } catch (error) {
      setError('Error al cargar las direcciones');
      console.error('Error fetching addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateAddress = (address: Address) => {
    const newErrors: Partial<Address> = {};

    if (!address.nombre) newErrors.nombre = 'El nombre es requerido';
    if (!address.calle) newErrors.calle = 'La calle es requerida';
    if (!address.numero_calle) newErrors.numero_calle = 'El número es requerido';
    if (!address.colonia) newErrors.colonia = 'La colonia es requerida';
    if (!address.ciudad) newErrors.ciudad = 'La ciudad es requerida';
    if (!address.estado) newErrors.estado = 'El estado es requerido';
    if (!address.codigo_postal) newErrors.codigo_postal = 'El código postal es requerido';
    if (!address.descripcion_casa) newErrors.descripcion_casa = 'La descripción es requerida';
    if (!address.horario_preferido) newErrors.horario_preferido = 'El horario es requerido';

    if (address.codigo_postal && !/^[0-9]{5}$/.test(address.codigo_postal)) {
      newErrors.codigo_postal = 'El código postal debe tener 5 dígitos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateAddress(currentAddress as Address)) {
      toast.error("Por favor completa todos los campos correctamente");
      return;
    }

    try {
      if (currentAddress.id) {
        await addressService.updateAddress(currentAddress.id, currentAddress as Address);
        toast.success("Dirección actualizada correctamente");
      } else {
        await addressService.createAddress(currentAddress as Address);
        toast.success("Dirección agregada correctamente");
      }

      setIsDialogOpen(false);
      fetchAddresses();
      setCurrentAddress({
        nombre: '',
        calle: '',
        numero_calle: '',
        colonia: '',
        ciudad: '',
        estado: '',
        codigo_postal: '',
        referencias: '',
        descripcion_casa: '',
        horario_preferido: '',
        es_principal: false
      });
    } catch (error : any) {
      if (error.response.status === 400) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Error al guardar la dirección");
      }
    }
  };

  const handleEdit = (address: Address) => {
    setCurrentAddress(address);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "No podrás revertir esta acción",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar"
    });
    if (result.isConfirmed) {
      try {
        await addressService.deleteAddress(id);
        toast.success("Dirección eliminada correctamente");
        fetchAddresses();
      } catch (error) {
        toast.error("Error al eliminar la dirección");
      }
    }
    
  };

  const handleSetDefault = async (id: number) => {
    try {
      await addressService.setDefaultAddress(id);
      toast.success("Dirección predeterminada actualizada");
      await fetchAddresses();
      // Encontrar la dirección que se acaba de establecer como predeterminada
      const updatedAddress = addresses.find(addr => addr.id === id);
      if (updatedAddress && onAddressSelect) {
        onAddressSelect(updatedAddress);
      }
    } catch (error) {
      toast.error("Error al actualizar la dirección predeterminada");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-medium">Mis Direcciones</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setCurrentAddress({
              nombre: '',
              calle: '',
              numero_calle: '',
              colonia: '',
              ciudad: '',
              estado: '',
              codigo_postal: '',
              referencias: '',
              descripcion_casa: '',
              horario_preferido: '',
              es_principal: false
            })}>
              Agregar Nueva Dirección
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {currentAddress.id ? 'Editar Dirección' : 'Nueva Dirección'}
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="md:col-span-2">
                <Label htmlFor="nombre">Nombre identificador de la dirección</Label>
                <Input
                  id="nombre"
                  value={currentAddress.nombre as string}
                  onChange={(e) => setCurrentAddress({ ...currentAddress, nombre: e.target.value })}
                  className={errors.nombre ? "border-red-500" : ""}
                  placeholder="Ej: Casa, Trabajo, etc."
                />
                {errors.nombre && <span className="text-sm text-red-500">{errors.nombre}</span>}
              </div>
              <div>
                <Label htmlFor="calle">Calle</Label>
                <Input
                  id="calle"
                  value={currentAddress.calle as string}
                  onChange={(e) => setCurrentAddress({ ...currentAddress, calle: e.target.value })}
                  className={errors.calle ? "border-red-500" : ""}
                />
                {errors.calle && <span className="text-sm text-red-500">{errors.calle}</span>}
              </div>
              <div>
                <Label htmlFor="numero_calle">Número</Label>
                <Input
                  id="numero_calle"
                  value={currentAddress.numero_calle as string}
                  onChange={(e) => setCurrentAddress({ ...currentAddress, numero_calle: e.target.value })}
                  className={errors.numero_calle ? "border-red-500" : ""}
                />
                {errors.numero_calle && <span className="text-sm text-red-500">{errors.numero_calle}</span>}
              </div>
              <div>
                <Label htmlFor="colonia">Colonia</Label>
                <Input
                  id="colonia"
                  value={currentAddress.colonia as string}
                  onChange={(e) => setCurrentAddress({ ...currentAddress, colonia: e.target.value })}
                  className={errors.colonia ? "border-red-500" : ""}
                />
                {errors.colonia && <span className="text-sm text-red-500">{errors.colonia}</span>}
              </div>
              <div>
                <Label htmlFor="codigo_postal">Código Postal</Label>
                <Input
                  id="codigo_postal"
                  value={currentAddress.codigo_postal as string}
                  onChange={(e) => setCurrentAddress({ ...currentAddress, codigo_postal: e.target.value })}
                  className={errors.codigo_postal ? "border-red-500" : ""}
                />
                {errors.codigo_postal && <span className="text-sm text-red-500">{errors.codigo_postal}</span>}
              </div>
              <div>
                <Label htmlFor="ciudad">Ciudad</Label>
                <Input
                  id="ciudad"
                  value={currentAddress.ciudad as string}
                  onChange={(e) => setCurrentAddress({ ...currentAddress, ciudad: e.target.value })}
                  className={errors.ciudad ? "border-red-500" : ""}
                />
                {errors.ciudad && <span className="text-sm text-red-500">{errors.ciudad}</span>}
              </div>
              <div>
                <Label htmlFor="estado">Estado</Label>
                <Input
                  id="estado"
                  value={currentAddress.estado as string}
                  onChange={(e) => setCurrentAddress({ ...currentAddress, estado: e.target.value })}
                  className={errors.estado ? "border-red-500" : ""}
                />
                {errors.estado && <span className="text-sm text-red-500">{errors.estado}</span>}
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="horario_preferido">Horario Preferido</Label>
                <span className="text-sm text-gray-400 ">Este es un horario de preferencia para la entrega de tu pedido</span>
                <Select
                  value={currentAddress.horario_preferido as string}
                  onValueChange={(value) => setCurrentAddress({ ...currentAddress, horario_preferido: value })}
                >
                  <SelectTrigger className={errors.horario_preferido ? "border-red-500" : ""}>
                    <SelectValue placeholder="Selecciona un horario" />

                  </SelectTrigger>
                  <SelectContent>
                    {horariosDisponibles.map((horario) => (
                      <SelectItem key={horario} value={horario}>
                        {horario}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.horario_preferido && <span className="text-sm text-red-500">{errors.horario_preferido}</span>}
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="descripcion_casa">Descripción de la Casa</Label>
                <Textarea
                  id="descripcion_casa"
                  value={currentAddress.descripcion_casa as string}
                  onChange={(e) => setCurrentAddress({ ...currentAddress, descripcion_casa: e.target.value })}
                  className={errors.descripcion_casa ? "border-red-500" : ""}
                />
                {errors.descripcion_casa && <span className="text-sm text-red-500">{errors.descripcion_casa}</span>}
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="referencias">Referencias</Label>
                <Textarea
                  id="referencias"
                  value={currentAddress.referencias as string}
                  onChange={(e) => setCurrentAddress({ ...currentAddress, referencias: e.target.value })}
                  placeholder="Indica puntos de referencia para encontrar tu domicilio"
                />
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit}>
                {currentAddress.id ? 'Actualizar' : 'Guardar'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
        {addresses.map((address) => (
          <div
            key={address.id}
            className={`p-4 border rounded-lg transition-colors duration-200 ${showSelectButton && selectedId === address.id
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-transparent'
              : selectedAddressId === address.id
                ? 'border-pink-500'
                : 'border-gray-200'
              } ${address.is_default && !(showSelectButton && selectedId === address.id) ? 'bg-gray-50' : ''}`}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-medium">
                  {address.calle} {address.numero_calle}
                  {address.es_principal && (
                    <span className="ml-2 text-sm text-white-200">(Predeterminada)</span>
                  )}
                </h3>
                <p className={`text-sm text-gray-600  ${showSelectButton && selectedId === address.id ? 'text-white' : 'text-black'}`} >
                  {address.colonia}, {address.ciudad}, {address.estado}
                </p>
                <p className={`text-sm  ${showSelectButton && selectedId === address.id ? 'text-white' : 'text-gray-600'} `}>CP: {address.codigo_postal}</p>
                <p className={`text-sm  ${showSelectButton && selectedId === address.id ? 'text-white' : 'text-gray-600'} `}>Horario: {address.horario_preferido}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  className="text-black"
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(address)}
                >
                  Editar
                </Button>
                <Button
                  className="bg-red-500 hover:bg-red-600 text-white hover:text-white !important"

                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(address.id!)}
                >
                  Eliminar
                </Button>
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              {!address.es_principal && !showSelectButton && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSetDefault(address.id!)}
                >
                  Establecer como predeterminada
                </Button>
              )}
              {showSelectButton && (
                <Button
                  size="sm"
                  className={selectedId === address.id ? 'bg-white text-black hover:bg-white hover:cursor-default' : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'}
                  onClick={() => {
                    setSelectedId(address.id!);
                    if (onAddressSelect) onAddressSelect(address);
                  }}
                >
                  {selectedId === address.id ? 'Seleccionado' : 'Seleccionar'}

                </Button>
              )}
              {!showSelectButton && onAddressSelect && (
                <Button
                  size="sm"
                  onClick={() => onAddressSelect(address)}
                  className={selectedAddressId === address.id ? 'bg-pink-500' : ''}
                >
                  Seleccionar
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 