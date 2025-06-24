import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const protectedRoutes = ['/profile', '/checkout', '/orders', '/personalization/tshirt', '/personalization/cup']
const authRoutes = ['/login']

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const isAuthenticated = !!token
  const { pathname } = request.nextUrl

  // Si intenta acceder a rutas protegidas y NO está autenticado
  if (protectedRoutes.includes(pathname) && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Si intenta acceder a rutas de auth y SÍ está autenticado
  if (authRoutes.includes(pathname) && isAuthenticated) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/profile', '/checkout', '/login', '/personalization/tshirt', '/personalization/cup', '/orders']
}