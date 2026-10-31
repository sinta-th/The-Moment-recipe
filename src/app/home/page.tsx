'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, isHost, logout } from '@/lib/auth'
import { Member } from '@/lib/supabase'
import { Wine, Beaker, Users, Settings, Calculator, BookmarkCheck, LogOut } from 'lucide-react'

export default function HomePage() {
  const [user, setUser] = useState<Member | null>(null)
  const router = useRouter()

  useEffect(() => {
    const u = getCurrentUser()
    if (!u) {
      router.push('/')
      return
    }
    setUser(u)
  }, [router])

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  if (!user) return null

  const hostOnly = isHost(user)

  const menuItems = [
    {
      label: 'ดูสูตร Batching Cocktail',
      desc: 'ส่วนผสมพื้นฐานสำหรับค็อกเทล',
      icon: Beaker,
      href: '/home/batching',
      show: true,
    },
    {
      label: 'สูตร Cocktail',
      desc: 'สูตรค็อกเทลทั้งหมด',
      icon: Wine,
      href: '/home/cocktails',
      show: true,
    },
    {
      label: 'Batch Calculator Cocktail',
      desc: 'รายการที่คำนวณและบันทึกไว้',
      icon: BookmarkCheck,
      href: '/home/saved-calculations',
      show: true,
    },
    {
      label: 'Calculator',
      desc: 'คำนวณปริมาณส่วนผสม',
      icon: Calculator,
      href: '/home/calculator',
      show: true,
    },
    {
      label: 'สมาชิก',
      desc: 'จัดการสมาชิกในทีม',
      icon: Users,
      href: '/home/members',
      show: hostOnly,
    },
    {
      label: 'Host Management',
      desc: 'เพิ่ม แก้ไข ลบสูตรทั้งหมด',
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
                สวัสดี, {user.name} <span className="text-accent">({user.role === 'host' ? 'Host' : 'Team Bar'})</span>
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg hover:bg-bg-secondary transition-colors"
            title="ออกจากระบบ"
          >
            <LogOut size={20} className="text-text-muted" />
          </button>
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
