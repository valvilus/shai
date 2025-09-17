'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  MagnifyingGlassIcon,
  PhoneIcon,
  ChartBarIcon,
  DocumentTextIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

interface SidebarProps {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Sidebar = ({ sidebarOpen, sidebarCollapsed, setSidebarOpen }: SidebarProps) => {
  const router = useRouter();

  const navigationItems = [
    {
      icon: PhoneIcon,
      label: 'Звонки',
      href: '/calls',
      description: 'Все записи звонков',
      active: true,
    },
    {
      icon: ChartBarIcon,
      label: 'Дашборд',
      href: '/dashboard',
      description: 'Общая аналитика',
      active: false,
    },
    {
      icon: DocumentTextIcon,
      label: 'Аналитика',
      href: '/analytics',
      description: 'Подробная аналитика',
      active: false,
    },
    {
      icon: UserGroupIcon,
      label: 'Отчеты',
      href: '/reports',
      description: 'Отчеты и экспорт',
      active: false,
    },
  ];

  const handleNavigation = (href: string) => {
    router.push(href);
    setSidebarOpen(false);
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-100 transform transition-all duration-300 ease-in-out lg:translate-x-0 flex flex-col ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } ${
        sidebarCollapsed ? 'w-16' : 'w-80'
      }`}
    >
      {/* Logo Section - адаптивная */}
      <div className={`flex items-center h-20 border-b border-gray-100 transition-all duration-300 ${
        sidebarCollapsed ? 'px-3 justify-center' : 'px-8'
      }`}>
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-base">CA</span>
          </div>
          {!sidebarCollapsed && (
            <div>
              <h1 className="text-xl font-bold text-gray-900">Call Analytics</h1>
              <p className="text-sm text-gray-500">153 members</p>
            </div>
          )}
        </div>
      </div>

      {/* Search - адаптивный */}
      {!sidebarCollapsed && (
        <div className="p-6">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Найти что-то..."
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm bg-gray-50"
            />
          </div>
        </div>
      )}
      
      {sidebarCollapsed && (
        <div className="p-3 flex justify-center">
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Поиск">
            <MagnifyingGlassIcon className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Navigation - адаптивная */}
      <nav className={`flex-1 space-y-1 transition-all duration-300 ${
        sidebarCollapsed ? 'px-2' : 'px-6'
      }`}>
        {!sidebarCollapsed && (
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 px-3">
            МЕНЮ
          </div>
        )}
        {navigationItems.map((item, index) => (
          <button
            key={index}
            onClick={() => handleNavigation(item.href)}
            className={`w-full flex items-center rounded-lg text-sm font-medium transition-all duration-200 relative ${
              sidebarCollapsed 
                ? 'justify-center p-3' 
                : 'space-x-3 px-4 py-2.5'
            } ${
              item.active
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
            title={sidebarCollapsed ? item.label : undefined}
          >
            {item.active && !sidebarCollapsed && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gray-900 rounded-r-full"></div>
            )}
            <item.icon className="h-5 w-5" />
            {!sidebarCollapsed && (
              <span className="text-sm">{item.label}</span>
            )}
          </button>
        ))}
      </nav>

      {/* User Section - адаптивная */}
      <div className={`border-t border-gray-100 transition-all duration-300 mt-auto ${
        sidebarCollapsed ? 'p-3' : 'p-6'
      }`}>
        <div className={`flex items-center ${
          sidebarCollapsed ? 'justify-center' : 'space-x-3'
        }`}>
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-semibold text-gray-700" title={sidebarCollapsed ? 'Admin User' : undefined}>
            AU
          </div>
          {!sidebarCollapsed && (
            <div>
              <div className="text-sm font-medium text-gray-900">Admin User</div>
              <div className="text-xs text-gray-500">admin@example.com</div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;


