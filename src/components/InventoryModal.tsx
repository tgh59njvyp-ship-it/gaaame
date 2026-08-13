import React, { useState } from 'react';
import { CharacterState, Item, EquipmentPreset } from '../types';
import { getTitleBonuses, TITLES } from '../utils/titleUtils';
import { getSkillStatsBonus, ALL_SKILLS, unlockSkillNode, SkillNode } from '../utils/skillUtils';
import { calculateCombatPower, canReincarnate, getReincarnationPowerReq, getReincarnationLevelReq } from '../utils/combatPower';
import { generateSynthesizedLoot } from '../utils/lootGenerator';
import { 
  X, Sword, Shield, Backpack, Sparkles, Check, Award, Share2, 
  Lock, ArrowRight, Zap, RefreshCw, Star, Info, Flame, FlameKindling, Crown, Trash2, AlertTriangle,
  Save, Edit3, Layers, ArrowUpDown, CheckCircle2, Bookmark, ShieldOff, FlaskConical, Plus
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
  const [activeTab, setActiveTab] = useState<'status' | 'skills' | 'synthesis'>('status');
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

  // Alchemy Synthesis States
  const [selectedMaterialIndexes, setSelectedMaterialIndexes] = useState<number[]>([]);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthesizedResultItem, setSynthesizedResultItem] = useState<Item | null>(null);
  const [synthesisFilter, setSynthesisFilter] = useState<'all' | 'common' | 'rare' | 'epic' | 'legendary' | 'mythic' | 'divine'>('all');

  const toggleMaterialIndex = (index: number) => {
    if (selectedMaterialIndexes.includes(index)) {
      setSelectedMaterialIndexes(selectedMaterialIndexes.filter(i => i !== index));
    } else {
      if (selectedMaterialIndexes.length >= 5) return;
      setSelectedMaterialIndexes([...selectedMaterialIndexes, index]);
    }
  };

  const handleAutoSelectMaterials = (targetRarity: Item['rarity']) => {
    const indexes: number[] = [];
    character.inventory.forEach((item, idx) => {
      if (item.rarity === targetRarity && indexes.length < 5) {
        indexes.push(idx);
      }
    });
    setSelectedMaterialIndexes(indexes);
  };

  const handleRunSynthesis = () => {
    if (selectedMaterialIndexes.length < 2 || isSynthesizing) return;

    setIsSynthesizing(true);

    setTimeout(() => {
      const selectedMaterials = selectedMaterialIndexes.map(idx => character.inventory[idx]).filter(Boolean);
      const newSynthesizedItem = generateSynthesizedLoot(selectedMaterials, character.level);

      const updatedInventory = character.inventory.filter((_, idx) => !selectedMaterialIndexes.includes(idx));
      updatedInventory.push(newSynthesizedItem);

      const updatedChar: CharacterState = {
        ...character,
        inventory: updatedInventory
      };

      onEquipItem(updatedChar);
      setSelectedMaterialIndexes([]);
      setIsSynthesizing(false);
      setSynthesizedResultItem(newSynthesizedItem);
    }, 1200);
  };

  const getSynthesisForecast = () => {
    if (selectedMaterialIndexes.length < 2) return null;
    const selectedMaterials = selectedMaterialIndexes.map(idx => character.inventory[idx]).filter(Boolean);
    
    const rarityScores: Record<Item['rarity'], number> = { common: 1, rare: 2, epic: 3, legendary: 4, mythic: 5, divine: 6 };
    const totalScore = selectedMaterials.reduce((acc, m) => acc + (rarityScores[m.rarity] || 1), 0);
    const avgScore = totalScore / selectedMaterials.length;
    const countBonus = (selectedMaterials.length - 2) * 0.4;
    const finalScore = avgScore + countBonus;

    if (finalScore >= 5.8) {
      return { primary: 'DIVINE / MYTHIC 100%', secondary: '創世神絶級 確定', color: 'text-rose-300 border-rose-400 bg-rose-950/60' };
    } else if (finalScore >= 4.8) {
      return { primary: 'MYTHIC 70% / LEGENDARY 30%', secondary: '神話級以上確定', color: 'text-amber-300 border-amber-400 bg-amber-950/60' };
    } else if (finalScore >= 4.0) {
      return { primary: 'LEGENDARY 100%', secondary: '最高級確定', color: 'text-amber-400 border-amber-500 bg-amber-950/60' };
    } else if (finalScore >= 3.2) {
      return { primary: 'LEGENDARY 80%', secondary: 'EPIC 20%', color: 'text-amber-400 border-amber-500 bg-amber-950/40' };
    } else if (finalScore >= 2.2) {
      return { primary: 'EPIC 65%', secondary: 'LEGENDARY 25% / RARE 10%', color: 'text-purple-400 border-purple-500 bg-purple-950/40' };
    } else if (finalScore >= 1.4) {
      return { primary: 'RARE 70%', secondary: 'EPIC 20% / COMMON 10%', color: 'text-blue-400 border-blue-500 bg-blue-950/40' };
    } else {
      return { primary: 'RARE 70%', secondary: 'COMMON 30%', color: 'text-emerald-400 border-emerald-500 bg-emerald-950/40' };
    }
  };

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
      case 'divine':
        return 'border-rose-400 bg-gradient-to-r from-rose-950/80 via-purple-950/80 to-amber-950/80 shadow-[0_0_20px_rgba(244,63,94,0.6)] text-rose-200 animate-pulse';
      case 'mythic':
        return 'border-amber-400 bg-gradient-to-r from-amber-950/80 via-orange-950/80 to-red-950/80 shadow-[0_0_15px_rgba(245,158,11,0.5)] text-amber-200';
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

    setSelectedItemDetail(null);
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
              {activeTab === 'status' ? 'ステータスと装備品' : activeTab === 'synthesis' ? '錬金合成工房' : '天賦スキルツリー'}
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
            onClick={() => setActiveTab('synthesis')}
            className={`flex-1 py-3 text-xs font-black tracking-widest rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'synthesis'
                ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/10 text-purple-300 border border-purple-500/40 shadow-inner'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ⚗️ 錬金合成
            {character.inventory.length >= 2 && (
              <span className="bg-purple-950 text-purple-300 border border-purple-700 text-[10px] px-1.5 py-0.2 rounded-md font-mono font-bold">
                {character.inventory.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('skills')}
            className={`flex-1 py-3 text-xs font-black tracking-widest rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'skills'
                ? 'bg-gradient-to-r from-[#4f46e5]/20 to-[#818cf8]/10 text-indigo-400 border border-[#4f46e5]/30 shadow-inner'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🧬 スキルツリー
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
              <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">所持品バッグ ({character.inventory.length})</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('synthesis')}
                    className="px-2.5 py-1 bg-purple-950/70 hover:bg-purple-900/90 text-purple-300 border border-purple-600/50 rounded-lg text-[10px] font-bold flex items-center gap-1 transition cursor-pointer shadow-sm hover:scale-102"
                  >
                    <FlaskConical className="w-3.5 h-3.5 text-purple-400" />
                    <span>不要アイテムの錬金合成 (錬金釜)</span>
                  </button>
                  <span className="text-[10px] text-slate-500 hidden sm:inline">※タップで比較・詳細確認</span>
                </div>
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

        {/* TAB 3: ALCHEMY SYNTHESIS (錬金合成工房) */}
        {activeTab === 'synthesis' && (
          <div className="animate-fadeIn space-y-5">
            {/* Cauldron Banner */}
            <div className="bg-gradient-to-r from-[#170e28] via-[#1f1133] to-[#0f1220] border-2 border-purple-500/50 rounded-3xl p-5 relative overflow-hidden shadow-[0_0_30px_rgba(168,85,247,0.15)]">
              <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/10 rounded-full blur-2xl pointer-events-none"></div>
              
              <div className="flex items-start justify-between gap-4 mb-3 relative z-10">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-purple-400 font-mono font-bold tracking-wider mb-1">
                    <FlaskConical className="w-4 h-4 text-purple-400 animate-pulse" /> ALCHEMY FUSION CAULDRON
                  </div>
                  <h3 className="text-xl font-black text-white flex items-center gap-2">
                    錬金秘術の釜 （錬成・合成）
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-xl">
                    不要になった低ランクアイテム（2〜5個）を錬金釜に投入し、高ランクのレア・エピック・レジェンドアイテムを確率で錬生します！
                  </p>
                </div>

                {/* Quick Auto-Select Buttons */}
                <div className="hidden sm:flex flex-col gap-1.5 shrink-0">
                  <span className="text-[10px] font-mono text-slate-400 font-bold text-right">一括投入ショートカット:</span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleAutoSelectMaterials('common')}
                      className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-lg text-[10px] font-mono font-bold transition cursor-pointer"
                    >
                      COMMON 3個
                    </button>
                    <button
                      onClick={() => handleAutoSelectMaterials('rare')}
                      className="px-2.5 py-1 bg-blue-950 hover:bg-blue-900 text-blue-300 border border-blue-700 rounded-lg text-[10px] font-mono font-bold transition cursor-pointer"
                    >
                      RARE 3個
                    </button>
                    {selectedMaterialIndexes.length > 0 && (
                      <button
                        onClick={() => setSelectedMaterialIndexes([])}
                        className="px-2 py-1 bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-800 rounded-lg text-[10px] font-mono font-bold transition cursor-pointer"
                      >
                        全解除
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Mobile Auto Select */}
              <div className="sm:hidden flex items-center gap-2 pt-2 border-t border-purple-500/20 mb-3">
                <span className="text-[10px] font-mono text-slate-400">一括投入:</span>
                <button
                  onClick={() => handleAutoSelectMaterials('common')}
                  className="px-2 py-0.5 bg-slate-900 text-slate-300 border border-slate-700 rounded text-[10px] font-mono"
                >
                  COMMON 3個
                </button>
                <button
                  onClick={() => handleAutoSelectMaterials('rare')}
                  className="px-2 py-0.5 bg-blue-950 text-blue-300 border border-blue-700 rounded text-[10px] font-mono"
                >
                  RARE 3個
                </button>
                {selectedMaterialIndexes.length > 0 && (
                  <button
                    onClick={() => setSelectedMaterialIndexes([])}
                    className="px-2 py-0.5 bg-red-950/60 text-red-300 border border-red-800 rounded text-[10px] font-mono"
                  >
                    解除
                  </button>
                )}
              </div>

              {/* Cauldron Slots Crucible */}
              <div className="bg-black/60 p-4 rounded-2xl border border-purple-500/30 relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1">
                    🧪 投入中の素材スロット ({selectedMaterialIndexes.length} / 5)
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    ※最低2個以上投入で錬成可能
                  </span>
                </div>

                {/* 5 Crucible Slots */}
                <div className="grid grid-cols-5 gap-2 mb-3">
                  {[0, 1, 2, 3, 4].map(slotIdx => {
                    const invIdx = selectedMaterialIndexes[slotIdx];
                    const matItem = invIdx !== undefined ? character.inventory[invIdx] : null;

                    return (
                      <div
                        key={slotIdx}
                        className={`aspect-square rounded-2xl border flex flex-col items-center justify-center p-1.5 transition-all relative ${
                          matItem
                            ? `${getRarityBadgeStyle(matItem.rarity)} shadow-md`
                            : 'border-dashed border-slate-800 bg-slate-950/50 text-slate-600'
                        }`}
                      >
                        {matItem ? (
                          <>
                            <button
                              onClick={() => toggleMaterialIndex(invIdx)}
                              className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px] font-bold shadow hover:bg-red-500 transition cursor-pointer z-10"
                            >
                              ✕
                            </button>
                            <div className="text-xs">
                              {matItem.type === 'weapon' ? '⚔️' :
                               matItem.type === 'armor' ? '🛡️' :
                               matItem.type === 'accessory' ? '💍' : '🧪'}
                            </div>
                            <span className="text-[9px] font-bold text-white truncate w-full text-center mt-0.5 leading-tight">
                              {matItem.name}
                            </span>
                            <span className="text-[8px] font-mono uppercase px-1 rounded bg-black/60 text-amber-400 mt-0.5">
                              {matItem.rarity.substring(0, 3)}
                            </span>
                          </>
                        ) : (
                          <div className="text-center">
                            <Plus className="w-4 h-4 mx-auto text-slate-700" />
                            <span className="text-[8px] font-mono text-slate-700 block mt-0.5">空き</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Forecast & Synthesize Button Row */}
                {selectedMaterialIndexes.length >= 2 ? (
                  (() => {
                    const forecast = getSynthesisForecast();
                    return (
                      <div className="p-3 bg-[#110f1c] rounded-xl border border-purple-500/40 flex flex-wrap items-center justify-between gap-3 animate-fadeIn">
                        <div>
                          <span className="text-[10px] font-mono font-bold text-purple-300 block">
                            🔮 錬成予測確率 (FORECAST EXPECTATION):
                          </span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-xs font-mono font-black px-2 py-0.5 rounded border ${forecast?.color}`}>
                              {forecast?.primary}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              （内訳: {forecast?.secondary}）
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={handleRunSynthesis}
                          disabled={isSynthesizing}
                          className="px-5 py-2.5 bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white font-black text-xs rounded-xl shadow-lg shadow-purple-950/60 flex items-center gap-2 transition transform hover:scale-102 cursor-pointer border border-purple-400/50 shrink-0"
                        >
                          <Sparkles className="w-4 h-4 animate-spin-slow" />
                          <span>錬金実行（素材を消費）</span>
                        </button>
                      </div>
                    );
                  })()
                ) : (
                  <div className="p-3 bg-[#0d0c12] rounded-xl border border-slate-800 text-center">
                    <span className="text-xs text-slate-500 font-mono">
                      ※下部の一覧から不要なアイテムをタップして2個以上選択してください
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Material Items Selection Bag */}
            <div className="bg-[#0e0e14] p-4 rounded-3xl border border-[#232330]">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-300 uppercase font-mono">
                    🎒 素材選択バッグ ({character.inventory.length})
                  </h4>
                  <span className="text-[10px] font-mono text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800">
                    選択中: {selectedMaterialIndexes.length} / 5
                  </span>
                </div>

                {/* Filter chips */}
                <div className="flex items-center gap-1 flex-wrap">
                  {(['all', 'common', 'rare', 'epic', 'legendary', 'mythic', 'divine'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setSynthesisFilter(f)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase transition cursor-pointer ${
                        synthesisFilter === f
                          ? 'bg-purple-900 text-purple-200 border border-purple-500'
                          : 'bg-slate-900 text-slate-500 hover:text-slate-300 border border-slate-800'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Items List for Synthesis */}
              {character.inventory.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  インベントリに所持品がありません。ダンジョンやショップでアイテムを獲得してください。
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-[35vh] overflow-y-auto pr-1">
                  {character.inventory
                    .map((item, originalIdx) => ({ item, originalIdx }))
                    .filter(({ item }) => synthesisFilter === 'all' || item.rarity === synthesisFilter)
                    .map(({ item, originalIdx }) => {
                      const isSelected = selectedMaterialIndexes.includes(originalIdx);

                      return (
                        <div
                          key={item.id || originalIdx}
                          onClick={() => toggleMaterialIndex(originalIdx)}
                          className={`p-2.5 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                            isSelected
                              ? 'bg-gradient-to-b from-purple-950/80 to-slate-950 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)] scale-102 z-10'
                              : 'bg-[#121218] hover:bg-[#181822] border-slate-800 hover:border-slate-600'
                          }`}
                        >
                          {isSelected && (
                            <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xs shadow z-10">
                              ✓
                            </div>
                          )}

                          <div>
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className="text-xs">
                                {item.type === 'weapon' ? '⚔️' :
                                 item.type === 'armor' ? '🛡️' :
                                 item.type === 'accessory' ? '💍' : '🧪'}
                              </span>
                              <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-black/60 border border-white/10 text-slate-300">
                                [{item.rarity.substring(0, 4)}]
                              </span>
                            </div>

                            <h5 className="text-xs font-bold text-white truncate leading-tight">{item.name}</h5>
                          </div>

                          <div className="mt-2 text-[10px] font-mono text-slate-400 border-t border-slate-800/80 pt-1">
                            {item.stats?.atk !== undefined && <span className="text-rose-400 mr-1">ATK+{item.stats.atk}</span>}
                            {item.stats?.def !== undefined && <span className="text-blue-400 mr-1">DEF+{item.stats.def}</span>}
                            {item.stats?.hp !== undefined && <span className="text-emerald-400 mr-1">HP+{item.stats.hp}</span>}
                            {item.stats?.spd !== undefined && <span className="text-amber-400 mr-1">SPD+{item.stats.spd}</span>}
                            {item.effect && <span className="text-emerald-300">回復/強化</span>}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
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

      {/* Item Detail & Side-by-Side Equipment Comparison Modal Overlay */}
      {selectedItemDetail && (() => {
        const item = selectedItemDetail.item;
        const isEquippable = item.type === 'weapon' || item.type === 'armor' || item.type === 'accessory';
        const slotType = (selectedItemDetail.equipType || item.type) as 'weapon' | 'armor' | 'accessory';
        const slotLabel = slotType === 'weapon' ? '武器枠' : slotType === 'armor' ? '防具枠' : 'アクセサリー枠';
        
        const equippedInSlot = character.equipment[slotType];
        const isAlreadyEquipped = selectedItemDetail.isEquipped;

        // Current item stats in slot
        const curAtk = equippedInSlot?.stats?.atk || 0;
        const curDef = equippedInSlot?.stats?.def || 0;
        const curHp = equippedInSlot?.stats?.hp || 0;
        const curMp = equippedInSlot?.stats?.mp || 0;
        const curSpd = equippedInSlot?.stats?.spd || 0;
        const curCrit = equippedInSlot?.stats?.crit || 0;

        // Candidate item stats
        const candidateAtk = isAlreadyEquipped ? 0 : (item.stats?.atk || 0);
        const candidateDef = isAlreadyEquipped ? 0 : (item.stats?.def || 0);
        const candidateHp = isAlreadyEquipped ? 0 : (item.stats?.hp || 0);
        const candidateMp = isAlreadyEquipped ? 0 : (item.stats?.mp || 0);
        const candidateSpd = isAlreadyEquipped ? 0 : (item.stats?.spd || 0);
        const candidateCrit = isAlreadyEquipped ? 0 : (item.stats?.crit || 0);

        // Stat diffs from replacing current with candidate
        const diffAtk = candidateAtk - curAtk;
        const diffDef = candidateDef - curDef;
        const diffHp = candidateHp - curHp;
        const diffMp = candidateMp - curMp;
        const diffSpd = candidateSpd - curSpd;
        const diffCrit = candidateCrit - curCrit;

        // Simulated total character stats
        const simTotalAtk = totalAtk + diffAtk;
        const simTotalDef = totalDef + diffDef;
        const simTotalHp = totalMaxHp + diffHp;
        const simTotalMp = totalMaxMp + diffMp;
        const simTotalSpd = character.spd + diffSpd;
        const simTotalCrit = Math.min(100, Math.max(0, totalCrit + diffCrit));

        // Simulated character state for Combat Power diff
        const simEquipment = {
          ...character.equipment,
          [slotType]: isAlreadyEquipped ? null : item
        };
        const simCharacter: CharacterState = {
          ...character,
          equipment: simEquipment
        };

        const currentCP = combatPower;
        const simCP = calculateCombatPower(simCharacter);
        const cpDiff = simCP - currentCP;

        const comparisonStats = [
          { key: 'atk', label: '⚔️ 攻撃力', curTotal: totalAtk, simTotal: simTotalAtk, diff: diffAtk, unit: '' },
          { key: 'def', label: '🛡️ 防御力', curTotal: totalDef, simTotal: simTotalDef, diff: diffDef, unit: '' },
          { key: 'hp', label: '❤️ 最大HP', curTotal: totalMaxHp, simTotal: simTotalHp, diff: diffHp, unit: '' },
          { key: 'mp', label: '✨ 最大MP', curTotal: totalMaxMp, simTotal: simTotalMp, diff: diffMp, unit: '' },
          { key: 'spd', label: '⚡ 素早さ', curTotal: character.spd, simTotal: simTotalSpd, diff: diffSpd, unit: '' },
          { key: 'crit', label: '🎯 会心率', curTotal: totalCrit, simTotal: simTotalCrit, diff: diffCrit, unit: '%' },
        ].filter(s => s.curTotal !== 0 || s.simTotal !== 0 || s.diff !== 0);

        return (
          <div 
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-backdropFadeIn"
            onClick={() => setSelectedItemDetail(null)}
          >
            <div 
              className={`bg-[#0c0d12] border-2 ${
                isEquippable ? 'max-w-2xl' : 'max-w-md'
              } w-full rounded-3xl p-5 sm:p-6 shadow-2xl relative text-slate-100 animate-modalExpand ${getRarityBadgeStyle(item.rarity)}`}
              onClick={(e) => e.stopPropagation()}
            >
              
              {/* Modal Header */}
              <div className="flex justify-between items-start mb-4 pb-3 border-b border-white/10">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400 block mb-1">
                    {isEquippable ? '📊 EQUIPMENT SIDE-BY-SIDE COMPARISON' : '🔍 ITEM SPECIFICATIONS & EFFECTS'}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase px-2 py-0.5 rounded bg-black/60 border border-white/10 font-mono">
                      [{item.rarity.toUpperCase()}]
                    </span>
                    <span className="text-xs font-bold text-slate-300 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                      {item.type === 'weapon' ? '⚔️ 武器' :
                       item.type === 'armor' ? '🛡️ 防具' :
                       item.type === 'accessory' ? '💍 アクセサリー' :
                       item.type === 'potion' ? '🧪 消耗ポーション' : '📜 秘伝書'}
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

              {/* Side-by-Side Equipment Cards (For Equippable items) */}
              {isEquippable ? (
                <div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    {/* Left Card: 現在装着中 (Currently Equipped) */}
                    <div className={`p-3.5 rounded-2xl border flex flex-col justify-between ${
                      equippedInSlot ? 'bg-[#121218] border-slate-700/80' : 'bg-[#0e0e12] border-dashed border-slate-800'
                    }`}>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                            🛡️ 現在装着中
                          </span>
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-slate-800/80 text-slate-400 border border-slate-700">
                            {slotLabel}
                          </span>
                        </div>

                        {equippedInSlot ? (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${getRarityBadgeStyle(equippedInSlot.rarity)}`}>
                                {equippedInSlot.type === 'weapon' ? <Sword className="w-5 h-5 text-red-400" /> :
                                 equippedInSlot.type === 'armor' ? <Shield className="w-5 h-5 text-blue-400" /> :
                                 <Sparkles className="w-5 h-5 text-purple-400" />}
                              </div>
                              <div className="min-w-0">
                                <span className="text-[10px] font-mono font-bold uppercase block text-slate-400">
                                  [{equippedInSlot.rarity.toUpperCase()}]
                                </span>
                                <h4 className="text-xs font-bold text-white truncate">{equippedInSlot.name}</h4>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-1 text-[11px] font-mono pt-2 border-t border-slate-800">
                              {equippedInSlot.stats?.atk !== undefined && (
                                <span className="text-slate-300">⚔️ ATK: <strong className="text-rose-400">+{equippedInSlot.stats.atk}</strong></span>
                              )}
                              {equippedInSlot.stats?.def !== undefined && (
                                <span className="text-slate-300">🛡️ DEF: <strong className="text-blue-400">+{equippedInSlot.stats.def}</strong></span>
                              )}
                              {equippedInSlot.stats?.hp !== undefined && (
                                <span className="text-slate-300">❤️ HP: <strong className="text-emerald-400">+{equippedInSlot.stats.hp}</strong></span>
                              )}
                              {equippedInSlot.stats?.mp !== undefined && (
                                <span className="text-slate-300">✨ MP: <strong className="text-purple-400">+{equippedInSlot.stats.mp}</strong></span>
                              )}
                              {equippedInSlot.stats?.spd !== undefined && (
                                <span className="text-slate-300">⚡ SPD: <strong className="text-amber-400">+{equippedInSlot.stats.spd}</strong></span>
                              )}
                              {equippedInSlot.stats?.crit !== undefined && (
                                <span className="text-slate-300">🎯 CRIT: <strong className="text-yellow-400">+{equippedInSlot.stats.crit}%</strong></span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="py-6 text-center">
                            <span className="text-xs text-slate-500 font-mono">（未装着）</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Card: 選択中アイテム (Selected Candidate) */}
                    <div className={`p-3.5 rounded-2xl border flex flex-col justify-between ${
                      isAlreadyEquipped
                        ? 'bg-gradient-to-b from-amber-950/40 to-[#121218] border-amber-500/70 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                        : 'bg-gradient-to-b from-[#181a24] to-[#121218] border-amber-500/60 shadow-lg'
                    }`}>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                            ✨ 選択中アイテム
                          </span>
                          {isAlreadyEquipped ? (
                            <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-600/80 flex items-center gap-1">
                              <Check className="w-2.5 h-2.5" /> 装備中
                            </span>
                          ) : (
                            <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-600/60">
                              換装候補
                            </span>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${getRarityBadgeStyle(item.rarity)}`}>
                              {item.type === 'weapon' ? <Sword className="w-5 h-5 text-red-400" /> :
                               item.type === 'armor' ? <Shield className="w-5 h-5 text-blue-400" /> :
                               <Sparkles className="w-5 h-5 text-purple-400" />}
                            </div>
                            <div className="min-w-0">
                              <span className="text-[10px] font-mono font-bold uppercase block text-amber-400">
                                [{item.rarity.toUpperCase()}]
                              </span>
                              <h4 className="text-xs font-bold text-amber-200 truncate">{item.name}</h4>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-1 text-[11px] font-mono pt-2 border-t border-slate-800">
                            {item.stats?.atk !== undefined && (
                              <span className="text-slate-300">⚔️ ATK: <strong className="text-rose-400">+{item.stats.atk}</strong></span>
                            )}
                            {item.stats?.def !== undefined && (
                              <span className="text-slate-300">🛡️ DEF: <strong className="text-blue-400">+{item.stats.def}</strong></span>
                            )}
                            {item.stats?.hp !== undefined && (
                              <span className="text-slate-300">❤️ HP: <strong className="text-emerald-400">+{item.stats.hp}</strong></span>
                            )}
                            {item.stats?.mp !== undefined && (
                              <span className="text-slate-300">✨ MP: <strong className="text-purple-400">+{item.stats.mp}</strong></span>
                            )}
                            {item.stats?.spd !== undefined && (
                              <span className="text-slate-300">⚡ SPD: <strong className="text-amber-400">+{item.stats.spd}</strong></span>
                            )}
                            {item.stats?.crit !== undefined && (
                              <span className="text-slate-300">🎯 CRIT: <strong className="text-yellow-400">+{item.stats.crit}%</strong></span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Overall Stat Changes & Combat Power Preview */}
                  <div className="bg-[#101117] p-3.5 rounded-2xl border border-[#272835] mb-4 space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2">
                      <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                        <ArrowUpDown className="w-3.5 h-3.5 text-amber-400" />
                        <span>総合ステータス増減比較</span>
                      </span>

                      {/* Combat Power Diff Badge */}
                      <div className="flex items-center gap-1 text-xs font-mono font-extrabold bg-slate-900/90 border border-amber-500/40 px-2.5 py-1 rounded-xl">
                        <span className="text-amber-400">🔥 戦闘力:</span>
                        <span className="text-slate-300">{currentCP.toLocaleString()}</span>
                        <span className="text-slate-500 text-[10px]">➔</span>
                        <span className={cpDiff > 0 ? 'text-emerald-400 font-extrabold' : cpDiff < 0 ? 'text-rose-400 font-extrabold' : 'text-slate-200'}>
                          {simCP.toLocaleString()}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                          cpDiff > 0 ? 'bg-emerald-950 text-emerald-300 border border-emerald-600' :
                          cpDiff < 0 ? 'bg-rose-950 text-rose-300 border border-rose-600' :
                          'bg-slate-800 text-slate-400'
                        }`}>
                          {cpDiff > 0 ? `+${cpDiff} ▲` : cpDiff < 0 ? `${cpDiff} ▼` : '±0'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs font-mono">
                      {comparisonStats.map(s => (
                        <div
                          key={s.key}
                          className={`px-3 py-1.5 rounded-xl border flex items-center justify-between transition-all ${
                            s.diff > 0 ? 'bg-emerald-950/30 border-emerald-600/40 text-emerald-200' :
                            s.diff < 0 ? 'bg-rose-950/30 border-rose-600/40 text-rose-200' :
                            'bg-slate-900/40 border-slate-800 text-slate-400'
                          }`}
                        >
                          <span className="font-bold text-slate-300">{s.label}</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-400 text-xs">{s.curTotal}{s.unit}</span>
                            <span className="text-slate-600 text-[9px]">➔</span>
                            <span className={`font-bold ${s.diff > 0 ? 'text-emerald-400' : s.diff < 0 ? 'text-rose-400' : 'text-slate-300'}`}>
                              {s.simTotal}{s.unit}
                            </span>
                            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded border ${
                              s.diff > 0 ? 'bg-emerald-900/90 text-emerald-300 border-emerald-500/80' :
                              s.diff < 0 ? 'bg-rose-900/90 text-rose-300 border-rose-500/80' :
                              'bg-slate-800 text-slate-500 border-slate-700'
                            }`}>
                              {s.diff > 0 ? `+${s.diff}${s.unit} ▲` : s.diff < 0 ? `${s.diff}${s.unit} ▼` : '±0'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* Non-Equippable Items (Potions / Scrolls) */
                <div className="space-y-4 mb-4">
                  <div className="flex items-center gap-4 p-3.5 bg-black/40 rounded-2xl border border-white/10">
                    <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-white/20 flex items-center justify-center shrink-0 shadow-lg">
                      <Zap className="w-7 h-7 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white tracking-wide">{item.name}</h3>
                      <span className="text-xs font-mono text-emerald-400 font-bold block mt-0.5">
                        {item.type === 'potion' ? '🧪 消耗ポーション' : '📜 秘伝書 / 魔導書'}
                      </span>
                    </div>
                  </div>

                  {item.effect && (
                    <div className="p-3 bg-emerald-950/30 rounded-xl border border-emerald-800/50 text-emerald-300 font-bold flex items-center justify-between text-xs">
                      <span>🧪 使用効果:</span>
                      <span className="font-mono text-sm">
                        {item.effect.type === 'healHp' ? `HP ${item.effect.value} 回復` :
                         item.effect.type === 'healMp' ? `MP ${item.effect.value} 回復` :
                         `ステータス +${item.effect.value} 恒久強化`}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Description */}
              <div className="bg-black/40 p-3.5 rounded-xl border border-white/5 text-xs text-slate-300 leading-relaxed mb-5">
                {item.desc}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                {!isAlreadyEquipped && isEquippable && (
                  <button
                    onClick={() => handleEquipItemDirectly(item, selectedItemDetail.invIndex)}
                    className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-950/50 flex items-center justify-center gap-2 transition transform hover:scale-102 cursor-pointer"
                  >
                    <Sword className="w-4 h-4 fill-current" />
                    <span>この装備に換装する（ステータス反映）</span>
                  </button>
                )}

                {isAlreadyEquipped && (
                  <button
                    onClick={() => handleUnequipItemDirectly(slotType)}
                    className="w-full py-3.5 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-black text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <Shield className="w-4 h-4" />
                    <span>装備を外してバッグに戻す</span>
                  </button>
                )}

                {(item.type === 'potion' || item.type === 'scroll') && (
                  <button
                    onClick={() => handleUseItemFromDetail(item, selectedItemDetail.invIndex)}
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
        );
      })()}

      {/* Synthesizing Alchemy Animation Modal Overlay */}
      {isSynthesizing && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-lg z-50 flex items-center justify-center p-4 animate-backdropFadeIn">
          <div className="bg-[#0f0b18] border-2 border-purple-500 max-w-sm w-full rounded-3xl p-8 text-center shadow-[0_0_60px_rgba(168,85,247,0.4)] relative overflow-hidden animate-modalExpand">
            <div className="w-20 h-20 rounded-full bg-purple-950/80 border-2 border-purple-400 mx-auto flex items-center justify-center text-purple-300 mb-4 animate-spin-slow shadow-lg">
              <Sparkles className="w-10 h-10 animate-pulse text-amber-400" />
            </div>
            <h3 className="text-xl font-black text-white tracking-wider mb-2">錬成中...</h3>
            <p className="text-xs font-mono text-purple-300 leading-relaxed">
              素材の魔力を錬金釜に注入中...<br />
              新たな高ランク物質が誕生します！
            </p>
          </div>
        </div>
      )}

      {/* Synthesized Result Reveal Modal Overlay */}
      {synthesizedResultItem && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-4 animate-backdropFadeIn">
          <div className={`bg-[#0c0d12] border-2 max-w-md w-full rounded-3xl p-6 shadow-[0_0_60px_rgba(245,158,11,0.4)] text-slate-100 relative text-center animate-modalExpand ${getRarityBadgeStyle(synthesizedResultItem.rarity)}`}>
            
            <div className="inline-block text-[10px] font-mono font-black uppercase px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/60 mb-3 animate-bounce">
              ✨ ALCHEMY SYNTHESIS SUCCESS! ✨
            </div>

            <h3 className="text-2xl font-black text-white mb-4">錬成成功！</h3>

            {/* Generated Item Card */}
            <div className="p-4 bg-slate-950/90 rounded-2xl border border-white/20 mb-4 shadow-inner text-left">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 ${getRarityBadgeStyle(synthesizedResultItem.rarity)}`}>
                  {synthesizedResultItem.type === 'weapon' ? <Sword className="w-6 h-6 text-red-400" /> :
                   synthesizedResultItem.type === 'armor' ? <Shield className="w-6 h-6 text-blue-400" /> :
                   synthesizedResultItem.type === 'accessory' ? <Sparkles className="w-6 h-6 text-purple-400" /> :
                   <Zap className="w-6 h-6 text-emerald-400" />}
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-amber-400 block">
                    [{synthesizedResultItem.rarity.toUpperCase()}]
                  </span>
                  <h4 className="text-base font-black text-white">{synthesizedResultItem.name}</h4>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                {synthesizedResultItem.desc}
              </p>

              {/* Stats */}
              {synthesizedResultItem.stats && (
                <div className="grid grid-cols-2 gap-1.5 text-xs font-mono pt-2 border-t border-slate-800">
                  {synthesizedResultItem.stats.atk !== undefined && <span className="text-rose-400 font-bold">⚔️ ATK: +{synthesizedResultItem.stats.atk}</span>}
                  {synthesizedResultItem.stats.def !== undefined && <span className="text-blue-400 font-bold">🛡️ DEF: +{synthesizedResultItem.stats.def}</span>}
                  {synthesizedResultItem.stats.hp !== undefined && <span className="text-emerald-400 font-bold">❤️ HP: +{synthesizedResultItem.stats.hp}</span>}
                  {synthesizedResultItem.stats.mp !== undefined && <span className="text-purple-400 font-bold">✨ MP: +{synthesizedResultItem.stats.mp}</span>}
                  {synthesizedResultItem.stats.spd !== undefined && <span className="text-amber-400 font-bold">⚡ SPD: +{synthesizedResultItem.stats.spd}</span>}
                  {synthesizedResultItem.stats.crit !== undefined && <span className="text-yellow-400 font-bold">🎯 CRIT: +{synthesizedResultItem.stats.crit}%</span>}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              {(synthesizedResultItem.type === 'weapon' || synthesizedResultItem.type === 'armor' || synthesizedResultItem.type === 'accessory') && (
                <button
                  onClick={() => {
                    const newItem = synthesizedResultItem;
                    setSynthesizedResultItem(null);
                    setSelectedItemDetail({
                      item: newItem,
                      isEquipped: false,
                      invIndex: character.inventory.length - 1
                    });
                  }}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition hover:scale-102"
                >
                  <Sword className="w-4 h-4 fill-current" />
                  <span>この装備と比較・換装する</span>
                </button>
              )}

              <button
                onClick={() => setSynthesizedResultItem(null)}
                className="w-full py-3 bg-[#181820] hover:bg-[#252530] border border-[#3a3528] text-slate-300 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                バッグに保管して錬金工房へ戻る
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
