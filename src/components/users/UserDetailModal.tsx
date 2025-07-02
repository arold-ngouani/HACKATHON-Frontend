// src/components/users/UserDetailModal.tsx
import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import type { User, AccessCard, Student, Professor } from '../../types';
import { apiEndpoints } from '../../services/api';
import { Calendar, CreditCard, User as UserIcon, Mail, MapPin, Phone, Building } from 'lucide-react';

interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
}

export const UserDetailModal: React.FC<UserDetailModalProps> = ({ isOpen, onClose, userId }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessCards, setAccessCards] = useState<AccessCard[]>([]);
  const [student, setStudent] = useState<Student | null>(null);
  const [professor, setProfessor] = useState<Professor | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && userId) {
      fetchUserDetails();
    } else {
      // Reset state when modal closes
      setUser(null);
      setAccessCards([]);
      setStudent(null);
      setProfessor(null);
      setError(null);
    }
  }, [isOpen, userId]);

  const fetchUserDetails = async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch user details
      const userResponse = await apiEndpoints.users.getById(userId);
      setUser(userResponse.data);

      // Fetch related data based on user role
      const [accessCardsResponse] = await Promise.all([
        apiEndpoints.accessCards.getByUser(userId).catch(() => ({ data: [] })),
      ]);
      
      setAccessCards(accessCardsResponse.data);

      // Fetch role-specific data
      if (userResponse.data.role === 'student') {
        try {
          const studentResponse = await apiEndpoints.students.getByUser(userId);
          setStudent(studentResponse.data);
        } catch (err) {
          console.log('No student profile found');
        }
      } else if (userResponse.data.role === 'professor') {
        try {
          const professorResponse = await apiEndpoints.professors.getByUser(userId);
          setProfessor(professorResponse.data);
        } catch (err) {
          console.log('No professor profile found');
        }
      }
    } catch (err) {
      console.error('Error fetching user details:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des détails');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'info' as const;
      case 'student': return 'success' as const;
      case 'professor': return 'warning' as const;
      default: return 'default' as const;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrateur';
      case 'student': return 'Étudiant';
      case 'professor': return 'Professeur';
      default: return role;
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

  if (loading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Détails de l'utilisateur">
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
            <UserIcon className="w-12 h-12 mx-auto mb-2" />
          </div>
          <p className="text-gray-600">{error}</p>
          <Button variant="secondary" onClick={onClose} className="mt-4">
            Fermer
          </Button>
        </div>
      </Modal>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Détails de l'utilisateur"
      size="lg"
      actions={
        <Button variant="secondary" onClick={onClose}>
          Fermer
        </Button>
      }
    >
      <div className="space-y-6">
        {/* User Basic Info */}
        <Card>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-primary-100 rounded-full">
                <UserIcon className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{user.email}</h3>
                <p className="text-sm text-gray-500">ID: {user.id}</p>
              </div>
            </div>
            <Badge variant={getRoleBadgeVariant(user.role)}>
              {getRoleLabel(user.role)}
            </Badge>
          </div>
        </Card>

        {/* Student Profile */}
        {student && (
          <Card>
            <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
              <UserIcon className="w-5 h-5 mr-2" />
              Profil Étudiant
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <UserIcon className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{student.full_name}</p>
                  <p className="text-xs text-gray-500">Nom complet</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <CreditCard className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{student.student_card_id}</p>
                  <p className="text-xs text-gray-500">Carte étudiant</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Building className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{student.class_name}</p>
                  <p className="text-xs text-gray-500">Classe</p>
                </div>
              </div>
              {student.phone_number && (
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{student.phone_number}</p>
                    <p className="text-xs text-gray-500">Téléphone</p>
                  </div>
                </div>
              )}
              <div className="flex items-center space-x-3">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(student.registered_at).toLocaleDateString('fr-FR')}
                  </p>
                  <p className="text-xs text-gray-500">Date d'inscription</p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Professor Profile */}
        {professor && (
          <Card>
            <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
              <UserIcon className="w-5 h-5 mr-2" />
              Profil Professeur
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <UserIcon className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{professor.full_name}</p>
                  <p className="text-xs text-gray-500">Nom complet</p>
                </div>
              </div>
              {professor.department && (
                <div className="flex items-center space-x-3">
                  <Building className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{professor.department}</p>
                    <p className="text-xs text-gray-500">Département</p>
                  </div>
                </div>
              )}
              {professor.office && (
                <div className="flex items-center space-x-3">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{professor.office}</p>
                    <p className="text-xs text-gray-500">Bureau</p>
                  </div>
                </div>
              )}
              {professor.phone_number && (
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{professor.phone_number}</p>
                    <p className="text-xs text-gray-500">Téléphone</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Access Cards */}
        <Card>
          <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Cartes d'accès ({accessCards.length})
          </h4>
          {accessCards.length > 0 ? (
            <div className="space-y-3">
              {accessCards.map((card) => (
                <div key={card.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CreditCard className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{card.card_number}</p>
                      <p className="text-xs text-gray-500">
                        Émise le {new Date(card.issued_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  <Badge variant={getStatusBadgeVariant(card.status)}>
                    {getStatusLabel(card.status)}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Aucune carte d'accès trouvée</p>
          )}
        </Card>
      </div>
    </Modal>
  );
};