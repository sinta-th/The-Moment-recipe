'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { setCurrentUser } from '@/lib/auth'
import { Wine } from 'lucide-react'

export default function LoginPage() {
  const [passcode, setPasscode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data, error: dbError } = await supabase
        .from('members')
        .select('*')
        .eq('passcode', passcode)
        .single()

      if (dbError || !data) {
        setError('รหัสไม่ถูกต้อง กรุณาลองใหม่')
        setLoading(false)
        return
      }

      setCurrentUser(data)
      router.push('/home')
    } catch {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-bg-primary">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent-light mb-4">
            <Wine size={32} className="text-accent" />
          </div>
          <h1 className="text-2xl font-semibold text-text-primary">
            Cocktail Batch
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            กรอกรหัสเพื่อเข้าสู่ระบบ
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="password"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            placeholder="รหัสผ่าน"
            className="w-full px-4 py-3 rounded-xl text-center text-lg tracking-widest bg-bg-card border border-border text-text-primary focus:outline-none focus:border-accent"
            autoFocus
          />

          {error && (
            <p className="text-center text-sm text-danger">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !passcode}
            className="w-full py-3 rounded-xl font-medium text-white bg-accent hover:bg-accent-hover transition-colors disabled:opacity-50"
          >
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>
      </div>
    </div>
  )
}
