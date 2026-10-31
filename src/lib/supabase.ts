import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder')

// Types
export interface Member {
  id: string
  name: string
  passcode: string
  role: 'host' | 'team_bar'
  created_at: string
}

export type RecipeCategory = 'signature_cocktail' | 'signature_mocktail' | 'beach_vibe' | 'mojito' | 'classic_cocktail' | 'other'

export const CATEGORIES: RecipeCategory[] = [
  'signature_cocktail',
  'signature_mocktail',
  'beach_vibe',
  'mojito',
  'classic_cocktail',
  'other',
]

export interface BatchingRecipe {
  id: string
  name: string
  image_url: string | null
  category: RecipeCategory | null
  method: RecipeMethod | null
  instructions: string | null
  notes: string | null
  created_at: string
  updated_at: string
  ingredients?: BatchingIngredient[]
}

export type IngredientUnit = 'ml' | 'g' | 'pcs' | 'top'

export const UNITS: IngredientUnit[] = ['ml', 'g', 'pcs', 'top']

export type RecipeMethod = 'shake' | 'stir' | 'build' | 'blending'

export const METHODS: RecipeMethod[] = ['shake', 'stir', 'build', 'blending']

export interface BatchingIngredient {
  id: string
  recipe_id: string
  name: string
  amount_ml: number
  unit: IngredientUnit
  sort_order: number
}

export interface CocktailRecipe {
  id: string
  name: string
  image_url: string | null
  category: RecipeCategory | null
  method: RecipeMethod | null
  garnish: string | null
  instructions: string | null
  notes: string | null
  created_at: string
  updated_at: string
  ingredients?: CocktailIngredient[]
}

export interface CocktailIngredient {
  id: string
  recipe_id: string
  name: string
  amount_ml: number
  unit: IngredientUnit
  sort_order: number
}

export interface SavedCalculation {
  id: string
  name: string
  source_type: 'batching' | 'cocktail'
  source_recipe_id: string
  source_recipe_name: string
  calc_mode: 'glasses' | 'ml'
  calc_value: number
  result_data: { name: string; amount_ml: number; total_ml: number; unit?: string }[]
  created_by: string | null
  created_at: string
}
