import { User } from '../types';

/**
 * Resolves the destination route based on backend onboarding state:
 * - If user is not authenticated -> /login
 * - If onboarding is already complete -> /home
 * - If organization or profile missing -> /onboarding/profile (Step 1)
 * - If industries missing -> /onboarding/industries (Step 2)
 * - If workspace/agent setup missing -> /onboarding (Step 3)
 */
export const getOnboardingRoute = (user: User | null): string => {
  if (!user) return '/login';
  if (user.onboardingCompleted) return '/home';

  // Check pending onboarding steps
  if (!user.organization || !user.organization.id) {
    return '/onboarding/profile';
  }
  if (!user.profile?.industries || user.profile.industries.length === 0) {
    return '/onboarding/industries';
  }

  return '/onboarding/profile';
};
