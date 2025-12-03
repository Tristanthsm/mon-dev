"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";

/*
  CoachSettings (V1 minimal)

  - Objectif: ne garder que les champs essentiels pour personnaliser le coach.
  - Champs avancés supprimés / cachés: allergies, préférences alimentaires détaillées,
    historique médical, rapports santé, bilans complexes, métriques additionnelles.
    Ces éléments seront déplacés dans un panneau "Options avancées" si nécessaire.

  - Persist: this component is UI-only for V1; persistence must be implemented by caller
    (Supabase save/update). see app/settings/coach/page.tsx for usage.
*/

// Types for this component — kept minimal for V1
export type ActivityLevel = "sédentaire" | "légère" | "modérée" | "élevée";
export type CoachPersona = "neutre" | "amical" | "motivant";

interface CoachSettingsProps {
  // initial values — in real app these come from Supabase/profile API
  initial?: Partial<Record<string, any>>;
  onSave?: (payload: any) => Promise<void> | void;
}

export default function CoachSettings({ initial = {}, onSave }: CoachSettingsProps) {
  // PROFILE
  const [age, setAge] = useState<number | "">(initial.age ?? "");
  const [height, setHeight] = useState<number | "">(initial.height ?? "");
  const [weight, setWeight] = useState<number | "">(initial.weight ?? "");
  const [targetWeight, setTargetWeight] = useState<number | "">(initial.targetWeight ?? "");
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(initial.activityLevel ?? "modérée");
  const [mainGoal, setMainGoal] = useState<string>(initial.mainGoal ?? "manger plus équilibré");

  // NUTRITION
  const [calculationMode, setCalculationMode] = useState<"auto" | "manual">(initial.calculationMode ?? "auto");
  const [calories, setCalories] = useState<number | "">(initial.calories ?? "");
  const [protein, setProtein] = useState<number | "">(initial.protein ?? "");
  const [carbs, setCarbs] = useState<number | "">(initial.carbs ?? "");
  const [fat, setFat] = useState<number | "">(initial.fat ?? "");

  // COACH
  const [persona, setPersona] = useState<CoachPersona>(initial.persona ?? "amical");
  const [length, setLength] = useState<"courte" | "moyenne" | "détaillée">(initial.length ?? "moyenne");
  const [feedbackType, setFeedbackType] = useState<"nutrition" | "astuces" | "motivation">(initial.feedbackType ?? "nutrition");
  const [advancedAIEnabled, setAdvancedAIEnabled] = useState<boolean>(initial.advancedAIEnabled ?? false);

  // NOTIFICATIONS
  const [notifFreq, setNotifFreq] = useState<"jamais" | "légère" | "modérée" | "élevée">(initial.notifFreq ?? "légère");
  const [notifTypes, setNotifTypes] = useState<Record<string, boolean>>({
    repas: initial.notifTypes?.repas ?? true,
    progression: initial.notifTypes?.progression ?? true,
    resume: initial.notifTypes?.resume ?? false,
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeTab, setActiveTab] = useState<"Profil" | "Nutrition" | "Coach" | "Notifications">("Profil");

  const handleSave = async () => {
    const payload = {
      profile: { age, height, weight, targetWeight, activityLevel, mainGoal },
      nutrition: { calculationMode, calories, protein, carbs, fat },
      coach: { persona, length, feedbackType, advancedAIEnabled },
      notifications: { notifFreq, notifTypes },
    };

    // onSave should handle persistence (Supabase) — we keep UI-only logic here
    if (onSave) await onSave(payload);
  };

  return (
    <div className="space-y-6 p-4">
      <h2 className="text-lg font-semibold">Réglages du Coach IA</h2>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {(["Profil", "Nutrition", "Coach", "Notifications"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1 rounded-md text-sm ${activeTab === tab ? 'bg-cyan-600 text-white' : 'bg-white/5'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="bg-white/5 p-4 rounded-md">
        {activeTab === "Profil" && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col text-sm">
                Âge
                <input type="number" value={age as any} onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))} className="mt-1 p-2 rounded bg-white/10" />
              </label>
              <label className="flex flex-col text-sm">
                Taille (cm)
                <input type="number" value={height as any} onChange={(e) => setHeight(e.target.value === '' ? '' : Number(e.target.value))} className="mt-1 p-2 rounded bg-white/10" />
              </label>
              <label className="flex flex-col text-sm">
                Poids actuel (kg)
                <input type="number" value={weight as any} onChange={(e) => setWeight(e.target.value === '' ? '' : Number(e.target.value))} className="mt-1 p-2 rounded bg-white/10" />
              </label>
              <label className="flex flex-col text-sm">
                Poids objectif (kg)
                <input type="number" value={targetWeight as any} onChange={(e) => setTargetWeight(e.target.value === '' ? '' : Number(e.target.value))} className="mt-1 p-2 rounded bg-white/10" />
              </label>
            </div>

            <label className="flex flex-col text-sm">
              Niveau d'activité
              <select value={activityLevel} onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)} className="mt-1 p-2 rounded bg-white/10">
                <option value="sédentaire">Sédentaire</option>
                <option value="légère">Légère</option>
                <option value="modérée">Modérée</option>
                <option value="élevée">Élevée</option>
              </select>
            </label>

            <div className="text-sm">Objectif principal</div>
            <div className="flex gap-2 flex-wrap">
              {['manger plus équilibré', 'prise de muscle', 'perte de poids', 'énergie'].map((g) => (
                <button
                  key={g}
                  onClick={() => setMainGoal(g)}
                  className={`px-3 py-1 rounded ${mainGoal === g ? 'bg-violet-500 text-white' : 'bg-white/5'}`}
                >
                  {g}
                </button>
              ))}
            </div>

            <div className="pt-2">
              <button className="text-sm text-slate-300 underline" onClick={() => setShowAdvanced((s) => !s)}>
                {showAdvanced ? 'Masquer options avancées' : 'Plus de détails'}
              </button>
              {showAdvanced && (
                <div className="mt-3 text-xs text-slate-400">Options avancées (ex: mesures corporelles détaillées, allergies...) — cachées pour V1.</div>
              )}
            </div>
          </div>
        )}

        {activeTab === "Nutrition" && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <label className={`px-3 py-2 rounded ${calculationMode === 'auto' ? 'bg-cyan-600 text-white' : 'bg-white/5'}`}>
                <input type="radio" checked={calculationMode === 'auto'} onChange={() => setCalculationMode('auto')} />{' '}
                Calcul automatique selon mon profil
              </label>
              <label className={`px-3 py-2 rounded ${calculationMode === 'manual' ? 'bg-cyan-600 text-white' : 'bg-white/5'}`}>
                <input type="radio" checked={calculationMode === 'manual'} onChange={() => setCalculationMode('manual')} />{' '}
                Saisie manuelle
              </label>
            </div>

            {calculationMode === 'manual' && (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <label className="flex flex-col text-sm">
                  Calories cibles
                  <input type="number" value={calories as any} onChange={(e) => setCalories(e.target.value === '' ? '' : Number(e.target.value))} className="mt-1 p-2 rounded bg-white/10" />
                </label>
                <label className="flex flex-col text-sm">
                  Protéines (g/j)
                  <input type="number" value={protein as any} onChange={(e) => setProtein(e.target.value === '' ? '' : Number(e.target.value))} className="mt-1 p-2 rounded bg-white/10" />
                </label>
                <label className="flex flex-col text-sm">
                  Glucides (g/j)
                  <input type="number" value={carbs as any} onChange={(e) => setCarbs(e.target.value === '' ? '' : Number(e.target.value))} className="mt-1 p-2 rounded bg-white/10" />
                </label>
                <label className="flex flex-col text-sm">
                  Lipides (g/j)
                  <input type="number" value={fat as any} onChange={(e) => setFat(e.target.value === '' ? '' : Number(e.target.value))} className="mt-1 p-2 rounded bg-white/10" />
                </label>
              </div>
            )}
          </div>
        )}

        {activeTab === "Coach" && (
          <div className="space-y-3">
            <label className="flex flex-col text-sm">
              Personnalité
              <select value={persona} onChange={(e) => setPersona(e.target.value as CoachPersona)} className="mt-1 p-2 rounded bg-white/10">
                <option value="neutre">Neutre</option>
                <option value="amical">Amical</option>
                <option value="motivant">Très motivant</option>
              </select>
            </label>

            <label className="flex flex-col text-sm">
              Longueur des réponses
              <select value={length} onChange={(e) => setLength(e.target.value as any)} className="mt-1 p-2 rounded bg-white/10">
                <option value="courte">Courte</option>
                <option value="moyenne">Moyenne</option>
                <option value="détaillée">Détaillée</option>
              </select>
            </label>

            <label className="flex flex-col text-sm">
              Type principal de feedback
              <select value={feedbackType} onChange={(e) => setFeedbackType(e.target.value as any)} className="mt-1 p-2 rounded bg-white/10">
                <option value="nutrition">Coaching nutritionnel</option>
                <option value="astuces">Astuces pratiques</option>
                <option value="motivation">Motivation</option>
              </select>
            </label>

            {/* NEW: Advanced AI Mode Toggle */}
            <div className="border-t border-white/10 pt-3 mt-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Mode IA Avancé</label>
                <input 
                  type="checkbox" 
                  checked={advancedAIEnabled}
                  onChange={(e) => setAdvancedAIEnabled(e.target.checked)}
                  className="w-5 h-5 cursor-pointer"
                />
              </div>
              {advancedAIEnabled && (
                <p className="text-sm text-amber-400 mt-2 p-2 bg-amber-400/10 rounded">
                  ⚠️ Mode activé : l'IA peut utiliser des modèles sans restrictions si nécessaire pour ta requête.
                </p>
              )}
            </div>

            <div className="text-xs text-slate-400">Autres types de rapports (santé, bilans avancés) sont désactivés pour V1.</div>
          </div>
        )}

        {activeTab === "Notifications" && (
          <div className="space-y-3">
            <label className="flex flex-col text-sm">
              Fréquence globale
              <select value={notifFreq} onChange={(e) => setNotifFreq(e.target.value as any)} className="mt-1 p-2 rounded bg-white/10">
                <option value="jamais">Jamais</option>
                <option value="légère">Légère</option>
                <option value="modérée">Modérée</option>
                <option value="élevée">Élevée</option>
              </select>
            </label>

            <div className="text-sm">Types de notifications (max 3)</div>
            <div className="flex gap-2 flex-wrap">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={!!notifTypes.repas} onChange={(e) => setNotifTypes(s => ({ ...s, repas: e.target.checked }))} />
                Rappel d'analyse de repas
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={!!notifTypes.progression} onChange={(e) => setNotifTypes(s => ({ ...s, progression: e.target.checked }))} />
                Alertes de progression
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={!!notifTypes.resume} onChange={(e) => setNotifTypes(s => ({ ...s, resume: e.target.checked }))} />
                Résumé quotidien
              </label>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 mt-4">
          <Button variant="ghost" onClick={() => { /* reset / cancel handled by parent in real app */ }}>Annuler</Button>
          <Button onClick={handleSave}>Enregistrer les réglages</Button>
        </div>
      </div>
    </div>
  );
}
