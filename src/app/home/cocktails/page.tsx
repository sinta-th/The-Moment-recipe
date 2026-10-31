'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { supabase, CocktailRecipe, CocktailIngredient } from '@/lib/supabase'
import Modal from '@/components/Modal'
import { ArrowLeft, Wine } from 'lucide-react'

export default function CocktailsPage() {
  const [recipes, setRecipes] = useState<CocktailRecipe[]>([])
  const [selected, setSelected] = useState<CocktailRecipe | null>(null)
  const [ingredients, setIngredients] = useState<CocktailIngredient[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!getCurrentUser()) { router.push('/'); return }
    fetchRecipes()
  }, [router])

  const fetchRecipes = async () => {
    const { data } = await supabase.from('cocktail_recipes').select('*').order('name')
    setRecipes(data || [])
    setLoading(false)
  }

  const openRecipe = async (recipe: CocktailRecipe) => {
    const { data } = await supabase
      .from('cocktail_ingredients')
      .select('*')
      .eq('recipe_id', recipe.id)
      .order('sort_order')
    setIngredients(data || [])
    setSelected(recipe)
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <header className="bg-bg-card border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => router.push('/home')} className="p-2 -ml-2 rounded-lg hover:bg-bg-secondary">
            <ArrowLeft size={20} className="text-text-secondary" />
          </button>
          <h1 className="text-lg font-semibold text-text-primary">สูตร Cocktail</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-3">
        {loading ? (
          <p className="text-center text-text-muted py-8">กำลังโหลด...</p>
        ) : recipes.length === 0 ? (
          <p className="text-center text-text-muted py-8">ยังไม่มีสูตร</p>
        ) : (
          recipes.map((r) => (
            <button
              key={r.id}
              onClick={() => openRecipe(r)}
              className="w-full bg-bg-card border border-border rounded-2xl p-4 flex items-center gap-4 hover:border-accent hover:shadow-md transition-all text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-accent-light flex items-center justify-center shrink-0">
                <Wine size={24} className="text-accent" />
              </div>
              <div>
                <p className="font-medium text-text-primary">{r.name}</p>
                {r.notes && <p className="text-sm text-text-muted mt-0.5">{r.notes}</p>}
              </div>
            </button>
          ))
        )}
      </main>

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.name}>
        {selected && (
          <div className="p-5 space-y-5">
            <div>
              <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">ส่วนผสม</h3>
              <div className="space-y-2">
                {ingredients.map((ing) => (
                  <div key={ing.id} className="flex items-center justify-between bg-bg-primary rounded-xl px-4 py-3">
                    <span className="text-text-primary">{ing.name}</span>
                    <span className="font-medium text-accent">{ing.amount_ml} ml</span>
                  </div>
                ))}
              </div>
              <div className="mt-2 flex justify-end">
                <span className="text-sm font-semibold text-text-secondary">
                  รวม: {ingredients.reduce((sum, i) => sum + Number(i.amount_ml), 0)} ml
                </span>
              </div>
            </div>

            {selected.instructions && (
              <div>
                <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-2">วิธีทำ</h3>
                <p className="text-text-primary whitespace-pre-line leading-relaxed">{selected.instructions}</p>
              </div>
            )}

            {selected.notes && (
              <div>
                <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-2">หมายเหตุ</h3>
                <p className="text-text-muted text-sm">{selected.notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
