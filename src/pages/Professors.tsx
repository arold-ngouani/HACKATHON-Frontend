// src/pages/Professors.tsx
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
  Users as UsersIcon, 
  Mail, 
  Filter, 
  Eye,
  GraduationCap,
  Calendar,
  BarChart3,
  Building,
  BookOpen,
  User,
  UserCheck
} from 'lucide-react';
import type { Professor } from '../types';
import { apiEndpoints } from '../services/api';

interface ProfessorFilters {
  department: string;
  searchTerm: string;
}

interface ProfessorDetailModalProps {
  professor: Professor;
  isOpen: boolean;
  onClose: () => void;
}

const ProfessorDetail: React.FC<ProfessorDetailModalProps> = ({ professor, isOpen, onClose }) => {
  const [professorDetails, setProfessorDetails] = useState<Professor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && professor) {
      loadProfessorDetails();
    }
  }, [isOpen, professor]);

  const loadProfessorDetails = async () => {
    try {
      setLoading(true);
      const response = await apiEndpoints.professors.getById(professor.id);
      setProfessorDetails(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des détails:', error);
      setProfessorDetails(professor); // Fallback sur les données déjà disponibles
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Détails du professeur" isOpen={isOpen} onClose={onClose}>
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Chargement des détails...</p>
          </div>
        ) : professorDetails ? (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom complet
              </label>
              <p className="text-gray-900">{professorDetails.full_name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <p className="text-gray-900">{professorDetails.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Département
              </label>
              <Badge variant="info">{professorDetails.department}</Badge>
            </div>
            {professorDetails.phone_number && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone
                </label>
                <p className="text-gray-900">{professorDetails.phone_number}</p>
              </div>
            )}
            {professorDetails.office && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bureau
                </label>
                <p className="text-gray-900">{professorDetails.office}</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ID Utilisateur
              </label>
              <p className="text-gray-900 font-mono">{professorDetails.user_id}</p>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">Impossible de charger les détails</p>
        )}
      </div>
    </Modal>
  );
};

const ProfessorForm: React.FC<{formData: any, setFormData: any, editingProfessor: any}> = ({ formData, setFormData, editingProfessor }) => {
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  
  useEffect(() => {
    // Charger les utilisateurs disponibles pour le debug si nécessaire
    apiEndpoints.users.getAll()
      .then(response => setAvailableUsers(response.data))
      .catch(console.error);
  }, []);

  return (
    <>
      <Input
        label="Nom complet"
        value={formData.full_name}
        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
        required
      />
      
      <Input
        label="Email"
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        required
      />
      
      <Input
        label="Département"
        value={formData.department}
        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
        placeholder="Ex: Informatique, Mathématiques"
        required
      />
      
      <Input
        label="Téléphone (optionnel)"
        type="tel"
        value={formData.phone_number}
        onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
        placeholder="Ex: 0123456789"
      />
      
      <Input
        label="Bureau (optionnel)"
        value={formData.office}
        onChange={(e) => setFormData({ ...formData, office: e.target.value })}
        placeholder="Ex: A301, B205"
      />
      
      {/* Afficher les utilisateurs disponibles pour info (en mode debug) */}
      {availableUsers.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Utilisateurs disponibles (pour info)
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
            disabled
          >
            <option>Utilisateurs existants:</option>
            {availableUsers.slice(0, 5).map((user) => (
              <option key={user.id} value={user.id}>
                {user.email} (ID: {user.id})
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            L'user_id sera généré automatiquement
          </p>
        </div>
      )}
    </>
  );
};

export const Professors: React.FC = () => {
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingProfessor, setEditingProfessor] = useState<Professor | null>(null);
  const [selectedProfessor, setSelectedProfessor] = useState<Professor | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [availableDepartments, setAvailableDepartments] = useState<string[]>([]);
  const [filters, setFilters] = useState<ProfessorFilters>({
    department: '',
    searchTerm: '',
  });
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    department: '',
    phone_number: '',
    office: '',
  });

  useEffect(() => {
    loadProfessors();
  }, []);

  const loadProfessors = async () => {
    try {
      setLoading(true);
      const response = await apiEndpoints.professors.getAll();
      setProfessors(response.data);
      
      // Extraire les départements uniques
      const professorsData: Professor[] = response.data;
      const departments: string[] = [];
      professorsData.forEach((professor) => {
        if (professor.department && !departments.includes(professor.department)) {
          departments.push(professor.department);
        }
      });
      setAvailableDepartments(departments.sort());
      
    } catch (error) {
      console.error('Erreur lors du chargement des professeurs:', error);
      // Fallback avec des données mockées
      const mockProfessors: Professor[] = [
        { 
          id: '1', 
          full_name: 'Dr. Marie Dupont', 
          email: 'marie.dupont@campus.fr', 
          department: 'Informatique',
          phone_number: '0123456789',
          office: 'A301',
          user_id: 'user1'
        },
        { 
          id: '2', 
          full_name: 'Prof. Jean Martin', 
          email: 'jean.martin@campus.fr', 
          department: 'Mathématiques',
          phone_number: '',
          office: '',
          user_id: 'user2'
        },
      ];
      setProfessors(mockProfessors);
      setAvailableDepartments(['Informatique', 'Mathématiques']);
    } finally {
      setLoading(false);
    }
  };

  const loadProfessorsByDepartment = async (department: string) => {
    try {
      setLoading(true);
      const response = await apiEndpoints.professors.getByDepartment(department);
      setProfessors(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des professeurs par département:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('Données à envoyer:', formData);
      
      if (editingProfessor) {
        console.log('Modification du professeur:', editingProfessor.id);
        const response = await apiEndpoints.professors.update(editingProfessor.id, formData);
        setProfessors(professors.map(p => p.id === editingProfessor.id ? response.data : p));
      } else {
        console.log('Création d\'un nouveau professeur');
        console.log('URL endpoint:', 'https://hackathonbackend-production-est.up.railway.app/api/v1/professors/');
        
        // Vérifier le token d'authentification
        const token = localStorage.getItem('auth_token');
        console.log('Token présent:', !!token);
        
        // Préparer les données SANS user_id (laisser l'API le générer)
        const professorData = {
          full_name: formData.full_name,
          email: formData.email,
          department: formData.department,
          phone_number: formData.phone_number || '',
          office: formData.office || ''
        };
        
        console.log('Données sans user_id (auto-généré):', JSON.stringify(professorData, null, 2));
        
        try {
          const response = await apiEndpoints.professors.create(professorData);
          console.log('Succès! Réponse:', response.data);
          setProfessors([...professors, response.data]);
        } catch (error: any) {
          console.error('Erreur détaillée:', error);
          console.error('Status:', error.response?.status);
          console.error('Data:', error.response?.data);
          
          // Essayer avec password pour création auto d'utilisateur
          if (error.response?.status === 404 || error.response?.status === 422) {
            console.log('Tentative avec password pour création auto d\'utilisateur...');
            try {
              const dataWithPassword = {
                full_name: formData.full_name,
                email: formData.email,
                department: formData.department,
                phone_number: formData.phone_number || '',
                office: formData.office || '',
                password: 'defaultPassword123', // Ajout du password
                role: 'professor' // Ajout du rôle
              };
              console.log('Données avec password:', dataWithPassword);
              const response3 = await apiEndpoints.professors.create(dataWithPassword);
              console.log('Succès avec password!', response3.data);
              setProfessors([...professors, response3.data]);
            } catch (error3) {
              console.error('Échec même avec password:', error3);
              throw error; // Relancer l'erreur originale
            }
          } else {
            throw error;
          }
        }
      }
      
      setIsModalOpen(false);
      setEditingProfessor(null);
      setFormData({ 
        full_name: '', 
        email: '', 
        department: '', 
        phone_number: '', 
        office: '', 
      });
      
      // Recharger pour mettre à jour les départements disponibles
      loadProfessors();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde du professeur');
    }
  };

  const handleEdit = (professor: Professor) => {
    setEditingProfessor(professor);
    setFormData({
      full_name: professor.full_name,
      email: professor.email,
      department: professor.department || '',
      phone_number: professor.phone_number || '',
      office: professor.office || '',
    });
    setIsModalOpen(true);
  };

  const handleViewDetails = (professor: Professor) => {
    setSelectedProfessor(professor);
    setIsDetailModalOpen(true);
  };

  const handleDelete = async (professor: Professor) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce professeur ?')) {
      try {
        await apiEndpoints.professors.delete(professor.id);
        setProfessors(professors.filter(p => p.id !== professor.id));
        
        // Mettre à jour les départements disponibles
        const updatedProfessors = professors.filter(p => p.id !== professor.id);
        const departments: string[] = [];
        updatedProfessors.forEach((prof) => {
          if (prof.department && !departments.includes(prof.department)) {
            departments.push(prof.department);
          }
        });
        setAvailableDepartments(departments.sort());
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression du professeur');
      }
    }
  };

  const applyFilters = () => {
    if (filters.department) {
      loadProfessorsByDepartment(filters.department);
    } else {
      loadProfessors();
    }
  };

  const resetFilters = () => {
    setFilters({ department: '', searchTerm: '' });
    loadProfessors();
  };

  const columns = [
    {
      key: 'full_name' as keyof Professor,
      header: 'Nom complet',
      render: (value: string) => (
        <div className="flex items-center">
          <UserCheck className="w-4 h-4 mr-2 text-gray-400" />
          <span className="font-medium text-gray-900">{value}</span>
        </div>
      ),
    },
    {
      key: 'email' as keyof Professor,
      header: 'Email',
      render: (value: string) => (
        <div className="flex items-center">
          <Mail className="w-4 h-4 mr-2 text-gray-400" />
          <span className="text-gray-900">{value}</span>
        </div>
      ),
    },
    {
      key: 'department' as keyof Professor,
      header: 'Département',
      render: (value: string | undefined) => (
        <div className="flex items-center">
          <Building className="w-4 h-4 mr-2 text-gray-400" />
          <Badge variant="info">{value || 'Non assigné'}</Badge>
        </div>
      ),
    },
    {
      key: 'office' as keyof Professor,
      header: 'Bureau',
      render: (value: string | undefined) => (
        <div className="flex items-center">
          <BookOpen className="w-4 h-4 mr-2 text-gray-400" />
          <span className="text-gray-600">{value || 'N/A'}</span>
        </div>
      ),
    },
    {
      key: 'id' as keyof Professor,
      header: 'Actions',
      render: (_: any, professor: Professor) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleViewDetails(professor);
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
              handleEdit(professor);
            }}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(professor);
            }}
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  const filteredProfessors = professors.filter(professor => {
    const matchesSearch = professor.full_name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                         professor.email.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                         (professor.department && professor.department.toLowerCase().includes(filters.searchTerm.toLowerCase()));
    const matchesDepartment = !filters.department || professor.department === filters.department;
    
    return matchesSearch && matchesDepartment;
  });

  const professorStats = {
    total: professors.length,
    departments: availableDepartments.length,
    withOffice: professors.filter(p => p.office && p.office.trim() !== '').length,
  };

  return (
    <Layout title="Gestion des professeurs">
      <Card>
        <div className="space-y-4">
          {/* Header avec recherche et boutons */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Rechercher un professeur..."
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
                setEditingProfessor(null);
                setFormData({ 
                  full_name: '', 
                  email: '', 
                  department: '', 
                  phone_number: '', 
                  office: '', 
                });
                setIsModalOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouveau professeur
            </Button>
          </div>

          {/* Filtres avancés */}
          {showFilters && (
            <Card className="bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Département
                  </label>
                  <select
                    value={filters.department}
                    onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Tous les départements</option>
                    {availableDepartments.map(department => (
                      <option key={department} value={department}>{department}</option>
                    ))}
                  </select>
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
                  <UserCheck className="w-5 h-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-900">Total Professeurs</p>
                  <p className="text-2xl font-bold text-blue-600">{professorStats.total}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Building className="w-5 h-5 text-purple-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-purple-900">Départements</p>
                  <p className="text-2xl font-bold text-purple-600">{professorStats.departments}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <BookOpen className="w-5 h-5 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-900">Avec Bureau</p>
                  <p className="text-2xl font-bold text-green-600">{professorStats.withOffice}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-orange-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-orange-900">Moyenne/Dépt</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {professorStats.departments > 0 ? Math.round(professorStats.total / professorStats.departments) : 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Résumé des filtres */}
        <div className="mb-4 text-sm text-gray-600">
          Affichage de {filteredProfessors.length} professeur(s) sur {professors.length} total
          {filters.department && ` • Département: ${filters.department}`}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Chargement...</p>
          </div>
        ) : (
          <Table data={filteredProfessors} columns={columns} />
        )}
      </Card>

      {/* Modal de formulaire de professeur */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProfessor ? 'Modifier le professeur' : 'Nouveau professeur'}
        actions={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" form="professor-form">
              {editingProfessor ? 'Mettre à jour' : 'Créer'}
            </Button>
          </>
        }
      >
        <form id="professor-form" onSubmit={handleSubmit} className="space-y-4">
          <ProfessorForm 
            formData={formData} 
            setFormData={setFormData} 
            editingProfessor={editingProfessor}
          />
        </form>
      </Modal>

      {/* Modal de détails du professeur */}
      {selectedProfessor && (
        <ProfessorDetail
          professor={selectedProfessor}
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedProfessor(null);
          }}
        />
      )}
    </Layout>
  );
};

export default Professors