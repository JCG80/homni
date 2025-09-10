import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bell, 
  Check, 
  Clock, 
  AlertCircle, 
  Home, 
  Mail, 
  Wrench,
  X
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useIntegratedAuth } from '@/modules/auth/hooks/useIntegratedAuth';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'lead_status' | 'property_maintenance' | 'document_upload' | 'system';
  priority: 'low' | 'medium' | 'high';
  read: boolean;
  created_at: string;
  metadata?: any;
}

export const RealTimeNotifications: React.FC = () => {
  const { user } = useIntegratedAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      setupRealtimeSubscription();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      // Simulate notifications based on user activity
      const mockNotifications: Notification[] = [
        {
          id: '1',
          title: 'Ny status på forespørsel',
          message: 'Din forespørsel om maling har fått status "Kontaktet"',
          type: 'lead_status',
          priority: 'medium',
          read: false,
          created_at: new Date().toISOString(),
          metadata: { leadId: 'lead-123' }
        },
        {
          id: '2',
          title: 'Vedlikehold påminnelse',
          message: 'Tid for årlig service av varmepumpe',
          type: 'property_maintenance',
          priority: 'high',
          read: false,
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          metadata: { propertyId: 'property-123' }
        },
        {
          id: '3',
          title: 'Dokument lastet opp',
          message: 'Takstrapport for din eiendom er nå tilgjengelig',
          type: 'document_upload',
          priority: 'low',
          read: true,
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          metadata: { documentId: 'doc-123' }
        }
      ];

      setNotifications(mockNotifications);
      setUnreadCount(mockNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    // Set up real-time subscription for lead status changes
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'leads',
          filter: `submitted_by=eq.${user!.id}`
        },
        (payload) => {
          // Create notification for lead status change
          const newNotification: Notification = {
            id: `notification-${Date.now()}`,
            title: 'Status oppdatert',
            message: `Forespørsel "${payload.new.title}" har ny status: ${payload.new.status}`,
            type: 'lead_status',
            priority: 'medium',
            read: false,
            created_at: new Date().toISOString(),
            metadata: { leadId: payload.new.id }
          };

          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === id ? { ...n, read: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
    setUnreadCount(0);
  };

  const removeNotification = (id: string) => {
    const notification = notifications.find(n => n.id === id);
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'lead_status':
        return <Mail className="h-4 w-4" />;
      case 'property_maintenance':
        return <Wrench className="h-4 w-4" />;
      case 'document_upload':
        return <Home className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Varsler
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs"
            >
              Merk alle som lest
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-80">
          {notifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Ingen varsler</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 border rounded-lg transition-colors ${
                    notification.read ? 'bg-muted/20' : 'bg-background'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-2 rounded-full ${getPriorityColor(notification.priority)}`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`text-sm font-medium ${
                          notification.read ? 'text-muted-foreground' : ''
                        }`}>
                          {notification.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {format(new Date(notification.created_at), 'dd. MMM HH:mm', { 
                            locale: nb 
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                          className="h-6 w-6 p-0"
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeNotification(notification.id)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};