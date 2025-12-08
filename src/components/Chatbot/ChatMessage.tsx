import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Message } from './ChatWidget';
import { Action } from './types';

interface ChatMessageProps {
  message: Message;
  onActionClick: (action: Action) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, onActionClick }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] rounded-lg p-3 ${
        isUser 
          ? 'bg-blue-600 text-white' 
          : 'bg-white border border-gray-200'
      }`}>
        <ReactMarkdown className="prose prose-sm max-w-none">
          {message.content}
        </ReactMarkdown>

        {/* Ações sugeridas pelo bot */}
        {message.metadata?.actions && (
          <div className="mt-3 space-y-2">
            {message.metadata.actions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => onActionClick(action)}
                className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded text-sm font-medium transition-colors"
              >
                {action.label}
              </button>
            ))}
          </div>
        )}

        {/* Metadata (modelo usado, confiança) */}
        {message.metadata?.model && (
          <div className="mt-2 text-xs opacity-60">
            via {message.metadata.model}
          </div>
        )}
      </div>
    </div>
  );
};
