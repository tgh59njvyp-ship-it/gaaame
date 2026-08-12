import React, { useState } from 'react';
import { CharacterState, Item, EquipmentPreset } from '../types';
import { getTitleBonuses, TITLES } from '../utils/titleUtils';
import { getSkillStatsBonus, ALL_SKILLS, unlockSkillNode, SkillNode } from '../utils/skillUtils';
import { calculateCombatPower, canReincarnate, getReincarnationPowerReq, getReincarnationLevelReq } from '../utils/combatPower';
import { 
  X, Sword, Shield, Backpack, Sparkles, Check, Award, Share2, 
  Lock, ArrowRight, Zap, RefreshCw, Star, Info, Flame, FlameKindling, Crown, Trash2, AlertTriangle,
  Save, Edit3, Layers, ArrowUpDown, CheckCircle2, Bookmark, ShieldOff
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
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [editingPresetId, setEditingPresetId] = useState<'setA' | 'setB' | null>(null);
  const [presetNameInput, setPresetNameInput] = useState<string>('');
  const [selectedItemDetail, setSelectedItemDetail] = useState<{
    item: Item;
    isEquipped: boolean;
    invIndex?: number;
    equipType?: 'weapon' | 'armor' | 'accessory';
  } | null>(null);

  const getEquipmentComparison = (candidateItem: Item) => {
    if (candidateItem.type !== 'weapon' && candidateItem.type !== 'armor' && candidateItem.type !== 'accessory') {
      return null;
    }

    let equippedInSlot: Item | null = null;
    if (candidateItem.type === 'weapon') equippedInSlot = character.equipment.weapon;
    if (candidateItem.type === 'armor') equippedInSlot = character.equipment.armor;
    if (candidateItem.type === 'accessory') equippedInSlot = character.equipment.accessory;

    const curAtk = equippedInSlot?.stats?.atk || 0;
    const curDef = equippedInSlot?.stats?.def || 0;
    const curHp = equippedInSlot?.stats?.hp || 0;
    const curMp = equippedInSlot?.stats?.mp || 0;
    const curSpd = equippedInSlot?.stats?.spd || 0;
    const curCrit = equippedInSlot?.stats?.crit || 0;

    const candidateAtk = candidateItem.stats?.atk || 0;
    const candidateDef = candidateItem.stats?.def || 0;
    const candidateHp = candidateItem.stats?.hp || 0;
    const candidateMp = candidateItem.stats?.mp || 0;
    const candidateSpd = candidateItem.stats?.spd || 0;
    const candidateCrit = candidateItem.stats?.crit || 0;

    const stats = [
      { key: 'atk', label: '⚔️ 攻撃力', cur: curAtk, candidate: candidateAtk, unit: '' },
      { key: 'def', label: '🛡️ 防御力', cur: curDef, candidate: candidateDef, unit: '' },
      { key: 'hp', label: '❤️ 最大HP', cur: curHp, candidate: candidateHp, unit: '' },
      { key: 'mp', label: '✨ 最大MP', cur: curMp, candidate: candidateMp, unit: '' },
      { key: 'spd', label: '⚡ 素早さ', cur: curSpd, candidate: candidateSpd, unit: '' },
      { key: 'crit', label: '🎯 会心率', cur: curCrit, candidate: candidateCrit, unit: '%' },
    ].filter(s => s.cur !== 0 || s.candidate !== 0);

    return {
      equippedItem: equippedInSlot,
      equippedName: equippedInSlot ? equippedInSlot.name : '（なし）',
      candidateName: candidateItem.name,
      stats: stats.map(s => ({
        ...s,
        diff: s.candidate - s.cur
      }))
    };
  };

  const getRarityBadgeStyle = (rarity: Item['rarity']) => {
    switch (rarity) {
      case 'legendary':
        return 'border-amber-500/80 bg-amber-950/40 shadow-amber-950/40 text-amber-300';
      case 'epic':
        return 'border-purple-500/80 bg-purple-950/40 shadow-purple-950/40 text-purple-300';
      case 'rare':
        return 'border-blue-500/80 bg-blue-950/40 shadow-blue-950/40 text-blue-300';
      default:
        return 'border-slate-700 bg-slate-900 text-slate-300';
    }
  };

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

  // Combat Power and Reincarnation Reqs
  const combatPower = calculateCombatPower(character);
  const isReincarnationEligible = canReincarnate(character);
  const reincCount = character.reincarnationCount || 0;
  const reqPower = getReincarnationPowerReq(reincCount);
  const reqLevel = getReincarnationLevelReq(reincCount);

  const handleHardReset = () => {
    localStorage.clear();
    window.location.reload();
  };

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
    setSkillFeedback({
      text: `⚔️ 【${item.name}】を装備しました！ ステータスに即座に反映されました。`,
      isError: false,
    });
    setTimeout(() => setSkillFeedback(null), 3500);
  };

  const handleEquipItemDirectly = (itemToEquip: Item, invIndex?: number) => {
    let idx = invIndex;
    if (idx === undefined || idx < 0) {
      idx = character.inventory.findIndex(i => i.id === itemToEquip.id || i === itemToEquip);
    }

    let newEquipment = { ...character.equipment };
    let newInventory = [...character.inventory];

    if (itemToEquip.type === 'weapon') {
      if (newEquipment.weapon) newInventory.push(newEquipment.weapon);
      newEquipment.weapon = itemToEquip;
      if (idx !== -1) newInventory.splice(idx, 1);
    } else if (itemToEquip.type === 'armor') {
      if (newEquipment.armor) newInventory.push(newEquipment.armor);
      newEquipment.armor = itemToEquip;
      if (idx !== -1) newInventory.splice(idx, 1);
    } else if (itemToEquip.type === 'accessory') {
      if (newEquipment.accessory) newInventory.push(newEquipment.accessory);
      newEquipment.accessory = itemToEquip;
      if (idx !== -1) newInventory.splice(idx, 1);
    }

    const updated: CharacterState = {
      ...character,
      equipment: newEquipment,
      inventory: newInventory,
    };

    onEquipItem(updated);
    setSkillFeedback({
      text: `⚔️ 【${itemToEquip.name}】を装備しました！ ステータスに即座に反映されました。`,
      isError: false,
    });
    setTimeout(() => setSkillFeedback(null), 3500);

    setSelectedItemDetail({
      item: itemToEquip,
      isEquipped: true,
      equipType: itemToEquip.type as 'weapon' | 'armor' | 'accessory',
    });
  };

  const handleUnequipItemDirectly = (type: 'weapon' | 'armor' | 'accessory') => {
    const itemToUnequip = character.equipment[type];
    if (!itemToUnequip) return;

    let newEquipment = { ...character.equipment };
    newEquipment[type] = null;

    let newInventory = [...character.inventory, itemToUnequip];

    const updated: CharacterState = {
      ...character,
      equipment: newEquipment,
      inventory: newInventory,
    };

    onEquipItem(updated);
    setSkillFeedback({
      text: `🛡️ 【${itemToUnequip.name}】を外してバッグに戻しました。`,
      isError: false,
    });
    setTimeout(() => setSkillFeedback(null), 3500);

    setSelectedItemDetail(null);
  };

  const handleUseItemFromDetail = (itemToUse: Item, invIndex?: number) => {
    let idx = invIndex;
    if (idx === undefined || idx < 0) {
      idx = character.inventory.findIndex(i => i.id === itemToUse.id || i === itemToUse);
    }
    if (idx !== -1) {
      handleUseItem(itemToUse, idx);
      setSelectedItemDetail(null);
    }
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

  // --- Equipment Preset Handlers ---
  const handleSavePreset = (presetId: 'setA' | 'setB', customName?: string) => {
    const defaultName = presetId === 'setA' ? 'セットA (アタッカー)' : 'セットB (ガーディアン)';
    const nameToSave = customName || character.equipmentPresets?.[presetId]?.name || defaultName;

    const newPreset: EquipmentPreset = {
      id: presetId,
      name: nameToSave,
      equipment: {
        weapon: character.equipment.weapon ? { ...character.equipment.weapon } : null,
        armor: character.equipment.armor ? { ...character.equipment.armor } : null,
        accessory: character.equipment.accessory ? { ...character.equipment.accessory } : null,
      },
      savedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedChar: CharacterState = {
      ...character,
      equipmentPresets: {
        ...character.equipmentPresets,
        [presetId]: newPreset,
      },
    };

    onEquipItem(updatedChar);
    setSkillFeedback({
      text: `💾 現在の装備構成を【${nameToSave}】に保存しました！`,
      isError: false,
    });
    setTimeout(() => setSkillFeedback(null), 3000);
  };

  const handleEquipPreset = (presetId: 'setA' | 'setB') => {
    const preset = character.equipmentPresets?.[presetId];
    if (!preset) return;

    if (!preset.equipment.weapon && !preset.equipment.armor && !preset.equipment.accessory) {
      setSkillFeedback({
        text: `⚠️ 【${preset.name}】には装備品がまだ登録されていません。`,
        isError: true,
      });
      setTimeout(() => setSkillFeedback(null), 3000);
      return;
    }

    let currentEq = { ...character.equipment };
    let currentInv = [...character.inventory];
    let missingItems: string[] = [];

    const slots: ('weapon' | 'armor' | 'accessory')[] = ['weapon', 'armor', 'accessory'];

    slots.forEach((slot) => {
      const targetItem = preset.equipment[slot];
      const currentlyEquipped = currentEq[slot];

      if (!targetItem) {
        // Preset has no item in this slot -> unequip current item if any
        if (currentlyEquipped) {
          currentInv.push(currentlyEquipped);
          currentEq[slot] = null;
        }
      } else {
        // Check if target item is already equipped
        if (
          currentlyEquipped &&
          (currentlyEquipped.id === targetItem.id ||
            (currentlyEquipped.name === targetItem.name && currentlyEquipped.type === targetItem.type))
        ) {
          return;
        }

        // Find target item in inventory
        const invIndex = currentInv.findIndex(
          (item) => item.id === targetItem.id || (item.name === targetItem.name && item.type === targetItem.type)
        );

        if (invIndex !== -1) {
          const [itemToEquip] = currentInv.splice(invIndex, 1);
          if (currentlyEquipped) {
            currentInv.push(currentlyEquipped);
          }
          currentEq[slot] = itemToEquip;
        } else {
          missingItems.push(targetItem.name);
        }
      }
    });

    const updatedChar: CharacterState = {
      ...character,
      equipment: currentEq,
      inventory: currentInv,
    };

    onEquipItem(updatedChar);

    if (missingItems.length > 0) {
      setSkillFeedback({
        text: `⚠️ 【${preset.name}】に切り替えましたが、以下の装備品がバッグに見つかりませんでした: ${missingItems.join(', ')}`,
        isError: true,
      });
    } else {
      setSkillFeedback({
        text: `⚔️ 【${preset.name}】へ一括着替え（装備換装）を完了しました！`,
        isError: false,
      });
    }
    setTimeout(() => setSkillFeedback(null), 3500);
  };

  const handleSaveRenamedPreset = (presetId: 'setA' | 'setB') => {
    const existing = character.equipmentPresets?.[presetId];
    if (!existing) {
      handleSavePreset(presetId, presetNameInput);
    } else {
      const updatedPreset: EquipmentPreset = {
        ...existing,
        name: presetNameInput.trim() || (presetId === 'setA' ? 'セットA' : 'セットB'),
      };
      const updatedChar: CharacterState = {
        ...character,
        equipmentPresets: {
          ...character.equipmentPresets,
          [presetId]: updatedPreset,
        },
      };
      onEquipItem(updatedChar);
    }
    setEditingPresetId(null);
  };

  const handleClearPreset = (presetId: 'setA' | 'setB') => {
    const presetName = character.equipmentPresets?.[presetId]?.name || (presetId === 'setA' ? 'セットA' : 'セットB');
    const updatedChar: CharacterState = {
      ...character,
      equipmentPresets: {
        ...character.equipmentPresets,
        [presetId]: null,
      },
    };
    onEquipItem(updatedChar);
    setSkillFeedback({
      text: `🗑️ プリセット【${presetName}】の登録内容を削除しました。`,
      isError: false,
    });
    setTimeout(() => setSkillFeedback(null), 2500);
  };

  const isPresetActive = (presetId: 'setA' | 'setB') => {
    const preset = character.equipmentPresets?.[presetId];
    if (!preset) return false;
    if (!preset.equipment.weapon && !preset.equipment.armor && !preset.equipment.accessory) return false;

    const wMatch = (character.equipment.weapon?.name || null) === (preset.equipment.weapon?.name || null);
    const aMatch = (character.equipment.armor?.name || null) === (preset.equipment.armor?.name || null);
    const accMatch = (character.equipment.accessory?.name || null) === (preset.equipment.accessory?.name || null);

    return wMatch && aMatch && accMatch;
  };

  const handleUnequipAll = () => {
    const { weapon, armor, accessory } = character.equipment;
    if (!weapon && !armor && !accessory) {
      setSkillFeedback({
        text: '⚠️ 現在装着されている装備品はありません。',
        isError: true,
      });
      setTimeout(() => setSkillFeedback(null), 2500);
      return;
    }

    const itemsToReturn: Item[] = [];
    if (weapon) itemsToReturn.push(weapon);
    if (armor) itemsToReturn.push(armor);
    if (accessory) itemsToReturn.push(accessory);

    const updatedChar: CharacterState = {
      ...character,
      equipment: {
        weapon: null,
        armor: null,
        accessory: null,
      },
      inventory: [...character.inventory, ...itemsToReturn],
    };

    onEquipItem(updatedChar);
    setSkillFeedback({
      text: '🛡️ 全ての装備（武器・防具・アクセサリー）を一度に解除しました！',
      isError: false,
    });
    setTimeout(() => setSkillFeedback(null), 3000);
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
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-backdropFadeIn">
      <div className="bg-[#0b0b0e] border border-[#2d2d30] w-full max-w-2xl rounded-3xl p-6 shadow-2xl text-slate-100 max-h-[92vh] overflow-y-auto relative animate-modalExpand">
        
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
                    <span>意志を継ぐものとして昇華 (高難易度転生)</span>
                    <span className="text-xs bg-amber-950 text-amber-300 border border-amber-700/60 px-2 py-0.5 rounded-full font-mono font-bold">
                      現在: 第 {reincCount} 世代
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-lg">
                    【次世代条件】 戦闘力 <strong className="text-amber-400">{reqPower} CP</strong> ＆ レベル <strong className="text-amber-400">Lv.{reqLevel}</strong> 以上！ 昇華するとステータス恒久倍増・<strong className="text-purple-300">200種超の世代専用秘奥義魔法・伝説種族</strong> が一挙解禁！
                  </p>
                </div>

                <div className="shrink-0 flex flex-col items-end gap-2">
                  {isReincarnationEligible ? (
                    <button
                      onClick={() => setShowReincarnateConfirm(true)}
                      className="w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-amber-500 via-purple-600 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-amber-950/50 border border-amber-300/60 flex items-center justify-center gap-2 transition transform hover:scale-105 active:scale-95 cursor-pointer animate-pulse"
                    >
                      <Sparkles className="w-4 h-4 text-amber-200" />
                      第 {reincCount + 1} 世代へ昇華する！
                    </button>
                  ) : (
                    <div className="text-right space-y-1">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-950/90 border border-amber-500/30 text-amber-300 rounded-xl text-xs font-mono font-bold">
                        <Lock className="w-3.5 h-3.5 text-amber-400" />
                        CP: {combatPower} / {reqPower}
                      </span>
                      <div className="text-[10px] text-slate-400 font-mono font-semibold">
                        Lv: <span className={character.level >= reqLevel ? 'text-emerald-400 font-bold' : 'text-slate-400'}>{character.level}</span> / {reqLevel}
                      </div>
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

            {/* Equipment Presets Section (セットA / セットB) */}
            <div className="bg-[#121215] border border-[#2d2d30] rounded-2xl p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div>
                  <h3 className="text-xs font-bold text-[#c4a661] uppercase tracking-wider flex items-center gap-1.5">
                    <Bookmark className="w-4 h-4 text-amber-400" />
                    <span>装備プリセット (セットA / セットB 役割一括換装)</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    物理・魔法・耐性などの装備構成を保存し、1タップで瞬時に全換装します。
                  </p>
                </div>

                <button
                  onClick={handleUnequipAll}
                  disabled={!character.equipment.weapon && !character.equipment.armor && !character.equipment.accessory}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition flex items-center gap-1.5 shrink-0 ${
                    character.equipment.weapon || character.equipment.armor || character.equipment.accessory
                      ? 'bg-rose-950/80 hover:bg-rose-900/90 text-rose-300 border-rose-700/60 shadow-sm cursor-pointer'
                      : 'bg-[#14141a] text-slate-600 border-slate-800 cursor-not-allowed'
                  }`}
                  title="装着中の全装備（武器・防具・アクセサリー）を一度に解除してインベントリに戻します"
                >
                  <ShieldOff className="w-3.5 h-3.5 text-rose-400" />
                  <span>全装備解除</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(['setA', 'setB'] as const).map((presetId) => {
                  const preset = character.equipmentPresets?.[presetId];
                  const isSetA = presetId === 'setA';
                  const defaultTitle = isSetA ? 'セットA (役割1)' : 'セットB (役割2)';
                  const presetName = preset?.name || defaultTitle;
                  const isActive = isPresetActive(presetId);
                  const isEditing = editingPresetId === presetId;

                  const pWeapon = preset?.equipment.weapon;
                  const pArmor = preset?.equipment.armor;
                  const pAcc = preset?.equipment.accessory;

                  const pAtk = (pWeapon?.stats?.atk || 0) + (pArmor?.stats?.atk || 0) + (pAcc?.stats?.atk || 0);
                  const pDef = (pWeapon?.stats?.def || 0) + (pArmor?.stats?.def || 0) + (pAcc?.stats?.def || 0);

                  return (
                    <div
                      key={presetId}
                      className={`p-3.5 rounded-xl border transition-all relative flex flex-col justify-between ${
                        isActive
                          ? 'bg-gradient-to-b from-[#1c1a14] to-[#121215] border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                          : preset
                          ? 'bg-[#16161b] border-[#2d2d38] hover:border-slate-600'
                          : 'bg-[#101014] border-[#22222b] opacity-80'
                      }`}
                    >
                      <div>
                        {/* Preset Header Bar */}
                        <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-[#242430]">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border shrink-0 ${
                              isSetA ? 'bg-amber-950/80 text-amber-300 border-amber-600/50' : 'bg-purple-950/80 text-purple-300 border-purple-600/50'
                            }`}>
                              {isSetA ? 'SET A' : 'SET B'}
                            </span>

                            {isEditing ? (
                              <div className="flex items-center gap-1">
                                <input
                                  type="text"
                                  value={presetNameInput}
                                  onChange={(e) => setPresetNameInput(e.target.value)}
                                  placeholder={defaultTitle}
                                  className="bg-[#20202a] border border-amber-500 text-xs px-2 py-0.5 rounded text-white font-bold outline-none w-28"
                                  autoFocus
                                />
                                <button
                                  onClick={() => handleSaveRenamedPreset(presetId)}
                                  className="p-1 bg-amber-500 text-slate-950 rounded hover:bg-amber-400 cursor-pointer"
                                  title="保存"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs font-bold text-white truncate flex items-center gap-1">
                                {presetName}
                                <button
                                  onClick={() => {
                                    setEditingPresetId(presetId);
                                    setPresetNameInput(presetName);
                                  }}
                                  className="text-slate-500 hover:text-amber-400 p-0.5 transition cursor-pointer"
                                  title="名前変更"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </button>
                              </span>
                            )}
                          </div>

                          {isActive ? (
                            <span className="text-[10px] font-black text-amber-400 bg-amber-950/80 border border-amber-500/60 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0 animate-pulse">
                              <CheckCircle2 className="w-3 h-3 text-amber-400" /> 適用中
                            </span>
                          ) : preset ? (
                            <span className="text-[10px] text-slate-500 font-mono shrink-0">
                              {preset.savedAt ? `保存: ${preset.savedAt}` : '保存済'}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-600 font-mono shrink-0">未登録</span>
                          )}
                        </div>

                        {/* Item Breakdown */}
                        <div className="space-y-1.5 text-xs font-mono mb-3">
                          <div className="flex items-center justify-between text-slate-300">
                            <span className="text-[10px] text-slate-500 flex items-center gap-1">
                              <Sword className="w-3 h-3 text-red-400 shrink-0" /> 武器:
                            </span>
                            <span className={`truncate max-w-[140px] text-right ${pWeapon ? 'text-slate-200 font-semibold' : 'text-slate-600'}`}>
                              {pWeapon ? pWeapon.name : '（未装着）'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-slate-300">
                            <span className="text-[10px] text-slate-500 flex items-center gap-1">
                              <Shield className="w-3 h-3 text-blue-400 shrink-0" /> 防具:
                            </span>
                            <span className={`truncate max-w-[140px] text-right ${pArmor ? 'text-slate-200 font-semibold' : 'text-slate-600'}`}>
                              {pArmor ? pArmor.name : '（未装着）'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-slate-300">
                            <span className="text-[10px] text-slate-500 flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-purple-400 shrink-0" /> アクセ:
                            </span>
                            <span className={`truncate max-w-[140px] text-right ${pAcc ? 'text-slate-200 font-semibold' : 'text-slate-600'}`}>
                              {pAcc ? pAcc.name : '（未装着）'}
                            </span>
                          </div>
                        </div>

                        {/* Stats summary badge */}
                        {preset && (pAtk > 0 || pDef > 0) && (
                          <div className="mb-3 px-2 py-1 bg-[#101014] rounded border border-[#22222b] text-[10px] font-mono flex items-center justify-around text-slate-400">
                            <span>付加ATK: <strong className="text-rose-400">+{pAtk}</strong></span>
                            <span>付加DEF: <strong className="text-blue-400">+{pDef}</strong></span>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1.5 pt-2 border-t border-[#20202b] flex-wrap">
                        <button
                          onClick={() => handleSavePreset(presetId)}
                          className="flex-1 py-1.5 px-2 bg-[#202028] hover:bg-[#2a2a35] border border-[#383848] text-amber-300 hover:text-amber-200 text-[11px] font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1 shrink-0"
                          title="現在の装備構成をこのプリセットに上書き保存します"
                        >
                          <Save className="w-3.5 h-3.5 text-amber-400" />
                          <span>現装備を保存</span>
                        </button>

                        <button
                          onClick={() => handleEquipPreset(presetId)}
                          disabled={!preset || isActive}
                          className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-black transition cursor-pointer flex items-center justify-center gap-1 shrink-0 ${
                            isActive
                              ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                              : preset
                              ? 'bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 shadow border border-amber-400/50'
                              : 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed'
                          }`}
                          title={isActive ? '既にこのセットが装着されています' : 'このプリセットに全換装します'}
                        >
                          <ArrowUpDown className="w-3.5 h-3.5" />
                          <span>{isActive ? '装着中' : 'このセットに切替'}</span>
                        </button>

                        {preset && (
                          <button
                            onClick={() => handleClearPreset(presetId)}
                            className="p-1.5 bg-[#181212] hover:bg-[#281515] border border-[#3e2020] text-red-400 rounded-lg transition cursor-pointer"
                            title="プリセット削除"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Equipment Slots */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  装備中の武具 (クリックで詳細表示)
                </h3>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-slate-500 font-mono font-bold">1タップ切替:</span>
                  <button
                    onClick={() => handleEquipPreset('setA')}
                    disabled={!character.equipmentPresets?.setA || isPresetActive('setA')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border transition flex items-center gap-1 cursor-pointer ${
                      isPresetActive('setA')
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-sm'
                        : character.equipmentPresets?.setA
                        ? 'bg-[#181820] hover:bg-[#22222e] text-slate-300 border-[#3a3a4a]'
                        : 'bg-[#101014] text-slate-600 border-slate-800 cursor-not-allowed'
                    }`}
                  >
                    <Bookmark className="w-3 h-3 text-amber-400" />
                    <span>{character.equipmentPresets?.setA?.name || 'セットA'}</span>
                  </button>

                  <button
                    onClick={() => handleEquipPreset('setB')}
                    disabled={!character.equipmentPresets?.setB || isPresetActive('setB')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border transition flex items-center gap-1 cursor-pointer ${
                      isPresetActive('setB')
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/60 shadow-sm'
                        : character.equipmentPresets?.setB
                        ? 'bg-[#181820] hover:bg-[#22222e] text-slate-300 border-[#3a3a4a]'
                        : 'bg-[#101014] text-slate-600 border-slate-800 cursor-not-allowed'
                    }`}
                  >
                    <Bookmark className="w-3 h-3 text-purple-400" />
                    <span>{character.equipmentPresets?.setB?.name || 'セットB'}</span>
                  </button>

                  <button
                    onClick={handleUnequipAll}
                    disabled={!character.equipment.weapon && !character.equipment.armor && !character.equipment.accessory}
                    className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold border transition flex items-center gap-1 cursor-pointer ${
                      character.equipment.weapon || character.equipment.armor || character.equipment.accessory
                        ? 'bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border-rose-800/50'
                        : 'bg-[#101014] text-slate-600 border-slate-800 cursor-not-allowed'
                    }`}
                    title="全ての装備品を一度に解除"
                  >
                    <ShieldOff className="w-3 h-3 text-rose-400" />
                    <span>全解除</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div 
                  onClick={() => character.equipment.weapon && setSelectedItemDetail({ item: character.equipment.weapon, isEquipped: true, equipType: 'weapon' })}
                  className={`bg-[#121215] p-3 rounded-xl border border-[#2d2d30] flex items-center justify-between transition ${
                    character.equipment.weapon ? 'hover:border-[#c4a661] cursor-pointer' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Sword className="w-5 h-5 text-red-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-500 block">武器</span>
                      <span className="text-xs font-bold text-white line-clamp-1">{character.equipment.weapon ? character.equipment.weapon.name : 'なし'}</span>
                    </div>
                  </div>
                  {character.equipment.weapon && (
                    <span className="text-[10px] text-[#c4a661] border border-[#3a3528] px-2 py-0.5 rounded bg-[#1c1a14] font-bold shrink-0">
                      詳細
                    </span>
                  )}
                </div>

                <div 
                  onClick={() => character.equipment.armor && setSelectedItemDetail({ item: character.equipment.armor, isEquipped: true, equipType: 'armor' })}
                  className={`bg-[#121215] p-3 rounded-xl border border-[#2d2d30] flex items-center justify-between transition ${
                    character.equipment.armor ? 'hover:border-[#c4a661] cursor-pointer' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-blue-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-500 block">防具</span>
                      <span className="text-xs font-bold text-white line-clamp-1">{character.equipment.armor ? character.equipment.armor.name : 'なし'}</span>
                    </div>
                  </div>
                  {character.equipment.armor && (
                    <span className="text-[10px] text-[#c4a661] border border-[#3a3528] px-2 py-0.5 rounded bg-[#1c1a14] font-bold shrink-0">
                      詳細
                    </span>
                  )}
                </div>

                <div 
                  onClick={() => character.equipment.accessory && setSelectedItemDetail({ item: character.equipment.accessory, isEquipped: true, equipType: 'accessory' })}
                  className={`bg-[#121215] p-3 rounded-xl border border-[#2d2d30] flex items-center justify-between transition ${
                    character.equipment.accessory ? 'hover:border-[#c4a661] cursor-pointer' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-purple-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-500 block">アクセサリー</span>
                      <span className="text-xs font-bold text-white line-clamp-1">{character.equipment.accessory ? character.equipment.accessory.name : 'なし'}</span>
                    </div>
                  </div>
                  {character.equipment.accessory && (
                    <span className="text-[10px] text-[#c4a661] border border-[#3a3528] px-2 py-0.5 rounded bg-[#1c1a14] font-bold shrink-0">
                      詳細
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Inventory List */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">所持品バッグ ({character.inventory.length})</h3>
                <span className="text-[10px] text-slate-500">※アイテムをタップで詳細確認＆装備</span>
              </div>
              {character.inventory.length === 0 ? (
                <div className="bg-[#121215] p-6 rounded-2xl border border-[#2d2d30] text-center">
                  <p className="text-xs text-slate-500">インベントリは空です。</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {character.inventory.map((item, index) => {
                    const isEquippable = item.type === 'weapon' || item.type === 'armor' || item.type === 'accessory';
                    return (
                      <div 
                        key={index} 
                        onClick={() => setSelectedItemDetail({ item, isEquipped: false, invIndex: index })}
                        className="bg-[#121215] p-3 rounded-xl border border-[#2d2d30] flex justify-between items-center hover:border-[#c4a661]/80 transition cursor-pointer group"
                      >
                        <div className="flex items-center gap-3 min-w-0 pr-2">
                          <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${getRarityBadgeStyle(item.rarity)}`}>
                            {item.type === 'weapon' ? <Sword className="w-4 h-4 text-red-400" /> :
                             item.type === 'armor' ? <Shield className="w-4 h-4 text-blue-400" /> :
                             item.type === 'accessory' ? <Sparkles className="w-4 h-4 text-purple-400" /> :
                             <Zap className="w-4 h-4 text-emerald-400" />}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-sm truncate group-hover:text-[#f3e5be] transition">{item.name}</span>
                              <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700 shrink-0">
                                {item.type === 'weapon' ? '武器' : item.type === 'armor' ? '防具' : item.type === 'accessory' ? 'アクセ' : item.type === 'potion' ? 'ポーション' : '書物'}
                              </span>
                            </div>
                            <span className="text-xs text-slate-400 truncate block mt-0.5">{item.desc}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                          {isEquippable ? (
                            <button
                              onClick={() => handleEquipItemDirectly(item, index)}
                              className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black rounded-lg transition cursor-pointer shadow flex items-center gap-1"
                            >
                              <Sword className="w-3.5 h-3.5 fill-current" />
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

                          <button
                            onClick={() => setSelectedItemDetail({ item, isEquipped: false, invIndex: index })}
                            className="px-2.5 py-1.5 bg-[#1c1c22] hover:bg-[#282832] border border-[#3a3528] text-slate-300 text-xs font-bold rounded-lg transition cursor-pointer"
                          >
                            詳細
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Danger Zone: Hard Reset */}
            <div className="pt-4 border-t border-[#2d2d30] flex items-center justify-between">
              <span className="text-xs text-[#888]">セーブデータ管理</span>
              <button
                onClick={() => setShowResetConfirm(true)}
                className="px-4 py-2 bg-[#181010] hover:bg-[#251414] border border-[#4a2222] text-[#e57373] text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>データ完全初期化</span>
              </button>
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

        {/* Bottom Danger Zone (Data Reset) Button */}
        <div className="mt-6 pt-4 border-t border-[#2d2d30] flex justify-between items-center">
          <div className="text-[10px] text-slate-500">
            セーブデータを消去して最初からやり直したい場合はこちら
          </div>
          <button
            onClick={() => setShowResetConfirm(true)}
            className="px-3.5 py-2 bg-red-950/40 hover:bg-red-900/60 border border-red-800/60 text-red-400 hover:text-red-200 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            データを完全リセット
          </button>
        </div>

      </div>

      {/* Reincarnation Confirmation Modal */}
      {showReincarnateConfirm && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-lg z-50 flex items-center justify-center p-4 animate-backdropFadeIn">
          <div className="bg-[#0f0f14] border-2 border-amber-400 max-w-lg w-full rounded-3xl p-6 shadow-[0_0_50px_rgba(245,158,11,0.3)] text-slate-100 relative animate-modalExpand">
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

      {/* Hard Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-backdropFadeIn">
          <div className="bg-[#120808] border-2 border-red-600 max-w-md w-full rounded-3xl p-6 shadow-[0_0_50px_rgba(220,38,38,0.3)] text-slate-100 relative animate-modalExpand">
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
              ※ この操作は取り消せません。すべて初期状態に戻ります。
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
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

      {/* Item Detail Modal Overlay */}
      {selectedItemDetail && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-backdropFadeIn">
          <div className={`bg-[#0c0d12] border-2 max-w-md w-full rounded-3xl p-6 shadow-2xl relative text-slate-100 animate-modalExpand ${getRarityBadgeStyle(selectedItemDetail.item.rarity)}`}>
            
            {/* Modal Header */}
            <div className="flex justify-between items-start mb-4 pb-3 border-b border-white/10">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400 block mb-1">
                  🔍 ITEM SPECIFICATIONS & STATS
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase px-2 py-0.5 rounded bg-black/60 border border-white/10 font-mono">
                    [{selectedItemDetail.item.rarity.toUpperCase()}]
                  </span>
                  <span className="text-xs font-bold text-slate-300 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                    {selectedItemDetail.item.type === 'weapon' ? '⚔️ 武器' :
                     selectedItemDetail.item.type === 'armor' ? '🛡️ 防具' :
                     selectedItemDetail.item.type === 'accessory' ? '💍 アクセサリー' :
                     selectedItemDetail.item.type === 'potion' ? '🧪 消耗ポーション' : '📜 秘伝書'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedItemDetail(null)}
                className="p-2 bg-slate-900/80 hover:bg-slate-800 border border-white/10 rounded-xl transition cursor-pointer"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {/* Item Icon & Name */}
            <div className="flex items-center gap-4 mb-5 p-3.5 bg-black/40 rounded-2xl border border-white/10">
              <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-white/20 flex items-center justify-center shrink-0 shadow-lg">
                {selectedItemDetail.item.type === 'weapon' ? <Sword className="w-7 h-7 text-red-400" /> :
                 selectedItemDetail.item.type === 'armor' ? <Shield className="w-7 h-7 text-blue-400" /> :
                 selectedItemDetail.item.type === 'accessory' ? <Sparkles className="w-7 h-7 text-purple-400" /> :
                 <Zap className="w-7 h-7 text-emerald-400" />}
              </div>
              <div>
                <h3 className="text-lg font-black text-white tracking-wide">{selectedItemDetail.item.name}</h3>
                {selectedItemDetail.isEquipped && (
                  <span className="inline-block mt-1 text-[10px] font-black bg-emerald-950 text-emerald-300 border border-emerald-700/80 px-2 py-0.5 rounded-md font-mono">
                    ✓ 現在装備中
                  </span>
                )}
              </div>
            </div>

            {/* Comparison or Specs Breakdown */}
            {!selectedItemDetail.isEquipped && (selectedItemDetail.item.type === 'weapon' || selectedItemDetail.item.type === 'armor' || selectedItemDetail.item.type === 'accessory') ? (() => {
              const comp = getEquipmentComparison(selectedItemDetail.item);
              if (!comp) return null;

              return (
                <div className="bg-[#12131a] p-4 rounded-2xl border border-[#2d2d38] mb-4 space-y-3">
                  {/* Header */}
                  <div className="flex items-center justify-between text-xs font-mono pb-2 border-b border-white/10">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                      📊 装備ステータス比較 (EQUIPMENT COMPARISON)
                    </span>
                  </div>

                  {/* Item Names Side-by-Side */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {/* Currently Equipped */}
                    <div className="p-2.5 bg-slate-900/90 rounded-xl border border-slate-700/60">
                      <span className="text-[10px] font-bold text-slate-400 block mb-0.5">現在装備中:</span>
                      <div className="font-bold text-slate-200 truncate flex items-center gap-1.5">
                        {comp.equippedItem ? (
                          <>
                            <span className="text-xs">{comp.equippedItem.type === 'weapon' ? '⚔️' : comp.equippedItem.type === 'armor' ? '🛡️' : '💍'}</span>
                            <span className="truncate">{comp.equippedItem.name}</span>
                          </>
                        ) : (
                          <span className="text-slate-500 italic">（なし）</span>
                        )}
                      </div>
                    </div>

                    {/* Candidate Item */}
                    <div className="p-2.5 bg-amber-950/40 rounded-xl border border-amber-500/50">
                      <span className="text-[10px] font-bold text-amber-400 block mb-0.5">装備候補:</span>
                      <div className="font-bold text-amber-200 truncate flex items-center gap-1.5">
                        <span className="text-xs">{selectedItemDetail.item.type === 'weapon' ? '⚔️' : selectedItemDetail.item.type === 'armor' ? '🛡️' : '💍'}</span>
                        <span className="truncate">{selectedItemDetail.item.name}</span>
                      </div>
                    </div>
                  </div>

                  {/* Stat Rows Comparison */}
                  <div className="space-y-1.5">
                    {comp.stats.length > 0 ? (
                      comp.stats.map(s => (
                        <div 
                          key={s.key}
                          className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-all ${
                            s.diff > 0 
                              ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200 shadow-[0_2px_10px_rgba(16,185,129,0.15)]' 
                              : s.diff < 0 
                                ? 'bg-rose-950/40 border-rose-500/60 text-rose-200 shadow-[0_2px_10px_rgba(244,63,94,0.15)]' 
                                : 'bg-slate-900/60 border-slate-800 text-slate-300'
                          }`}
                        >
                          {/* Stat label */}
                          <span className="font-bold shrink-0 text-slate-300 min-w-[70px]">{s.label}</span>

                          {/* Current -> Candidate flow */}
                          <div className="flex items-center gap-2 font-mono">
                            <span className="text-slate-400 text-xs">
                              {s.cur !== 0 ? `+${s.cur}${s.unit}` : '0'}
                            </span>
                            <span className="text-slate-500 text-[10px]">➔</span>
                            <span className={`font-black text-sm ${
                              s.diff > 0 ? 'text-emerald-400 font-extrabold' :
                              s.diff < 0 ? 'text-rose-400 font-extrabold' :
                              'text-slate-200'
                            }`}>
                              {s.candidate !== 0 ? `+${s.candidate}${s.unit}` : '0'}
                            </span>
                          </div>

                          {/* Difference Badge: Green for higher candidate, Red for lower candidate */}
                          <span className={`px-2.5 py-1 rounded-lg font-mono font-black text-xs shrink-0 border flex items-center gap-1 shadow-sm ${
                            s.diff > 0 
                              ? 'bg-emerald-900/90 border-emerald-400 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.4)]' 
                              : s.diff < 0 
                                ? 'bg-rose-900/90 border-rose-400 text-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.4)]' 
                                : 'bg-slate-800 border-slate-700 text-slate-400'
                          }`}>
                            {s.diff > 0 ? (
                              <>
                                <span>+{s.diff}{s.unit}</span>
                                <span className="text-[10px]">▲</span>
                              </>
                            ) : s.diff < 0 ? (
                              <>
                                <span>{s.diff}{s.unit}</span>
                                <span className="text-[10px]">▼</span>
                              </>
                            ) : (
                              <span>±0</span>
                            )}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800 text-center text-slate-400 text-xs">
                        ステータス変化なし
                      </div>
                    )}
                  </div>
                </div>
              );
            })() : (
              /* Single Specs Breakdown for Equipped items / Consumables */
              <div className="bg-[#12131a] p-4 rounded-2xl border border-[#2d2d30] mb-4 space-y-2 text-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block mb-1">性能・ステータス補正:</span>
                
                {selectedItemDetail.item.stats && (
                  <div className="grid grid-cols-2 gap-2">
                    {selectedItemDetail.item.stats.atk !== undefined && (
                      <div className="p-2 bg-rose-950/30 rounded-xl border border-rose-900/40 flex justify-between items-center">
                        <span className="text-rose-300 font-bold">⚔️ 攻撃力:</span>
                        <strong className="text-rose-400 font-mono text-sm">+{selectedItemDetail.item.stats.atk}</strong>
                      </div>
                    )}
                    {selectedItemDetail.item.stats.def !== undefined && (
                      <div className="p-2 bg-blue-950/30 rounded-xl border border-blue-900/40 flex justify-between items-center">
                        <span className="text-blue-300 font-bold">🛡️ 防御力:</span>
                        <strong className="text-blue-400 font-mono text-sm">+{selectedItemDetail.item.stats.def}</strong>
                      </div>
                    )}
                    {selectedItemDetail.item.stats.hp !== undefined && (
                      <div className="p-2 bg-emerald-950/30 rounded-xl border border-emerald-900/40 flex justify-between items-center">
                        <span className="text-emerald-300 font-bold">❤️ 最大HP:</span>
                        <strong className="text-emerald-400 font-mono text-sm">+{selectedItemDetail.item.stats.hp}</strong>
                      </div>
                    )}
                    {selectedItemDetail.item.stats.mp !== undefined && (
                      <div className="p-2 bg-purple-950/30 rounded-xl border border-purple-900/40 flex justify-between items-center">
                        <span className="text-purple-300 font-bold">✨ 最大MP:</span>
                        <strong className="text-purple-400 font-mono text-sm">+{selectedItemDetail.item.stats.mp}</strong>
                      </div>
                    )}
                    {selectedItemDetail.item.stats.spd !== undefined && (
                      <div className="p-2 bg-amber-950/30 rounded-xl border border-amber-900/40 flex justify-between items-center">
                        <span className="text-amber-300 font-bold">⚡ 素早さ:</span>
                        <strong className="text-amber-400 font-mono text-sm">+{selectedItemDetail.item.stats.spd}</strong>
                      </div>
                    )}
                    {selectedItemDetail.item.stats.crit !== undefined && (
                      <div className="p-2 bg-yellow-950/30 rounded-xl border border-yellow-900/40 flex justify-between items-center">
                        <span className="text-yellow-300 font-bold">🎯 会心率:</span>
                        <strong className="text-yellow-400 font-mono text-sm">+{selectedItemDetail.item.stats.crit}%</strong>
                      </div>
                    )}
                  </div>
                )}

                {selectedItemDetail.item.effect && (
                  <div className="p-2.5 bg-emerald-950/30 rounded-xl border border-emerald-800/50 text-emerald-300 font-bold flex items-center justify-between">
                    <span>🧪 使用効果:</span>
                    <span className="font-mono text-sm">
                      {selectedItemDetail.item.effect.type === 'healHp' ? `HP ${selectedItemDetail.item.effect.value} 回復` :
                       selectedItemDetail.item.effect.type === 'healMp' ? `MP ${selectedItemDetail.item.effect.value} 回復` :
                       `ステータス +${selectedItemDetail.item.effect.value} 恒久強化`}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            <div className="bg-black/40 p-3.5 rounded-xl border border-white/5 text-xs text-slate-300 leading-relaxed mb-6">
              {selectedItemDetail.item.desc}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              {!selectedItemDetail.isEquipped && (selectedItemDetail.item.type === 'weapon' || selectedItemDetail.item.type === 'armor' || selectedItemDetail.item.type === 'accessory') && (
                <button
                  onClick={() => handleEquipItemDirectly(selectedItemDetail.item, selectedItemDetail.invIndex)}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-950/50 flex items-center justify-center gap-2 transition transform hover:scale-102 cursor-pointer"
                >
                  <Sword className="w-4 h-4 fill-current" />
                  <span>装備する（ステータスに直ちに反映）</span>
                </button>
              )}

              {selectedItemDetail.isEquipped && (
                <button
                  onClick={() => handleUnequipItemDirectly(selectedItemDetail.equipType || (selectedItemDetail.item.type as any))}
                  className="w-full py-3.5 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-black text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Shield className="w-4 h-4" />
                  <span>装備を外してバッグに戻す</span>
                </button>
              )}

              {(selectedItemDetail.item.type === 'potion' || selectedItemDetail.item.type === 'scroll') && (
                <button
                  onClick={() => handleUseItemFromDetail(selectedItemDetail.item, selectedItemDetail.invIndex)}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Zap className="w-4 h-4" />
                  <span>使用する</span>
                </button>
              )}

              <button
                onClick={() => setSelectedItemDetail(null)}
                className="w-full py-3 bg-[#181820] hover:bg-[#252530] border border-[#3a3528] text-slate-300 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                閉じる
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
