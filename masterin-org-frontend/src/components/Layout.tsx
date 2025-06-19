import React, { ReactNode } from 'react';

type LayoutProps = {
  children: ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <nav className="bg-blue-700 text-white p-4">
        <div className="container mx-auto flex justify-between">
          <div className="text-lg font-bold">MasterIn</div>
          <ul className="flex space-x-4">
            <li><a href="/" className="hover:text-gray-300">Home</a></li>
            <li><a href="/learning-path" className="hover:text-gray-300">Learning Path</a></li>
            <li><a href="/marketplace" className="hover:text-gray-300">Marketplace</a></li>
            <li><a href="/tools" className="hover:text-gray-300">AI Tools</a></li>
            <li><a href="/dashboard" className="hover:text-gray-300">Dashboard</a></li>
          </ul>
        </div>
      </nav>

      <main className="flex-grow container mx-auto p-4">
        {children}
      </main>

      <footer className="bg-slate-100 text-center p-4 mt-auto">
        <p>&copy; {new Date().getFullYear()} MasterIn. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Layout;
