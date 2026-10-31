'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, isHost } from '@/lib/auth'
import { supabase, SavedCalculation, Member } from '@/lib/supabase'
import { Lang, getLang, translate } from '@/lib/lang'
import Modal from '@/components/Modal'
import { ArrowLeft, BookmarkCheck, Trash2 } from 'lucide-react'

export default function SavedCalculationsPage() {
  const [user, setUser] = useState<Member | null>(null)
  const [calculations, setCalculations] = useState<SavedCalculation[]>([])
  const [selected, setSelected] = useState<SavedCalculation | null>(null)
  const [loading, setLoading] = useState(true)
  const [lang, setLang] = useState<Lang>('th')
  const router = useRouter()

  const T = (key: Parameters<typeof translate>[0]) => translate(key, lang)

  useEffect(() => {
    const u = getCurrentUser()
    if (!u) { router.push('/'); return }
    setUser(u)
    setLang(getLang())
    fetchCalculations()
  }, [router])

  const fetchCalculations = async () => {
    const { data } = await supabase
      .from('saved_calculations')
      .select('*')
      .order('created_at', { ascending: false })
    setCalculations(data || [])
    setLoading(false)
  }

  const deleteCalc = async (id: string) => {
    if (!confirm(T('saved.delete.confirm'))) return
    await supabase.from('saved_calculations').delete().eq('id', id)
    setSelected(null)
    fetchCalculations()
  }

  const hostUser = isHost(user)

  return (
    <div className="min-h-screen bg-bg-primary">
      <header className="bg-bg-card border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => router.push('/home')} className="p-2 -ml-2 rounded-lg hover:bg-bg-secondary">
            <ArrowLeft size={20} className="text-text-secondary" />
          </button>
          <h1 className="text-lg font-semibold text-text-primary">{T('saved.title')}</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-3">
        {loading ? (
          <p className="text-center text-text-muted py-8">{T('saved.loading')}</p>
        ) : calculations.length === 0 ? (
          <p className="text-center text-text-muted py-8">{T('saved.empty')}</p>
        ) : (
          calculations.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelected(c)}
              className="w-full bg-bg-card border border-border rounded-2xl p-4 flex items-center gap-4 hover:border-accent hover:shadow-md transition-all text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-accent-light flex items-center justify-center shrink-0">
                <BookmarkCheck size={24} className="text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-text-primary truncate">{c.name}</p>
                <p className="text-sm text-text-muted">
                  {c.source_recipe_name} · {c.calc_mode === 'glasses' ? `${c.calc_value} ${T('calc.glass.unit')}` : `${c.calc_value} ml`}
                </p>
              </div>
            </button>
          ))
        )}
      </main>

      {/* Detail Modal */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.name}>
        {selected && (
          <div className="p-5 space-y-5">
            <div className="bg-bg-primary rounded-xl px-4 py-3">
              <p className="text-sm text-text-muted">{T('saved.recipe')}: <span className="text-text-primary font-medium">{selected.source_recipe_name}</span></p>
              <p className="text-sm text-text-muted">
                {T('saved.calc')}: <span className="text-text-primary font-medium">
                  {selected.calc_mode === 'glasses' ? `${selected.calc_value} ${T('calc.glass.unit')}` : `${selected.calc_value} ml`}
                </span>
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">{T('saved.ingredients')}</h3>
              <div className="space-y-2">
                {selected.result_data.map((r, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-bg-primary rounded-xl px-4 py-3">
                    <span className="text-text-primary">{r.name}</span>
                    <span className="font-semibold text-accent">{r.total_ml} {r.unit || 'ml'}</span>
                  </div>
                ))}
              </div>
            </div>

            {hostUser && (
              <button
                onClick={() => deleteCalc(selected.id)}
                className="w-full py-3 rounded-xl font-medium text-danger border border-danger hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 size={18} />
                {T('saved.delete')}
              </button>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
