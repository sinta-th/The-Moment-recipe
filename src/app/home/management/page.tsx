'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, isHost } from '@/lib/auth'
import { supabase, BatchingRecipe, CocktailRecipe, BatchingIngredient, CocktailIngredient } from '@/lib/supabase'
import Modal from '@/components/Modal'
import { ArrowLeft, Plus, Pencil, Trash2, Beaker, Wine, X } from 'lucide-react'

type Tab = 'batching' | 'cocktail'

interface IngredientInput {
  name: string
  amount_ml: string
}

export default function ManagementPage() {
  const [tab, setTab] = useState<Tab>('batching')
  const [batchingRecipes, setBatchingRecipes] = useState<BatchingRecipe[]>([])
  const [cocktailRecipes, setCocktailRecipes] = useState<CocktailRecipe[]>([])
  const [loading, setLoading] = useState(true)

  // Form state
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formName, setFormName] = useState('')
  const [formInstructions, setFormInstructions] = useState('')
  const [formNotes, setFormNotes] = useState('')
  const [formIngredients, setFormIngredients] = useState<IngredientInput[]>([{ name: '', amount_ml: '' }])
  const [saving, setSaving] = useState(false)

  const router = useRouter()

  useEffect(() => {
    const u = getCurrentUser()
    if (!u || !isHost(u)) { router.push('/'); return }
    fetchAll()
  }, [router])

  const fetchAll = async () => {
    const [b, c] = await Promise.all([
      supabase.from('batching_recipes').select('*').order('name'),
      supabase.from('cocktail_recipes').select('*').order('name'),
    ])
    setBatchingRecipes(b.data || [])
    setCocktailRecipes(c.data || [])
    setLoading(false)
  }

  const resetForm = () => {
    setFormName('')
    setFormInstructions('')
    setFormNotes('')
    setFormIngredients([{ name: '', amount_ml: '' }])
    setEditingId(null)
    setShowForm(false)
  }

  const openEdit = async (id: string) => {
    const recipeTable = tab === 'batching' ? 'batching_recipes' : 'cocktail_recipes'
    const ingTable = tab === 'batching' ? 'batching_ingredients' : 'cocktail_ingredients'

    const { data: recipe } = await supabase.from(recipeTable).select('*').eq('id', id).single()
    const { data: ings } = await supabase.from(ingTable).select('*').eq('recipe_id', id).order('sort_order')

    if (recipe) {
      setEditingId(id)
      setFormName(recipe.name)
      setFormInstructions(recipe.instructions || '')
      setFormNotes(recipe.notes || '')
      setFormIngredients(
        (ings || []).map((i: BatchingIngredient | CocktailIngredient) => ({
          name: i.name,
          amount_ml: String(i.amount_ml),
        }))
      )
      setShowForm(true)
    }
  }

  const saveRecipe = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const recipeTable = tab === 'batching' ? 'batching_recipes' : 'cocktail_recipes'
    const ingTable = tab === 'batching' ? 'batching_ingredients' : 'cocktail_ingredients'

    const recipeData = {
      name: formName.trim(),
      instructions: formInstructions.trim() || null,
      notes: formNotes.trim() || null,
      updated_at: new Date().toISOString(),
    }

    let recipeId = editingId

    if (editingId) {
      await supabase.from(recipeTable).update(recipeData).eq('id', editingId)
      await supabase.from(ingTable).delete().eq('recipe_id', editingId)
    } else {
      const { data } = await supabase.from(recipeTable).insert(recipeData).select('id').single()
      recipeId = data?.id
    }

    if (recipeId) {
      const validIngs = formIngredients.filter((i) => i.name.trim() && i.amount_ml)
      if (validIngs.length > 0) {
        await supabase.from(ingTable).insert(
          validIngs.map((i, idx) => ({
            recipe_id: recipeId,
            name: i.name.trim(),
            amount_ml: parseFloat(i.amount_ml),
            sort_order: idx,
          }))
        )
      }
    }

    setSaving(false)
    resetForm()
    fetchAll()
  }

  const deleteRecipe = async (id: string) => {
    if (!confirm('ลบสูตรนี้?')) return
    const recipeTable = tab === 'batching' ? 'batching_recipes' : 'cocktail_recipes'
    await supabase.from(recipeTable).delete().eq('id', id)
    fetchAll()
  }

  const addIngredientRow = () => {
    setFormIngredients([...formIngredients, { name: '', amount_ml: '' }])
  }

  const removeIngredientRow = (idx: number) => {
    setFormIngredients(formIngredients.filter((_, i) => i !== idx))
  }

  const updateIngredient = (idx: number, field: keyof IngredientInput, value: string) => {
    const updated = [...formIngredients]
    updated[idx][field] = value
    setFormIngredients(updated)
  }

  const currentRecipes = tab === 'batching' ? batchingRecipes : cocktailRecipes

  return (
    <div className="min-h-screen bg-bg-primary">
      <header className="bg-bg-card border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/home')} className="p-2 -ml-2 rounded-lg hover:bg-bg-secondary">
              <ArrowLeft size={20} className="text-text-secondary" />
            </button>
            <h1 className="text-lg font-semibold text-text-primary">Host Management</h1>
          </div>
          <button
            onClick={() => { resetForm(); setShowForm(true) }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors"
          >
            <Plus size={16} />
            เพิ่มสูตร
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-lg mx-auto px-4 pt-4">
        <div className="flex bg-bg-secondary rounded-xl p-1">
          <button
            onClick={() => setTab('batching')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === 'batching' ? 'bg-bg-card text-accent shadow-sm' : 'text-text-muted'
            }`}
          >
            Batching
          </button>
          <button
            onClick={() => setTab('cocktail')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === 'cocktail' ? 'bg-bg-card text-accent shadow-sm' : 'text-text-muted'
            }`}
          >
            Cocktail
          </button>
        </div>
      </div>

      <main className="max-w-lg mx-auto px-4 py-4 space-y-3">
        {loading ? (
          <p className="text-center text-text-muted py-8">กำลังโหลด...</p>
        ) : currentRecipes.length === 0 ? (
          <p className="text-center text-text-muted py-8">ยังไม่มีสูตร</p>
        ) : (
          currentRecipes.map((r) => (
            <div key={r.id} className="bg-bg-card border border-border rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent-light flex items-center justify-center">
                  {tab === 'batching' ? <Beaker size={20} className="text-accent" /> : <Wine size={20} className="text-accent" />}
                </div>
                <p className="font-medium text-text-primary">{r.name}</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => openEdit(r.id)} className="p-2 rounded-lg hover:bg-bg-secondary">
                  <Pencil size={16} className="text-text-muted" />
                </button>
                <button onClick={() => deleteRecipe(r.id)} className="p-2 rounded-lg hover:bg-red-50">
                  <Trash2 size={16} className="text-danger" />
                </button>
              </div>
            </div>
          ))
        )}
      </main>

      {/* Add/Edit Form Modal */}
      <Modal isOpen={showForm} onClose={resetForm} title={editingId ? 'แก้ไขสูตร' : `เพิ่มสูตร ${tab === 'batching' ? 'Batching' : 'Cocktail'}`}>
        <form onSubmit={saveRecipe} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">ชื่อสูตร</label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-bg-primary border border-border text-text-primary focus:outline-none focus:border-accent"
              required
            />
          </div>

          {/* Ingredients */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">ส่วนผสม</label>
            <div className="space-y-2">
              {formIngredients.map((ing, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="ชื่อส่วนผสม"
                    value={ing.name}
                    onChange={(e) => updateIngredient(idx, 'name', e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg bg-bg-primary border border-border text-text-primary text-sm focus:outline-none focus:border-accent"
                  />
                  <input
                    type="number"
                    placeholder="ml"
                    value={ing.amount_ml}
                    onChange={(e) => updateIngredient(idx, 'amount_ml', e.target.value)}
                    className="w-20 px-3 py-2 rounded-lg bg-bg-primary border border-border text-text-primary text-sm text-right focus:outline-none focus:border-accent"
                  />
                  {formIngredients.length > 1 && (
                    <button type="button" onClick={() => removeIngredientRow(idx)} className="p-1">
                      <X size={16} className="text-text-muted" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addIngredientRow}
              className="mt-2 text-sm text-accent hover:text-accent-hover font-medium"
            >
              + เพิ่มส่วนผสม
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">วิธีทำ</label>
            <textarea
              value={formInstructions}
              onChange={(e) => setFormInstructions(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-bg-primary border border-border text-text-primary focus:outline-none focus:border-accent resize-y min-h-20"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">หมายเหตุ</label>
            <input
              type="text"
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-bg-primary border border-border text-text-primary focus:outline-none focus:border-accent"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 rounded-xl font-medium text-white bg-accent hover:bg-accent-hover transition-colors disabled:opacity-50"
          >
            {saving ? 'กำลังบันทึก...' : editingId ? 'บันทึกการแก้ไข' : 'เพิ่มสูตร'}
          </button>
        </form>
      </Modal>
    </div>
  )
}
