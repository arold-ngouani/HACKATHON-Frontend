// src/pages/Users.tsx
import React, { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Table } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { UserDetailModal } from '../components/users/UserDetailModal';
import { Plus, Edit, Trash2, Search, Eye } from 'lucide-react';
import type { User } from '../types';
import { apiEndpoints } from '../services/api';

export const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    role: 'student' as 'admin' | 'student' | 'professor',
    password: '',
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await apiEndpoints.users.getAll();
      setUsers(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
      // Fallback to mock data in case of API error
      const mockUsers: User[] = [
        { id: '1', email: 'admin@campus.fr', role: 'admin' },
        { id: '2', email: 'marie.dubois@etudiant.fr', role: 'student' },
        { id: '3', email: 'pierre.martin@prof.fr', role: 'professor' },
        { id: '4', email: 'sophie.leroy@etudiant.fr', role: 'student' },
        { id: '5', email: 'jean.durand@prof.fr', role: 'professor' },
      ];
      setUsers(mockUsers);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        // Update user
        const response = await apiEndpoints.users.update(editingUser.id, {
          email: formData.email,
          role: formData.role,
        });
        setUsers(users.map(u => u.id === editingUser.id ? response.data : u));
      } else {
        // Create user
        const response = await apiEndpoints.users.create(formData);
        setUsers([...users, response.data]);
      }
      
      setIsModalOpen(false);
      setEditingUser(null);
      setFormData({ email: '', role: 'student', password: '' });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      // For demo purposes, still update local state
      if (editingUser) {
        const updatedUser = { ...editingUser, email: formData.email, role: formData.role };
        setUsers(users.map(u => u.id === editingUser.id ? updatedUser : u));
      } else {
        const newUser: User = {
          id: Date.now().toString(),
          email: formData.email,
          role: formData.role,
        };
        setUsers([...users, newUser]);
      }
      
      setIsModalOpen(false);
      setEditingUser(null);
      setFormData({ email: '', role: 'student', password: '' });
    }
  };

  const handleView = (user: User) => {
    setSelectedUserId(user.id);
    setIsDetailModalOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      role: user.role,
      password: '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (user: User) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        await apiEndpoints.users.delete(user.id);
        setUsers(users.filter(u => u.id !== user.id));
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        // For demo purposes, still update local state
        setUsers(users.filter(u => u.id !== user.id));
      }
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      key: 'email' as keyof User,
      header: 'Email',
      render: (value: string) => (
        <div className="font-medium text-gray-900">{value}</div>
      ),
    },
    {
      key: 'role' as keyof User,
      header: 'Rôle',
      render: (value: string) => {
        const roleLabels = {
          admin: { label: 'Administrateur', variant: 'info' as const },
          student: { label: 'Étudiant', variant: 'success' as const },
          professor: { label: 'Professeur', variant: 'warning' as const },
        };
        const role = roleLabels[value as keyof typeof roleLabels];
        return <Badge variant={role.variant}>{role.label}</Badge>;
      },
    },
    {
      key: 'id' as keyof User,
      header: 'Actions',
      render: (_: any, user: User) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleView(user);
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
              handleEdit(user);
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
              handleDelete(user);
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
    <Layout title="Gestion des utilisateurs">
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher un utilisateur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary-500 focus:border-primary-500 w-64"
              />
            </div>
          </div>
          
          <Button
            onClick={() => {
              setEditingUser(null);
              setFormData({ email: '', role: 'student', password: '' });
              setIsModalOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouvel utilisateur
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Chargement...</p>
          </div>
        ) : (
          <Table
            data={filteredUsers}
            columns={columns}
            onRowClick={handleView}
          />
        )}
      </Card>

      {/* User Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
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
              form="user-form"
            >
              {editingUser ? 'Mettre à jour' : 'Créer'}
            </Button>
          </>
        }
      >
        <form id="user-form" onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rôle
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
              className="input"
              required
            >
              <option value="student">Étudiant</option>
              <option value="professor">Professeur</option>
              <option value="admin">Administrateur</option>
            </select>
          </div>
          
          <Input
            label="Mot de passe"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required={!editingUser}
            placeholder={editingUser ? 'Laisser vide pour ne pas changer' : ''}
          />
        </form>
      </Modal>

      {/* User Detail Modal */}
      <UserDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedUserId(null);
        }}
        userId={selectedUserId}
      />
    </Layout>
  );
};