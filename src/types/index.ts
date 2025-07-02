// src/types/index.ts
export interface User {
  id: string;
  email: string;
  role: 'admin' | 'student' | 'professor';
}

export interface AccessCard {
  id: string;
  card_number: string;
  status: 'active' | 'lost' | 'disabled';
  user_id: string;
  issued_at: string;
}

// Mise à jour du type AccessLog pour supporter card_id nullable
export interface AccessLog {
  id: string;
  location: string;
  access_type: 'entry' | 'exit' | 'denied';
  card_id: string | null; // Peut être null selon l'API
  accessed_at: string;
}

export interface AccessLogCreate {
  location: string;
  access_type: 'entry' | 'exit' | 'denied';
  card_id: string;
}

// Types pour les statistiques d'accès
export interface AccessStats {
  total_logs: number;
  entries: number;
  exits: number;
  denied: number;
  today_logs: number;
  recent_logs: AccessLog[];
  locations?: Array<{
    location: string;
    count: number;
  }>;
  access_types?: Array<{
    type: string;
    count: number;
  }>;
}

// Types pour la simulation d'accès
export interface AccessLogSimulate {
  card_number: string;
  location: string;
  access_type: 'entry' | 'exit' | 'denied';
}

// Types pour les filtres
export interface AccessLogFilters {
  location?: string;
  access_type?: 'entry' | 'exit' | 'denied';
  card_id?: string;
  user_id?: string;
  start_date?: string;
  end_date?: string;
}

export interface Room {
  id: string;
  name: string;
  location: string;
  capacity: number;
}

export interface Student {
  id: string;
  full_name: string;
  student_card_id: string;
  email: string;
  class_name: string;
  phone_number?: string;
  user_id: string;
  registered_at: string;
}

export interface Professor {
  id: string;
  full_name: string;
  email: string;
  department?: string;
  phone_number?: string;
  office?: string;
  user_id: string;
}

export interface Reservation {
  id: string;
  room_id: string;
  start_time: string;
  end_time: string;
  expected_occupants: number;
  reserved_by: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}