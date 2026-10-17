import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User } from '../types';
import { Loader2 } from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';

// Auth & Onboarding Pages (Lazy Loaded for Optimal Initial Bundle Size)
const LoginPage = React.lazy(() => import('../pages/auth/LoginPage').then(m => ({ default: m.LoginPage })));
const ForgotPasswordPage = React.lazy(() => import('../pages/auth/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));
const VerifyEmailPage = React.lazy(() => import('../pages/auth/VerifyEmailPage').then(m => ({ default: m.VerifyEmailPage })));
const ProfileSetupPage = React.lazy(() => import('../pages/onboarding/ProfileSetupPage').then(m => ({ default: m.ProfileSetupPage })));
const IndustrySelectPage = React.lazy(() => import('../pages/onboarding/IndustrySelectPage').then(m => ({ default: m.IndustrySelectPage })));
const LandingPage = React.lazy(() => import('../pages/landing/LandingPage').then(m => ({ default: m.LandingPage })));

// Portal Core Pages
const HomePage = React.lazy(() => import('../pages/home/HomePage').then(m => ({ default: m.HomePage })));
const DashboardOverviewPage = React.lazy(() => import('../pages/dashboard/DashboardOverviewPage').then(m => ({ default: m.DashboardOverviewPage })));

// Build Module
const AgentListPage = React.lazy(() => import('../pages/agents/AgentListPage').then(m => ({ default: m.AgentListPage })));
const AgentCreatePage = React.lazy(() => import('../pages/agents/AgentCreatePage').then(m => ({ default: m.AgentCreatePage })));
const AiAgentStudioPage = React.lazy(() => import('../pages/agents/AiAgentStudioPage').then(m => ({ default: m.AiAgentStudioPage })));
const AgentStudioPage = React.lazy(() => import('../pages/agents/AgentStudioPage').then(m => ({ default: m.AgentStudioPage })));
const VoicesPage = React.lazy(() => import('../pages/voices/VoicesPage').then(m => ({ default: m.VoicesPage })));
const KnowledgebasePage = React.lazy(() => import('../pages/knowledge/KnowledgebasePage').then(m => ({ default: m.KnowledgebasePage })));
const IntegrationsPage = React.lazy(() => import('../pages/integrations/IntegrationsPage').then(m => ({ default: m.IntegrationsPage })));

// Deploy Module
const CampaignListPage = React.lazy(() => import('../pages/campaigns/CampaignListPage').then(m => ({ default: m.CampaignListPage })));
const CampaignCreatePage = React.lazy(() => import('../pages/campaigns/CampaignCreatePage').then(m => ({ default: m.CampaignCreatePage })));
const ContactsPage = React.lazy(() => import('../pages/contacts/ContactsPage').then(m => ({ default: m.ContactsPage })));
const PhoneNumbersPage = React.lazy(() => import('../pages/telephony/PhoneNumbersPage').then(m => ({ default: m.PhoneNumbersPage })));

// Monitor Module
const CallHistoryPage = React.lazy(() => import('../pages/conversations/CallHistoryPage').then(m => ({ default: m.CallHistoryPage })));
const CallDetailPage = React.lazy(() => import('../pages/conversations/CallDetailPage').then(m => ({ default: m.CallDetailPage })));
const LiveCallConsolePage = React.lazy(() => import('../pages/conversations/LiveCallConsolePage').then(m => ({ default: m.LiveCallConsolePage })));
const NotificationsPage = React.lazy(() => import('../pages/notifications/NotificationsPage').then(m => ({ default: m.NotificationsPage })));
const AnalyticsPage = React.lazy(() => import('../pages/analytics/AnalyticsPage').then(m => ({ default: m.AnalyticsPage })));
const ObservabilityPage = React.lazy(() => import('../pages/observability/ObservabilityPage').then(m => ({ default: m.ObservabilityPage })));

// Settings & Help Module
const SettingsPage = React.lazy(() => import('../pages/settings/SettingsPage').then(m => ({ default: m.SettingsPage })));
const ProfileSettingsPage = React.lazy(() => import('../pages/settings/ProfileSettingsPage').then(m => ({ default: m.ProfileSettingsPage })));
const SecuritySettingsPage = React.lazy(() => import('../pages/settings/SecuritySettingsPage').then(m => ({ default: m.SecuritySettingsPage })));
const AuditLogsPage = React.lazy(() => import('../pages/settings/AuditLogsPage').then(m => ({ default: m.AuditLogsPage })));
const TeamMembersPage = React.lazy(() => import('../pages/settings/TeamMembersPage').then(m => ({ default: m.TeamMembersPage })));
const BillingUsagePage = React.lazy(() => import('../pages/settings/BillingUsagePage').then(m => ({ default: m.BillingUsagePage })));
const WorkspacesPage = React.lazy(() => import('../pages/workspaces/WorkspacesPage').then(m => ({ default: m.WorkspacesPage })));
const GettingStartedPage = React.lazy(() => import('../pages/help/GettingStartedPage').then(m => ({ default: m.GettingStartedPage })));
const HelpSupportPage = React.lazy(() => import('../pages/help/HelpSupportPage').then(m => ({ default: m.HelpSupportPage })));
import { getOnboardingRoute } from '../utils/navigation';

const PageLoadingFallback: React.FC = () => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 space-y-3">
    <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-700 shadow-sm">
      <Loader2 className="w-5 h-5 animate-spin" />
    </div>
    <span className="text-xs font-medium text-slate-500 animate-pulse">Loading view...</span>
  </div>
);

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

const RootRoute: React.FC = () => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050814] flex items-center justify-center text-blue-400">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (isAuthenticated && user) {
    return <Navigate to={user.onboardingCompleted ? '/home' : getOnboardingRoute(user)} replace />;
  }

  return <LandingPage />;
};

export const AppRouter: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <BrowserRouter>
      <React.Suspense fallback={<PageLoadingFallback />}>
        <Routes>
        {/* Public Enterprise Landing Page / Root */}
        <Route path="/" element={<RootRoute />} />
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
          path="/knowledge/:folderName"
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
          path="/settings/telephony"
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
      </React.Suspense>
    </BrowserRouter>
  );
};
