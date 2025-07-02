// src/components/access-cards/AccessCardDetailModal.tsx
import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import type { AccessCard, User, AccessLog } from '../../types';
import { apiEndpoints } from '../../services/api';
import { 
  CreditCard, 
  User as UserIcon, 
  Calendar, 
  Clock,
  MapPin,
  Activity,
  Settings
} from 'lucide-react';

interface AccessCardDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  cardId: string | null;
  onStatusChange?: () => void;
}

export const AccessCardDetailModal: React.FC<AccessCardDetailModalProps> = ({ 
  isOpen, 
  onClose, 
  cardId,
  onStatusChange 
}) => {
  const [card, setCard] = useState<AccessCard | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    if (isOpen && cardId) {
      fetchCardDetails();
    } else {
      // Reset state when modal closes
      setCard(null);
      setUser(null);
      setAccessLogs([]);
      setError(null);
    }
  }, [isOpen, cardId]);

  const fetchCardDetails = async () => {
    if (!cardId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch card details
      const cardResponse = await apiEndpoints.accessCards.getById(cardId);
      setCard(cardResponse.data);

      // Fetch user details
      if (cardResponse.data.user_id) {
        try {
          const userResponse = await apiEndpoints.users.getById(cardResponse.data.user_id);
          setUser(userResponse.data);
        } catch (err) {
          console.log('User not found for this card');
        }
      }

      // Fetch access logs
      try {
        const logsResponse = await apiEndpoints.accessLogs.getByCard(cardId);
        setAccessLogs(logsResponse.data.slice(0, 10)); // Derniers 10 accès
      } catch (err) {
        console.log('No access logs found for this card');
        setAccessLogs([]);
      }
    } catch (err) {
      console.error('Error fetching card details:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des détails');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: 'active' | 'lost' | 'disabled') => {
    if (!card) return;

    setUpdatingStatus(true);
    try {
      await apiEndpoints.accessCards.updateStatus(card.id, newStatus);
      setCard({ ...card, status: newStatus });
      onStatusChange?.();
    } catch (err) {
      console.error('Error updating card status:', err);
      alert('Erreur lors de la mise à jour du statut');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'success' as const;
      case 'lost': return 'danger' as const;
      case 'disabled': return 'warning' as const;
      default: return 'default' as const;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'lost': return 'Perdue';
      case 'disabled': return 'Désactivée';
      default: return status;
    }
  };

  const getAccessTypeIcon = (type: string) => {
    switch (type) {
      case 'entry': return '🟢';
      case 'exit': return '🔴';
      case 'denied': return '❌';
      default: return '❓';
    }
  };

  const getAccessTypeLabel = (type: string) => {
    switch (type) {
      case 'entry': return 'Entrée';
      case 'exit': return 'Sortie';
      case 'denied': return 'Refusé';
      default: return type;
    }
  };

  if (loading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Détails de la carte d'accès" size="lg">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-3 text-gray-600">Chargement...</span>
        </div>
      </Modal>
    );
  }

  if (error) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Erreur">
        <div className="text-center py-8">
          <div className="text-red-500 mb-4">
            <CreditCard className="w-12 h-12 mx-auto mb-2" />
          </div>
          <p className="text-gray-600">{error}</p>
          <Button variant="secondary" onClick={onClose} className="mt-4">
            Fermer
          </Button>
        </div>
      </Modal>
    );
  }

  if (!card) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Détails de la carte d'accès"
      size="lg"
      actions={
        <Button variant="secondary" onClick={onClose}>
          Fermer
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Card Basic Info */}
        <Card>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-primary-100 rounded-full">
                <CreditCard className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{card.card_number}</h3>
                <p className="text-sm text-gray-500">ID: {card.id}</p>
                <p className="text-sm text-gray-500">
                  Émise le {new Date(card.issued_at).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
            <div className="text-right">
              <Badge variant={getStatusBadgeVariant(card.status)}>
                {getStatusLabel(card.status)}
              </Badge>
            </div>
          </div>
        </Card>

        {/* Status Management */}
        <Card>
          <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Gestion du statut
          </h4>
          <div className="flex space-x-3">
            {(['active', 'lost', 'disabled'] as const).map((status) => (
              <Button
                key={status}
                variant={card.status === status ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => handleStatusChange(status)}
                disabled={updatingStatus || card.status === status}
              >
                {updatingStatus ? 'Mise à jour...' : getStatusLabel(status)}
              </Button>
            ))}
          </div>
        </Card>

        {/* User Info */}
        {user && (
          <Card>
            <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
              <UserIcon className="w-5 h-5 mr-2" />
              Titulaire de la carte
            </h4>
            <div className="flex items-center space-x-3">
              <UserIcon className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">{user.email}</p>
                <p className="text-xs text-gray-500">
                  {user.role === 'admin' ? 'Administrateur' : 
                   user.role === 'student' ? 'Étudiant' : 'Professeur'}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Access Logs */}
        <Card>
          <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Historique des accès ({accessLogs.length > 0 ? `${accessLogs.length} derniers` : '0'})
          </h4>
          {accessLogs.length > 0 ? (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {accessLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{getAccessTypeIcon(log.access_type)}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {getAccessTypeLabel(log.access_type)}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {log.location}
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {new Date(log.accessed_at).toLocaleString('fr-FR')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Aucun historique d'accès trouvé</p>
          )}
        </Card>
      </div>
    </Modal>
  );
};