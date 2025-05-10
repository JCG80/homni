
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useUserMessages } from '@/hooks/useUserMessages';

export const MessagesCard = () => {
  // In a real implementation, we would fetch actual message data
  const { messages, isLoading } = useUserMessages();
  
  const unreadCount = messages.filter(msg => !msg.read).length;

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Mine meldinger
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">{unreadCount}</Badge>
            )}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-gray-500">Laster meldinger...</p>
        ) : messages.length > 0 ? (
          <ul className="space-y-2">
            {messages.slice(0, 3).map(message => (
              <li key={message.id} className="text-sm border-b pb-2 last:border-0">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{message.sender}</p>
                  {!message.read && (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">Ny</span>
                  )}
                </div>
                <p className="text-gray-500 truncate">{message.content}</p>
              </li>
            ))}
            {messages.length > 3 && (
              <li className="text-sm text-blue-600">
                + {messages.length - 3} flere meldinger
              </li>
            )}
          </ul>
        ) : (
          <p className="text-gray-500">Du har ingen meldinger.</p>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          variant="outline"
        >
          <MessageSquare className="h-4 w-4 mr-2" /> Se alle meldinger
        </Button>
      </CardFooter>
    </Card>
  );
};
