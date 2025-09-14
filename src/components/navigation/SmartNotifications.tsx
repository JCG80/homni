/**
 * SmartNotifications - Intelligent notification system with activity feeds
 * Part of Phase 3B Step 3: Unified Navigation Experience
 */

import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCircle, AlertCircle, Info, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/modules/auth/hooks';
import { motion, AnimatePresence } from 'framer-motion';

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionText?: string;
}

interface SmartNotificationsProps {
  className?: string;
  maxVisible?: number;
}

export const SmartNotifications: React.FC<SmartNotificationsProps> = ({
  className = '',
  maxVisible = 5
}) => {
  const { role, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Generate role-specific notifications
  useEffect(() => {
    if (!isAuthenticated) return;

    const generateNotifications = (): Notification[] => {
      const baseNotifications: Notification[] = [];
      const now = new Date();

      // Role-specific notifications
      if (role === 'master_admin') {
        baseNotifications.push({
          id: 'system-health',
          type: 'info',
          title: 'Systemhelse',
          message: 'Alle moduler fungerer normalt. Ytelse: 99.9% oppetid.',
          timestamp: new Date(now.getTime() - 30 * 60000), // 30 min ago
          read: false
        });
      }

      if (role === 'admin' || role === 'master_admin') {
        baseNotifications.push({
          id: 'new-leads',
          type: 'success',
          title: 'Nye leads',
          message: '5 nye leads mottatt i dag',
          timestamp: new Date(now.getTime() - 2 * 60 * 60000), // 2 hours ago
          read: false,
          actionUrl: '/admin/leads',
          actionText: 'Se leads'
        });
      }

      if (role === 'company') {
        baseNotifications.push({
          id: 'profile-incomplete',
          type: 'warning',
          title: 'Profil ufullstendig',
          message: 'Fullfør profilen din for å motta flere leads',
          timestamp: new Date(now.getTime() - 24 * 60 * 60000), // 1 day ago
          read: false,
          actionUrl: '/company/profile',
          actionText: 'Fullføre profil'
        });
      }

      // General notifications
      baseNotifications.push({
        id: 'welcome',
        type: 'info',
        title: 'Velkommen!',
        message: 'Utforsk de nye navigasjonsfunksjonene våre',
        timestamp: new Date(now.getTime() - 5 * 60000), // 5 min ago
        read: true
      });

      return baseNotifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    };

    setNotifications(generateNotifications());
  }, [role, isAuthenticated]);

  // Update unread count
  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);

  // Mark notification as read
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Remove notification
  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Get icon for notification type
  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: Date): string => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d siden`;
    if (hours > 0) return `${hours}t siden`;
    if (minutes > 0) return `${minutes}m siden`;
    return 'Akkurat nå';
  };

  if (!isAuthenticated) return null;

  return (
    <div className={`relative ${className}`}>
      {/* Notification Bell */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 text-xs p-0 flex items-center justify-center"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notifications Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/20 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Panel */}
            <motion.div
              className="absolute right-0 top-full mt-2 w-80 z-50"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <Card className="shadow-lg border">
                <CardContent className="p-0">
                  {/* Header */}
                  <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="font-semibold">Varslinger</h3>
                    <div className="flex items-center space-x-2">
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsOpen(false)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Notifications List */}
                  <ScrollArea className="max-h-96">
                    {notifications.length > 0 ? (
                      <div className="p-2">
                        {notifications.slice(0, maxVisible).map((notification) => (
                          <motion.div
                            key={notification.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className={`p-3 rounded-lg mb-2 border cursor-pointer transition-colors ${
                              notification.read 
                                ? 'bg-muted/30 border-border/50' 
                                : 'bg-background border-primary/20 hover:bg-muted/50'
                            }`}
                            onClick={() => !notification.read && markAsRead(notification.id)}
                          >
                            <div className="flex items-start space-x-3">
                              {getNotificationIcon(notification.type)}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                  <h4 className={`text-sm font-medium truncate ${
                                    notification.read ? 'text-muted-foreground' : 'text-foreground'
                                  }`}>
                                    {notification.title}
                                  </h4>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeNotification(notification.id);
                                    }}
                                    className="p-1 h-auto opacity-60 hover:opacity-100"
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                                <p className={`text-sm mt-1 ${
                                  notification.read ? 'text-muted-foreground' : 'text-muted-foreground'
                                }`}>
                                  {notification.message}
                                </p>
                                <div className="flex items-center justify-between mt-2">
                                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    <span>{formatTimestamp(notification.timestamp)}</span>
                                  </div>
                                  {notification.actionUrl && notification.actionText && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        window.location.href = notification.actionUrl!;
                                      }}
                                      className="text-xs h-auto p-1"
                                    >
                                      {notification.actionText}
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 text-center text-muted-foreground">
                        <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Ingen varslinger</p>
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};