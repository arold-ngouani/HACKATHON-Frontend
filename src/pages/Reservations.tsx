// src/pages/Reservations.tsx
import React, { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Table } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Calendar, 
  MapPin, 
  Filter, 
  Eye,
  Clock,
  User,
  Building,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Users
} from 'lucide-react';
import type { Reservation, Room, User as UserType } from '../types';
import { apiEndpoints } from '../services/api';

interface ReservationFilters {
  room_id: string;
  searchTerm: string;
}

interface ReservationDetailModalProps {
  reservation: Reservation;
  isOpen: boolean;
  onClose: () => void;
}

const ReservationDetail: React.FC<ReservationDetailModalProps> = ({ 
  reservation, 
  isOpen, 
  onClose 
}) => {
  const [reservationDetails, setReservationDetails] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && reservation) {
      loadReservationDetails();
    }
  }, [isOpen, reservation]);

  const loadReservationDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiEndpoints.reservations.getById(reservation.id);
      setReservationDetails(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des détails:', error);
      setError('Impossible de charger les détails de la réservation');
      setReservationDetails(reservation);
    } finally {
      setLoading(false);
    }
  };

  const calculateDuration = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffInMinutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes`;
    } else {
      const hours = Math.floor(diffInMinutes / 60);
      const minutes = diffInMinutes % 60;
      return minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`;
    }
  };

  return (
    <Modal title="Détails de la réservation" isOpen={isOpen} onClose={onClose}>
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Chargement des détails...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-600">{error}</p>
            <Button variant="secondary" onClick={loadReservationDetails} className="mt-4">
              <RefreshCw className="w-4 h-4 mr-2" />
              Réessayer
            </Button>
          </div>
        ) : reservationDetails ? (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ID Réservation
              </label>
              <p className="text-gray-900 font-mono text-sm">{reservationDetails.id}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Salle
              </label>
              <p className="text-gray-900">{reservationDetails.room_id}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date/Heure début
              </label>
              <p className="text-gray-900">
                {new Date(reservationDetails.start_time).toLocaleString('fr-FR')}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date/Heure fin
              </label>
              <p className="text-gray-900">
                {new Date(reservationDetails.end_time).toLocaleString('fr-FR')}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Durée
              </label>
              <p className="text-gray-900">
                {calculateDuration(reservationDetails.start_time, reservationDetails.end_time)}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Occupants prévus
              </label>
              <p className="text-gray-900">{reservationDetails.expected_occupants} personnes</p>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Réservé par
              </label>
              <p className="text-gray-900">{reservationDetails.reserved_by}</p>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">Aucun détail disponible</p>
        )}
      </div>
    </Modal>
  );
};

