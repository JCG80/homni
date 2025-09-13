import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  X, 
  Check, 
  AlertTriangle,
  Info,
  Trophy,
  Lightbulb,
  Clock,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { nb } from 'date-fns/locale';

interface SmartNotification {
  id: string;
  notification_type: string;
  title: string;
  content: string;
  priority: string;
  read_at: string | null;
  dismissed_at: string | null;
  expires_at: string | null;
  metadata: any;
  created_at: string;
}

interface SmartNotificationCenterProps {
  userId: string;
  onNotificationAction?: (notificationId: string, action: string) => void;
}

/**
 * Smart notification center that delivers contextually relevant notifications
 */
export const SmartNotificationCenter: React.FC<SmartNotificationCenterProps> = ({
  userId,
  onNotificationAction
}) => {
  const [notifications, setNotifications] = useState<SmartNotification[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
    
    // Set up real-time subscription for new notifications
    const subscription = supabase
      .channel('smart_notifications')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'smart_notifications',
          filter: `user_id=eq.${userId}`
        }, 
        (payload) => {
          setNotifications(prev => [payload.new as SmartNotification, ...prev]);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  const loadNotifications = async () => {
    try {
      const { data } = await supabase
        .from('smart_notifications')
        .select('*')
        .eq('user_id', userId)
        .is('dismissed_at', null)
        .or('expires_at.is.null,expires_at.gt.now()')
        .order('created_at', { ascending: false })
        .limit(10);

      setNotifications(data || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from('smart_notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', notificationId);

      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, read_at: new Date().toISOString() }
            : n
        )
      );

      onNotificationAction?.(notificationId, 'read');
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const dismissNotification = async (notificationId: string) => {
    try {
      await supabase
        .from('smart_notifications')
        .update({ dismissed_at: new Date().toISOString() })
        .eq('id', notificationId);

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      onNotificationAction?.(notificationId, 'dismiss');
    } catch (error) {
      console.error('Error dismissing notification:', error);
    }
  };

  const getNotificationIcon = (type: string, priority: string) => {
    switch (type) {
      case 'achievement':
        return <Trophy className="w-4 h-4 text-yellow-500" />;
      case 'reminder':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'insight':
        return <Lightbulb className="w-4 h-4 text-purple-500" />;
      case 'tip':
        return <Info className="w-4 h-4 text-green-500" />;
      case 'alert':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Bell className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300 border-orange-200';
      case 'medium':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300 border-gray-200';
    }
  };

  const unreadCount = notifications.filter(n => !n.read_at).length;
  const recentNotifications = notifications.slice(0, isExpanded ? 10 : 3);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-3 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="w-4 h-4" />
            Varsler
            {unreadCount > 0 && (
              <Badge variant="default" className="text-xs">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          {notifications.length > 3 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Skjul' : 'Se alle'}
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Ingen nye varsler</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {recentNotifications.map((notification) => (
              <motion.div
                key={notification.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={`p-4 rounded-lg border-l-4 transition-all ${
                  notification.read_at 
                    ? 'bg-muted/50 opacity-75' 
                    : 'bg-background hover:bg-muted/30'
                } ${getPriorityColor(notification.priority)}`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.notification_type, notification.priority)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className={`font-medium text-sm ${
                        notification.read_at ? 'text-muted-foreground' : 'text-foreground'
                      }`}>
                        {notification.title}
                      </h4>
                      <div className="flex items-center gap-1 ml-2">
                        {notification.priority === 'urgent' && (
                          <Badge variant="destructive" className="text-xs">
                            Hastig
                          </Badge>
                        )}
                        {notification.priority === 'high' && (
                          <Badge variant="secondary" className="text-xs">
                            Viktig
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <p className={`text-xs mb-3 ${
                      notification.read_at ? 'text-muted-foreground' : 'text-muted-foreground'
                    }`}>
                      {notification.content}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.created_at), { 
                          addSuffix: true, 
                          locale: nb 
                        })}
                      </span>
                      
                      <div className="flex items-center gap-1">
                        {/* Action Button */}
                        {notification.metadata?.action && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              markAsRead(notification.id);
                              if (notification.metadata.action.url) {
                                window.location.href = notification.metadata.action.url;
                              }
                            }}
                            className="h-6 px-2 text-xs"
                          >
                            {notification.metadata.action.label}
                            <ArrowRight className="w-2 h-2 ml-1" />
                          </Button>
                        )}
                        
                        {/* Mark as Read */}
                        {!notification.read_at && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => markAsRead(notification.id)}
                            className="h-6 w-6 p-0"
                          >
                            <Check className="w-3 h-3" />
                          </Button>
                        )}
                        
                        {/* Dismiss */}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => dismissNotification(notification.id)}
                          className="h-6 w-6 p-0"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        
        {notifications.length > 0 && (
          <div className="pt-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                // Mark all as read
                notifications
                  .filter(n => !n.read_at)
                  .forEach(n => markAsRead(n.id));
              }}
              className="w-full text-xs"
            >
              Merk alle som lest
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};