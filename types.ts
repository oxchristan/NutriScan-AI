export enum ViewState {
  SPLASH = 'SPLASH',
  ONBOARDING = 'ONBOARDING',
  HOME = 'HOME',
  CAMERA = 'CAMERA',
  QUANTITY_ADJUST = 'QUANTITY_ADJUST',
  ANALYSIS_RESULT = 'ANALYSIS_RESULT',
  LOG_DETAILS = 'LOG_DETAILS',
  DAILY_SUMMARY = 'DAILY_SUMMARY',
  PROFILE = 'PROFILE',
  HISTORY = 'HISTORY',
}

export type LanguageCode = 'en' | 'zh-CN' | 'zh-TW' | 'es' | 'ja' | 'ko';

export interface NutrientData {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber: number;
  sugar: number;
  sodium: number;
}

export interface FoodItem {
  id: string;
  name: string;
  weight_g: number; // estimated weight
  nutrients: NutrientData; // per estimated weight
}

export interface AnalysisResult {
  items: FoodItem[];
  total_nutrients: NutrientData;
  health_score: number; // 0-100
  score_breakdown: {
    calorie_score: number;
    macro_score: number;
    balance_score: number;
    risk_score: number;
  };
  short_feedback: string;
  detailed_advice: string[];
  alternatives: string[];
}

export interface MealRecord {
  id: string;
  timestamp: number;
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  imageUri?: string;
  analysis: AnalysisResult;
}

export interface UserProfile {
  name: string;
  avatarUri?: string;
  age: number;
  gender: 'Male' | 'Female';
  height: number; // cm
  weight: number; // kg
  goal: 'Lose Weight' | 'Muscle Gain' | 'Maintain' | 'Control Sugar';
  activityLevel: 'Sedentary' | 'Light' | 'Moderate' | 'Active';
  targetCalories: number;
  language: LanguageCode;
}