// src/pages/AccessCards.tsx
import React, { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Table } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { AccessCardDetailModal } from '../components/access-cards/AccessCardDetailModal';
import { UserAccessCardsModal } from '../components/access-cards/UserAccessCardsModal';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Eye, 
  CreditCard,
  User as UserIcon,
  Filter
} from 'lucide-react';
import type { AccessCard, User } from '../types';
import { apiEndpoints } from '../services/api';

export const AccessCards: React.FC = () => {
  const [accessCards, setAccessCards] = useState<AccessCard[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isUserCardsModalOpen, setIsUserCardsModalOpen] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [editingCard, setEditingCard] = useState<AccessCard | null>(null);
  const [formData, setFormData] = useState({
    card_number: '',
    status: 'active' as 'active' | 'lost' | 'disabled',
    user_id: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [cardsResponse, usersResponse] = await Promise.all([
        apiEndpoints.accessCards.getAll(),
        apiEndpoints.users.getAll()
      ]);
      
      setAccessCards(cardsResponse.data);
      setUsers(usersResponse.data);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      // Fallback to mock data
      const mockCards: AccessCard[] = [
        {
          id: '1',
          card_number: 'AC001234',
          status: 'active',
          user_id: '1',
          issued_at: '2024-01-15T10:00:00Z'
        },
        {
          id: '2',
          card_number: 'AC001235',
          status: 'lost',
          user_id: '2',
          issued_at: '2024-02-20T14:30:00Z'
        },
        {
          id: '3',
          card_number: 'AC001236',
          status: 'disabled',
          user_id: '3',
          issued_at: '2024-03-10T09:15:00Z'
        }
      ];
      
      const mockUsers: User[] = [
        { id: '1', email: 'admin@campus.fr', role: 'admin' },
        { id: '2', email: 'marie.dubois@etudiant.fr', role: 'student' },
        { id: '3', email: 'pierre.martin@prof.fr', role: 'professor' }
      ];
      
      setAccessCards(mockCards);
      setUsers(mockUsers);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCard) {
        // Update card
        const response = await apiEndpoints.accessCards.update(editingCard.id, formData);
        setAccessCards(accessCards.map(c => c.id === editingCard.id ? response.data : c));
      } else {
        // Create card
        const response = await apiEndpoints.accessCards.create(formData);
        setAccessCards([...accessCards, response.data]);
      }
      
      setIsModalOpen(false);
      setEditingCard(null);
      setFormData({ card_number: '', status: 'active', user_id: '' });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      
      // For demo purposes, still update local state
      if (editingCard) {
        const updatedCard = { 
          ...editingCard, 
          card_number: formData.card_number,
          status: formData.status,
          user_id: formData.user_id
        };
        setAccessCards(accessCards.map(c => c.id === editingCard.id ? updatedCard : c));
      } else {
        const newCard: AccessCard = {
          id: Date.now().toString(),
          card_number: formData.card_number,
          status: formData.status,
          user_id: formData.user_id,
          issued_at: new Date().toISOString()
        };
        setAccessCards([...accessCards, newCard]);
      }
      
      setIsModalOpen(false);
      setEditingCard(null);
      setFormData({ card_number: '', status: 'active', user_id: '' });
    }
  };

  const handleView = (card: AccessCard) => {
    setSelectedCardId(card.id);
    setIsDetailModalOpen(true);
  };

  const handleViewUserCards = (userId: string) => {
    setSelectedUserId(userId);
    setIsUserCardsModalOpen(true);
  };

  const handleEdit = (card: AccessCard) => {
    setEditingCard(card);
    setFormData({
      card_number: card.card_number,
      status: card.status,
      user_id: card.user_id,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (card: AccessCard) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette carte d\'accès ?')) {
      try {
        await apiEndpoints.accessCards.delete(card.id);
        setAccessCards(accessCards.filter(c => c.id !== card.id));
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        // For demo purposes, still update local state
        setAccessCards(accessCards.filter(c => c.id !== card.id));
      }
    }
  };

  const getUserEmail = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.email || 'Utilisateur introuvable';
  };

  const filteredCards = accessCards.filter(card => {
    const matchesSearch = 
      card.card_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getUserEmail(card.user_id).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || card.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

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
      key: 'user_id' as keyof AccessCard,
      header: 'Utilisateur',
      render: (value: string) => (
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-900">{getUserEmail(value)}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleViewUserCards(value);
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
          {new Date(value).toLocaleDateString('fr-FR')}
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
              handleView(card);
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
              handleEdit(card);
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
              handleDelete(card);
            }}
            title="Supprimer"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Layout title="Gestion des cartes d'accès">
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher une carte ou un utilisateur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary-500 focus:border-primary-500 w-64"
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Active</option>
                <option value="lost">Perdue</option>
                <option value="disabled">Désactivée</option>
              </select>
            </div>
          </div>
          
          <Button
            onClick={() => {
              setEditingCard(null);
              setFormData({ card_number: '', status: 'active', user_id: '' });
              setIsModalOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle carte
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Chargement...</p>
          </div>
        ) : (
          <Table
            data={filteredCards}
            columns={columns}
            onRowClick={handleView}
          />
        )}
      </Card>

      {/* Card Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCard ? 'Modifier la carte d\'accès' : 'Nouvelle carte d\'accès'}
        actions={
          <>
            <Button
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              form="card-form"
            >
              {editingCard ? 'Mettre à jour' : 'Créer'}
            </Button>
          </>
        }
      >
        <form id="card-form" onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Numéro de carte"
            type="text"
            value={formData.card_number}
            onChange={(e) => setFormData({ ...formData, card_number: e.target.value })}
            placeholder="AC001234"
            required
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Utilisateur
            </label>
            <select
              value={formData.user_id}
              onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
              className="input"
              required
            >
              <option value="">Sélectionner un utilisateur</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.email} ({user.role === 'admin' ? 'Admin' : user.role === 'student' ? 'Étudiant' : 'Professeur'})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Statut
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="input"
              required
            >
              <option value="active">Active</option>
              <option value="disabled">Désactivée</option>
              <option value="lost">Perdue</option>
            </select>
          </div>
        </form>
      </Modal>

      {/* Card Detail Modal */}
      <AccessCardDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedCardId(null);
        }}
        cardId={selectedCardId}
        onStatusChange={loadData}
      />

      {/* User Cards Modal */}
      <UserAccessCardsModal
        isOpen={isUserCardsModalOpen}
        onClose={() => {
          setIsUserCardsModalOpen(false);
          setSelectedUserId(null);
        }}
        userId={selectedUserId}
        onCardView={(cardId) => {
          setIsUserCardsModalOpen(false);
          setSelectedCardId(cardId);
          setIsDetailModalOpen(true);
        }}
      />
    </Layout>
  );
};