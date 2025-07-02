// src/utils/formatters.ts
import clsx, { type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export const formatDate = (date: string | Date) => {
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

export const formatTime = (date: string | Date) => {
  return new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

export const formatCardStatus = (status: string) => {
  const statusMap = {
    active: { label: 'Actif', variant: 'success' as const },
    lost: { label: 'Perdu', variant: 'warning' as const },
    disabled: { label: 'Désactivé', variant: 'danger' as const },
  };
  return statusMap[status as keyof typeof statusMap] || { label: status, variant: 'default' as const };
};

export const formatAccessType = (type: string) => {
  const typeMap = {
    entry: { label: 'Entrée', variant: 'success' as const },
    exit: { label: 'Sortie', variant: 'info' as const },
    denied: { label: 'Refusé', variant: 'danger' as const },
  };
  return typeMap[type as keyof typeof typeMap] || { label: type, variant: 'default' as const };
};