'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { setCurrentUser } from '@/lib/auth'
import { Lang, getLang, setLang, langLabels, translate } from '@/lib/lang'
import { Globe } from 'lucide-react'
import logo from '@/assets/logo.jpg'

export default function LoginPage() {
  const [passcode, setPasscode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [lang, setLangState] = useState<Lang>('th')
  const [showLang, setShowLang] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setLangState(getLang())
  }, [])

  const T = (key: Parameters<typeof translate>[0]) => translate(key, lang)

  const handleLangChange = (l: Lang) => {
    setLang(l)
    setLangState(l)
    setShowLang(false)
  }

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
        setError(T('login.error'))
        setLoading(false)
        return
      }

      setCurrentUser(data)
      router.push('/home')
    } catch {
      setError(T('login.error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative" style={{ background: 'linear-gradient(135deg, #fdf2f0 0%, #f9e8e4 50%, #f5ddd7 100%)' }}>
      {/* Language Switcher */}
      <div className="absolute top-4 right-4">
        <div className="relative">
          <button
            onClick={() => setShowLang(!showLang)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors border"
            style={{ color: '#8b4a3a', backgroundColor: 'rgba(255,255,255,0.7)', borderColor: 'rgba(139,74,58,0.2)' }}
          >
            <Globe size={16} />
            <span>{langLabels[lang]}</span>
          </button>
          {showLang && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowLang(false)} />
              <div className="absolute right-0 top-full mt-1 rounded-xl shadow-lg z-50 overflow-hidden min-w-[100px] border" style={{ backgroundColor: '#fff', borderColor: 'rgba(139,74,58,0.15)' }}>
                {(Object.keys(langLabels) as Lang[]).map((l) => (
                  <button
                    key={l}
                    onClick={() => handleLangChange(l)}
                    className="w-full px-4 py-2.5 text-sm text-left transition-colors"
                    style={{
                      color: l === lang ? '#c0392b' : '#5a3a2e',
                      fontWeight: l === lang ? 600 : 400,
                      backgroundColor: l === lang ? 'rgba(192,57,43,0.08)' : 'transparent',
                    }}
                  >
                    {langLabels[l]}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-28 h-28 rounded-full mb-5 overflow-hidden" style={{ boxShadow: '0 8px 32px rgba(192,57,43,0.25)' }}>
            <img src={logo.src} alt="The Moment" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-semibold" style={{ color: '#3d1f17' }}>
            {T('login.title')}
          </h1>
          <p className="mt-1 text-sm" style={{ color: '#8b6b5e' }}>
            {T('login.subtitle')}
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="password"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            placeholder={T('login.placeholder')}
            className="w-full px-4 py-3 rounded-xl text-center text-lg tracking-widest focus:outline-none transition-all"
            style={{
              backgroundColor: 'rgba(255,255,255,0.8)',
              border: '1.5px solid rgba(139,74,58,0.2)',
              color: '#3d1f17',
            }}
            autoFocus
          />

          {error && (
            <p className="text-center text-sm" style={{ color: '#c0392b' }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !passcode}
            className="w-full py-3 rounded-xl font-medium text-white transition-all disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg, #c0392b 0%, #a93226 100%)',
              boxShadow: '0 4px 16px rgba(192,57,43,0.3)',
            }}
          >
            {loading ? T('login.checking') : T('login.button')}
          </button>
        </form>
      </div>
    </div>
  )
}
