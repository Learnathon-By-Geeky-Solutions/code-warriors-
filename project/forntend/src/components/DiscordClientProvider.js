// frontend/components/ClientProvider.js

'use client'; // Marks this component as a client component

import { SocketProvider } from '../contexts/DiscordSocketContext'; // Corrected path

const ClientProvider = ({ children }) => {
  return (
    <SocketProvider>
      {children}
    </SocketProvider>
  );
};

export default ClientProvider;
