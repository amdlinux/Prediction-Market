// src/components/PracticeToggle.tsx
'use client'

import { useRouter, useSearchParams } from 'next/navigation'

export default function PracticeToggle() {
  const router      = useRouter()
  const searchParams = useSearchParams()
  const isPractice  = searchParams.get('mode') === 'practice'

  function toggle() {
    const params = new URLSearchParams(searchParams.toString())
    if (isPractice) {
      params.delete('mode')
    } else {
      params.set('mode', 'practice')
    }
    router.push(`/markets?${params.toString()}`)
  }

  return (
    <button
      onClick={toggle}
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