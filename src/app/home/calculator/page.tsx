'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { supabase, BatchingRecipe, CocktailRecipe, BatchingIngredient, CocktailIngredient, Member } from '@/lib/supabase'
import Modal from '@/components/Modal'
import { ArrowLeft, Calculator as CalcIcon, Save } from 'lucide-react'

type SourceType = 'batching' | 'cocktail'
type CalcMode = 'glasses' | 'ml'

interface ResultItem {
  name: string
  amount_ml: number
  total_ml: number
}

export default function CalculatorPage() {
  const [user, setUser] = useState<Member | null>(null)
  const [sourceType, setSourceType] = useState<SourceType>('cocktail')
  const [batchingRecipes, setBatchingRecipes] = useState<BatchingRecipe[]>([])
  const [cocktailRecipes, setCocktailRecipes] = useState<CocktailRecipe[]>([])
  const [selectedRecipeId, setSelectedRecipeId] = useState('')
  const [calcMode, setCalcMode] = useState<CalcMode>('glasses')
  const [calcValue, setCalcValue] = useState('')
  const [results, setResults] = useState<ResultItem[] | null>(null)
  const [selectedRecipeName, setSelectedRecipeName] = useState('')
  const [ingredients, setIngredients] = useState<(BatchingIngredient | CocktailIngredient)[]>([])

  // Save modal
  const [showSave, setShowSave] = useState(false)
  const [saveName, setSaveName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const router = useRouter()

  useEffect(() => {
    const u = getCurrentUser()
    if (!u) { router.push('/'); return }
    setUser(u)
    fetchRecipes()
  }, [router])

  const fetchRecipes = async () => {
    const [b, c] = await Promise.all([
      supabase.from('batching_recipes').select('*').order('name'),
      supabase.from('cocktail_recipes').select('*').order('name'),
    ])
    setBatchingRecipes(b.data || [])
    setCocktailRecipes(c.data || [])
  }

  const handleRecipeChange = async (recipeId: string) => {
    setSelectedRecipeId(recipeId)
    setResults(null)
    setSaved(false)

    if (!recipeId) return

    const ingTable = sourceType === 'batching' ? 'batching_ingredients' : 'cocktail_ingredients'
    const { data } = await supabase.from(ingTable).select('*').eq('recipe_id', recipeId).order('sort_order')
    setIngredients(data || [])

    const recipes = sourceType === 'batching' ? batchingRecipes : cocktailRecipes
    const recipe = recipes.find((r) => r.id === recipeId)
    setSelectedRecipeName(recipe?.name || '')
  }

  const calculate = () => {
    if (!selectedRecipeId || !calcValue || !ingredients.length) return

    const multiplier = calcMode === 'glasses'
      ? parseFloat(calcValue)
      : (() => {
          const totalPerServing = ingredients.reduce((sum, i) => sum + Number(i.amount_ml), 0)
          return totalPerServing > 0 ? parseFloat(calcValue) / totalPerServing : 0
        })()

    const res: ResultItem[] = ingredients.map((i) => ({
      name: i.name,
      amount_ml: Number(i.amount_ml),
      total_ml: Math.round(Number(i.amount_ml) * multiplier * 100) / 100,
    }))

    setResults(res)
    setSaved(false)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!results || !saveName.trim()) return
    setSaving(true)

    await supabase.from('saved_calculations').insert({
      name: saveName.trim(),
      source_type: sourceType,
      source_recipe_id: selectedRecipeId,
      source_recipe_name: selectedRecipeName,
      calc_mode: calcMode,
      calc_value: parseFloat(calcValue),
      result_data: results,
      created_by: user?.id || null,
    })

    setSaving(false)
    setShowSave(false)
    setSaveName('')
    setSaved(true)
  }

  const currentRecipes = sourceType === 'batching' ? batchingRecipes : cocktailRecipes

  return (
    <div className="min-h-screen bg-bg-primary">
      <header className="bg-bg-card border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => router.push('/home')} className="p-2 -ml-2 rounded-lg hover:bg-bg-secondary">
            <ArrowLeft size={20} className="text-text-secondary" />
          </button>
          <h1 className="text-lg font-semibold text-text-primary">Calculator</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-5">
        {/* Source Type */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">เลือกประเภทสูตร</label>
          <div className="flex bg-bg-secondary rounded-xl p-1">
            <button
              onClick={() => { setSourceType('batching'); setSelectedRecipeId(''); setResults(null); setSaved(false) }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                sourceType === 'batching' ? 'bg-bg-card text-accent shadow-sm' : 'text-text-muted'
              }`}
            >
              Batching
            </button>
            <button
              onClick={() => { setSourceType('cocktail'); setSelectedRecipeId(''); setResults(null); setSaved(false) }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                sourceType === 'cocktail' ? 'bg-bg-card text-accent shadow-sm' : 'text-text-muted'
              }`}
            >
              Cocktail
            </button>
          </div>
        </div>

        {/* Recipe Select */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">เลือกสูตร</label>
          <select
            value={selectedRecipeId}
            onChange={(e) => handleRecipeChange(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-bg-card border border-border text-text-primary focus:outline-none focus:border-accent"
          >
            <option value="">-- เลือกสูตร --</option>
            {currentRecipes.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>

        {/* Calc Mode */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">คำนวณโดย</label>
          <div className="flex bg-bg-secondary rounded-xl p-1">
            <button
              onClick={() => { setCalcMode('glasses'); setResults(null) }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                calcMode === 'glasses' ? 'bg-bg-card text-accent shadow-sm' : 'text-text-muted'
              }`}
            >
              จำนวนแก้ว
            </button>
            <button
              onClick={() => { setCalcMode('ml'); setResults(null) }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                calcMode === 'ml' ? 'bg-bg-card text-accent shadow-sm' : 'text-text-muted'
              }`}
            >
              ปริมาณ (ml)
            </button>
          </div>
        </div>

        {/* Value Input */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            {calcMode === 'glasses' ? 'จำนวนแก้ว' : 'ปริมาณรวมที่ต้องการ (ml)'}
          </label>
          <input
            type="number"
            value={calcValue}
            onChange={(e) => { setCalcValue(e.target.value); setResults(null) }}
            placeholder={calcMode === 'glasses' ? 'เช่น 10' : 'เช่น 1000'}
            className="w-full px-4 py-3 rounded-xl bg-bg-card border border-border text-text-primary focus:outline-none focus:border-accent"
            min="0"
            step="any"
          />
        </div>

        {/* Calculate Button */}
        <button
          onClick={calculate}
          disabled={!selectedRecipeId || !calcValue}
          className="w-full py-3 rounded-xl font-medium text-white bg-accent hover:bg-accent-hover transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <CalcIcon size={18} />
          คำนวณ
        </button>

        {/* Results */}
        {results && (
          <div className="bg-bg-card border border-border rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-text-primary">ผลลัพธ์: {selectedRecipeName}</h3>
              <p className="text-sm text-text-muted">
                {calcMode === 'glasses' ? `${calcValue} แก้ว` : `${calcValue} ml`}
              </p>
            </div>

            <div className="space-y-2">
              {results.map((r, idx) => (
                <div key={idx} className="flex items-center justify-between bg-bg-primary rounded-xl px-4 py-3">
                  <span className="text-text-primary">{r.name}</span>
                  <span className="font-semibold text-accent">{r.total_ml} ml</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-border">
              <span className="font-semibold text-text-secondary">รวมทั้งหมด</span>
              <span className="font-bold text-lg text-accent">
                {results.reduce((sum, r) => sum + r.total_ml, 0).toFixed(1)} ml
              </span>
            </div>

            {/* Save Button */}
            {!saved ? (
              <button
                onClick={() => setShowSave(true)}
                className="w-full py-3 rounded-xl font-medium text-accent border border-accent hover:bg-accent-light transition-colors flex items-center justify-center gap-2"
              >
                <Save size={18} />
                บันทึกผลลัพธ์
              </button>
            ) : (
              <p className="text-center text-success font-medium text-sm">✓ บันทึกแล้ว</p>
            )}
          </div>
        )}
      </main>

      {/* Save Modal */}
      <Modal isOpen={showSave} onClose={() => setShowSave(false)} title="บันทึกผลลัพธ์">
        <form onSubmit={handleSave} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">ตั้งชื่อ</label>
            <input
              type="text"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder="เช่น Margarita สำหรับงานปาร์ตี้ 50 แก้ว"
              className="w-full px-4 py-3 rounded-xl bg-bg-primary border border-border text-text-primary focus:outline-none focus:border-accent"
              required
              autoFocus
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 rounded-xl font-medium text-white bg-accent hover:bg-accent-hover transition-colors disabled:opacity-50"
          >
            {saving ? 'กำลังบันทึก...' : 'บันทึก'}
          </button>
        </form>
      </Modal>
    </div>
  )
}
