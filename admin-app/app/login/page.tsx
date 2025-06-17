"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { useAuth } from '@/hooks/useAuth'

export default function LoginPage() {
    const router = useRouter()
    const { login } = useAuth()
    const [loading, setLoading] = useState(false)
    const [credentials, setCredentials] = useState({
        correo: "", 
        password: ""
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            // Usar directamente el método login de useAuth
            const user = await login(credentials)
            // console.log('user', user)
            // //esperar 1 minuto
            // await new Promise(resolve => setTimeout(resolve, 60000));
            
            if (!user) {
                throw new Error('No se pudo iniciar sesión')
            }
            
            toast.success(`Bienvenido, ${user.nombre || 'administrador'}`)
            
            // Redirigir al dashboard
            setTimeout(() => {
                router.push('/dashboard')
            }, 500)
            
        } catch (error: any) {
            console.error('Error de login:', error)
            
            if (error.response) {
                if ([401, 403, 404].includes(error.response.status)) {
                    toast.error(error.response.data.message || 'Credenciales incorrectas')
                } else {
                    toast.error(error.response.data.message || 'Error en el servidor')
                }
            } else {
                toast.error(error.message || 'Error al iniciar sesión')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex h-screen items-center justify-center p-4">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle>Panel de Administración</CardTitle>
                    <CardDescription>
                        Inicia sesión para acceder al panel de administración
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Input
                                type="correo"
                                placeholder="correo@ejemplo.com"
                                value={credentials.correo}
                                onChange={(e) => setCredentials({ ...credentials, correo: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Input
                                type="password"
                                placeholder="Contraseña"
                                value={credentials.password}
                                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                                required
                            />
                        </div>
                        <Button className="w-full" type="submit" disabled={loading}>
                            {loading ? "Cargando..." : "Iniciar Sesión"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}