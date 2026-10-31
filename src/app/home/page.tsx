'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, isHost, logout } from '@/lib/auth'
import { Member } from '@/lib/supabase'
import { Lang, getLang, setLang, langLabels, translate } from '@/lib/lang'
import { Wine, Beaker, Users, Settings, Calculator, BookmarkCheck, LogOut, Globe } from 'lucide-react'

export default function HomePage() {
  const [user, setUser] = useState<Member | null>(null)
  const [lang, setLangState] = useState<Lang>('th')
  const [showLang, setShowLang] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const u = getCurrentUser()
    if (!u) {
      router.push('/')
      return
    }
    setUser(u)
    setLangState(getLang())
  }, [router])

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const handleLangChange = (l: Lang) => {
    setLang(l)
    setLangState(l)
    setShowLang(false)
  }

  const T = (key: Parameters<typeof translate>[0]) => translate(key, lang)

  if (!user) return null

  const hostOnly = isHost(user)

  const menuItems = [
    {
      label: T('home.menu.batching'),
      desc: T('home.menu.batching.desc'),
      icon: Beaker,
      href: '/home/batching',
      show: true,
    },
    {
      label: T('home.menu.cocktails'),
      desc: T('home.menu.cocktails.desc'),
      icon: Wine,
      href: '/home/cocktails',
      show: true,
    },
    {
      label: T('home.menu.saved'),
      desc: T('home.menu.saved.desc'),
      icon: BookmarkCheck,
      href: '/home/saved-calculations',
      show: true,
    },
    {
      label: T('home.menu.calculator'),
      desc: T('home.menu.calculator.desc'),
      icon: Calculator,
      href: '/home/calculator',
      show: true,
    },
    {
      label: T('home.menu.members'),
      desc: T('home.menu.members.desc'),
      icon: Users,
      href: '/home/members',
      show: hostOnly,
    },
    {
      label: T('home.menu.management'),
      desc: T('home.menu.management.desc'),
      icon: Settings,
      href: '/home/management',
      show: hostOnly,
    },
  ]

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <header className="bg-bg-card border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-light flex items-center justify-center">
              <Wine size={22} className="text-accent" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-text-primary">Cocktail Batch</h1>
              <p className="text-xs text-text-muted">
                {T('home.greeting')}, {user.name} <span className="text-accent">({user.role === 'host' ? 'Host' : 'Team Bar'})</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowLang(!showLang)}
                className="flex items-center gap-1 px-2 py-2 rounded-xl text-sm font-medium text-text-muted hover:bg-bg-secondary transition-colors"
              >
                <Globe size={18} />
                <span className="text-xs">{langLabels[lang]}</span>
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
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-danger hover:bg-red-50 transition-colors"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Menu Grid */}
      <main className="max-w-lg mx-auto px-4 py-6 space-y-3">
        {menuItems
          .filter((item) => item.show)
          .map((item) => (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className="w-full bg-bg-card border border-border rounded-2xl p-4 flex items-center gap-4 hover:border-accent hover:shadow-md transition-all text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-accent-light flex items-center justify-center shrink-0">
                <item.icon size={24} className="text-accent" />
              </div>
              <div>
                <p className="font-medium text-text-primary">{item.label}</p>
                <p className="text-sm text-text-muted">{item.desc}</p>
              </div>
            </button>
          ))}
      </main>
    </div>
  )
}
