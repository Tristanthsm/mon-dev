export interface CoachProfile {
  age?: number;
  height?: number;
  weight?: number;
  targetWeight?: number;
  activityLevel?: 'sédentaire' | 'légère' | 'modérée' | 'élevée';
  mainGoal?: 'manger plus équilibré' | 'prise de muscle' | 'perte de poids' | 'énergie';
}

export interface CoachNutrition {
  calculationMode?: 'auto' | 'manual';
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

export interface CoachPreferences {
  persona?: 'neutre' | 'amical' | 'motivant';
  length?: 'courte' | 'moyenne' | 'détaillée';
  feedbackType?: 'nutrition' | 'astuces' | 'motivation';
}

export interface CoachSettingsPayload {
  profile?: CoachProfile;
  nutrition?: CoachNutrition;
  preferences?: CoachPreferences;
  notifications?: {
    freq?: 'jamais' | 'légère' | 'modérée' | 'élevée';
    types?: Record<string, boolean>;
  };
}
