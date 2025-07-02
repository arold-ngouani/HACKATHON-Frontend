// src/pages/Students.tsx
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
  CreditCard,
  Phone,
  User
} from 'lucide-react';
import type { Student } from '../types';
import { apiEndpoints } from '../services/api';

interface StudentFilters {
  class_name: string;
  searchTerm: string;
}

interface StudentDetailModalProps {
  student: Student;
  isOpen: boolean;
  onClose: () => void;
}

const StudentDetail: React.FC<StudentDetailModalProps> = ({ student, isOpen, onClose }) => {
  const [studentDetails, setStudentDetails] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && student) {
      loadStudentDetails();
    }
  }, [isOpen, student]);

  const loadStudentDetails = async () => {
    try {
      setLoading(true);
      const response = await apiEndpoints.students.getById(student.id);
      setStudentDetails(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des détails:', error);
      setStudentDetails(student); // Fallback sur les données déjà disponibles
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Détails de l'étudiant" isOpen={isOpen} onClose={onClose}>
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Chargement des détails...</p>
          </div>
        ) : studentDetails ? (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom complet
              </label>
              <p className="text-gray-900">{studentDetails.full_name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Carte étudiant
              </label>
              <p className="text-gray-900 font-mono">{studentDetails.student_card_id}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <p className="text-gray-900">{studentDetails.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Classe
              </label>
              <Badge variant="info">{studentDetails.class_name}</Badge>
            </div>
            {studentDetails.phone_number && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone
                </label>
                <p className="text-gray-900">{studentDetails.phone_number}</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ID Utilisateur
              </label>
              <p className="text-gray-900 font-mono">{studentDetails.user_id}</p>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date d'inscription
              </label>
              <p className="text-gray-900">
                {new Date(studentDetails.registered_at).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">Impossible de charger les détails</p>
        )}
      </div>
    </Modal>
  );
};

export const Students: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [availableClasses, setAvailableClasses] = useState<string[]>([]);
  const [filters, setFilters] = useState<StudentFilters>({
    class_name: '',
    searchTerm: '',
  });
  const [formData, setFormData] = useState({
    full_name: '',
    student_card_id: '',
    email: '',
    class_name: '',
    phone_number: '',
    user_id: '',
  });

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const response = await apiEndpoints.students.getAll();
      setStudents(response.data);
      
      // Extraire les classes uniques
      const studentsData: Student[] = response.data;
      const classes: string[] = [];
      studentsData.forEach((student) => {
        if (!classes.includes(student.class_name)) {
          classes.push(student.class_name);
        }
      });
      setAvailableClasses(classes.sort());
      
    } catch (error) {
      console.error('Erreur lors du chargement des étudiants:', error);
      // Fallback avec des données mockées
      const mockStudents: Student[] = [
        { 
          id: '1', 
          full_name: 'Jean Dupont', 
          student_card_id: 'STU001',
          email: 'jean.dupont@campus.fr', 
          class_name: 'L3 Informatique',
          phone_number: '0123456789',
          user_id: 'user1',
          registered_at: new Date().toISOString()
        },
        { 
          id: '2', 
          full_name: 'Marie Martin', 
          student_card_id: 'STU002',
          email: 'marie.martin@campus.fr', 
          class_name: 'M1 Data Science',
          user_id: 'user2',
          registered_at: new Date().toISOString()
        },
      ];
      setStudents(mockStudents);
      setAvailableClasses(['L3 Informatique', 'M1 Data Science']);
    } finally {
      setLoading(false);
    }
  };

  const loadStudentsByClass = async (className: string) => {
    try {
      setLoading(true);
      const response = await apiEndpoints.students.getByClass(className);
      setStudents(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des étudiants par classe:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('Données à envoyer:', formData);
      
      if (editingStudent) {
        console.log('Modification de l\'étudiant:', editingStudent.id);
        const response = await apiEndpoints.students.update(editingStudent.id, formData);
        setStudents(students.map(s => s.id === editingStudent.id ? response.data : s));
      } else {
        console.log('Création d\'un nouvel étudiant');
        console.log('URL endpoint:', 'https://hackathonbackend-production-est.up.railway.app/api/v1/students/');
        
        // Vérifier le token d'authentification
        const token = localStorage.getItem('auth_token');
        console.log('Token présent:', !!token);
        console.log('Token value:', token ? token.substring(0, 20) + '...' : 'null');
        
        // Préparer les données exactement comme l'API les attend
        const studentData = {
          full_name: formData.full_name,
          student_card_id: formData.student_card_id,
          email: formData.email,
          class_name: formData.class_name,
          phone_number: formData.phone_number || null,
          user_id: formData.user_id,
          registered_at: new Date().toISOString()
        };
        
        console.log('Données finales à envoyer:', JSON.stringify(studentData, null, 2));
        
        try {
          const response = await apiEndpoints.students.create(studentData);
          console.log('Succès! Réponse:', response.data);
          setStudents([...students, response.data]);
        } catch (error: any) {
          console.error('Erreur détaillée:', error);
          console.error('Status:', error.response?.status);
          console.error('Data:', error.response?.data);
          console.error('Headers:', error.response?.headers);
          
          // Essayer sans registered_at au cas où ce champ pose problème
          if (error.response?.status === 404 || error.response?.status === 422) {
            console.log('Tentative sans registered_at...');
            try {
              const simpleData = {
                full_name: formData.full_name,
                student_card_id: formData.student_card_id,
                email: formData.email,
                class_name: formData.class_name,
                phone_number: formData.phone_number || null,
                user_id: formData.user_id
              };
              console.log('Données simplifiées:', simpleData);
              const response2 = await apiEndpoints.students.create(simpleData);
              console.log('Succès avec données simplifiées!', response2.data);
              setStudents([...students, response2.data]);
            } catch (error2) {
              console.error('Échec même avec données simplifiées:', error2);
              throw error; // Relancer l'erreur originale
            }
          } else {
            throw error;
          }
        }
      }
      
      setIsModalOpen(false);
      setEditingStudent(null);
      setFormData({ 
        full_name: '', 
        student_card_id: '', 
        email: '', 
        class_name: '', 
        phone_number: '', 
        user_id: '' 
      });
      
      // Recharger pour mettre à jour les classes disponibles
      loadStudents();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde de l\'étudiant');
    }
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      full_name: student.full_name,
      student_card_id: student.student_card_id,
      email: student.email,
      class_name: student.class_name,
      phone_number: student.phone_number || '',
      user_id: student.user_id,
    });
    setIsModalOpen(true);
  };

  const handleViewDetails = (student: Student) => {
    setSelectedStudent(student);
    setIsDetailModalOpen(true);
  };

  const handleDelete = async (student: Student) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet étudiant ?')) {
      try {
        await apiEndpoints.students.delete(student.id);
        setStudents(students.filter(s => s.id !== student.id));
        
        // Mettre à jour les classes disponibles
        const updatedStudents = students.filter(s => s.id !== student.id);
        const classes: string[] = [];
        updatedStudents.forEach((student) => {
          if (!classes.includes(student.class_name)) {
            classes.push(student.class_name);
          }
        });
        setAvailableClasses(classes.sort());
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression de l\'étudiant');
      }
    }
  };

  const applyFilters = () => {
    if (filters.class_name) {
      loadStudentsByClass(filters.class_name);
    } else {
      loadStudents();
    }
  };

  const resetFilters = () => {
    setFilters({ class_name: '', searchTerm: '' });
    loadStudents();
  };

  const columns = [
    {
      key: 'full_name' as keyof Student,
      header: 'Nom complet',
      render: (value: string) => (
        <div className="flex items-center">
          <User className="w-4 h-4 mr-2 text-gray-400" />
          <span className="font-medium text-gray-900">{value}</span>
        </div>
      ),
    },
    {
      key: 'student_card_id' as keyof Student,
      header: 'Carte étudiant',
      render: (value: string) => (
        <div className="flex items-center">
          <CreditCard className="w-4 h-4 mr-2 text-gray-400" />
          <span className="font-mono text-sm text-gray-600">{value}</span>
        </div>
      ),
    },
    {
      key: 'email' as keyof Student,
      header: 'Email',
      render: (value: string) => (
        <div className="flex items-center">
          <Mail className="w-4 h-4 mr-2 text-gray-400" />
          <span className="text-gray-900">{value}</span>
        </div>
      ),
    },
    {
      key: 'class_name' as keyof Student,
      header: 'Classe',
      render: (value: string) => (
        <div className="flex items-center">
          <GraduationCap className="w-4 h-4 mr-2 text-gray-400" />
          <Badge variant="info">{value}</Badge>
        </div>
      ),
    },
    {
      key: 'id' as keyof Student,
      header: 'Actions',
      render: (_: any, student: Student) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleViewDetails(student);
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
              handleEdit(student);
            }}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(student);
            }}
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.full_name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                         student.student_card_id.toLowerCase().includes(filters.searchTerm.toLowerCase());
    const matchesClass = !filters.class_name || student.class_name === filters.class_name;
    
    return matchesSearch && matchesClass;
  });

  const studentStats = {
    total: students.length,
    classes: availableClasses.length,
    recentRegistrations: students.filter(s => {
      const registrationDate = new Date(s.registered_at);
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      return registrationDate > lastWeek;
    }).length,
  };

  return (
    <Layout title="Gestion des étudiants">
      <Card>
        <div className="space-y-4">
          {/* Header avec recherche et boutons */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Rechercher un étudiant..."
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
                setEditingStudent(null);
                setFormData({ 
                  full_name: '', 
                  student_card_id: '', 
                  email: '', 
                  class_name: '', 
                  phone_number: '', 
                  user_id: '' 
                });
                setIsModalOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouvel étudiant
            </Button>
          </div>

          {/* Filtres avancés */}
          {showFilters && (
            <Card className="bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Classe
                  </label>
                  <select
                    value={filters.class_name}
                    onChange={(e) => setFilters({ ...filters, class_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Toutes les classes</option>
                    {availableClasses.map(className => (
                      <option key={className} value={className}>{className}</option>
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
                  <UsersIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-900">Total Étudiants</p>
                  <p className="text-2xl font-bold text-blue-600">{studentStats.total}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <GraduationCap className="w-5 h-5 text-purple-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-purple-900">Classes</p>
                  <p className="text-2xl font-bold text-purple-600">{studentStats.classes}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-900">Inscriptions récentes</p>
                  <p className="text-2xl font-bold text-green-600">{studentStats.recentRegistrations}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-orange-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-orange-900">Moyenne/Classe</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {studentStats.classes > 0 ? Math.round(studentStats.total / studentStats.classes) : 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Résumé des filtres */}
        <div className="mb-4 text-sm text-gray-600">
          Affichage de {filteredStudents.length} étudiant(s) sur {students.length} total
          {filters.class_name && ` • Classe: ${filters.class_name}`}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Chargement...</p>
          </div>
        ) : (
          <Table data={filteredStudents} columns={columns} />
        )}
      </Card>

      {/* Modal de formulaire d'étudiant */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStudent ? 'Modifier l\'étudiant' : 'Nouvel étudiant'}
        actions={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" form="student-form">
              {editingStudent ? 'Mettre à jour' : 'Créer'}
            </Button>
          </>
        }
      >
        <form id="student-form" onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nom complet"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            required
          />
          
          <Input
            label="Carte étudiant"
            value={formData.student_card_id}
            onChange={(e) => setFormData({ ...formData, student_card_id: e.target.value })}
            placeholder="Ex: STU001"
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
            label="Classe"
            value={formData.class_name}
            onChange={(e) => setFormData({ ...formData, class_name: e.target.value })}
            placeholder="Ex: L3 Informatique"
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
            label="ID Utilisateur"
            value={formData.user_id}
            onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
            placeholder="Ex: user123"
            required
          />
        </form>
      </Modal>

      {/* Modal de détails de l'étudiant */}
      {selectedStudent && (
        <StudentDetail
          student={selectedStudent}
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedStudent(null);
          }}
        />
      )}
    </Layout>
  );
};
export default Students;