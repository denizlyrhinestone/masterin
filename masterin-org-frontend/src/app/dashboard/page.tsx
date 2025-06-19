import React from 'react';
import StudentDashboard from '@/components/dashboard/StudentDashboard';
import TeacherDashboard from '@/components/dashboard/TeacherDashboard';
import AdminDashboard from '@/components/dashboard/AdminDashboard';

const DashboardPage = () => {
  // In a real application, you would conditionally render one of these
  // based on the authenticated user's role.
  // For this phase, we display all three for review purposes.

  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      <header className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-3">
          User Dashboards (Role Views)
        </h1>
        <p className="text-lg text-gray-600">
          This page displays different dashboard views based on user roles.
          Currently showing all for demonstration.
        </p>
      </header>

      {/* Student Dashboard Section */}
      <section id="student-dashboard" className="p-4 border-2 border-dashed border-indigo-300 rounded-lg">
        <h2 className="text-2xl font-semibold text-indigo-600 mb-4 text-center py-2 bg-indigo-50 rounded-t-md">
          Student Dashboard View
        </h2>
        <StudentDashboard />
      </section>

      {/* Teacher Dashboard Section */}
      <section id="teacher-dashboard" className="p-4 border-2 border-dashed border-green-300 rounded-lg">
        <h2 className="text-2xl font-semibold text-green-600 mb-4 text-center py-2 bg-green-50 rounded-t-md">
          Teacher Dashboard View
        </h2>
        <TeacherDashboard />
      </section>

      {/* Admin Dashboard Section */}
      <section id="admin-dashboard" className="p-4 border-2 border-dashed border-purple-300 rounded-lg">
        <h2 className="text-2xl font-semibold text-purple-600 mb-4 text-center py-2 bg-purple-50 rounded-t-md">
          Admin Dashboard View
        </h2>
        <AdminDashboard />
      </section>
    </div>
  );
};

export default DashboardPage;
