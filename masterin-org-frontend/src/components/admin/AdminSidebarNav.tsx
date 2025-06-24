"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HomeIcon, UsersIcon, ShieldCheckIcon, CogIcon, BriefcaseIcon } from '@heroicons/react/24/outline'; // Example icons

const navItems = [
  // { href: '/admin', label: 'Dashboard', icon: HomeIcon }, // Optional dashboard link
  { href: '/admin/users', label: 'User Management', icon: UsersIcon },
  { href: '/admin/content-moderation', label: 'Content Moderation', icon: ShieldCheckIcon },
  // Add more admin links here as needed, e.g., Settings, Analytics
  // { href: '/admin/settings', label: 'Settings', icon: CogIcon },
];

const AdminSidebarNav = () => {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-800 text-slate-100 p-4 space-y-6 shadow-lg">
      <div className="text-center py-4">
        <Link href="/admin" className="text-2xl font-semibold hover:text-sky-400 transition-colors">
          Admin Panel
        </Link>
      </div>
      <nav className="flex-grow">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`
                    flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm font-medium
                    transition-all duration-150 ease-in-out
                    ${isActive
                      ? 'bg-sky-600 text-white shadow-md scale-105'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white focus:bg-slate-700 focus:text-white focus:outline-none'
                    }
                  `}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="pt-6 mt-auto border-t border-slate-700">
        <ul className="space-y-2">
            <li>
                <Link
                  href="/"
                  className="flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm font-medium
                             text-slate-300 hover:bg-slate-700 hover:text-white
                             focus:bg-slate-700 focus:text-white focus:outline-none transition-colors"
                >
                  <BriefcaseIcon className="h-5 w-5" />
                  <span>Back to Main Site</span>
                </Link>
            </li>
        </ul>
      </div>
    </aside>
  );
};

export default AdminSidebarNav;
