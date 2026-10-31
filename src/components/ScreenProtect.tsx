'use client'

import { useEffect, useState } from 'react'

export default function ScreenProtect() {
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    // Disable right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
    }

    // Block screenshot keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // PrintScreen
      if (e.key === 'PrintScreen') {
        e.preventDefault()
      }
      // Ctrl+Shift+S (Windows screenshot)
      if (e.ctrlKey && e.shiftKey && e.key === 'S') {
        e.preventDefault()
      }
      // Ctrl+Shift+I (DevTools)
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault()
      }
      // Ctrl+U (View source)
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault()
      }
      // F12 (DevTools)
      if (e.key === 'F12') {
        e.preventDefault()
      }
      // Cmd+Shift+3/4/5 (Mac screenshot) - can't fully block but try
      if (e.metaKey && e.shiftKey && ['3', '4', '5'].includes(e.key)) {
        e.preventDefault()
      }
    }

    // Hide content when window loses focus (switching to screenshot tool)
    const handleVisibilityChange = () => {
      setHidden(document.hidden)
    }

    const handleBlur = () => {
      setHidden(true)
    }

    const handleFocus = () => {
      setHidden(false)
    }

    document.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('blur', handleBlur)
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('blur', handleBlur)
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  if (!hidden) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        backgroundColor: '#3d1f17',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      <span style={{ fontSize: '48px' }}>🔒</span>
      <p style={{ color: '#f5ddd7', fontSize: '16px', fontWeight: 600 }}>
        Screen Protected
      </p>
    </div>
  )
}
