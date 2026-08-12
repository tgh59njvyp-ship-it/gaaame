import React from 'react';
import { CharacterState, FloorNode } from '../types';
import { STAGES } from '../data/gameData';
import { 
  Swords, Gift, ShoppingBag, Sparkles, Flame, Shield, Crown, 
  ChevronRight, Backpack, Trophy, Lock, CheckCircle2, Play
} from 'lucide-react';

interface StageMapProps {
  character: CharacterState;
  currentStage: number;
  floors: FloorNode[];
  onSelectFloor: (floor: FloorNode) => void;
  onOpenInventory: () => void;
  onOpenShopDirect?: () => void;
}

export const StageMap: React.FC<StageMapProps> = ({
  character,
  currentStage,
  floors,
  onSelectFloor,
  onOpenInventory,
}) => {
  const stageInfo = STAGES[currentStage - 1] || STAGES[0];
  const nextFloorIndex = floors.findIndex((f) => !f.completed);
  
  // Calculate completed floor percentage
  const completedCount = floors.filter(f => f.completed).length;
  const progressPercent = Math.min(100, Math.floor((completedCount / floors.length) * 100));

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
      return 'bg-slate-950/40 border-slate-900 text-slate-500';
    }
    if (isCurrent) {
      switch (type) {
        case 'boss': return 'bg-gradient-to-r from-red-950/90 to-[#220a0a] border-red-500/80 shadow-[0_0_20px_rgba(239,68,68,0.25)]';
        case 'elite': return 'bg-gradient-to-r from-orange-950/80 to-[#22100a] border-orange-500/80 shadow-[0_0_15px_rgba(249,115,22,0.2)]';
        case 'shop': return 'bg-gradient-to-r from-emerald-950/80 to-[#0a2215] border-emerald-500/80 shadow-[0_0_15px_rgba(16,185,129,0.2)]';
        case 'rest': return 'bg-gradient-to-r from-blue-950/80 to-[#0a1522] border-blue-500/80';
        default: return 'bg-gradient-to-r from-amber-950/70 to-slate-900 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.25)]';
      }
    }
    return 'bg-slate-900/30 border-slate-800/80 text-slate-400';
  };

  return (
    <div className="max-w-4xl mx-auto p-2 md:p-6 text-slate-100 space-y-6">
      {/* Top Status HUD */}
      <div className="bg-gradient-to-r from-[#0f1013] to-[#14161b] backdrop-blur border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-wrap items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none"></div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-orange-500 p-[1px] shadow-lg">
              <div className="w-full h-full rounded-[15px] bg-[#0c0d10] flex flex-col items-center justify-center font-bold">
                <span className="text-[9px] uppercase tracking-widest text-[#c4a661]">Lv</span>
                <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200 leading-none">{character.level}</span>
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 bg-indigo-600 border border-indigo-400 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider font-mono">
              HERO
            </div>
          </div>
          <div>
            <h2 className="font-black text-lg text-white flex items-center gap-2 tracking-tight">
              {character.name}
              <span className="text-[10px] font-bold text-indigo-300 bg-indigo-950/80 px-2 py-0.5 rounded-lg border border-indigo-800/50 uppercase tracking-widest">
                {character.classInfo.name.split(' ')[0]}
              </span>
            </h2>
            <div className="flex items-center gap-3 text-xs text-slate-400 font-mono mt-0.5">
              <span>所持金: <strong className="text-amber-400 font-bold">G {character.gold.toLocaleString()}</strong></span>
              <span className="text-slate-600">|</span>
              <span>EXP: {character.exp} / {character.maxExp}</span>
            </div>
          </div>
        </div>

        {/* HP / MP Bars */}
        <div className="flex flex-col gap-2 min-w-[220px] flex-1 max-w-sm">
          <div className="flex justify-between text-[11px] font-black tracking-wider">
            <span className="text-red-400 flex items-center gap-1 font-mono">
              HP: {character.hp} / {character.maxHp}
            </span>
            <span className="text-indigo-400 flex items-center gap-1 font-mono">
              MP: {character.mp} / {character.maxMp}
            </span>
          </div>
          {/* HP Bar */}
          <div className="relative w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-900 shadow-inner">
            <div 
              className="bg-gradient-to-r from-red-600 to-rose-500 h-full transition-all duration-500 rounded-full" 
              style={{ width: `${Math.max(0, Math.min(100, (character.hp / character.maxHp) * 100))}%` }} 
            />
          </div>
          {/* MP Bar */}
          <div className="relative w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-900 shadow-inner">
            <div 
              className="bg-gradient-to-r from-[#4f46e5] to-[#818cf8] h-full transition-all duration-500 rounded-full" 
              style={{ width: `${Math.max(0, Math.min(100, (character.mp / character.maxMp) * 100))}%` }} 
            />
          </div>
        </div>

        <button
          onClick={onOpenInventory}
          className="px-5 py-3 bg-[#171920] hover:bg-[#1f222b] text-slate-200 rounded-2xl border border-slate-800 hover:border-slate-700 flex items-center gap-2 text-xs font-bold transition-all cursor-pointer shadow-md transform hover:scale-[1.02]"
        >
          <Backpack className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>装備・ステータス</span>
        </button>
      </div>

      {/* Stage Banner with progress meter */}
      <div className={`rounded-3xl p-6 bg-gradient-to-r ${stageInfo.bg} border border-slate-800 shadow-2xl relative overflow-hidden`}>
        <div className="absolute -right-6 -bottom-6 opacity-5 text-white">
          <Trophy className="w-44 h-44" />
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-block px-3 py-1 bg-black/40 backdrop-blur text-[10px] font-black text-amber-400 rounded-full border border-amber-500/20 uppercase tracking-widest font-mono">
              STAGE {currentStage} / 5
            </span>
            <div className="text-xs font-bold text-amber-300 font-mono">
              遠征進捗: {progressPercent}% ({completedCount} / {floors.length} 階)
            </div>
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">{stageInfo.name}</h1>
            <p className="text-slate-300 text-xs md:text-sm max-w-xl leading-relaxed mt-1">{stageInfo.desc}</p>
          </div>
          
          {/* Progress track */}
          <div className="relative w-full bg-black/50 rounded-full h-2.5 p-[1px] border border-white/5">
            <div 
              className="bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-400 h-full transition-all duration-1000 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Interactive Connected Dungeon Route */}
      <div className="space-y-4">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
          ダンジョン探索ルート (フロア 1〜5)
        </h3>
        
        {/* Connected path container */}
        <div className="relative pl-6 md:pl-10 space-y-6">
          {/* Vertical Connection Line */}
          <div className="absolute top-6 bottom-6 left-[21px] md:left-[29px] w-1 bg-gradient-to-b from-emerald-500 via-amber-500 to-slate-800 rounded-full opacity-40 z-0"></div>

          {floors.map((floor, index) => {
            const isCurrent = index === nextFloorIndex;
            const isPast = floor.completed;
            const isFuture = index > nextFloorIndex;
            const status = isPast ? 'past' : isCurrent ? 'current' : 'future';

            return (
              <div
                key={floor.floorNumber}
                onClick={() => isCurrent && onSelectFloor(floor)}
                className={`relative flex items-center justify-between p-4 md:p-5 rounded-2xl border transition-all duration-300 ${getFloorBg(floor.type, isCurrent, isPast)} ${
                  isCurrent
                    ? 'ring-2 ring-amber-400 shadow-xl cursor-pointer transform hover:scale-[1.015]'
                    : isPast
                    ? 'opacity-70'
                    : 'opacity-40 cursor-not-allowed'
                }`}
              >
                {/* Node circle on the line */}
                <div 
                  className={`absolute -left-[27px] md:-left-[35px] w-10 h-10 rounded-full flex items-center justify-center bg-[#0d0e12] border-2 transition-all duration-300 z-10 ${
                    isPast 
                      ? 'border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]' 
                      : isCurrent 
                        ? 'border-amber-400 bg-amber-950 scale-110 shadow-[0_0_12px_rgba(245,158,11,0.6)] animate-pulse' 
                        : 'border-slate-800'
                  }`}
                >
                  {getFloorIcon(floor.type, status)}
                </div>

                <div className="flex items-center gap-4 pl-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[9px] font-mono font-black px-2 py-0.5 rounded border uppercase tracking-wider ${
                        isPast 
                          ? 'bg-slate-900/50 text-slate-500 border-slate-800' 
                          : isCurrent 
                            ? 'bg-amber-500/10 text-amber-300 border-amber-500/40' 
                            : 'bg-slate-950/60 text-slate-600 border-slate-900'
                      }`}>
                        第 {floor.floorNumber} 階層
                      </span>
                      <h4 className={`font-black text-sm md:text-base tracking-wide ${
                        isPast ? 'text-slate-500 line-through' : 'text-white'
                      }`}>
                        {getFloorName(floor.type)}
                      </h4>
                    </div>
                    <p className={`text-xs mt-1 max-w-xl leading-relaxed ${isPast ? 'text-slate-600' : 'text-slate-400'}`}>
                      {floor.type === 'boss' ? 'このエリアを支配するボスの部屋。勝利すれば次のステージが開放。' : 
                       floor.type === 'elite' ? '稀有な武具や大量のゴールドを蓄えた強力なエリート魔物の棲家。' :
                       floor.type === 'shop' ? '迷宮に潜む闇商人。ゴールドを支払って装備品や回復薬を購入可能。' :
                       floor.type === 'rest' ? '静寂が保たれた安全地帯。HPとMPを一定値まで回復し、戦術を練り直す。' :
                       floor.type === 'event' ? '古代文明の遺物や精霊と遭遇する、結果予測不能な神秘エリア。' :
                       floor.type === 'treasure' ? '封印されし宝箱が安置された部屋。罠に注意しつつ富を得よ。' : '迷宮の魔物が徘徊する激戦区。勝利して経験値とゴールドを獲得。'}
                    </p>
                  </div>
                </div>

                <div className="ml-4 flex-shrink-0">
                  {isPast && (
                    <span className="text-[10px] font-black bg-emerald-950/30 text-emerald-400 px-3 py-1.5 rounded-xl border border-emerald-900/40 uppercase tracking-widest font-mono">
                      CLEARED
                    </span>
                  )}
                  {isCurrent && (
                    <button className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center gap-1.5 transition-all transform hover:scale-105 active:scale-95 animate-pulse cursor-pointer">
                      <Play className="w-3.5 h-3.5 fill-current" />
                      進む
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                  {isFuture && (
                    <span className="text-[10px] font-black text-slate-600 bg-slate-950/30 px-3 py-1.5 rounded-xl border border-slate-900 uppercase tracking-widest font-mono">
                      LOCKED
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
