import React, { useState, useEffect, useRef } from 'react';
import { useWebSocket } from '../../hooks/useWebSocket';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { ProactiveNotification } from './ProactiveNotification';
import { Action } from './types';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    model?: string;
    confidence?: number;
    actions?: Action[];
  };
}

interface ProactiveAlert {
  id: string;
  type: 'network_issue' | 'bill_reminder' | 'maintenance';
  message: string;
  priority: 'low' | 'medium' | 'high';
  actions?: Action[];
}

const openTicket = async (data: any) => {
  console.log('Opening ticket with data:', data);
  // Placeholder for API call to open a ticket
  return Promise.resolve();
};


interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    model?: string;
    confidence?: number;
    actions?: Action[];
  };
}

interface ProactiveAlert {
  id: string;
  type: 'network_issue' | 'bill_reminder' | 'maintenance';
  message: string;
  priority: 'low' | 'medium' | 'high';
  actions?: Action[];
}

export const ChatWidget: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [proactiveAlerts, setProactiveAlerts] = useState<ProactiveAlert[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { sendMessage, lastMessage, connectionStatus } = useWebSocket();

  // Scroll automático
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Receber mensagens do WebSocket
  useEffect(() => {
    if (lastMessage) {
      const data = JSON.parse(lastMessage.data);

      if (data.type === 'message') {
        setMessages(prev => [...prev, data.message]);
        setIsTyping(false);
      } else if (data.type === 'proactive_alert') {
        setProactiveAlerts(prev => [...prev, data.alert]);
        // Auto-abrir chat se prioridade alta
        if (data.alert.priority === 'high') {
          setIsOpen(true);
        }
      } else if (data.type === 'typing') {
        setIsTyping(data.isTyping);
      }
    }
  }, [lastMessage]);

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    sendMessage({
      type: 'chat',
      content,
      context: {
        customerId: localStorage.getItem('customerId'),
        sessionId: localStorage.getItem('sessionId'),
      }
    });
  };

  const handleActionClick = async (action: Action) => {
    // Executar ações diretas (abrir ticket, ver fatura, etc)
    switch (action.type) {
      case 'open_ticket':
        await openTicket(action.data);
        break;
      case 'view_bill':
        window.location.href = '/billing';
        break;
      case 'schedule_tech':
        // Abrir modal de agendamento
        break;
    }
  };

  return (
    <>
      {/* Notificações Proativas Flutuantes */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {proactiveAlerts.map(alert => (
          <ProactiveNotification
            key={alert.id}
            alert={alert}
            onDismiss={() => setProactiveAlerts(prev => 
              prev.filter(a => a.id !== alert.id)
            )}
            onOpenChat={() => {
              setIsOpen(true);
              // Adicionar contexto do alerta ao chat
              setMessages(prev => [...prev, {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: alert.message,
                timestamp: new Date(),
              }]);
            }}
          />
        ))}
      </div>

      {/* Widget do Chat */}
      {isOpen ? (
        <div className="fixed bottom-4 right-4 w-96 h-[600px] bg-white rounded-lg shadow-2xl flex flex-col z-40">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-lg flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                connectionStatus === 'connected' ? 'bg-green-400' : 'bg-red-400'
              }`} />
              <h3 className="font-semibold">Assistente Virtual</h3>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="hover:bg-blue-800 rounded p-1"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map(message => (
              <ChatMessage 
                key={message.id} 
                message={message}
                onActionClick={handleActionClick}
              />
            ))}
            {isTyping && (
              <div className="flex items-center gap-2 text-gray-500">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                </div>
                <span className="text-sm">Digitando...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <ChatInput onSend={handleSendMessage} disabled={isTyping} />
        </div>
      ) : (
        // Botão Flutuante
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 w-16 h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center z-40 transition-transform hover:scale-110"
        >
          {proactiveAlerts.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {proactiveAlerts.length}
            </span>
          )}
          💬
        </button>
      )}
    </>
  );
};
