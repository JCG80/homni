/**
 * Navigation Engagement Component
 * Provides contextual suggestions and user engagement features
 */

import React, { useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useEngagementMetrics } from '@/components/navigation/UserEngagementTracker';
import { useNavigationPreferences } from '@/hooks/navigation/useNavigationPreferences';
import { useAuth } from '@/modules/auth/hooks';
import { 
  TrendingUp, 
  Clock, 
  Star, 
  ArrowRight,
  Target,
  Zap
} from 'lucide-react';

interface NavigationEngagementProps {
  className?: string;
  maxSuggestions?: number;
}

export const NavigationEngagement: React.FC<NavigationEngagementProps> = ({
  className,
  maxSuggestions = 3
}) => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { preferences } = useNavigationPreferences();
  const { 
    mostVisitedRoutes, 
    navigationPatterns, 
    isLoading 
  } = useEngagementMetrics();

  // Generate contextual suggestions based on user behavior
  const suggestions = useMemo(() => {
    if (!isAuthenticated || isLoading) return [];

    const currentPath = location.pathname;
    const suggestions = [];

    // Frequent destinations from current location
    const frequentFromHere = navigationPatterns
      .filter(pattern => pattern.from === currentPath)
      .slice(0, maxSuggestions);

    frequentFromHere.forEach(pattern => {
      suggestions.push({
        id: `frequent-${pattern.to}`,
        title: getRouteTitle(pattern.to),
        href: pattern.to,
        type: 'frequent' as const,
        score: pattern.frequency,
        reason: `Besøkt ${pattern.frequency} ganger herfra`
      });
    });

    // Recently favorited items
    if (preferences.favoriteRoutes?.length) {
      preferences.favoriteRoutes.slice(0, maxSuggestions - suggestions.length).forEach(route => {
        if (!suggestions.find(s => s.href === route)) {
          suggestions.push({
            id: `favorite-${route}`,
            title: getRouteTitle(route),
            href: route,
            type: 'favorite' as const,
            score: 100,
            reason: 'Favorittside'
          });
        }
      });
    }

    // Most visited overall (if we need more suggestions)
    if (suggestions.length < maxSuggestions) {
      mostVisitedRoutes
        .filter(route => 
          route.route !== currentPath && 
          !suggestions.find(s => s.href === route.route)
        )
        .slice(0, maxSuggestions - suggestions.length)
        .forEach(route => {
          suggestions.push({
            id: `popular-${route.route}`,
            title: getRouteTitle(route.route),
            href: route.route,
            type: 'popular' as const,
            score: route.count,
            reason: `${route.count} besøk`
          });
        });
    }

    return suggestions.sort((a, b) => b.score - a.score);
  }, [
    location.pathname, 
    isAuthenticated, 
    isLoading, 
    navigationPatterns, 
    preferences.favoriteRoutes, 
    mostVisitedRoutes, 
    maxSuggestions
  ]);

  if (!isAuthenticated || isLoading || suggestions.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-gradient-to-r from-primary/5 via-background to-secondary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">
                  Foreslåtte sider
                </h3>
                <Badge variant="secondary" className="text-xs">
                  Smart
                </Badge>
              </div>

              <div className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <motion.div
                    key={suggestion.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Button
                      asChild
                      variant="ghost"
                      className="w-full justify-between h-auto p-3 group hover:bg-primary/10"
                    >
                      <Link to={suggestion.href}>
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0">
                            {suggestion.type === 'frequent' && (
                              <TrendingUp className="w-4 h-4 text-orange-500" />
                            )}
                            {suggestion.type === 'favorite' && (
                              <Star className="w-4 h-4 text-yellow-500" />
                            )}
                            {suggestion.type === 'popular' && (
                              <Zap className="w-4 h-4 text-blue-500" />
                            )}
                          </div>
                          
                          <div className="flex-1 text-left">
                            <div className="text-sm font-medium text-foreground group-hover:text-primary">
                              {suggestion.title}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {suggestion.reason}
                            </div>
                          </div>
                        </div>

                        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-1" />
                      </Link>
                    </Button>
                  </motion.div>
                ))}
              </div>

              {/* Usage stats */}
              <div className="mt-4 pt-3 border-t border-border/50">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{mostVisitedRoutes.length} sider besøkt</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    <span>{navigationPatterns.length} mønstre</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// Helper function to get user-friendly route titles
const getRouteTitle = (route: string): string => {
  const routeTitles: Record<string, string> = {
    '/': 'Hjem',
    '/dashboard': 'Dashboard',
    '/profile': 'Profil',
    '/settings': 'Innstillinger',
    '/lead-gen': 'Lead Generation',
    '/docs': 'Dokumenter',
    '/maintenance': 'Vedlikehold',
    '/listings': 'Annonser',
    '/admin': 'Administrasjon',
    '/help': 'Hjelp',
    '/contact': 'Kontakt'
  };

  return routeTitles[route] || 
    route.split('/').pop()?.replace(/-/g, ' ')?.replace(/^\w/, c => c.toUpperCase()) || 
    route;
};