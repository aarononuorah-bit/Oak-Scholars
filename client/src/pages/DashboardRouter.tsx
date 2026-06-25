import { useEffect } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLocation } from 'wouter';
import AdminDashboard from './AdminDashboard';
import { TutorDashboard } from './TutorDashboard';
import { StudentDashboard } from './StudentDashboard';
import { ParentDashboard } from './ParentDashboard';

/**
 * DashboardRouter - Routes users to the appropriate dashboard based on their role
 * - Admin → Admin Dashboard
 * - Tutor → Tutor Dashboard
 * - Parent → Parent Dashboard
 * - User/Student → Student Dashboard (default)
 * - Unauthenticated → Redirects to login
 */
export function DashboardRouter() {
  const { user, isAuthenticated, loading } = useAuth({ redirectOnUnauthenticated: true });
  const [, setLocation] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
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
