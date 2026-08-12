import React, { useState } from 'react';
import { CharacterState, FloorNode, Enemy } from '../types';
import { STAGES } from '../data/gameData';
import { 
  ELEMENTAL_TOWERS, 
  TREASURE_VAULT_INFO, 
  WORLD_BOSS_RAID_INFO, 
  generateEndlessFloors,
  DungeonCategory 
} from '../data/dungeonModesData';
import { 
  Swords, Gift, ShoppingBag, Sparkles, Flame, Shield, Crown, 
  ChevronRight, Backpack, Trophy, Lock, CheckCircle2, Play,
  Zap, Coins, Layers, Compass, Crosshair, Award, RotateCcw,
  AlertTriangle, ArrowUpRight, Ticket
} from 'lucide-react';

interface StageMapProps {
  character: CharacterState;
  currentStage: number;
  floors: FloorNode[];
  onSelectFloor: (floor: FloorNode) => void;
  onOpenInventory: () => void;
  onUpdateCharacter?: (char: CharacterState) => void;
  onShowMessage?: (msg: string) => void;
  onSelectSpecialBattle?: (enemy: Enemy) => void;
  onLoadSpecialFloors?: (floors: FloorNode[], stageName: string) => void;
  onOpenRoulette?: () => void;
  onOpenBeginnerQuests?: () => void;
}

