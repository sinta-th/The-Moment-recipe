'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, isHost } from '@/lib/auth'
import { supabase, Member } from '@/lib/supabase'
import { Lang, getLang, translate } from '@/lib/lang'
import Modal from '@/components/Modal'
import { ArrowLeft, UserPlus, Users, Trash2 } from 'lucide-react'

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newPasscode, setNewPasscode] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [lang, setLang] = useState<Lang>('th')
  const router = useRouter()

  const T = (key: Parameters<typeof translate>[0]) => translate(key, lang)

  useEffect(() => {
    const u = getCurrentUser()
    if (!u || !isHost(u)) { router.push('/'); return }
    setLang(getLang())
    fetchMembers()
  }, [router])

  const fetchMembers = async () => {
    const { data } = await supabase.from('members').select('id, name, role, created_at').order('created_at')
    setMembers((data as Member[]) || [])
    setLoading(false)
  }

  const addMember = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    const { error: dbError } = await supabase.from('members').insert({
      name: newName.trim(),
      passcode: newPasscode.trim(),
      role: 'team_bar',
    })

    if (dbError) {
      setError(dbError.message.includes('unique') ? 'รหัสนี้มีคนใช้แล้ว' : 'เกิดข้อผิดพลาด')
      setSaving(false)
      return
    }

    setNewName('')
    setNewPasscode('')
    setShowAdd(false)
    setSaving(false)
    fetchMembers()
  }

  const deleteMember = async (member: Member) => {
    if (member.role === 'host') return
    if (!confirm(T('members.delete.confirm'))) return
    await supabase.from('members').delete().eq('id', member.id)
    fetchMembers()
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <header className="bg-bg-card border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/home')} className="p-2 -ml-2 rounded-lg hover:bg-bg-secondary">
              <ArrowLeft size={20} className="text-text-secondary" />
            </button>
            <h1 className="text-lg font-semibold text-text-primary">{T('members.title')}</h1>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors"
          >
            <UserPlus size={16} />
            {T('members.add')}
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-3">
        {loading ? (
          <p className="text-center text-text-muted py-8">{T('common.loading')}</p>
        ) : members.length === 0 ? (
          <p className="text-center text-text-muted py-8">{T('members.empty')}</p>
        ) : (
          members.map((m) => (
            <div
              key={m.id}
              className="bg-bg-card border border-border rounded-2xl p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent-light flex items-center justify-center">
                  <Users size={20} className="text-accent" />
                </div>
                <div>
                  <p className="font-medium text-text-primary">{m.name}</p>
                  <p className="text-xs text-text-muted">
                    {m.role === 'host' ? 'Host' : 'Team Bar'}
                  </p>
                </div>
              </div>
              {m.role !== 'host' && (
                <button
                  onClick={() => deleteMember(m)}
                  className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={18} className="text-danger" />
                </button>
              )}
            </div>
          ))
        )}
      </main>

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title={T('members.add')}>
        <form onSubmit={addMember} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">{T('members.name')}</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-bg-primary border border-border text-text-primary focus:outline-none focus:border-accent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">{T('members.passcode')}</label>
            <input
              type="text"
              value={newPasscode}
              onChange={(e) => setNewPasscode(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-bg-primary border border-border text-text-primary focus:outline-none focus:border-accent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">{T('members.role')}</label>
            <div className="px-4 py-3 rounded-xl bg-bg-secondary text-text-muted">Team Bar</div>
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 rounded-xl font-medium text-white bg-accent hover:bg-accent-hover transition-colors disabled:opacity-50"
          >
            {saving ? T('members.saving') : T('members.add')}
          </button>
        </form>
      </Modal>
    </div>
  )
}
