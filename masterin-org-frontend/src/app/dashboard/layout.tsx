"use client";

import React from 'react';
import AuthGuard from '@/components/auth/AuthGuard';
import { User } from '@/types/authTypes';

// Define which roles can access the general dashboard area.
// Specific sub-pages within dashboard might have more granular role checks if needed,
// by applying another AuthGuard with more specific roles, or by checking user.role directly in the component.
const ALLOWED_DASHBOARD_ROLES: User['role'][] = ['student', 'teacher', 'admin'];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={ALLOWED_DASHBOARD_ROLES}>
      {/*
        The main Layout.tsx (with Navbar and Footer from the root layout) still applies here.
        This dashboard-specific layout component now primarily serves to protect
        all routes under /dashboard/* with AuthGuard.

        If you wanted a dashboard-specific sub-navigation or sidebar, you would add it here,
        ensuring it's a client component or compatible with being a child of AuthGuard.
        For example:
        <div className="flex">
          <DashboardSidebar />
          <main className="flex-grow">
            {children}
          </main>
        </div>
      */}
      {children}
    </AuthGuard>
  );
}
