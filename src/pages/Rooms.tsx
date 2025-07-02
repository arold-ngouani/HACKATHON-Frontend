// src/pages/Rooms.tsx (version améliorée)
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
  Users, 
  MapPin, 
  Filter, 
  Calendar, 
  Building2, 
  TrendingUp, 
  CheckCircle, 
  XCircle,
  Eye
} from 'lucide-react';
import type { Room, Reservation } from '../types';
import { apiEndpoints } from '../services/api';
import { COMMON_LOCATIONS } from '../utils/constants';

interface RoomFilters {
  location: string;
  minCapacity: number;
  searchTerm: string;
}

interface RoomDetailModalProps {
  room: Room;
  isOpen: boolean;
  onClose: () => void;
}

const RoomDetail: React.FC<RoomDetailModalProps> = ({ room, isOpen, onClose }) => {
  const [roomDetails, setRoomDetails] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && room) {
      loadRoomDetails();
    }
  }, [isOpen, room]);

  const loadRoomDetails = async () => {
    try {
      setLoading(true);
      const response = await apiEndpoints.rooms.getById(room.id);
      setRoomDetails(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des détails:', error);
      setRoomDetails(room); // Fallback sur les données déjà disponibles
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Détails de la salle" isOpen={isOpen} onClose={onClose}>
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Chargement des détails...</p>
          </div>
        ) : roomDetails ? (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom
              </label>
              <p className="text-gray-900">{roomDetails.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Capacité
              </label>
              <p className="text-gray-900">{roomDetails.capacity} personnes</p>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Localisation
              </label>
              <p className="text-gray-900">{roomDetails.location}</p>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">Impossible de charger les détails</p>
        )}
      </div>
    </Modal>
  );
};

