"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, ShoppingBag, LogOut, Settings,BadgeDollarSign  } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { authService } from "@/services/authService"
import { toast } from "sonner"

export default function UserMenu() {
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuth()

  const handleLogout = () => {
    authService.logout()
    logout()
    router.push("/")
    toast.success("Session cerrada con exito")
  }

  if (!isAuthenticated) {
    return (
      <Link href="/login">
        <Button variant="outline" size="sm">
          <User className="w-4 h-4 mr-2" />
          Iniciar Sesión
        </Button>
      </Link>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.nombre} />
            <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <User className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.nombre}</p>
            <p className="text-xs leading-none text-muted-foreground">{user?.correo}</p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <Link href="/profile">
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            <span>Mi Perfil</span>
          </DropdownMenuItem>
        </Link>

        <Link href="/orders">
          <DropdownMenuItem>
            <ShoppingBag className="mr-2 h-4 w-4" />
            <span>Mis Compras</span>
          </DropdownMenuItem>
        </Link>
        
        <Link href="/quotes">
          <DropdownMenuItem>
            <BadgeDollarSign className="mr-2 h-4 w-4" />
            <span>Mis cotizaciones</span>
          </DropdownMenuItem>
        </Link>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleLogout} className="text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Cerrar Sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
