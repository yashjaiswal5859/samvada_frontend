import React from 'react';
import { Navigate } from 'react-router-dom';

/** Keep the legacy studio URL pointed at the single supported agent builder. */
export const AiAgentStudioPage: React.FC = () => <Navigate to="/home?create=1" replace />;
