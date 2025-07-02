// src/components/access-cards/UserAccessCardsModal.tsx
import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Table } from '../ui/Table';
import type { AccessCard, User } from '../../types';
import { apiEndpoints } from '../../services/api';
import { 
  CreditCard, 
  User as UserIcon, 
  Eye,
  Plus,
  Calendar
} from 'lucide-react';

interface UserAccessCardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
  onCardView?: (cardId: string) => void;
}

export const UserAccessCardsModal: React.FC<UserAccessCardsModalProps> = ({ 
  isOpen, 
  onClose, 
  userId,
  onCardView 
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessCards, setAccessCards] = useState<AccessCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && userId) {
      fetchUserAccessCards();
    } else {
      // Reset state when modal closes
      setUser(null);
      setAccessCards([]);
      setError(null);
    }
  }, [isOpen, userId]);

  const fetchUserAccessCards = async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch user details
      const userResponse = await apiEndpoints.users.getById(userId);
      setUser(userResponse.data);

      // Fetch user's access cards
      const cardsResponse = await apiEndpoints.accessCards.getByUser(userId);
      setAccessCards(cardsResponse.data);
    } catch (err) {
      console.error('Error fetching user access cards:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des cartes');
    } finally {
      setLoading(false);
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

  const columns = [
    {
      key: 'card_number' as keyof AccessCard,
      header: 'Numéro de carte',
      render: (value: string) => (
        <div className="font-medium text-gray-900">{value}</div>
      ),
    },
    {
      key: 'status' as keyof AccessCard,
      header: 'Statut',
      render: (value: string) => (
        <Badge variant={getStatusBadgeVariant(value)}>
          {getStatusLabel(value)}
        </Badge>
      ),
    },
    {
      key: 'issued_at' as keyof AccessCard,
      header: 'Date d\'émission',
      render: (value: string) => (
        <div className="text-sm text-gray-900">
          {new Date(value).toLocaleDateString('fr-FR')}
        </div>
      ),
    },
    {
      key: 'id' as keyof AccessCard,
      header: 'Actions',
      render: (_: any, card: AccessCard) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onCardView?.(card.id);
          }}
          title="Voir les détails"
        >
          <Eye className="w-4 h-4" />
        </Button>
      ),
    },
  ];

  if (loading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Cartes d'accès de l'utilisateur" size="lg">
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cartes d'accès de l'utilisateur"
      size="lg"
      actions={
        <Button variant="secondary" onClick={onClose}>
          Fermer
        </Button>
      }
    >
      <div className="space-y-6">
        {/* User Info */}
        {user && (
          <Card>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-primary-100 rounded-full">
                <UserIcon className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{user.email}</h3>
                <p className="text-sm text-gray-500">
                  {user.role === 'admin' ? 'Administrateur' : 
                   user.role === 'student' ? 'Étudiant' : 'Professeur'}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Access Cards */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-medium text-gray-900 flex items-center">
              <CreditCard className="w-5 h-5 mr-2" />
              Cartes d'accès ({accessCards.length})
            </h4>
          </div>

          {accessCards.length > 0 ? (
            <Table
              data={accessCards}
              columns={columns}
              onRowClick={(card) => onCardView?.(card.id)}
            />
          ) : (
            <div className="text-center py-8">
              <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Aucune carte d'accès trouvée pour cet utilisateur</p>
            </div>
          )}
        </Card>
      </div>
    </Modal>
  );
};