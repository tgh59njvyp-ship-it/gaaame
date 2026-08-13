import React, { useState } from 'react';
import { CharacterState, Item, Spell } from '../types';
import { generateRandomLoot, generateRandomWand } from '../utils/lootGenerator';
import { 
  Sparkles, Gift, Coins, Sword, Shield, Share2, Check, RefreshCw, 
  BookOpen, Flame, Zap, HelpCircle, Eye, Wand2, Trophy, Crown, Ticket
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { createLogEntry, appendLogToCharacter } from '../utils/logHelper';
import { rollMagicGacha, ALL_PULLABLE_SPELLS, GACHA_EXCLUSIVE_SPELLS } from '../utils/spellUtils';
import { checkAndUpdateBeginnerQuests } from '../utils/beginnerQuests';

interface GachaScreenProps {
  character: CharacterState;
  onUpdateCharacter: (updated: CharacterState) => void;
  onShowMessage: (msg: string) => void;
}

type GachaTab = 'event' | 'weapon' | 'armor' | 'magic' | 'staff';

export const GachaScreen: React.FC<GachaScreenProps> = ({ character, onUpdateCharacter, onShowMessage }) => {
  const [activeTab, setActiveTab] = useState<GachaTab>('event');
  const [pullResults, setPullResults] = useState<{ items?: Item[]; spells?: Spell[] } | null>(null);
  const [isPulling, setIsPulling] = useState<boolean>(false);
  const [hasLegendaryInPull, setHasLegendaryInPull] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [showSpellbook, setShowSpellbook] = useState<boolean>(false);
  const [spellSearchQuery, setSpellSearchQuery] = useState<string>('');

  const SINGLE_COST = 300; // 300 Gems
  const TEN_COST = 3000;  // 3000 Gems

  // Helper to force weapon type
  const getWeaponItem = (): Item => {
    let item = generateRandomLoot(character.level, Math.min(5, Math.ceil(character.level / 2)), true);
    while (item.type !== 'weapon') {
      item = generateRandomLoot(character.level, Math.min(5, Math.ceil(character.level / 2)), true);
    }
    return item;
  };

  // Helper to force armor type
  const getArmorItem = (): Item => {
    let item = generateRandomLoot(character.level, Math.min(5, Math.ceil(character.level / 2)), true);
    while (item.type !== 'armor') {
      item = generateRandomLoot(character.level, Math.min(5, Math.ceil(character.level / 2)), true);
    }
    return item;
  };

  // Helper for Event Gacha Limited Drop
  const getEventGachaItem = (): Item => {
    const isLegendary = Math.random() < 0.18; // High 18% legendary rate
    if (isLegendary) {
      const picks: Item[] = [
        {
          id: `event_sword_${Date.now()}_${Math.random()}`,
          name: '【限定】星辰の創滅剣',
          type: 'weapon',
          rarity: 'legendary',
          stats: { atk: 160, crit: 20, spd: 15 },
          desc: '1ヶ月限定アニバーサリー超神武。星々の煌めきを纏い、敵を穿つ。',
          price: 5000,
          icon: 'Sword',
        },
        {
          id: `event_armor_${Date.now()}_${Math.random()}`,
          name: '【限定】創世のアカシックドレス',
          type: 'armor',
          rarity: 'legendary',
          stats: { hp: 600, def: 95, mp: 120 },
          desc: '1ヶ月限定アニバーサリー防具。全ダメージを軽減する聖域障壁を展開。',
          price: 5000,
          icon: 'Shield',
        },
        {
          id: `event_staff_${Date.now()}_${Math.random()}`,
          name: '【限定】極光のアカシック・ロッド',
          type: 'weapon',
          rarity: 'legendary',
          stats: { atk: 140, mp: 150, crit: 15 },
          desc: '1ヶ月限定アニバーサリー神杖。全属性魔法威力を爆発的に増幅させる。',
          price: 5000,
          icon: 'Wand2',
        },
      ];
      return picks[Math.floor(Math.random() * picks.length)];
    }

    // Default rare/epic
    let loot = generateRandomLoot(character.level + 3, 5, true);
    loot.name = `【創世】 ${loot.name}`;
    return loot;
  };

  const handlePull = (count: number, useTicket: boolean = false) => {
    const currentGems = character.gems || 0;
    const currentTickets = character.gacha10Tickets || 0;

    if (useTicket) {
      if (currentTickets < 1) {
        onShowMessage('10連ガチャチケットを所持していません！ログボルーレットで獲得しましょう。');
        return;
      }
    } else {
      const totalCost = count === 10 ? TEN_COST : SINGLE_COST;
      if (currentGems < totalCost) {
        onShowMessage('ジェムが不足しています！初心者クエストやイベントで獲得しましょう。');
        return;
      }
    }

    setIsPulling(true);
    setHasLegendaryInPull(false);

    setTimeout(() => {
      let foundLegendary = false;
      let logsTitle = '';
      let logsDesc = '';
      let highestRarity: Item['rarity'] | Spell['rarity'] = 'common';

      let updatedChar = { ...character };
      if (useTicket) {
        updatedChar.gacha10Tickets = currentTickets - 1;
      } else {
        const totalCost = count === 10 ? TEN_COST : SINGLE_COST;
        updatedChar.gems = currentGems - totalCost;
      }

      if (activeTab === 'event') {
        const items: Item[] = [];
        for (let i = 0; i < count; i++) {
          const item = getEventGachaItem();
          if (count === 10 && i === 9 && item.rarity === 'common') {
            item.rarity = 'rare';
          }
          items.push(item);
          if (item.rarity === 'legendary') foundLegendary = true;
        }

        highestRarity = items.reduce((highest, cur) => {
          const order = { common: 1, rare: 2, epic: 3, legendary: 4 };
          return order[cur.rarity] > order[highest] ? cur.rarity : highest;
        }, 'common' as Item['rarity']);

        const itemNames = items.map(it => it.name).slice(0, 3).join('、') + (items.length > 3 ? '等' : '');
        logsTitle = `1ヶ月限定イベント召喚 (${count}連)`;
        logsDesc = `創世のジェムを捧げ、アニバーサリー限定秘宝（${itemNames}）を獲得！`;
        
        updatedChar.inventory = [...updatedChar.inventory, ...items];
        // Give event tokens too!
        updatedChar.eventTokens = (updatedChar.eventTokens || 0) + (count * 10);

        setPullResults({ items });

      } else if (activeTab === 'weapon') {
        const items: Item[] = [];
        for (let i = 0; i < count; i++) {
          const item = getWeaponItem();
          if (count === 10 && i === 9 && item.rarity === 'common') {
            item.rarity = 'rare';
            item.name = `[特選] ${item.name}`;
          }
          items.push(item);
          if (item.rarity === 'legendary') foundLegendary = true;
        }

        highestRarity = items.reduce((highest, cur) => {
          const order = { common: 1, rare: 2, epic: 3, legendary: 4 };
          return order[cur.rarity] > order[highest] ? cur.rarity : highest;
        }, 'common' as Item['rarity']);

        const itemNames = items.map(it => it.name).slice(0, 3).join('、') + (items.length > 3 ? '等' : '');
        logsTitle = `武器ガチャ召喚 (${count}連)`;
        logsDesc = `武器ガチャを引いて（${itemNames}）を獲得！`;
        
        updatedChar.inventory = [...updatedChar.inventory, ...items];
        setPullResults({ items });

      } else if (activeTab === 'armor') {
        const items: Item[] = [];
        for (let i = 0; i < count; i++) {
          const item = getArmorItem();
          if (count === 10 && i === 9 && item.rarity === 'common') {
            item.rarity = 'rare';
            item.name = `[特選] ${item.name}`;
          }
          items.push(item);
          if (item.rarity === 'legendary') foundLegendary = true;
        }

        highestRarity = items.reduce((highest, cur) => {
          const order = { common: 1, rare: 2, epic: 3, legendary: 4 };
          return order[cur.rarity] > order[highest] ? cur.rarity : highest;
        }, 'common' as Item['rarity']);

        const itemNames = items.map(it => it.name).slice(0, 3).join('、') + (items.length > 3 ? '等' : '');
        logsTitle = `防具ガチャ召喚 (${count}連)`;
        logsDesc = `防具ガチャを引いて（${itemNames}）を獲得！`;
        
        updatedChar.inventory = [...updatedChar.inventory, ...items];
        setPullResults({ items });

      } else if (activeTab === 'staff') {
        const items: Item[] = [];
        for (let i = 0; i < count; i++) {
          const item = generateRandomWand(character.level, Math.min(5, Math.ceil(character.level / 2)));
          if (count === 10 && i === 9 && item.rarity === 'common') {
            item.rarity = 'rare';
            item.name = `[特選] ${item.name}`;
          }
          items.push(item);
          if (item.rarity === 'legendary') foundLegendary = true;
        }

        highestRarity = items.reduce((highest, cur) => {
          const order = { common: 1, rare: 2, epic: 3, legendary: 4 };
          return order[cur.rarity] > order[highest] ? cur.rarity : highest;
        }, 'common' as Item['rarity']);

        const itemNames = items.map(it => it.name).slice(0, 3).join('、') + (items.length > 3 ? '等' : '');
        logsTitle = `魔杖ガチャ召喚 (${count}連)`;
        logsDesc = `魔杖ガチャを引いて（${itemNames}）を獲得！`;
        
        updatedChar.inventory = [...updatedChar.inventory, ...items];
        setPullResults({ items });

      } else {
        const spells = rollMagicGacha(count, character.level, character.reincarnationCount || 0);
        const playerSpells = [...updatedChar.spells];
        
        spells.forEach(spell => {
          if (spell.rarity === 'legendary') foundLegendary = true;
          
          const dupIndex = playerSpells.findIndex(s => s.id === spell.id);
          if (dupIndex === -1) {
            playerSpells.push({ ...spell, desc: `${spell.desc} (ガチャ召喚)` });
          } else {
            const existing = playerSpells[dupIndex];
            const currentPlus = (existing as any).plusLevel || 0;
            if (currentPlus < 5) {
              const nextPlus = currentPlus + 1;
              playerSpells[dupIndex] = {
                ...existing,
                name: existing.name.includes('+') 
                  ? existing.name.replace(/\+\d+$/, `+${nextPlus}`) 
                  : `${existing.name} +${nextPlus}`,
                power: Math.floor(existing.power * 1.15),
                desc: existing.desc.includes('強化') 
                  ? existing.desc 
                  : `${existing.desc} [強化Lv.${nextPlus}]`,
                plusLevel: nextPlus
              } as any;
            } else {
              updatedChar.gold += 500;
            }
          }
        });

        highestRarity = spells.reduce((highest, cur) => {
          const order = { common: 1, rare: 2, epic: 3, legendary: 4 };
          const curRarity = cur.rarity || 'common';
          return order[curRarity] > order[highest] ? curRarity : highest;
        }, 'common' as Spell['rarity']);

        const spellNames = spells.map(s => s.name).slice(0, 3).join('、') + (spells.length > 3 ? '等' : '');
        logsTitle = `魔法契約召喚 (${count}連)`;
        logsDesc = `魔法ガチャを引いて（${spellNames}）を獲得・強化！`;
        
        updatedChar.spells = playerSpells;
        setPullResults({ spells });
      }

      // Check beginner quests
      updatedChar = checkAndUpdateBeginnerQuests(updatedChar, 'gacha', 1);

      const logEntry = createLogEntry(
        'gacha',
        logsTitle,
        logsDesc,
        undefined,
        { rarity: highestRarity as any }
      );

      const currentGachaPulls = updatedChar.stats.gachaPulls || 0;
      updatedChar.stats = {
        ...updatedChar.stats,
        gachaPulls: currentGachaPulls + count
      };

      updatedChar = appendLogToCharacter(updatedChar, logEntry);

      onUpdateCharacter(updatedChar);
      setHasLegendaryInPull(foundLegendary);
      setIsPulling(false);

      if (foundLegendary) {
        onShowMessage(`🎉 超絶神引き！！！ 伝説級 [LEGENDARY] 召喚に成功しました！！！`);
      } else {
        onShowMessage(`${count === 10 ? '10連召喚' : '単発召喚'}を完了しました！`);
      }
    }, 2000);
  };

  const getRarityStyle = (rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic' | 'divine') => {
    switch (rarity) {
      case 'divine':
        return {
          card: 'bg-gradient-to-b from-[#250d18] via-[#2c1235] to-[#0a0510] border-rose-400 shadow-[0_0_50px_rgba(244,63,94,0.7)]',
          badge: 'bg-rose-500/20 text-rose-200 border-rose-400/80 shadow-[0_0_12px_rgba(244,63,94,0.5)]',
          text: 'text-transparent bg-clip-text bg-gradient-to-r from-rose-200 via-purple-300 to-amber-200 font-black tracking-wider',
          glow: 'absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-rose-500 via-purple-500 to-amber-400 opacity-30 blur-2xl animate-pulse pointer-events-none'
        };
      case 'mythic':
        return {
          card: 'bg-gradient-to-b from-[#24120a] via-[#331a0e] to-[#0d0704] border-amber-400 shadow-[0_0_40px_rgba(245,158,11,0.6)]',
          badge: 'bg-amber-500/20 text-amber-200 border-amber-400/70 shadow-[0_0_10px_rgba(245,158,11,0.4)]',
          text: 'text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-200 to-red-400 font-extrabold',
          glow: 'absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 opacity-25 blur-xl animate-pulse pointer-events-none'
        };
      case 'legendary': 
        return {
          card: 'bg-gradient-to-b from-[#1c160a] via-[#2a1e0b] to-[#0c0903] border-amber-400 shadow-[0_0_35px_rgba(245,158,11,0.55)]',
          badge: 'bg-amber-400/15 text-amber-300 border-amber-400/50 shadow-[0_0_8px_rgba(245,158,11,0.25)]',
          text: 'text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-100 to-amber-500 font-extrabold',
          glow: 'absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-yellow-500 via-amber-400 to-orange-500 opacity-20 blur-xl animate-pulse pointer-events-none'
        };
      case 'epic': 
        return {
          card: 'bg-gradient-to-b from-[#180a25] via-[#1a0e28] to-[#0d0715] border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.3)]',
          badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
          text: 'text-purple-300 font-bold',
          glow: 'absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 opacity-15 blur-lg pointer-events-none'
        };
      case 'rare': 
        return {
          card: 'bg-gradient-to-b from-[#09152b] via-[#0d172e] to-[#040816] border-cyan-500/80 shadow-[0_0_15px_rgba(6,182,212,0.15)]',
          badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
          text: 'text-cyan-300 font-bold',
          glow: 'absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 opacity-10 blur-md pointer-events-none'
        };
      default: 
        return {
          card: 'bg-[#101115] border-slate-800/80 hover:border-slate-700/80 shadow-md',
          badge: 'bg-slate-800 text-slate-400 border-slate-700',
          text: 'text-slate-100 font-semibold',
          glow: ''
        };
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6 animate-fadeIn pb-24">
      {/* HEADER WITH GEM & TICKET BALANCE */}
      <div className="bg-[#0b0c10] border border-[#2a2720] rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#d4af37] text-xs font-mono uppercase tracking-widest mb-1">
            <Sparkles className="w-4 h-4" /> 創世のエーテル召喚陣
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">ジェム召喚ポータル</h1>
          <p className="text-xs text-slate-400 mt-1">ジェムまたは10連ガチャチケットで強力な装備・魔法を召喚！</p>
        </div>

        {/* Currency Display */}
        <div className="flex items-center gap-3">
          <div className="bg-[#121318] border border-amber-500/50 px-4 py-2.5 rounded-2xl flex items-center gap-2 shadow-lg">
            <span className="text-lg">💎</span>
            <div>
              <div className="text-[9px] text-slate-400 font-mono uppercase">所持ジェム</div>
              <div className="text-base font-black text-amber-400 font-mono">{(character.gems || 0).toLocaleString()}</div>
            </div>
          </div>

          <div className="bg-[#121318] border border-indigo-500/50 px-4 py-2.5 rounded-2xl flex items-center gap-2 shadow-lg">
            <Ticket className="w-5 h-5 text-indigo-400" />
            <div>
              <div className="text-[9px] text-slate-400 font-mono uppercase">10連ガチャ券</div>
              <div className="text-base font-black text-indigo-300 font-mono">{(character.gacha10Tickets || 0)} 枚</div>
            </div>
          </div>
        </div>
      </div>

      {/* CATEGORY SELECTOR TABS */}
      {!isPulling && !pullResults && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            { id: 'event', label: '1ヶ月限定イベント', icon: Trophy, desc: '★最高確率18%★ 創世の神武', activeColor: 'bg-amber-950/40 border-amber-400 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.3)]' },
            { id: 'weapon', label: '武器召喚', icon: Sword, desc: '強大な攻撃力の神剣・巨槌', activeColor: 'bg-red-950/30 border-red-500 text-red-400' },
            { id: 'armor', label: '防具召喚', icon: Shield, desc: 'HPと身を守る聖装・重盾', activeColor: 'bg-blue-950/30 border-blue-500 text-blue-400' },
            { id: 'staff', label: '魔杖召喚', icon: Wand2, desc: '魔力と最大MPを増幅する杖', activeColor: 'bg-amber-950/30 border-amber-500 text-amber-400' },
            { id: 'magic', label: '魔法契約', icon: Sparkles, desc: '永続呪術の解読と威力強化', activeColor: 'bg-purple-950/30 border-purple-500 text-purple-400' },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id as GachaTab); setShowSpellbook(false); }}
                className={`p-3.5 rounded-2xl border text-left transition-all duration-300 relative group cursor-pointer ${
                  isActive 
                    ? `${tab.activeColor} scale-[1.02]`
                    : `bg-[#0e0f14]/50 text-slate-400 border-slate-800 hover:border-slate-700`
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`w-4 h-4 ${isActive ? 'animate-pulse' : ''}`} />
                  <span className="font-extrabold text-xs tracking-wide text-white">{tab.label}</span>
                </div>
                <p className="text-[10px] text-slate-400 line-clamp-1">{tab.desc}</p>
              </button>
            );
          })}
        </div>
      )}

      {/* BANNER DESCRIPTION & RATES */}
      {!isPulling && !pullResults && (
        <div className="space-y-3">
          <div className="p-5 bg-[#0e1017] rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center gap-4 relative overflow-hidden">
            <div className="p-4 rounded-2xl bg-amber-950/50 text-amber-400 border border-amber-500/40 shrink-0">
              {activeTab === 'event' ? <Trophy className="w-7 h-7 animate-bounce" /> : <Sparkles className="w-7 h-7" />}
            </div>
            <div className="flex-1">
              <h3 className="font-extrabold text-white text-sm mb-1">
                {activeTab === 'event' 
                  ? '🏆 【1ヶ月限定アニバーサリーガチャ】 創世の星辰降臨！'
                  : activeTab === 'weapon' ? '⚔️ 武器召喚：火力の具現化' : activeTab === 'armor' ? '🛡️ 防具召喚：絶対防衛のイージス' : activeTab === 'staff' ? '🔮 魔杖召喚：魔力増幅スタック' : '📖 古代魔導契約：マスター・スペル習得'}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {activeTab === 'event'
                  ? '1ヶ月限定の特別ピックアップ！「【限定】星辰の創滅剣」「【限定】創世のアカシックドレス」などの超絶最高峰レジェンド武具が18%の高確率で排出されます！さらに10連で創世の星屑トークン付き！'
                  : '1回 300 ジェム / 10連 3,000 ジェムで召喚！(10連ガチャチケットも消費可能)'}
              </p>
            </div>
          </div>

          {/* Probability Ratios Table / Card */}
          <div className="p-4 bg-slate-950/80 border border-amber-500/30 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-amber-300 font-bold font-mono">
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span>📊 提供割合 (排出確率):</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
              {activeTab === 'event' ? (
                <>
                  <span className="px-2 py-1 bg-amber-500/20 text-amber-300 rounded border border-amber-500/40 font-bold">レジェンド (Legendary): 18.0%</span>
                  <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded border border-purple-500/30">エピック (Epic): 32.0%</span>
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded border border-blue-500/30">レア (Rare): 50.0%</span>
                </>
              ) : activeTab === 'magic' ? (
                <>
                  <span className="px-2 py-1 bg-rose-500/20 text-rose-300 rounded border border-rose-500/40 font-bold">創世・神話級 (Divine/Mythic): 5.0%</span>
                  <span className="px-2 py-1 bg-amber-500/20 text-amber-300 rounded border border-amber-500/40">レジェンド (Legendary): 20.0%</span>
                  <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded border border-purple-500/30">エピック (Epic): 75.0%</span>
                </>
              ) : (
                <>
                  <span className="px-2 py-1 bg-amber-500/20 text-amber-300 rounded border border-amber-500/40 font-bold">レジェンド (Legendary): 10.0%</span>
                  <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded border border-purple-500/30">エピック (Epic): 30.0%</span>
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded border border-blue-500/30">レア (Rare): 60.0%</span>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PULLING ANIMATION */}
      {isPulling && (
        <div className="my-16 text-center space-y-6">
          <div className="relative w-36 h-36 mx-auto">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
              className="absolute inset-0 rounded-full border-4 border-dashed border-amber-400 opacity-60"
            />
            <div className="absolute inset-6 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center shadow-2xl">
              <RefreshCw className="w-10 h-10 text-white animate-spin duration-700" />
            </div>
          </div>
          <h3 className="text-xl font-black text-white tracking-widest">ジェムの魔力で時空を歪めて召喚中...</h3>
        </div>
      )}

      {/* ACTION BUTTONS */}
      {!isPulling && !pullResults && (
        <div className="space-y-4 max-w-2xl mx-auto my-6">
          {/* Ticket Pull Option if available */}
          {(character.gacha10Tickets || 0) > 0 && (
            <button
              onClick={() => handlePull(10, true)}
              className="w-full p-4 bg-gradient-to-r from-indigo-900/80 via-purple-900/80 to-indigo-900/80 hover:from-indigo-800 hover:to-purple-800 border-2 border-indigo-400 rounded-2xl text-center shadow-[0_0_25px_rgba(99,102,241,0.4)] flex items-center justify-center gap-3 cursor-pointer animate-pulse"
            >
              <Ticket className="w-6 h-6 text-indigo-300" />
              <div>
                <div className="font-black text-sm text-white">🎫 10連ガチャチケット1枚を消費して 10連無料召喚！</div>
                <div className="text-[10px] text-indigo-200 font-mono">残り所持数: {character.gacha10Tickets} 枚</div>
              </div>
            </button>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => handlePull(1, false)}
              disabled={(character.gems || 0) < SINGLE_COST}
              className="p-5 bg-[#0e0f14] hover:bg-[#12141c] border border-slate-800 hover:border-slate-600 rounded-2xl text-center transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-xl"
            >
              <h3 className="text-sm font-black text-white mb-1">単発ジェム召喚</h3>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono font-bold text-amber-400">
                💎 {SINGLE_COST} Gems
              </div>
            </button>

            <button
              onClick={() => handlePull(10, false)}
              disabled={(character.gems || 0) < TEN_COST}
              className="p-5 bg-gradient-to-b from-amber-950/60 to-[#0c0d13] border border-amber-500/60 hover:border-amber-400 rounded-2xl text-center transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-2xl"
            >
              <h3 className="text-sm font-black text-white mb-1">10連ジェム召喚 (確定あり)</h3>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 border border-amber-500/40 rounded-xl text-xs font-mono font-bold text-amber-300">
                💎 {TEN_COST} Gems
              </div>
            </button>
          </div>
        </div>
      )}

      {/* RESULTS DISPLAY */}
      {pullResults && !isPulling && (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-black text-amber-300">🎉 召喚結果</h3>
            <button
              onClick={() => setPullResults(null)}
              className="mt-3 px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs rounded-xl shadow-lg cursor-pointer hover:scale-105"
            >
              結果を閉じる / 確定
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {pullResults.items && pullResults.items.map((item, idx) => {
              const style = getRarityStyle(item.rarity);
              return (
                <div key={idx} className={`p-3 rounded-xl border text-center ${style.card}`}>
                  <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded ${style.badge}`}>{item.rarity}</span>
                  <div className="font-bold text-xs text-white my-1 truncate">{item.name}</div>
                  <p className="text-[9px] text-slate-400 line-clamp-2">{item.desc}</p>
                </div>
              );
            })}

            {pullResults.spells && pullResults.spells.map((spell, idx) => {
              const style = getRarityStyle(spell.rarity || 'common');
              return (
                <div key={idx} className={`p-3 rounded-xl border text-center ${style.card}`}>
                  <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded ${style.badge}`}>{spell.rarity || 'common'}</span>
                  <div className="font-bold text-xs text-white my-1 truncate">{spell.name}</div>
                  <p className="text-[9px] text-slate-400 line-clamp-2">{spell.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
