export type Lang = 'th' | 'en' | 'my'

export const langLabels: Record<Lang, string> = {
  th: 'ไทย',
  en: 'EN',
  my: 'မြန်မာ',
}

export function getLang(): Lang {
  if (typeof window === 'undefined') return 'th'
  return (localStorage.getItem('cocktail_app_lang') as Lang) || 'th'
}

export function setLang(lang: Lang) {
  localStorage.setItem('cocktail_app_lang', lang)
}

// Translations
const t = {
  // Login page
  'login.title': { th: 'Cocktail Batch', en: 'Cocktail Batch', my: 'Cocktail Batch' },
  'login.subtitle': { th: 'ระบบจัดการสูตรค็อกเทล', en: 'Cocktail Recipe Management', my: 'ကော့တေးလ် ရက်စီပီ စီမံခန့်ခွဲမှု' },
  'login.placeholder': { th: 'ใส่รหัสผ่าน', en: 'Enter passcode', my: 'လျှို့ဝှက်ကုဒ် ထည့်ပါ' },
  'login.button': { th: 'เข้าสู่ระบบ', en: 'Login', my: 'ဝင်ရောက်ရန်' },
  'login.error': { th: 'รหัสผ่านไม่ถูกต้อง', en: 'Incorrect passcode', my: 'လျှို့ဝှက်ကုဒ် မှားနေပါသည်' },
  'login.checking': { th: 'กำลังตรวจสอบ...', en: 'Checking...', my: 'စစ်ဆေးနေသည်...' },

  // Home page
  'home.greeting': { th: 'สวัสดี', en: 'Hello', my: 'မင်္ဂလာပါ' },
  'home.logout': { th: 'ออกจากระบบ', en: 'Logout', my: 'ထွက်ရန်' },
  'home.menu.batching': { th: 'ดูสูตร Batching Cocktail', en: 'Batching Cocktail Recipes', my: 'Batching ကော့တေးလ် ရက်စီပီများ' },
  'home.menu.batching.desc': { th: 'ส่วนผสมพื้นฐานสำหรับค็อกเทล', en: 'Base ingredients for cocktails', my: 'ကော့တေးလ်အတွက် အခြေခံပါဝင်ပစ္စည်းများ' },
  'home.menu.cocktails': { th: 'สูตร Cocktail', en: 'Cocktail Recipes', my: 'ကော့တေးလ် ရက်စီပီများ' },
  'home.menu.cocktails.desc': { th: 'สูตรค็อกเทลทั้งหมด', en: 'All cocktail recipes', my: 'ကော့တေးလ် ရက်စီပီ အားလုံး' },
  'home.menu.saved': { th: 'Batch Calculator Cocktail', en: 'Batch Calculator Cocktail', my: 'Batch Calculator Cocktail' },
  'home.menu.saved.desc': { th: 'รายการที่คำนวณและบันทึกไว้', en: 'Saved calculations', my: 'သိမ်းဆည်းထားသော တွက်ချက်မှုများ' },
  'home.menu.calculator': { th: 'Calculator', en: 'Calculator', my: 'ဂဏန်းတွက်စက်' },
  'home.menu.calculator.desc': { th: 'คำนวณปริมาณส่วนผสม', en: 'Calculate ingredient amounts', my: 'ပါဝင်ပစ္စည်း ပမာဏ တွက်ချက်ရန်' },
  'home.menu.members': { th: 'สมาชิก', en: 'Members', my: 'အဖွဲ့ဝင်များ' },
  'home.menu.members.desc': { th: 'จัดการสมาชิกในทีม', en: 'Manage team members', my: 'အဖွဲ့ဝင်များ စီမံခန့်ခွဲရန်' },
  'home.menu.management': { th: 'Host Management', en: 'Host Management', my: 'Host စီမံခန့်ခွဲမှု' },
  'home.menu.management.desc': { th: 'เพิ่ม แก้ไข ลบสูตรทั้งหมด', en: 'Add, edit, delete all recipes', my: 'ရက်စီပီ အားလုံး ထည့်ရန်၊ ပြင်ရန်၊ ဖျက်ရန်' },

  // Batching page
  'batching.title': { th: 'สูตร Batching Cocktail', en: 'Batching Cocktail Recipes', my: 'Batching ကော့တေးလ် ရက်စီပီများ' },
  'batching.loading': { th: 'กำลังโหลด...', en: 'Loading...', my: 'ဖွင့်နေသည်...' },
  'batching.empty': { th: 'ยังไม่มีสูตร', en: 'No recipes yet', my: 'ရက်စီပီ မရှိသေးပါ' },
  'batching.ingredients': { th: 'ส่วนผสม', en: 'Ingredients', my: 'ပါဝင်ပစ္စည်းများ' },
  'batching.instructions': { th: 'วิธีทำ', en: 'Instructions', my: 'ညွှန်ကြားချက်များ' },
  'batching.notes': { th: 'หมายเหตุ', en: 'Notes', my: 'မှတ်ချက်များ' },

  // Cocktails page
  'cocktails.title': { th: 'สูตร Cocktail', en: 'Cocktail Recipes', my: 'ကော့တေးလ် ရက်စီပီများ' },

  // Members page
  'members.title': { th: 'สมาชิก', en: 'Members', my: 'အဖွဲ့ဝင်များ' },
  'members.add': { th: 'เพิ่มสมาชิก', en: 'Add Member', my: 'အဖွဲ့ဝင် ထည့်ရန်' },
  'members.name': { th: 'ชื่อ', en: 'Name', my: 'နာမည်' },
  'members.passcode': { th: 'รหัสผ่าน', en: 'Passcode', my: 'လျှို့ဝှက်ကုဒ်' },
  'members.role': { th: 'ตำแหน่ง', en: 'Role', my: 'ရာထူး' },
  'members.save': { th: 'บันทึก', en: 'Save', my: 'သိမ်းရန်' },
  'members.saving': { th: 'กำลังบันทึก...', en: 'Saving...', my: 'သိမ်းနေသည်...' },
  'members.delete.confirm': { th: 'ลบสมาชิกนี้?', en: 'Delete this member?', my: 'ဤအဖွဲ့ဝင်ကို ဖျက်မလား?' },
  'members.empty': { th: 'ยังไม่มีสมาชิก', en: 'No members yet', my: 'အဖွဲ့ဝင် မရှိသေးပါ' },

  // Management page
  'management.title': { th: 'Host Management', en: 'Host Management', my: 'Host စီမံခန့်ခွဲမှု' },
  'management.add': { th: 'เพิ่มสูตร', en: 'Add Recipe', my: 'ရက်စီပီ ထည့်ရန်' },
  'management.edit': { th: 'แก้ไขสูตร', en: 'Edit Recipe', my: 'ရက်စီပီ ပြင်ရန်' },
  'management.recipe.name': { th: 'ชื่อสูตร', en: 'Recipe Name', my: 'ရက်စီပီ အမည်' },
  'management.ingredients': { th: 'ส่วนผสม', en: 'Ingredients', my: 'ပါဝင်ပစ္စည်းများ' },
  'management.ingredient.name': { th: 'ชื่อส่วนผสม', en: 'Ingredient name', my: 'ပါဝင်ပစ္စည်း အမည်' },
  'management.ingredient.add': { th: '+ เพิ่มส่วนผสม', en: '+ Add ingredient', my: '+ ပါဝင်ပစ္စည်း ထည့်ရန်' },
  'management.instructions': { th: 'วิธีทำ', en: 'Instructions', my: 'ညွှန်ကြားချက်များ' },
  'management.notes': { th: 'หมายเหตุ', en: 'Notes', my: 'မှတ်ချက်များ' },
  'management.save': { th: 'บันทึก', en: 'Save', my: 'သိမ်းရန်' },
  'management.save.edit': { th: 'บันทึกการแก้ไข', en: 'Save Changes', my: 'ပြောင်းလဲမှုများ သိမ်းရန်' },
  'management.saving': { th: 'กำลังบันทึก...', en: 'Saving...', my: 'သိမ်းနေသည်...' },
  'management.delete.confirm': { th: 'ลบสูตรนี้?', en: 'Delete this recipe?', my: 'ဤရက်စီပီကို ဖျက်မလား?' },
  'management.empty': { th: 'ยังไม่มีสูตร', en: 'No recipes yet', my: 'ရက်စီပီ မရှိသေးပါ' },
  'management.add.batching': { th: 'เพิ่มสูตร Batching', en: 'Add Batching Recipe', my: 'Batching ရက်စီပီ ထည့်ရန်' },
  'management.add.cocktail': { th: 'เพิ่มสูตร Cocktail', en: 'Add Cocktail Recipe', my: 'ကော့တေးလ် ရက်စီပီ ထည့်ရန်' },

  // Calculator page
  'calc.title': { th: 'Calculator', en: 'Calculator', my: 'ဂဏန်းတွက်စက်' },
  'calc.source': { th: 'เลือกประเภทสูตร', en: 'Select recipe type', my: 'ရက်စီပီ အမျိုးအစား ရွေးရန်' },
  'calc.select': { th: '-- เลือกสูตร --', en: '-- Select recipe --', my: '-- ရက်စီပီ ရွေးရန် --' },
  'calc.recipe': { th: 'เลือกสูตร', en: 'Select recipe', my: 'ရက်စီပီ ရွေးရန်' },
  'calc.mode': { th: 'คำนวณโดย', en: 'Calculate by', my: 'တွက်ချက်ရန်' },
  'calc.glasses': { th: 'จำนวนแก้ว', en: 'Glasses', my: 'ဖန်ခွက်' },
  'calc.ml': { th: 'ปริมาณ (ml)', en: 'Amount (ml)', my: 'ပမာဏ (ml)' },
  'calc.glasses.label': { th: 'จำนวนแก้ว', en: 'Number of glasses', my: 'ဖန်ခွက် အရေအတွက်' },
  'calc.ml.label': { th: 'ปริมาณรวมที่ต้องการ (ml)', en: 'Total amount needed (ml)', my: 'လိုအပ်သော စုစုပေါင်း ပမာဏ (ml)' },
  'calc.glasses.placeholder': { th: 'เช่น 10', en: 'e.g. 10', my: 'ဥပမာ 10' },
  'calc.ml.placeholder': { th: 'เช่น 1000', en: 'e.g. 1000', my: 'ဥပမာ 1000' },
  'calc.calculate': { th: 'คำนวณ', en: 'Calculate', my: 'တွက်ချက်ရန်' },
  'calc.result': { th: 'ผลลัพธ์', en: 'Result', my: 'ရလဒ်' },
  'calc.total': { th: 'รวมทั้งหมด', en: 'Total', my: 'စုစုပေါင်း' },
  'calc.save': { th: 'บันทึกผลลัพธ์', en: 'Save Result', my: 'ရလဒ် သိမ်းရန်' },
  'calc.saved': { th: '✓ บันทึกแล้ว', en: '✓ Saved', my: '✓ သိမ်းပြီး' },
  'calc.save.title': { th: 'บันทึกผลลัพธ์', en: 'Save Result', my: 'ရလဒ် သိမ်းရန်' },
  'calc.save.name': { th: 'ตั้งชื่อ', en: 'Name', my: 'နာမည်' },
  'calc.save.placeholder': { th: 'เช่น Margarita สำหรับงานปาร์ตี้ 50 แก้ว', en: 'e.g. Margarita for party 50 glasses', my: 'ဥပမာ Margarita ပါတီ ဖန်ခွက် 50' },
  'calc.save.button': { th: 'บันทึก', en: 'Save', my: 'သိမ်းရန်' },
  'calc.saving': { th: 'กำลังบันทึก...', en: 'Saving...', my: 'သိမ်းနေသည်...' },
  'calc.glass.unit': { th: 'แก้ว', en: 'glasses', my: 'ဖန်ခွက်' },

  // Saved calculations page
  'saved.title': { th: 'Batch Calculator Cocktail', en: 'Batch Calculator Cocktail', my: 'Batch Calculator Cocktail' },
  'saved.loading': { th: 'กำลังโหลด...', en: 'Loading...', my: 'ဖွင့်နေသည်...' },
  'saved.empty': { th: 'ยังไม่มีรายการที่บันทึก', en: 'No saved calculations', my: 'သိမ်းဆည်းထားသော တွက်ချက်မှု မရှိသေးပါ' },
  'saved.recipe': { th: 'สูตร', en: 'Recipe', my: 'ရက်စီပီ' },
  'saved.calc': { th: 'คำนวณ', en: 'Calculated', my: 'တွက်ချက်ပြီး' },
  'saved.ingredients': { th: 'ปริมาณส่วนผสม', en: 'Ingredient Amounts', my: 'ပါဝင်ပစ္စည်း ပမာဏများ' },
  'saved.total': { th: 'รวม', en: 'Total', my: 'စုစုပေါင်း' },
  'saved.delete': { th: 'ลบรายการนี้', en: 'Delete', my: 'ဖျက်ရန်' },
  'saved.delete.confirm': { th: 'ลบรายการนี้?', en: 'Delete this item?', my: 'ဤအရာကို ဖျက်မလား?' },

  // Image upload
  'image.upload': { th: 'อัปโหลดรูปภาพ', en: 'Upload Image', my: 'ဓာတ်ပုံ တင်ရန်' },
  'image.change': { th: 'เปลี่ยนรูป', en: 'Change Image', my: 'ဓာတ်ပုံ ပြောင်းရန်' },
  'image.remove': { th: 'ลบรูป', en: 'Remove', my: 'ဖျက်ရန်' },
  'image.uploading': { th: 'กำลังอัปโหลด...', en: 'Uploading...', my: 'တင်နေသည်...' },
  'image.error': { th: 'อัปโหลดรูปไม่สำเร็จ', en: 'Upload failed', my: 'တင်၍ မရပါ' },
  'image.max': { th: 'ไฟล์ใหญ่เกิน 5MB', en: 'File too large (max 5MB)', my: 'ဖိုင် ကြီးလွန်းသည် (5MB)' },

  // Categories
  'category.label': { th: 'หมวดหมู่', en: 'Category', my: 'အမျိုးအစား' },
  'category.all': { th: 'ทั้งหมด', en: 'All', my: 'အားလုံး' },
  'category.signature_cocktail': { th: 'Signature Cocktail', en: 'Signature Cocktail', my: 'Signature Cocktail' },
  'category.signature_mocktail': { th: 'Signature Mocktail', en: 'Signature Mocktail', my: 'Signature Mocktail' },
  'category.beach_vibe': { th: 'Beach Vibe', en: 'Beach Vibe', my: 'Beach Vibe' },
  'category.mojito': { th: 'Mojito', en: 'Mojito', my: 'Mojito' },
  'category.classic_cocktail': { th: 'Classic Cocktail', en: 'Classic Cocktail', my: 'Classic Cocktail' },
  'category.other': { th: 'Other', en: 'Other', my: 'အခြား' },
  'category.select': { th: '-- เลือกหมวดหมู่ --', en: '-- Select category --', my: '-- အမျိုးအစား ရွေးရန် --' },

  // Common
  'common.loading': { th: 'กำลังโหลด...', en: 'Loading...', my: 'ဖွင့်နေသည်...' },
  'common.back': { th: 'กลับ', en: 'Back', my: 'နောက်သို့' },
} as const

export type TransKey = keyof typeof t

export function translate(key: TransKey, lang: Lang): string {
  return t[key]?.[lang] || t[key]?.['th'] || key
}
