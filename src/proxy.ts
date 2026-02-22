// src/middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// These routes require login
const isProtectedRoute = createRouteMatcher([
  '/markets(.*)',
  '/portfolio(.*)',
])

export default clerkMiddleware(async(auth, req) => {
  if (isProtectedRoute(req)) await auth.protect()
})

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}