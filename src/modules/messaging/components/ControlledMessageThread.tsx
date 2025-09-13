import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, MessageSquare, Building, User, Shield } from 'lucide-react';
import { useControlledMessaging, ControlledMessage } from '@/hooks/useControlledMessaging';
import { useAuth } from '@/modules/auth/hooks';
import { formatDistanceToNow } from 'date-fns';
import { nb } from 'date-fns/locale';

interface ControlledMessageThreadProps {
  leadId: string;
  leadTitle: string;
  canSendMessages?: boolean;
}

export const ControlledMessageThread: React.FC<ControlledMessageThreadProps> = ({
  leadId,
  leadTitle,
  canSendMessages = false
}) => {
  const { user } = useAuth();
  const { messages, isLoading, error, sendMessage, markAsRead } = useControlledMessaging(leadId);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setIsSending(true);
    const success = await sendMessage(newMessage, 'response');
    if (success) {
      setNewMessage('');
    }
    setIsSending(false);
  };

  const handleMessageClick = (message: ControlledMessage) => {
    if (message.recipient_id === user?.id && !message.read_at) {
      markAsRead(message.id);
    }
  };

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'offer':
        return <Building className="h-3 w-3" />;
      case 'system':
        return <Shield className="h-3 w-3" />;
      default:
        return <MessageSquare className="h-3 w-3" />;
    }
  };

  const getMessageTypeBadge = (type: string) => {
    switch (type) {
      case 'offer':
        return <Badge variant="secondary" className="text-xs">Tilbud</Badge>;
      case 'system':
        return <Badge variant="outline" className="text-xs">System</Badge>;
      case 'question':
        return <Badge variant="default" className="text-xs">Spørsmål</Badge>;
      default:
        return null;
    }
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-destructive">
            <MessageSquare className="h-8 w-8 mx-auto mb-2" />
            <p>Kunne ikke laste meldinger: {error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Sikker kommunikasjon
          <Badge variant="outline" className="text-xs">
            Via plattform
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Angående: {leadTitle}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Messages */}
        <ScrollArea className="h-64 w-full">
          <div className="space-y-3">
            {messages.length === 0 && !isLoading ? (
              <div className="text-center text-muted-foreground py-8">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Ingen meldinger ennå</p>
                <p className="text-xs">Send en melding for å starte samtalen</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    message.sender_id === user?.id
                      ? 'bg-primary/10 ml-8'
                      : 'bg-muted mr-8'
                  } ${
                    message.recipient_id === user?.id && !message.read_at
                      ? 'ring-1 ring-primary'
                      : ''
                  }`}
                  onClick={() => handleMessageClick(message)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {message.sender_id === user?.id ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Building className="h-4 w-4" />
                      )}
                      <span className="font-medium text-sm">
                        {message.sender_id === user?.id 
                          ? 'Du' 
                          : message.sender_name || 'Bedrift'
                        }
                      </span>
                      {getMessageTypeBadge(message.message_type)}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {getMessageTypeIcon(message.message_type)}
                      <span>
                        {formatDistanceToNow(new Date(message.created_at), {
                          addSuffix: true,
                          locale: nb
                        })}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  {message.recipient_id === user?.id && !message.read_at && (
                    <div className="mt-2">
                      <Badge variant="default" className="text-xs">
                        Ulest
                      </Badge>
                    </div>
                  )}
                </div>
              ))
            )}
            {isLoading && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Message Input */}
        {canSendMessages ? (
          <div className="space-y-2">
            <Textarea
              placeholder="Skriv din melding..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              rows={3}
              className="resize-none"
            />
            <div className="flex justify-between items-center">
              <p className="text-xs text-muted-foreground">
                <Shield className="h-3 w-3 inline mr-1" />
                All kommunikasjon overvåkes for sikkerhet
              </p>
              <Button 
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || isSending}
                size="sm"
              >
                <Send className="h-4 w-4 mr-2" />
                {isSending ? 'Sender...' : 'Send'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-muted rounded-lg text-center">
            <Shield className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-2">
              Du må kjøpe denne leaden for å kunne sende meldinger
            </p>
            <Button variant="outline" size="sm" disabled>
              Krever kjøp
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};