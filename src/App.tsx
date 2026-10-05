import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { WorkspaceProvider } from './contexts/WorkspaceContext';
import { AppRouter } from './router';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <WorkspaceProvider>
        <ToastProvider>
          <AppRouter />
        </ToastProvider>
      </WorkspaceProvider>
    </AuthProvider>
  );
};

export default App;
