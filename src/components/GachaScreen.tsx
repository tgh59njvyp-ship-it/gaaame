import React, { useState } from 'react';
import { CharacterState, Item, Spell } from '../types';
import { generateRandomLoot, generateRandomWand } from '../utils/lootGenerator';
import { 
  Sparkles, Gift, Coins, Sword, Shield, Share2, Check, RefreshCw, 
  BookOpen, ArrowUpCircle, Flame, Snowflake, Zap, HelpCircle, Eye, Wand2
} from 'lucide-react';
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
            // Guarantee rare+ for 10th pull
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
        // MAGIC GACHA
        const spells = rollMagicGacha(count, character.level);
        const playerSpells = [...updatedChar.spells];
        
        spells.forEach(spell => {
          if (spell.rarity === 'legendary') foundLegendary = true;
          
          // Check duplicate
          const dupIndex = playerSpells.findIndex(s => s.id === spell.id);
          if (dupIndex === -1) {
            // New spell learned!
            playerSpells.push({ ...spell, desc: `${spell.desc} (ガチャ召喚)` });
          } else {
            // Duplicate Upgrade Mechanic!
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
              // Refund/Bonus Gold for max tier dupe
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

      // Append Log & Stats
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
    }, 1500);
  };

  const getRarityStyle = (rarity: 'common' | 'rare' | 'epic' | 'legendary') => {
    switch (rarity) {
      case 'legendary': 
        return {
          card: 'bg-gradient-to-b from-amber-950/40 via-[#20170a] to-[#0c0a06] border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.5)] animate-pulse',
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
          text: 'text-amber-400 font-extrabold'
        };
      case 'epic': 
        return {
          card: 'bg-gradient-to-b from-purple-950/30 via-[#1a0f25] to-[#0c0612] border-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.2)]',
          badge: 'bg-purple-500/20 text-purple-300 border-purple-500/50',
          text: 'text-purple-400 font-bold'
        };
      case 'rare': 
        return {
          card: 'bg-gradient-to-b from-blue-950/20 via-[#0f172a] to-[#060b18] border-blue-500',
          badge: 'bg-blue-500/20 text-blue-300 border-blue-500/50',
          text: 'text-blue-400 font-bold'
        };
      default: 
        return {
          card: 'bg-[#121215] border-[#2d2d30]',
          badge: 'bg-slate-800 text-slate-400 border-slate-700',
          text: 'text-white font-medium'
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
      case 'damage': return <span className="px-1.5 py-0.5 bg-red-950 text-red-400 text-[9px] rounded font-bold">攻撃</span>;
      case 'heal': return <span className="px-1.5 py-0.5 bg-emerald-950 text-emerald-400 text-[9px] rounded font-bold">回復</span>;
      case 'drain': return <span className="px-1.5 py-0.5 bg-purple-950 text-purple-400 text-[9px] rounded font-bold">吸収</span>;
      default: return <span className="px-1.5 py-0.5 bg-slate-800 text-slate-400 text-[9px] rounded font-bold">補助</span>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6 animate-fadeIn relative text-slate-100">
      
      {/* Toast alert */}
      {copied && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 bg-amber-500 text-slate-950 text-xs font-black px-6 py-2.5 rounded-full shadow-2xl z-50 flex items-center gap-1.5 animate-bounce">
          <Check className="w-4 h-4" /> 召喚結果をクリップボードにコピーしました！
        </div>
      )}

      {/* Main Container */}
      <div className={`border rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-2xl transition duration-500 ${
        isPulling 
          ? 'bg-gradient-to-r from-[#0d0d12] via-[#241738] to-[#0d0d12] border-purple-500/40' 
          : 'bg-[#0b0c10] border-slate-800'
      }`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#c4a661]/5 rounded-full blur-3xl pointer-events-none"></div>

        {/* Top Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-slate-800/80 pb-6">
          <div>
            <div className="flex items-center gap-2 text-[#c4a661] text-xs font-mono uppercase tracking-widest mb-1 font-bold">
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" /> AETHER RITUAL SUMMONS
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">エーテルアーケード召喚</h1>
            <p className="text-xs text-slate-400 mt-1">
              迷宮のエーテルに魔力を捧げ、武器・防具、そして強力な【魔法・スペル】を現世に召喚せよ！
            </p>
          </div>
          
          <div className="bg-slate-950 border border-slate-800 px-5 py-3 rounded-2xl flex items-center gap-3 shadow-inner">
            <Coins className="w-5 h-5 text-amber-400" />
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-mono tracking-wider">所持金</div>
              <div className="text-lg font-black text-amber-400 font-mono">G {character.gold.toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* TAB CONTROLLERS */}
        {!isPulling && !pullResults && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-1 bg-slate-950 rounded-2xl mb-8 border border-slate-800">
            <button
              onClick={() => { setActiveTab('weapon'); setShowSpellbook(false); }}
              className={`py-3 px-2 rounded-xl text-xs font-black tracking-wider transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'weapon'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Sword className="w-4 h-4" />
              <span>武器召喚</span>
            </button>
            <button
              onClick={() => { setActiveTab('armor'); setShowSpellbook(false); }}
              className={`py-3 px-2 rounded-xl text-xs font-black tracking-wider transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'armor'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>防具召喚</span>
            </button>
            <button
              onClick={() => { setActiveTab('staff'); setShowSpellbook(false); }}
              className={`py-3 px-2 rounded-xl text-xs font-black tracking-wider transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'staff'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Wand2 className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>魔杖召喚</span>
            </button>
            <button
              onClick={() => { setActiveTab('magic'); }}
              className={`py-3 px-2 rounded-xl text-xs font-black tracking-wider transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'magic'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-950/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Sparkles className="w-4 h-4 text-purple-300 animate-pulse" />
              <span>魔法召喚</span>
            </button>
          </div>
        )}

        {/* Summon Banner Description */}
        {!isPulling && !pullResults && (
          <div className="mb-8 p-4 bg-slate-950/60 rounded-2xl border border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className={`p-3 rounded-xl ${
              activeTab === 'weapon' ? 'bg-red-950 text-red-400' : activeTab === 'armor' ? 'bg-blue-950 text-blue-400' : activeTab === 'staff' ? 'bg-amber-950 text-amber-400' : 'bg-purple-950 text-purple-400'
            }`}>
              {activeTab === 'weapon' ? <Sword className="w-6 h-6 animate-bounce" /> : activeTab === 'armor' ? <Shield className="w-6 h-6 animate-bounce" /> : activeTab === 'staff' ? <Wand2 className="w-6 h-6 animate-bounce" /> : <BookOpen className="w-6 h-6 animate-bounce" />}
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">
                {activeTab === 'weapon' ? '【武器召喚】強大な攻撃を繰り出す名剣・神剣' : activeTab === 'armor' ? '【防具召喚】身を守る重厚なる鎧・聖装' : activeTab === 'staff' ? '【魔杖召喚】魔力と最大MPを劇的に増幅する賢者のステッキ' : '【エーテル魔法契約】古の魔法呪文を解読・習得'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                {activeTab === 'weapon' 
                  ? '戦士、魔法使い、盗賊すべてが装備可能な各種武器がロールされます。最高峰「アストラル・エクスカリバー」を狙いましょう。' 
                  : activeTab === 'armor' 
                    ? '防御力と最大HPを大幅に増強する神々の盾や星屑のローブを召喚します。' 
                    : activeTab === 'staff'
                      ? '賢者や魔道士、神官に最も推奨される、攻撃力と高MP補正・高クリティカルを併せ持つ特化杖を召喚します。'
                      : '未習得の強力スペルを永続習得可能！重複した場合は【魔法強化レベル】がアップ（最大+5、威力+15%ずつ上昇）します！'}
              </p>
            </div>
          </div>
        )}

        {/* Pulling Animation */}
        {isPulling && (
          <div className="my-16 text-center space-y-6 animate-pulse">
            <div className="relative w-24 h-24 mx-auto">
              <div className={`absolute inset-0 rounded-full border-4 border-dashed animate-spin ${
                activeTab === 'weapon' ? 'border-red-500' : activeTab === 'armor' ? 'border-blue-500' : activeTab === 'staff' ? 'border-amber-500' : 'border-purple-500'
              }`}></div>
              <div className="absolute inset-2 rounded-full border-2 border-amber-400/50 animate-ping"></div>
              <div className={`absolute inset-4 rounded-full opacity-90 flex items-center justify-center shadow-lg bg-gradient-to-tr ${
                activeTab === 'weapon' 
                  ? 'from-red-600 to-amber-500' 
                  : activeTab === 'armor' 
                    ? 'from-blue-600 to-cyan-500' 
                    : activeTab === 'staff'
                      ? 'from-amber-600 to-yellow-500'
                      : 'from-purple-600 to-amber-500'
              }`}>
                <RefreshCw className="w-8 h-8 text-white animate-spin duration-1000" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-black text-white tracking-widest">
                {activeTab === 'magic' ? '次元の魔法術式を結合中...' : 'エーテル結晶体より物質生成中...'}
              </h3>
              <p className="text-[10px] text-amber-400 font-mono tracking-widest animate-bounce">
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
              className="p-6 bg-slate-900/50 hover:bg-slate-900 border border-slate-800 hover:border-slate-600 rounded-3xl text-center transition group cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-xl relative overflow-hidden"
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-850 border border-slate-700 mx-auto flex items-center justify-center text-slate-300 mb-4 group-hover:scale-110 transition">
                <Gift className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-white mb-1">単発召喚</h3>
              <p className="text-xs text-slate-500 mb-4">秘宝との奇跡的な邂逅 1回</p>
              <div className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono font-bold text-amber-400 shadow-md">
                <Coins className="w-4 h-4" /> {SINGLE_COST} G
              </div>
            </button>

            <button
              onClick={() => handlePull(10)}
              disabled={character.gold < TEN_COST}
              className={`p-6 bg-gradient-to-b from-slate-900 to-slate-950 rounded-3xl text-center transition group cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-2xl relative overflow-hidden border ${
                activeTab === 'weapon' ? 'hover:border-red-500/60' : activeTab === 'armor' ? 'hover:border-blue-500/60' : activeTab === 'staff' ? 'hover:border-amber-500/60' : 'hover:border-purple-500/60'
              }`}
            >
              <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 bg-amber-500 text-slate-950 text-[9px] font-black rounded font-mono uppercase tracking-widest">
                割引！
              </div>
              <div className={`w-12 h-12 rounded-2xl mx-auto flex items-center justify-center text-slate-950 mb-4 group-hover:scale-110 transition shadow-lg ${
                activeTab === 'weapon' ? 'bg-red-500' : activeTab === 'armor' ? 'bg-blue-500' : activeTab === 'staff' ? 'bg-amber-500' : 'bg-purple-500'
              }`}>
                <Sparkles className="w-6 h-6 text-white animate-pulse" />
              </div>
              <h3 className="text-base font-black text-white mb-1">10連契約召喚</h3>
              <p className="text-xs text-slate-500 mb-4">最高確率でレアリティを引き出す 10回</p>
              <div className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs font-mono font-bold text-amber-400 shadow-md">
                <Coins className="w-4 h-4" /> {TEN_COST} G
              </div>
            </button>
          </div>
        )}

        {/* Pull Results Output */}
        {pullResults && !isPulling && (
          <div className="mt-4 pt-4 animate-fadeIn space-y-6">
            
            {/* Legendary banner */}
            {hasLegendaryInPull ? (
              <div className="p-6 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-yellow-500/10 border-2 border-amber-400 rounded-2xl text-center shadow-[0_0_30px_rgba(245,158,11,0.25)] space-y-2 animate-pulse">
                <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 font-sans tracking-widest uppercase">
                  ★★ 超 絶 神 引 き 確 定 ★★
                </h2>
                <p className="text-[10px] text-amber-300 font-mono tracking-widest uppercase">
                  LEGENDARY AWAKENING COMPLETED SUCCESSFULLY FROM THE COSMIC VOID
                </p>
              </div>
            ) : (
              <h3 className="text-center text-sm font-bold text-slate-400 uppercase tracking-widest">
                🎉 エーテル融合完了
              </h3>
            )}

            {/* Grid display of results */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {pullResults.items && pullResults.items.map((item, idx) => {
                const style = getRarityStyle(item.rarity);
                return (
                  <div 
                    key={idx} 
                    className={`p-4 rounded-2xl border flex flex-col justify-between text-center transition hover:scale-105 duration-300 ${style.card}`}
                  >
                    <div>
                      <span className={`text-[8px] uppercase font-mono tracking-widest px-2 py-0.5 rounded border inline-block mb-2 ${style.badge}`}>
                        {item.rarity}
                      </span>
                      <strong className={`text-xs font-black block mb-1 tracking-tight line-clamp-2 leading-snug ${style.text}`}>
                        {item.name}
                      </strong>
                    </div>
                    <div className="text-[10px] text-slate-400 font-sans mt-3 pt-2.5 border-t border-slate-800/80 line-clamp-2">
                      {item.desc}
                    </div>
                  </div>
                );
              })}

              {pullResults.spells && pullResults.spells.map((spell, idx) => {
                const style = getRarityStyle(spell.rarity || 'common');
                const isDuplicate = character.spells.some(s => s.id === spell.id);
                return (
                  <div 
                    key={idx} 
                    className={`p-4 rounded-2xl border flex flex-col justify-between text-center transition hover:scale-105 duration-300 ${style.card}`}
                  >
                    <div>
                      <div className="flex justify-center items-center gap-1 mb-1.5">
                        <span className={`text-[8px] uppercase font-mono tracking-widest px-2 py-0.5 rounded border inline-block ${style.badge}`}>
                          {spell.rarity || 'common'}
                        </span>
                        {getSpellTypeBadge(spell.effectType)}
                      </div>
                      <strong className={`text-xs font-black block mb-1 tracking-tight line-clamp-2 leading-snug ${style.text}`}>
                        {spell.name}
                      </strong>
                    </div>
                    <div className="text-[10px] text-slate-400 font-sans mt-3 pt-2 border-t border-slate-800/80 space-y-1.5">
                      <div className="line-clamp-2 leading-relaxed">{spell.desc}</div>
                      <div className="text-[9px] font-mono font-bold text-purple-400 bg-purple-950/40 py-0.5 rounded">
                        威力: {spell.power} | MP: {spell.mpCost}
                      </div>
                      {isDuplicate && (
                        <div className="text-[9px] font-bold text-amber-400 flex items-center justify-center gap-0.5">
                          <ArrowUpCircle className="w-3 h-3" /> 術式強化
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Actions footer */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 border-t border-slate-800 pt-6">
              <button
                onClick={handleShareGacha}
                className="w-full sm:w-auto px-6 py-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-amber-400 font-bold text-xs tracking-widest rounded-2xl transition cursor-pointer flex items-center justify-center gap-2 shadow-lg"
              >
                <Share2 className="w-4 h-4" />
                神引き結果を自慢する
              </button>
              <button
                onClick={() => setPullResults(null)}
                className={`w-full sm:w-auto px-8 py-3 text-slate-950 font-black text-xs tracking-widest rounded-2xl hover:bg-white transition cursor-pointer flex items-center justify-center shadow-lg ${
                  activeTab === 'weapon' ? 'bg-red-500' : activeTab === 'armor' ? 'bg-blue-500' : 'bg-purple-500 text-white'
                }`}
              >
                召喚儀式を閉じる
              </button>
            </div>
          </div>
        )}
      </div>

      {/* SPELLBOOK SYSTEM PANEL FOR ADDED RETENTION */}
      {activeTab === 'magic' && !isPulling && !pullResults && (
        <div className="bg-[#0b0c10] border border-slate-800 rounded-3xl p-5 md:p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <BookOpen className="w-5 h-5 text-purple-400" />
              <div>
                <h3 className="font-bold text-white text-sm">エーテル魔導大書庫 (Spellbook Collection)</h3>
                <p className="text-[11px] text-slate-500">ガチャ限定最強魔法や習得可能なすべての魔法が保管されています。</p>
              </div>
            </div>
            <button
              onClick={() => setShowSpellbook(!showSpellbook)}
              className="px-4 py-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <Eye className="w-4 h-4 text-purple-400" />
              {showSpellbook ? '閉じる' : '魔法の一覧を覗く'}
            </button>
          </div>

          {showSpellbook && (
            <div className="space-y-4 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 text-center">
                  <div className="text-xs text-slate-500 font-medium">合計魔法収録数</div>
                  <div className="text-lg font-black text-white mt-0.5">{ALL_PULLABLE_SPELLS.length} 種</div>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 text-center">
                  <div className="text-xs text-slate-500 font-medium">あなたが習得した魔法</div>
                  <div className="text-lg font-black text-purple-400 mt-0.5">{character.spells.length} / {ALL_PULLABLE_SPELLS.length} 種</div>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 text-center">
                  <div className="text-xs text-slate-500 font-medium">ガチャ限定究極魔法収録</div>
                  <div className="text-lg font-black text-amber-400 mt-0.5">{GACHA_EXCLUSIVE_SPELLS.length} 種</div>
                </div>
              </div>

              {/* Spells list categorized by rarity */}
              <div className="space-y-4 pt-2">
                {['legendary', 'epic', 'rare', 'common'].map(rarity => {
                  const spellsOfRarity = ALL_PULLABLE_SPELLS.filter(s => s.rarity === rarity);
                  if (spellsOfRarity.length === 0) return null;
                  const style = getRarityStyle(rarity as any);
                  
                  return (
                    <div key={rarity} className="space-y-2">
                      <h4 className={`text-xs font-black tracking-widest uppercase flex items-center gap-1.5 ${style.text}`}>
                        <span className="w-2 h-2 rounded-full bg-current"></span>
                        {rarity.toUpperCase()} SPELLS
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {spellsOfRarity.map(spell => {
                          // Check if player has this spell, and get its plusLevel
                          const learnedSpell = character.spells.find(s => s.id === spell.id);
                          const isLearned = !!learnedSpell;
                          const plusVal = learnedSpell ? (learnedSpell as any).plusLevel || 0 : 0;
                          
                          return (
                            <div 
                              key={spell.id}
                              className={`p-3.5 rounded-2xl border flex flex-col justify-between transition ${
                                isLearned 
                                  ? 'bg-slate-950 border-purple-500/30' 
                                  : 'bg-slate-950/40 border-slate-900 opacity-50'
                              }`}
                            >
                              <div className="flex justify-between items-start gap-2">
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-white text-xs">{spell.name}</span>
                                    {isLearned && (
                                      <span className="px-1.5 py-0.2 bg-purple-500/20 text-purple-300 text-[9px] rounded font-mono font-bold">
                                        習得済 {plusVal > 0 ? `+${plusVal}` : ''}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[10px] text-slate-400 mt-1">{spell.desc}</p>
                                </div>
                                {getSpellTypeBadge(spell.effectType)}
                              </div>
                              <div className="flex justify-between items-center text-[10px] font-mono font-semibold text-slate-500 mt-3 pt-2 border-t border-slate-900">
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
