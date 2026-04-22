'use client'

interface ToastProps {
  message: string
  visible: boolean
}

export function Toast({ message, visible }: ToastProps) {
  return (
    <div
      aria-live="polite"
      className="fixed bottom-6 left-1/2 px-4 py-2 rounded-lg text-sm font-medium shadow-xl pointer-events-none z-[200]"
      style={{
        background: 'var(--accent)',
        color: '#fff',
        transform: `translateX(-50%) translateY(${visible ? 0 : 12}px)`,
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.2s ease, transform 0.2s ease',
      }}
    >
      {message}
    </div>
  )
}
