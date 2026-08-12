import React, { useState } from 'react';
import { RACES, MAGIC_TYPES, CLASSES } from '../data/gameData';
import { RaceInfo, MagicTypeInfo, ClassInfo, CharacterState } from '../types';
import { getInitialQuests } from '../utils/rankUtils';
import { MASSIVE_SPELL_LIST } from '../data/massiveSpellList';
import { Sword, Wand2, Shield, Flame, Sparkles, Sun, Zap, Heart, ShieldAlert, User, Check, Play, Crown, Skull, Trash2, AlertTriangle } from 'lucide-react';


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
  const [showResetModal, setShowResetModal] = useState<boolean>(false);

  // Filters for tabs
  const [raceFilter, setRaceFilter] = useState<'all' | 'base' | 'reinc1' | 'reinc2+'>('all');
  const [magicFilter, setMagicFilter] = useState<'all' | 'base' | 'reinc1' | 'reinc2+'>('all');
  const [classFilter, setClassFilter] = useState<'all' | 'base' | 'reinc1' | 'reinc2+'>('all');

  const handleHardReset = () => {
    localStorage.clear();
    window.location.reload();
  };

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

    // Base starter spells
    const startingSpells = [...selectedMagic.spells];

    // Reincarnation Bonus Spells (Unlocks extra spells for higher reincarnation levels)
    if (reincarnationCount >= 1) {
      const arcana1 = MASSIVE_SPELL_LIST.find(s => s.id === 'arc_01');
      if (arcana1 && !startingSpells.some(s => s.id === arcana1.id)) {
        startingSpells.push(arcana1);
      }
    }
    if (reincarnationCount >= 2) {
      const arcana2 = MASSIVE_SPELL_LIST.find(s => s.id === 'arc_04');
      if (arcana2 && !startingSpells.some(s => s.id === arcana2.id)) {
        startingSpells.push(arcana2);
      }
    }
    if (reincarnationCount >= 3) {
      const arcana3 = MASSIVE_SPELL_LIST.find(s => s.id === 'arc_07');
      if (arcana3 && !startingSpells.some(s => s.id === arcana3.id)) {
        startingSpells.push(arcana3);
      }
    }

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
      gold: 150 + reincarnationCount * 250,
      spells: startingSpells,
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

  const filteredRaces = RACES.filter((r) => {
    if (raceFilter === 'base') return !r.isReincarnationOnly;
    if (raceFilter === 'reinc1') return r.isReincarnationOnly && (r.minReincarnationReq || 1) === 1;
    if (raceFilter === 'reinc2+') return r.isReincarnationOnly && (r.minReincarnationReq || 1) >= 2;
    return true;
  });

  const filteredMagics = MAGIC_TYPES.filter((m) => {
    if (magicFilter === 'base') return !m.isReincarnationOnly;
    if (magicFilter === 'reinc1') return m.isReincarnationOnly && (m.minReincarnationReq || 1) === 1;
    if (magicFilter === 'reinc2+') return m.isReincarnationOnly && (m.minReincarnationReq || 1) >= 2;
    return true;
  });

  const filteredClasses = CLASSES.filter((c) => {
    if (classFilter === 'base') return !c.isReincarnationOnly;
    if (classFilter === 'reinc1') return c.isReincarnationOnly && (c.minReincarnationReq || 1) === 1;
    if (classFilter === 'reinc2+') return c.isReincarnationOnly && (c.minReincarnationReq || 1) >= 2;
    return true;
  });

  const totalCp = Math.floor(
    calculatedStats.hp * 0.8 +
    calculatedStats.mp * 0.8 +
    calculatedStats.atk * 3.5 +
    calculatedStats.def * 3 +
    calculatedStats.spd * 2 +
    calculatedStats.crit * 4
  );

  return (
    <div className="max-w-5xl mx-auto p-2 md:p-6 text-[#e2e2e2]">
      <div className="text-center mb-6">
        <h1 className="text-2xl md:text-4xl font-black text-[#d4af37] tracking-widest mb-2 drop-shadow-[0_2px_10px_rgba(196,166,97,0.3)]">
          Astral Rogue: 元素の迷宮
        </h1>
        <p className="text-[#a09a8a] text-xs md:text-sm">
          種族・魔法・役職を選択し、最高位のビルドで迷宮を踏破せよ！
        </p>

        {reincarnationCount > 0 && (
          <div className="mt-3 p-3 bg-[#18150f] border border-[#c4a661]/80 rounded-2xl max-w-2xl mx-auto shadow-[0_0_20px_rgba(196,166,97,0.2)]">
            <div className="flex items-center justify-center gap-2 text-[#f3e5be] font-black text-xs md:text-sm tracking-wider">
              <Sparkles className="w-4 h-4 text-[#d4af37] animate-pulse" />
              <span>【転生・昇華ボーナス適用中】 第 {reincarnationCount} 世代の英雄</span>
              <Sparkles className="w-4 h-4 text-[#d4af37] animate-pulse" />
            </div>
            <div className="flex flex-wrap justify-center gap-2 text-[11px] font-mono text-[#e2c98a] mt-2">
              <span className="bg-[#100e0a] px-2 py-0.5 rounded border border-[#3a3322]">HP/MP: +{reincarnationCount * 25}%</span>
              <span className="bg-[#100e0a] px-2 py-0.5 rounded border border-[#3a3322]">攻撃/防御: +{reincarnationCount * 15}%</span>
              <span className="bg-[#100e0a] px-2 py-0.5 rounded border border-[#3a3322]">EXP/GOLD: +{reincarnationCount * 20}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Character Live Preview HUD */}
      <div className="sticky top-16 z-30 mb-6 bg-[#0c0d11]/95 backdrop-blur-md border border-[#c4a661]/60 rounded-2xl p-4 shadow-[0_10px_35px_rgba(0,0,0,0.9)]">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            <div className="w-full sm:w-auto flex items-center gap-2">
              <span className="text-xs font-bold text-[#d4af37] shrink-0">名前:</span>
              <input
                type="text"
                value={heroName}
                onChange={(e) => setHeroName(e.target.value)}
                maxLength={15}
                className="bg-[#07070a] border border-[#3a3528] rounded-lg px-3 py-1.5 text-white text-xs font-bold focus:outline-none focus:border-[#c4a661] w-full sm:w-40"
                placeholder="名前を入力..."
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="bg-[#1c1810] text-[#f3e5be] border border-[#4a422f] px-2.5 py-1 rounded-md font-bold">
                {selectedRace.name.split(' ')[0]}
              </span>
              <span className="bg-[#1c1810] text-[#f3e5be] border border-[#4a422f] px-2.5 py-1 rounded-md font-bold">
                {selectedMagic.name.split(' ')[0]}
              </span>
              <span className="bg-[#1c1810] text-[#f3e5be] border border-[#4a422f] px-2.5 py-1 rounded-md font-bold">
                {selectedClass.name.split(' ')[0]}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono w-full lg:w-auto justify-between lg:justify-end overflow-x-auto pb-1 lg:pb-0">
            <div className="bg-[#18150f] border border-[#c4a661] px-3 py-1 rounded-lg text-[#d4af37] font-extrabold flex items-center gap-1 shrink-0 shadow">
              <span>CP</span>
              <span className="text-sm">{totalCp}</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] shrink-0">
              <span className="text-[#f3e5be] font-bold">HP {calculatedStats.hp}</span>
              <span className="text-[#e2c98a] font-bold">MP {calculatedStats.mp}</span>
              <span className="text-[#e5a93c] font-bold">ATK {calculatedStats.atk}</span>
              <span className="text-[#b8b09d] font-bold">DEF {calculatedStats.def}</span>
              <span className="text-[#d4af37] font-bold">SPD {calculatedStats.spd}</span>
            </div>
            <button
              onClick={() => setShowResetModal(true)}
              className="px-3 py-1.5 bg-[#181010] hover:bg-[#281414] border border-[#522222] text-[#e57373] text-xs font-bold rounded-lg transition flex items-center gap-1 cursor-pointer shrink-0 ml-1"
              title="セーブデータを完全削除して初期化"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>データ初期化</span>
            </button>
          </div>
        </div>
      </div>

      {/* Step 1: Race */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <h2 className="text-base md:text-lg font-black text-[#d4af37] flex items-center gap-2">
            <span className="bg-[#1c1810] text-[#c4a661] w-6 h-6 rounded-full flex items-center justify-center text-xs border border-[#c4a661]/50">1</span>
            種族を選択 ({filteredRaces.length}種類表示)
          </h2>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1 bg-[#0c0d11] p-1 rounded-xl border border-[#2a2720] text-[11px]">
            <button
              onClick={() => setRaceFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${raceFilter === 'all' ? 'bg-[#c4a661] text-[#07070a]' : 'text-[#888378] hover:text-[#e2c98a]'}`}
            >
              すべて ({RACES.length})
            </button>
            <button
              onClick={() => setRaceFilter('base')}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${raceFilter === 'base' ? 'bg-[#c4a661] text-[#07070a]' : 'text-[#888378] hover:text-[#e2c98a]'}`}
            >
              基本種族 (7)
            </button>
            <button
              onClick={() => setRaceFilter('reinc1')}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${raceFilter === 'reinc1' ? 'bg-[#c4a661] text-[#07070a]' : 'text-[#888378] hover:text-[#e2c98a]'}`}
            >
              転生1世代 (10)
            </button>
            <button
              onClick={() => setRaceFilter('reinc2+')}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${raceFilter === 'reinc2+' ? 'bg-[#c4a661] text-[#07070a]' : 'text-[#888378] hover:text-[#e2c98a]'}`}
            >
              転生2世代+ (11)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[380px] overflow-y-auto pr-1">
          {filteredRaces.map((race) => {
            const isSelected = selectedRace.id === race.id;
            const isLocked = race.isReincarnationOnly && reincarnationCount < (race.minReincarnationReq || 1);

            return (
              <div
                key={race.id}
                onClick={() => {
                  if (!isLocked) setSelectedRace(race);
                }}
                className={`rounded-xl p-3.5 transition-all border relative flex flex-col justify-between ${
                  isLocked 
                    ? 'opacity-50 bg-[#08080a] border-[#1c1a15] cursor-not-allowed grayscale' 
                    : isSelected
                      ? 'bg-gradient-to-b from-[#1c1810] to-[#101117] border-[#c4a661] shadow-[0_0_15px_rgba(196,166,97,0.25)] ring-1 ring-[#d4af37] cursor-pointer'
                      : 'bg-[#101117] border-[#25221b] hover:border-[#c4a661]/60 hover:bg-[#151620] cursor-pointer'
                }`}
              >
                {isSelected && !isLocked && (
                  <div className="absolute top-2.5 right-2.5 text-[#d4af37] bg-[#1a1710] p-1 rounded-full border border-[#c4a661] shadow">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}
                {race.isReincarnationOnly && (
                  <div className="mb-1.5">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                      isLocked 
                        ? 'bg-[#18181f] text-[#777] border-[#2d2d38]'
                        : 'bg-[#221c10] text-[#e2c98a] border-[#c4a661]/80'
                    }`}>
                      {isLocked ? `✦ 転生第${race.minReincarnationReq || 1}世代で解放` : `✦ 転生第${race.minReincarnationReq || 1}世代限定`}
                    </span>
                  </div>
                )}
                <div>
                  <div className="text-[#c4a661] mb-1 flex items-center justify-between">
                    {getIconComponent(race.icon)}
                    <span className="text-[10px] font-mono text-[#a09a8a]">HP+{race.bonuses.hp} ATK+{race.bonuses.atk}</span>
                  </div>
                  <h3 className="font-extrabold text-white text-sm mb-1">{race.name}</h3>
                  <p className="text-[11px] text-[#b8b0a0] mb-2 leading-tight">{race.desc}</p>
                </div>
                <div className="bg-[#08080b] rounded-lg p-2 text-[10px] text-[#e2c98a] border border-[#22201a]">
                  <span className="font-bold block text-[#d4af37]">{race.traitName}</span>
                  {race.traitDesc}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step 2: Magic Type */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <h2 className="text-base md:text-lg font-black text-[#d4af37] flex items-center gap-2">
            <span className="bg-[#1c1810] text-[#c4a661] w-6 h-6 rounded-full flex items-center justify-center text-xs border border-[#c4a661]/50">2</span>
            魔法系統を選択 ({filteredMagics.length}系統表示)
          </h2>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1 bg-[#0c0d11] p-1 rounded-xl border border-[#2a2720] text-[11px]">
            <button
              onClick={() => setMagicFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${magicFilter === 'all' ? 'bg-[#c4a661] text-[#07070a]' : 'text-[#888378] hover:text-[#e2c98a]'}`}
            >
              すべて ({MAGIC_TYPES.length})
            </button>
            <button
              onClick={() => setMagicFilter('base')}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${magicFilter === 'base' ? 'bg-[#c4a661] text-[#07070a]' : 'text-[#888378] hover:text-[#e2c98a]'}`}
            >
              基本属性 (5)
            </button>
            <button
              onClick={() => setMagicFilter('reinc1')}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${magicFilter === 'reinc1' ? 'bg-[#c4a661] text-[#07070a]' : 'text-[#888378] hover:text-[#e2c98a]'}`}
            >
              転生1世代 (7)
            </button>
            <button
              onClick={() => setMagicFilter('reinc2+')}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${magicFilter === 'reinc2+' ? 'bg-[#c4a661] text-[#07070a]' : 'text-[#888378] hover:text-[#e2c98a]'}`}
            >
              転生2世代+ (8)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[380px] overflow-y-auto pr-1">
          {filteredMagics.map((magic) => {
            const isSelected = selectedMagic.id === magic.id;
            const isLocked = magic.isReincarnationOnly && reincarnationCount < (magic.minReincarnationReq || 1);

            return (
              <div
                key={magic.id}
                onClick={() => {
                  if (!isLocked) setSelectedMagic(magic);
                }}
                className={`rounded-xl p-3.5 transition-all border relative flex flex-col justify-between ${
                  isLocked
                    ? 'opacity-50 bg-[#08080a] border-[#1c1a15] cursor-not-allowed grayscale'
                    : isSelected
                      ? 'bg-gradient-to-b from-[#1c1810] to-[#101117] border-[#c4a661] shadow-[0_0_15px_rgba(196,166,97,0.25)] ring-1 ring-[#d4af37] cursor-pointer'
                      : 'bg-[#101117] border-[#25221b] hover:border-[#c4a661]/60 hover:bg-[#151620] cursor-pointer'
                }`}
              >
                {isSelected && !isLocked && (
                  <div className="absolute top-2.5 right-2.5 text-[#d4af37] bg-[#1a1710] p-1 rounded-full border border-[#c4a661] shadow">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}
                {magic.isReincarnationOnly && (
                  <div className="mb-1.5">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                      isLocked
                        ? 'bg-[#18181f] text-[#777] border-[#2d2d38]'
                        : 'bg-[#221c10] text-[#e2c98a] border-[#c4a661]/80'
                    }`}>
                      {isLocked ? `✦ 転生第${magic.minReincarnationReq || 1}世代で解放` : `✦ 転生第${magic.minReincarnationReq || 1}世代秘奥義`}
                    </span>
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-6 h-6 rounded bg-[#2a2416] border border-[#c4a661] flex items-center justify-center text-[#d4af37] shadow">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <h3 className="font-extrabold text-white text-sm">{magic.name}</h3>
                  </div>
                  <p className="text-[11px] text-[#b8b0a0] mb-2 leading-tight">{magic.desc}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] text-[#c4a661] font-bold uppercase tracking-wider">初期修得魔法:</span>
                  {magic.spells.map((s) => (
                    <div key={s.id} className="text-[11px] bg-[#08080b] px-2 py-0.5 rounded text-[#d1cbbe] flex justify-between border border-[#22201a]">
                      <span>{s.name}</span>
                      <span className="text-[#d4af37] font-bold">MP{s.mpCost}</span>
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <h2 className="text-base md:text-lg font-black text-[#d4af37] flex items-center gap-2">
            <span className="bg-[#1c1810] text-[#c4a661] w-6 h-6 rounded-full flex items-center justify-center text-xs border border-[#c4a661]/50">3</span>
            役職を選択 ({filteredClasses.length}職種表示)
          </h2>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1 bg-[#0c0d11] p-1 rounded-xl border border-[#2a2720] text-[11px]">
            <button
              onClick={() => setClassFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${classFilter === 'all' ? 'bg-[#c4a661] text-[#07070a]' : 'text-[#888378] hover:text-[#e2c98a]'}`}
            >
              すべて ({CLASSES.length})
            </button>
            <button
              onClick={() => setClassFilter('base')}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${classFilter === 'base' ? 'bg-[#c4a661] text-[#07070a]' : 'text-[#888378] hover:text-[#e2c98a]'}`}
            >
              基本職 (7)
            </button>
            <button
              onClick={() => setClassFilter('reinc1')}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${classFilter === 'reinc1' ? 'bg-[#c4a661] text-[#07070a]' : 'text-[#888378] hover:text-[#e2c98a]'}`}
            >
              転生1世代 (5)
            </button>
            <button
              onClick={() => setClassFilter('reinc2+')}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${classFilter === 'reinc2+' ? 'bg-[#c4a661] text-[#07070a]' : 'text-[#888378] hover:text-[#e2c98a]'}`}
            >
              転生2世代+ (7)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[380px] overflow-y-auto pr-1">
          {filteredClasses.map((cls) => {
            const isSelected = selectedClass.id === cls.id;
            const isLocked = cls.isReincarnationOnly && reincarnationCount < (cls.minReincarnationReq || 1);

            return (
              <div
                key={cls.id}
                onClick={() => {
                  if (!isLocked) setSelectedClass(cls);
                }}
                className={`rounded-xl p-3.5 transition-all border relative flex flex-col justify-between ${
                  isLocked
                    ? 'opacity-50 bg-[#08080a] border-[#1c1a15] cursor-not-allowed grayscale'
                    : isSelected
                      ? 'bg-gradient-to-b from-[#1c1810] to-[#101117] border-[#c4a661] shadow-[0_0_15px_rgba(196,166,97,0.25)] ring-1 ring-[#d4af37] cursor-pointer'
                      : 'bg-[#101117] border-[#25221b] hover:border-[#c4a661]/60 hover:bg-[#151620] cursor-pointer'
                }`}
              >
                {isSelected && !isLocked && (
                  <div className="absolute top-2.5 right-2.5 text-[#d4af37] bg-[#1a1710] p-1 rounded-full border border-[#c4a661] shadow">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}
                {cls.isReincarnationOnly && (
                  <div className="mb-1.5">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                      isLocked
                        ? 'bg-[#18181f] text-[#777] border-[#2d2d38]'
                        : 'bg-[#221c10] text-[#e2c98a] border-[#c4a661]/80'
                    }`}>
                      {isLocked ? `✦ 転生第${cls.minReincarnationReq}世代で解放` : `✦ 転生第${cls.minReincarnationReq}世代限定職`}
                    </span>
                  </div>
                )}
                <div>
                  <div className="text-[#c4a661] mb-1 flex items-center justify-between">
                    {getIconComponent(cls.icon)}
                    <span className="text-[10px] bg-[#1a1710] text-[#d4af37] px-2 py-0.5 rounded border border-[#3a3322] font-bold">
                      {cls.role}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-white text-sm mb-1">{cls.name}</h3>
                  <p className="text-[11px] text-[#b8b0a0] mb-2 leading-tight">{cls.desc}</p>
                </div>
                <div className="grid grid-cols-2 gap-1 text-[11px] bg-[#08080b] p-1.5 rounded-lg text-[#d1cbbe] border border-[#22201a]">
                  <div>HP: <span className="text-[#f3e5be] font-bold">{cls.baseStats.hp + selectedRace.bonuses.hp}</span></div>
                  <div>MP: <span className="text-[#e2c98a] font-bold">{cls.baseStats.mp + selectedRace.bonuses.mp}</span></div>
                  <div>ATK: <span className="text-[#e5a93c] font-bold">{cls.baseStats.atk + selectedRace.bonuses.atk}</span></div>
                  <div>DEF: <span className="text-[#b8b09d] font-bold">{cls.baseStats.def + selectedRace.bonuses.def}</span></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary & Start Button */}
      <div className="bg-[#0e0f14] border border-[#2a2720] rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
        <div>
          <h4 className="text-xs font-semibold text-[#888378] uppercase tracking-wider mb-2">選択された冒険者ステータス</h4>
          <div className="flex flex-wrap items-center gap-3 text-xs font-medium">
            <span className="bg-[#181610] px-3 py-1 rounded-lg text-[#f3e5be] border border-[#3a3322]">種族: {selectedRace.name.split(' ')[0]}</span>
            <span className="bg-[#181610] px-3 py-1 rounded-lg text-[#f3e5be] border border-[#3a3322]">魔法: {selectedMagic.name.split(' ')[0]}</span>
            <span className="bg-[#181610] px-3 py-1 rounded-lg text-[#f3e5be] border border-[#3a3322]">役職: {selectedClass.name.split(' ')[0]}</span>
            <span className="text-[#444]">|</span>
            <span>初期HP: <strong className="text-[#f3e5be]">{calculatedStats.hp}</strong></span>
            <span>初期MP: <strong className="text-[#e2c98a]">{calculatedStats.mp}</strong></span>
            <span>攻撃: <strong className="text-[#e5a93c]">{calculatedStats.atk}</strong></span>
            <span>防御: <strong className="text-[#b8b09d]">{calculatedStats.def}</strong></span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <button
            onClick={() => setShowResetModal(true)}
            className="px-4 py-4 bg-[#181010] hover:bg-[#251414] border border-[#4a2222] text-[#e57373] font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer text-xs"
            title="セーブデータを完全削除して初期化"
          >
            <Trash2 className="w-4 h-4" />
            データ完全リセット
          </button>
          {hasSavedGame && onContinueAdventure && (
            <button
              onClick={onContinueAdventure}
              className="px-6 py-4 bg-[#1c1810] hover:bg-[#282218] text-[#f3e5be] border border-[#c4a661] font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Sparkles className="w-5 h-5 text-[#d4af37]" />
              続きから始める
            </button>
          )}
          <button
            onClick={handleStart}
            className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-[#b89542] via-[#d4af37] to-[#9e7d33] hover:from-[#d4af37] hover:to-[#b89542] text-[#07070a] font-black rounded-xl shadow-lg shadow-[rgba(196,166,97,0.25)] flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-95 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current" />
            冒険に出発する！
          </button>
        </div>
      </div>

      {/* Hard Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#120808] border-2 border-red-600 max-w-md w-full rounded-3xl p-6 shadow-[0_0_50px_rgba(220,38,38,0.3)] text-slate-100 relative animate-fadeIn">
            <div className="flex items-center gap-3 text-red-500 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-red-950/80 border border-red-500/60 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-black text-red-400">【警告】全データ完全初期化</h3>
                <p className="text-xs text-red-300/80">セーブデータの完全削除</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              これまでの進行状況、キャラクター、獲得した称号、所持アイテム、および <strong className="text-amber-400">転生・昇華履歴（世代数）</strong> のすべてのセーブデータを完全に削除して最初からやり直しますか？
            </p>

            <div className="p-3 bg-red-950/40 rounded-xl border border-red-900/60 text-[11px] text-red-300 font-bold mb-6">
              ※ この操作は取り消せません。完全な初回状態に戻ります。
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowResetModal(false)}
                className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                キャンセル
              </button>
              <button
                onClick={handleHardReset}
                className="flex-1 py-3 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-black text-xs rounded-xl shadow-lg border border-red-400/60 flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Trash2 className="w-4 h-4 text-white" />
                完全に初期化する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
