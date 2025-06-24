// src/app/admin/layout.tsx
import AuthGuard from '@/components/auth/AuthGuard'; // Ensure this path is correct
import AdminSidebarNav from '@/components/admin/AdminSidebarNav';
import { Toaster } from '@/components/ui/toaster'; // Assuming shadcn/ui toaster

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={['admin']} redirectPath="/access-denied">
      {/*
        AuthGuard will handle redirect if user is not authenticated or not an admin.
        The `redirectPath` prop can be used if AuthGuard supports it, otherwise AuthGuard's internal logic applies.
        Consider adding a specific /access-denied page if AuthGuard doesn't provide one.
      */}
      <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950">
        <AdminSidebarNav />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {/*
            Consider adding a container or max-width wrapper here if content shouldn't span full width,
            e.g., <div className="max-w-7xl mx-auto"> {children} </div>
            For now, letting children control their own width.
          */}
          {children}
          <Toaster />
        </main>
      </div>
    </AuthGuard>
  );
}
