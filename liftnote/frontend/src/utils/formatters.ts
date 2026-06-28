export const muscleGroupTranslations: Record<string, string> = {
  chest: 'Peito',
  back: 'Costas',
  legs: 'Pernas',
  shoulders: 'Ombros',
  arms: 'Braços',
  abs: 'Abdômen',
  cardio: 'Cardio',
  'full body': 'Corpo Inteiro',
  abductors: 'Abdutores',
  adductors: 'Adutores',
  biceps: 'Bíceps',
  calves: 'Panturrilhas',
  forearms: 'Antebraços',
  glutes: 'Glúteos',
  hamstrings: 'Isquiotibiais',
  neck: 'Pescoço',
  traps: 'Trapézio',
  quadriceps: 'Quadríceps',
  triceps: 'Tríceps',
  lats: 'Dorsais',
  'middle back': 'Meio das Costas',
  'lower back': 'Lombar',
  abdominals: 'Abdominais',
  abdominais: 'Abdominais',
  isquiotibiais: 'Isquiotibiais',
  adutores: 'Adutores',
  ombros: 'Ombros',
  peito: 'Peito',
  'meio-das-costas': 'Meio das Costas',
  panturrilhas: 'Panturrilhas',
  gluteos: 'Glúteos',
  'inferior-das-costas': 'Lombar',
  dorsais: 'Dorsais',
  trapezio: 'Trapézio',
  antebracos: 'Antebraços',
  pescoco: 'Pescoço',
  abdutores: 'Abdutores'
};

export function formatMuscleGroup(str: string) {
  if (!str) return '';
  const key = str.toLowerCase();
  if (muscleGroupTranslations[key]) {
    return muscleGroupTranslations[key];
  }
  return str.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}
