
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, Calendar, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useUserMessages } from '@/hooks/useUserMessages';

export const MessagesCard = () => {
  const { messages, isLoading } = useUserMessages();
  
  const unreadCount = messages.filter(msg => !msg.read).length;

  return (
    <div className="warm-card hover:shadow-lg transition-shadow duration-300">
      <div className="p-5 pb-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xl flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Mine meldinger
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">{unreadCount}</Badge>
            )}
          </h3>
        </div>
      </div>
      <div className="px-5 py-4">
        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="animate-pulse h-4 w-4 bg-primary/20 rounded-full"></span>
            Laster meldinger...
          </div>
        ) : messages.length > 0 ? (
          <ul className="space-y-3">
            {messages.slice(0, 3).map(message => (
              <li key={message.id} className="text-sm border-b pb-2 last:border-0">
                <div className="flex items-center justify-between">
                  <p className="font-medium flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-primary/80" />
                    {message.sender}
                  </p>
                  {!message.read && (
                    <span className="bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full">Ny</span>
                  )}
                </div>
                <p className="text-muted-foreground truncate pl-5">{message.content}</p>
                <div className="flex items-center text-xs text-muted-foreground mt-1 pl-5">
                  <Calendar className="h-3 w-3 mr-1" />
                  {new Date(message.createdAt).toLocaleDateString('nb-NO')}
                </div>
              </li>
            ))}
            {messages.length > 3 && (
              <li className="text-sm text-primary flex items-center gap-1">
                <MessageSquare className="h-3 w-3" /> {messages.length - 3} flere meldinger
              </li>
            )}
          </ul>
        ) : (
          <div className="flex flex-col items-center py-4 text-muted-foreground">
            <MessageSquare className="h-10 w-10 text-muted-foreground/30 mb-2" />
            <p>Du har ingen meldinger.</p>
          </div>
        )}
      </div>
      <div className="px-5 pb-5 pt-2">
        <Button 
          className="w-full" 
          variant="outline"
        >
          <MessageSquare className="h-4 w-4 mr-2" /> Se alle meldinger
        </Button>
      </div>
    </div>
  );
};
