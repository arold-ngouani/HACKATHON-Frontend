// src/components/access-cards/AccessCardForm.tsx
import React from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import type { User } from '../../types';

interface AccessCardFormData {
  card_number: string;
  status: 'active' | 'lost' | 'disabled';
  user_id: string;
}

interface AccessCardFormProps {
  formData: AccessCardFormData;
  setFormData: React.Dispatch<React.SetStateAction<AccessCardFormData>>;
  users: User[];
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isEditing: boolean;
  loading?: boolean;
}

export const AccessCardForm: React.FC<AccessCardFormProps> = ({
  formData,
  setFormData,
  users,
  onSubmit,
  onCancel,
  isEditing,
  loading = false
}) => {
  const generateCardNumber = () => {
    const prefix = 'AC';
    const number = Math.floor(100000 + Math.random() * 900000);
    setFormData({ ...formData, card_number: `${prefix}${number}` });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="flex items-end space-x-2">
        <div className="flex-1">
          <Input
            label="Numéro de carte"
            type="text"
            value={formData.card_number}
            onChange={(e) => setFormData({ ...formData, card_number: e.target.value })}
            placeholder="AC123456"
            required
          />
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={generateCardNumber}
          disabled={loading}
          className="mb-0"
        >
          Générer
        </Button>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Utilisateur *
        </label>
        <select
          value={formData.user_id}
          onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
          className="input"
          required
          disabled={loading}
        >
          <option value="">Sélectionner un utilisateur</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.email} ({
                user.role === 'admin' ? 'Administrateur' : 
                user.role === 'student' ? 'Étudiant' : 
                'Professeur'
              })
            </option>
          ))}
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Statut *
        </label>
        <select
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
          className="input"
          required
          disabled={loading}
        >
          <option value="active">Active</option>
          <option value="disabled">Désactivée</option>
          <option value="lost">Perdue</option>
        </select>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Annuler
        </Button>
        <Button
          type="submit"
          disabled={loading}
        >
          {loading ? 'Sauvegarde...' : (isEditing ? 'Mettre à jour' : 'Créer')}
        </Button>
      </div>
    </form>
  );
};