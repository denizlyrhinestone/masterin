"use client"; // Needed for usePathname

"use client"; // Needed for usePathname and useAuth

import React, { ReactNode, useState } from 'react'; // Added useState for mobile menu
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth
import { UserCircleIcon, ArrowLeftOnRectangleIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'; // Icons

interface NavLinkProps {
  href: string;
  children: ReactNode;
  currentPath: string;
}

const NavLink: React.FC<NavLinkProps> = ({ href, children, currentPath }) => {
  const isActive = href === '/' ? currentPath === href : currentPath.startsWith(href);
  const activeClasses = "bg-sky-700 text-white";
  const inactiveClasses = "text-sky-100 hover:bg-sky-500 hover:text-white";

  return (
    <Link href={href} legacyBehavior>
      <a className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? activeClasses : inactiveClasses}`}>
        {children}
      </a>
    </Link>
  );
};


type LayoutProps = {
  children: ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  const currentPath = usePathname();
  const { isAuthenticated, user, logout, isLoading } = useAuth(); // Get auth state and functions
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const commonNavLinks = [
    { href: "/", label: "Home" },
    { href: "/learning-path", label: "Learning Paths" },
    { href: "/marketplace", label: "Marketplace" },
    { href: "/tools", label: "AI Tools" },
  ];

  const authNavLinks = isAuthenticated
    ? [ { href: "/dashboard", label: "Dashboard" } ]
    : [];

  const allNavLinks = [...commonNavLinks, ...authNavLinks];


  return (
    <div className="flex flex-col min-h-screen bg-slate-100 dark:bg-slate-900">
      <nav className="bg-sky-600 dark:bg-slate-800 text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
                <div className="flex items-center">
                    <Link href="/" legacyBehavior>
                        <a className="text-2xl font-bold hover:text-sky-200 dark:hover:text-sky-300 transition-colors">MasterIn.org</a>
                    </Link>
                </div>
                <div className="hidden md:flex items-center space-x-1">
                    {allNavLinks.map(link => (
                        <NavLink key={link.href} href={link.href} currentPath={currentPath}>{link.label}</NavLink>
                    ))}
                </div>
                <div className="hidden md:flex items-center space-x-3">
                    {!isLoading && isAuthenticated && user ? (
                        <>
                            <NavLink href="/dashboard/profile" currentPath={currentPath}>
                                <UserCircleIcon className="h-5 w-5 inline mr-1" /> {user.email}
                            </NavLink>
                            <button
                                onClick={logout}
                                className="px-3 py-2 rounded-md text-sm font-medium text-sky-100 hover:bg-sky-700 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-sky-600 focus:ring-white"
                                title="Logout"
                            >
                                <ArrowLeftOnRectangleIcon className="h-5 w-5 inline mr-1" /> Logout
                            </button>
                        </>
                    ) : !isLoading && (
                        <>
                            <NavLink href="/login" currentPath={currentPath}>Login</NavLink>
                            <Link href="/signup" legacyBehavior>
                                <a className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-sky-600 focus:ring-white">
                                    Sign Up
                                </a>
                            </Link>
                        </>
                    )}
                    {isLoading && <div className="text-sm text-sky-100">Loading...</div>}
                </div>
                <div className="-mr-2 flex md:hidden">
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        type="button"
                        className="bg-sky-600 dark:bg-slate-800 inline-flex items-center justify-center p-2 rounded-md text-sky-200 dark:text-slate-300 hover:text-white hover:bg-sky-500 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-sky-600 dark:focus:ring-offset-slate-800 focus:ring-white"
                        aria-controls="mobile-menu"
                        aria-expanded={isMobileMenuOpen}
                    >
                        <span className="sr-only">Open main menu</span>
                        {isMobileMenuOpen ? <XMarkIcon className="block h-6 w-6" /> : <Bars3Icon className="block h-6 w-6" />}
                    </button>
                </div>
            </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
            <div className="md:hidden" id="mobile-menu">
                <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                    {allNavLinks.map(link => (
                        <NavLink key={link.href} href={link.href} currentPath={currentPath}>{link.label}</NavLink>
                    ))}
                </div>
                <div className="pt-4 pb-3 border-t border-sky-700 dark:border-slate-700">
                    {!isLoading && isAuthenticated && user ? (
                        <div className="px-2 space-y-1">
                            <NavLink href="/dashboard/profile" currentPath={currentPath}>
                                <UserCircleIcon className="h-5 w-5 inline mr-1" /> Profile ({user.email})
                            </NavLink>
                            <button
                                onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                                className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-sky-100 hover:bg-sky-700 hover:text-white"
                            >
                                <ArrowLeftOnRectangleIcon className="h-5 w-5 inline mr-1" /> Logout
                            </button>
                        </div>
                    ) : !isLoading && (
                        <div className="px-2 space-y-1">
                            <NavLink href="/login" currentPath={currentPath}>Login</NavLink>
                            <NavLink href="/signup" currentPath={currentPath}>Sign Up</NavLink>
                        </div>
                    )}
                    {isLoading && <div className="px-3 text-sm text-sky-100">Loading...</div>}
                </div>
            </div>
        )}
      </nav>

      <main className="flex-grow container mx-auto px-4 py-6 sm:px-6 lg:px-8 w-full">
        {children}
      </main>

      <footer className="bg-slate-200 border-t border-slate-300 text-slate-600 text-sm">
        <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 text-center">
            <div className="mb-2">
                <Link href="/about" legacyBehavior><a className="hover:text-sky-700 hover:underline px-2">About Us</a></Link>|
                <Link href="/contact" legacyBehavior><a className="hover:text-sky-700 hover:underline px-2">Contact</a></Link>|
                <Link href="/privacy" legacyBehavior><a className="hover:text-sky-700 hover:underline px-2">Privacy Policy</a></Link>|
                <Link href="/terms" legacyBehavior><a className="hover:text-sky-700 hover:underline px-2">Terms of Service</a></Link>
            </div>
            <p>&copy; {new Date().getFullYear()} MasterIn.org. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