const AvailabilityChecker: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ 
  isOpen, 
  onClose 
}) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [availabilityResult, setAvailabilityResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadRooms();
    }
  }, [isOpen]);

  const loadRooms = async () => {
    try {
      const response = await apiEndpoints.rooms.getAll();
      setRooms(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des salles:', error);
      setError('Impossible de charger les salles');
    }
  };

  const checkAvailability = async () => {
    if (!selectedRoom || !startTime || !endTime) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    if (new Date(startTime) >= new Date(endTime)) {
      setError('L\'heure de fin doit être après l\'heure de début');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await apiEndpoints.reservations.checkAvailability(
        selectedRoom, 
        startTime, 
        endTime
      );
      setAvailabilityResult(response.data);
    } catch (error) {
      console.error('Erreur vérification disponibilité:', error);
      setAvailabilityResult({ 
        available: false, 
        message: 'Erreur lors de la vérification de la disponibilité' 
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedRoom('');
    setStartTime('');
    setEndTime('');
    setAvailabilityResult(null);
    setError(null);
  };

  return (
    <Modal 
      title="Vérifier la disponibilité" 
      isOpen={isOpen} 
      onClose={() => {
        onClose();
        resetForm();
      }}
    >
      <div className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Salle
          </label>
          <select
            value={selectedRoom}
            onChange={(e) => setSelectedRoom(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Sélectionner une salle</option>
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.name} - {room.location} (Capacité: {room.capacity})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Date/Heure début"
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            min={new Date().toISOString().slice(0, 16)}
          />
          <Input
            label="Date/Heure fin"
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            min={startTime || new Date().toISOString().slice(0, 16)}
          />
        </div>

        <Button 
          onClick={checkAvailability} 
          disabled={!selectedRoom || !startTime || !endTime || loading}
          className="w-full"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Vérification...
            </>
          ) : (
            'Vérifier la disponibilité'
          )}
        </Button>

        {availabilityResult && (
          <div className={`p-4 rounded-lg ${
            availabilityResult.available 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center">
              {availabilityResult.available ? (
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500 mr-2" />
              )}
              <span className={`font-medium ${
                availabilityResult.available ? 'text-green-800' : 'text-red-800'
              }`}>
                {availabilityResult.available ? 'Salle disponible' : 'Salle occupée'}
              </span>
            </div>
            {availabilityResult.message && (
              <p className="mt-2 text-sm text-gray-600">
                {availabilityResult.message}
              </p>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

const ReservationForm: React.FC<{
  formData: {
    room_id: string;
    start_time: string;
    end_time: string;
    expected_occupants: number;
    reserved_by: string;
  };
  setFormData: (data: any) => void;
  editingReservation: Reservation | null;
}> = ({ formData, setFormData, editingReservation }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const roomsResponse = await apiEndpoints.rooms.getAll();
      setRooms(roomsResponse.data);
      setError(null);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      setError('Impossible de charger les données du formulaire');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-2 text-gray-500">Chargement du formulaire...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <p className="text-red-600">{error}</p>
        <Button variant="secondary" onClick={loadData} className="mt-4">
          <RefreshCw className="w-4 h-4 mr-2" />
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Salle <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.room_id}
          onChange={(e) => setFormData({ ...formData, room_id: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
          required
        >
          <option value="">Sélectionner une salle</option>
          {rooms.map((room) => (
            <option key={room.id} value={room.id}>
              {room.name} - {room.location} (Capacité: {room.capacity})
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Date/Heure début"
          type="datetime-local"
          value={formData.start_time}
          onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
          min={new Date().toISOString().slice(0, 16)}
          required
        />
        <Input
          label="Date/Heure fin"
          type="datetime-local"
          value={formData.end_time}
          onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
          min={formData.start_time || new Date().toISOString().slice(0, 16)}
          required
        />
      </div>

      <Input
        label="Nombre d'occupants prévus"
        type="number"
        min="1"
        value={formData.expected_occupants?.toString() || ''}
        onChange={(e) => setFormData({ ...formData, expected_occupants: parseInt(e.target.value) || 1 })}
        placeholder="Ex: 10"
        required
      />

      <Input
        label="Réservé par"
        value={formData.reserved_by}
        onChange={(e) => setFormData({ ...formData, reserved_by: e.target.value })}
        placeholder="Ex: Jean Dupont, Département IT"
        required
      />
    </>
  );
};

export const Reservations: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ReservationFilters>({
    room_id: '',
    searchTerm: '',
  });
  const [formData, setFormData] = useState({
    room_id: '',
    start_time: '',
    end_time: '',
    expected_occupants: 1,
    reserved_by: '',
  });

  useEffect(() => {
    loadReservations();
    loadRooms();
  }, []);

  const loadReservations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiEndpoints.reservations.getAll();
      setReservations(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des réservations:', error);
      setError('Impossible de charger les réservations');
      // Fallback avec des données mockées pour le développement
      const mockReservations: Reservation[] = [
        {
          id: '1',
          room_id: 'room1',
          start_time: new Date().toISOString(),
          end_time: new Date(Date.now() + 3600000).toISOString(),
          expected_occupants: 10,
          reserved_by: 'Jean Dupont - Équipe IT'
        },
        {
          id: '2',
          room_id: 'room2',
          start_time: new Date(Date.now() + 86400000).toISOString(),
          end_time: new Date(Date.now() + 90000000).toISOString(),
          expected_occupants: 25,
          reserved_by: 'Marie Martin - Département RH'
        },
      ];
      setReservations(mockReservations);
    } finally {
      setLoading(false);
    }
  };

  const loadRooms = async () => {
    try {
      const response = await apiEndpoints.rooms.getAll();
      setAvailableRooms(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des salles:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.room_id || !formData.start_time || !formData.end_time || !formData.reserved_by) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (new Date(formData.start_time) >= new Date(formData.end_time)) {
      alert('L\'heure de fin doit être après l\'heure de début');
      return;
    }

    if (formData.expected_occupants < 1) {
      alert('Le nombre d\'occupants doit être au moins de 1');
      return;
    }

    try {
      console.log('Données à envoyer:', formData);
      
      if (editingReservation) {
        console.log('Modification de la réservation:', editingReservation.id);
        const response = await apiEndpoints.reservations.update(editingReservation.id, formData);
        setReservations(reservations.map(r => r.id === editingReservation.id ? response.data : r));
      } else {
        console.log('Création d\'une nouvelle réservation');
        
        const reservationData = {
          room_id: formData.room_id,
          start_time: formData.start_time,
          end_time: formData.end_time,
          expected_occupants: formData.expected_occupants,
          reserved_by: formData.reserved_by
        };
        
        console.log('Données réservation:', JSON.stringify(reservationData, null, 2));
        
        const response = await apiEndpoints.reservations.create(reservationData);
        console.log('Succès! Réponse:', response.data);
        setReservations([...reservations, response.data]);
      }
      
      setIsModalOpen(false);
      setEditingReservation(null);
      resetForm();
      
      // Recharger les réservations pour avoir les données les plus récentes
      await loadReservations();
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde:', error);
      console.error('Détails:', error.response?.data);
      alert(`Erreur lors de la sauvegarde de la réservation: ${error.response?.data?.message || error.message}`);
    }
  };

  const resetForm = () => {
    setFormData({
      room_id: '',
      start_time: '',
      end_time: '',
      expected_occupants: 1,
      reserved_by: '',
    });
  };

  const handleEdit = (reservation: Reservation) => {
    setEditingReservation(reservation);
    setFormData({
      room_id: reservation.room_id,
      start_time: reservation.start_time.slice(0, 16), // Format pour datetime-local
      end_time: reservation.end_time.slice(0, 16),
      expected_occupants: reservation.expected_occupants,
      reserved_by: reservation.reserved_by,
    });
    setIsModalOpen(true);
  };

  const handleViewDetails = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setIsDetailModalOpen(true);
  };

  const handleDelete = async (reservation: Reservation) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette réservation ?')) {
      try {
        await apiEndpoints.reservations.delete(reservation.id);
        setReservations(reservations.filter(r => r.id !== reservation.id));
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression de la réservation');
      }
    }
  };

  const resetFilters = () => {
    setFilters({ room_id: '', searchTerm: '' });
  };

  const columns = [
    {
      key: 'room_id' as keyof Reservation,
      header: 'Salle',
      render: (value: string) => {
        const room = availableRooms.find(r => r.id === value);
        return (
          <div className="flex items-center">
            <Building className="w-4 h-4 mr-2 text-gray-400" />
            <span className="font-medium text-gray-900">
              {room ? `${room.name} - ${room.location}` : value}
            </span>
          </div>
        );
      },
    },
    {
      key: 'start_time' as keyof Reservation,
      header: 'Début',
      render: (value: string) => (
        <div className="flex items-center">
          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
          <span className="text-gray-900">
            {new Date(value).toLocaleString('fr-FR')}
          </span>
        </div>
      ),
    },
    {
      key: 'end_time' as keyof Reservation,
      header: 'Fin',
      render: (value: string) => (
        <div className="flex items-center">
          <Clock className="w-4 h-4 mr-2 text-gray-400" />
          <span className="text-gray-900">
            {new Date(value).toLocaleString('fr-FR')}
          </span>
        </div>
      ),
    },
    {
      key: 'expected_occupants' as keyof Reservation,
      header: 'Occupants',
      render: (value: number) => (
        <div className="flex items-center">
          <Users className="w-4 h-4 mr-2 text-gray-400" />
          <span className="text-gray-900">{value} pers.</span>
        </div>
      ),
    },
    {
      key: 'reserved_by' as keyof Reservation,
      header: 'Réservé par',
      render: (value: string) => (
        <div className="flex items-center">
          <User className="w-4 h-4 mr-2 text-gray-400" />
          <span className="text-gray-900">{value}</span>
        </div>
      ),
    },
    {
      key: 'id' as keyof Reservation,
      header: 'Actions',
      render: (_: any, reservation: Reservation) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleViewDetails(reservation);
            }}
            title="Voir les détails"
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(reservation);
            }}
            title="Modifier"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(reservation);
            }}
            title="Supprimer"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  const filteredReservations = reservations.filter(reservation => {
    const room = availableRooms.find(r => r.id === reservation.room_id);
    
    const matchesSearch = !filters.searchTerm || 
      (room && room.name.toLowerCase().includes(filters.searchTerm.toLowerCase())) ||
      reservation.reserved_by.toLowerCase().includes(filters.searchTerm.toLowerCase());
    
    const matchesRoom = !filters.room_id || reservation.room_id === filters.room_id;
    
    return matchesSearch && matchesRoom;
  });

  const reservationStats = {
    total: reservations.length,
    today: reservations.filter(r => {
      const today = new Date();
      const reservationDate = new Date(r.start_time);
      return reservationDate.toDateString() === today.toDateString();
    }).length,
    thisWeek: reservations.filter(r => {
      const today = new Date();
      const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
      const reservationDate = new Date(r.start_time);
      return reservationDate >= weekStart;
    }).length,
    upcoming: reservations.filter(r => new Date(r.start_time) > new Date()).length,
  };

  return (
    <Layout title="Gestion des réservations">
      <Card>
        <div className="space-y-4">
          {/* Header avec recherche et boutons */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Rechercher une réservation..."
                  value={filters.searchTerm}
                  onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary-500 focus:border-primary-500 w-64"
                />
              </div>
              
              <Button
                variant="ghost"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtres
                {filters.room_id && (
                  <span className="ml-2 px-2 py-1 bg-primary-100 text-primary-600 text-xs rounded-full">
                    1
                  </span>
                )}
              </Button>
            </div>
            
            <div className="flex space-x-3">
              <Button
                variant="secondary"
                onClick={() => setIsAvailabilityModalOpen(true)}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Vérifier disponibilité
              </Button>
              <Button
                onClick={() => {
                  setEditingReservation(null);
                  resetForm();
                  setIsModalOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle réservation
              </Button>
            </div>
          </div>

          {/* Message d'erreur */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <XCircle className="w-5 h-5 text-red-500 mr-2" />
                <span className="text-red-700">{error}</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={loadReservations}
                  className="ml-auto"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Filtres avancés */}
          {showFilters && (
            <Card className="bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Salle
                  </label>
                  <select
                    value={filters.room_id}
                    onChange={(e) => setFilters({ ...filters, room_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Toutes les salles</option>
                    {availableRooms.map(room => (
                      <option key={room.id} value={room.id}>
                        {room.name} - {room.location}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="md:col-span-2 flex items-end space-x-2">
                  <Button onClick={() => console.log('Filtres appliqués')} className="flex-1">
                    Appliquer
                  </Button>
                  <Button variant="secondary" onClick={resetFilters}>
                    Réinitialiser
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Statistiques rapides */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-900">Total Réservations</p>
                  <p className="text-2xl font-bold text-blue-600">{reservationStats.total}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-900">Aujourd'hui</p>
                  <p className="text-2xl font-bold text-green-600">{reservationStats.today}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-yellow-900">Cette semaine</p>
                  <p className="text-2xl font-bold text-yellow-600">{reservationStats.thisWeek}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-purple-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-purple-900">À venir</p>
                  <p className="text-2xl font-bold text-purple-600">{reservationStats.upcoming}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Résumé des filtres */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              Affichage de {filteredReservations.length} réservation(s) sur {reservations.length} total
              {filters.room_id && ` • Salle filtrée`}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={loadReservations}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Chargement des réservations...</p>
          </div>
        ) : filteredReservations.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {reservations.length === 0 ? 'Aucune réservation' : 'Aucun résultat'}
            </h3>
            <p className="text-gray-500 mb-4">
              {reservations.length === 0 
                ? 'Créez votre première réservation pour commencer'
                : 'Essayez de modifier vos critères de recherche'
              }
            </p>
            {reservations.length === 0 && (
              <Button
                onClick={() => {
                  setEditingReservation(null);
                  resetForm();
                  setIsModalOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Créer une réservation
              </Button>
            )}
          </div>
        ) : (
          <Table data={filteredReservations} columns={columns} />
        )}
      </Card>

      {/* Modal de formulaire de réservation */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingReservation(null);
          resetForm();
        }}
        title={editingReservation ? 'Modifier la réservation' : 'Nouvelle réservation'}
        actions={
          <>
            <Button 
              variant="secondary" 
              onClick={() => {
                setIsModalOpen(false);
                setEditingReservation(null);
                resetForm();
              }}
            >
              Annuler
            </Button>
            <Button type="submit" form="reservation-form">
              {editingReservation ? 'Mettre à jour' : 'Créer'}
            </Button>
          </>
        }
      >
        <form id="reservation-form" onSubmit={handleSubmit} className="space-y-4">
          <ReservationForm 
            formData={formData} 
            setFormData={setFormData} 
            editingReservation={editingReservation}
          />
        </form>
      </Modal>

      {/* Modal de détails de la réservation */}
      {selectedReservation && (
        <ReservationDetail
          reservation={selectedReservation}
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedReservation(null);
          }}
        />
      )}

      {/* Modal de vérification de disponibilité */}
      <AvailabilityChecker
        isOpen={isAvailabilityModalOpen}
        onClose={() => setIsAvailabilityModalOpen(false)}
      />
    </Layout>
  );
};
export default Reservations;