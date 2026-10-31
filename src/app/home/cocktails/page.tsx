'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { supabase, CocktailRecipe, CocktailIngredient, CATEGORIES, RecipeCategory } from '@/lib/supabase'
import { Lang, getLang, translate } from '@/lib/lang'
import Modal from '@/components/Modal'
import { ArrowLeft, Wine } from 'lucide-react'

export default function CocktailsPage() {
  const [recipes, setRecipes] = useState<CocktailRecipe[]>([])
  const [selected, setSelected] = useState<CocktailRecipe | null>(null)
  const [ingredients, setIngredients] = useState<CocktailIngredient[]>([])
  const [loading, setLoading] = useState(true)
  const [lang, setLang] = useState<Lang>('th')
  const [filterCategory, setFilterCategory] = useState<RecipeCategory | 'all'>('all')
  const router = useRouter()

  const T = (key: Parameters<typeof translate>[0]) => translate(key, lang)

  useEffect(() => {
    if (!getCurrentUser()) { router.push('/'); return }
    setLang(getLang())
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
          <h1 className="text-lg font-semibold text-text-primary">{T('cocktails.title')}</h1>
        </div>
      </header>

      {/* Category Filter */}
      {!loading && recipes.length > 0 && (
        <div className="max-w-lg mx-auto px-4 pt-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setFilterCategory('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                filterCategory === 'all' ? 'bg-accent text-white' : 'bg-bg-card border border-border text-text-muted'
              }`}
            >
              {T('category.all')}
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  filterCategory === cat ? 'bg-accent text-white' : 'bg-bg-card border border-border text-text-muted'
                }`}
              >
                {T(`category.${cat}` as Parameters<typeof translate>[0])}
              </button>
            ))}
          </div>
        </div>
      )}

      <main className="max-w-lg mx-auto px-4 py-6 space-y-3">
        {loading ? (
          <p className="text-center text-text-muted py-8">{T('common.loading')}</p>
        ) : recipes.length === 0 ? (
          <p className="text-center text-text-muted py-8">{T('batching.empty')}</p>
        ) : (
          recipes.filter((r) => filterCategory === 'all' || r.category === filterCategory).map((r) => (
            <button
              key={r.id}
              onClick={() => openRecipe(r)}
              className="w-full bg-bg-card border border-border rounded-2xl p-4 flex items-center gap-4 hover:border-accent hover:shadow-md transition-all text-left"
            >
              {r.image_url ? (
                <img src={r.image_url} alt={r.name} className="w-12 h-12 rounded-xl object-cover shrink-0" />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-accent-light flex items-center justify-center shrink-0">
                  <Wine size={24} className="text-accent" />
                </div>
              )}
              <div>
                <p className="font-medium text-text-primary">{r.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {r.category && (
                    <span className="text-xs text-accent bg-accent-light px-2 py-0.5 rounded-full">{T(`category.${r.category}` as Parameters<typeof translate>[0])}</span>
                  )}
                  {r.notes && <p className="text-sm text-text-muted">{r.notes}</p>}
                </div>
              </div>
            </button>
          ))
        )}
      </main>

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.name}>
        {selected && (
          <div className="p-5 space-y-5">
            {selected.image_url && (
              <img src={selected.image_url} alt={selected.name} className="w-full h-48 object-cover rounded-xl" />
            )}
            <div>
              <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">{T('batching.ingredients')}</h3>
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
                  {T('saved.total')}: {ingredients.reduce((sum, i) => sum + Number(i.amount_ml), 0)} ml
                </span>
              </div>
            </div>

            {selected.instructions && (
              <div>
                <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-2">{T('batching.instructions')}</h3>
                <p className="text-text-primary whitespace-pre-line leading-relaxed">{selected.instructions}</p>
              </div>
            )}

            {selected.notes && (
              <div>
                <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-2">{T('batching.notes')}</h3>
                <p className="text-text-muted text-sm">{selected.notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
