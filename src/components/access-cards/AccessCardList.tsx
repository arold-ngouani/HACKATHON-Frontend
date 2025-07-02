// src/components/access-cards/AccessCardList.tsx
import React from 'react';
import { Table } from '../ui/Table';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { 
  Eye, 
  Edit, 
  Trash2, 
  User as UserIcon, 
  CreditCard 
} from 'lucide-react';
import type { AccessCard, User } from '../../types';

interface AccessCardListProps {
  accessCards: AccessCard[];
  users: User[];
  onView: (card: AccessCard) => void;
  onEdit: (card: AccessCard) => void;
  onDelete: (card: AccessCard) => void;
  onViewUserCards: (userId: string) => void;
  loading?: boolean;
}

export const AccessCardList: React.FC<AccessCardListProps> = ({
  accessCards,
  users,
  onView,
  onEdit,
  onDelete,
  onViewUserCards,
  loading = false
}) => {
  const getUserEmail = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.email || 'Utilisateur introuvable';
  };

  const getUserRole = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return '';
    
    switch (user.role) {
      case 'admin': return 'Admin';
      case 'student': return 'Étudiant';
      case 'professor': return 'Professeur';
      default: return user.role;
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
        <div className="flex items-center space-x-2">
          <CreditCard className="w-4 h-4 text-gray-400" />
          <span className="font-medium text-gray-900">{value}</span>
        </div>
      ),
    },
    {
      key: 'user_id' as keyof AccessCard,
      header: 'Utilisateur',
      render: (value: string) => (
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium text-gray-900">{getUserEmail(value)}</div>
            <div className="text-sm text-gray-500">{getUserRole(value)}</div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onViewUserCards(value);
            }}
            title="Voir toutes les cartes de cet utilisateur"
          >
            <UserIcon className="w-4 h-4" />
          </Button>
        </div>
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
          {new Date(value).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}
        </div>
      ),
    },
    {
      key: 'id' as keyof AccessCard,
      header: 'Actions',
      render: (_: any, card: AccessCard) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onView(card);
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
              onEdit(card);
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
              onDelete(card);
            }}
            title="Supprimer"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-2 text-gray-500">Chargement des cartes d'accès...</p>
      </div>
    );
  }

  if (accessCards.length === 0) {
    return (
      <div className="text-center py-12">
        <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune carte d'accès</h3>
        <p className="text-gray-500">
          Aucune carte d'accès ne correspond à vos critères de recherche.
        </p>
      </div>
    );
  }

  return (
    <Table
      data={accessCards}
      columns={columns}
      onRowClick={onView}
    />
  );
};