"use client"

import { useState, useEffect } from "react"
import {
  Search,
  Filter,
  Download,
  MoreHorizontal
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { userService } from "@/services/userService"
import  useToast  from "@/components/ui/use-toast"
import { User } from "@/interfaces/User"


export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userOrders, setUserOrders] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showOrders, setShowOrders] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await userService.getAllUsers();
      setUsers(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los usuarios",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const formData = new FormData(e.currentTarget);
      const userData = {
        correo: formData.get('correo'),
        password: formData.get('password'),
        telefono: formData.get('telefono'),
        codigo_postal: formData.get('codigo_postal'),
        calle: formData.get('calle'),
        numero_calle: formData.get('numero_calle'),
        descripcion_casa: formData.get('descripcion_casa'),
      };

      await userService.createUser(userData);
      await fetchUsers();
      setIsOpen(false);
      toast({
        title: "Éxito",
        description: "Usuario creado correctamente"
      });
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el usuario",
        variant: "destructive"
      });
    }
  };

  const handleDeleteUser = async (id: number) => {
    try {
      await userService.deleteUser(id);
      await fetchUsers();
      toast({
        title: "Éxito",
        description: "Usuario eliminado correctamente"
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el usuario",
        variant: "destructive"
      });
    }
  };

  const handleEditUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedUser) return;
  
    try {
      const formData = new FormData(e.currentTarget);
      const userData = {
        correo: formData.get('correo'),
        telefono: formData.get('telefono'),
        codigo_postal: formData.get('codigo_postal'),
        calle: formData.get('calle'),
        numero_calle: formData.get('numero_calle'),
        descripcion_casa: formData.get('descripcion_casa'),
      };
  
      await userService.updateUser(selectedUser.id, userData);
      await fetchUsers();
      setIsEditMode(false);
      setSelectedUser(null);
      toast({
        title: "Éxito",
        description: "Usuario actualizado correctamente"
      });
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el usuario",
        variant: "destructive"
      });
    }
  };
  
  const handleViewOrders = async (userId: number) => {
    try {
      const orders = await userService.getUserOrders(userId);
      setUserOrders(orders);
      setShowOrders(true);
    } catch (error) {
      console.error('Error fetching user orders:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los pedidos del usuario",
        variant: "destructive"
      });
    }
  };

  const filteredUsers = users.filter(user => 
    user.correo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.telefono.includes(searchQuery)
  );

  const OrdersDialog = () => (
    <Dialog open={showOrders} onOpenChange={setShowOrders}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Pedidos del Usuario</DialogTitle>
          <DialogDescription>
            Historial de pedidos del usuario {selectedUser?.correo}
          </DialogDescription>
        </DialogHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userOrders.map((order: any) => (
                <TableRow key={order.id}>
                  <TableCell>#{order.id}</TableCell>
                  <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>{order.status}</TableCell>
                  <TableCell>${order.total}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );

  if (loading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
    </div>
  }

  return (
     <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Gestión de Usuarios</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Filter className="h-4 w-4" />
                Filtrar
              </Button>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Download className="h-4 w-4" />
                Exportar
              </Button>
            </div>
          </div>
    
          <Card className="mb-6">
            <CardHeader className="p-4 pb-0">
              <CardTitle className="text-base font-medium">Lista de Usuarios</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar usuario por correo o teléfono"
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full md:w-[400px] text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
    
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Avatar</TableHead>
                      <TableHead>Correo</TableHead>
                      <TableHead>Teléfono</TableHead>
                      <TableHead>Código Postal</TableHead>
                      <TableHead>Fecha Registro</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">#{user.id}</TableCell>
                        <TableCell>
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.correo} />
                            <AvatarFallback>{user.correo.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                        </TableCell>
                        <TableCell>{user.correo}</TableCell>
                        <TableCell>{user.telefono}</TableCell>
                        <TableCell>{user.codigo_postal}</TableCell>
                        <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => {
                                setSelectedUser(user);
                                setIsEditMode(true);
                              }}>Editar</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleViewOrders(user.id)}>
                                Ver Pedidos
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-600" 
                                onClick={() => handleDeleteUser(user.id)}
                              >
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
    
          <Dialog 
            open={isOpen || isEditMode} 
            onOpenChange={(open) => {
              if (!open) {
                setIsOpen(false);
                setIsEditMode(false);
                setSelectedUser(null);
              }
            }}
          >
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>
                  {isEditMode ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
                </DialogTitle>
                <DialogDescription>
                  {isEditMode 
                    ? 'Actualiza los detalles del usuario.' 
                    : 'Completa los detalles para registrar un nuevo usuario.'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={isEditMode ? handleEditUser : handleCreateUser}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="correo" className="text-right">
                      Correo
                    </Label>
                    <Input
                      id="correo"
                      name="correo"
                      type="email"
                      defaultValue={selectedUser?.correo}
                      placeholder="correo@ejemplo.com"
                      className="col-span-3"
                    />
                  </div>
                  {!isEditMode && (
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="password" className="text-right">
                        Contraseña
                      </Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        className="col-span-3"
                      />
                    </div>
                  )}
                  {/* ...rest of the form fields with defaultValue={selectedUser?.fieldName} */}
                </div>
                <DialogFooter>
                  <Button type="submit">
                    {isEditMode ? 'Actualizar Usuario' : 'Crear Usuario'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <OrdersDialog />
          {showOrders && <OrdersDialog />}
        </>
  )
}