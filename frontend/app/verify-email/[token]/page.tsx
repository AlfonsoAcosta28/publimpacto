"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { authService } from "@/services/authService"
import { useAuth } from "@/contexts/AuthContext"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, CheckCircle, XCircle } from "lucide-react"

export default function VerifyEmailPage() {
  const router = useRouter()
  const { token } = useParams()
  const { login } = useAuth()
  const [status, setStatus] = useState("loading") // loading, success, error
  const [message, setMessage] = useState("")
  
  // Usar un ref para rastrear si ya se ha realizado la verificación
  const verificationAttempted = useRef(false)

  useEffect(() => {
    // Solo verificar si no se ha intentado antes
    if (verificationAttempted.current) return
    
    const verifyEmail = async () => {
      // Marcar que ya se ha intentado la verificación
      verificationAttempted.current = true
      
      try {
        if (!token) {
          setStatus("error")
          setMessage("Token de verificación no proporcionado")
          return
        }

        const response = await authService.verifyEmail(token.toString())
        console.log("Response from verifyEmail:", response)
        
        if (response.token) {
          login(response.token)
          setStatus("success")
          setMessage(response.message || "Correo verificado exitosamente")
        } else {
          setStatus("error")
          setMessage("Error al verificar correo")
        }
      } catch (error) {
        console.error("Error al verificar correo:", error)
        setStatus("error")
        setMessage(
          error.response?.data?.message || 
          "El enlace de verificación es inválido o ha expirado"
        )
      }
    }

    verifyEmail()
  }, [token, login])

  const handleRedirect = () => {
    router.push(status === "success" ? "/perfil" : "/auth")
  }

  return (
    <div className="flex h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Verificación de Correo Electrónico</CardTitle>
          <CardDescription>
            {status === "loading" ? "Verificando su correo electrónico..." : null}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-6">
          {status === "loading" && (
            <div className="flex flex-col items-center py-8">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-center text-muted-foreground">
                Estamos verificando su dirección de correo electrónico...
              </p>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center py-8">
              <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
              <h3 className="text-xl font-semibold text-center mb-2">¡Verificación exitosa!</h3>
              <p className="text-center text-muted-foreground mb-6">
                {message}
              </p>
              <Button onClick={handleRedirect}>
                Ir a mi perfil
              </Button>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center py-8">
              <XCircle className="h-16 w-16 text-red-500 mb-4" />
              <h3 className="text-xl font-semibold text-center mb-2">Error en la verificación</h3>
              <p className="text-center text-muted-foreground mb-6">
                {message}
              </p>
              <Button variant="secondary" onClick={handleRedirect}>
                Volver al inicio de sesión
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}