'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, isHost } from '@/lib/auth'
import { supabase, BatchingRecipe, CocktailRecipe, BatchingIngredient, CocktailIngredient, CATEGORIES, RecipeCategory, UNITS, IngredientUnit, METHODS, RecipeMethod } from '@/lib/supabase'
import { Lang, getLang, translate } from '@/lib/lang'
import Modal from '@/components/Modal'
import ImageCropper from '@/components/ImageCropper'
import { ArrowLeft, Plus, Pencil, Trash2, Beaker, Wine, X, ImagePlus, Loader2 } from 'lucide-react'

type Tab = 'batching' | 'cocktail'

interface IngredientInput {
  name: string
  amount_ml: string
  unit: IngredientUnit
}

export default function ManagementPage() {
  const [tab, setTab] = useState<Tab>('batching')
  const [batchingRecipes, setBatchingRecipes] = useState<BatchingRecipe[]>([])
  const [cocktailRecipes, setCocktailRecipes] = useState<CocktailRecipe[]>([])
  const [loading, setLoading] = useState(true)
  const [lang, setLang] = useState<Lang>('th')

  // Form state
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formName, setFormName] = useState('')
  const [formInstructions, setFormInstructions] = useState('')
  const [formNotes, setFormNotes] = useState('')
  const [formIngredients, setFormIngredients] = useState<IngredientInput[]>([{ name: '', amount_ml: '', unit: 'ml' }])
  const [formCategory, setFormCategory] = useState<RecipeCategory | ''>('')
  const [formMethod, setFormMethod] = useState<RecipeMethod | ''>('')
  const [formGarnish, setFormGarnish] = useState('')
  const [formImageUrl, setFormImageUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [imageError, setImageError] = useState('')
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const router = useRouter()

  const T = (key: Parameters<typeof translate>[0]) => translate(key, lang)

  useEffect(() => {
    const u = getCurrentUser()
    if (!u || !isHost(u)) { router.push('/'); return }
    setLang(getLang())
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
    setFormCategory('')
    setFormMethod('')
    setFormGarnish('')
    setFormInstructions('')
    setFormNotes('')
    setFormIngredients([{ name: '', amount_ml: '', unit: 'ml' }])
    setFormImageUrl(null)
    setImageError('')
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
      setFormCategory(recipe.category || '')
      setFormMethod(recipe.method || '')
      setFormGarnish(recipe.garnish || '')
      setFormInstructions(recipe.instructions || '')
      setFormNotes(recipe.notes || '')
      setFormImageUrl(recipe.image_url || null)
      setFormIngredients(
        (ings || []).map((i: BatchingIngredient | CocktailIngredient) => ({
          name: i.name,
          amount_ml: String(i.amount_ml),
          unit: (i.unit || 'ml') as IngredientUnit,
        }))
      )
      setShowForm(true)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    if (file.size > 5 * 1024 * 1024) {
      setImageError(T('image.max'))
      return
    }

    setImageError('')
    const reader = new FileReader()
    reader.onload = () => {
      setCropImageSrc(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const uploadCroppedImage = async (blob: Blob) => {
    setCropImageSrc(null)
    setUploading(true)
    setImageError('')

    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.jpg`
    const filePath = `recipe-images/${fileName}`

    const { error } = await supabase.storage
      .from('recipe-images')
      .upload(filePath, blob, { contentType: 'image/jpeg', cacheControl: '3600', upsert: false })

    if (error) {
      setImageError(T('image.error'))
      setUploading(false)
      return
    }

    const { data: urlData } = supabase.storage
      .from('recipe-images')
      .getPublicUrl(filePath)

    setFormImageUrl(urlData.publicUrl)
    setUploading(false)
  }

  const removeImage = () => {
    setFormImageUrl(null)
    setImageError('')
  }

  const saveRecipe = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const recipeTable = tab === 'batching' ? 'batching_recipes' : 'cocktail_recipes'
    const ingTable = tab === 'batching' ? 'batching_ingredients' : 'cocktail_ingredients'

    const recipeData: Record<string, unknown> = {
      name: formName.trim(),
      image_url: formImageUrl,
      category: formCategory || null,
      method: formMethod || null,
      instructions: formInstructions.trim() || null,
      notes: formNotes.trim() || null,
      updated_at: new Date().toISOString(),
    }

    // garnish only for cocktail
    if (tab === 'cocktail') {
      recipeData.garnish = formGarnish.trim() || null
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
            unit: i.unit,
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
    if (!confirm(T('management.delete.confirm'))) return
    const recipeTable = tab === 'batching' ? 'batching_recipes' : 'cocktail_recipes'
    await supabase.from(recipeTable).delete().eq('id', id)
    fetchAll()
  }

  const addIngredientRow = () => {
    setFormIngredients([...formIngredients, { name: '', amount_ml: '', unit: 'ml' }])
  }

  const removeIngredientRow = (idx: number) => {
    setFormIngredients(formIngredients.filter((_, i) => i !== idx))
  }

  const updateIngredient = (idx: number, field: keyof IngredientInput, value: string) => {
    const updated = [...formIngredients]
    if (field === 'unit') {
      updated[idx].unit = value as IngredientUnit
    } else {
      updated[idx][field] = value
    }
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
            <h1 className="text-lg font-semibold text-text-primary">{T('management.title')}</h1>
          </div>
          <button
            onClick={() => { resetForm(); setShowForm(true) }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors"
          >
            <Plus size={16} />
            {T('management.add')}
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
          <p className="text-center text-text-muted py-8">{T('common.loading')}</p>
        ) : currentRecipes.length === 0 ? (
          <p className="text-center text-text-muted py-8">{T('management.empty')}</p>
        ) : (
          currentRecipes.map((r) => (
            <div key={r.id} className="bg-bg-card border border-border rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {r.image_url ? (
                  <img src={r.image_url} alt={r.name} className="w-10 h-10 rounded-xl object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-accent-light flex items-center justify-center">
                    {tab === 'batching' ? <Beaker size={20} className="text-accent" /> : <Wine size={20} className="text-accent" />}
                  </div>
                )}
                <p className="font-medium text-text-primary">{r.name}</p>
                {r.category && (
                  <span className="text-xs text-accent bg-accent-light px-2 py-0.5 rounded-full">{T(`category.${r.category}` as Parameters<typeof translate>[0])}</span>
                )}
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
      <Modal isOpen={showForm} onClose={resetForm} title={editingId ? T('management.edit') : (tab === 'batching' ? T('management.add.batching') : T('management.add.cocktail'))}>
        <form onSubmit={saveRecipe} className="p-5 space-y-4">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">{T('image.upload')}</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            {formImageUrl ? (
              <div className="relative">
                <img
                  src={formImageUrl}
                  alt="Preview"
                  className="w-full aspect-square object-cover rounded-xl border border-border"
                />
                <div className="absolute bottom-2 right-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg bg-white/90 backdrop-blur text-xs font-medium text-text-primary hover:bg-white transition-colors shadow-sm"
                  >
                    {T('image.change')}
                  </button>
                  <button
                    type="button"
                    onClick={removeImage}
                    className="px-3 py-1.5 rounded-lg bg-white/90 backdrop-blur text-xs font-medium text-danger hover:bg-white transition-colors shadow-sm"
                  >
                    {T('image.remove')}
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full h-32 rounded-xl border-2 border-dashed border-border hover:border-accent flex flex-col items-center justify-center gap-2 text-text-muted hover:text-accent transition-colors disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <Loader2 size={24} className="animate-spin" />
                    <span className="text-sm">{T('image.uploading')}</span>
                  </>
                ) : (
                  <>
                    <ImagePlus size={24} />
                    <span className="text-sm">{T('image.upload')}</span>
                  </>
                )}
              </button>
            )}
            {imageError && <p className="text-sm text-danger mt-1">{imageError}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">{T('management.recipe.name')}</label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-bg-primary border border-border text-text-primary focus:outline-none focus:border-accent"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">{T('category.label')}</label>
            <select
              value={formCategory}
              onChange={(e) => setFormCategory(e.target.value as RecipeCategory | '')}
              className="w-full px-4 py-3 rounded-xl bg-bg-primary border border-border text-text-primary focus:outline-none focus:border-accent"
            >
              <option value="">{T('category.select')}</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{T(`category.${cat}` as Parameters<typeof translate>[0])}</option>
              ))}
            </select>
          </div>

          {/* Method */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">{T('method.label')}</label>
            <select
              value={formMethod}
              onChange={(e) => setFormMethod(e.target.value as RecipeMethod | '')}
              className="w-full px-4 py-3 rounded-xl bg-bg-primary border border-border text-text-primary focus:outline-none focus:border-accent"
            >
              <option value="">{T('method.select')}</option>
              {METHODS.map((m) => (
                <option key={m} value={m}>{T(`method.${m}` as Parameters<typeof translate>[0])}</option>
              ))}
            </select>
          </div>

          {/* Garnish - only for cocktail */}
          {tab === 'cocktail' && (
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">{T('garnish.label')}</label>
              <input
                type="text"
                value={formGarnish}
                onChange={(e) => setFormGarnish(e.target.value)}
                placeholder={T('garnish.placeholder')}
                className="w-full px-4 py-3 rounded-xl bg-bg-primary border border-border text-text-primary focus:outline-none focus:border-accent"
              />
            </div>
          )}

          {/* Ingredients */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">{T('management.ingredients')}</label>
            <div className="space-y-2">
              {formIngredients.map((ing, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <input
                    type="text"
                    placeholder={T('management.ingredient.name')}
                    value={ing.name}
                    onChange={(e) => updateIngredient(idx, 'name', e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg bg-bg-primary border border-border text-text-primary text-sm focus:outline-none focus:border-accent"
                  />
                  <input
                    type="number"
                    placeholder="0"
                    value={ing.amount_ml}
                    onChange={(e) => updateIngredient(idx, 'amount_ml', e.target.value)}
                    className="w-16 px-2 py-2 rounded-lg bg-bg-primary border border-border text-text-primary text-sm text-right focus:outline-none focus:border-accent"
                  />
                  <select
                    value={ing.unit}
                    onChange={(e) => updateIngredient(idx, 'unit', e.target.value)}
                    className="w-16 px-1 py-2 rounded-lg bg-bg-primary border border-border text-text-primary text-sm focus:outline-none focus:border-accent"
                  >
                    {UNITS.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
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
              {T('management.ingredient.add')}
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">{T('management.instructions')}</label>
            <textarea
              value={formInstructions}
              onChange={(e) => setFormInstructions(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-bg-primary border border-border text-text-primary focus:outline-none focus:border-accent resize-y min-h-20"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">{T('management.notes')}</label>
            <input
              type="text"
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-bg-primary border border-border text-text-primary focus:outline-none focus:border-accent"
            />
          </div>

          <button
            type="submit"
            disabled={saving || uploading}
            className="w-full py-3 rounded-xl font-medium text-white bg-accent hover:bg-accent-hover transition-colors disabled:opacity-50"
          >
            {saving ? T('management.saving') : editingId ? T('management.save.edit') : T('management.add')}
          </button>
        </form>
      </Modal>

      {/* Image Cropper */}
      {cropImageSrc && (
        <ImageCropper
          imageSrc={cropImageSrc}
          onCropDone={uploadCroppedImage}
          onCancel={() => setCropImageSrc(null)}
          confirmLabel={T('image.crop.confirm')}
          cancelLabel={T('image.crop.cancel')}
        />
      )}
    </div>
  )
}
