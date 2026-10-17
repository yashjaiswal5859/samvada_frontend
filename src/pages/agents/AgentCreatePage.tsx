import React from 'react';
import { Navigate } from 'react-router-dom';

/** Keep the legacy wizard URL pointed at the canonical agent creation flow. */
export const AgentCreatePage: React.FC = () => <Navigate to="/agents?create=1" replace />;
