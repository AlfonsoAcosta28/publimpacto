import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value
    const isAuthPage = request.nextUrl.pathname === '/login'
    const isProtectedRoute = !request.nextUrl.pathname.startsWith('/login')

    if (!token && isProtectedRoute) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    if (token) {
        try {
            // Decodificar el token
            const payload = JSON.parse(atob(token.split('.')[1]))
            
            // Verificar que sea un token de administrador
            if (payload.type !== 'admin') {
                // Eliminar el token si no es de administrador
                const response = NextResponse.redirect(new URL('/login', request.url))
                response.cookies.delete('token')
                return response
            }

            // Si es página de login y el token es válido, redirigir al dashboard
            if (isAuthPage) {
                return NextResponse.redirect(new URL('/dashboard', request.url))
            }
        } catch (error) {
            // Si hay error al decodificar el token, eliminar la cookie y redirigir a login
            const response = NextResponse.redirect(new URL('/login', request.url))
            response.cookies.delete('token')
            return response
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}