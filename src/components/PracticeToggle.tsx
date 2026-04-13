"use client"
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useTransition } from 'react'

export default function PracticeToggle() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [isPending, startTransition] = useTransition()

  const isPractice = searchParams.get('mode') === 'practice'

  function toggle() {
    startTransition(() => {
      const params = new URLSearchParams(window.location.search)

      if (isPractice) {
        params.delete('mode')
      } else {
        params.set('mode', 'practice')
      }

      router.replace(`${pathname}?${params.toString()}`)
    })
  }

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition hover:cursor-pointer
        ${isPractice
          ? 'bg-purple-700 hover:bg-purple-600 text-white'
          : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
        }
      `}
    >
      <span>{isPractice ? '🎮' : '💰'}</span>
      {isPractice ? 'Practice Mode' : 'Real Money'}
    </button>
  )
}