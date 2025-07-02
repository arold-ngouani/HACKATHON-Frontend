import React, { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Table } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { 
  Search, 
  Filter, 
  Download, 
  Plus, 
  Eye, 
  Activity, 
  MapPin, 
  CreditCard, 
  User,
  Calendar,
  BarChart3
} from 'lucide-react';
import { apiEndpoints } from '../services/api';
import type { AccessLog, AccessCard, User as UserType } from '../types';
import { formatDate, formatAccessType } from '../utils/formatters';

// Fonctions utilitaires globales
const getBadgeVariant = (accessType: string): 'success' | 'info' | 'danger' | 'warning' | 'default' => {
  switch (accessType) {
    case 'entry':
      return 'success';
    case 'exit':
      return 'info';
    case 'denied':
      return 'danger';
    default:
      return 'default';
  }
};

const getAccessTypeLabel = (accessType: string): string => {
  switch (accessType) {
    case 'entry':
      return 'Entrée';
    case 'exit':
      return 'Sortie';
    case 'denied':
      return 'Refusé';
    default:
      return accessType;
  }
};

interface AccessStats {
  total_logs: number;
  entries: number;
  exits: number;
  denied: number;
  today_logs: number;
  recent_logs: AccessLog[];
}

interface AccessLogDetailModalProps {
  log: AccessLog;
  isOpen: boolean;
  onClose: () => void;
}

