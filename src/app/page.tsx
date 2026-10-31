'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { setCurrentUser } from '@/lib/auth'
import { Lang, getLang, setLang, langLabels, translate } from '@/lib/lang'
import { Wine, Globe } from 'lucide-react'

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
    <div className="min-h-screen flex items-center justify-center p-4 bg-bg-primary relative">
      {/* Language Switcher */}
      <div className="absolute top-4 right-4">
        <div className="relative">
          <button
            onClick={() => setShowLang(!showLang)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-text-muted hover:bg-bg-secondary transition-colors bg-bg-card border border-border"
          >
            <Globe size={16} />
            <span>{langLabels[lang]}</span>
          </button>
          {showLang && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowLang(false)} />
              <div className="absolute right-0 top-full mt-1 bg-bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden min-w-[100px]">
                {(Object.keys(langLabels) as Lang[]).map((l) => (
                  <button
                    key={l}
                    onClick={() => handleLangChange(l)}
                    className={`w-full px-4 py-2.5 text-sm text-left hover:bg-bg-secondary transition-colors ${
                      l === lang ? 'text-accent font-semibold bg-accent-light' : 'text-text-primary'
                    }`}
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
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent-light mb-4">
            <Wine size={32} className="text-accent" />
          </div>
          <h1 className="text-2xl font-semibold text-text-primary">
            {T('login.title')}
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            {T('login.subtitle')}
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="password"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            placeholder={T('login.placeholder')}
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
            {loading ? T('login.checking') : T('login.button')}
          </button>
        </form>
      </div>
    </div>
  )
}
