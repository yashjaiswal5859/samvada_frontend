import React from 'react';
import { Navigate } from 'react-router-dom';

/** Keep the legacy studio URL pointed at agent management, where creation lives. */
export const AiAgentStudioPage: React.FC = () => <Navigate to="/agents?create=1" replace />;
