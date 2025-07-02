// src/utils/constants.ts

export const ACCESS_TYPES = {
  ENTRY: 'entry',
  EXIT: 'exit',
  DENIED: 'denied',
} as const;

export const CARD_STATUS = {
  ACTIVE: 'active',
  LOST: 'lost',
  DISABLED: 'disabled',
} as const;

export const USER_ROLES = {
  ADMIN: 'admin',
  STUDENT: 'student',
  PROFESSOR: 'professor',
} as const;

export const ACCESS_TYPE_LABELS = {
  [ACCESS_TYPES.ENTRY]: 'Entrée',
  [ACCESS_TYPES.EXIT]: 'Sortie',
  [ACCESS_TYPES.DENIED]: 'Refusé',
};

export const CARD_STATUS_LABELS = {
  [CARD_STATUS.ACTIVE]: 'Active',
  [CARD_STATUS.LOST]: 'Perdue',
  [CARD_STATUS.DISABLED]: 'Désactivée',
};

export const USER_ROLE_LABELS = {
  [USER_ROLES.ADMIN]: 'Administrateur',
  [USER_ROLES.STUDENT]: 'Étudiant',
  [USER_ROLES.PROFESSOR]: 'Professeur',
};

export const COMMON_LOCATIONS = [
  'Bâtiment A',
  'Bâtiment B',
  'Bâtiment C',
  'Bâtiment D',
  'Laboratoire',
  'Bibliothèque',
  'Cafétéria',
  'Gymnase',
  'Administration',
];

export const DEPARTMENTS = [
  'Informatique',
  'Mathématiques',
  'Physique',
  'Chimie',
  'Biologie',
  'Histoire',
  'Langues',
  'Économie',
  'Droit',
  'Médecine',
];

export const CLASSES = [
  'L1 Info',
  'L2 Info',
  'L3 Info',
  'M1 Info',
  'M2 Info',
  'L1 Math',
  'L2 Math',
  'L3 Math',
  'M1 Math',
  'M2 Math',
];

export const CHART_COLORS = {
  primary: '#3B82F6',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#06B6D4',
  purple: '#8B5CF6',
};

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
};