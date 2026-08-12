import React, { useState } from 'react';
import { CharacterState, Item } from '../types';
import { getTitleBonuses, TITLES } from '../utils/titleUtils';
import { getSkillStatsBonus, ALL_SKILLS, unlockSkillNode, SkillNode } from '../utils/skillUtils';
import { calculateCombatPower, canReincarnate, REINCARNATION_POWER_REQ } from '../utils/combatPower';
import { 
  X, Sword, Shield, Backpack, Sparkles, Check, Award, Share2, 
  Lock, ArrowRight, Zap, RefreshCw, Star, Info, Flame, FlameKindling, Crown
} from 'lucide-react';

interface InventoryModalProps {
  character: CharacterState;
  onClose: () => void;
  onEquipItem: (updatedChar: CharacterState) => void;
  onTriggerReincarnate?: () => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({ 
  character, 
  onClose, 
  onEquipItem,
  onTriggerReincarnate 
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'status' | 'skills'>('status');
  const [skillFeedback, setSkillFeedback] = useState<{ text: string; isError: boolean } | null>(null);
  const [showReincarnateConfirm, setShowReincarnateConfirm] = useState(false);

  // Default to developer_mode if no title set
  const currentTitleId = character.title || 'developer_mode';
  const unlockedTitleIds = character.titlesUnlocked || ['developer_mode'];

  const titleBonus = getTitleBonuses(currentTitleId);
  const skillBonus = getSkillStatsBonus(character);

  // Combine base stats + equipment + title bonuses + skill tree bonuses
  const totalAtk = character.atk + (character.equipment.weapon?.stats?.atk || 0) + titleBonus.atk + skillBonus.atk;
  const totalDef = character.def + (character.equipment.armor?.stats?.def || 0) + titleBonus.def + skillBonus.def;
  const totalMaxHp = character.maxHp + titleBonus.hp + skillBonus.hp;
  const totalMaxMp = character.maxMp + titleBonus.mp + skillBonus.mp;
  const totalCrit = Math.min(100, character.crit + titleBonus.crit + skillBonus.crit);

  // Combat Power
  const combatPower = calculateCombatPower(character);
  const isReincarnationEligible = canReincarnate(character);
  const reincCount = character.reincarnationCount || 0;

  const handleEquip = (item: Item, index: number) => {
    let newEquipment = { ...character.equipment };
    let newInventory = [...character.inventory];

    if (item.type === 'weapon') {
      if (newEquipment.weapon) newInventory.push(newEquipment.weapon);
      newEquipment.weapon = item;
      newInventory.splice(index, 1);
    } else if (item.type === 'armor') {
      if (newEquipment.armor) newInventory.push(newEquipment.armor);
      newEquipment.armor = item;
      newInventory.splice(index, 1);
    } else if (item.type === 'accessory') {
      if (newEquipment.accessory) newInventory.push(newEquipment.accessory);
      newEquipment.accessory = item;
      newInventory.splice(index, 1);
    }

    const updated: CharacterState = {
      ...character,
      equipment: newEquipment,
      inventory: newInventory,
    };

    onEquipItem(updated);
  };

  const handleUseItem = (item: Item, index: number) => {
    let newInventory = [...character.inventory];
    newInventory.splice(index, 1);

    let updatedChar: CharacterState = {
      ...character,
      inventory: newInventory,
    };

    let msg = '';
    const isPotion = item.type === 'potion';
    
    if (isPotion) {
      if (item.effect?.type === 'healHp') {
        const recoverHp = item.effect.value;
        const oldHp = character.hp;
        updatedChar.hp = Math.min(totalMaxHp, character.hp + recoverHp);
        msg = `🧪 ${item.name}を使用！ HPが ${updatedChar.hp - oldHp} 回復しました。（${updatedChar.hp}/${totalMaxHp}）`;
      } else if (item.effect?.type === 'healMp') {
        const recoverMp = item.effect.value;
        const oldMp = character.mp;
        updatedChar.mp = Math.min(totalMaxMp, character.mp + recoverMp);
        msg = `🧪 ${item.name}を使用！ MPが ${updatedChar.mp - oldMp} 回復しました。（${updatedChar.mp}/${totalMaxMp}）`;
      }
    } else if (item.type === 'scroll') {
      const effectType = item.effect?.type;
      const effectValue = item.effect?.value || 0;

      if (effectType === 'boostAtk') {
        updatedChar.atk += effectValue;
        msg = `📜 ${item.name}の魔力を吸収！ 攻撃力が恒久的に +${effectValue} 上昇しました！`;
      } else if (effectType === 'boostDef') {
        updatedChar.def += effectValue;
        msg = `📜 ${item.name}の魔力を吸収！ 防御力が恒久的に +${effectValue} 上昇しました！`;
      } else if (effectType === 'boostMaxHp') {
        updatedChar.maxHp += effectValue;
        updatedChar.hp += effectValue; // also heal by that amount
        msg = `📜 ${item.name}の魔力を吸収！ 最大HPが恒久的に +${effectValue} 上昇しました！`;
      } else if (effectType === 'boostMaxMp') {
        updatedChar.maxMp += effectValue;
        updatedChar.mp += effectValue; // also heal by that amount
        msg = `📜 ${item.name}の魔力を吸収！ 最大MPが恒久的に +${effectValue} 上昇しました！`;
      } else if (effectType === 'boostCrit') {
        updatedChar.crit = Math.min(100, updatedChar.crit + effectValue);
        msg = `📜 ${item.name}の魔力を吸収！ クリティカル率が恒久的に +${effectValue}% 上昇しました！`;
      } else {
        // Fallback checks by item name
        if (item.name.includes('力の秘薬')) {
          updatedChar.atk += 3;
          msg = `🧪 ${item.name}を服用！ 攻撃力が恒久的に +3 上昇しました！`;
        } else if (item.name.includes('守護の秘薬')) {
          updatedChar.def += 2;
          msg = `🧪 ${item.name}を服用！ 防御力が恒久的に +2 上昇しました！`;
        } else if (item.name.includes('生命の霊薬')) {
          updatedChar.maxHp += 15;
          updatedChar.hp += 15;
          msg = `🧪 ${item.name}を服用！ 最大HPが恒久的に +15 上昇しました！`;
        } else if (item.name.includes('賢者の霊薬')) {
          updatedChar.maxMp += 10;
          updatedChar.mp += 10;
          msg = `🧪 ${item.name}を服用！ 最大MPが恒久的に +10 上昇しました！`;
        } else if (item.name.includes('幸運の秘薬')) {
          updatedChar.crit = Math.min(100, updatedChar.crit + 2);
          msg = `🧪 ${item.name}を服用！ クリティカル率が恒久的に +2% 上昇しました！`;
        } else {
          msg = `📜 ${item.name}を読んだが、不思議な呪文が書かれているだけで特に効果はなかった。`;
        }
      }
    }

    setSkillFeedback({ text: msg, isError: false });
    setTimeout(() => setSkillFeedback(null), 3500);
    onEquipItem(updatedChar);
  };

  const handleTitleChange = (titleId: string) => {
    const updated: CharacterState = {
      ...character,
      title: titleId,
    };
    onEquipItem(updated);
  };

  const handleLearnSkill = (skillId: string) => {
    const { updatedChar, success, message } = unlockSkillNode(character, skillId);
    setSkillFeedback({ text: message, isError: !success });
    setTimeout(() => setSkillFeedback(null), 3000);

    if (success) {
      // Reflect new max stats immediately
      const hpDiff = updatedChar.maxHp - character.maxHp;
      const mpDiff = updatedChar.maxMp - character.maxMp;
      
      updatedChar.hp = Math.min(updatedChar.maxHp, updatedChar.hp + hpDiff);
      updatedChar.mp = Math.min(updatedChar.maxMp, updatedChar.mp + mpDiff);

      onEquipItem(updatedChar);
    }
  };

  const handleShare = () => {
    const currentTitle = TITLES.find(t => t.id === currentTitleId) || TITLES[0];
    const text = `🌌 【エーテルの迷宮】 冒険者ライセンス 🌌
━━━━━━━━━━━━━━━━━━━━━━━━
👤 冒険者名: ${character.name}
🎖️ 獲得称号: 【 ${currentTitle.name} 】
📊 総合戦闘力: 🔥 ${combatPower.toLocaleString()}
📈 レベル: Lv.${character.level} (経験値: ${character.exp}/${character.maxExp})
🛡️ クラス: ${character.classInfo.name} (${character.race.name})
🧬 習得スキル数: ${character.unlockedSkills?.length || 0} 個
⚔️ 主な装備:
  ・武器: ${character.equipment.weapon ? `[${character.equipment.weapon.rarity.toUpperCase()}] ${character.equipment.weapon.name}` : 'なし'}
  ・防具: ${character.equipment.armor ? `[${character.equipment.armor.rarity.toUpperCase()}] ${character.equipment.armor.name}` : 'なし'}
🏆 生涯功績:
  ・戦闘勝利: ${character.stats.battlesWon} 回
  ・総与ダメージ: ${character.stats.damageDealt.toLocaleString()}
━━━━━━━━━━━━━━━━━━━━━━━━
▼ 禁忌のスキルツリーを解放し、キミもエーテルの頂点を目指せ！
https://ai.studio/build
━━━━━━━━━━━━━━━━━━━━━━━━`;

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Filter skills for player's current path
  const raceSkills = ALL_SKILLS.filter(s => s.type === 'race' && s.branchId === character.race.id);
  const magicSkills = ALL_SKILLS.filter(s => s.type === 'magic' && s.branchId === character.magicType.id);
  const classSkills = ALL_SKILLS.filter(s => s.type === 'class' && s.branchId === character.classInfo.id);

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#0b0b0e] border border-[#2d2d30] w-full max-w-2xl rounded-3xl p-6 shadow-2xl text-slate-100 max-h-[92vh] overflow-y-auto relative">
        
        {/* Share Copy Notification Alert toast */}
        {copied && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-xs font-bold px-4 py-2 rounded-full shadow-lg z-50 flex items-center gap-1.5 animate-bounce">
            <Check className="w-4 h-4" /> 冒険者ライセンスをクリップボードにコピーしました！
          </div>
        )}

        {/* Modal Header */}
        <div className="flex justify-between items-start mb-4 border-b border-[#2d2d30] pb-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-[#c4a661] font-mono tracking-wider mb-1">
              <Award className="w-4 h-4" /> ADVOCATE IDENTITY & DESTINY
            </div>
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              {activeTab === 'status' ? 'ステータスと装備品' : '天賦スキルツリー'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {character.name} （{character.classInfo.name} / {character.race.name}）
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2.5 bg-[#151518] hover:bg-[#1f1f25] border border-[#2d2d30] hover:border-[#c4a661] text-amber-400 rounded-xl transition cursor-pointer flex items-center gap-1.5 text-xs font-bold"
              title="実績をシェア"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">ライセンスを自慢</span>
            </button>
            <button onClick={onClose} className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-[#2d2d30] rounded-xl transition cursor-pointer">
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Tabs Control */}
        <div className="flex gap-2 mb-4 p-1 bg-[#121215] border border-[#2d2d30] rounded-2xl">
          <button
            onClick={() => setActiveTab('status')}
            className={`flex-1 py-3 text-xs font-black tracking-widest rounded-xl transition-all cursor-pointer ${
              activeTab === 'status'
                ? 'bg-gradient-to-r from-amber-500/20 to-yellow-500/10 text-amber-400 border border-amber-500/30 shadow-inner'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🎒 装備品 & ステータス
          </button>
          <button
            onClick={() => setActiveTab('skills')}
            className={`flex-1 py-3 text-xs font-black tracking-widest rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'skills'
                ? 'bg-gradient-to-r from-[#4f46e5]/20 to-[#818cf8]/10 text-indigo-400 border border-[#4f46e5]/30 shadow-inner'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🧬 宿命のスキルツリー
            <span className="bg-indigo-950 text-indigo-400 border border-indigo-800 text-[10px] px-1.5 py-0.2 rounded-md font-mono">
              SP {character.sp !== undefined ? character.sp : 0}
            </span>
          </button>
        </div>

        {/* Skill feedback notification */}
        {skillFeedback && (
          <div className={`p-3 rounded-xl border mb-4 text-xs font-bold flex items-center gap-2 animate-fadeIn ${
            skillFeedback.isError 
              ? 'bg-red-950/40 border-red-900 text-red-400' 
              : 'bg-emerald-950/40 border-emerald-900 text-emerald-400'
          }`}>
            <Info className="w-4 h-4 shrink-0" />
            <span>{skillFeedback.text}</span>
          </div>
        )}

        {/* TAB 1: STATUS & EQUIPMENT */}
        {activeTab === 'status' && (
          <div className="animate-fadeIn space-y-6">
            {/* Combat Power Banner */}
            <div className="bg-gradient-to-r from-[#181822] to-[#121215] border border-amber-500/20 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="text-[10px] text-[#c4a661] uppercase font-mono tracking-widest font-bold">Total Combat Power</div>
                <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 font-mono tracking-tight">
                  {combatPower.toLocaleString()} <span className="text-sm text-slate-400 font-sans font-medium">CP</span>
                </div>
              </div>
              <div className="text-xs text-slate-400 max-w-sm">
                攻撃力、防御力、HP、MP、会心率を独自フォーミュラで数値化した総合戦闘力。装備や称号、**スキルツリー**を強化して極限を引き上げろ！
              </div>
            </div>

            {/* Reincarnation System (意志を継ぐものとして昇華・転生) Card */}
            <div className="bg-gradient-to-r from-amber-950/40 via-purple-950/40 to-slate-900 border-2 border-amber-500/50 rounded-2xl p-5 shadow-xl relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-amber-300 font-bold text-sm mb-1">
                    <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
                    <span>意志を継ぐものとして昇華 (転生システム)</span>
                    <span className="text-xs bg-amber-950 text-amber-300 border border-amber-700/60 px-2 py-0.5 rounded-full font-mono">
                      転生世代: 第 {reincCount} 世代
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-lg">
                    戦闘力が <strong className="text-amber-400">{REINCARNATION_POWER_REQ} CP</strong> 以上の領域に達すると、魂を昇華して転生可能！ 恒久バフを獲得し、<strong className="text-purple-300">8種の伝説種族＆7種の秘奥義魔法系統</strong> が新たに解放されます。
                  </p>
                </div>

                <div className="shrink-0 flex flex-col items-end gap-2">
                  {isReincarnationEligible ? (
                    <button
                      onClick={() => setShowReincarnateConfirm(true)}
                      className="w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-amber-500 via-purple-600 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-amber-950/50 border border-amber-300/60 flex items-center justify-center gap-2 transition transform hover:scale-105 active:scale-95 cursor-pointer animate-pulse"
                    >
                      <Sparkles className="w-4 h-4 text-amber-200" />
                      意志を継ぐものとして昇華する！
                    </button>
                  ) : (
                    <div className="text-right">
                      <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-950/80 border border-slate-800 text-slate-400 rounded-xl text-xs font-mono font-bold">
                        <Lock className="w-3.5 h-3.5 text-slate-500" />
                        到達CP: {combatPower} / {REINCARNATION_POWER_REQ}
                      </span>
                      <p className="text-[10px] text-slate-500 mt-1">戦闘力 {REINCARNATION_POWER_REQ} CP 到達で解禁</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-[#121215] p-3 rounded-xl border border-[#2d2d30]">
                <span className="text-[10px] text-slate-500 block uppercase font-mono">レベル</span>
                <strong className="text-white text-lg font-mono">Lv.{character.level}</strong>
              </div>
              <div className="bg-[#121215] p-3 rounded-xl border border-[#2d2d30]">
                <span className="text-[10px] text-rose-500 block uppercase font-mono font-bold">攻撃力 (合計)</span>
                <strong className="text-rose-400 text-lg font-mono flex items-baseline gap-1">
                  {totalAtk}
                  {skillBonus.atk > 0 && <span className="text-[10px] text-indigo-400">+{skillBonus.atk}</span>}
                </strong>
              </div>
              <div className="bg-[#121215] p-3 rounded-xl border border-[#2d2d30]">
                <span className="text-[10px] text-blue-500 block uppercase font-mono font-bold">防御力 (合計)</span>
                <strong className="text-blue-400 text-lg font-mono flex items-baseline gap-1">
                  {totalDef}
                  {skillBonus.def > 0 && <span className="text-[10px] text-indigo-400">+{skillBonus.def}</span>}
                </strong>
              </div>
              <div className="bg-[#121215] p-3 rounded-xl border border-[#2d2d30]">
                <span className="text-[10px] text-amber-500 block uppercase font-mono">素早さ / 会心</span>
                <strong className="text-amber-400 text-sm font-mono flex items-baseline gap-1">
                  {character.spd} / {totalCrit}%
                  {skillBonus.crit > 0 && <span className="text-[10px] text-indigo-400">+{skillBonus.crit}%</span>}
                </strong>
              </div>
            </div>

            {/* Title Selection Section */}
            <div className="bg-[#121215] border border-[#2d2d30] rounded-2xl p-4">
              <h3 className="text-xs font-bold text-[#c4a661] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Award className="w-4 h-4" /> 冒険者の称号 (二つ名設定)
              </h3>
              <p className="text-[11px] text-slate-400 mb-3">特定の功績（アチーブメント）を達成すると新たな称号が解放されます。称号ごとに特殊なステータス強化が付与されます。</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">設定中の称号</label>
                  <select
                    value={currentTitleId}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="w-full bg-[#1c1c22] border border-[#2d2d30] text-slate-200 text-xs rounded-lg px-3 py-2 outline-none focus:border-[#c4a661]"
                  >
                    {TITLES.map((t) => {
                      const isUnlocked = unlockedTitleIds.includes(t.id);
                      return (
                        <option key={t.id} value={t.id} disabled={!isUnlocked}>
                          {isUnlocked ? `【${t.name}】` : `🔒 ${t.name} (未解放)`}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div className="bg-[#1c1c22]/50 rounded-lg p-2.5 border border-[#2d2d30] flex flex-col justify-center">
                  <span className="text-[10px] text-[#c4a661] font-mono uppercase font-bold">称号補正効果</span>
                  <span className="text-xs text-slate-200 font-bold mt-0.5">
                    {TITLES.find(t => t.id === currentTitleId)?.bonusDesc || 'なし'}
                  </span>
                  <span className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                    {TITLES.find(t => t.id === currentTitleId)?.desc}
                  </span>
                </div>
              </div>
            </div>

            {/* Equipment Slots */}
            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">装備中の武具</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-[#121215] p-3 rounded-xl border border-[#2d2d30] flex items-center gap-3">
                  <Sword className="w-5 h-5 text-red-400" />
                  <div>
                    <span className="text-[10px] text-slate-500 block">武器</span>
                    <span className="text-xs font-bold text-white line-clamp-1">{character.equipment.weapon ? character.equipment.weapon.name : 'なし'}</span>
                  </div>
                </div>
                <div className="bg-[#121215] p-3 rounded-xl border border-[#2d2d30] flex items-center gap-3">
                  <Shield className="w-5 h-5 text-blue-400" />
                  <div>
                    <span className="text-[10px] text-slate-500 block">防具</span>
                    <span className="text-xs font-bold text-white line-clamp-1">{character.equipment.armor ? character.equipment.armor.name : 'なし'}</span>
                  </div>
                </div>
                <div className="bg-[#121215] p-3 rounded-xl border border-[#2d2d30] flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  <div>
                    <span className="text-[10px] text-slate-500 block">アクセサリー</span>
                    <span className="text-xs font-bold text-white line-clamp-1">{character.equipment.accessory ? character.equipment.accessory.name : 'なし'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Inventory List */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">所持品バッグ ({character.inventory.length})</h3>
              </div>
              {character.inventory.length === 0 ? (
                <div className="bg-[#121215] p-6 rounded-2xl border border-[#2d2d30] text-center">
                  <p className="text-xs text-slate-500">インベントリは空です。</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {character.inventory.map((item, index) => {
                    const isEquippable = item.type === 'weapon' || item.type === 'armor' || item.type === 'accessory';
                    return (
                      <div key={index} className="bg-[#121215] p-3 rounded-xl border border-[#2d2d30] flex justify-between items-center hover:border-[#444] transition">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">{item.name}</span>
                            <span className="text-[9px] uppercase font-mono px-1 py-0.5 bg-slate-800 rounded border border-slate-700">
                              {item.type}
                            </span>
                          </div>
                          <span className="text-xs text-slate-400">{item.desc}</span>
                        </div>
                        {isEquippable ? (
                          <button
                            onClick={() => handleEquip(item, index)}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition cursor-pointer shrink-0"
                          >
                            装備する
                          </button>
                        ) : (item.type === 'potion' || item.type === 'scroll') ? (
                          <button
                            onClick={() => handleUseItem(item, index)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition cursor-pointer shrink-0"
                          >
                            使用する
                          </button>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: SKILL TREE BRANCHES */}
        {activeTab === 'skills' && (
          <div className="animate-fadeIn space-y-6">
            {/* SP Display HUD */}
            <div className="bg-gradient-to-r from-[#111115] to-[#16161f] border border-indigo-500/20 rounded-2xl p-4 flex justify-between items-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none"></div>
              <div>
                <span className="text-[10px] text-[#818cf8] uppercase tracking-wider font-mono font-bold block">Destiny Skill Points</span>
                <h3 className="text-2xl font-black text-white mt-1">
                  所持スキルポイント: <strong className="text-indigo-400 font-mono text-3xl">{character.sp !== undefined ? character.sp : 0}</strong> <span className="text-xs text-slate-400 font-sans font-normal">SP</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-1">ダンジョン深層へ進んだり、レベルアップすることで強力なスキルを修得するポイントを獲得します。</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-indigo-950/80 border border-indigo-800/40 flex items-center justify-center text-indigo-400 animate-spin-slow">
                <RefreshCw className="w-5 h-5" />
              </div>
            </div>

            {/* SKILL TREE BRANCHES SECTION */}
            <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-1">
              
              {/* BRANCH 1: RACE BRANCH (種族スキル) */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b border-[#2d2d30] pb-2">
                  <span className="bg-amber-500/10 text-amber-400 text-[10px] px-2 py-0.5 rounded border border-amber-500/20 font-bold uppercase tracking-wider font-mono">RACE BRANCH</span>
                  <h4 className="text-sm font-black text-white">
                    種族の宿命血脈: <span className="text-[#c4a661]">{character.race.name}系</span>
                  </h4>
                </div>
                <div className="grid grid-cols-1 gap-3 relative pl-4 border-l border-slate-800">
                  {raceSkills.map((skill, index) => {
                    const isUnlocked = character.unlockedSkills.includes(skill.id);
                    const canUnlock = !isUnlocked && (character.sp !== undefined ? character.sp : 0) >= skill.cost && (!skill.reqSkillId || character.unlockedSkills.includes(skill.reqSkillId));
                    const isPrereqLocked = !isUnlocked && skill.reqSkillId && !character.unlockedSkills.includes(skill.reqSkillId);
                    
                    return (
                      <div 
                        key={skill.id}
                        className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative ${
                          isUnlocked 
                            ? 'bg-emerald-950/20 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.08)]' 
                            : 'bg-[#121215] border-[#2d2d30]'
                        }`}
                      >
                        {/* Connecting indicators */}
                        {index > 0 && (
                          <div className="absolute -top-3 left-4 w-[2px] h-3 bg-slate-800" />
                        )}

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-white text-sm">{skill.name}</span>
                            <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700 font-mono">
                              消費: {skill.cost} SP
                            </span>
                            {isUnlocked && (
                              <span className="text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-1.5 py-0.5 rounded font-black flex items-center gap-0.5">
                                <Check className="w-3 h-3" /> 習得済み
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed">{skill.desc}</p>
                          <div className="text-[10px] text-indigo-400 font-mono font-bold flex items-center gap-1.5 mt-1 bg-indigo-950/20 px-2 py-1 rounded border border-indigo-900/30 w-fit">
                            <Star className="w-3 h-3 fill-current text-indigo-400" />
                            効果: {skill.effectDesc}
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center justify-end">
                          {isUnlocked ? (
                            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                              習得完了
                            </span>
                          ) : isPrereqLocked ? (
                            <span className="text-[10px] text-slate-500 flex items-center gap-1 bg-slate-950 border border-slate-900 px-3 py-1.5 rounded-lg">
                              <Lock className="w-3 h-3" /> 要前提スキル
                            </span>
                          ) : (
                            <button
                              onClick={() => handleLearnSkill(skill.id)}
                              disabled={!canUnlock}
                              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all transform hover:scale-102 cursor-pointer flex items-center gap-1 ${
                                canUnlock
                                  ? 'bg-gradient-to-r from-[#4f46e5] to-[#818cf8] text-white hover:from-[#5a52e6] hover:to-[#8c96f8]'
                                  : 'bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed'
                              }`}
                            >
                              習得する
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* BRANCH 2: MAGIC BRANCH (魔法スキル) */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b border-[#2d2d30] pb-2">
                  <span className="bg-purple-500/10 text-purple-400 text-[10px] px-2 py-0.5 rounded border border-purple-500/20 font-bold uppercase tracking-wider font-mono">MAGIC BRANCH</span>
                  <h4 className="text-sm font-black text-white">
                    深淵なる魔力属性: <span className={character.magicType.color}>{character.magicType.name}系</span>
                  </h4>
                </div>
                <div className="grid grid-cols-1 gap-3 relative pl-4 border-l border-slate-800">
                  {magicSkills.map((skill, index) => {
                    const isUnlocked = character.unlockedSkills.includes(skill.id);
                    const canUnlock = !isUnlocked && (character.sp !== undefined ? character.sp : 0) >= skill.cost && (!skill.reqSkillId || character.unlockedSkills.includes(skill.reqSkillId));
                    const isPrereqLocked = !isUnlocked && skill.reqSkillId && !character.unlockedSkills.includes(skill.reqSkillId);
                    
                    return (
                      <div 
                        key={skill.id}
                        className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative ${
                          isUnlocked 
                            ? 'bg-emerald-950/20 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.08)]' 
                            : 'bg-[#121215] border-[#2d2d30]'
                        }`}
                      >
                        {/* Connecting indicators */}
                        {index > 0 && (
                          <div className="absolute -top-3 left-4 w-[2px] h-3 bg-slate-800" />
                        )}

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-white text-sm">{skill.name}</span>
                            <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700 font-mono">
                              消費: {skill.cost} SP
                            </span>
                            {isUnlocked && (
                              <span className="text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-1.5 py-0.5 rounded font-black flex items-center gap-0.5">
                                <Check className="w-3 h-3" /> 習得済み
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed">{skill.desc}</p>
                          <div className="text-[10px] text-indigo-400 font-mono font-bold flex items-center gap-1.5 mt-1 bg-indigo-950/20 px-2 py-1 rounded border border-indigo-900/30 w-fit">
                            <Star className="w-3 h-3 fill-current text-indigo-400" />
                            効果: {skill.effectDesc}
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center justify-end">
                          {isUnlocked ? (
                            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                              習得完了
                            </span>
                          ) : isPrereqLocked ? (
                            <span className="text-[10px] text-slate-500 flex items-center gap-1 bg-slate-950 border border-slate-900 px-3 py-1.5 rounded-lg">
                              <Lock className="w-3 h-3" /> 要前提スキル
                            </span>
                          ) : (
                            <button
                              onClick={() => handleLearnSkill(skill.id)}
                              disabled={!canUnlock}
                              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all transform hover:scale-102 cursor-pointer flex items-center gap-1 ${
                                canUnlock
                                  ? 'bg-gradient-to-r from-[#4f46e5] to-[#818cf8] text-white hover:from-[#5a52e6] hover:to-[#8c96f8]'
                                  : 'bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed'
                              }`}
                            >
                              習得する
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* BRANCH 3: CLASS BRANCH (役職スキル) */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b border-[#2d2d30] pb-2">
                  <span className="bg-indigo-500/10 text-indigo-400 text-[10px] px-2 py-0.5 rounded border border-indigo-500/20 font-bold uppercase tracking-wider font-mono">CLASS BRANCH</span>
                  <h4 className="text-sm font-black text-white">
                    極めし職業天賦: <span className="text-[#c4a661]">{character.classInfo.name}系</span>
                  </h4>
                </div>
                <div className="grid grid-cols-1 gap-3 relative pl-4 border-l border-slate-800">
                  {classSkills.map((skill, index) => {
                    const isUnlocked = character.unlockedSkills.includes(skill.id);
                    const canUnlock = !isUnlocked && (character.sp !== undefined ? character.sp : 0) >= skill.cost && (!skill.reqSkillId || character.unlockedSkills.includes(skill.reqSkillId));
                    const isPrereqLocked = !isUnlocked && skill.reqSkillId && !character.unlockedSkills.includes(skill.reqSkillId);
                    
                    return (
                      <div 
                        key={skill.id}
                        className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative ${
                          isUnlocked 
                            ? 'bg-emerald-950/20 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.08)]' 
                            : 'bg-[#121215] border-[#2d2d30]'
                        }`}
                      >
                        {/* Connecting indicators */}
                        {index > 0 && (
                          <div className="absolute -top-3 left-4 w-[2px] h-3 bg-slate-800" />
                        )}

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-white text-sm">{skill.name}</span>
                            <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700 font-mono">
                              消費: {skill.cost} SP
                            </span>
                            {isUnlocked && (
                              <span className="text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-1.5 py-0.5 rounded font-black flex items-center gap-0.5">
                                <Check className="w-3 h-3" /> 習得済み
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed">{skill.desc}</p>
                          <div className="text-[10px] text-indigo-400 font-mono font-bold flex items-center gap-1.5 mt-1 bg-indigo-950/20 px-2 py-1 rounded border border-indigo-900/30 w-fit">
                            <Star className="w-3 h-3 fill-current text-indigo-400" />
                            効果: {skill.effectDesc}
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center justify-end">
                          {isUnlocked ? (
                            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                              習得完了
                            </span>
                          ) : isPrereqLocked ? (
                            <span className="text-[10px] text-slate-500 flex items-center gap-1 bg-slate-950 border border-slate-900 px-3 py-1.5 rounded-lg">
                              <Lock className="w-3 h-3" /> 要前提スキル
                            </span>
                          ) : (
                            <button
                              onClick={() => handleLearnSkill(skill.id)}
                              disabled={!canUnlock}
                              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all transform hover:scale-102 cursor-pointer flex items-center gap-1 ${
                                canUnlock
                                  ? 'bg-gradient-to-r from-[#4f46e5] to-[#818cf8] text-white hover:from-[#5a52e6] hover:to-[#8c96f8]'
                                  : 'bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed'
                              }`}
                            >
                              習得する
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* Reincarnation Confirmation Modal */}
      {showReincarnateConfirm && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-lg z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f0f14] border-2 border-amber-400 max-w-lg w-full rounded-3xl p-6 shadow-[0_0_50px_rgba(245,158,11,0.3)] text-slate-100 relative animate-fadeIn">
            <div className="flex items-center gap-3 text-amber-400 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-950/80 border border-amber-500/60 flex items-center justify-center">
                <Crown className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h3 className="text-xl font-black text-amber-300">【意志を継ぐものとして昇華】</h3>
                <p className="text-xs text-amber-200/80">転生・魂の継承と超絶覚醒</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              現世の冒険を昇華させ、意志を引き継ぎ次の世代へと転生しますか？
            </p>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 mb-6 text-xs">
              <div className="font-bold text-amber-400 mb-1 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" /> 継承される特典と恩恵:
              </div>
              <ul className="space-y-1.5 text-slate-300 font-medium">
                <li className="flex items-center gap-2 text-emerald-400">
                  ✓ 転生カウント +1（第 {(reincCount + 1)} 世代へ進化）
                </li>
                <li className="flex items-center gap-2 text-amber-300">
                  ✓ 全初期ステータス(HP/MP) +25%、(攻撃/防御) +15% 恒久バフ
                </li>
                <li className="flex items-center gap-2 text-amber-300">
                  ✓ 獲得ゴールド・経験値 +20% 永久ブースト
                </li>
                <li className="flex items-center gap-2 text-purple-300">
                  ✓ 8種の伝説種族（龍人・精霊王・狂戦士・星の神子・虚無の魔神等）解放！
                </li>
                <li className="flex items-center gap-2 text-purple-300">
                  ✓ 7種の秘奥義魔法系統（空間・時間・龍炎・星輝・召喚・重力・音波）解放！
                </li>
                <li className="flex items-center gap-2 text-[#c4a661]">
                  ✓ 解放済み称号・実績ライセンス維持
                </li>
              </ul>
              <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-900">
                ※ Lv、フロア進行状況、初期装備・標準消耗品はリセットされ、新しく作成された第 {reincCount + 1} 世代の英雄として冒険者作成画面に戻ります。
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowReincarnateConfirm(false)}
                className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                キャンセル
              </button>
              <button
                onClick={() => {
                  setShowReincarnateConfirm(false);
                  onClose();
                  if (onTriggerReincarnate) {
                    onTriggerReincarnate();
                  }
                }}
                className="flex-1 py-3 bg-gradient-to-r from-amber-500 via-orange-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-white font-black text-xs rounded-xl shadow-lg shadow-amber-950/50 border border-amber-300/80 flex items-center justify-center gap-1.5 transition cursor-pointer animate-pulse"
              >
                <Flame className="w-4 h-4 text-amber-200" />
                昇華・転生を実行する！
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
