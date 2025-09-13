/**
 * Contextual Navigation - Smart navigation suggestions based on user context
 * Part of Phase 3: Brukeropplevelse-optimalisering
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link, useLocation } from 'react-router-dom';
import { 
  ArrowRight, 
  TrendingUp, 
  Clock, 
  Star,
  Navigation,
  Zap,
  Users,
  Home,
  FileText,
  Settings
} from 'lucide-react';
import { useModuleNavigation } from '@/hooks/useModuleNavigation';
import { useAuth } from '@/modules/auth/hooks';
import { useNavigationPreferences } from '@/hooks/navigation/useNavigationPreferences';
import { cn } from '@/lib/utils';

interface ContextualSuggestion {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  reason: string;
  priority: number;
  category: 'workflow' | 'completion' | 'discovery' | 'maintenance';
}

export const ContextualNavigation: React.FC = () => {
  const location = useLocation();
  const { profile } = useAuth();
  const userRole = profile?.role;
  const { navigation } = useModuleNavigation();
  const { preferences } = useNavigationPreferences();

  // Generate contextual suggestions based on current path and user behavior
  const generateSuggestions = (): ContextualSuggestion[] => {
    const suggestions: ContextualSuggestion[] = [];
    const currentPath = location.pathname;

    // Context-based suggestions
    if (currentPath.includes('/dashboard')) {
      suggestions.push({
        id: 'from-dashboard-to-properties',
        title: 'Administrer eiendommer',
        description: 'Legg til eller redigér dine eiendommer',
        href: '/properties',
        icon: Home,
        reason: 'Naturlig neste steg fra dashboard',
        priority: 8,
        category: 'workflow'
      });

      suggestions.push({
        id: 'from-dashboard-to-leads',
        title: 'Sjekk forespørsler',
        description: 'Se nye leads og forespørsler',
        href: '/leads',
        icon: TrendingUp,
        reason: 'Ofte besøkt fra dashboard',
        priority: 7,
        category: 'workflow'
      });
    }

    if (currentPath.includes('/properties')) {
      suggestions.push({
        id: 'from-properties-to-documents',
        title: 'Last opp dokumenter',
        description: 'Legg til dokumenter for dine eiendommer',
        href: '/properties?tab=documents',
        icon: FileText,
        reason: 'Kompletér eiendomsinformasjon',
        priority: 9,
        category: 'completion'
      });

      suggestions.push({
        id: 'from-properties-to-maintenance',
        title: 'Planlegg vedlikehold',
        description: 'Sett opp vedlikeholdsplaner',
        href: '/properties?tab=maintenance',
        icon: Settings,
        reason: 'Viktig for eiendomsforvaltning',
        priority: 8,
        category: 'workflow'
      });
    }

    if (currentPath.includes('/leads')) {
      suggestions.push({
        id: 'from-leads-to-analytics',
        title: 'Analyser ytelse',
        description: 'Se hvordan dine leads presterer',
        href: '/analytics',
        icon: TrendingUp,
        reason: 'Forbedre lead-generering',
        priority: 7,
        category: 'discovery'
      });
    }

    // Role-based suggestions
    if (userRole === 'company') {
      suggestions.push({
        id: 'company-pipeline',
        title: 'Provider Pipeline',
        description: 'Administrer dine tjenestepipeliner',
        href: '/provider-pipeline',
        icon: Users,
        reason: 'Viktig for bedriftsbrukere',
        priority: 8,
        category: 'workflow'
      });
    }

    // Discovery suggestions - less visited but potentially valuable
    const lessVisitedPaths = navigation.primary.filter(item => 
      !preferences.recentRoutes.includes(item.href) &&
      !preferences.favoriteRoutes.includes(item.href)
    );

    lessVisitedPaths.slice(0, 2).forEach((item, index) => {
      suggestions.push({
        id: `discovery-${item.href}`,
        title: `Utforsk ${item.title}`,
        description: item.description || `Oppdag funksjoner i ${item.title}`,
        href: item.href,
        icon: Zap,
        reason: 'Ny funksjonalitet å utforske',
        priority: 5 - index,
        category: 'discovery'
      });
    });

    // Maintenance suggestions - settings, profile updates, etc.
    if (!currentPath.includes('/account') && !currentPath.includes('/profile')) {
      suggestions.push({
        id: 'profile-maintenance',
        title: 'Oppdater profil',
        description: 'Hold profilen din oppdatert',
        href: '/account',
        icon: Settings,
        reason: 'Regelmessig vedlikehold',
        priority: 4,
        category: 'maintenance'
      });
    }

    return suggestions
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 6); // Max 6 suggestions
  };

  const suggestions = generateSuggestions();

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'workflow': return ArrowRight;
      case 'completion': return Star;
      case 'discovery': return Zap;
      case 'maintenance': return Clock;
      default: return Navigation;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'workflow': return 'bg-blue-500/10 text-blue-600 border-blue-200';
      case 'completion': return 'bg-green-500/10 text-green-600 border-green-200';
      case 'discovery': return 'bg-purple-500/10 text-purple-600 border-purple-200';
      case 'maintenance': return 'bg-orange-500/10 text-orange-600 border-orange-200';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-200';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'workflow': return 'Arbeidsflyt';
      case 'completion': return 'Komplettering';
      case 'discovery': return 'Utforsk';
      case 'maintenance': return 'Vedlikehold';
      default: return 'Forslag';
    }
  };

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Navigation className="h-5 w-5" />
          Foreslått for deg
        </CardTitle>
        <CardDescription>
          Smarte navigasjonsforslag basert på hvor du er og hva du gjør
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {suggestions.map((suggestion) => {
            const Icon = suggestion.icon;
            const CategoryIcon = getCategoryIcon(suggestion.category);
            
            return (
              <div
                key={suggestion.id}
                className="group relative overflow-hidden rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <Button
                  asChild
                  variant="ghost"
                  className="w-full h-auto p-4 justify-start text-left"
                >
                  <Link to={suggestion.href}>
                    <div className="flex items-start gap-3 w-full">
                      <div className="flex-shrink-0">
                        <Icon className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm group-hover:text-foreground transition-colors">
                            {suggestion.title}
                          </h4>
                        </div>
                        
                        <p className="text-xs text-muted-foreground mb-2">
                          {suggestion.description}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant="outline" 
                              className={cn(
                                "text-xs px-2 py-0.5 border",
                                getCategoryColor(suggestion.category)
                              )}
                            >
                              <CategoryIcon className="h-2.5 w-2.5 mr-1" />
                              {getCategoryLabel(suggestion.category)}
                            </Badge>
                          </div>
                          
                          <div className="text-xs text-muted-foreground">
                            {suggestion.reason}
                          </div>
                        </div>
                      </div>
                      
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </Link>
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};