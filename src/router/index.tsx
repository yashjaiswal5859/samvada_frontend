import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User } from '../types';
import { Loader2 } from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';

// Auth & Onboarding Pages
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage';
import { VerifyEmailPage } from '../pages/auth/VerifyEmailPage';
import { ProfileSetupPage } from '../pages/onboarding/ProfileSetupPage';
import { IndustrySelectPage } from '../pages/onboarding/IndustrySelectPage';

import { LandingPage } from '../pages/landing/LandingPage';

// Portal Core Pages
import { HomePage } from '../pages/home/HomePage';
import { DashboardOverviewPage } from '../pages/dashboard/DashboardOverviewPage';

// Build Module
import { AgentListPage } from '../pages/agents/AgentListPage';
import { AgentCreatePage } from '../pages/agents/AgentCreatePage';
import { AiAgentStudioPage } from '../pages/agents/AiAgentStudioPage';
import { AgentStudioPage } from '../pages/agents/AgentStudioPage';
import { VoicesPage } from '../pages/voices/VoicesPage';
import { KnowledgebasePage } from '../pages/knowledge/KnowledgebasePage';
import { IntegrationsPage } from '../pages/integrations/IntegrationsPage';

// Deploy Module
import { CampaignListPage } from '../pages/campaigns/CampaignListPage';
import { CampaignCreatePage } from '../pages/campaigns/CampaignCreatePage';
import { ContactsPage } from '../pages/contacts/ContactsPage';
import { PhoneNumbersPage } from '../pages/telephony/PhoneNumbersPage';

// Monitor Module
import { CallHistoryPage } from '../pages/conversations/CallHistoryPage';
import { CallDetailPage } from '../pages/conversations/CallDetailPage';
import { LiveCallConsolePage } from '../pages/conversations/LiveCallConsolePage';
import { NotificationsPage } from '../pages/notifications/NotificationsPage';
import { AnalyticsPage } from '../pages/analytics/AnalyticsPage';
import { ObservabilityPage } from '../pages/observability/ObservabilityPage';

// Settings & Help Module
import { SettingsPage } from '../pages/settings/SettingsPage';
import { ProfileSettingsPage } from '../pages/settings/ProfileSettingsPage';
import { SecuritySettingsPage } from '../pages/settings/SecuritySettingsPage';
import { AuditLogsPage } from '../pages/settings/AuditLogsPage';
import { TeamMembersPage } from '../pages/settings/TeamMembersPage';
import { BillingUsagePage } from '../pages/settings/BillingUsagePage';
import { WorkspacesPage } from '../pages/workspaces/WorkspacesPage';
import { GettingStartedPage } from '../pages/help/GettingStartedPage';
import { HelpSupportPage } from '../pages/help/HelpSupportPage';
import { getOnboardingRoute } from '../utils/navigation';

const ProtectedRoute: React.FC<{ children: React.ReactNode; requireOnboarding?: boolean }> = ({
  children,
  requireOnboarding = true,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050814] flex items-center justify-center text-blue-400">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (requireOnboarding && !user.onboardingCompleted) {
    return <Navigate to={getOnboardingRoute(user)} replace />;
  }

  return <>{children}</>;
};

export const AppRouter: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Enterprise Landing Page */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/landing" element={<LandingPage />} />

        {/* Public Auth Routes */}
        <Route
          path="/login"
          element={
            isAuthenticated && user ? (
              <Navigate to={getOnboardingRoute(user)} replace />
            ) : (
              <LoginPage />
            )
          }
        />
        <Route path="/register" element={<Navigate to="/login" replace />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />


        {/* Onboarding Routes */}
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute requireOnboarding={false}>
              <Navigate to="/onboarding/profile" replace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/onboarding/profile"
          element={
            <ProtectedRoute requireOnboarding={false}>
              <ProfileSetupPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/onboarding/industries"
          element={
            <ProtectedRoute requireOnboarding={false}>
              <IndustrySelectPage />
            </ProtectedRoute>
          }
        />

        {/* Portal Workspace Routes (Wrapped inside AppLayout) */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <AppLayout theme="light">
                <HomePage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AppLayout>
                <DashboardOverviewPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Build Module */}
        <Route
          path="/agents"
          element={
            <ProtectedRoute>
              <AppLayout>
                <AgentListPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai-studio"
          element={
            <ProtectedRoute>
              <AppLayout>
                <AiAgentStudioPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/agents/builder"
          element={
            <ProtectedRoute>
              <AppLayout>
                <AiAgentStudioPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/agents/create"
          element={
            <ProtectedRoute>
              <AppLayout>
                <AgentCreatePage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/agents/:id"
          element={
            <ProtectedRoute>
              <AppLayout>
                <AgentStudioPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/voices"
          element={
            <ProtectedRoute>
              <AppLayout>
                <VoicesPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/knowledge"
          element={
            <ProtectedRoute>
              <AppLayout>
                <KnowledgebasePage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/integrations"
          element={
            <ProtectedRoute>
              <AppLayout>
                <IntegrationsPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Deploy Module */}
        <Route
          path="/campaigns"
          element={
            <ProtectedRoute>
              <AppLayout>
                <CampaignListPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/campaigns/create"
          element={
            <ProtectedRoute>
              <AppLayout>
                <CampaignCreatePage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/contacts"
          element={
            <ProtectedRoute>
              <AppLayout>
                <ContactsPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/telephony"
          element={
            <ProtectedRoute>
              <AppLayout>
                <PhoneNumbersPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Monitor Module */}
        <Route
          path="/calls"
          element={
            <ProtectedRoute>
              <AppLayout>
                <CallHistoryPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/calls/live"
          element={
            <ProtectedRoute>
              <AppLayout>
                <LiveCallConsolePage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/calls/:id"
          element={
            <ProtectedRoute>
              <AppLayout>
                <CallDetailPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <AppLayout>
                <NotificationsPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <AppLayout>
                <AnalyticsPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/observability"
          element={
            <ProtectedRoute>
              <AppLayout>
                <ObservabilityPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Settings & Help Module */}
        <Route
          path="/workspaces"
          element={
            <ProtectedRoute>
              <AppLayout>
                <WorkspacesPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <AppLayout>
                <SettingsPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings/profile"
          element={
            <ProtectedRoute>
              <AppLayout>
                <ProfileSettingsPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings/security"
          element={
            <ProtectedRoute>
              <AppLayout>
                <SecuritySettingsPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings/audit-logs"
          element={
            <ProtectedRoute>
              <AppLayout>
                <AuditLogsPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings/team"
          element={
            <ProtectedRoute>
              <AppLayout>
                <TeamMembersPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings/billing"
          element={
            <ProtectedRoute>
              <AppLayout>
                <BillingUsagePage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/getting-started"
          element={
            <ProtectedRoute>
              <AppLayout>
                <GettingStartedPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/help"
          element={
            <ProtectedRoute>
              <AppLayout>
                <HelpSupportPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Catch-all fallback redirect */}
        <Route
          path="*"
          element={
            isAuthenticated && user ? (
              <Navigate to={getOnboardingRoute(user)} replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
};
