// src/components/access-logs/AccessSimulator.tsx
import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { 
  Play, 
  Settings, 
  MapPin, 
  CreditCard, 
  User,
  CheckCircle,
  XCircle,
  Eye,
  Loader2,
  AlertCircle,
  Zap
} from 'lucide-react';
import type { AccessCard, User as UserType } from '../../types';
import { apiEndpoints } from '../../services/api';
import { COMMON_LOCATIONS } from '../../utils/constants';

interface AccessSimulatorProps {
  onAccessLogged: () => void;
  accessCards: AccessCard[];
  users: UserType[];
}

interface SimulationResult {
  success: boolean;
  message: string;
  logId?: string;
  timestamp?: string;
}

export const AccessSimulator: React.FC<AccessSimulatorProps> = ({
  onAccessLogged,
  accessCards,
  users
}) => {
  const [selectedCard, setSelectedCard] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedAccessType, setSelectedAccessType] = useState<'entry' | 'exit' | 'denied'>('entry');
  const [isSimulating, setIsSimulating] = useState(false);
  const [lastResult, setLastResult] = useState<SimulationResult | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const activeCards = accessCards.filter(card => card.status === 'active');

  const handleSimulation = async () => {
    if (!selectedCard || !selectedLocation) {
      setLastResult({
        success: false,
        message: 'Veuillez sélectionner une carte et une localisation.'
      });
      return;
    }

    const card = accessCards.find(c => c.id === selectedCard);
    if (!card) {
      setLastResult({
        success: false,
        message: 'Carte non trouvée.'
      });
      return;
    }

    setIsSimulating(true);
    setLastResult(null);

    try {
      const response = await apiEndpoints.accessLogs.simulateAccess(
        card.card_number,
        selectedLocation,
        selectedAccessType
      );

      setLastResult({
        success: true,
        message: `Accès ${selectedAccessType === 'entry' ? 'autorisé (Entrée)' : 
                  selectedAccessType === 'exit' ? 'autorisé (Sortie)' : 'refusé'} avec succès.`,
        logId: response.data.id,
        timestamp: response.data.accessed_at
      });

      // Actualiser les données après simulation
      onAccessLogged();

    } catch (error: any) {
      console.error('Erreur lors de la simulation:', error);
      setLastResult({
        success: false,
        message: error.response?.data?.detail || 'Erreur lors de la simulation de l\'accès.'
      });
    } finally {
      setIsSimulating(false);
    }
  };

  const getAccessTypeInfo = (type: string) => {
    switch (type) {
      case 'entry':
        return { label: 'Entrée', color: 'bg-green-100 text-green-800', icon: <CheckCircle className="w-4 h-4" /> };
      case 'exit':
        return { label: 'Sortie', color: 'bg-blue-100 text-blue-800', icon: <Eye className="w-4 h-4" /> };
      case 'denied':
        return { label: 'Accès refusé', color: 'bg-red-100 text-red-800', icon: <XCircle className="w-4 h-4" /> };
      default:
        return { label: type, color: 'bg-gray-100 text-gray-800', icon: <AlertCircle className="w-4 h-4" /> };
    }
  };

  const getSelectedCardInfo = () => {
    const card = accessCards.find(c => c.id === selectedCard);
    if (!card) return null;
    
    const user = users.find(u => u.id === card.user_id);
    return { card, user };
  };

  const simulateRandomAccess = async () => {
    if (activeCards.length === 0 || COMMON_LOCATIONS.length === 0) return;

    const randomCard = activeCards[Math.floor(Math.random() * activeCards.length)];
    const randomLocation = COMMON_LOCATIONS[Math.floor(Math.random() * COMMON_LOCATIONS.length)];
    const accessTypes: ('entry' | 'exit' | 'denied')[] = ['entry', 'exit', 'denied'];
    const randomAccessType = accessTypes[Math.floor(Math.random() * accessTypes.length)];

    setSelectedCard(randomCard.id);
    setSelectedLocation(randomLocation);
    setSelectedAccessType(randomAccessType);

    // Petite pause pour l'effet visuel
    setTimeout(() => {
      handleSimulation();
    }, 500);
  };

  const cardInfo = getSelectedCardInfo();

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-900">Simulateur d'accès</h3>
              <p className="text-sm text-blue-600">Simulez des tentatives d'accès pour tester le système</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <Settings className="w-4 h-4 mr-2" />
              {showAdvanced ? 'Simple' : 'Avancé'}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={simulateRandomAccess}
              disabled={isSimulating || activeCards.length === 0}
            >
              <Play className="w-4 h-4 mr-2" />
              Aléatoire
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configuration de la simulation */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 flex items-center">
              <Settings className="w-4 h-4 mr-2" />
              Configuration
            </h4>

            {/* Sélection de la carte */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <CreditCard className="w-4 h-4 inline mr-1" />
                Carte d'accès
              </label>
              <select
                value={selectedCard}
                onChange={(e) => setSelectedCard(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isSimulating}
              >
                <option value="">Sélectionner une carte...</option>
                {activeCards.map(card => {
                  const user = users.find(u => u.id === card.user_id);
                  return (
                    <option key={card.id} value={card.id}>
                      {card.card_number} {user && `- ${user.email}`}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Sélection de la localisation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Localisation
              </label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isSimulating}
              >
                <option value="">Sélectionner une localisation...</option>
                {COMMON_LOCATIONS.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>

            {/* Type d'accès */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type d'accès
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['entry', 'exit', 'denied'] as const).map(type => {
                  const info = getAccessTypeInfo(type);
                  return (
                    <button
                      key={type}
                      onClick={() => setSelectedAccessType(type)}
                      disabled={isSimulating}
                      className={`p-3 border rounded-lg text-sm font-medium transition-all ${
                        selectedAccessType === type
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-center space-x-1">
                        {info.icon}
                        <span>{info.label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Informations avancées */}
            {showAdvanced && cardInfo && (
              <div className="p-3 bg-white rounded-lg border border-gray-200">
                <h5 className="text-sm font-medium text-gray-900 mb-2">Informations de la carte</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Numéro :</span>
                    <span className="font-mono">{cardInfo.card.card_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Statut :</span>
                    <Badge variant={cardInfo.card.status === 'active' ? 'success' : 'danger'}>
                      {cardInfo.card.status}
                    </Badge>
                  </div>
                  {cardInfo.user && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Utilisateur :</span>
                        <span>{cardInfo.user.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Rôle :</span>
                        <Badge variant="default">{cardInfo.user.role}</Badge>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Bouton de simulation */}
            <Button
              onClick={handleSimulation}
              disabled={!selectedCard || !selectedLocation || isSimulating}
              className="w-full"
              size="lg"
            >
              {isSimulating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Simulation en cours...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Simuler l'accès
                </>
              )}
            </Button>
          </div>

          {/* Résultats */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              Résultat de la simulation
            </h4>

            {lastResult ? (
              <Card className={`${
                lastResult.success 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              } border-2`}>
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-full ${
                    lastResult.success ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {lastResult.success ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h5 className={`font-medium ${
                      lastResult.success ? 'text-green-900' : 'text-red-900'
                    }`}>
                      {lastResult.success ? 'Simulation réussie' : 'Simulation échouée'}
                    </h5>
                    <p className={`text-sm ${
                      lastResult.success ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {lastResult.message}
                    </p>
                    {lastResult.success && lastResult.logId && (
                      <div className="mt-2 text-xs text-gray-600">
                        <p>ID du log : <span className="font-mono">{lastResult.logId}</span></p>
                        {lastResult.timestamp && (
                          <p>Horodatage : {new Date(lastResult.timestamp).toLocaleString('fr-FR')}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="bg-gray-50 border-gray-200 border-2 border-dashed">
                <div className="text-center py-8">
                  <Play className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">
                    Configurez les paramètres et cliquez sur "Simuler l'accès" pour commencer
                  </p>
                </div>
              </Card>
            )}

            {/* Statistiques rapides */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white rounded-lg border border-gray-200">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{activeCards.length}</p>
                  <p className="text-xs text-gray-600">Cartes actives</p>
                </div>
              </div>
              <div className="p-3 bg-white rounded-lg border border-gray-200">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{COMMON_LOCATIONS.length}</p>
                  <p className="text-xs text-gray-600">Localisations</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Note d'information */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-medium">Note :</p>
              <p>Les simulations créent de vrais journaux d'accès dans le système. Utilisez cette fonctionnalité pour tester et démontrer le système de contrôle d'accès.</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};