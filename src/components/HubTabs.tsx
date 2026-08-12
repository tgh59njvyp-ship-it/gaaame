import React from 'react';
import { HubTab } from '../types';
import { Map, Award, Sparkles, Scroll, Backpack } from 'lucide-react';

interface HubTabsProps {
  activeTab: HubTab;
  onChangeTab: (tab: HubTab) => void;
}

export const HubTabs: React.FC<HubTabsProps> = ({ activeTab, onChangeTab }) => {
  const tabs = [
    { id: 'dungeon' as HubTab, label: '探索', desc: '迷宮へ挑む', icon: Map, color: 'hover:text-amber-400' },
    { id: 'status' as HubTab, label: '装備袋', desc: '能力とバッグ', icon: Backpack, color: 'hover:text-[#c4a661]' },
    { id: 'gacha' as HubTab, label: 'ガチャ', desc: 'エーテル召喚', icon: Sparkles, color: 'hover:text-purple-400' },
    { id: 'guild' as HubTab, label: 'クエスト', desc: 'ギルド依頼', icon: Award, color: 'hover:text-blue-400' },
    { id: 'log' as HubTab, label: 'ログ', desc: '冒険の軌跡', icon: Scroll, color: 'hover:text-emerald-400' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 px-2 pb-3 pt-1 bg-[#0b0c10]/95 md:bg-transparent md:pb-4 pointer-events-none">
      <div className="max-w-xl md:max-w-2xl mx-auto bg-[#0f1115]/95 md:bg-[#0c0d12]/95 border border-slate-800/90 shadow-[0_-15px_35px_rgba(0,0,0,0.85)] p-1.5 rounded-2xl md:rounded-3xl flex items-center justify-around pointer-events-auto backdrop-blur-md">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onChangeTab(t.id)}
              className="flex-1 flex flex-col items-center justify-center py-2 px-1 transition-all relative group cursor-pointer"
            >
              <div 
                className={`p-1.5 rounded-xl transition-all duration-300 relative ${
                  isActive
                    ? 'bg-gradient-to-tr from-amber-500/20 to-yellow-500/10 text-amber-400 scale-110 shadow-[0_0_10px_rgba(245,158,11,0.2)] border border-amber-500/30'
                    : `text-slate-400 ${t.color} hover:bg-slate-900/40`
                }`}
              >
                <Icon className="w-5 h-5" />
                {isActive && (
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                )}
              </div>
              
              <span className={`text-[10px] font-black tracking-widest mt-1.5 transition-colors ${
                isActive ? 'text-amber-400' : 'text-slate-500 group-hover:text-slate-300'
              }`}>
                {t.label}
              </span>

              {/* Glowing active bar beneath item */}
              {isActive && (
                <div className="absolute bottom-0 w-8 h-[3px] bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.6)] animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
