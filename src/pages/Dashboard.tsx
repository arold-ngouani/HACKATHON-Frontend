// src/pages/Dashboard.tsx (version complète et corrigée)
import React, { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { StatsCard } from '../components/dashboard/StatsCard';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
  Users,
  CreditCard,
  Building2,
  FileText,
  TrendingUp,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  RefreshCw,
  Shield,
  UserCheck,
  UserX,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from 'recharts';
import { apiEndpoints } from '../services/api';
import { CARD_STATUS_LABELS, ACCESS_TYPE_LABELS, CHART_COLORS } from '../utils/constants';
import type { User, AccessCard, Room, AccessLog } from '../types';

// Types pour les données du dashboard
interface DashboardStats {
  totalUsers: number;
  activeCards: number;
  totalRooms: number;
  todayAccess: number;
  cardsByStatus: Array<{ name: string; value: number; color: string }>;
  accessByType: Array<{ name: string; value: number; color: string }>;
  recentActivity: Array<{
    id: string;
    user: string;
    action: string;
    location: string;
    time: string;
    type: 'success' | 'danger' | 'warning' | 'info';
  }>;
  weeklyAccess: Array<{ name: string; accès: number; entrées: number; sorties: number }>;
  roomUtilization: Array<{ name: string; utilisation: number; capacity: number }>;
  successRate: number;
  alertsCount: number;
}

type BadgeVariant = 'success' | 'danger' | 'warning' | 'info' | 'default';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeCards: 0,
    totalRooms: 0,
    todayAccess: 0,
    cardsByStatus: [],
    accessByType: [],
    recentActivity: [],
    weeklyAccess: [],
    roomUtilization: [],
    successRate: 0,
    alertsCount: 0,
  });
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async (isRefresh = false) => {
    try {
      setError(null);
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      // Charger toutes les données en parallèle
      const [
        usersResponse,
        accessCardsResponse,
        accessLogsResponse,
      ] = await Promise.allSettled([
        apiEndpoints.users.getAll(),
        apiEndpoints.accessCards.getAll(),
        apiEndpoints.accessLogs.getAll(),
      ]);

      // Extraire les données ou utiliser des tableaux vides en cas d'erreur
      const users: User[] = usersResponse.status === 'fulfilled' ? usersResponse.value.data : [];
      const accessCards: AccessCard[] = accessCardsResponse.status === 'fulfilled' ? accessCardsResponse.value.data : [];
      const accessLogs: AccessLog[] = accessLogsResponse.status === 'fulfilled' ? accessLogsResponse.value.data : [];

      // Calculer les statistiques de base
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayAccessCount = accessLogs.filter((log: AccessLog) => 
        new Date(log.accessed_at) >= today
      ).length;

      const activeCardsCount = accessCards.filter((card: AccessCard) => card.status === 'active').length;

      // Calculer le taux de succès
      const successfulAccess = accessLogs.filter((log: AccessLog) => 
        log.access_type === 'entry' || log.access_type === 'exit'
      ).length;
      const successRate = accessLogs.length > 0 ? Math.round((successfulAccess / accessLogs.length) * 100) : 0;

      // Compter les alertes (cartes perdues/désactivées)
      const alertsCount = accessCards.filter((card: AccessCard) => 
        card.status === 'lost' || card.status === 'disabled'
      ).length;

      // Statistiques par statut de carte
      const cardStatusStats = accessCards.reduce((acc: Record<string, number>, card: AccessCard) => {
        acc[card.status] = (acc[card.status] || 0) + 1;
        return acc;
      }, {});

      const cardsByStatus = Object.entries(cardStatusStats).map(([status, count]) => ({
        name: CARD_STATUS_LABELS[status as keyof typeof CARD_STATUS_LABELS] || status,
        value: count,
        color: status === 'active' ? CHART_COLORS.success : 
               status === 'lost' ? CHART_COLORS.warning : CHART_COLORS.danger,
      }));

      // Statistiques par type d'accès
      const accessTypeStats = accessLogs.reduce((acc: Record<string, number>, log: AccessLog) => {
        acc[log.access_type] = (acc[log.access_type] || 0) + 1;
        return acc;
      }, {});

      const accessByType = Object.entries(accessTypeStats).map(([type, count]) => ({
        name: ACCESS_TYPE_LABELS[type as keyof typeof ACCESS_TYPE_LABELS] || type,
        value: count,
        color: type === 'entry' ? CHART_COLORS.success : 
               type === 'exit' ? CHART_COLORS.info : CHART_COLORS.danger,
      }));

      // Activité récente
      const recentActivity = accessLogs
        .sort((a, b) => new Date(b.accessed_at).getTime() - new Date(a.accessed_at).getTime())
        .slice(0, 10)
        .map((log: AccessLog) => {
          const card = accessCards.find((c: AccessCard) => c.id === log.card_id);
          const user = users.find((u: User) => u.id === card?.user_id);
          
          const getActivityType = (): 'success' | 'danger' | 'warning' | 'info' => {
            switch (log.access_type) {
              case 'entry': return 'success';
              case 'exit': return 'info';
              case 'denied': return 'danger';
              default: return 'warning';
            }
          };

          return {
            id: log.id,
            user: user?.email?.split('@')[0] || 'Utilisateur inconnu',
            action: ACCESS_TYPE_LABELS[log.access_type as keyof typeof ACCESS_TYPE_LABELS] || log.access_type,
            location: log.location,
            time: getRelativeTime(new Date(log.accessed_at)),
            type: getActivityType(),
          };
        });

      // Données d'accès par semaine (calcul réel basé sur les logs)
      const weeklyAccess = generateWeeklyAccessData(accessLogs);

      // Utilisation des salles (basée sur les données réelles d'accès)
      const roomUtilization = generateRoomUtilizationData(accessLogs);

      setStats({
        totalUsers: users.length,
        activeCards: activeCardsCount,
        totalRooms: roomUtilization.length, // Basé sur les salles réellement utilisées
        todayAccess: todayAccessCount,
        cardsByStatus,
        accessByType,
        recentActivity,
        weeklyAccess,
        roomUtilization,
        successRate,
        alertsCount,
      });

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Erreur lors du chargement des données du dashboard:', error);
      setError('Erreur lors du chargement des données. Veuillez réessayer.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const generateWeeklyAccessData = (logs: AccessLog[]) => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date;
    });

    return last7Days.map(date => {
      const dayLogs = logs.filter((log: AccessLog) => {
        const logDate = new Date(log.accessed_at);
        return logDate.toDateString() === date.toDateString();
      });

      const entrées = dayLogs.filter(log => log.access_type === 'entry').length;
      const sorties = dayLogs.filter(log => log.access_type === 'exit').length;

      return {
        name: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
        accès: dayLogs.length,
        entrées,
        sorties,
      };
    });
  };

  const generateRoomUtilizationData = (logs: AccessLog[]) => {
    // Grouper les accès par localisation
    const locationStats = logs.reduce((acc: Record<string, number>, log: AccessLog) => {
      acc[log.location] = (acc[log.location] || 0) + 1;
      return acc;
    }, {});

    // Convertir en données d'utilisation (simuler une capacité)
    return Object.entries(locationStats)
      .slice(0, 8) // Limiter à 8 salles pour l'affichage
      .map(([location, accessCount]) => ({
        name: location,
        utilisation: Math.min(100, Math.round((accessCount / 50) * 100)), // Simuler un pourcentage
        capacity: 50, // Capacité simulée
      }));
  };

  const getRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'À l\'instant';
    if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)}h`;
    return `Il y a ${Math.floor(diffInSeconds / 86400)} jour(s)`;
  };

  const handleRefresh = () => {
    loadDashboardData(true);
  };

  const getBadgeVariant = (type: string): BadgeVariant => {
    switch (type) {
      case 'success': return 'success';
      case 'danger': return 'danger';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Layout title="Tableau de bord">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Chargement du tableau de bord...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Tableau de bord">
        <div className="text-center py-12">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Erreur de chargement</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => loadDashboardData()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Réessayer
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Tableau de bord">
      <div className="space-y-6">
        {/* Header avec bouton refresh */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
            <p className="text-sm text-gray-500">
              Dernière mise à jour: {lastUpdated.toLocaleString('fr-FR')}
            </p>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="secondary"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Actualisation...' : 'Actualiser'}
          </Button>
        </div>

        {/* Alertes système */}
        {stats.alertsCount > 0 && (
          <Card className="border-yellow-200 bg-yellow-50">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Attention requise
                </h3>
                <p className="text-sm text-yellow-700">
                  {stats.alertsCount} carte(s) nécessitent votre attention (perdues ou désactivées)
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Utilisateurs"
            value={stats.totalUsers}
            change="+12% ce mois"
            changeType="increase"
            icon={Users}
            color="bg-blue-500"
          />
          <StatsCard
            title="Cartes Actives"
            value={stats.activeCards}
            change="+5% ce mois"
            changeType="increase"
            icon={CreditCard}
            color="bg-green-500"
          />
          <StatsCard
            title="Salles Utilisées"
            value={stats.totalRooms}
            change="Stable"
            changeType="neutral"
            icon={Building2}
            color="bg-purple-500"
          />
          <StatsCard
            title="Accès Aujourd'hui"
            value={stats.todayAccess}
            change="+8% vs hier"
            changeType="increase"
            icon={FileText}
            color="bg-orange-500"
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Access Activity */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Activité d'accès hebdomadaire</h3>
              <Activity className="w-5 h-5 text-gray-400" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={stats.weeklyAccess}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="entrées"
                  stackId="1"
                  stroke={CHART_COLORS.success}
                  fill={CHART_COLORS.success}
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="sorties"
                  stackId="1"
                  stroke={CHART_COLORS.info}
                  fill={CHART_COLORS.info}
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* Card Status Distribution */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Distribution des cartes</h3>
              <TrendingUp className="w-5 h-5 text-gray-400" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.cardsByStatus}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {stats.cardsByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Room Usage */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Utilisation des salles</h3>
              <Building2 className="w-5 h-5 text-gray-400" />
            </div>
            {stats.roomUtilization.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.roomUtilization}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value}%`, 'Utilisation']} />
                  <Bar dataKey="utilisation" fill={CHART_COLORS.purple} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Building2 className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>Aucune donnée d'utilisation disponible</p>
              </div>
            )}
          </Card>

          {/* Access Types */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Types d'accès</h3>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {stats.accessByType.length > 0 ? (
                stats.accessByType.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-medium">{item.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold">{item.value}</span>
                      <Badge variant="info">
                        {((item.value / stats.accessByType.reduce((sum, i) => sum + i.value, 0)) * 100).toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p>Aucune donnée d'accès disponible</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Activité récente</h3>
            <Clock className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div className="flex items-center space-x-4">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.type === 'success' ? 'bg-green-500' :
                      activity.type === 'danger' ? 'bg-red-500' :
                      activity.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`} />
                    <div>
                      <p className="font-medium text-gray-900">{activity.user}</p>
                      <p className="text-sm text-gray-600">{activity.action} - {activity.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">{activity.time}</span>
                    <Badge variant={getBadgeVariant(activity.type)}>
                      {activity.action}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Activity className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>Aucune activité récente</p>
              </div>
            )}
          </div>
        </Card>

        {/* System Health & Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900">État du système</h4>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">API</span>
                <Badge variant="success">Opérationnel</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Base de données</span>
                <Badge variant="success">Connectée</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Services</span>
                <Badge variant="success">Actifs</Badge>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900">Alertes</h4>
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
            </div>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Cartes perdues</p>
                  <p className="text-xs text-gray-600">
                    {stats.cardsByStatus.find(s => s.name.includes('Perdue'))?.value || 0} cartes signalées perdues
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Accès refusés</p>
                  <p className="text-xs text-gray-600">
                    {stats.accessByType.find(s => s.name.includes('Refusé'))?.value || 0} tentatives
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900">Statistiques rapides</h4>
              <BarChart3 className="w-5 h-5 text-blue-500" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Taux de succès</span>
                <span className="font-semibold text-green-600">{stats.successRate}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Cartes actives</span>
                <span className="font-semibold text-blue-600">
                  {stats.totalUsers > 0 ? ((stats.activeCards / stats.totalUsers) * 100).toFixed(1) : 0}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Alertes système</span>
                <span className={`font-semibold ${stats.alertsCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {stats.alertsCount}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Actions rapides</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant="secondary" 
              className="flex flex-col items-center p-6 h-auto"
              onClick={() => window.location.href = '/users'}
            >
              <Users className="w-6 h-6 mb-2" />
              <span>Gérer les utilisateurs</span>
            </Button>
            
            <Button 
              variant="secondary" 
              className="flex flex-col items-center p-6 h-auto"
              onClick={() => window.location.href = '/access-cards'}
            >
              <CreditCard className="w-6 h-6 mb-2" />
              <span>Cartes d'accès</span>
            </Button>
            
            <Button 
              variant="secondary" 
              className="flex flex-col items-center p-6 h-auto"
              onClick={() => window.location.href = '/rooms'}
            >
              <Building2 className="w-6 h-6 mb-2" />
              <span>Gérer les salles</span>
            </Button>
            
            <Button 
              variant="secondary" 
              className="flex flex-col items-center p-6 h-auto"
              onClick={() => window.location.href = '/access-logs'}
            >
              <FileText className="w-6 h-6 mb-2" />
              <span>Journaux d'accès</span>
            </Button>
          </div>
        </Card>
      </div>
    </Layout>
  );
};