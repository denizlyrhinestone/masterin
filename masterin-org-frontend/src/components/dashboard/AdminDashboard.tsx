import React from 'react';

interface StatCardProps {
  title: string;
  value: string;
  icon?: React.ReactNode; // Optional: for a small icon
}
const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => (
  <div className="bg-purple-50 p-4 rounded-lg shadow hover:shadow-md transition-shadow">
    {icon && <div className="text-purple-600 mb-1">{icon}</div>}
    <h4 className="text-sm font-medium text-purple-700">{title}</h4>
    <p className="text-2xl font-semibold text-purple-900">{value}</p>
  </div>
);

interface ModerationItemProps {
    itemDescription: string;
    submittedBy: string;
}
const ModerationItem: React.FC<ModerationItemProps> = ({ itemDescription, submittedBy }) => (
    <li className="p-3 border-b border-gray-200 last:border-b-0 hover:bg-gray-50">
        <p className="text-sm text-gray-700">{itemDescription}</p>
        <p className="text-xs text-gray-500">Submitted by: {submittedBy}</p>
    </li>
);

const AdminDashboard: React.FC = () => {
  const platformStats = [
    { title: 'Total Users', value: '1,234' },
    { title: 'Total Courses', value: '567' },
    { title: 'Marketplace Sales (Month)', value: '$12,345' },
    { title: 'Active Teachers', value: '89' },
  ];

  const moderationQueue = [
      { itemDescription: "Math Worksheet - 'Advanced Algebra'", submittedBy: "Teacher Jane (ID: 42)"},
      { itemDescription: "Course - 'Intro to Quantum Physics'", submittedBy: "Teacher Robert (ID: 15)"},
      { itemDescription: "Resource Link - 'External Chemistry Simulation'", submittedBy: "Teacher Emily (ID: 77)"},
  ];

  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-200">
      <h2 className="text-3xl font-bold text-purple-700 mb-8">
        Administrator Dashboard
      </h2>

      {/* Platform Analytics Overview Section */}
      <section className="mb-8">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Platform Analytics Overview</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {platformStats.map(stat => (
            <StatCard key={stat.title} title={stat.title} value={stat.value} />
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Content Moderation Queue Section */}
        <section>
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Content Moderation Queue</h3>
          {moderationQueue.length > 0 ? (
            <ul className="bg-gray-50 rounded-md shadow-sm border max-h-80 overflow-y-auto">
              {moderationQueue.map((item, index) => (
                <ModerationItem key={index} itemDescription={item.itemDescription} submittedBy={item.submittedBy} />
              ))}
            </ul>
          ) : (
             <div className="p-4 bg-gray-50 rounded-md shadow-sm border">
                <p className="text-gray-500">No items currently in the moderation queue.</p>
            </div>
          )}
        </section>

        {/* User Management & System Settings Section */}
        <section>
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Management & Settings</h3>
          <div className="space-y-3">
            <button className="w-full text-left p-4 bg-slate-600 hover:bg-slate-700 text-white rounded-md shadow-sm transition-colors">
              User Management Console
            </button>
            <button className="w-full text-left p-4 bg-slate-600 hover:bg-slate-700 text-white rounded-md shadow-sm transition-colors">
              System Health & Logs
            </button>
            <button className="w-full text-left p-4 bg-slate-600 hover:bg-slate-700 text-white rounded-md shadow-sm transition-colors">
              Platform Settings
            </button>
             <button className="w-full text-left p-4 bg-red-500 hover:bg-red-600 text-white rounded-md shadow-sm transition-colors mt-6">
              Emergency Site Lockdown
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
