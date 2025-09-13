import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MoreVertical, 
  Eye, 
  EyeOff, 
  TrendingUp,
  ArrowUpRight,
  Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

interface AdaptiveWidget {
  id: string;
  type: string;
  title: string;
  priority: number;
  isVisible: boolean;
  lastInteracted: Date | null;
  interactionCount: number;
  data?: any;
}

interface AdaptiveWidgetContainerProps {
  userId: string;
  userBehavior: {
    primaryActions: string[];
    preferredContent: string[];
    interactionPatterns: any;
  };
  children: React.ReactNode;
}

/**
 * Adaptive widget container that learns from user behavior and adjusts content
 */
export const AdaptiveWidgetContainer: React.FC<AdaptiveWidgetContainerProps> = ({
  userId,
  userBehavior,
  children
}) => {
  const [widgets, setWidgets] = useState<AdaptiveWidget[]>([]);
  const [isCustomizing, setIsCustomizing] = useState(false);

  useEffect(() => {
    loadUserWidgetPreferences();
  }, [userId]);

  const loadUserWidgetPreferences = async () => {
    try {
      // Load user widget preferences
      const { data: preferences } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .eq('preference_type', 'widget_layout')
        .single();

      if (preferences) {
        const widgetsData = preferences.preference_data as any;
        setWidgets(widgetsData?.widgets || []);
      } else {
        // Initialize default adaptive widgets based on user behavior
        initializeAdaptiveWidgets();
      }
    } catch (error) {
      console.error('Error loading widget preferences:', error);
      initializeAdaptiveWidgets();
    }
  };

  const initializeAdaptiveWidgets = () => {
    const defaultWidgets: AdaptiveWidget[] = [
      {
        id: 'requests-summary',
        type: 'summary',
        title: 'Mine forespørsler',
        priority: 1,
        isVisible: true,
        lastInteracted: null,
        interactionCount: 0
      },
      {
        id: 'property-overview',
        type: 'property',
        title: 'Mine eiendommer',
        priority: 2,
        isVisible: userBehavior.preferredContent.includes('properties'),
        lastInteracted: null,
        interactionCount: 0
      },
      {
        id: 'quick-actions',
        type: 'actions',
        title: 'Hurtighandlinger',
        priority: 3,
        isVisible: true,
        lastInteracted: null,
        interactionCount: 0
      },
      {
        id: 'achievements',
        type: 'gamification',
        title: 'Prestasjoner',
        priority: 4,
        isVisible: userBehavior.preferredContent.includes('achievements'),
        lastInteracted: null,
        interactionCount: 0
      },
      {
        id: 'insights',
        type: 'analytics',
        title: 'Personlige innsikter',
        priority: 5,
        isVisible: userBehavior.preferredContent.includes('analytics'),
        lastInteracted: null,
        interactionCount: 0
      }
    ];

    setWidgets(defaultWidgets);
    saveWidgetPreferences(defaultWidgets);
  };

  const saveWidgetPreferences = async (widgetsToSave: AdaptiveWidget[]) => {
    try {
        await supabase
          .from('user_preferences')
          .upsert({
            user_id: userId,
            preference_type: 'widget_layout',
            preference_data: { widgets: widgetsToSave } as any
          });
    } catch (error) {
      console.error('Error saving widget preferences:', error);
    }
  };

  const handleWidgetInteraction = async (widgetId: string, interactionType: string) => {
    // Track user interaction for learning
    try {
      await supabase
        .from('user_behavior_events')
        .insert({
          user_id: userId,
          event_type: interactionType,
          event_target: `widget_${widgetId}`,
          event_context: { widget_type: widgets.find(w => w.id === widgetId)?.type }
        });

      // Update widget interaction count
      setWidgets(prev => prev.map(widget => 
        widget.id === widgetId 
          ? { 
              ...widget, 
              lastInteracted: new Date(),
              interactionCount: widget.interactionCount + 1
            }
          : widget
      ));
    } catch (error) {
      console.error('Error tracking widget interaction:', error);
    }
  };

  const toggleWidgetVisibility = (widgetId: string) => {
    const widget = widgets.find(w => w.id === widgetId);
    if (!widget) return;
    
    const updatedWidgets = widgets.map(w =>
      w.id === widgetId
        ? { ...w, isVisible: !w.isVisible }
        : w
    );
    setWidgets(updatedWidgets);
    saveWidgetPreferences(updatedWidgets);
    handleWidgetInteraction(widgetId, !widget.isVisible ? 'show' : 'hide');
  };

  const getAdaptivePriority = (widget: AdaptiveWidget) => {
    // Calculate dynamic priority based on user behavior
    let score = widget.priority;
    
    // Boost score based on recent interactions
    if (widget.lastInteracted) {
      const daysSinceInteraction = (Date.now() - widget.lastInteracted.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceInteraction < 7) {
        score -= Math.floor(daysSinceInteraction); // Recent interaction = higher priority
      }
    }
    
    // Boost score based on total interactions
    score -= Math.floor(widget.interactionCount / 5);
    
    // Adjust based on user behavior patterns
    if (userBehavior.primaryActions.some(action => widget.type.includes(action))) {
      score -= 2;
    }
    
    return Math.max(1, score);
  };

  const sortedWidgets = widgets
    .filter(widget => widget.isVisible)
    .sort((a, b) => getAdaptivePriority(a) - getAdaptivePriority(b));

  return (
    <div className="space-y-6">
      {/* Customization Panel */}
      {isCustomizing && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="p-4 bg-muted rounded-lg"
        >
          <h3 className="font-semibold mb-4">Tilpass ditt dashboard</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {widgets.map((widget) => (
              <div key={widget.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-sm font-medium">{widget.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {widget.interactionCount}
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleWidgetVisibility(widget.id)}
                    className="h-6 w-6 p-0"
                  >
                    {widget.isVisible ? (
                      <Eye className="w-3 h-3" />
                    ) : (
                      <EyeOff className="w-3 h-3" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Widget Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Tilpasset for deg</span>
          <Badge variant="secondary" className="text-xs">
            AI-drevet
          </Badge>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsCustomizing(!isCustomizing)}
          className="flex items-center gap-2"
        >
          <Settings className="w-3 h-3" />
          {isCustomizing ? 'Ferdig' : 'Tilpass'}
        </Button>
      </div>

      {/* Adaptive Widget Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="wait">
          {sortedWidgets.map((widget, index) => (
            <motion.div
              key={widget.id}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: index * 0.1 }}
              className="relative group"
              onClick={() => handleWidgetInteraction(widget.id, 'view')}
            >
              {/* Adaptive Priority Indicator */}
              {getAdaptivePriority(widget) <= 2 && (
                <div className="absolute -top-2 -right-2 z-10">
                  <Badge className="bg-primary text-primary-foreground flex items-center gap-1 text-xs">
                    <ArrowUpRight className="w-2 h-2" />
                    Populær
                  </Badge>
                </div>
              )}

              {/* Widget Content */}
              <Card className="h-full transition-all duration-200 group-hover:shadow-md">
                <CardContent className="p-0">
                  {children}
                </CardContent>
              </Card>

              {/* Widget Options */}
              <Button
                size="sm"
                variant="ghost"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleWidgetVisibility(widget.id);
                }}
              >
                <MoreVertical className="w-3 h-3" />
              </Button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Learning Indicator */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          Dashboard tilpasses automatisk basert på din bruk
        </p>
      </div>
    </div>
  );
};