-- ============================================
-- Cocktail Batch Web App - Supabase Schema
-- ============================================

-- 1. Members table (users with code-based auth)
CREATE TABLE members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  passcode TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'team_bar' CHECK (role IN ('host', 'team_bar')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default host
INSERT INTO members (name, passcode, role) VALUES ('Host Master', 'mm001', 'host');

-- 2. Batching Cocktail recipes (pre-mix / base ingredients)
CREATE TABLE batching_recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  image_url TEXT,
  instructions TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Batching recipe ingredients
CREATE TABLE batching_ingredients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID REFERENCES batching_recipes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount_ml DECIMAL NOT NULL,
  sort_order INT DEFAULT 0
);

-- 4. Cocktail recipes
CREATE TABLE cocktail_recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  image_url TEXT,
  instructions TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Cocktail recipe ingredients
CREATE TABLE cocktail_ingredients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID REFERENCES cocktail_recipes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount_ml DECIMAL NOT NULL,
  sort_order INT DEFAULT 0
);

-- 6. Saved calculations (Batch Calculator Cocktail)
CREATE TABLE saved_calculations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('batching', 'cocktail')),
  source_recipe_id UUID NOT NULL,
  source_recipe_name TEXT NOT NULL,
  calc_mode TEXT NOT NULL CHECK (calc_mode IN ('glasses', 'ml')),
  calc_value DECIMAL NOT NULL,
  result_data JSONB NOT NULL, -- [{name, amount_ml, total_ml}]
  created_by UUID REFERENCES members(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE batching_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE batching_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE cocktail_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE cocktail_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_calculations ENABLE ROW LEVEL SECURITY;

-- Policies: allow all operations (auth handled at app level via passcode)
CREATE POLICY "Allow all" ON members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON batching_recipes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON batching_ingredients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON cocktail_recipes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON cocktail_ingredients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON saved_calculations FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- Sample Data
-- ============================================

-- Sample Batching Recipes
INSERT INTO batching_recipes (id, name, instructions, notes) VALUES
  ('a1111111-1111-1111-1111-111111111111', 'Simple Syrup', 'ผสมน้ำตาลกับน้ำร้อนในอัตราส่วน 1:1 คนจนละลาย แล้วปล่อยให้เย็น', 'เก็บในตู้เย็นได้ 2 สัปดาห์'),
  ('a2222222-2222-2222-2222-222222222222', 'Sour Mix', 'ผสมน้ำมะนาวสดกับ Simple Syrup ในอัตราส่วน 1:1', 'ใช้สดทุกวัน ห้ามเก็บข้ามคืน'),
  ('a3333333-3333-3333-3333-333333333333', 'Honey Syrup', 'ผสมน้ำผึ้งกับน้ำร้อนในอัตราส่วน 3:1 คนจนเข้ากัน', 'เก็บในตู้เย็นได้ 1 เดือน');

INSERT INTO batching_ingredients (recipe_id, name, amount_ml, sort_order) VALUES
  ('a1111111-1111-1111-1111-111111111111', 'น้ำตาลทราย', 500, 1),
  ('a1111111-1111-1111-1111-111111111111', 'น้ำร้อน', 500, 2),
  ('a2222222-2222-2222-2222-222222222222', 'น้ำมะนาวสด', 500, 1),
  ('a2222222-2222-2222-2222-222222222222', 'Simple Syrup', 500, 2),
  ('a3333333-3333-3333-3333-333333333333', 'น้ำผึ้ง', 750, 1),
  ('a3333333-3333-3333-3333-333333333333', 'น้ำร้อน', 250, 2);

-- Sample Cocktail Recipes
INSERT INTO cocktail_recipes (id, name, instructions, notes) VALUES
  ('b1111111-1111-1111-1111-111111111111', 'Margarita', '1. เทส่วนผสมทั้งหมดลงในเชคเกอร์พร้อมน้ำแข็ง\n2. เขย่าแรงๆ 10-15 วินาที\n3. กรองใส่แก้วที่มีขอบเกลือ', 'ตกแต่งด้วยมะนาว'),
  ('b2222222-2222-2222-2222-222222222222', 'Mojito', '1. บดมิ้นท์กับน้ำตาลเบาๆ ในแก้ว\n2. เติมน้ำมะนาวสดและรัม\n3. เติมน้ำแข็งและโซดา คนเบาๆ', 'ใช้มิ้นท์สด'),
  ('b3333333-3333-3333-3333-333333333333', 'Whiskey Sour', '1. เทส่วนผสมทั้งหมดลงในเชคเกอร์พร้อมน้ำแข็ง\n2. เขย่าแรงๆ 15 วินาที\n3. กรองใส่แก้ว Old Fashioned พร้อมน้ำแข็ง', 'เพิ่มไข่ขาวเพื่อความนุ่ม');

INSERT INTO cocktail_ingredients (recipe_id, name, amount_ml, sort_order) VALUES
  ('b1111111-1111-1111-1111-111111111111', 'Tequila', 60, 1),
  ('b1111111-1111-1111-1111-111111111111', 'Triple Sec', 30, 2),
  ('b1111111-1111-1111-1111-111111111111', 'น้ำมะนาว', 30, 3),
  ('b2222222-2222-2222-2222-222222222222', 'White Rum', 60, 1),
  ('b2222222-2222-2222-2222-222222222222', 'น้ำมะนาว', 30, 2),
  ('b2222222-2222-2222-2222-222222222222', 'Simple Syrup', 20, 3),
  ('b2222222-2222-2222-2222-222222222222', 'ใบมิ้นท์', 10, 4),
  ('b2222222-2222-2222-2222-222222222222', 'โซดา', 60, 5),
  ('b3333333-3333-3333-3333-333333333333', 'Bourbon Whiskey', 60, 1),
  ('b3333333-3333-3333-3333-333333333333', 'Sour Mix', 30, 2),
  ('b3333333-3333-3333-3333-333333333333', 'Simple Syrup', 15, 3);
