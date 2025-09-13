import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Calendar, 
  Target, 
  CheckCircle2,
  Clock,
  Zap,
  ArrowRight,
  BarChart3
} from 'lucide-react';
import { motion } from 'framer-motion';

interface UserJourneyData {
  currentStage: 'new' | 'active' | 'engaged' | 'power_user';
  stageProgress: number;
  nextMilestone: {
    title: string;
    description: string;
    progress: number;
    target: number;
    estimatedDays?: number;
  };
  recentActivity: Array<{
    date: Date;
    action: string;
    impact: 'low' | 'medium' | 'high';
  }>;
  weeklyGoals: Array<{
    id: string;
    title: string;
    completed: boolean;
    progress: number;
  }>;
}

interface SmartProgressTrackerProps {
  userStats: {
    totalRequests: number;
    completedRequests: number;
    hasProperties: boolean;
    profileCompleted: boolean;
    daysActive: number;
    weeklyActivity: number;
  };
  onGoalAction: (goalId: string) => void;
}

/**
 * Smart progress tracker that adapts to user behavior and suggests next steps
 */
export const SmartProgressTracker: React.FC<SmartProgressTrackerProps> = ({
  userStats,
  onGoalAction
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'all'>('week');

  const calculateUserJourney = (): UserJourneyData => {
    let currentStage: UserJourneyData['currentStage'] = 'new';
    let stageProgress = 0;
    
    // Determine user stage based on activity
    if (userStats.completedRequests >= 3 && userStats.hasProperties) {
      currentStage = 'power_user';
      stageProgress = Math.min(100, (userStats.completedRequests / 10) * 100);
    } else if (userStats.totalRequests >= 3 && userStats.profileCompleted) {
      currentStage = 'engaged';
      stageProgress = Math.min(100, ((userStats.totalRequests + (userStats.hasProperties ? 2 : 0)) / 5) * 100);
    } else if (userStats.totalRequests >= 1) {
      currentStage = 'active';
      stageProgress = Math.min(100, ((userStats.totalRequests + (userStats.profileCompleted ? 1 : 0)) / 3) * 100);
    }

    // Determine next milestone based on current state
    let nextMilestone: UserJourneyData['nextMilestone'] = {
      title: 'Send første forespørsel',
      description: 'Start din Homni-reise ved å sende en forespørsel',
      progress: 0,
      target: 1
    };

    if (userStats.totalRequests > 0 && !userStats.profileCompleted) {
      nextMilestone = {
        title: 'Komplett profilen',
        description: 'Få bedre tilbud med fullstendig profil',
        progress: 0,
        target: 1
      };
    } else if (userStats.totalRequests > 0 && !userStats.hasProperties) {
      nextMilestone = {
        title: 'Legg til eiendom',
        description: 'Registrer eiendom for mer presise tilbud',
        progress: 0,
        target: 1
      };
    } else if (userStats.totalRequests < 5) {
      nextMilestone = {
        title: 'Send 5 forespørsler',
        description: 'Øk sjansene for å finne riktig tjenesteyteren',
        progress: userStats.totalRequests,
        target: 5,
        estimatedDays: Math.max(1, (5 - userStats.totalRequests) * 2)
      };
    } else if (userStats.completedRequests < 1) {
      nextMilestone = {
        title: 'Fullfør første avtale',
        description: 'Velg en tjenesteyteren og fullfør prosjektet',
        progress: 0,
        target: 1
      };
    }

    // Generate weekly goals based on user's current state
    const weeklyGoals = [
      {
        id: 'weekly-request',
        title: 'Send minst 1 forespørsel denne uken',
        completed: userStats.weeklyActivity >= 1,
        progress: Math.min(100, userStats.weeklyActivity * 100)
      },
      {
        id: 'profile-optimization',
        title: 'Optimaliser profilen din',
        completed: userStats.profileCompleted,
        progress: userStats.profileCompleted ? 100 : 50
      },
      {
        id: 'property-management',
        title: 'Administrer eiendomsinformasjon',
        completed: userStats.hasProperties,
        progress: userStats.hasProperties ? 100 : 0
      }
    ];

    return {
      currentStage,
      stageProgress,
      nextMilestone,
      recentActivity: [],
      weeklyGoals
    };
  };

  const journeyData = calculateUserJourney();

  const getStageInfo = (stage: UserJourneyData['currentStage']) => {
    switch (stage) {
      case 'new':
        return {
          title: 'Ny bruker',
          description: 'Velkommen til Homni! La oss hjelpe deg komme i gang.',
          color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
          icon: Calendar
        };
      case 'active':
        return {
          title: 'Aktiv bruker',
          description: 'Du er godt i gang med å bruke Homni!',
          color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
          icon: Zap
        };
      case 'engaged':
        return {
          title: 'Engasjert bruker',
          description: 'Du bruker Homni aktivt og får gode resultater.',
          color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
          icon: TrendingUp
        };
      case 'power_user':
        return {
          title: 'Superbruker',
          description: 'Du mestrer Homni og får maksimal nytte!',
          color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
          icon: Target
        };
    }
  };

  const stageInfo = getStageInfo(journeyData.currentStage);
  const StageIcon = stageInfo.icon;

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="w-4 h-4 text-primary" />
            Din fremgang
          </CardTitle>
          <Badge className={stageInfo.color}>
            <StageIcon className="w-3 h-3 mr-1" />
            {stageInfo.title}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Stage Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Nåværende nivå</span>
            <span className="text-sm text-muted-foreground">
              {Math.round(journeyData.stageProgress)}%
            </span>
          </div>
          <Progress value={journeyData.stageProgress} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {stageInfo.description}
          </p>
        </div>

        {/* Next Milestone */}
        <div className="p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/20">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h4 className="font-medium text-sm mb-1">{journeyData.nextMilestone.title}</h4>
              <p className="text-xs text-muted-foreground mb-3">
                {journeyData.nextMilestone.description}
              </p>
            </div>
            <Target className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">Fremgang</span>
              <span className="text-xs text-muted-foreground">
                {journeyData.nextMilestone.progress}/{journeyData.nextMilestone.target}
              </span>
            </div>
            <Progress 
              value={(journeyData.nextMilestone.progress / journeyData.nextMilestone.target) * 100} 
              className="h-1.5"
            />
            {journeyData.nextMilestone.estimatedDays && (
              <p className="text-xs text-muted-foreground">
                <Clock className="w-3 h-3 inline mr-1" />
                Estimert {journeyData.nextMilestone.estimatedDays} dager til mål
              </p>
            )}
          </div>
        </div>

        {/* Weekly Goals */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Ukentlige mål</span>
            <Badge variant="outline" className="text-xs">
              {journeyData.weeklyGoals.filter(g => g.completed).length}/{journeyData.weeklyGoals.length}
            </Badge>
          </div>
          
          <div className="space-y-2">
            {journeyData.weeklyGoals.map((goal) => (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-3 rounded-lg border bg-card"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    goal.completed 
                      ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {goal.completed ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : (
                      <Clock className="w-3 h-3" />
                    )}
                  </div>
                  <span className={`text-sm ${
                    goal.completed ? 'line-through text-muted-foreground' : 'text-foreground'
                  }`}>
                    {goal.title}
                  </span>
                </div>
                
                {!goal.completed && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onGoalAction(goal.id)}
                    className="h-6 px-2 text-xs"
                  >
                    Start
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                )}
              </motion.div>
            ))}
          </div>
        </div>

      </CardContent>
    </Card>
  );
};