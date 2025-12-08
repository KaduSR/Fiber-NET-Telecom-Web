import React from 'react';
import { ProactiveAlert } from './ChatWidget';
import { Action } from './types';

interface ProactiveNotificationProps {
  alert: ProactiveAlert;
  onDismiss: () => void;
  onOpenChat: () => void;
}

export const ProactiveNotification: React.FC<ProactiveNotificationProps> = ({
  alert,
  onDismiss,
  onOpenChat,
}) => {
  return (
    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
      <p className="font-bold">{alert.type}</p>
      <p>{alert.message}</p>
      <div className="flex gap-2 mt-2">
        <button onClick={onOpenChat} className="text-sm font-bold">Abrir Chat</button>
        <button onClick={onDismiss} className="text-sm">Dispensar</button>
      </div>
    </div>
  );
};