export const Rooms: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [availableLocations, setAvailableLocations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<RoomFilters>({
    location: '',
    minCapacity: 0,
    searchTerm: '',
  });
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    capacity: 0,
  });
  const [availabilityCheck, setAvailabilityCheck] = useState({
    startTime: '',
    endTime: '',
    result: null as any,
    loading: false,
  });

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      setLoading(true);
      const response = await apiEndpoints.rooms.getAll();
      setRooms(response.data);
      
      // Extraire les locations uniques de la base de données
      const roomsData: Room[] = response.data;
      const locations: string[] = [];
      roomsData.forEach((room) => {
        if (!locations.includes(room.location)) {
          locations.push(room.location);
        }
      });
      setAvailableLocations(locations.sort());
      
    } catch (error) {
      console.error('Erreur lors du chargement des salles:', error);
      // Fallback sur des données mockées en cas d'erreur
      const mockRooms: Room[] = [
        { id: '1', name: 'Salle A101', location: 'Bâtiment A', capacity: 30 },
        { id: '2', name: 'Salle B204', location: 'Bâtiment B', capacity: 25 },
        { id: '3', name: 'Amphithéâtre', location: 'Bâtiment C', capacity: 200 },
        { id: '4', name: 'Laboratoire Info', location: 'Bâtiment D', capacity: 20 },
      ];
      setRooms(mockRooms);
      const locations: string[] = [];
      mockRooms.forEach((room) => {
        if (!locations.includes(room.location)) {
          locations.push(room.location);
        }
      });
      setAvailableLocations(locations.sort());
    } finally {
      setLoading(false);
    }
  };

  const loadRoomsByLocation = async (location: string) => {
    try {
      setLoading(true);
      const response = await apiEndpoints.rooms.getByLocation(location);
      setRooms(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des salles par localisation:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRoomsByCapacity = async (minCapacity: number) => {
    try {
      setLoading(true);
      const response = await apiEndpoints.rooms.getByCapacity(minCapacity);
      setRooms(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des salles par capacité:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRoom) {
        const response = await apiEndpoints.rooms.update(editingRoom.id, formData);
        setRooms(rooms.map(r => r.id === editingRoom.id ? response.data : r));
      } else {
        const response = await apiEndpoints.rooms.create(formData);
        setRooms([...rooms, response.data]);
      }
      
      setIsModalOpen(false);
      setEditingRoom(null);
      setFormData({ name: '', location: '', capacity: 0 });
      
      // Recharger pour mettre à jour les locations disponibles
      loadRooms();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const handleEdit = (room: Room) => {
    setEditingRoom(room);
    setFormData(room);
    setIsModalOpen(true);
  };

  const handleViewDetails = (room: Room) => {
    setSelectedRoom(room);
    setIsDetailModalOpen(true);
  };

  const handleDelete = async (room: Room) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette salle ?')) {
      try {
        await apiEndpoints.rooms.delete(room.id);
        setRooms(rooms.filter(r => r.id !== room.id));
        
        // Mettre à jour les locations disponibles
        const updatedRooms = rooms.filter(r => r.id !== room.id);
        const locations: string[] = [];
        updatedRooms.forEach((room) => {
          if (!locations.includes(room.location)) {
            locations.push(room.location);
          }
        });
        setAvailableLocations(locations.sort());
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const handleCheckAvailability = async () => {
    if (!selectedRoom || !availabilityCheck.startTime || !availabilityCheck.endTime) return;

    setAvailabilityCheck(prev => ({ ...prev, loading: true, result: null }));

    try {
      const response = await apiEndpoints.reservations.checkAvailability(
        selectedRoom.id,
        availabilityCheck.startTime,
        availabilityCheck.endTime
      );
      setAvailabilityCheck(prev => ({ ...prev, result: response.data, loading: false }));
    } catch (error) {
      console.error('Erreur lors de la vérification de disponibilité:', error);
      setAvailabilityCheck(prev => ({ 
        ...prev, 
        result: { available: false, message: 'Erreur lors de la vérification' }, 
        loading: false 
      }));
    }
  };

  const applyFilters = () => {
    if (filters.location && filters.minCapacity > 0) {
      // Appliquer les deux filtres - nécessite une logique côté client ou une API combinée
      loadRooms();
    } else if (filters.location) {
      loadRoomsByLocation(filters.location);
    } else if (filters.minCapacity > 0) {
      loadRoomsByCapacity(filters.minCapacity);
    } else {
      loadRooms();
    }
  };

  const resetFilters = () => {
    setFilters({ location: '', minCapacity: 0, searchTerm: '' });
    loadRooms();
  };

  const columns = [
    {
      key: 'name' as keyof Room,
      header: 'Nom',
      render: (value: string) => (
        <div className="font-medium text-gray-900">{value}</div>
      ),
    },
    {
      key: 'location' as keyof Room,
      header: 'Localisation',
      render: (value: string) => (
        <div className="flex items-center">
          <MapPin className="w-4 h-4 mr-1 text-gray-400" />
          {value}
        </div>
      ),
    },
    {
      key: 'capacity' as keyof Room,
      header: 'Capacité',
      render: (value: number) => (
        <div className="flex items-center">
          <Users className="w-4 h-4 mr-1 text-gray-400" />
          <span>{value} personnes</span>
          <Badge 
            variant={value > 50 ? 'success' : value > 20 ? 'warning' : 'info'}
            className="ml-2"
          >
            {value > 50 ? 'Grande' : value > 20 ? 'Moyenne' : 'Petite'}
          </Badge>
        </div>
      ),
    },
    {
      key: 'id' as keyof Room,
      header: 'Actions',
      render: (_: any, room: Room) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleViewDetails(room);
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
              setSelectedRoom(room);
              setIsAvailabilityModalOpen(true);
            }}
            title="Vérifier la disponibilité"
          >
            <Calendar className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(room);
            }}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(room);
            }}
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                         room.location.toLowerCase().includes(filters.searchTerm.toLowerCase());
    const matchesLocation = !filters.location || room.location === filters.location;
    const matchesCapacity = !filters.minCapacity || room.capacity >= filters.minCapacity;
    
    return matchesSearch && matchesLocation && matchesCapacity;
  });

  return (
    <Layout title="Gestion des salles">
      <Card>
        <div className="space-y-4">
          {/* Header avec recherche et boutons */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Rechercher une salle..."
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
              </Button>
            </div>
            
            <Button
              onClick={() => {
                setEditingRoom(null);
                setFormData({ name: '', location: '', capacity: 0 });
                setIsModalOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle salle
            </Button>
          </div>

          {/* Filtres avancés */}
          {showFilters && (
            <Card className="bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Localisation
                  </label>
                  <select
                    value={filters.location}
                    onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Toutes les localisations</option>
                    {availableLocations.map(location => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Capacité minimale
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={filters.minCapacity || ''}
                    onChange={(e) => setFilters({ ...filters, minCapacity: parseInt(e.target.value) || 0 })}
                    placeholder="Ex: 20"
                  />
                </div>
                
                <div className="flex items-end space-x-2">
                  <Button onClick={applyFilters} className="flex-1">
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
                  <Building2 className="w-5 h-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-900">Total Salles</p>
                  <p className="text-2xl font-bold text-blue-600">{rooms.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-900">Capacité Totale</p>
                  <p className="text-2xl font-bold text-green-600">
                    {rooms.reduce((sum, room) => sum + room.capacity, 0)}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <MapPin className="w-5 h-5 text-purple-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-purple-900">Localisations</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {availableLocations.length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-orange-900">Capacité Moy.</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {Math.round(rooms.reduce((sum, room) => sum + room.capacity, 0) / rooms.length) || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Résumé des filtres */}
        <div className="mb-4 text-sm text-gray-600">
          Affichage de {filteredRooms.length} salle(s) sur {rooms.length} total
          {filters.location && ` • Localisation: ${filters.location}`}
          {filters.minCapacity > 0 && ` • Capacité min: ${filters.minCapacity}`}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Chargement...</p>
          </div>
        ) : (
          <Table data={filteredRooms} columns={columns} />
        )}
      </Card>

      {/* Modal de formulaire de salle */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRoom ? 'Modifier la salle' : 'Nouvelle salle'}
        actions={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" form="room-form">
              {editingRoom ? 'Mettre à jour' : 'Créer'}
            </Button>
          </>
        }
      >
        <form id="room-form" onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nom de la salle"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Localisation
            </label>
            <select
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              required
            >
              <option value="">Sélectionner une localisation</option>
              {/* Combine les locations de la DB + les constantes pour plus d'options */}
              {[...new Set([...availableLocations, ...COMMON_LOCATIONS])].sort().map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
          </div>
          
          <Input
            label="Capacité"
            type="number"
            min="1"
            value={formData.capacity}
            onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
            required
          />
        </form>
      </Modal>

      {/* Modal de détails de la salle */}
      {selectedRoom && (
        <RoomDetail
          room={selectedRoom}
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedRoom(null);
          }}
        />
      )}

      {/* Modal de vérification de disponibilité */}
      <Modal
        isOpen={isAvailabilityModalOpen}
        onClose={() => {
          setIsAvailabilityModalOpen(false);
          setSelectedRoom(null);
          setAvailabilityCheck({ startTime: '', endTime: '', result: null, loading: false });
        }}
        title={`Disponibilité - ${selectedRoom?.name}`}
        actions={
          <>
            <Button 
              variant="secondary" 
              onClick={() => setIsAvailabilityModalOpen(false)}
            >
              Fermer
            </Button>
            <Button 
              onClick={handleCheckAvailability}
              disabled={!availabilityCheck.startTime || !availabilityCheck.endTime || availabilityCheck.loading}
            >
              {availabilityCheck.loading ? 'Vérification...' : 'Vérifier'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Date et heure de début"
              type="datetime-local"
              value={availabilityCheck.startTime}
              onChange={(e) => setAvailabilityCheck({ ...availabilityCheck, startTime: e.target.value })}
              required
            />
            
            <Input
              label="Date et heure de fin"
              type="datetime-local"
              value={availabilityCheck.endTime}
              onChange={(e) => setAvailabilityCheck({ ...availabilityCheck, endTime: e.target.value })}
              required
            />
          </div>

          {availabilityCheck.result && (
            <div className={`p-4 rounded-lg ${
              availabilityCheck.result.available 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center">
                {availabilityCheck.result.available ? (
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500 mr-2" />
                )}
                <span className={`font-medium ${
                  availabilityCheck.result.available ? 'text-green-800' : 'text-red-800'
                }`}>
                  {availabilityCheck.result.available ? 'Salle disponible' : 'Salle occupée'}
                </span>
              </div>
              {availabilityCheck.result.message && (
                <p className="mt-2 text-sm text-gray-600">
                  {availabilityCheck.result.message}
                </p>
              )}
            </div>
          )}
        </div>
      </Modal>
    </Layout>
  );
};