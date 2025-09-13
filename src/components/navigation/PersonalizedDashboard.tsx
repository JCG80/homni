/**
 * PersonalizedDashboard - Dynamic dashboard based on user behavior and role
 * Part of Phase 3B Step 3: Unified Navigation Experience
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { useNavigationContext } from '@/hooks/useNavigationContext';
import { NavigationItem } from '@/types/consolidated-types';
import { motion } from 'framer-motion';
import { 
  Clock, 
  Star, 
  TrendingUp, 
  BarChart3, 
  Settings, 
  Users,
  FileText,
  Home,
  Plus
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PersonalizedDashboardProps {
  className?: string;
}

interface DashboardMetric {
  id: string;
  title: string;
  value: string | number;
  change?: number;
  icon: React.ComponentType<any>;
  color: string;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<any>;
  priority: number;
}

export const PersonalizedDashboard: React.FC<PersonalizedDashboardProps> = ({
  className = ''
}) => {
  const { role, isAuthenticated } = useAuth();
  const { preferences, getRecommendedRoutes, isFrequentRoute } = useNavigationContext();
  const { t } = useTranslation();
  
  const [metrics, setMetrics] = useState<DashboardMetric[]>([]);
  const [quickActions, setQuickActions] = useState<QuickAction[]>([]);
  const [recentActivity, setRecentActivity] = useState<NavigationItem[]>([]);

  // Generate role-specific metrics
  useEffect(() => {
    const generateMetrics = (): DashboardMetric[] => {
      switch (role) {
        case 'master_admin':
          return [
            {
              id: 'total_users',
              title: t('dashboard.metrics.totalUsers'),
              value: '1,234',
              change: 12,
              icon: Users,
              color: 'text-blue-600'
            },
            {
              id: 'system_health',
              title: t('dashboard.metrics.systemHealth'),
              value: '99.9%',
              change: 0.1,
              icon: TrendingUp,
              color: 'text-green-600'
            },
            {
              id: 'active_modules',
              title: t('dashboard.metrics.activeModules'),
              value: 15,
              icon: Settings,
              color: 'text-purple-600'
            }
          ];
        
        case 'admin':
          return [
            {
              id: 'leads_today',
              title: t('dashboard.metrics.leadsToday'),
              value: 23,
              change: 8,
              icon: TrendingUp,
              color: 'text-green-600'
            },
            {
              id: 'conversion_rate',
              title: t('dashboard.metrics.conversionRate'),
              value: '12.5%',
              change: 2.3,
              icon: BarChart3,
              color: 'text-blue-600'
            }
          ];
        
        case 'company':
          return [
            {
              id: 'my_leads',
              title: t('dashboard.metrics.myLeads'),
              value: 5,
              change: 2,
              icon: FileText,
              color: 'text-orange-600'
            },
            {
              id: 'profile_views',
              title: t('dashboard.metrics.profileViews'),
              value: 87,
              change: 15,
              icon: TrendingUp,
              color: 'text-blue-600'
            }
          ];
        
        default:
          return [
            {
              id: 'recent_activity',
              title: t('dashboard.metrics.recentActivity'),
              value: preferences.navigationHistory.length,
              icon: Clock,
              color: 'text-gray-600'
            }
          ];
      }
    };

    setMetrics(generateMetrics());
  }, [role, preferences, t]);

  // Generate personalized quick actions
  useEffect(() => {
    const generateQuickActions = (): QuickAction[] => {
      const actions: QuickAction[] = [];
      
      // Role-specific actions
      if (role === 'master_admin') {
        actions.push({
          id: 'system_settings',
          title: t('dashboard.quickActions.systemSettings'),
          description: t('dashboard.quickActions.systemSettingsDesc'),
          href: '/admin/system',
          icon: Settings,
          priority: 1
        });
      }
      
      if (role === 'admin' || role === 'master_admin') {
        actions.push({
          id: 'manage_leads',
          title: t('dashboard.quickActions.manageLeads'),
          description: t('dashboard.quickActions.manageLeadsDesc'),
          href: '/admin/leads',
          icon: FileText,
          priority: 2
        });
      }
      
      if (role === 'company') {
        actions.push({
          id: 'create_profile',
          title: t('dashboard.quickActions.createProfile'),
          description: t('dashboard.quickActions.createProfileDesc'),
          href: '/company/profile/create',
          icon: Plus,
          priority: 1
        });
      }
      
      // Universal actions
      actions.push({
        id: 'go_home',
        title: t('dashboard.quickActions.goHome'),
        description: t('dashboard.quickActions.goHomeDesc'),
        href: '/',
        icon: Home,
        priority: 3
      });
      
      return actions.sort((a, b) => a.priority - b.priority);
    };

    setQuickActions(generateQuickActions());
  }, [role, t]);

  // Get recent activity from navigation history
  useEffect(() => {
    const recent = preferences.navigationHistory
      .slice(-5)
      .reverse()
      .map(route => ({
        href: route,
        title: route.split('/').pop()?.replace('-', ' ') || route,
        icon: Clock
      }));
    
    setRecentActivity(recent);
  }, [preferences.navigationHistory]);

  if (!isAuthenticated) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">
            {t('dashboard.pleaseLogin')}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-6">
            <h1 className="text-2xl font-bold mb-2">
              {t('dashboard.welcome')} {role ? t(`roles.${role}`) : ''}!
            </h1>
            <p className="text-muted-foreground">
              {t('dashboard.personalizedExperience')}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Metrics Grid */}
      {metrics.length > 0 && (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {metrics.map((metric, index) => (
            <Card key={metric.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {metric.title}
                    </p>
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold">
                        {metric.value}
                      </span>
                      {metric.change !== undefined && (
                        <Badge 
                          variant={metric.change >= 0 ? "default" : "destructive"}
                          className="text-xs"
                        >
                          {metric.change >= 0 ? '+' : ''}{metric.change}%
                        </Badge>
                      )}
                    </div>
                  </div>
                  <metric.icon className={`h-8 w-8 ${metric.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <span>{t('dashboard.quickActions.title')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {quickActions.map((action) => (
                <Button
                  key={action.id}
                  variant="ghost"
                  className="w-full justify-start h-auto p-3"
                  asChild
                >
                  <a href={action.href}>
                    <action.icon className="h-5 w-5 mr-3 text-primary" />
                    <div className="text-left">
                      <div className="font-medium">{action.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {action.description}
                      </div>
                    </div>
                  </a>
                </Button>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-blue-500" />
                <span>{t('dashboard.recentActivity.title')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentActivity.length > 0 ? (
                <div className="space-y-2">
                  {recentActivity.map((item, index) => (
                    <div
                      key={`${item.href}-${index}`}
                      className="flex items-center space-x-2 text-sm py-2 border-b border-border/50 last:border-0"
                    >
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="capitalize">
                        {item.title}
                      </span>
                      {isFrequentRoute(item.href) && (
                        <Badge variant="secondary" className="text-xs">
                          {t('dashboard.frequent')}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  {t('dashboard.noRecentActivity')}
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};