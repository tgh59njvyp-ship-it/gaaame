import React from 'react';
import { HubTab } from '../types';
import { Map, Award, Sparkles, Scroll, Backpack } from 'lucide-react';

interface HubTabsProps {
  activeTab: HubTab;
  onChangeTab: (tab: HubTab) => void;
}

export const HubTabs: React.FC<HubTabsProps> = ({ activeTab, onChangeTab }) => {
  const tabs = [
    { id: 'dungeon' as HubTab, label: '探索', desc: '迷宮へ挑む', icon: Map },
    { id: 'status' as HubTab, label: '装備袋', desc: '能力とバッグ', icon: Backpack },
    { id: 'gacha' as HubTab, label: 'ガチャ', desc: 'エーテル召喚', icon: Sparkles },
    { id: 'guild' as HubTab, label: 'クエスト', desc: 'ギルド依頼', icon: Award },
    { id: 'log' as HubTab, label: 'ログ', desc: '冒険の軌跡', icon: Scroll },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 px-2 pb-3 pt-1 bg-[#07070a]/90 md:bg-transparent md:pb-4 pointer-events-none">
      <div className="max-w-xl md:max-w-2xl mx-auto bg-[#0d0e12]/95 border border-[#2a2720] shadow-[0_-15px_35px_rgba(0,0,0,0.9)] p-1.5 rounded-2xl md:rounded-3xl flex items-center justify-around pointer-events-auto backdrop-blur-md">
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
                    ? 'bg-[#221e14] text-[#d4af37] scale-110 shadow-[0_0_12px_rgba(212,175,55,0.3)] border border-[#c4a661]'
                    : 'text-[#888378] hover:text-[#e2c98a] hover:bg-[#14151b]'
                }`}
              >
                <Icon className="w-5 h-5" />
                {isActive && (
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#d4af37] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#c4a661]"></span>
                  </span>
                )}
              </div>
              
              <span className={`text-[10px] font-bold tracking-widest mt-1.5 transition-colors ${
                isActive ? 'text-[#d4af37]' : 'text-[#706c62] group-hover:text-[#a09a8a]'
              }`}>
                {t.label}
              </span>

              {/* Glowing active bar beneath item */}
              {isActive && (
                <div className="absolute bottom-0 w-8 h-[3px] bg-gradient-to-r from-[#c4a661] via-[#f3e5be] to-[#c4a661] rounded-full shadow-[0_0_8px_rgba(212,175,55,0.8)]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
