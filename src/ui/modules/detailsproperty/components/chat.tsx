import { useState } from 'react';
import { Button } from '@/ui/design-system/button/button';
import { Typography } from '@/ui/design-system/typography/typography';
import { Send, MessageCircle, X } from 'lucide-react';
import { Input } from '@/ui/design-system/forms/input';

interface ChatMessage {
  id: string;
  message: string;
  sender: 'user' | 'host';
  timestamp: Date;
  senderName: string;
  avatar?: string;
}

interface Props {
  hostName: string;
  hostAvatar?: string;
}

export const Chat = ({ hostName, hostAvatar }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      message: 'Bonjour ! Je suis disponible pour répondre à vos questions sur ce logement.',
      sender: 'host',
      timestamp: new Date(),
      senderName: hostName,
      avatar: hostAvatar
    }
  ]);
  const [newMessage, setNewMessage] = useState('');

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    
    const message: ChatMessage = {
      id: Date.now().toString(),
      message: newMessage,
      sender: 'user',
      timestamp: new Date(),
      senderName: 'Vous'
    };
    
    setMessages(prev => [...prev, message]);
    setNewMessage('');
    
    // Simulate host response after 2 seconds
    setTimeout(() => {
      const response: ChatMessage = {
        id: (Date.now() + 1).toString(),
        message: 'Merci pour votre message ! Je vous réponds dans les plus brefs délais.',
        sender: 'host',
        timestamp: new Date(),
        senderName: hostName,
        avatar: hostAvatar
      };
      setMessages(prev => [...prev, response]);
    }, 2000);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          action={() => setIsOpen(true)}
          className="bg-red hover:bg-primary/90 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <MessageCircle size={24} />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 bg-gray-300 rounded shadow-2xl border border-gray">
      {/* Header */}
      <div className="bg-primary text-white p-4 rounded flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            {hostAvatar ? (
              <img src={hostAvatar} alt={hostName} className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="text-sm font-semibold">{hostName.charAt(0)}</span>
            )}
          </div>
          <div>
            <Typography variant="body-base" className="font-semibold">{hostName}</Typography>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-secondary rounded-full"></div>
              <Typography variant='caption3'>En ligne</Typography>
            </div>
          </div>
        </div>
        <Button
          size='small'
          action={() => setIsOpen(false)}
          className="text-white hover:bg-white/20 p-1 rounded"
        >
          <X size={18} />
        </Button>
      </div>

      {/* Messages */}
      <div className="h-80 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
              <div
                className={`p-3 rounded-lg ${
                  message.sender === 'user'
                    ? 'bg-primary text-white rounded'
                    : 'bg-gray-100 text-gray'
                }`}
              >
                <Typography variant="body-sm">{message.message}</Typography>
              </div>
              <div className={`text-xs text-gray-700 mt-1 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
                {formatTime(message.timestamp)}
              </div>
            </div>
            {message.sender === 'host' && (
              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center mr-2 order-0">
                {message.avatar ? (
                  <img src={message.avatar} alt={message.senderName} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span className="text-xs">{message.senderName.charAt(0)}</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2 -py-4">
          <Input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Tapez votre message..."
          />
          <Button
            action={sendMessage}
            size='small'
          >
            <Send size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};