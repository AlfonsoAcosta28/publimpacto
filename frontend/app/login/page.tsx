"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Mail, Lock, Eye, EyeOff, CheckCircle2 } from "lucide-react"
import { authService } from "@/services/authService"
import { useAuth } from "@/contexts/AuthContext"
import Swal from "sweetalert2"
import { toast } from "sonner"

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [verificationSent, setVerificationSent] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState("")
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (isLogin) {
      try {
        const response = await authService.login({
          correo: formData.email,
          password: formData.password
        })
        
        await login(response.token)
        router.push("/")
        toast.success("¡Bienvenido!")
      } catch (error: any) {
        if (error.response?.status === 401) {
          Swal.fire({
            title: "Error",
            text: "Credenciales inválidas",
            icon: "error",
            confirmButtonText: "Aceptar",
            timer: 2500,
          })
        } else {
          toast.error("Error al iniciar sesión")
        }
      }
    } else {
      if (formData.password !== formData.confirmPassword) {
        Swal.fire({
          title: "Error",
          text: "Las contraseñas no coinciden",
          icon: "error",
          confirmButtonText: "Aceptar",
          timer: 2500,
        })
        return
      }

      if (formData.password.length < 6) {
        Swal.fire({
          title: "Error",
          text: "La contraseña debe tener al menos 6 caracteres",
          icon: "error",
          confirmButtonText: "Aceptar",
          timer: 2500,
        })
        return
      }

      if (formData.password.length > 20) {
        Swal.fire({
          title: "Error",
          text: "La contraseña no puede tener más de 20 caracteres",
          icon: "error",
          confirmButtonText: "Aceptar",
          timer: 2500,
        })
        return
      }

      if (!/^[a-zA-Z\s]+$/.test(formData.name)) {
        Swal.fire({
          title: "Error",
          text: "El nombre solo puede contener letras y espacios",
          icon: "error",
          confirmButtonText: "Aceptar",
          timer: 2500,
        })
        return
      }

      if (!/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).+$/.test(formData.password)) {
        Swal.fire({
          title: "Error",
          text: "La contraseña debe contener al menos una letra, un número y un carácter especial",
          icon: "error",
          confirmButtonText: "Aceptar",
          timer: 2500,
        })
        return
      }

      if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)) {
        Swal.fire({
          title: "Error",
          text: "El correo electrónico no es válido",
          icon: "error",
          confirmButtonText: "Aceptar",
          timer: 2500,
        })
        return
      }

      try {
        const avatar = '/' + (Math.floor(Math.random() * 12) + 1).toString() + '.jpg'
        await authService.register({
          nombre: formData.name,
          correo: formData.email,
          password: formData.password,
          avatar: avatar
        })

        setRegisteredEmail(formData.email)
        setVerificationSent(true)
        
      } catch (error: any) {
        if (error.response?.status === 400) {
          let title = ""
          if (error.response.data.type === "password") {
            title = "Error en la contraseña"
          }
          if (error.response.data.type === "correo") {
            title = "Error en el correo"
          }
          if (error.response.data.type === "nombre") {
            title = "Error en el nombre"
          }

          Swal.fire({
            title: title,
            text: error.response.data.message,
            icon: "error",
            confirmButtonText: "Aceptar",
            timer: 2500,
          })
        } else {
          toast.error("Error al registrarse")
        }
      }
    }
    setLoading(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      {/* Header */}
      <div className="absolute top-4 left-4">
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al inicio
          </Button>
        </Link>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">P</span>
            </div>
            <span className="text-2xl font-bold text-gray-800">Publimpacto</span>
          </div>
          {verificationSent ? (
            <>
              <CardTitle className="text-2xl">¡Registro Exitoso!</CardTitle>
              <p className="text-gray-600">Hemos enviado un correo de verificación a {registeredEmail}</p>
            </>
          ) : (
            <>
              <CardTitle className="text-2xl">{isLogin ? "Iniciar Sesión" : "Crear Cuenta"}</CardTitle>
              <p className="text-gray-600">{isLogin ? "Accede a tu cuenta para continuar" : "Únete a nuestra comunidad"}</p>
            </>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {verificationSent ? (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <CheckCircle2 className="w-16 h-16 text-green-500" />
              </div>
              <p className="text-gray-600">
                Por favor, revisa tu bandeja de entrada y sigue las instrucciones para verificar tu cuenta.
              </p>
              <Button
                onClick={() => {
                  setVerificationSent(false)
                  setIsLogin(true)
                }}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                size="lg"
              >
                Volver al inicio de sesión
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre completo</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Tu nombre completo"
                    value={formData.name}
                    onChange={handleInputChange}
                    required={!isLogin}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="tu@email.com"
                    className="pl-10"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Tu contraseña"
                    className="pl-10 pr-10"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="Confirma tu contraseña"
                      className="pl-10"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              {isLogin && (
                <div className="flex justify-end">
                  <Link href="#" className="text-sm text-blue-600 hover:underline">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                size="lg"
                disabled={loading}
              >
                {loading ? "Cargando..." : isLogin ? "Iniciar Sesión" : "Crear Cuenta"}
              </Button>
            </form>
          )}

          <div className="relative">
            <Separator />
            <span className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-sm text-gray-500">
              o
            </span>
          </div>

          <div className="space-y-3">
            <Button variant="outline" className="w-full" size="lg">
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continuar con Google
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              {isLogin ? "¿No tienes una cuenta?" : "¿Ya tienes una cuenta?"}{" "}
              <button onClick={() => setIsLogin(!isLogin)} className="text-blue-600 hover:underline font-medium">
                {isLogin ? "Regístrate" : "Inicia sesión"}
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
