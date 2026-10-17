import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { WorkspaceProvider } from './contexts/WorkspaceContext';
import { AppRouter } from './router';
import { ErrorBoundary } from './components/common/ErrorBoundary';

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <WorkspaceProvider>
          <ToastProvider>
            <AppRouter />
          </ToastProvider>
        </WorkspaceProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
