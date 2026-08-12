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
import { executeStageSweep, SweepResult } from '../utils/sweepHelper';
import { 
  Swords, Gift, ShoppingBag, Sparkles, Flame, Shield, Crown, 
  ChevronRight, Backpack, Trophy, Lock, CheckCircle2, Play,
  Zap, Coins, Layers, Compass, Crosshair, Award, RotateCcw,
  AlertTriangle, ArrowUpRight
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
}) => {
  const [selectedCategory, setSelectedCategory] = useState<DungeonCategory>('story');
  const [showSweepModal, setShowSweepModal] = useState<boolean>(false);
  const [sweepResult, setSweepResult] = useState<SweepResult | null>(null);
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

  // Handler for running Sweep
  const handleRunSweep = (targetStageId: number, targetName: string) => {
    const { updatedChar, result } = executeStageSweep(character, targetStageId, targetName);
    if (onUpdateCharacter) onUpdateCharacter(updatedChar);
    setSweepResult(result);
    if (onShowMessage) onShowMessage(`【迷宮高速制圧完了】 ${targetName} を制圧しました！`);
  };

  // Handler for Sweep All Cleared Stages
  const handleSweepAllUnlocked = () => {
    let currChar = character;
    let totalG = 0;
    let totalE = 0;
    let totalS = 0;
    const allItems = [];
    let wasLeveledUp = false;
    let finalLv = currChar.level;

    for (let stg = 1; stg <= currentStage; stg++) {
      const stgName = STAGES[stg - 1].name;
      const { updatedChar, result } = executeStageSweep(currChar, stg, stgName);
      currChar = updatedChar;
      totalG += result.goldGained;
      totalE += result.expGained;
      totalS += result.spGained;
      allItems.push(...result.itemsGained);
      if (result.leveledUp) {
        wasLeveledUp = true;
        finalLv = result.newLevel;
      }
    }

    if (onUpdateCharacter) onUpdateCharacter(currChar);

    setSweepResult({
      stageName: `第 1〜${currentStage} ステージ全一括制圧`,
      goldGained: totalG,
      expGained: totalE,
      spGained: totalS,
      itemsGained: allItems,
      leveledUp: wasLeveledUp,
      newLevel: finalLv,
      summaryText: `開放済みの全 ${currentStage} ステージを一挙に高速制圧！ 大量の戦利品を回収しました。`,
    });

    if (onShowMessage) onShowMessage(`【全ステージ一括制圧】 金貨 +${totalG}G, EXP +${totalE} 獲得！`);
  };

  return (
    <div className="max-w-4xl mx-auto p-2 md:p-6 text-[#e2e2e2] space-y-6">
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
            <div className="flex items-center gap-3 text-xs text-[#a09a8a] font-mono mt-0.5">
              <span>所持金: <strong className="text-[#d4af37] font-bold">G {character.gold.toLocaleString()}</strong></span>
              <span className="text-[#444]">|</span>
              <span>EXP: {character.exp} / {character.maxExp}</span>
              <span className="text-[#444]">|</span>
              <span className="text-[#e2c98a]">SP: {character.sp || 0}</span>
            </div>
          </div>
        </div>

        {/* HP / MP Bars */}
        <div className="flex flex-col gap-2 min-w-[220px] flex-1 max-w-sm">
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
        <div className="flex items-center gap-2">
          {/* SWEEP BUTTON */}
          <button
            onClick={() => setShowSweepModal(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-[#3a2c10] via-[#594418] to-[#3a2c10] hover:from-[#594418] hover:to-[#6a521c] text-[#f3e5be] border border-[#d4af37] rounded-xl flex items-center gap-1.5 text-xs font-black transition-all cursor-pointer shadow-[0_0_15px_rgba(212,175,55,0.25)] animate-pulse"
            title="低レベルステージを瞬時に制圧して報酬を獲得"
          >
            <Zap className="w-4 h-4 text-[#d4af37] fill-current" />
            <span>迷宮高速制圧</span>
          </button>

          <button
            onClick={onOpenInventory}
            className="px-4 py-2.5 bg-[#14151a] hover:bg-[#1d1f26] text-[#c4a661] rounded-xl border border-[#3a3528] hover:border-[#c4a661] flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer shadow-md"
          >
            <Backpack className="w-4 h-4 text-[#d4af37]" />
            <span>装備・ステータス</span>
          </button>
        </div>
      </div>

      {/* DUNGEON CATEGORY SELECTOR TABS */}
      <div className="bg-[#0b0c10] p-2 rounded-2xl border border-[#2a2720] flex flex-wrap items-center justify-between gap-1 shadow-xl">
        <button
          onClick={() => setSelectedCategory('story')}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            selectedCategory === 'story'
              ? 'bg-[#221d12] text-[#d4af37] border border-[#c4a661] shadow-[0_0_10px_rgba(212,175,55,0.2)]'
              : 'text-[#888378] hover:text-[#e2c98a] hover:bg-[#121318]'
          }`}
        >
          <Compass className="w-4 h-4 text-[#d4af37]" />
          <span>🏰 通常ストーリー</span>
        </button>

        <button
          onClick={() => setSelectedCategory('elemental')}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
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
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            selectedCategory === 'endless'
              ? 'bg-[#221d12] text-[#d4af37] border border-[#c4a661] shadow-[0_0_10px_rgba(212,175,55,0.2)]'
              : 'text-[#888378] hover:text-[#e2c98a] hover:bg-[#121318]'
          }`}
        >
          <Layers className="w-4 h-4 text-purple-400" />
          <span>🌀 無限深層の回廊</span>
        </button>

        <button
          onClick={() => setSelectedCategory('vault')}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            selectedCategory === 'vault'
              ? 'bg-[#221d12] text-[#d4af37] border border-[#c4a661] shadow-[0_0_10px_rgba(212,175,55,0.2)]'
              : 'text-[#888378] hover:text-[#e2c98a] hover:bg-[#121318]'
          }`}
        >
          <Coins className="w-4 h-4 text-yellow-400" />
          <span>💰 黄金の宝物庫</span>
        </button>

        <button
          onClick={() => setSelectedCategory('raid')}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            selectedCategory === 'raid'
              ? 'bg-[#221d12] text-[#d4af37] border border-[#c4a661] shadow-[0_0_10px_rgba(212,175,55,0.2)]'
              : 'text-[#888378] hover:text-[#e2c98a] hover:bg-[#121318]'
          }`}
        >
          <Crosshair className="w-4 h-4 text-red-400" />
          <span>🔥 次元降臨ボス</span>
        </button>
      </div>

      {/* CATEGORY CONTENT RENDERING */}

      {/* 1. STORY DUNGEONS */}
      {selectedCategory === 'story' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Stage Banner with progress meter */}
          <div className={`rounded-3xl p-6 bg-gradient-to-r ${stageInfo.bg} border border-[#2a2720] shadow-2xl relative overflow-hidden`}>
            <div className="absolute -right-6 -bottom-6 opacity-5 text-white">
              <Trophy className="w-44 h-44" />
            </div>
            <div className="relative z-10 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="inline-block px-3 py-1 bg-black/60 backdrop-blur text-[10px] font-black text-[#d4af37] rounded-full border border-[#c4a661]/40 uppercase tracking-widest font-mono">
                  STAGE {currentStage} / 5
                </span>
                <div className="text-xs font-bold text-[#f3e5be] font-mono">
                  遠征進捗: {progressPercent}% ({completedCount} / {floors.length} 階)
                </div>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-[#f3e5be] tracking-tight">{stageInfo.name}</h1>
                <p className="text-[#a09a8a] text-xs md:text-sm max-w-xl leading-relaxed mt-1">{stageInfo.desc}</p>
              </div>
              
              {/* Progress track */}
              <div className="relative w-full bg-black/60 rounded-full h-2.5 p-[1px] border border-[#3a3528]">
                <div 
                  className="bg-gradient-to-r from-[#9e7d33] via-[#c4a661] to-[#f3e5be] h-full transition-all duration-1000 rounded-full shadow-[0_0_10px_rgba(212,175,55,0.5)]"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Interactive Connected Dungeon Route */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-[#a09a8a] uppercase tracking-[0.2em] mb-4">
              ダンジョン探索ルート (フロア 1〜5)
            </h3>
            
            <div className="relative pl-6 md:pl-10 space-y-6">
              <div className="absolute top-6 bottom-6 left-[21px] md:left-[29px] w-1 bg-gradient-to-b from-[#c4a661] via-[#8c7438] to-[#1e1c17] rounded-full opacity-40 z-0"></div>

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
                        ? 'ring-2 ring-[#d4af37] shadow-xl cursor-pointer transform hover:scale-[1.015]'
                        : isPast
                        ? 'opacity-70'
                        : 'opacity-40 cursor-not-allowed'
                    }`}
                  >
                    <div 
                      className={`absolute -left-[27px] md:-left-[35px] w-10 h-10 rounded-full flex items-center justify-center bg-[#0d0e12] border-2 transition-all duration-300 z-10 ${
                        isPast 
                          ? 'border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]' 
                          : isCurrent 
                            ? 'border-[#d4af37] bg-[#211a0c] scale-110 shadow-[0_0_12px_rgba(212,175,55,0.6)] animate-pulse' 
                            : 'border-[#222]'
                      }`}
                    >
                      {getFloorIcon(floor.type, status)}
                    </div>

                    <div className="flex items-center gap-4 pl-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-[9px] font-mono font-black px-2 py-0.5 rounded border uppercase tracking-wider ${
                            isPast 
                              ? 'bg-black/50 text-[#666] border-[#222]' 
                              : isCurrent 
                                ? 'bg-[#211a0c] text-[#f3e5be] border-[#c4a661]' 
                                : 'bg-[#08080a] text-[#555] border-[#1f1d18]'
                          }`}>
                            第 {floor.floorNumber} 階層
                          </span>
                          <h4 className={`font-black text-sm md:text-base tracking-wide ${
                            isPast ? 'text-[#666] line-through' : 'text-[#f3e5be]'
                          }`}>
                            {getFloorName(floor.type)}
                          </h4>
                        </div>
                        <p className={`text-xs mt-1 max-w-xl leading-relaxed ${isPast ? 'text-[#555]' : 'text-[#a09a8a]'}`}>
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
                        <button className="px-5 py-2.5 bg-gradient-to-r from-[#b89542] via-[#d4af37] to-[#f3e5be] hover:from-[#d4af37] hover:to-[#f3e5be] text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center gap-1.5 transition-all transform hover:scale-105 active:scale-95 animate-pulse cursor-pointer">
                          <Play className="w-3.5 h-3.5 fill-current" />
                          進む
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      )}
                      {isFuture && (
                        <span className="text-[10px] font-black text-[#555] bg-[#0a0a0d] px-3 py-1.5 rounded-xl border border-[#1f1d18] uppercase tracking-widest font-mono">
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
      )}

      {/* 2. ELEMENTAL TOWER DUNGEONS */}
      {selectedCategory === 'elemental' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="bg-[#0f1015] border border-[#2a2720] rounded-3xl p-5 shadow-2xl relative overflow-hidden">
            <h2 className="text-xl font-black text-[#f3e5be] flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              属性試練の塔（全5属性）
            </h2>
            <p className="text-xs text-[#a09a8a] mt-1 leading-relaxed">
              古代エレメントの加護を受けし試練の塔。属性特化の強敵を倒し、SPや特別秘薬を獲得しよう！
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ELEMENTAL_TOWERS.map((tower) => {
              const isRecommended = character.level >= tower.recommendedLv;
              return (
                <div
                  key={tower.id}
                  className={`bg-gradient-to-br ${tower.bg} border border-[#3a3528] rounded-2xl p-5 shadow-xl flex flex-col justify-between gap-4 relative overflow-hidden group hover:border-[#c4a661] transition-all`}
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black px-2.5 py-0.5 rounded-md bg-black/60 text-[#f3e5be] border border-white/10 font-mono">
                        {tower.element}
                      </span>
                      <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${isRecommended ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-red-950 text-red-300 border border-red-800'}`}>
                        推奨 Lv.{tower.recommendedLv}
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-[#f3e5be] tracking-wide">{tower.name}</h3>
                    <p className="text-xs text-[#b8b09d] leading-relaxed">{tower.desc}</p>
                    
                    <div className="pt-2 text-[11px] font-bold text-amber-300 flex items-center gap-1 font-mono">
                      <Gift className="w-3.5 h-3.5" />
                      <span>突破報酬: {tower.specialRewardName}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                    <button
                      onClick={() => {
                        handleRunSweep(tower.recommendedLv, tower.name);
                      }}
                      className="flex-1 py-2 bg-[#211a0c] hover:bg-[#322712] border border-[#c4a661] text-[#f3e5be] text-xs font-black rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-400 fill-current" />
                      <span>高速制圧</span>
                    </button>
                    <button
                      onClick={() => {
                        const towerFloors: FloorNode[] = [
                          { floorNumber: 1, stageNumber: 10, type: 'battle', completed: false, enemy: { ...tower.enemies[0], id: `${tower.id}_1` } },
                          { floorNumber: 2, stageNumber: 10, type: 'treasure', completed: false },
                          { floorNumber: 3, stageNumber: 10, type: 'battle', completed: false, enemy: { ...tower.enemies[1], id: `${tower.id}_2` } },
                          { floorNumber: 4, stageNumber: 10, type: 'rest', completed: false },
                          { floorNumber: 5, stageNumber: 10, type: 'boss', completed: false, enemy: tower.boss },
                        ];
                        if (onLoadSpecialFloors) onLoadSpecialFloors(towerFloors, tower.name);
                      }}
                      className="flex-1 py-2 bg-gradient-to-r from-[#b89542] to-[#d4af37] text-slate-950 text-xs font-black rounded-xl shadow transition flex items-center justify-center gap-1 cursor-pointer hover:scale-105"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>試練に挑む</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. ENDLESS ABYSS DUNGEON */}
      {selectedCategory === 'endless' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-[#120a18] border border-purple-900/60 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
              <span className="px-3 py-1 bg-purple-950 text-purple-300 font-mono text-xs font-black rounded-full border border-purple-700">
                ENDLESS CORRIDOR
              </span>
              <span className="text-xs font-bold text-amber-400 font-mono">
                最高到達記録: 第 {Math.max(endlessDepth, character.stats.floorsCleared || 1)} 階層
              </span>
            </div>

            <h2 className="text-2xl font-black text-[#f3e5be] tracking-tight">無限深層の回廊</h2>
            <p className="text-xs text-[#b8b09d] leading-relaxed mt-1 max-w-2xl">
              底なしの深遠へと続く無限の迷宮。階層が進むほど魔物の能力は凶悪化しますが、得られる金貨・EXP・エーテルは飛躍的に増大します。
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => {
                  const newEndless = generateEndlessFloors(endlessDepth, 5);
                  if (onLoadSpecialFloors) onLoadSpecialFloors(newEndless, `無限回廊 (第${endlessDepth}〜${endlessDepth+4}層)`);
                }}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-800 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs rounded-2xl shadow-xl flex items-center gap-2 cursor-pointer transition transform hover:scale-105"
              >
                <Layers className="w-4 h-4" />
                <span>第 {endlessDepth} 階層から深層探索開始</span>
              </button>

              <button
                onClick={() => {
                  handleRunSweep(Math.min(10, Math.floor(endlessDepth / 2) + 1), `無限回廊 第${endlessDepth}層到達記念制圧`);
                  setEndlessDepth((prev) => prev + 5);
                }}
                className="px-6 py-3 bg-[#221c10] hover:bg-[#332815] border border-[#d4af37] text-[#f3e5be] font-black text-xs rounded-2xl shadow-md flex items-center gap-2 cursor-pointer transition"
              >
                <Zap className="w-4 h-4 text-amber-400 fill-current" />
                <span>深層高速スキップ制圧 (EXP/G獲得)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. TREASURE VAULT DUNGEON */}
      {selectedCategory === 'vault' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-gradient-to-r from-[#2a210a] via-[#1a1408] to-[#0c0904] border border-[#d4af37]/80 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
            <div className="flex items-center gap-2 text-yellow-400 font-mono text-xs font-black mb-2">
              <Coins className="w-4 h-4" />
              <span>GOLD & TREASURE VAULT</span>
            </div>

            <h2 className="text-2xl font-black text-[#f3e5be]">{TREASURE_VAULT_INFO.name}</h2>
            <p className="text-xs text-[#b8b09d] leading-relaxed mt-1 max-w-2xl">
              {TREASURE_VAULT_INFO.desc}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => {
                  const vaultFloors: FloorNode[] = [
                    { floorNumber: 1, stageNumber: 20, type: 'battle', completed: false, enemy: TREASURE_VAULT_INFO.enemies[0] },
                    { floorNumber: 2, stageNumber: 20, type: 'treasure', completed: false },
                    { floorNumber: 3, stageNumber: 20, type: 'battle', completed: false, enemy: TREASURE_VAULT_INFO.enemies[1] },
                    { floorNumber: 4, stageNumber: 20, type: 'battle', completed: false, enemy: TREASURE_VAULT_INFO.enemies[2] },
                    { floorNumber: 5, stageNumber: 20, type: 'boss', completed: false, enemy: TREASURE_VAULT_INFO.boss },
                  ];
                  if (onLoadSpecialFloors) onLoadSpecialFloors(vaultFloors, TREASURE_VAULT_INFO.name);
                }}
                className="px-6 py-3 bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-400 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs rounded-2xl shadow-xl flex items-center gap-2 cursor-pointer transition transform hover:scale-105"
              >
                <Coins className="w-4 h-4" />
                <span>黄金宝物庫に突入する</span>
              </button>

              <button
                onClick={() => {
                  handleRunSweep(3, '黄金宝物庫・一括即時回収');
                }}
                className="px-6 py-3 bg-[#1e170a] hover:bg-[#2b210e] border border-[#d4af37] text-[#f3e5be] font-black text-xs rounded-2xl shadow flex items-center gap-2 cursor-pointer transition"
              >
                <Zap className="w-4 h-4 text-amber-400 fill-current" />
                <span>宝物庫高速制圧 (金貨即時回収)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. WORLD BOSS RAID DUNGEON */}
      {selectedCategory === 'raid' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-gradient-to-r from-[#200508] via-[#120305] to-[#08020a] border border-red-700/80 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="px-3 py-1 bg-red-950 text-red-300 font-mono text-xs font-black rounded-full border border-red-800">
                DIMENSIONAL RAID BOSS
              </span>
              <span className="text-xs text-red-400 font-mono font-bold">
                HP: {WORLD_BOSS_RAID_INFO.hp} / {WORLD_BOSS_RAID_INFO.maxHp}
              </span>
            </div>

            <h2 className="text-2xl font-black text-red-100 flex items-center gap-2">
              <Crown className="w-6 h-6 text-red-500 animate-bounce" />
              {WORLD_BOSS_RAID_INFO.name}
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed mt-1 max-w-2xl">
              {WORLD_BOSS_RAID_INFO.desc}
            </p>

            <div className="mt-6">
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
                className="px-8 py-3.5 bg-gradient-to-r from-red-600 via-rose-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white font-black text-xs rounded-2xl shadow-xl flex items-center gap-2 cursor-pointer transition transform hover:scale-105 animate-pulse"
              >
                <Swords className="w-4 h-4" />
                <span>【世界ボス決戦】 神竜アストラガルドに挑む！</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SWEEP MODAL DIALOG */}
      {showSweepModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#0e0f14] border-2 border-[#c4a661] max-w-xl w-full rounded-3xl p-6 shadow-[0_0_50px_rgba(212,175,55,0.3)] text-[#e2e2e2] relative">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-[#2a2720]">
              <h3 className="text-lg font-black text-[#f3e5be] flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#d4af37] fill-current animate-pulse" />
                ⚡ 迷宮高速制圧コマンド
              </h3>
              <button
                onClick={() => setShowSweepModal(false)}
                className="text-xs text-[#888] hover:text-[#fff] cursor-pointer px-2 py-1 bg-[#1a1a20] rounded-lg"
              >
                閉じる ✕
              </button>
            </div>

            <p className="text-xs text-[#a09a8a] leading-relaxed mb-4">
              すでに解放されたダンジョン・ステージを一瞬で制圧し、大量の経験値・金貨・戦利品を安全に回収します。
            </p>

            {/* Sweep All Button */}
            <div className="mb-5">
              <button
                onClick={() => {
                  handleSweepAllUnlocked();
                  setShowSweepModal(false);
                }}
                className="w-full py-3.5 bg-gradient-to-r from-[#b89542] via-[#d4af37] to-[#f3e5be] text-slate-950 font-black text-xs rounded-2xl shadow-lg flex items-center justify-center gap-2 transition hover:scale-[1.02] cursor-pointer"
              >
                <Sparkles className="w-4 h-4 fill-current" />
                <span>🔥 開放済み全ステージ（第 1〜{currentStage} ）を一括全制圧する！</span>
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              <span className="text-[11px] font-bold text-[#888] font-mono">個別にステージを指定して制圧:</span>
              {STAGES.map((stg) => {
                const isUnlocked = stg.id <= currentStage;
                return (
                  <div
                    key={stg.id}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                      isUnlocked ? 'bg-[#15161c] border-[#3a3528]' : 'bg-[#08080a] border-[#18181f] opacity-50'
                    }`}
                  >
                    <div>
                      <h4 className="font-bold text-xs text-[#f3e5be]">{stg.name}</h4>
                      <p className="text-[10px] text-[#888378] mt-0.5">{stg.desc}</p>
                    </div>

                    {isUnlocked ? (
                      <button
                        onClick={() => {
                          handleRunSweep(stg.id, stg.name);
                          setShowSweepModal(false);
                        }}
                        className="px-3 py-1.5 bg-[#261f10] hover:bg-[#3d3118] border border-[#d4af37] text-[#f3e5be] font-bold text-xs rounded-lg transition shrink-0 cursor-pointer flex items-center gap-1"
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-400 fill-current" />
                        <span>制圧</span>
                      </button>
                    ) : (
                      <span className="text-[10px] text-[#555] font-mono shrink-0">LOCKED</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SWEEP RESULT REPORT MODAL */}
      {sweepResult && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#0b0c10] border-2 border-[#d4af37] max-w-md w-full rounded-3xl p-6 shadow-[0_0_60px_rgba(212,175,55,0.4)] text-[#e2e2e2] relative">
            <div className="text-center space-y-2 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-[#211a0c] border border-[#d4af37] flex items-center justify-center mx-auto shadow-lg">
                <Zap className="w-7 h-7 text-[#d4af37] fill-current animate-bounce" />
              </div>
              <h3 className="text-xl font-black text-[#f3e5be]">【迷宮制圧完了報告】</h3>
              <p className="text-xs text-[#d4af37] font-bold font-mono">{sweepResult.stageName}</p>
            </div>

            <div className="space-y-3 bg-[#121318] p-4 rounded-2xl border border-[#2a2720] text-xs mb-6">
              <div className="flex justify-between items-center">
                <span className="text-[#a09a8a] flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5 text-amber-400" />
                  獲得ゴールド:
                </span>
                <span className="text-[#d4af37] font-bold font-mono text-sm">+ {sweepResult.goldGained.toLocaleString()} G</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[#a09a8a] flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  獲得EXP:
                </span>
                <span className="text-[#f3e5be] font-bold font-mono text-sm">+ {sweepResult.expGained.toLocaleString()} EXP</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[#a09a8a] flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-amber-300" />
                  獲得SP:
                </span>
                <span className="text-amber-300 font-bold font-mono text-sm">+ {sweepResult.spGained} SP</span>
              </div>

              {sweepResult.leveledUp && (
                <div className="p-2.5 bg-gradient-to-r from-amber-950/80 to-[#2a2010] rounded-xl border border-amber-500/60 text-amber-300 font-black text-center text-xs animate-pulse">
                  🎉 LEVEL UP!  新レベル: Lv.{sweepResult.newLevel}
                </div>
              )}

              {sweepResult.itemsGained.length > 0 && (
                <div className="pt-2 border-t border-[#222]">
                  <span className="text-[11px] font-bold text-[#a09a8a] block mb-2">回収した戦利品:</span>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {sweepResult.itemsGained.map((itm, idx) => (
                      <div key={idx} className="p-2 bg-[#0a0a0e] rounded-lg border border-[#23232a] flex items-center justify-between text-[11px]">
                        <span className="font-bold text-[#f3e5be] truncate max-w-[180px]">{itm.name}</span>
                        <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-[#1e1c14] text-[#d4af37] uppercase border border-[#3a3528]">
                          {itm.rarity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setSweepResult(null)}
              className="w-full py-3 bg-gradient-to-r from-[#b89542] via-[#d4af37] to-[#f3e5be] text-slate-950 font-black text-xs rounded-xl shadow-lg transition cursor-pointer hover:scale-105"
            >
              戦利品を受け取って確認
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
