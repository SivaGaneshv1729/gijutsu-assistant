import React from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden text-gray-900 dark:text-gray-100">
      <main className="flex-1 w-full h-full relative z-0">
        {children}
      </main>
    </div>
  );
}
