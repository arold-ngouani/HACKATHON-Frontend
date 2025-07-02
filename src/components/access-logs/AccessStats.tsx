import React from 'react';
import { Card } from '../ui/Card';
import { Activity, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import type { AccessStats as AccessStatsType } from '../../types';

interface AccessStatsProps {
  stats: AccessStatsType;
}

export const AccessStats: React.FC<AccessStatsProps> = ({ stats }) => {
  const statsCards = [
    {
      title: 'Total des logs',
      value: stats.total_logs,
      icon: Activity,
      color: 'blue',
      description: 'Logs total enregistrés'
    },
    {
      title: 'Entrées',
      value: stats.entries,
      icon: TrendingUp,
      color: 'green',
      description: 'Accès autorisés (entrée)'
    },
    {
      title: 'Sorties',
      value: stats.exits,
      icon: TrendingDown,
      color: 'blue',
      description: 'Accès autorisés (sortie)'
    },
    {
      title: 'Refusés',
      value: stats.denied,
      icon: AlertTriangle,
      color: 'red',
      description: 'Accès refusés'
    }
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'green':
        return {
          icon: 'text-green-600',
          bg: 'bg-green-100',
          text: 'text-green-600'
        };
      case 'red':
        return {
          icon: 'text-red-600',
          bg: 'bg-red-100',
          text: 'text-red-600'
        };
      case 'blue':
      default:
        return {
          icon: 'text-blue-600',
          bg: 'bg-blue-100',
          text: 'text-blue-600'
        };
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsCards.map((stat, index) => {
        const Icon = stat.icon;
        const colors = getColorClasses(stat.color);
        
        return (
          <Card key={index} className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`h-12 w-12 ${colors.bg} rounded-lg flex items-center justify-center`}>
                  <Icon className={`h-6 w-6 ${colors.icon}`} />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-500 truncate">
                  {stat.title}
                </p>
                <p className={`text-2xl font-semibold ${colors.text}`}>
                  {stat.value.toLocaleString()}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {stat.description}
                </p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};