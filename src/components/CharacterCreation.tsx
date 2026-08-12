import React, { useState } from 'react';
import { RACES, MAGIC_TYPES, CLASSES } from '../data/gameData';
import { RaceInfo, MagicTypeInfo, ClassInfo, CharacterState } from '../types';
import { getInitialQuests } from '../utils/rankUtils';
import { Sword, Wand2, Shield, Flame, Sparkles, Sun, Zap, Heart, ShieldAlert, User, Check, Play, Crown, Skull } from 'lucide-react';


interface CharacterCreationProps {
  onStartAdventure: (char: CharacterState) => void;
  onContinueAdventure?: () => void;
  hasSavedGame?: boolean;
  reincarnationCount?: number;
  reincarnationBuffs?: {
    hpBonusPct: number;
    mpBonusPct: number;
    atkBonusPct: number;
    defBonusPct: number;
    expGoldBonusPct: number;
  };
}

export const CharacterCreation: React.FC<CharacterCreationProps> = ({ 
  onStartAdventure, 
  onContinueAdventure, 
  hasSavedGame,
  reincarnationCount = 0,
  reincarnationBuffs,
}) => {
  const [selectedRace, setSelectedRace] = useState<RaceInfo>(RACES[0]);
  const [selectedMagic, setSelectedMagic] = useState<MagicTypeInfo>(MAGIC_TYPES[0]);
  const [selectedClass, setSelectedClass] = useState<ClassInfo>(CLASSES[0]);
  const [heroName, setHeroName] = useState<string>('アストラル');

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'User': return <User className="w-5 h-5" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5" />;
      case 'Shield': return <Shield className="w-5 h-5" />;
      case 'Flame': return <Flame className="w-5 h-5" />;
      case 'Sun': return <Sun className="w-5 h-5" />;
      case 'Sword': return <Sword className="w-5 h-5" />;
      case 'Wand2': return <Wand2 className="w-5 h-5" />;
      case 'Zap': return <Zap className="w-5 h-5" />;
      case 'Heart': return <Heart className="w-5 h-5" />;
      case 'Crown': return <Crown className="w-5 h-5" />;
      case 'Skull': return <Skull className="w-5 h-5" />;
      case 'ShieldAlert': return <ShieldAlert className="w-5 h-5" />;
      default: return <User className="w-5 h-5" />;
    }
  };

  // Base raw stats calculation
  const rawHp = selectedClass.baseStats.hp + selectedRace.bonuses.hp;
  const rawMp = selectedClass.baseStats.mp + selectedRace.bonuses.mp;
  const rawAtk = selectedClass.baseStats.atk + selectedRace.bonuses.atk;
  const rawDef = selectedClass.baseStats.def + selectedRace.bonuses.def;
  const rawSpd = selectedClass.baseStats.spd + selectedRace.bonuses.spd;
  const rawCrit = selectedClass.baseStats.crit + selectedRace.bonuses.crit;

  // Reincarnation Multipliers
  const hpMult = 1 + (reincarnationBuffs?.hpBonusPct || (reincarnationCount * 25)) / 100;
  const mpMult = 1 + (reincarnationBuffs?.mpBonusPct || (reincarnationCount * 25)) / 100;
  const atkMult = 1 + (reincarnationBuffs?.atkBonusPct || (reincarnationCount * 15)) / 100;
  const defMult = 1 + (reincarnationBuffs?.defBonusPct || (reincarnationCount * 15)) / 100;

  const calculatedStats = {
    hp: Math.floor(rawHp * hpMult),
    mp: Math.floor(rawMp * mpMult),
    atk: Math.floor(rawAtk * atkMult),
    def: Math.floor(rawDef * defMult),
    spd: rawSpd,
    crit: rawCrit,
  };

  const handleStart = () => {
    if (!heroName.trim()) return;
    const newChar: CharacterState = {
      name: heroName.trim(),
      race: selectedRace,
      magicType: selectedMagic,
      classInfo: selectedClass,
      level: 1,
      exp: 0,
      maxExp: 100,
      hp: calculatedStats.hp,
      maxHp: calculatedStats.hp,
      mp: calculatedStats.mp,
      maxMp: calculatedStats.mp,
      atk: calculatedStats.atk,
      def: calculatedStats.def,
      spd: calculatedStats.spd,
      crit: calculatedStats.crit,
      gold: 150 + reincarnationCount * 200,
      spells: selectedMagic.spells,
      inventory: [
        { id: 'potion_1', name: '小ポーション', type: 'potion', rarity: 'common', effect: { type: 'healHp', value: 50 }, desc: 'HPを50回復する。', price: 30, icon: 'FlaskConical' },
        { id: 'potion_2', name: '小ポーション', type: 'potion', rarity: 'common', effect: { type: 'healHp', value: 50 }, desc: 'HPを50回復する。', price: 30, icon: 'FlaskConical' },
        { id: 'mana_1', name: '魔力の雫', type: 'potion', rarity: 'common', effect: { type: 'healMp', value: 40 }, desc: 'MPを40回復する。', price: 40, icon: 'Droplets' },
      ],
      equipment: {
        weapon: null,
        armor: null,
        accessory: null,
      },
      sp: 3 + reincarnationCount * 2,
      unlockedSkills: [],
      reincarnationCount,
      reincarnationBuffs: {
        hpBonusPct: Math.floor((hpMult - 1) * 100),
        mpBonusPct: Math.floor((mpMult - 1) * 100),
        atkBonusPct: Math.floor((atkMult - 1) * 100),
        defBonusPct: Math.floor((defMult - 1) * 100),
        expGoldBonusPct: reincarnationCount * 20,
      },
      stats: {
        battlesWon: 0,
        damageDealt: 0,
        itemsUsed: 0,
        floorsCleared: 0,
      },
      quests: getInitialQuests(),
      logs: [
        {
          id: `log_init_${Date.now()}`,
          time: `${new Date().getHours().toString().padStart(2, '0')}:${new Date().getMinutes().toString().padStart(2, '0')}:${new Date().getSeconds().toString().padStart(2, '0')}`,
          stageInfo: 'STAGE 01',
          category: 'system',
          title: reincarnationCount > 0 ? `転生【第${reincarnationCount}世代】降臨` : '冒険開始',
          description: `【${heroName.trim() || '無名の冒険者'}】（${selectedRace.name} / ${selectedClass.name}）が${reincarnationCount > 0 ? `転生第 ${reincarnationCount} 世代の力を引き継ぎ` : ''}元素の迷宮へと一歩を踏み出した。`,
        },
      ],
    };
    onStartAdventure(newChar);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 text-slate-100">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-5xl font-black bg-gradient-to-r from-amber-400 via-purple-300 to-indigo-400 bg-clip-text text-transparent mb-3">
          Astral Rogue: 元素の迷宮
        </h1>
        <p className="text-slate-400 text-sm md:text-base">
          種族、魔法、役職を選択し、強大な魔物が巣食う5つのステージを攻略せよ！
        </p>

        {reincarnationCount > 0 && (
          <div className="mt-4 p-4 bg-gradient-to-r from-amber-950/80 via-purple-950/80 to-slate-900 border-2 border-amber-400/80 rounded-2xl max-w-2xl mx-auto shadow-[0_0_25px_rgba(245,158,11,0.25)] relative overflow-hidden">
            <div className="flex items-center justify-center gap-2 text-amber-300 font-extrabold text-sm md:text-base mb-1 tracking-wider">
              <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
              <span>【転生・昇華ボーナス適用中】 転生世代: 第 {reincarnationCount} 世代</span>
              <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
            </div>
            <div className="flex flex-wrap justify-center gap-3 text-xs font-mono text-amber-200 mt-2">
              <span className="bg-amber-950/60 px-2.5 py-1 rounded border border-amber-800/60">HP/MP: +{reincarnationCount * 25}%</span>
              <span className="bg-amber-950/60 px-2.5 py-1 rounded border border-amber-800/60">攻撃/防御: +{reincarnationCount * 15}%</span>
              <span className="bg-amber-950/60 px-2.5 py-1 rounded border border-amber-800/60">EXP/GOLD: +{reincarnationCount * 20}%</span>
              <span className="bg-purple-950/60 px-2.5 py-1 rounded border border-purple-800/60 text-purple-300">伝説種族＆秘奥義魔法全解禁</span>
            </div>
          </div>
        )}
      </div>

      <div className="bg-slate-900/80 backdrop-blur border border-slate-700/60 rounded-2xl p-6 mb-6 shadow-2xl">
        <label className="block text-sm font-semibold text-amber-300 mb-2">冒険者の名前</label>
        <input
          type="text"
          value={heroName}
          onChange={(e) => setHeroName(e.target.value)}
          maxLength={15}
          className="w-full md:w-80 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-400 font-medium"
          placeholder="名前を入力..."
        />
      </div>

      {/* Step 1: Race */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-indigo-300 mb-3 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span className="bg-indigo-600/30 text-indigo-300 w-7 h-7 rounded-full flex items-center justify-center text-sm border border-indigo-500/50">1</span>
            種族を選択 (Race)
          </span>
          <span className="text-xs text-amber-400 font-normal">
            全 {RACES.length} 種族（転生限定種族: 8種）
          </span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {RACES.map((race) => {
            const isSelected = selectedRace.id === race.id;
            const isLocked = race.isReincarnationOnly && reincarnationCount < (race.minReincarnationReq || 1);

            return (
              <div
                key={race.id}
                onClick={() => {
                  if (!isLocked) setSelectedRace(race);
                }}
                className={`rounded-xl p-4 transition-all border relative flex flex-col justify-between ${
                  isLocked 
                    ? 'opacity-60 bg-slate-950/80 border-slate-800 cursor-not-allowed grayscale' 
                    : race.isReincarnationOnly
                      ? isSelected
                        ? 'bg-gradient-to-b from-amber-950/90 via-purple-900/80 to-slate-900 border-amber-400 shadow-xl shadow-amber-950/60 ring-2 ring-amber-400/80 cursor-pointer'
                        : 'bg-gradient-to-b from-purple-950/40 to-slate-900/80 border-purple-800/80 hover:border-amber-400/80 hover:bg-purple-950/70 cursor-pointer'
                      : isSelected
                        ? 'bg-gradient-to-b from-indigo-900/80 to-slate-900 border-indigo-400 shadow-lg shadow-indigo-950/50 ring-2 ring-indigo-500/50 cursor-pointer'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90 cursor-pointer'
                }`}
              >
                {isSelected && !isLocked && (
                  <div className="absolute top-3 right-3 text-indigo-400 bg-indigo-950/80 p-1 rounded-full border border-indigo-500/50">
                    <Check className="w-4 h-4" />
                  </div>
                )}
                {race.isReincarnationOnly && (
                  <div className="mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                      isLocked 
                        ? 'bg-slate-800 text-slate-400 border-slate-700'
                        : 'bg-amber-950/90 text-amber-300 border-amber-500/80 animate-pulse'
                    }`}>
                      {isLocked ? '✦ 転生で解放' : '✦ 転生限定種族'}
                    </span>
                  </div>
                )}
                <div>
                  <div className="text-indigo-400 mb-2">{getIconComponent(race.icon)}</div>
                  <h3 className="font-bold text-white mb-1 flex items-center justify-between">
                    <span>{race.name}</span>
                  </h3>
                  <p className="text-xs text-slate-400 mb-3 leading-relaxed">{race.desc}</p>
                </div>
                <div className="bg-slate-950/60 rounded-lg p-2 text-[11px] text-amber-300/90 border border-slate-800/80">
                  <span className="font-semibold block text-amber-400">{race.traitName}</span>
                  {race.traitDesc}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step 2: Magic Type */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-purple-300 mb-3 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span className="bg-purple-600/30 text-purple-300 w-7 h-7 rounded-full flex items-center justify-center text-sm border border-purple-500/50">2</span>
            魔法の種類を選択 (Magic Type)
          </span>
          <span className="text-xs text-purple-400 font-normal">
            全 {MAGIC_TYPES.length} 系統（転生解禁秘奥義: 7種）
          </span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {MAGIC_TYPES.map((magic) => {
            const isSelected = selectedMagic.id === magic.id;
            const isLocked = magic.isReincarnationOnly && reincarnationCount < (magic.minReincarnationReq || 1);

            return (
              <div
                key={magic.id}
                onClick={() => {
                  if (!isLocked) setSelectedMagic(magic);
                }}
                className={`rounded-xl p-4 transition-all border relative flex flex-col justify-between ${
                  isLocked
                    ? 'opacity-60 bg-slate-950/80 border-slate-800 cursor-not-allowed grayscale'
                    : magic.isReincarnationOnly
                      ? isSelected
                        ? 'bg-gradient-to-b from-purple-950/90 via-indigo-900/80 to-slate-900 border-purple-400 shadow-xl shadow-purple-950/60 ring-2 ring-purple-400/80 cursor-pointer'
                        : 'bg-gradient-to-b from-purple-950/40 to-slate-900/80 border-purple-800/80 hover:border-purple-400/80 hover:bg-purple-950/70 cursor-pointer'
                      : isSelected
                        ? 'bg-gradient-to-b from-purple-900/80 to-slate-900 border-purple-400 shadow-lg shadow-purple-950/50 ring-2 ring-purple-500/50 cursor-pointer'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90 cursor-pointer'
                }`}
              >
                {isSelected && !isLocked && (
                  <div className="absolute top-3 right-3 text-purple-400 bg-purple-950/80 p-1 rounded-full border border-purple-500/50">
                    <Check className="w-4 h-4" />
                  </div>
                )}
                {magic.isReincarnationOnly && (
                  <div className="mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                      isLocked
                        ? 'bg-slate-800 text-slate-400 border-slate-700'
                        : 'bg-purple-950/90 text-purple-300 border-purple-500/80 animate-pulse'
                    }`}>
                      {isLocked ? '✦ 転生で解放' : '✦ 秘奥義系統'}
                    </span>
                  </div>
                )}
                <div>
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${magic.color} flex items-center justify-center text-white mb-3 shadow-md`}>
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-white mb-1">{magic.name}</h3>
                  <p className="text-xs text-slate-400 mb-3 leading-relaxed">{magic.desc}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-purple-300 font-semibold uppercase tracking-wider">習得魔法:</span>
                  {magic.spells.map((s) => (
                    <div key={s.id} className="text-xs bg-slate-950/70 px-2 py-1 rounded text-slate-300 flex justify-between">
                      <span>{s.name}</span>
                      <span className="text-purple-400">MP{s.mpCost}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step 3: Class / Role */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-emerald-300 mb-3 flex items-center gap-2">
          <span className="bg-emerald-600/30 text-emerald-300 w-7 h-7 rounded-full flex items-center justify-center text-sm border border-emerald-500/50">3</span>
          役職を選択 (Class)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {CLASSES.map((cls) => {
            const isSelected = selectedClass.id === cls.id;
            return (
              <div
                key={cls.id}
                onClick={() => setSelectedClass(cls)}
                className={`cursor-pointer rounded-xl p-4 transition-all border relative flex flex-col justify-between ${
                  isSelected
                    ? 'bg-gradient-to-b from-emerald-900/80 to-slate-900 border-emerald-400 shadow-lg shadow-emerald-950/50 ring-2 ring-emerald-500/50'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3 text-emerald-400 bg-emerald-950/80 p-1 rounded-full border border-emerald-500/50">
                    <Check className="w-4 h-4" />
                  </div>
                )}
                <div>
                  <div className="text-emerald-400 mb-2">{getIconComponent(cls.icon)}</div>
                  <h3 className="font-bold text-white mb-0.5">{cls.name}</h3>
                  <span className="inline-block text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800/60 mb-2">
                    {cls.role}
                  </span>
                  <p className="text-xs text-slate-400 mb-3 leading-relaxed">{cls.desc}</p>
                </div>
                <div className="grid grid-cols-2 gap-1 text-[11px] bg-slate-950/60 p-2 rounded-lg text-slate-300">
                  <div>HP: <span className="text-emerald-400 font-bold">{cls.baseStats.hp + selectedRace.bonuses.hp}</span></div>
                  <div>MP: <span className="text-purple-400 font-bold">{cls.baseStats.mp + selectedRace.bonuses.mp}</span></div>
                  <div>攻撃: <span className="text-red-400 font-bold">{cls.baseStats.atk + selectedRace.bonuses.atk}</span></div>
                  <div>防御: <span className="text-blue-400 font-bold">{cls.baseStats.def + selectedRace.bonuses.def}</span></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary & Start Button */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div>
          <h4 className="text-sm font-semibold text-slate-400 mb-1">選択された冒険者ステータス</h4>
          <div className="flex flex-wrap items-center gap-3 text-sm font-medium">
            <span className="bg-slate-800 px-3 py-1 rounded-lg text-amber-300 border border-slate-700">種族: {selectedRace.name.split(' ')[0]}</span>
            <span className="bg-slate-800 px-3 py-1 rounded-lg text-purple-300 border border-slate-700">魔法: {selectedMagic.name.split(' ')[0]}</span>
            <span className="bg-slate-800 px-3 py-1 rounded-lg text-emerald-300 border border-slate-700">役職: {selectedClass.name.split(' ')[0]}</span>
            <span className="text-slate-400">|</span>
            <span>初期HP: <strong className="text-emerald-400">{calculatedStats.hp}</strong></span>
            <span>初期MP: <strong className="text-purple-400">{calculatedStats.mp}</strong></span>
            <span>攻撃: <strong className="text-red-400">{calculatedStats.atk}</strong></span>
            <span>防御: <strong className="text-blue-400">{calculatedStats.def}</strong></span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {hasSavedGame && onContinueAdventure && (
            <button
              onClick={onContinueAdventure}
              className="px-6 py-4 bg-indigo-900/80 hover:bg-indigo-800 text-indigo-200 border border-indigo-500/60 font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Sparkles className="w-5 h-5 text-indigo-300" />
              続きから始める
            </button>
          )}
          <button
            onClick={handleStart}
            className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white font-bold rounded-xl shadow-lg shadow-orange-950/50 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-95 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current" />
            冒険に出発する！
          </button>
        </div>
      </div>
    </div>
  );
};
