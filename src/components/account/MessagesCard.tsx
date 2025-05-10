
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useUserMessages } from '@/hooks/useUserMessages';

export const MessagesCard = () => {
  const { messages, isLoading } = useUserMessages();
  
  const unreadCount = messages.filter(msg => !msg.read).length;

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="p-5 pb-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xl flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            Mine meldinger
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">{unreadCount}</Badge>
            )}
          </h3>
        </div>
      </div>
      <div className="px-5 py-4">
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
