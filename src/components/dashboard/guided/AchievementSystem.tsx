import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Trophy, 
  Star, 
  Crown, 
  Target,
  Zap,
  Gift,
  X,
  Sparkles,
  Medal,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  category: 'onboarding' | 'activity' | 'milestone' | 'special';
  points: number;
  unlocked: boolean;
  unlockedAt?: Date;
  progress?: {
    current: number;
    target: number;
  };
}

interface AchievementSystemProps {
  userStats: {
    totalRequests: number;
    completedRequests: number;
    hasProperties: boolean;
    profileCompleted: boolean;
    daysActive: number;
  };
  onAchievementUnlocked?: (achievement: Achievement) => void;
}

/**
 * Achievement system to celebrate user milestones and encourage engagement
 */
export const AchievementSystem: React.FC<AchievementSystemProps> = ({
  userStats,
  onAchievementUnlocked
}) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [newUnlocked, setNewUnlocked] = useState<Achievement[]>([]);
  const [showNotification, setShowNotification] = useState(false);

  // Define all possible achievements
  const allAchievements: Achievement[] = [
    {
      id: 'first-request',
      title: 'Første forespørsel',
      description: 'Sendt din første tjeneste forespørsel',
      icon: Star,
      category: 'onboarding',
      points: 10,
      unlocked: userStats.totalRequests > 0
    },
    {
      id: 'profile-complete',
      title: 'Profilert',
      description: 'Fullført din brukerprofil',
      icon: Trophy,
      category: 'onboarding',
      points: 15,
      unlocked: userStats.profileCompleted
    },
    {
      id: 'property-owner',
      title: 'Eiendomseier',
      description: 'Registrert din første eiendom',
      icon: Crown,
      category: 'onboarding',
      points: 20,
      unlocked: userStats.hasProperties
    },
    {
      id: 'active-user',
      title: 'Aktiv bruker',
      description: 'Brukt Homni i 7 dager',
      icon: Zap,
      category: 'activity',
      points: 25,
      unlocked: userStats.daysActive >= 7,
      progress: {
        current: Math.min(userStats.daysActive, 7),
        target: 7
      }
    },
    {
      id: 'request-machine',
      title: 'Forespørsel maskin',
      description: 'Sendt 5 forespørsler',
      icon: Target,
      category: 'activity',
      points: 30,
      unlocked: userStats.totalRequests >= 5,
      progress: {
        current: Math.min(userStats.totalRequests, 5),
        target: 5
      }
    },
    {
      id: 'deal-maker',
      title: 'Avtale mester',
      description: 'Fullført din første avtale',
      icon: Medal,
      category: 'milestone',
      points: 50,
      unlocked: userStats.completedRequests > 0
    },
    {
      id: 'power-user',
      title: 'Superbruker',
      description: 'Fullført 10 avtaler',
      icon: Award,
      category: 'milestone',
      points: 100,
      unlocked: userStats.completedRequests >= 10,
      progress: {
        current: Math.min(userStats.completedRequests, 10),
        target: 10
      }
    }
  ];

  useEffect(() => {
    const previousAchievements = achievements.filter(a => a.unlocked);
    const currentAchievements = allAchievements.map(achievement => ({
      ...achievement,
      unlockedAt: achievement.unlocked && !previousAchievements.find(p => p.id === achievement.id)
        ? new Date()
        : previousAchievements.find(p => p.id === achievement.id)?.unlockedAt
    }));

    // Find newly unlocked achievements
    const newlyUnlocked = currentAchievements.filter(achievement => 
      achievement.unlocked && 
      !previousAchievements.find(p => p.id === achievement.id)
    );

    setAchievements(currentAchievements);

    if (newlyUnlocked.length > 0) {
      setNewUnlocked(newlyUnlocked);
      setShowNotification(true);
      
      // Call callback for each unlocked achievement
      newlyUnlocked.forEach(achievement => {
        onAchievementUnlocked?.(achievement);
      });
    }
  }, [userStats]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'onboarding': return Star;
      case 'activity': return Zap;
      case 'milestone': return Trophy;
      case 'special': return Crown;
      default: return Star;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'onboarding': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'activity': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'milestone': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'special': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const totalPoints = achievements.filter(a => a.unlocked).reduce((sum, a) => sum + a.points, 0);
  const unlockedCount = achievements.filter(a => a.unlocked).length;

  const dismissNotification = () => {
    setShowNotification(false);
    setNewUnlocked([]);
  };

  return (
    <>
      {/* Achievement Summary */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span className="font-medium">Prestasjoner</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{unlockedCount}/{achievements.length}</Badge>
              <Badge variant="outline">{totalPoints} poeng</Badge>
            </div>
          </div>

          {/* Recent Achievements */}
          <div className="space-y-2">
            {achievements
              .filter(a => a.unlocked)
              .sort((a, b) => (b.unlockedAt?.getTime() || 0) - (a.unlockedAt?.getTime() || 0))
              .slice(0, 3)
              .map(achievement => {
                const CategoryIcon = getCategoryIcon(achievement.category);
                return (
                  <div key={achievement.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
                      <achievement.icon className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{achievement.title}</span>
                        <Badge className={getCategoryColor(achievement.category)} variant="secondary">
                          +{achievement.points}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {achievement.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            
            {unlockedCount === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                <Trophy className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Fullfør handlinger for å låse opp prestasjoner</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Achievement Unlock Notification */}
      <AnimatePresence>
        {showNotification && newUnlocked.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.8 }}
            className="fixed bottom-4 right-4 z-50 max-w-sm"
          >
            <Card className="border-2 border-yellow-200 dark:border-yellow-800 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 0.5, repeat: 3 }}
                    >
                      <Gift className="w-5 h-5 text-yellow-600" />
                    </motion.div>
                    <span className="font-semibold text-yellow-800 dark:text-yellow-200">
                      Prestasjon låst opp!
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={dismissNotification}
                    className="h-6 w-6 p-0"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>

                {newUnlocked.map(achievement => (
                  <motion.div
                    key={achievement.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="flex items-center gap-3 p-3 bg-white/50 dark:bg-black/20 rounded-lg mb-2 last:mb-0"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
                      <achievement.icon className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{achievement.title}</span>
                        <Badge variant="secondary" className="text-xs">
                          +{achievement.points}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {achievement.description}
                      </p>
                    </div>
                    <div className="text-yellow-600">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};