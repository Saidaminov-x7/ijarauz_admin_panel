// src/components/Layout.tsx
// Основной лэйаут: Sidebar слева + Header сверху + контент справа

import React from 'react';
import Sidebar from './Sidebar/Sidebar';
import Header from './Header/Header';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  return (
    <div className="flex h-screen overflow-hidden bg-app">
      {/* Боковое меню */}
      <Sidebar />

      {/* Основная область */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Верхняя панель */}
        <Header title={title} />

        {/* Контент страницы */}
        <main className="flex-1 overflow-y-auto p-6 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
