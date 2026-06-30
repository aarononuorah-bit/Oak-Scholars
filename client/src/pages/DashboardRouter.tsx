import { useAuth } from '@/_core/hooks/useAuth';
import AdminDashboard from './AdminDashboard';
import { TutorDashboard } from './TutorDashboard';
import { StudentDashboard } from './StudentDashboard';
import { ParentDashboard } from './ParentDashboard';
import DashboardSkeleton from '@/components/DashboardSkeleton';

/**
 * DashboardRouter - Routes users to the appropriate dashboard based on their role
 * - Admin → Admin Dashboard
 * - Tutor → Tutor Dashboard
 * - Parent → Parent Dashboard
 * - User/Student → Student Dashboard (default)
 * - Unauthenticated → Redirects to login
 *
 * Shows a full-page DashboardSkeleton during the auth check so the transition
 * feels instantaneous and there is no blank-screen flash.
 */
export function DashboardRouter() {
  const { user, isAuthenticated, loading } = useAuth({ redirectOnUnauthenticated: true });

  // Show the branded skeleton while the session is being resolved — this
  // prevents the jarring blank-screen flash and makes the page feel instant.
  if (loading) {
    return <DashboardSkeleton />;
  }

  if (!isAuthenticated || !user) {
    return null; // useAuth will redirect to login
  }

  // Route based on user role
  const userRole = (user as any)?.role || 'user';

  switch (userRole) {
    case 'admin':
      return <AdminDashboard />;
    case 'tutor':
      return <TutorDashboard />;
    case 'parent':
      return <ParentDashboard />;
    case 'user':
    default:
      return <StudentDashboard />;
  }
}

export default DashboardRouter;