const AccessLogDetail: React.FC<AccessLogDetailModalProps> = ({ log, isOpen, onClose }) => {
  const [cardDetails, setCardDetails] = useState<AccessCard | null>(null);
  const [userDetails, setUserDetails] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && log) {
      loadLogDetails();
    }
  }, [isOpen, log]);

  const loadLogDetails = async () => {
    try {
      setLoading(true);
      if (log.card_id) {
        const cardResponse = await apiEndpoints.accessCards.getById(log.card_id);
        setCardDetails(cardResponse.data);
        
        if (cardResponse.data.user_id) {
          const userResponse = await apiEndpoints.users.getById(cardResponse.data.user_id);
          setUserDetails(userResponse.data);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des détails:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Détails du journal d'accès" isOpen={isOpen} onClose={onClose}>
      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Chargement des détails...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date/Heure
                </label>
                <p className="text-gray-900">{formatDate(log.accessed_at)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type d'accès
                </label>
                <Badge variant={getBadgeVariant(log.access_type)}>
                  {getAccessTypeLabel(log.access_type)}
                </Badge>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Localisation
                </label>
                <p className="text-gray-900">{log.location}</p>
              </div>
            </div>

            {cardDetails && (
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Informations de la carte</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Numéro de carte
                    </label>
                    <p className="text-gray-900 font-mono">{cardDetails.card_number}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Statut
                    </label>
                    <Badge variant={cardDetails.status === 'active' ? 'success' : 'danger'}>
                      {cardDetails.status}
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            {userDetails && (
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Informations utilisateur</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <p className="text-gray-900">{userDetails.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rôle
                    </label>
                    <Badge variant="info">{userDetails.role}</Badge>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
};

interface SimulateAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const SimulateAccess: React.FC<SimulateAccessModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    card_number: '',
    location: '',
    access_type: 'entry' as 'entry' | 'exit' | 'denied'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      setLoading(true);
      
      // Validation côté client
      if (!formData.card_number.trim()) {
        throw new Error('Le numéro de carte est requis');
      }
      if (!formData.location.trim()) {
        throw new Error('La localisation est requise');
      }
      
      // Debug : afficher les données envoyées
      console.log('Données de simulation à envoyer:', {
        card_number: formData.card_number.trim(),
        location: formData.location.trim(),
        access_type: formData.access_type
      });
      
      await apiEndpoints.accessLogs.simulateAccess(
        formData.card_number.trim(),
        formData.location.trim(),
        formData.access_type
      );
      
      alert('Simulation d\'accès réussie !');
      onSuccess();
      onClose();
      
      // Reset du formulaire
      setFormData({
        card_number: '',
        location: '',
        access_type: 'entry'
      });
      
    } catch (error: any) {
      console.error('Erreur lors de la simulation:', error);
      console.error('Détails de l\'erreur:', error.response?.data);
      
      // Affichage d'un message d'erreur plus détaillé
      let errorMessage = 'Erreur lors de la simulation d\'accès';
      
      if (error.response?.data?.detail) {
        errorMessage = `Erreur: ${error.response.data.detail}`;
      } else if (error.response?.data?.message) {
        errorMessage = `Erreur: ${error.response.data.message}`;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError('');
    setFormData({
      card_number: '',
      location: '',
      access_type: 'entry'
    });
    onClose();
  };

  return (
    <Modal title="Simuler un accès" isOpen={isOpen} onClose={handleClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Numéro de carte *
          </label>
          <Input
            type="text"
            value={formData.card_number}
            onChange={(e) => setFormData(prev => ({ ...prev, card_number: e.target.value }))}
            placeholder="Ex: CARD001 ou 12345"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Entrez un numéro de carte existant
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Localisation *
          </label>
          <Input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            placeholder="Ex: Main Building, Salle A101"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Nom de la localisation où l'accès est tenté
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type d'accès *
          </label>
          <select
            value={formData.access_type}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              access_type: e.target.value as 'entry' | 'exit' | 'denied' 
            }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            required
          >
            <option value="entry">Entrée</option>
            <option value="exit">Sortie</option>
            <option value="denied">Refusé</option>
          </select>
        </div>
        
        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Annuler
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Simulation...' : 'Simuler'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export const AccessLogs: React.FC = () => {
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [stats, setStats] = useState<AccessStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterLocation, setFilterLocation] = useState('');
  const [selectedLog, setSelectedLog] = useState<AccessLog | null>(null);
  const [showLogDetail, setShowLogDetail] = useState(false);
  const [showSimulateModal, setShowSimulateModal] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [logsResponse, statsResponse] = await Promise.all([
        apiEndpoints.accessLogs.getAll(),
        apiEndpoints.accessLogs.getStats()
      ]);
      
      setLogs(logsResponse.data);
      setStats(statsResponse.data);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      // Fallback avec des données mockées
      const mockLogs: AccessLog[] = [
        {
          id: '1',
          location: 'Salle A101',
          access_type: 'entry',
          card_id: '1',
          accessed_at: new Date().toISOString(),
        },
        {
          id: '2',
          location: 'Laboratoire B',
          access_type: 'denied',
          card_id: '2',
          accessed_at: new Date(Date.now() - 3600000).toISOString(),
        },
      ];
      setLogs(mockLogs);
      setStats({
        total_logs: mockLogs.length,
        entries: 1,
        exits: 0,
        denied: 1,
        today_logs: 2,
        recent_logs: mockLogs
      });
    } finally {
      setLoading(false);
    }
  };

  const exportLogs = () => {
    const csvContent = [
      ['Date/Heure', 'Localisation', 'Type d\'accès', 'Carte'],
      ...filteredLogs.map(log => [
        formatDate(log.accessed_at),
        log.location,
        formatAccessType(log.access_type).label,
        log.card_id || 'N/A'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `access-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filterByLocation = async (location: string) => {
    try {
      setLoading(true);
      const response = await apiEndpoints.accessLogs.getByLocation(location);
      setLogs(response.data);
      setFilterLocation(location);
    } catch (error) {
      console.error('Erreur lors du filtrage par localisation:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setFilterLocation('');
    setFilterType('all');
    setSearchTerm('');
    setDateRange({ start: '', end: '' });
    loadData();
  };

  const handleViewLog = (log: AccessLog) => {
    setSelectedLog(log);
    setShowLogDetail(true);
  };

  const columns = [
    {
      key: 'accessed_at' as keyof AccessLog,
      header: 'Date/Heure',
      render: (value: string) => formatDate(value),
    },
    {
      key: 'location' as keyof AccessLog,
      header: 'Localisation',
      render: (value: string) => (
        <div className="flex items-center">
          <MapPin className="w-4 h-4 text-gray-400 mr-2" />
          <span className="font-medium text-gray-900">{value}</span>
        </div>
      ),
    },
    {
      key: 'access_type' as keyof AccessLog,
      header: 'Type d\'accès',
      render: (value: string) => {
        return <Badge variant={getBadgeVariant(value)}>{getAccessTypeLabel(value)}</Badge>;
      },
    },
    {
      key: 'card_id' as keyof AccessLog,
      header: 'Carte',
      render: (value: string | null) => (
        <div className="flex items-center">
          <CreditCard className="w-4 h-4 text-gray-400 mr-2" />
          <span className="font-mono text-sm text-gray-600">
            {value ? `CARD${value.padStart(3, '0')}` : 'N/A'}
          </span>
        </div>
      ),
    },
  ];

  // Ajout d'une colonne d'actions qui ne fait pas partie de AccessLog
  const tableColumns = [
    ...columns,
    {
      key: 'id' as keyof AccessLog, // Utilise une clé valide
      header: 'Actions',
      render: (_: any, log: AccessLog) => (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => handleViewLog(log)}
        >
          <Eye className="w-4 h-4" />
        </Button>
      ),
    },
  ];

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || log.access_type === filterType;
    const matchesLocation = !filterLocation || log.location === filterLocation;
    
    let matchesDate = true;
    if (dateRange.start && dateRange.end) {
      const logDate = new Date(log.accessed_at);
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      matchesDate = logDate >= startDate && logDate <= endDate;
    }
    
    return matchesSearch && matchesFilter && matchesLocation && matchesDate;
  });

  const uniqueLocations = [...new Set(logs.map(log => log.location))];

  return (
    <Layout title="Journaux d'accès">
      {/* Statistiques */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Activity className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total des logs</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total_logs}</p>
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-semibold">E</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Entrées</p>
                <p className="text-2xl font-semibold text-green-600">{stats.entries}</p>
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">S</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Sorties</p>
                <p className="text-2xl font-semibold text-blue-600">{stats.exits}</p>
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 font-semibold">R</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Refusés</p>
                <p className="text-2xl font-semibold text-red-600">{stats.denied}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      <Card>
        {/* Filtres et actions */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher par localisation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary-500 focus:border-primary-500 w-64"
              />
            </div>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="all">Tous les types</option>
              <option value="entry">Entrées</option>
              <option value="exit">Sorties</option>
              <option value="denied">Refusés</option>
            </select>

            <select
              value={filterLocation}
              onChange={(e) => {
                if (e.target.value) {
                  filterByLocation(e.target.value);
                } else {
                  setFilterLocation('');
                }
              }}
              className="border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">Toutes les localisations</option>
              {uniqueLocations.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>

            <div className="flex space-x-2">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="border border-gray-300 rounded-lg px-3 py-2"
              />
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>

            {(filterLocation || filterType !== 'all' || searchTerm || dateRange.start || dateRange.end) && (
              <Button variant="secondary" onClick={resetFilters}>
                <Filter className="w-4 h-4 mr-2" />
                Réinitialiser
              </Button>
            )}
          </div>
          
          <div className="flex space-x-3">
            <Button variant="secondary" onClick={exportLogs}>
              <Download className="w-4 h-4 mr-2" />
              Exporter
            </Button>
            <Button onClick={() => setShowSimulateModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Simuler un accès
            </Button>
          </div>
        </div>

        {/* Résumé des filtres actifs */}
        <div className="mb-4 text-sm text-gray-600">
          Affichage de {filteredLogs.length} journal(s) sur {logs.length} total
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Chargement...</p>
          </div>
        ) : (
          <Table data={filteredLogs} columns={tableColumns} />
        )}
      </Card>

      {/* Modals */}
      {selectedLog && (
        <AccessLogDetail
          log={selectedLog}
          isOpen={showLogDetail}
          onClose={() => {
            setShowLogDetail(false);
            setSelectedLog(null);
          }}
        />
      )}

      <SimulateAccess
        isOpen={showSimulateModal}
        onClose={() => setShowSimulateModal(false)}
        onSuccess={loadData}
      />
    </Layout>
  );
};