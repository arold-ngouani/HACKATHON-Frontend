// src/services/api.ts (version améliorée)
import axios from 'axios';

const API_BASE_URL = 'https://hackathonbackend-production-est.up.railway.app/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const apiEndpoints = {
  // Health
  health: {
    basic: () => api.get('/health'),
    detailed: () => api.get('/health/detailed'),
    database: () => api.get('/health/database'),
    ready: () => api.get('/ready'),
  },
  
  // Users
  users: {
    getAll: () => api.get('/users/'),
    getById: (id: string) => api.get(`/users/${id}`),
    create: (data: any) => api.post('/users/', data),
    update: (id: string, data: any) => api.put(`/users/${id}`, data),
    delete: (id: string) => api.delete(`/users/${id}`),
  },
  
  // Access Cards
  accessCards: {
    getAll: () => api.get('/access-cards/'),
    getById: (id: string) => api.get(`/access-cards/${id}`),
    create: (data: any) => api.post('/access-cards/', data),
    update: (id: string, data: any) => api.put(`/access-cards/${id}`, data),
    delete: (id: string) => api.delete(`/access-cards/${id}`),
    updateStatus: (id: string, status: string) => 
      api.put(`/access-cards/${id}/status?status=${status}`),
    getByUser: (userId: string) => api.get(`/access-cards/user/${userId}`),
  },
  
  // Access Logs
  accessLogs: {
  getAll: () => api.get('/access-logs/'),
  getById: (id: string) => api.get(`/access-logs/${id}`),
  create: (data: any) => api.post('/access-logs/', data),
  getByCard: (cardId: string) => api.get(`/access-logs/card/${cardId}`),
  getByUser: (userId: string) => api.get(`/access-logs/user/${userId}`),
  getByLocation: (location: string) => api.get(`/access-logs/location/${location}`),
  getStats: () => api.get('/access-logs/stats/summary'),
  
  // Solution finale qui fonctionne
  simulateAccess: (cardNumber: string, location: string, accessType: string) => {
    console.log('Simulation - Paramètres:', { cardNumber, location, accessType });
    
    // Validation
    if (!cardNumber?.trim() || !location?.trim() || !accessType?.trim()) {
      throw new Error('Tous les paramètres sont requis');
    }
    
    const params = new URLSearchParams({
      card_number: cardNumber.trim(),
      location: location.trim(),
      access_type: accessType.trim()
    });
    
    const url = `/access-logs/simulate-access?${params.toString()}`;
    console.log('URL:', `${API_BASE_URL}${url}`);
    
    // POST avec body vide pour forcer l'envoi des query params
    return api.post(url, {});
  },
},
  
  // Rooms
  rooms: {
    getAll: () => api.get('/rooms/'),
    getById: (id: string) => api.get(`/rooms/${id}`),
    create: (data: any) => api.post('/rooms/', data),
    update: (id: string, data: any) => api.put(`/rooms/${id}`, data),
    delete: (id: string) => api.delete(`/rooms/${id}`),
    getByLocation: (location: string) => api.get(`/rooms/location/${location}`),
    getByCapacity: (minCapacity: number) => api.get(`/rooms/capacity/${minCapacity}`),
    getStats: () => api.get('/rooms/stats/summary'),
  },
  
  // Students
  students: {
    getAll: () => api.get('/students/'),
    getById: (id: string) => api.get(`/students/${id}`),
    create: (data: any) => api.post('/students/', data),
    update: (id: string, data: any) => api.put(`/students/${id}`, data),
    delete: (id: string) => api.delete(`/students/${id}`),
    getByUser: (userId: string) => api.get(`/students/user/${userId}`),
    getByClass: (className: string) => api.get(`/students/class/${className}`),
    getStats: () => api.get('/students/stats/summary'),
  },
  
  // Professors
  professors: {
    getAll: () => api.get('/professors/'),
    getById: (id: string) => api.get(`/professors/${id}`),
    create: (data: any) => api.post('/professors/', data),
    update: (id: string, data: any) => api.put(`/professors/${id}`, data),
    delete: (id: string) => api.delete(`/professors/${id}`),
    getByUser: (userId: string) => api.get(`/professors/user/${userId}`),
    getByDepartment: (department: string) => api.get(`/professors/department/${department}`),
    getStats: () => api.get('/professors/stats/summary'),
  },
  
  // Reservations
  reservations: {
    getAll: () => api.get('/reservations/'),
    getById: (id: string) => api.get(`/reservations/${id}`),
    create: (data: any) => api.post('/reservations/', data),
    update: (id: string, data: any) => api.put(`/reservations/${id}`, data),
    delete: (id: string) => api.delete(`/reservations/${id}`),
    getByRoom: (roomId: string) => api.get(`/reservations/room/${roomId}`),
    getByUser: (userId: string) => api.get(`/reservations/user/${userId}`),
    checkAvailability: (roomId: string, startTime: string, endTime: string) =>
      api.get(`/reservations/room/${roomId}/availability?start_time=${startTime}&end_time=${endTime}`),
    getStats: () => api.get('/reservations/stats/summary'),
  },

  // Nouvelles routes ajoutées
  dashboard: {
    getAllStats: async () => {
      try {
        const [
          usersResponse,
          accessCardsResponse,
          roomsResponse,
          accessLogsResponse,
          studentsResponse,
          professorsResponse,
          reservationsResponse
        ] = await Promise.all([
          api.get('/users/'),
          api.get('/access-cards/'),
          api.get('/rooms/'),
          apiEndpoints.accessLogs.getStats(),
          apiEndpoints.students.getStats(),
          apiEndpoints.professors.getStats(),
          apiEndpoints.reservations.getStats(),
        ]);

        return {
          users: usersResponse.data,
          accessCards: accessCardsResponse.data,
          rooms: roomsResponse.data,
          accessLogsStats: accessLogsResponse.data,
          studentsStats: studentsResponse.data,
          professorsStats: professorsResponse.data,
          reservationsStats: reservationsResponse.data,
        };
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
        throw error;
      }
    },
  },
};