import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const { data } = await supabase.auth.getUser()
    const pathname = request.nextUrl.pathname

    // Si l'utilisateur est connecté et essaie d'accéder à login/signup, le rediriger vers le dashboard
    if (data.user && (pathname === '/login' || pathname === '/signup')) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    // Si l'utilisateur n'est pas connecté et essaie d'accéder à une route protégée
    if (!data.user && pathname !== '/login' && pathname !== '/signup' && pathname !== '/') {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // Si l'utilisateur n'est pas connecté et essaie d'accéder à la racine, le rediriger vers login
    if (!data.user && pathname === '/') {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    return response
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
}
