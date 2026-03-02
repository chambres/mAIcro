export interface Food {
  id: string;
  user_id: string;
  name: string;
  brand: string | null;
  serving_size: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  sugar_g: number;
  saturated_fat_g: number | null;
  trans_fat_g: number | null;
  cholesterol_mg: number | null;
  sodium_mg: number | null;
  potassium_mg: number | null;
  vitamin_a_pct: number | null;
  vitamin_c_pct: number | null;
  vitamin_d_pct: number | null;
  calcium_pct: number | null;
  iron_pct: number | null;
  source: "scan" | "lookup" | "manual";
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface DailyLog {
  id: string;
  user_id: string;
  log_date: string;
  meal_label: "breakfast" | "lunch" | "dinner" | "snack";
  food_id: string | null;
  food_name: string;
  servings: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  sugar_g: number;
  sodium_mg: number;
  created_at: string;
}

export interface Goals {
  id: string;
  user_id: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  sugar_g: number;
  sodium_mg: number;
}

export interface MacroTotals {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  sugar_g: number;
  sodium_mg: number;
}

export interface ParsedFoodItem {
  name: string;
  quantity: number;
  unit: string;
  servings: number;
  matched_food?: Food;
  estimated_nutrition?: {
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    fiber_g: number;
    sugar_g: number;
    sodium_mg: number;
    serving_size: string;
  };
}

export interface MealSuggestion {
  name: string;
  description: string;
  items: {
    food_name: string;
    servings: number;
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
  }[];
  total_calories: number;
  total_protein_g: number;
  total_carbs_g: number;
  total_fat_g: number;
}
