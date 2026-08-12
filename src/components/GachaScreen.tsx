import React, { useState } from 'react';
import { CharacterState, Item, Spell } from '../types';
import { generateRandomLoot, generateRandomWand } from '../utils/lootGenerator';
import { 
  Sparkles, Gift, Coins, Sword, Shield, Share2, Check, RefreshCw, 
  BookOpen, ArrowUpCircle, Flame, Snowflake, Zap, HelpCircle, Eye, Wand2, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { createLogEntry, appendLogToCharacter } from '../utils/logHelper';
import { rollMagicGacha, ALL_PULLABLE_SPELLS, GACHA_EXCLUSIVE_SPELLS } from '../utils/spellUtils';

interface GachaScreenProps {
  character: CharacterState;
  onUpdateCharacter: (updated: CharacterState) => void;
  onShowMessage: (msg: string) => void;
}

type GachaTab = 'weapon' | 'armor' | 'magic' | 'staff';

export const GachaScreen: React.FC<GachaScreenProps> = ({ character, onUpdateCharacter, onShowMessage }) => {
  const [activeTab, setActiveTab] = useState<GachaTab>('weapon');
  const [pullResults, setPullResults] = useState<{ items?: Item[]; spells?: Spell[] } | null>(null);
  const [isPulling, setIsPulling] = useState<boolean>(false);
  const [hasLegendaryInPull, setHasLegendaryInPull] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [showSpellbook, setShowSpellbook] = useState<boolean>(false);
  const [spellSearchQuery, setSpellSearchQuery] = useState<string>('');

  const SINGLE_COST = activeTab === 'magic' ? 400 : activeTab === 'staff' ? 350 : 300;
  const TEN_COST = activeTab === 'magic' ? 3600 : activeTab === 'staff' ? 3200 : 2800;

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

  const handlePull = (count: number) => {
    const totalCost = count === 10 ? TEN_COST : SINGLE_COST;
    if (character.gold < totalCost) {
      onShowMessage('金貨が不足しています！ダンジョンやクエストで稼ぎましょう。');
      return;
    }

    setIsPulling(true);
    setHasLegendaryInPull(false);

    setTimeout(() => {
      let foundLegendary = false;
      let logsTitle = '';
      let logsDesc = '';
      let highestRarity: Item['rarity'] | Spell['rarity'] = 'common';

      let updatedChar = { ...character, gold: character.gold - totalCost };

      if (activeTab === 'weapon') {
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
        logsDesc = `金貨 ${totalCost}G を捧げ、強靭な武器装備（${itemNames}）を獲得！`;
        
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
        logsDesc = `金貨 ${totalCost}G を捧げ、堅牢な防具装備（${itemNames}）を獲得！`;
        
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
        logsDesc = `金貨 ${totalCost}G を捧げ、極上の魔道杖・マジックロッド（${itemNames}）を獲得！`;
        
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
        logsTitle = `エーテル魔法契約召喚 (${count}連)`;
        logsDesc = `金貨 ${totalCost}G を捧げ、古の魔導書を解読。魔法術式（${spellNames}）を獲得・強化！`;
        
        updatedChar.spells = playerSpells;
        setPullResults({ spells });
      }

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

  const getRarityStyle = (rarity: 'common' | 'rare' | 'epic' | 'legendary') => {
    switch (rarity) {
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

  const handleShareGacha = () => {
    if (!pullResults) return;

    let shareLines: string[] = [];
    let highlight = '';

    if (pullResults.items) {
      const highest = pullResults.items.reduce((prev, cur) => {
        const order = { common: 1, rare: 2, epic: 3, legendary: 4 };
        return order[cur.rarity] > order[prev.rarity] ? cur : prev;
      });
      highlight = `【 [${highest.rarity.toUpperCase()}] ${highest.name} 】`;
      shareLines = pullResults.items.map(item => {
        const icon = item.rarity === 'legendary' ? '👑' : item.rarity === 'epic' ? '💎' : item.rarity === 'rare' ? '💠' : '📦';
        return `${icon} [${item.rarity.toUpperCase()}] ${item.name}`;
      });
    } else if (pullResults.spells) {
      const highest = pullResults.spells.reduce((prev, cur) => {
        const order = { common: 1, rare: 2, epic: 3, legendary: 4 };
        const prevR = prev.rarity || 'common';
        const curR = cur.rarity || 'common';
        return order[curR] > order[prevR] ? cur : prev;
      });
      highlight = `【 [${(highest.rarity || 'common').toUpperCase()}] ${highest.name} 】`;
      shareLines = pullResults.spells.map(spell => {
        const icon = spell.rarity === 'legendary' ? '👑' : spell.rarity === 'epic' ? '🔮' : spell.rarity === 'rare' ? '⚡' : '📜';
        return `${icon} [${(spell.rarity || 'common').toUpperCase()}] ${spell.name}`;
      });
    }

    const shareText = `🔮 【エーテルの迷宮】ガチャ結果を自慢する 🔮
━━━━━━━━━━━━━━━━━━━━━━━━
エーテル召喚（${activeTab === 'weapon' ? '武器' : activeTab === 'armor' ? '防具' : '魔法'}召喚）に魔力を捧げた！

✨ 今回の召喚目玉スキル・装備:
👉 ${highlight}

📜 召喚・強化された秘宝一覧:
${shareLines.join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━
▼ 世界の理をハックして、キミも伝説の「神引き」を見せつけろ！
https://ai.studio/build
━━━━━━━━━━━━━━━━━━━━━━━━`;

    navigator.clipboard.writeText(shareText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const getSpellTypeBadge = (effectType: Spell['effectType']) => {
    switch (effectType) {
      case 'damage': return <span className="px-2 py-0.5 bg-red-950/70 text-red-400 text-[9px] rounded font-mono font-bold border border-red-900/40">攻撃</span>;
      case 'heal': return <span className="px-2 py-0.5 bg-emerald-950/70 text-emerald-400 text-[9px] rounded font-mono font-bold border border-emerald-900/40">回復</span>;
      case 'drain': return <span className="px-2 py-0.5 bg-purple-950/70 text-purple-400 text-[9px] rounded font-mono font-bold border border-purple-900/40">吸収</span>;
      default: return <span className="px-2 py-0.5 bg-slate-900 text-slate-400 text-[9px] rounded font-mono font-bold border border-slate-800">補助</span>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-8 animate-fadeIn relative text-slate-100 z-10">
      
      {/* Toast alert */}
      {copied && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 bg-amber-500 text-slate-950 text-xs font-black px-6 py-3 rounded-full shadow-[0_12px_40px_rgba(245,158,11,0.4)] z-50 flex items-center gap-2 animate-bounce font-mono">
          <Check className="w-4 h-4" /> 召喚結果をクリップボードにコピーしました！
        </div>
      )}

      {/* Main Glassmorphic Summoning Dashboard */}
      <div className={`border rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-2xl transition-all duration-500 ${
        isPulling 
          ? 'bg-gradient-to-r from-[#060609] via-[#1a0f2b] to-[#060609] border-purple-500/60 shadow-[0_0_60px_rgba(168,85,247,0.15)]' 
          : 'bg-[#09090d]/95 border-slate-800/80'
      }`}>
        {/* Futuristic glowing backdrops */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-[140px] pointer-events-none" />

        {/* Header Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8 border-b border-slate-800/60 pb-6">
          <div>
            <div className="flex items-center gap-2 text-[#c4a661] text-xs font-mono uppercase tracking-[0.25em] mb-1 font-bold">
              <Sparkles className="w-4 h-4 text-amber-400 animate-spin" /> AETHER RITUAL SUMMONS
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-300">
              エーテルアルケイン召喚
            </h1>
            <p className="text-xs text-slate-400 mt-1.5 max-w-xl leading-relaxed">
              迷宮のエーテルコアに魔力を同調させ、失われた伝説の武装、そして極限呪術【マスター・スペル】を現世に引き寄せます。
            </p>
          </div>
          
          <div className="bg-[#121319] border border-slate-800/80 px-5 py-3.5 rounded-2xl flex items-center gap-3 shadow-inner shrink-0 w-full lg:w-auto">
            <Coins className="w-5 h-5 text-amber-400 animate-bounce" />
            <div className="flex-grow lg:flex-grow-0">
              <div className="text-[10px] text-slate-500 uppercase font-mono tracking-widest">所持金</div>
              <div className="text-xl font-black text-amber-400 font-mono">G {character.gold.toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* DYNAMIC SUMMON TAB CATEGORY PODIUMS */}
        {!isPulling && !pullResults && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { id: 'weapon', label: '武器召喚', icon: Sword, desc: '強大な攻撃力の神剣・巨槌', color: 'border-red-500/30 hover:border-red-500/70', activeColor: 'bg-red-950/30 border-red-500 text-red-400' },
              { id: 'armor', label: '防具召喚', icon: Shield, desc: 'HPと身を守る聖装・重盾', color: 'border-blue-500/30 hover:border-blue-500/70', activeColor: 'bg-blue-950/30 border-blue-500 text-blue-400' },
              { id: 'staff', label: '魔杖召喚', icon: Wand2, desc: '魔力と最大MPを増幅する杖', color: 'border-amber-500/30 hover:border-amber-500/70', activeColor: 'bg-amber-950/30 border-amber-500 text-amber-400' },
              { id: 'magic', label: '魔法契約', icon: Sparkles, desc: '永続呪術の解読と威力強化', color: 'border-purple-500/30 hover:border-purple-500/70', activeColor: 'bg-purple-950/30 border-purple-500 text-purple-400' },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id as GachaTab); setShowSpellbook(false); }}
                  className={`p-4 rounded-2xl border text-left transition-all duration-300 relative group cursor-pointer ${
                    isActive 
                      ? `${tab.activeColor} shadow-[0_8px_25px_rgba(0,0,0,0.6)] scale-[1.02]`
                      : `bg-[#0e0f14]/50 text-slate-400 ${tab.color}`
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-xl transition ${
                      isActive ? 'bg-slate-950/55' : 'bg-[#15161d]'
                    }`}>
                      <Icon className={`w-5 h-5 ${isActive ? 'animate-pulse' : ''}`} />
                    </div>
                    <span className="font-extrabold text-sm tracking-wide text-white">{tab.label}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 line-clamp-1 leading-snug group-hover:text-slate-400 transition">{tab.desc}</p>
                </button>
              );
            })}
          </div>
        )}

        {/* Summon Banner Description */}
        {!isPulling && !pullResults && (
          <div className="mb-8 p-5 bg-[#0e1017] rounded-2xl border border-slate-800/60 flex flex-col sm:flex-row items-start sm:items-center gap-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-tr from-white/5 to-transparent blur-xl pointer-events-none" />
            <div className={`p-4.5 rounded-2xl shrink-0 ${
              activeTab === 'weapon' ? 'bg-red-950/50 text-red-400 border border-red-900/30' : activeTab === 'armor' ? 'bg-blue-950/50 text-blue-400 border border-blue-900/30' : activeTab === 'staff' ? 'bg-amber-950/50 text-amber-400 border border-amber-900/30' : 'bg-purple-950/50 text-purple-400 border border-purple-900/30'
            }`}>
              {activeTab === 'weapon' ? <Sword className="w-7 h-7 animate-pulse" /> : activeTab === 'armor' ? <Shield className="w-7 h-7 animate-pulse" /> : activeTab === 'staff' ? <Wand2 className="w-7 h-7 animate-pulse" /> : <BookOpen className="w-7 h-7 animate-pulse" />}
            </div>
            <div>
              <h3 className="font-extrabold text-white text-sm mb-1">
                {activeTab === 'weapon' ? '⚔️ 武器召喚：限界無き火力の具現化' : activeTab === 'armor' ? '🛡️ 防具召喚：絶対防衛のイージス' : activeTab === 'staff' ? '🔮 魔杖召喚：全知全能の魔力増幅スタック' : '📖 古代魔導契約：マスター・スペルの永続習得'}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
                {activeTab === 'weapon' 
                  ? '物理・魔法攻撃力の限界を超える剣・槍・斧が出現。極稀に金色の奇跡「アストラル・エクスカリバー」が舞い降ります。' 
                  : activeTab === 'armor' 
                    ? '最大HPと防御に極大なバフを加える伝説の防具。高難易度フロアの強撃に耐え抜くための最重要パーツです。' 
                    : activeTab === 'staff'
                      ? '魔法特化クラスに最適な、攻撃威力・最大MP・クリティカル率を驚異的に上昇させるエレメンタルロッドです。'
                      : 'まだ所持していない全攻撃・回復魔法を無制限に習得！同じ魔法が重複すると【マスター強化】され、魔法の基本威力が +15% ずつ永続上昇（最大+5）します！'}
              </p>
            </div>
          </div>
        )}

        {/* Pulling Animation */}
        {isPulling && (
          <div className="my-16 text-center space-y-6">
            <div className="relative w-36 h-36 mx-auto">
              {/* Magic Circle Spinning Outer */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                className={`absolute inset-0 rounded-full border-4 border-dashed opacity-40 ${
                  activeTab === 'weapon' ? 'border-red-500' : activeTab === 'armor' ? 'border-blue-500' : activeTab === 'staff' ? 'border-amber-500' : 'border-purple-500'
                }`}
              />
              
              {/* Magic Circle Spinning Inner */}
              <motion.div 
                animate={{ rotate: -360 }}
                transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                className="absolute inset-4 rounded-full border-2 border-amber-400/30 border-dotted opacity-60"
              />

              <div className="absolute inset-8 rounded-full border border-white/15 animate-ping" />
              
              <div className={`absolute inset-6 rounded-full opacity-90 flex items-center justify-center shadow-2xl bg-gradient-to-tr ${
                activeTab === 'weapon' 
                  ? 'from-red-600 to-amber-500 shadow-red-500/20' 
                  : activeTab === 'armor' 
                    ? 'from-blue-600 to-cyan-500 shadow-blue-500/20' 
                    : activeTab === 'staff'
                      ? 'from-amber-600 to-yellow-500 shadow-amber-500/20'
                      : 'from-purple-600 to-amber-500 shadow-purple-500/20'
              }`}>
                <RefreshCw className="w-10 h-10 text-white animate-spin duration-700" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-black text-white tracking-widest">
                {activeTab === 'magic' ? '次元魔導術式を同調中...' : 'エーテルエネルギーより物質合成中...'}
              </h3>
              <p className="text-[10px] text-amber-400 font-mono tracking-[0.3em] animate-pulse">
                SUMMONING FROM THE ANCIENT ARCHCADE VOID
              </p>
            </div>
          </div>
        )}

        {/* Action Summon Buttons */}
        {!isPulling && !pullResults && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto my-6">
            <button
              onClick={() => handlePull(1)}
              disabled={character.gold < SINGLE_COST}
              className="p-6 bg-[#0e0f14] hover:bg-[#12141c] border border-slate-800 hover:border-slate-600 rounded-3xl text-center transition group cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-xl relative overflow-hidden"
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 mx-auto flex items-center justify-center text-slate-300 mb-4 group-hover:scale-110 transition">
                <Gift className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-white mb-1">単発エーテル召喚</h3>
              <p className="text-xs text-slate-500 mb-4 font-mono">1 SUMMON</p>
              <div className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono font-bold text-amber-400 shadow-md">
                <Coins className="w-4 h-4 text-amber-500" /> {SINGLE_COST} G
              </div>
            </button>

            <button
              onClick={() => handlePull(10)}
              disabled={character.gold < TEN_COST}
              className={`p-6 bg-gradient-to-b from-[#111219] to-[#0c0d13] rounded-3xl text-center transition group cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-2xl relative overflow-hidden border ${
                activeTab === 'weapon' ? 'hover:border-red-500/60' : activeTab === 'armor' ? 'hover:border-blue-500/60' : activeTab === 'staff' ? 'hover:border-amber-500/60' : 'hover:border-purple-500/60'
              }`}
            >
              <div className="absolute top-2.5 right-2.5 px-3 py-0.5 bg-amber-400 text-slate-950 text-[9px] font-extrabold rounded font-mono tracking-wider shadow-sm">
                DISCOUNT / 1回分お得!
              </div>
              <div className={`w-12 h-12 rounded-2xl mx-auto flex items-center justify-center text-slate-950 mb-4 group-hover:scale-110 transition shadow-lg ${
                activeTab === 'weapon' ? 'bg-red-500' : activeTab === 'armor' ? 'bg-blue-500' : activeTab === 'staff' ? 'bg-amber-500' : 'bg-purple-500'
              }`}>
                <Sparkles className="w-5 h-5 text-white animate-pulse" />
              </div>
              <h3 className="text-base font-black text-white mb-1">10連超越契約召喚</h3>
              <p className="text-xs text-slate-500 mb-4 font-mono">10 SUMMONS (RELIABLE)</p>
              <div className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs font-mono font-bold text-amber-400 shadow-md">
                <Coins className="w-4 h-4 text-amber-500 animate-bounce" /> {TEN_COST} G
              </div>
            </button>
          </div>
        )}

        {/* Pull Results Output with Card-Reveal Animations */}
        {pullResults && !isPulling && (
          <div className="mt-4 pt-4 space-y-6">
            
            {/* Legendary Banner */}
            <AnimatePresence>
              {hasLegendaryInPull ? (
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="p-6 bg-gradient-to-r from-amber-500/10 via-orange-500/15 to-yellow-500/10 border-2 border-amber-400 rounded-2xl text-center shadow-[0_0_40px_rgba(245,158,11,0.35)] space-y-2 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.25)_0%,transparent_60%)] animate-pulse" />
                  <h2 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 font-sans tracking-[0.25em] uppercase relative z-10">
                    ★★ 超 絶 神 引 き 確 定 ★★
                  </h2>
                  <p className="text-[10px] text-amber-300 font-mono tracking-widest uppercase relative z-10">
                    LEGENDARY SUMMON RITUAL SUCCEEDED FROM THE COSMIC REALM
                  </p>
                </motion.div>
              ) : (
                <motion.h3 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-xs font-bold text-slate-500 uppercase tracking-[0.2em]"
                >
                  🎉 エーテル融合完了 (AETHER ALCHEMY SYNCHRONIZED)
                </motion.h3>
              )}
            </AnimatePresence>

            {/* Grid display of results (Cinematic Staggered Entrance Cards) */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {pullResults.items && pullResults.items.map((item, idx) => {
                const style = getRarityStyle(item.rarity);
                return (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, scale: 0.3, y: 30, rotateY: 90 }}
                    animate={{ opacity: 1, scale: 1, y: 0, rotateY: 0 }}
                    transition={{ delay: idx * 0.1, duration: 0.5, ease: 'easeOut' }}
                    className={`p-4 rounded-2xl border flex flex-col justify-between text-center relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.05] ${style.card}`}
                  >
                    {/* Glowing outer layer */}
                    {style.glow && <div className={style.glow} />}

                    <div className="relative z-10">
                      <span className={`text-[8px] uppercase font-mono font-bold tracking-widest px-2.5 py-0.5 rounded-full border inline-block mb-3 ${style.badge}`}>
                        {item.rarity}
                      </span>
                      <strong className={`text-sm font-black block mb-1 tracking-tight line-clamp-2 leading-snug h-10 flex items-center justify-center ${style.text}`}>
                        {item.name}
                      </strong>
                    </div>

                    <div className="text-[10px] text-slate-400 font-sans mt-3 pt-3 border-t border-slate-800/80 line-clamp-2 min-h-[36px] relative z-10">
                      {item.desc}
                    </div>
                  </motion.div>
                );
              })}

              {pullResults.spells && pullResults.spells.map((spell, idx) => {
                const style = getRarityStyle(spell.rarity || 'common');
                const isDuplicate = character.spells.some(s => s.id === spell.id);
                return (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, scale: 0.3, y: 30, rotateY: 90 }}
                    animate={{ opacity: 1, scale: 1, y: 0, rotateY: 0 }}
                    transition={{ delay: idx * 0.1, duration: 0.5, ease: 'easeOut' }}
                    className={`p-4 rounded-2xl border flex flex-col justify-between text-center relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.05] ${style.card}`}
                  >
                    {/* Glowing outer layer */}
                    {style.glow && <div className={style.glow} />}

                    <div className="relative z-10">
                      <div className="flex justify-center items-center gap-1.5 mb-2.5">
                        <span className={`text-[8px] uppercase font-mono font-bold tracking-widest px-2 py-0.5 rounded-full border inline-block ${style.badge}`}>
                          {spell.rarity || 'common'}
                        </span>
                        {getSpellTypeBadge(spell.effectType)}
                      </div>
                      <strong className={`text-sm font-black block mb-1 tracking-tight line-clamp-2 leading-snug h-10 flex items-center justify-center ${style.text}`}>
                        {spell.name}
                      </strong>
                    </div>

                    <div className="text-[10px] text-slate-400 font-sans mt-3 pt-2.5 border-t border-slate-800/80 space-y-2 relative z-10">
                      <div className="line-clamp-2 leading-relaxed min-h-[30px]">{spell.desc}</div>
                      <div className="text-[9px] font-mono font-bold text-purple-400 bg-purple-950/40 border border-purple-900/30 py-1 rounded">
                        威力: {spell.power} | MP: {spell.mpCost}
                      </div>
                      {isDuplicate && (
                        <div className="text-[9px] font-extrabold text-amber-400 bg-amber-950/25 border border-amber-500/20 py-0.5 rounded flex items-center justify-center gap-1 font-mono uppercase tracking-wider">
                          <ArrowUpCircle className="w-3.5 h-3.5 text-amber-400 animate-bounce" /> UPGRADE
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Actions footer */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 border-t border-slate-800/80 pt-6"
            >
              <button
                onClick={handleShareGacha}
                className="w-full sm:w-auto px-6 py-3 bg-[#0d0f14] hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-amber-400 font-bold text-xs tracking-widest rounded-2xl transition cursor-pointer flex items-center justify-center gap-2 shadow-lg font-mono uppercase"
              >
                <Share2 className="w-4 h-4" />
                神引き結果を自慢する (SHARE)
              </button>
              <button
                onClick={() => setPullResults(null)}
                className={`w-full sm:w-auto px-10 py-3 text-slate-950 font-black text-xs tracking-widest rounded-2xl hover:bg-white transition cursor-pointer flex items-center justify-center shadow-lg font-mono uppercase ${
                  activeTab === 'weapon' ? 'bg-red-500 text-slate-950' : activeTab === 'armor' ? 'bg-blue-500 text-slate-950' : activeTab === 'staff' ? 'bg-amber-400 text-slate-950' : 'bg-purple-500 text-white'
                }`}
              >
                召喚儀式を閉じる (CLOSE)
              </button>
            </motion.div>
          </div>
        )}
      </div>

      {/* SPELLBOOK SYSTEM PANEL FOR ADDED RETENTION */}
      {activeTab === 'magic' && !isPulling && !pullResults && (
        <div className="bg-[#09090d]/90 border border-slate-800/80 rounded-3xl p-5 md:p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/60">
            <div className="flex items-center gap-2.5">
              <BookOpen className="w-5 h-5 text-purple-400" />
              <div>
                <h3 className="font-extrabold text-white text-sm">エーテル魔導大書庫 (Arcane Spellbook Archive)</h3>
                <p className="text-[11px] text-slate-500">ガチャ限定最強魔法や、全属性呪術の結合・習得ステータス。</p>
              </div>
            </div>
            <button
              onClick={() => setShowSpellbook(!showSpellbook)}
              className="px-4 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800/80 rounded-xl text-xs font-bold text-slate-300 flex items-center gap-2 cursor-pointer self-start sm:self-auto transition-all"
            >
              <Eye className="w-4 h-4 text-purple-400" />
              {showSpellbook ? '閉じる' : '魔法の一覧を覗く'}
            </button>
          </div>

          {showSpellbook && (
            <div className="space-y-4 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-900 text-center">
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">合計魔法収録数</div>
                  <div className="text-xl font-black text-white mt-1">{ALL_PULLABLE_SPELLS.length} 種</div>
                </div>
                <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-900 text-center">
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">あなたが習得した魔法</div>
                  <div className="text-xl font-black text-purple-400 mt-1">{character.spells.length} / {ALL_PULLABLE_SPELLS.length} 種</div>
                </div>
                <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-900 text-center">
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">ガチャ限定秘奥義魔法</div>
                  <div className="text-xl font-black text-amber-400 mt-1">{ALL_PULLABLE_SPELLS.filter(s => s.desc.includes('限定') || s.desc.includes('✦')).length} 種</div>
                </div>
              </div>

              {/* Search Bar */}
              <div className="pt-2">
                <input
                  type="text"
                  value={spellSearchQuery}
                  onChange={(e) => setSpellSearchQuery(e.target.value)}
                  placeholder="魔法名・説明・属性（火炎・時空・龍・召喚・重力等）で検索..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500/80 font-medium placeholder:text-slate-600"
                />
              </div>

              {/* Spells list categorized by rarity */}
              <div className="space-y-6 pt-2">
                {['legendary', 'epic', 'rare', 'common'].map(rarity => {
                  const spellsOfRarity = ALL_PULLABLE_SPELLS.filter(s => {
                    const matchesRarity = s.rarity === rarity;
                    if (!matchesRarity) return false;
                    if (!spellSearchQuery.trim()) return true;
                    const q = spellSearchQuery.toLowerCase();
                    return s.name.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q);
                  });

                  if (spellsOfRarity.length === 0) return null;
                  const style = getRarityStyle(rarity as any);
                  
                  return (
                    <div key={rarity} className="space-y-2.5">
                      <h4 className={`text-xs font-black tracking-[0.2em] uppercase flex items-center gap-2 ${style.text}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping"></span>
                        {rarity.toUpperCase()} SPELLS ({spellsOfRarity.length}件)
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
                        {spellsOfRarity.map(spell => {
                          const learnedSpell = character.spells.find(s => s.id === spell.id);
                          const isLearned = !!learnedSpell;
                          const plusVal = learnedSpell ? (learnedSpell as any).plusLevel || 0 : 0;
                          
                          return (
                            <div 
                              key={spell.id}
                              className={`p-4 rounded-2xl border flex flex-col justify-between transition-all duration-300 ${
                                isLearned 
                                  ? 'bg-slate-950/90 border-purple-500/25 shadow-md' 
                                  : 'bg-slate-950/30 border-slate-900/60 opacity-40'
                              }`}
                            >
                              <div className="flex justify-between items-start gap-2">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-extrabold text-white text-xs">{spell.name}</span>
                                    {isLearned && (
                                      <span className="px-2 py-0.5 bg-purple-500/10 text-purple-300 text-[8px] rounded font-mono font-bold border border-purple-500/20">
                                        習得済 {plusVal > 0 ? `+${plusVal}` : ''}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">{spell.desc}</p>
                                </div>
                                {getSpellTypeBadge(spell.effectType)}
                              </div>
                              <div className="flex justify-between items-center text-[10px] font-mono font-semibold text-slate-500 mt-4 pt-2.5 border-t border-slate-900/80">
                                <span>威力: <strong className="text-slate-300">{spell.power}</strong></span>
                                <span>消費MP: <strong className="text-slate-300">{spell.mpCost}</strong></span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
