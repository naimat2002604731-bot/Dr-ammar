import React from 'react';
import { Calendar, Pill, Bot, History, User } from 'lucide-react';

export type TabType = 'today' | 'medications' | 'chat' | 'history' | 'profile';

interface NavigationProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  pendingDosesCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onTabChange,
  pendingDosesCount,
}) => {
  const tabs = [
    {
      id: 'today' as TabType,
      label: 'جرعات اليوم',
      icon: Calendar,
      badge: pendingDosesCount > 0 ? pendingDosesCount : undefined,
    },
    {
      id: 'medications' as TabType,
      label: 'أدويتي',
      icon: Pill,
    },
    {
      id: 'chat' as TabType,
      label: 'د. عمار AI',
      icon: Bot,
      highlight: true,
    },
    {
      id: 'history' as TabType,
      label: 'سجل الالتزام',
      icon: History,
    },
    {
      id: 'profile' as TabType,
      label: 'الملف الطبي',
      icon: User,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 max-w-3xl mx-auto shadow-lg">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          if (tab.highlight) {
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className="relative -top-3 flex flex-col items-center group cursor-pointer focus:outline-none"
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-md ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-blue-300 scale-105 ring-4 ring-blue-100'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200 hover:scale-105'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={`text-[11px] font-bold mt-1 transition-colors ${
                    isActive ? 'text-blue-600' : 'text-slate-500'
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-200 cursor-pointer relative ${
                isActive
                  ? 'text-blue-600 font-bold bg-blue-50/80'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {tab.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 bg-amber-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center shadow-xs">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] mt-1">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
