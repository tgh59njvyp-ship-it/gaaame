import React, { useState } from 'react';
import { CharacterState, AdventureLogEntry, LogCategory } from '../types';
import {
  Scroll,
  Swords,
  MapPin,
  Sparkles,
  Gift,
  Search,
  ArrowUpDown,
  Coins,
  Trophy,
  Compass,
  Award,
  Calendar,
  Filter
} from 'lucide-react';

interface AdventureLogProps {
  character: CharacterState;
  currentStage: number;
}

export const AdventureLog: React.FC<AdventureLogProps> = ({ character, currentStage }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortNewestFirst, setSortNewestFirst] = useState<boolean>(true);

  const logs = character.logs || [];

  // Filter logs
  const filteredLogs = logs.filter((log) => {
    const matchesCategory =
      selectedCategory === 'all' ||
      (selectedCategory === 'battle' && log.category === 'battle') ||
      (selectedCategory === 'floor' && log.category === 'floor') ||
      (selectedCategory === 'loot' && log.category === 'loot') ||
      (selectedCategory === 'quest' && (log.category === 'quest' || log.category === 'gacha')) ||
      (selectedCategory === 'event' && (log.category === 'event' || log.category === 'system'));

    const matchesSearch =
      searchTerm === '' ||
      log.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.stageInfo && log.stageInfo.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const sortedLogs = [...filteredLogs].sort((a, b) => {
    if (sortNewestFirst) {
      return b.id.localeCompare(a.id);
    }
    return a.id.localeCompare(b.id);
  });

  // Calculate summary metrics
  const totalBattleVictories = logs.filter((l) => l.category === 'battle').length;
  const totalRareLoot = logs.filter((l) => l.category === 'loot' && (l.rarity === 'rare' || l.rarity === 'epic' || l.rarity === 'legendary')).length;
  const totalFloorMoves = logs.filter((l) => l.category === 'floor').length;

  const getCategoryBadge = (category: LogCategory) => {
    switch (category) {
      case 'battle':
        return { label: '戦闘勝利', color: 'bg-rose-500/20 text-rose-400 border-rose-500/40', icon: Swords };
      case 'floor':
        return { label: '階層移動', color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40', icon: MapPin };
      case 'loot':
        return { label: '戦利品', color: 'bg-amber-500/20 text-amber-400 border-amber-500/40', icon: Sparkles };
      case 'quest':
        return { label: 'ギルド', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40', icon: Award };
      case 'gacha':
        return { label: '召喚', color: 'bg-purple-500/20 text-purple-400 border-purple-500/40', icon: Gift };
      case 'event':
        return { label: 'イベント', color: 'bg-blue-500/20 text-blue-400 border-blue-500/40', icon: Compass };
      default:
        return { label: 'システム', color: 'bg-slate-700/50 text-slate-300 border-slate-600', icon: Scroll };
    }
  };

  const getRarityBadge = (rarity?: 'common' | 'rare' | 'epic' | 'legendary') => {
    switch (rarity) {
      case 'legendary':
        return 'border-amber-500 text-amber-300 bg-amber-950/30';
      case 'epic':
        return 'border-purple-500 text-purple-300 bg-purple-950/30';
      case 'rare':
        return 'border-blue-500 text-blue-300 bg-blue-950/30';
      default:
        return 'border-[#2d2d30] text-[#aaa] bg-[#121215]';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-[#0f0f12] border border-[#2d2d30] rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#c4a661]/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
          <div>
            <div className="flex items-center gap-2 text-[#c4a661] text-xs font-mono uppercase tracking-widest mb-1">
              <Scroll className="w-4 h-4" /> CHRONICLES OF AETHER
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">冒険の記録 (ログ)</h1>
            <p className="text-sm text-[#888] mt-1">戦闘勝利・階層到達・レア戦利品など、これまでの冒険の足跡を記録。</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full md:w-auto">
            <div className="bg-[#151518] border border-[#2d2d30] p-3 rounded-xl text-center">
              <div className="text-[10px] text-[#777] font-mono">総ログ数</div>
              <div className="text-lg font-bold text-[#c4a661] font-mono">{logs.length} 件</div>
            </div>
            <div className="bg-[#151518] border border-[#2d2d30] p-3 rounded-xl text-center">
              <div className="text-[10px] text-[#777] font-mono">戦闘勝利</div>
              <div className="text-lg font-bold text-rose-400 font-mono">{totalBattleVictories} 回</div>
            </div>
            <div className="bg-[#151518] border border-[#2d2d30] p-3 rounded-xl text-center col-span-2 sm:col-span-1">
              <div className="text-[10px] text-[#777] font-mono">レア獲得</div>
              <div className="text-lg font-bold text-amber-400 font-mono">{totalRareLoot} 個</div>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pt-4 border-t border-[#2d2d30]">
          {/* Category tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {[
              { id: 'all', label: 'すべて' },
              { id: 'battle', label: '⚔️ 戦闘' },
              { id: 'floor', label: '🗺️ 階層' },
              { id: 'loot', label: '💎 ドロップ' },
              { id: 'quest', label: '📜 ギルド/ガチャ' },
              { id: 'event', label: '✨ その他' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 cursor-pointer ${
                  selectedCategory === tab.id
                    ? 'bg-[#c4a661] text-[#0a0a0c]'
                    : 'bg-[#151518] text-[#888] border border-[#2d2d30] hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search & Sort */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 md:w-48">
              <Search className="w-3.5 h-3.5 text-[#666] absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="ログを検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#151518] border border-[#2d2d30] focus:border-[#c4a661] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-[#555] outline-none"
              />
            </div>
            <button
              onClick={() => setSortNewestFirst(!sortNewestFirst)}
              className="p-2 bg-[#151518] border border-[#2d2d30] hover:border-[#c4a661] text-[#888] hover:text-white rounded-lg transition cursor-pointer flex items-center gap-1 text-xs"
              title="降順/昇順切替"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span className="hidden sm:inline font-mono text-[10px]">{sortNewestFirst ? '新着順' : '古い順'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Log Timeline List */}
      <div className="bg-[#0f0f12] border border-[#2d2d30] rounded-2xl p-6 md:p-8 shadow-2xl space-y-4">
        {sortedLogs.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <Scroll className="w-10 h-10 text-[#444] mx-auto" />
            <p className="text-sm text-[#777]">記録された冒険ログがありません。</p>
            <p className="text-xs text-[#555]">ダンジョンの探索や戦闘勝利、アイテム獲得を行うと自動で追加されます。</p>
          </div>
        ) : (
          <div className="relative border-l border-[#2d2d30] pl-4 md:pl-6 space-y-6 ml-2 md:ml-4">
            {sortedLogs.map((log) => {
              const badge = getCategoryBadge(log.category);
              const BadgeIcon = badge.icon;

              return (
                <div key={log.id} className="relative group animate-fadeIn">
                  {/* Timeline Dot */}
                  <div className="absolute -left-[21px] md:-left-[29px] top-1.5 w-3 h-3 rounded-full bg-[#0a0a0c] border-2 border-[#c4a661] group-hover:scale-125 transition"></div>

                  <div className={`p-4 md:p-5 rounded-xl border transition ${getRarityBadge(log.rarity)} hover:border-[#c4a661]/80 shadow-md space-y-2`}>
                    {/* Log Card Top */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono border flex items-center gap-1 ${badge.color}`}>
                          <BadgeIcon className="w-3 h-3" /> {badge.label}
                        </span>
                        {log.stageInfo && (
                          <span className="px-2 py-0.5 bg-[#1e1e24] border border-[#333] text-[10px] font-mono text-[#888] rounded">
                            {log.stageInfo}
                          </span>
                        )}
                      </div>

                      <div className="text-[10px] font-mono text-[#666] flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{log.time}</span>
                      </div>
                    </div>

                    {/* Title & Desc */}
                    <div>
                      <h3 className="text-sm font-bold text-white tracking-wide">{log.title}</h3>
                      <p className="text-xs text-[#aaa] mt-1 leading-relaxed">{log.description}</p>
                    </div>

                    {/* Rewards/Gains Footer if applicable */}
                    {(log.gold || log.exp || log.rarity) && (
                      <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-[#2d2d30]/60 text-[11px] font-mono">
                        {log.gold && (
                          <span className="text-amber-400 flex items-center gap-1">
                            <Coins className="w-3.5 h-3.5" /> +{log.gold} G
                          </span>
                        )}
                        {log.exp && (
                          <span className="text-indigo-300 flex items-center gap-1">
                            <Trophy className="w-3.5 h-3.5" /> +{log.exp} EXP
                          </span>
                        )}
                        {log.rarity && (
                          <span className="text-xs uppercase font-bold text-[#c4a661]">
                            [{log.rarity}]
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