export const StageMap: React.FC<StageMapProps> = ({
  character,
  currentStage,
  floors,
  onSelectFloor,
  onOpenInventory,
  onUpdateCharacter,
  onShowMessage,
  onSelectSpecialBattle,
  onLoadSpecialFloors,
  onOpenRoulette,
  onOpenBeginnerQuests,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<DungeonCategory>('story');
  const [endlessDepth, setEndlessDepth] = useState<number>(1);

  const stageInfo = STAGES[currentStage - 1] || STAGES[0];
  const nextFloorIndex = floors.findIndex((f) => !f.completed);
  
  // Calculate completed floor percentage
  const completedCount = floors.filter(f => f.completed).length;
  const progressPercent = Math.min(100, Math.floor((completedCount / (floors.length || 1)) * 100));

  const getFloorIcon = (type: FloorNode['type'], status: 'past' | 'current' | 'future') => {
    if (status === 'past') {
      return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
    }
    if (status === 'future') {
      return <Lock className="w-4 h-4 text-slate-600" />;
    }

    switch (type) {
      case 'battle': return <Swords className="w-5 h-5 text-red-400" />;
      case 'elite': return <Flame className="w-5 h-5 text-orange-400 animate-pulse" />;
      case 'treasure': return <Gift className="w-5 h-5 text-amber-400" />;
      case 'shop': return <ShoppingBag className="w-5 h-5 text-emerald-400" />;
      case 'event': return <Sparkles className="w-5 h-5 text-purple-400" />;
      case 'rest': return <Shield className="w-5 h-5 text-blue-400" />;
      case 'boss': return <Crown className="w-6 h-6 text-yellow-400 animate-bounce" />;
    }
  };

  const getFloorName = (type: FloorNode['type']) => {
    switch (type) {
      case 'battle': return '通常戦闘';
      case 'elite': return '強敵（エリート）';
      case 'treasure': return '宝箱の部屋';
      case 'shop': return '旅の商人ショップ';
      case 'event': return '神秘のエーテルイベント';
      case 'rest': return 'キャンプ（休息・回復）';
      case 'boss': return '深層ボス決戦';
    }
  };

  const getFloorBg = (type: FloorNode['type'], isCurrent: boolean, isPast: boolean) => {
    if (isPast) {
      return 'bg-[#0a0a0d] border-[#1f1d18] text-[#666]';
    }
    if (isCurrent) {
      switch (type) {
        case 'boss': return 'bg-gradient-to-r from-[#200a0a] to-[#0d0707] border-red-500/80 shadow-[0_0_20px_rgba(239,68,68,0.25)]';
        case 'elite': return 'bg-gradient-to-r from-[#22100a] to-[#0c0806] border-orange-500/80 shadow-[0_0_15px_rgba(249,115,22,0.2)]';
        case 'shop': return 'bg-gradient-to-r from-[#0a2215] to-[#060e0a] border-emerald-500/80 shadow-[0_0_15px_rgba(16,185,129,0.2)]';
        case 'rest': return 'bg-gradient-to-r from-[#0a1522] to-[#060a0f] border-blue-500/80';
        default: return 'bg-gradient-to-r from-[#211b0e] to-[#0d0c09] border-[#c4a661] shadow-[0_0_15px_rgba(212,175,55,0.25)]';
      }
    }
    return 'bg-[#08090c] border-[#1e1c17] text-[#888378]';
  };

  return (
    <div className="max-w-4xl mx-auto p-2 md:p-6 text-[#e2e2e2] space-y-6 pb-24">
      {/* Top Status HUD */}
      <div className="bg-[#0b0c10] border border-[#2a2720] rounded-3xl p-5 shadow-2xl flex flex-wrap items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#b89542] via-[#d4af37] to-[#f3e5be] p-[1px] shadow-lg">
              <div className="w-full h-full rounded-[15px] bg-[#0c0d10] flex flex-col items-center justify-center font-bold">
                <span className="text-[9px] uppercase tracking-widest text-[#c4a661]">Lv</span>
                <span className="text-xl font-black text-[#d4af37] leading-none">{character.level}</span>
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 bg-[#221c10] border border-[#c4a661] text-[#f3e5be] text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider font-mono">
              HERO
            </div>
          </div>
          <div>
            <h2 className="font-black text-lg text-[#f3e5be] flex items-center gap-2 tracking-tight">
              {character.name}
              <span className="text-[10px] font-bold text-[#d4af37] bg-[#1d1912] px-2 py-0.5 rounded-lg border border-[#3a3322] uppercase tracking-widest">
                {character.classInfo.name.split(' ')[0]}
              </span>
            </h2>
            <div className="flex flex-wrap items-center gap-2.5 text-xs text-[#a09a8a] font-mono mt-0.5">
              <span>💎 <strong>{(character.gems || 0).toLocaleString()}</strong></span>
              <span className="text-[#444]">|</span>
              <span>金貨: <strong className="text-[#d4af37]">G {character.gold.toLocaleString()}</strong></span>
              <span className="text-[#444]">|</span>
              <span>10連券: <strong className="text-indigo-300">{character.gacha10Tickets || 0}枚</strong></span>
            </div>
          </div>
        </div>

        {/* HP / MP Bars */}
        <div className="flex flex-col gap-2 min-w-[200px] flex-1 max-w-sm">
          <div className="flex justify-between text-[11px] font-black tracking-wider">
            <span className="text-[#e2c98a] flex items-center gap-1 font-mono">
              HP: {character.hp} / {character.maxHp}
            </span>
            <span className="text-[#c4a661] flex items-center gap-1 font-mono">
              MP: {character.mp} / {character.maxMp}
            </span>
          </div>
          <div className="relative w-full bg-[#050508] rounded-full h-2.5 overflow-hidden border border-[#222] shadow-inner">
            <div 
              className="bg-gradient-to-r from-[#9e7d33] via-[#c4a661] to-[#f3e5be] h-full transition-all duration-500 rounded-full" 
              style={{ width: `${Math.max(0, Math.min(100, (character.hp / character.maxHp) * 100))}%` }} 
            />
          </div>
          <div className="relative w-full bg-[#050508] rounded-full h-2.5 overflow-hidden border border-[#222] shadow-inner">
            <div 
              className="bg-gradient-to-r from-[#5a4c28] via-[#8c7438] to-[#e2c98a] h-full transition-all duration-500 rounded-full" 
              style={{ width: `${Math.max(0, Math.min(100, (character.mp / character.maxMp) * 100))}%` }} 
            />
          </div>
        </div>

        {/* Action Buttons Header */}
        <div className="flex items-center gap-2 flex-wrap">
          {onOpenRoulette && (
            <button
              onClick={onOpenRoulette}
              className="px-3.5 py-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.4)] animate-pulse cursor-pointer"
            >
              <Gift className="w-4 h-4" />
              <span>ログボルーレット</span>
            </button>
          )}

          {onOpenBeginnerQuests && (
            <button
              onClick={onOpenBeginnerQuests}
              className="px-3.5 py-2 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500 text-emerald-300 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Award className="w-4 h-4 text-emerald-400" />
              <span>初心者ミッション (20連)</span>
            </button>
          )}

          <button
            onClick={onOpenInventory}
            className="px-3.5 py-2 bg-[#14151a] hover:bg-[#1d1f26] text-[#c4a661] rounded-xl border border-[#3a3528] hover:border-[#c4a661] flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer shadow-md"
          >
            <Backpack className="w-4 h-4 text-[#d4af37]" />
            <span>装備</span>
          </button>
        </div>
      </div>

      {/* DUNGEON CATEGORY SELECTOR TABS */}
      <div className="bg-[#0b0c10] p-2 rounded-2xl border border-[#2a2720] flex flex-wrap items-center justify-between gap-1 shadow-xl">
        <button
          onClick={() => setSelectedCategory('story')}
          className={`flex-1 min-w-[110px] py-2.5 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            selectedCategory === 'story'
              ? 'bg-[#221d12] text-[#d4af37] border border-[#c4a661] shadow-[0_0_10px_rgba(212,175,55,0.2)]'
              : 'text-[#888378] hover:text-[#e2c98a] hover:bg-[#121318]'
          }`}
        >
          <Compass className="w-4 h-4 text-[#d4af37]" />
          <span>🏰 ストーリー</span>
        </button>

        <button
          onClick={() => setSelectedCategory('event')}
          className={`flex-1 min-w-[110px] py-2.5 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            selectedCategory === 'event'
              ? 'bg-amber-950/60 text-amber-300 border border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
              : 'text-amber-400/80 hover:text-amber-300 hover:bg-[#121318]'
          }`}
        >
          <Trophy className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>🏆 1ヶ月限定イベント</span>
        </button>

        <button
          onClick={() => setSelectedCategory('elemental')}
          className={`flex-1 min-w-[110px] py-2.5 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            selectedCategory === 'elemental'
              ? 'bg-[#221d12] text-[#d4af37] border border-[#c4a661] shadow-[0_0_10px_rgba(212,175,55,0.2)]'
              : 'text-[#888378] hover:text-[#e2c98a] hover:bg-[#121318]'
          }`}
        >
          <Zap className="w-4 h-4 text-amber-400" />
          <span>⚡ 属性試練の塔</span>
        </button>

        <button
          onClick={() => setSelectedCategory('endless')}
          className={`flex-1 min-w-[110px] py-2.5 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            selectedCategory === 'endless'
              ? 'bg-[#221d12] text-[#d4af37] border border-[#c4a661] shadow-[0_0_10px_rgba(212,175,55,0.2)]'
              : 'text-[#888378] hover:text-[#e2c98a] hover:bg-[#121318]'
          }`}
        >
          <Layers className="w-4 h-4 text-purple-400" />
          <span>🌀 無限回廊</span>
        </button>

        <button
          onClick={() => setSelectedCategory('vault')}
          className={`flex-1 min-w-[110px] py-2.5 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            selectedCategory === 'vault'
              ? 'bg-[#221d12] text-[#d4af37] border border-[#c4a661] shadow-[0_0_10px_rgba(212,175,55,0.2)]'
              : 'text-[#888378] hover:text-[#e2c98a] hover:bg-[#121318]'
          }`}
        >
          <Coins className="w-4 h-4 text-yellow-400" />
          <span>💰 宝物庫</span>
        </button>

        <button
          onClick={() => setSelectedCategory('raid')}
          className={`flex-1 min-w-[110px] py-2.5 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            selectedCategory === 'raid'
              ? 'bg-[#221d12] text-[#d4af37] border border-[#c4a661] shadow-[0_0_10px_rgba(212,175,55,0.2)]'
              : 'text-[#888378] hover:text-[#e2c98a] hover:bg-[#121318]'
          }`}
        >
          <Crosshair className="w-4 h-4 text-red-400" />
          <span>🔥 世界ボス</span>
        </button>
      </div>

      {/* 1. STORY DUNGEONS */}
      {selectedCategory === 'story' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Stage Banner with progress meter */}
          <div className={`rounded-3xl p-6 bg-gradient-to-r ${stageInfo.bg} border border-[#2a2720] shadow-2xl relative overflow-hidden`}>
            <div className="absolute -right-6 -bottom-6 opacity-5 text-white">
              <Trophy className="w-44 h-44" />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#d4af37] uppercase tracking-widest mb-1">
                  <span>STAGE {currentStage}</span>
                  <span className="text-[#666]">•</span>
                  <span>推奨レベル Lv.{currentStage * 2 - 1}+</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">{stageInfo.name}</h1>
                <p className="text-xs text-[#a09a8a] mt-1 max-w-xl leading-relaxed">{stageInfo.desc}</p>
              </div>

              {/* Progress Bar */}
              <div className="bg-[#0a0b0e]/80 border border-[#222] p-3.5 rounded-2xl min-w-[200px] shadow-inner">
                <div className="flex justify-between items-center text-xs mb-1.5 font-bold font-mono">
                  <span className="text-[#a09a8a]">階層踏破度</span>
                  <span className="text-[#d4af37]">{progressPercent}%</span>
                </div>
                <div className="w-full bg-[#15161c] rounded-full h-2 overflow-hidden border border-[#28251e]">
                  <div className="bg-gradient-to-r from-[#b89542] to-[#f3e5be] h-full transition-all duration-300" style={{ width: `${progressPercent}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Floor Node List */}
          <div className="space-y-2">
            {floors.map((floor, idx) => {
              const isCurrent = idx === nextFloorIndex;
              const isPast = floor.completed;
              const status = isPast ? 'past' : isCurrent ? 'current' : 'future';

              return (
                <div
                  key={floor.floorNumber}
                  onClick={() => {
                    if (isCurrent) onSelectFloor(floor);
                  }}
                  className={`p-4 rounded-2xl border flex items-center justify-between gap-4 transition-all duration-300 ${getFloorBg(floor.type, isCurrent, isPast)} ${
                    isCurrent ? 'scale-[1.01] cursor-pointer hover:brightness-110' : 'opacity-80'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#0e0f14] border border-[#222] flex items-center justify-center shrink-0">
                      {getFloorIcon(floor.type, status)}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-[#c4a661]">
                          FLOOR {floor.floorNumber}
                        </span>
                        <span className="text-xs font-bold text-white">
                          {getFloorName(floor.type)}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#888378] mt-0.5">
                        {floor.completed ? 'クリア済み' : isCurrent ? '進軍可能！タップして突入' : 'ロック中'}
                      </p>
                    </div>
                  </div>

                  {isCurrent && (
                    <button className="px-4 py-2 bg-gradient-to-r from-[#b89542] via-[#d4af37] to-[#f3e5be] text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center gap-1 cursor-pointer hover:scale-105">
                      <span>進撃</span>
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. 1-MONTH LIMITED EVENT */}
      {selectedCategory === 'event' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="p-6 bg-gradient-to-r from-amber-950 via-orange-950 to-amber-950 border-2 border-amber-400 rounded-3xl shadow-[0_0_40px_rgba(245,158,11,0.25)] relative overflow-hidden">
            <div className="flex items-center justify-between flex-wrap gap-4 mb-3">
              <span className="px-3 py-1 bg-amber-400 text-slate-950 font-black text-xs rounded-full font-mono">
                🏆 1ヶ月限定アニバーサリーイベント開催中！
              </span>
              <span className="text-xs font-mono font-bold text-amber-300">
                イベント残り期間: 残り 29日 23時間
              </span>
            </div>

            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">『創世の神域と幻影の星辰』</h2>
            <p className="text-xs text-amber-200/90 leading-relaxed mt-2 max-w-2xl">
              1ヶ月間限りの大限定イベント！イベントボス討伐で【創世の星屑】トークンと大ジェムを獲得し、限定SSR武器や10連ガチャ券を全GET！
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <button
                onClick={() => {
                  if (onSelectSpecialBattle) {
                    onSelectSpecialBattle({
                      id: 'event_boss_dragon',
                      name: '【創世ボス】 神竜 アカシック・ドラゴン',
                      level: 10,
                      hp: 3500,
                      maxHp: 3500,
                      atk: 120,
                      def: 40,
                      spd: 25,
                      expReward: 2500,
                      goldReward: 3000,
                      sprite: 'Crown',
                      isBoss: true,
                    });
                  }
                }}
                className="px-6 py-3.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 font-black text-xs rounded-2xl shadow-xl flex items-center gap-2 cursor-pointer hover:scale-105 animate-pulse"
              >
                <Swords className="w-4 h-4" />
                <span>【限定ボス決戦】 アカシック・ドラゴンに挑む！ (ジェム&トークン泥)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. ELEMENTAL TOWERS */}
      {selectedCategory === 'elemental' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
          {ELEMENTAL_TOWERS.map((tower) => (
            <div key={tower.id} className={`p-5 rounded-3xl bg-gradient-to-r ${tower.bg} border border-[#2a2720] shadow-xl flex flex-col justify-between space-y-4`}>
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono text-amber-400">{tower.element}</span>
                  <span className="text-[10px] text-slate-400 font-mono">推奨Lv.{tower.recommendedLv}</span>
                </div>
                <h3 className="text-lg font-black text-white mt-1">{tower.name}</h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{tower.desc}</p>
              </div>

              <button
                onClick={() => {
                  if (onSelectSpecialBattle) {
                    onSelectSpecialBattle(tower.boss);
                  }
                }}
                className="w-full py-3 bg-[#15161c] hover:bg-[#1f2029] border border-amber-500/50 text-amber-300 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition"
              >
                <Crown className="w-4 h-4 text-amber-400" />
                <span>階層ボス「{tower.boss.name}」に挑む</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 4. ENDLESS CORRIDOR */}
      {selectedCategory === 'endless' && (
        <div className="p-6 bg-gradient-to-r from-purple-950 to-slate-950 border border-purple-500/50 rounded-3xl space-y-4 shadow-2xl animate-fadeIn">
          <div className="flex items-center gap-3">
            <Layers className="w-8 h-8 text-purple-400 animate-pulse" />
            <div>
              <h2 className="text-xl font-black text-white">🌀 無限深層の回廊</h2>
              <p className="text-xs text-slate-300 mt-0.5">限界無き階層。進むほどに敵が強大化し、報酬ジェムが無限増加！</p>
            </div>
          </div>

          <button
            onClick={() => {
              if (onLoadSpecialFloors) {
                const generated = generateEndlessFloors(endlessDepth);
                onLoadSpecialFloors(generated, `無限回廊 深層 ${endlessDepth}F`);
              }
            }}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-xs rounded-2xl shadow-xl flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01]"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>無限回廊（深層 {endlessDepth}F〜）に突入する</span>
          </button>
        </div>
      )}

      {/* 5. GOLD VAULT */}
      {selectedCategory === 'vault' && (
        <div className="p-6 bg-gradient-to-r from-amber-950 to-slate-950 border border-yellow-500/50 rounded-3xl space-y-4 shadow-2xl animate-fadeIn">
          <div className="flex items-center gap-3">
            <Coins className="w-8 h-8 text-yellow-400 animate-bounce" />
            <div>
              <h2 className="text-xl font-black text-white">{TREASURE_VAULT_INFO.name}</h2>
              <p className="text-xs text-slate-300 mt-0.5">{TREASURE_VAULT_INFO.desc}</p>
            </div>
          </div>

          <button
            onClick={() => {
              if (onSelectSpecialBattle) {
                onSelectSpecialBattle(TREASURE_VAULT_INFO.boss);
              }
            }}
            className="w-full py-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs rounded-2xl shadow-xl flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01]"
          >
            <Coins className="w-4 h-4" />
            <span>黄金のミミックを討伐して大量ゴールド＆ジェム回収！</span>
          </button>
        </div>
      )}

      {/* 6. WORLD RAID BOSS */}
      {selectedCategory === 'raid' && (
        <div className="p-6 bg-gradient-to-r from-red-950 via-rose-950 to-slate-950 border border-red-500/50 rounded-3xl space-y-4 shadow-2xl animate-fadeIn">
          <div className="flex items-center gap-3">
            <Crosshair className="w-8 h-8 text-red-400 animate-pulse" />
            <div>
              <h2 className="text-xl font-black text-white">{WORLD_BOSS_RAID_INFO.name}</h2>
              <p className="text-xs text-slate-300 mt-0.5">{WORLD_BOSS_RAID_INFO.desc}</p>
            </div>
          </div>

          <button
            onClick={() => {
              if (onSelectSpecialBattle) {
                onSelectSpecialBattle({
                  id: WORLD_BOSS_RAID_INFO.id,
                  name: WORLD_BOSS_RAID_INFO.name,
                  level: 15,
                  hp: WORLD_BOSS_RAID_INFO.hp,
                  maxHp: WORLD_BOSS_RAID_INFO.maxHp,
                  atk: WORLD_BOSS_RAID_INFO.atk,
                  def: WORLD_BOSS_RAID_INFO.def,
                  spd: WORLD_BOSS_RAID_INFO.spd,
                  expReward: 3500,
                  goldReward: 5000,
                  sprite: WORLD_BOSS_RAID_INFO.sprite,
                  isBoss: true,
                });
              }
            }}
            className="w-full py-4 bg-gradient-to-r from-red-600 via-rose-600 to-orange-500 text-white font-black text-xs rounded-2xl shadow-xl flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01]"
          >
            <Swords className="w-4 h-4" />
            <span>【世界ボス決戦】 神竜アストラガルドに挑む！</span>
          </button>
        </div>
      )}
    </div>
  );
};
