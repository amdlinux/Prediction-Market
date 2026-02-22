// src/app/page.tsx
import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function LandingPage() {
  // If already signed in, skip landing and go straight to markets
  const { userId } = await auth()
  if (userId) redirect('/markets')

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center gap-8">
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-4">Predict the Future</h1>
        <p className="text-gray-400 text-lg max-w-md">
          Trade on real-world events. Buy YES or NO. Win when you're right.
        </p>
      </div>

      <div className="flex gap-4">
        <Link
          href="/sign-up"
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-lg font-medium transition"
        >
          Get Started
        </Link>
        <Link
          href="/sign-in"
          className="border border-gray-700 hover:border-gray-500 text-gray-300 px-6 py-3 rounded-lg font-medium transition"
        >
          Sign In
        </Link>
      </div>
    </div>
  )
}