import React, { useState, useEffect, useRef } from 'react';
import { CharacterState, Enemy, Spell, Item } from '../types';
import { Swords, Wand2, Shield, Backpack, Zap, Flame, Snowflake, Skull, Sparkles, Trophy, Coins, Hourglass, ChevronRight, User, ShieldAlert, FlameKindling, Waves, ArrowDown, Maximize2, Minimize2, Terminal, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getTitleBonuses, TITLES } from '../utils/titleUtils';
import { checkAndUnlockLevelUpSpells, getSpellElementInfo, getComboMultiplier, ElementInfo } from '../utils/spellUtils';
import { getSkillStatsBonus } from '../utils/skillUtils';

export interface BattleLogEntry {
  id: string;
  turn: number;
  time: string;
  category: 'attack' | 'magic' | 'dodge' | 'item' | 'defend' | 'status' | 'system';
  title: string;
  detail?: string;
  isCrit?: boolean;
  isDodge?: boolean;
  isPlayerAction?: boolean;
}

interface BattleScreenProps {
  character: CharacterState;
  enemy: Enemy;
  onVictory: (updatedChar: CharacterState, goldEarned: number, expEarned: number, isPhoenixVictory: boolean) => void;
  onDefeat: () => void;
  onOpenInventory: () => void;
}

export const BattleScreen: React.FC<BattleScreenProps> = ({
  character,
  enemy,
  onVictory,
  onDefeat,
  onOpenInventory,
}) => {
  const [charHp, setCharHp] = useState(character.hp);
  const [charMp, setCharMp] = useState(character.mp);
  const [enemyHp, setEnemyHp] = useState(enemy.hp);
  const [enemyMaxHp] = useState(enemy.maxHp);
  const [isDefending, setIsDefending] = useState(false);
  const [turnCount, setTurnCount] = useState(1);
  const [isPlayerTurn, setIsPlayerTurn] = useState(character.spd >= enemy.spd);
  const [enemyStatus, setEnemyStatus] = useState<{ type: string; duration: number } | null>(
    enemy.status || null
  );
  const [isBattleOver, setIsBattleOver] = useState(false);
  const [victoryRewards, setVictoryRewards] = useState<{ gold: number; exp: number } | null>(null);
  const [showSpellMenu, setShowSpellMenu] = useState(false);
  const [showItemMenu, setShowItemMenu] = useState(false);

  // --- LOG CONSOLE STATES ---
  const logContainerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const [logCategoryFilter, setLogCategoryFilter] = useState<'all' | 'attack' | 'magic' | 'dodge' | 'item' | 'status'>('all');
  const [isLogExpanded, setIsLogExpanded] = useState<boolean>(false);

  const [battleLogs, setBattleLogs] = useState<BattleLogEntry[]>(() => [
    {
      id: `init-${Date.now()}`,
      turn: 1,
      time: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      category: 'system',
      title: `⚔️ 【ダンジョン遭遇】 ${enemy.name}（Lv.${enemy.level}）が現れた！ 戦闘開始！`,
      detail: `敵情報 ➔ 初期HP: ${enemy.hp} | 攻撃力: ${enemy.atk} | 防御力: ${enemy.def} | 素早さ: ${enemy.spd}`,
    },
  ]);

  const addLogEntry = (
    title: string,
    category: BattleLogEntry['category'] = 'system',
    detail?: string,
    isCrit?: boolean,
    isDodge?: boolean,
    isPlayerAction?: boolean
  ) => {
    const time = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const entry: BattleLogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      turn: turnCount,
      time,
      category,
      title,
      detail,
      isCrit,
      isDodge,
      isPlayerAction,
    };
    setBattleLogs((prev) => [...prev, entry]);
  };

  const addLog = (msg: string) => {
    addLogEntry(msg, 'system');
  };

  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTo({
        top: logContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [battleLogs, autoScroll]);

  // --- BUZZ & DOPAMINE FEATURES ---
  const [aetherGauge, setAetherGauge] = useState(20); // Starts slightly filled for dynamic pace
  const [isAetherBurstActive, setIsAetherBurstActive] = useState(false);
  const [burstTurnsLeft, setBurstTurnsLeft] = useState(0);
  const [screenShake, setScreenShake] = useState(false);
  const [flashEffect, setFlashEffect] = useState<'critical' | 'burst' | 'heal' | 'hit' | 'fire' | 'ice' | 'lightning' | 'wind' | 'holy' | 'dark' | null>(null);
  
  // --- ELEMENTAL COMBO MECHANISM ---
  const [lastSpellElement, setLastSpellElement] = useState<string | null>(null);
  const [elementComboCount, setElementComboCount] = useState<number>(0);

  const [currentSpells, setCurrentSpells] = useState<Spell[]>(() => {
    return character.spells.map(s => ({
      ...s,
      masteryLevel: s.masteryLevel ?? 1,
      masteryExp: s.masteryExp ?? 0,
      masteryMaxExp: s.masteryMaxExp ?? 3,
    }));
  });
  const [masteryLevelUpEvent, setMasteryLevelUpEvent] = useState<{
    spellName: string;
    prevLevel: number;
    newLevel: number;
    powerBonus: number;
  } | null>(null);
  const [damagePopup, setDamagePopup] = useState<{ 
    amount: number; 
    isCrit: boolean; 
    isBurst: boolean; 
    isHeal?: boolean; 
    spellMastery?: number;
    comboInfo?: { icon: string; count: number; mult: number; name: string };
  } | null>(null);

  // Achievements tracking during this combat
  const [maxDamageThisBattle, setMaxDamageThisBattle] = useState(0);
  const [potionsUsedThisBattle, setPotionsUsedThisBattle] = useState(0);

  // Load Title and Skill Tree Stats
  const titleBonus = getTitleBonuses(character.title);
  const skillBonus = getSkillStatsBonus(character);
  const totalMaxHp = character.maxHp + titleBonus.hp + skillBonus.hp;
  const totalMaxMp = character.mpCost ? character.maxMp : character.maxMp + titleBonus.mp + skillBonus.mp;
  
  const characterAtk = character.atk + (character.equipment.weapon?.stats?.atk || 0) + titleBonus.atk + skillBonus.atk;
  const characterDef = character.def + (character.equipment.armor?.stats?.def || 0) + titleBonus.def + skillBonus.def;
  const characterCrit = character.crit + titleBonus.crit + skillBonus.crit;

  const currentActiveElementInfo = lastSpellElement 
    ? getSpellElementInfo({ id: '', name: '', mpCost: 0, power: 0, desc: '', effectType: 'damage', element: lastSpellElement as any })
    : null;

  const triggerScreenShake = () => {
    setScreenShake(true);
    setTimeout(() => setScreenShake(false), 300);
  };

  const triggerFlash = (type: 'critical' | 'burst' | 'heal' | 'hit' | 'fire' | 'ice' | 'lightning' | 'wind' | 'holy' | 'dark') => {
    setFlashEffect(type);
    setTimeout(() => setFlashEffect(null), 250);
  };

  const showDamageIndicator = (
    amount: number, 
    isCrit: boolean, 
    isBurst: boolean, 
    isHeal: boolean = false, 
    spellMastery: number = 1,
    comboInfo?: { icon: string; count: number; mult: number; name: string }
  ) => {
    setDamagePopup({ amount, isCrit, isBurst, isHeal, spellMastery, comboInfo });
    if (!isHeal && amount > maxDamageThisBattle) {
      setMaxDamageThisBattle(amount);
    }
    setTimeout(() => setDamagePopup(null), 1100);
  };

  const incrementSpellMastery = (spellId: string) => {
    let leveledUp = false;
    let prevLvl = 1;
    let nextLvl = 1;
    let powerBonus = 0;
    let updatedSpellName = '';

    const updatedSpells = currentSpells.map((s) => {
      if (s.id === spellId) {
        prevLvl = s.masteryLevel ?? 1;
        const currentExp = (s.masteryExp ?? 0) + 1;
        const maxExp = s.masteryMaxExp ?? 3;

        if (currentExp >= maxExp) {
          nextLvl = prevLvl + 1;
          const nextMaxExp = nextLvl * 3; // e.g. Lv.2 needs 6, Lv.3 needs 9...
          leveledUp = true;
          const nextPower = Math.floor(s.power * 1.25);
          powerBonus = nextPower - s.power;
          
          return {
            ...s,
            masteryLevel: nextLvl,
            masteryExp: 0,
            masteryMaxExp: nextMaxExp,
            power: nextPower,
          };
        } else {
          return {
            ...s,
            masteryExp: currentExp,
          };
        }
      }
      return s;
    });

    setCurrentSpells(updatedSpells);

    if (leveledUp) {
      const targetSpell = updatedSpells.find(s => s.id === spellId);
      updatedSpellName = targetSpell?.name || '';
      
      setMasteryLevelUpEvent({
        spellName: updatedSpellName,
        prevLevel: prevLvl,
        newLevel: nextLvl,
        powerBonus,
      });
      
      addLogEntry(`✨ 【魔法覚醒】『${updatedSpellName}』の習熟度が Lv.${nextLvl} に到達！威力が大幅上昇！`, 'magic', `基本威力 +${powerBonus} (威力25%アップ) | 次レベル目標: ${nextLvl * 3}回`, false, false, true);
      triggerFlash('burst');
      triggerScreenShake();
    } else {
      const targetSpell = updatedSpells.find(s => s.id === spellId);
      if (targetSpell) {
        addLogEntry(`🔮 『${targetSpell.name}』の習熟度を獲得 (${targetSpell.masteryExp}/${targetSpell.masteryMaxExp}回)`, 'magic', undefined, false, false, true);
      }
    }
  };

  // Execute Enemy Turn
  const executeEnemyTurn = (currentHp: number, currentMp: number, currentEnemyHp: number) => {
    if (currentEnemyHp <= 0) return;

    // Check enemy status ailments (burn, poison)
    let hpAfterStatus = currentEnemyHp;
    if (enemyStatus) {
      if (enemyStatus.type === 'burn' || enemyStatus.type === 'poison') {
        const dotDamage = Math.floor(enemyMaxHp * 0.08);
        hpAfterStatus = Math.max(0, currentEnemyHp - dotDamage);
        addLogEntry(
          `🔥 【状態異常ダメージ】 ${enemy.name} は${enemyStatus.type === 'burn' ? '火傷' : '毒'}の継続ダメージにより ${dotDamage} HPを失った！`,
          'status',
          `残り持続: ${enemyStatus.duration - 1}T | 最大HP比 8% ダメージ`,
          false,
          false,
          false
        );
        if (hpAfterStatus <= 0) {
          handleVictory(hpAfterStatus, currentHp, currentMp);
          return;
        }
      }
      if (enemyStatus.type === 'freeze' || enemyStatus.type === 'paralyze') {
        addLogEntry(
          `❄️ 【行動不能】 ${enemy.name} は${enemyStatus.type === 'freeze' ? '凍結' : '麻痺'}で動けない！ 攻撃ターンを消化！`,
          'status',
          `行動不能状態 (残り ${enemyStatus.duration - 1} ターン)`,
          false,
          false,
          false
        );
        setEnemyStatus((prev) => (prev && prev.duration > 1 ? { ...prev, duration: prev.duration - 1 } : null));
        setIsPlayerTurn(true);
        setEnemyHp(hpAfterStatus);
        setTurnCount(prev => prev + 1);
        return;
      }
    }

    // Player Dodge Chance Calculation
    const playerDodgeChance = Math.min(35, Math.max(5, Math.floor((character.spd - enemy.spd) * 0.8 + 10)));
    const isPlayerDodge = Math.random() * 100 < playerDodgeChance;

    if (isPlayerDodge) {
      addLogEntry(
        `💨 【完全回避 / DODGE!】 ${character.name} は敏捷さ(SPD ${character.spd})を生かして ${enemy.name} の攻撃を身軽に回避した！`,
        'dodge',
        `回避判定: 成功 (確率 ${playerDodgeChance}% | 自SPD ${character.spd} vs 敵SPD ${enemy.spd}) | 被被害: 0`,
        false,
        true,
        true
      );
      triggerFlash('wind');
      setAetherGauge(prev => Math.min(100, prev + 10));
      setIsDefending(false);
      setTurnCount(prev => prev + 1);
      if (isAetherBurstActive) {
        if (burstTurnsLeft <= 1) {
          setIsAetherBurstActive(false);
          setBurstTurnsLeft(0);
          addLogEntry('【次元終了】エーテルバーストの効果が切れた。', 'system');
        } else {
          setBurstTurnsLeft(prev => prev - 1);
        }
      }
      setIsPlayerTurn(true);
      setEnemyHp(hpAfterStatus);
      return;
    }

    // Enemy attack calculation
    let rawDmg = Math.max(5, enemy.atk - Math.floor(characterDef * (isDefending ? 1.8 : 0.8)));
    const isCrit = Math.random() < 0.12;
    if (isCrit) rawDmg = Math.floor(rawDmg * 1.5);

    const finalDmg = Math.max(3, rawDmg);
    const newCharHp = Math.max(0, currentHp - finalDmg);

    addLogEntry(
      `💥 ${enemy.name} の攻撃！ ➔ ${character.name} に ${finalDmg} の物理ダメージ！${isCrit ? ' 【痛恨の一撃！】' : ''}`,
      'attack',
      `(敵攻撃: ${enemy.atk} - 自防御: ${Math.floor(characterDef * (isDefending ? 1.8 : 0.8))}${isDefending ? ' [防御姿勢 -50%]' : ''}${isCrit ? ' | 会心: 1.5x' : ''})`,
      isCrit,
      false,
      false
    );

    if (isCrit) {
      triggerScreenShake();
      triggerFlash('critical');
    } else {
      triggerFlash('hit');
    }

    // Gain Aether Gauge when taking damage
    setAetherGauge(prev => Math.min(100, prev + 25));

    setCharHp(newCharHp);
    setIsDefending(false);

    if (newCharHp <= 0) {
      setIsBattleOver(true);
      addLogEntry(`💀 【敗北】 ${character.name} は力尽きて倒れてしまった……。`, 'system');
      setTimeout(() => onDefeat(), 2000);
      return;
    }

    // Turn transition
    setTurnCount(prev => prev + 1);

    // Handle Burst reduction
    if (isAetherBurstActive) {
      if (burstTurnsLeft <= 1) {
        setIsAetherBurstActive(false);
        setBurstTurnsLeft(0);
        addLogEntry('【次元終了】エーテルバーストの効果が切れた。', 'system');
      } else {
        setBurstTurnsLeft(prev => prev - 1);
      }
    }

    setIsPlayerTurn(true);
    setEnemyHp(hpAfterStatus);
  };

  // Player Normal Attack / Aether Nova
  const handleAttack = () => {
    if (!isPlayerTurn || isBattleOver) return;

    // Normal physical attack breaks magic elemental combo
    setLastSpellElement(null);
    setElementComboCount(0);

    // Enemy Dodge check
    const enemyDodgeChance = isAetherBurstActive ? 0 : Math.min(25, Math.max(3, Math.floor((enemy.spd - character.spd) * 0.6 + 5)));
    const isEnemyDodge = Math.random() * 100 < enemyDodgeChance;

    if (isEnemyDodge) {
      addLogEntry(
        `💨 【回避 / MISS】 ${enemy.name} は敏捷な身のこなしで ${character.name} の攻撃を回避した！`,
        'dodge',
        `回避判定: 敵成功 (敵SPD ${enemy.spd} vs 自SPD ${character.spd}) | 与被害: 0`,
        false,
        true,
        false
      );
      showDamageIndicator(0, false, false);
      setIsPlayerTurn(false);
      if (!isAetherBurstActive) {
        setAetherGauge(prev => Math.min(100, prev + 5));
      }
      setTimeout(() => executeEnemyTurn(charHp, charMp, enemyHp), 600);
      return;
    }

    // Aether Burst active multipliers
    const dmgMultiplier = isAetherBurstActive ? 3.5 : 1.0;
    const critBonus = isAetherBurstActive ? 50 : 0;

    let rawDmg = Math.max(8, characterAtk - Math.floor(enemy.def / 2));
    const finalCrit = characterCrit + critBonus;
    const isCrit = Math.random() < finalCrit / 100;
    
    // Crit multiplier
    const mult = character.race.id === 'demon' && isCrit ? 2.6 : isCrit ? 2.0 : 1.0;
    let finalDmg = Math.floor(rawDmg * mult * dmgMultiplier);

    // Inject variance for RPG feel
    finalDmg = Math.floor(finalDmg * (0.9 + Math.random() * 0.2));

    const newEnemyHp = Math.max(0, enemyHp - finalDmg);
    
    if (isAetherBurstActive) {
      addLogEntry(
        `💥 【神撃エーテルノヴァ】 覚醒の一撃が炸裂！ ➔ ${enemy.name} に ${finalDmg} の次元崩壊ダメージ！！！`,
        'attack',
        `(基本攻撃 ${characterAtk} - 敵Def ${Math.floor(enemy.def / 2)} | 覚醒倍率: 3.5x${isCrit ? ' | 会心: ' + mult + 'x' : ''})`,
        isCrit,
        false,
        true
      );
      triggerScreenShake();
      triggerFlash('burst');
    } else {
      addLogEntry(
        `⚔️ ${character.name} の通常攻撃！ ➔ ${enemy.name} に ${finalDmg} の物理ダメージ！${isCrit ? ' 【会心の一撃！】' : ''}`,
        'attack',
        `(攻撃力 ${characterAtk} - 敵Def ${Math.floor(enemy.def / 2)}${isCrit ? ' | 会心倍率: ' + mult + 'x' : ''})`,
        isCrit,
        false,
        true
      );
      if (isCrit) {
        triggerScreenShake();
        triggerFlash('critical');
      } else {
        triggerFlash('hit');
      }
    }

    showDamageIndicator(finalDmg, isCrit, isAetherBurstActive);
    setEnemyHp(newEnemyHp);
    setIsPlayerTurn(false);

    // Gain Aether Gauge on attacking
    if (!isAetherBurstActive) {
      setAetherGauge(prev => Math.min(100, prev + 20));
    }

    if (newEnemyHp <= 0) {
      handleVictory(newEnemyHp, charHp, charMp);
      return;
    }

    setTimeout(() => executeEnemyTurn(charHp, charMp, newEnemyHp), 600);
  };

  // Player Activate Aether Burst
  const handleActivateBurst = () => {
    if (aetherGauge < 100 || isAetherBurstActive || isBattleOver) return;
    setAetherGauge(0);
    setIsAetherBurstActive(true);
    setBurstTurnsLeft(3);
    triggerScreenShake();
    addLogEntry('🔥 【次元覚醒 / AETHER BURST】 発動！ エーテル共鳴率 100% 突破！', 'system', '全物理・魔法攻撃力 3.5倍 ＆ 会心率 +50% （持続: 3ターン）');
  };

  // Player Cast Spell
  const handleCastSpell = (rawSpell: Spell) => {
    if (!isPlayerTurn || isBattleOver) return;
    
    // Find the stateful spell inside our stateful currentSpells to get its master-boosted power!
    const spell = currentSpells.find(s => s.id === rawSpell.id) || rawSpell;
    const mLevel = spell.masteryLevel ?? 1;

    if (charMp < spell.mpCost) {
      addLogEntry('MPが不足しているため詠唱できません！', 'system');
      return;
    }

    const newMp = charMp - spell.mpCost;
    setCharMp(newMp);
    setShowSpellMenu(false);

    // Derive spell element info & calculate combo multiplier
    const elemInfo = getSpellElementInfo(spell);
    
    let newComboCount = 1;
    if (lastSpellElement === elemInfo.id) {
      newComboCount = elementComboCount + 1;
    }
    setLastSpellElement(elemInfo.id);
    setElementComboCount(newComboCount);

    const comboMult = getComboMultiplier(newComboCount);

    // Burst logic applies partially to magic
    const burstMultiplier = isAetherBurstActive ? 2.2 : 1.0;
    const totalSpellMult = burstMultiplier * comboMult;

    // Trigger mastery experience gain
    setTimeout(() => {
      incrementSpellMastery(spell.id);
    }, 500);

    const comboInfoObj = newComboCount >= 2 ? {
      icon: elemInfo.icon,
      count: newComboCount,
      mult: comboMult,
      name: elemInfo.elementName,
    } : undefined;

    if (spell.effectType === 'heal') {
      const healAmount = Math.floor((totalMaxHp * (spell.power / 100) + 20) * totalSpellMult);
      const newHp = Math.min(totalMaxHp, charHp + healAmount);
      setCharHp(newHp);
      
      addLogEntry(
        `💚 ${character.name} は『${spell.name}』を唱えた！ HPが ${healAmount} 回復！${newComboCount >= 2 ? ' 【' + elemInfo.elementName + 'コンボ x' + newComboCount + '】' : ''}`,
        'magic',
        `(基本回復: ${spell.power}% | 消費MP: ${spell.mpCost}${newComboCount >= 2 ? ' | コンボ倍率: ' + comboMult.toFixed(2) + 'x' : ''})`,
        false,
        false,
        true
      );

      showDamageIndicator(healAmount, false, false, true, mLevel, comboInfoObj);
      triggerFlash('heal');
      setIsPlayerTurn(false);
      setTimeout(() => executeEnemyTurn(newHp, newMp, enemyHp), 600);
      return;
    }

    if (spell.effectType === 'drain') {
      const spellDmg = Math.floor(spell.power * 1.2 * totalSpellMult);
      const newEnemyHp = Math.max(0, enemyHp - spellDmg);
      const healAmount = Math.floor(spellDmg * 0.5);
      const newHp = Math.min(totalMaxHp, charHp + healAmount);
      setCharHp(newHp);
      setEnemyHp(newEnemyHp);

      addLogEntry(
        `🔮 ${character.name} の『${spell.name}』！ ➔ ${enemy.name} に ${spellDmg} の吸血魔力打撃！ HPを ${healAmount} 吸収！`,
        'magic',
        `(基本威力: ${spell.power} | 習熟度: Lv.${mLevel} | 吸収率: 50% | 消費MP: ${spell.mpCost}${newComboCount >= 2 ? ' | コンボ: ' + comboMult.toFixed(2) + 'x' : ''})`,
        false,
        false,
        true
      );

      showDamageIndicator(spellDmg, false, isAetherBurstActive, false, mLevel, comboInfoObj);
      triggerScreenShake();
      triggerFlash(elemInfo.id as any);

      // Small secondary heal popup shortly after
      setTimeout(() => {
        showDamageIndicator(healAmount, false, false, true, mLevel);
        triggerFlash('heal');
      }, 400);

      if (newEnemyHp <= 0) {
        handleVictory(newEnemyHp, newHp, newMp);
        return;
      }
      setIsPlayerTurn(false);
      setTimeout(() => executeEnemyTurn(newHp, newMp, newEnemyHp), 1000);
      return;
    }

    // Damage spell
    let spellDmg = Math.floor(spell.power * (character.magicType.id === 'mage' ? 1.45 : 1.1) * totalSpellMult);
    if (character.race.id === 'elf') spellDmg = Math.floor(spellDmg * 1.15);

    // Variance
    spellDmg = Math.floor(spellDmg * (0.9 + Math.random() * 0.2));

    const newEnemyHp = Math.max(0, enemyHp - spellDmg);
    
    addLogEntry(
      `🔮 ${character.name} の『${spell.name}』！ ➔ ${enemy.name} に ${spellDmg} の${elemInfo.elementName}属性魔法ダメージ！${newComboCount >= 2 ? ' 【' + elemInfo.elementName + 'コンボ x' + newComboCount + ' (' + comboMult.toFixed(2) + '倍)】' : ''}`,
      'magic',
      `(基本威力: ${spell.power} | 習熟度 Lv.${mLevel} | 消費MP: ${spell.mpCost}${newComboCount >= 2 ? ' | コンボ倍率: ' + comboMult.toFixed(2) + 'x' : ''})`,
      false,
      false,
      true
    );

    showDamageIndicator(spellDmg, false, isAetherBurstActive, false, mLevel, comboInfoObj);
    triggerScreenShake();
    triggerFlash(elemInfo.id as any);

    if (spell.statusEffect && Math.random() < spell.statusEffect.chance) {
      const statusLabel = spell.statusEffect.type === 'burn' ? '火傷' : spell.statusEffect.type === 'freeze' ? '凍結' : spell.statusEffect.type === 'paralyze' ? '麻痺' : '毒';
      setEnemyStatus({ type: spell.statusEffect.type, duration: spell.statusEffect.duration });
      addLogEntry(
        `⚡ 状態異常誘発！ ${enemy.name} に【${statusLabel}】を付与した！`,
        'status',
        `持続: ${spell.statusEffect.duration}ターン | 付与確率: ${Math.round(spell.statusEffect.chance * 100)}%`
      );
    }

    setEnemyHp(newEnemyHp);

    if (!isAetherBurstActive) {
      setAetherGauge(prev => Math.min(100, prev + 15));
    }

    if (newEnemyHp <= 0) {
      handleVictory(newEnemyHp, charHp, newMp);
      return;
    }

    setIsPlayerTurn(false);
    setTimeout(() => executeEnemyTurn(charHp, newMp, newEnemyHp), 600);
  };

  // Use Item
  const handleUseItem = (item: Item, index: number) => {
    if (!isPlayerTurn || isBattleOver) return;

    const newInventory = [...character.inventory];
    newInventory.splice(index, 1);

    let newHp = charHp;
    let newMp = charMp;

    if (item.effect?.type === 'healHp') {
      newHp = Math.min(totalMaxHp, charHp + item.effect.value);
      setCharHp(newHp);
      addLogEntry(`🧪 ${item.name} を使用！ HPが ${item.effect.value} 回復！`, 'item', `回復後の状態 ➔ HP: ${newHp}/${totalMaxHp}`, false, false, true);
      showDamageIndicator(item.effect.value, false, false, true);
      triggerFlash('heal');
    } else if (item.effect?.type === 'healMp') {
      newMp = Math.min(totalMaxMp, charMp + item.effect.value);
      setCharMp(newMp);
      addLogEntry(`🧪 ${item.name} を使用！ MPが ${item.effect.value} 回復！`, 'item', `回復後の状態 ➔ MP: ${newMp}/${totalMaxMp}`, false, false, true);
      showDamageIndicator(item.effect.value, false, false, true);
      triggerFlash('heal');
    }

    setPotionsUsedThisBattle(prev => prev + 1);

    character.inventory = newInventory;
    setShowItemMenu(false);
    setIsPlayerTurn(false);
    setTimeout(() => executeEnemyTurn(newHp, newMp, enemyHp), 600);
  };

  // Defend
  const handleDefend = () => {
    if (!isPlayerTurn || isBattleOver) return;
    setIsDefending(true);
    setLastSpellElement(null);
    setElementComboCount(0);
    addLogEntry(`🛡️ ${character.name} は身構えて完全防御体制をとった！`, 'defend', '被ダメージ 50% 軽減 & 防御補正 1.8x 適用（次ターンまで持続）', false, false, true);
    setIsPlayerTurn(false);
    setTimeout(() => executeEnemyTurn(charHp, charMp, enemyHp), 600);
  };

  // Victory Handler
  const handleVictory = (finalEnemyHp: number, finalCharHp: number, finalCharMp: number) => {
    setIsBattleOver(true);
    let goldMultiplier = character.race.id === 'dwarf' ? 1.3 : 1.0;
    let expMultiplier = character.race.id === 'human' ? 1.2 : 1.0;

    const titleBonusVal = getTitleBonuses(character.title);
    goldMultiplier += titleBonusVal.goldMult || 0;

    const earnedGold = Math.floor(enemy.goldReward * goldMultiplier);
    const earnedExp = Math.floor(enemy.expReward * expMultiplier);

    setVictoryRewards({ gold: earnedGold, exp: earnedExp });
    addLogEntry(
      `👑 【討伐完了】 見事に ${enemy.name} を撃破した！ 獲得報酬: 金貨 ${earnedGold}G / EXP ${earnedExp}`,
      'system',
      `総与ダメージ: ${enemy.maxHp - finalEnemyHp} | ゴールドボーナス: ${goldMultiplier.toFixed(2)}x`
    );

    let newExp = character.exp + earnedExp;
    let newLevel = character.level;
    let newMaxExp = character.maxExp;
    let newMaxHp = character.maxHp;
    let newMaxMp = character.maxMp;
    let newAtk = character.atk;
    let newDef = character.def;
    let newSp = character.sp !== undefined ? character.sp : 0;

    if (newExp >= newMaxExp) {
      newLevel += 1;
      newExp -= newMaxExp;
      newMaxExp = Math.floor(newMaxExp * 1.3);
      newMaxHp += 20;
      newMaxMp += 15;
      newAtk += 5;
      newDef += 3;
      newSp += 2;
      addLogEntry(
        `✨ 【レベルアップ！】 レベルが ${newLevel} に到達！ 全能力強化＆スキルポイント+2！`,
        'system',
        'ステータス成長 ➔ HP +20 | MP +15 | ATK +5 | DEF +3 | SP +2'
      );
    }

    // Phoenix check (HP is <= 10% on victory)
    const hpRatio = finalCharHp / character.maxHp;
    const isPhoenix = hpRatio > 0 && hpRatio <= 0.1;

    let updatedChar: CharacterState = {
      ...character,
      spells: currentSpells, // <-- Save current spellbook with mastery progress
      hp: Math.min(newMaxHp, finalCharHp + 25), // Small post-battle recovery
      mp: Math.min(newMaxMp, finalCharMp + 15),
      maxHp: newMaxHp,
      maxMp: newMaxMp,
      atk: newAtk,
      def: newDef,
      level: newLevel,
      exp: newExp,
      maxExp: newMaxExp,
      sp: newSp,
      gold: character.gold + earnedGold,
      stats: {
        ...character.stats,
        battlesWon: character.stats.battlesWon + 1,
        damageDealt: character.stats.damageDealt + (enemy.maxHp - finalEnemyHp),
        itemsUsed: (character.stats.itemsUsed || 0) + potionsUsedThisBattle,
        highestDamage: Math.max(character.stats.highestDamage || 0, maxDamageThisBattle),
      },
    };

    // Auto-unlock standard high-tier elemental spells on level-up
    const { updatedChar: charWithSpells, unlockedSpells } = checkAndUnlockLevelUpSpells(updatedChar, newLevel);
    updatedChar = charWithSpells;

    if (unlockedSpells.length > 0) {
      unlockedSpells.forEach((spell) => {
        addLogEntry(`✨ 【新呪文修得】 レベル ${newLevel} 到達！ 元素共鳴により『${spell.name}』が解禁された！`, 'magic');
      });
    }

    setTimeout(() => {
      onVictory(updatedChar, earnedGold, earnedExp, isPhoenix);
    }, 1200);
  };

  const filteredLogs = React.useMemo(() => {
    if (logCategoryFilter === 'all') return battleLogs;
    return battleLogs.filter((log) => log.category === logCategoryFilter);
  }, [battleLogs, logCategoryFilter]);

  return (
    <div className={`max-w-3xl mx-auto p-4 md:p-6 text-slate-100 selection:bg-amber-500/30 ${screenShake ? 'animate-shake' : ''}`}>
      
      {/* Premium Cinematic Arena Container */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`border rounded-3xl p-6 mb-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden transition-all duration-700 ${
          isAetherBurstActive 
            ? 'bg-[#0f0e13] border-amber-500/80 shadow-[0_0_50px_rgba(245,158,11,0.25)]' 
            : enemy.isBoss
              ? 'bg-[#120a0d] border-rose-900/60 shadow-[0_0_40px_rgba(225,29,72,0.15)]'
              : 'bg-[#101014]/95 backdrop-blur-md border-[#232329]'
        }`}
      >
        
        {/* Flash effect overlay for absolute immersion */}
        {flashEffect && (
          <div className={`absolute inset-0 z-40 pointer-events-none transition-opacity duration-150 ${
            flashEffect === 'critical' 
              ? 'bg-amber-400/20' 
              : flashEffect === 'burst' 
                ? 'bg-red-500/25'
                : flashEffect === 'heal'
                  ? 'bg-emerald-500/15'
                  : flashEffect === 'fire'
                    ? 'bg-red-600/30'
                    : flashEffect === 'ice'
                      ? 'bg-cyan-400/30'
                      : flashEffect === 'lightning'
                        ? 'bg-amber-300/30'
                        : flashEffect === 'wind'
                          ? 'bg-emerald-400/30'
                          : flashEffect === 'holy'
                            ? 'bg-yellow-200/30'
                            : flashEffect === 'dark'
                              ? 'bg-purple-700/30'
                              : 'bg-white/10'
          }`} />
        )}

        {/* Dynamic ambient energy streams during dimensional awakening */}
        {isAetherBurstActive && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30 z-0">
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
                x: [-10, 10, -10]
              }}
              transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
              className="absolute top-[-50%] left-[-20%] w-[140%] h-[140%] bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.15)_0%,transparent_60%)]"
            />
            <div className="absolute top-0 left-1/4 w-32 h-64 bg-amber-500 blur-[90px] animate-pulse"></div>
            <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-purple-600 blur-[110px] animate-pulse"></div>
          </div>
        )}

        {/* Top Arena Header Status Info */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#232329]/50 relative z-10">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] uppercase tracking-[0.2em] font-black px-3 py-1 rounded-full border transition-all duration-300 ${
              isAetherBurstActive
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 border-white shadow-[0_0_15px_rgba(245,158,11,0.6)] animate-pulse'
                : enemy.isBoss 
                  ? 'bg-rose-950 text-rose-300 border-rose-800/80 shadow-[0_0_10px_rgba(225,29,72,0.2)]' 
                  : 'bg-slate-950 text-slate-400 border-[#232329]'
            }`}>
              {isAetherBurstActive ? '🔥 次元覚醒 AETHER ACTIVE' : enemy.isBoss ? '👑 LEGENDARY BOSS' : '⚔️ DUNGEON DUEL'}
            </span>
          </div>
          <div className="flex items-center gap-2.5 bg-slate-950/60 px-3 py-1 rounded-full border border-[#232329] text-[11px] text-slate-400 font-mono">
            <Hourglass className="w-3.5 h-3.5 text-[#c4a661]" />
            <span>TURN {turnCount}</span>
          </div>
        </div>

        {/* Interactive Floating Damage Popups */}
        <AnimatePresence>
          {damagePopup && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.2, y: 30, rotate: damagePopup.isCrit ? -12 : -4 }}
              animate={{ 
                opacity: [0, 1, 1, 0],
                scale: damagePopup.isCrit ? [0.2, 1.9, 1.6, 1.4] : [0.2, 1.25, 1.15, 0.9],
                y: [-30, -70, -100, -135],
                rotate: damagePopup.isCrit ? [-12, 12, 6, 8] : [-4, 4, 2, 3]
              }}
              transition={{ duration: 1.1, ease: "easeOut" }}
              className="absolute left-1/2 top-[42%] transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50 text-center"
            >
              {/* Expanding shockwave ring under critical or burst hits */}
              {(damagePopup.isCrit || damagePopup.isBurst) && (
                <motion.div 
                  initial={{ scale: 0.3, opacity: 0.8 }}
                  animate={{ scale: 2.2, opacity: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className={`absolute inset-0 rounded-full border-4 ${
                    damagePopup.isBurst ? 'border-purple-500/50' : 'border-amber-400/50'
                  } blur-sm -m-6 pointer-events-none`}
                />
              )}

              <div className={`font-black tracking-tighter select-none ${
                damagePopup.spellMastery && damagePopup.spellMastery >= 5
                  ? 'text-7xl sm:text-8xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 drop-shadow-[0_12px_30px_rgba(239,68,68,0.7)] animate-pulse'
                  : damagePopup.spellMastery && damagePopup.spellMastery >= 4
                    ? 'text-7xl sm:text-8xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 drop-shadow-[0_10px_25px_rgba(6,182,212,0.6)]'
                    : damagePopup.spellMastery && damagePopup.spellMastery >= 3
                      ? 'text-6xl sm:text-7xl text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 to-amber-500 drop-shadow-[0_8px_20px_rgba(245,158,11,0.5)]'
                      : damagePopup.isHeal
                        ? 'text-6xl sm:text-7xl text-transparent bg-clip-text bg-gradient-to-b from-emerald-300 to-green-500 drop-shadow-[0_4px_10px_rgba(16,185,129,0.5)]'
                        : damagePopup.isBurst 
                          ? 'text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-amber-400 to-yellow-300 animate-rainbow drop-shadow-[0_8px_20px_rgba(0,0,0,0.95)] text-6xl sm:text-7xl' 
                          : damagePopup.isCrit 
                            ? 'text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-amber-400 to-orange-500 drop-shadow-[0_10px_25px_rgba(245,158,11,0.6)] text-6xl sm:text-7xl' 
                            : 'text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-300 drop-shadow-[0_6px_15px_rgba(0,0,0,0.9)] text-6xl sm:text-7xl'
              }`}>
                {damagePopup.isHeal ? `+${damagePopup.amount}` : damagePopup.amount}
              </div>

              {damagePopup.spellMastery && damagePopup.spellMastery >= 5 && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-r from-purple-600 via-fuchsia-600 to-red-600 text-white font-extrabold text-[10px] tracking-[0.35em] px-4 py-1.5 rounded-full uppercase shadow-[0_6px_15px_rgba(219,39,119,0.5)] border border-pink-300 inline-block mt-2 font-mono whitespace-nowrap animate-pulse"
                >
                  🌌 絶・神髄極地 (TRANSCENDENT MAX) 🌌
                </motion.div>
              )}
              {damagePopup.spellMastery && damagePopup.spellMastery === 4 && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-extrabold text-[10px] tracking-[0.3em] px-3.5 py-1 rounded-full uppercase shadow-[0_4px_12px_rgba(6,182,212,0.4)] border border-cyan-300 inline-block mt-2 font-mono whitespace-nowrap"
                >
                  ⚡ 極・魔導境界 (ARCHMAGE IV) ⚡
                </motion.div>
              )}
              {damagePopup.spellMastery && damagePopup.spellMastery === 3 && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-extrabold text-[10px] tracking-[0.3em] px-3.5 py-1 rounded-full uppercase shadow-[0_4px_12px_rgba(245,158,11,0.4)] border border-yellow-200 inline-block mt-2 font-mono whitespace-nowrap"
                >
                  ✦ 真・解放形態 (LIMIT BREAKER III) ✦
                </motion.div>
              )}
              {damagePopup.spellMastery && damagePopup.spellMastery === 2 && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-[#1c1c24] text-purple-300 font-extrabold text-[9px] tracking-[0.25em] px-3 py-1 rounded-full uppercase border border-purple-800/60 inline-block mt-2 font-mono whitespace-nowrap"
                >
                  ✦ 覚醒一式 (AWAKENED II) ✦
                </motion.div>
              )}

              {damagePopup.comboInfo && damagePopup.comboInfo.count >= 2 && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.5, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 0.05, type: 'spring' }}
                  className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-slate-950 font-black text-[10px] tracking-[0.2em] px-3.5 py-1 rounded-full uppercase shadow-[0_4px_15px_rgba(245,158,11,0.5)] border border-yellow-300 inline-flex items-center gap-1.5 mt-2 font-mono whitespace-nowrap animate-bounce"
                >
                  <span>{damagePopup.comboInfo.icon}</span>
                  <span>{damagePopup.comboInfo.name} COMBO x{damagePopup.comboInfo.count} ({damagePopup.comboInfo.mult.toFixed(2)}x DMG)</span>
                </motion.div>
              )}
              {damagePopup.isCrit && (!damagePopup.spellMastery || damagePopup.spellMastery < 2) && !damagePopup.comboInfo && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.5, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 0.05, type: 'spring' }}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-extrabold text-[10px] tracking-[0.3em] px-3.5 py-1 rounded-full uppercase shadow-[0_4px_12px_rgba(245,158,11,0.4)] border border-yellow-300 inline-block mt-2 font-mono whitespace-nowrap"
                >
                  ★ CRITICAL IMPACT ★
                </motion.div>
              )}
              {damagePopup.isBurst && (!damagePopup.spellMastery || damagePopup.spellMastery < 2) && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.5, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 0.05, type: 'spring' }}
                  className="bg-gradient-to-r from-red-600 via-purple-600 to-indigo-600 text-white font-extrabold text-[10px] tracking-[0.3em] px-3.5 py-1 rounded-full uppercase shadow-[0_4px_12px_rgba(139,92,246,0.4)] border border-purple-300 inline-block mt-2 font-mono whitespace-nowrap"
                >
                  🌌 AETHER NOVA 🌌
                </motion.div>
              )}
              {damagePopup.isHeal && (!damagePopup.spellMastery || damagePopup.spellMastery < 2) && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.5, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 0.05, type: 'spring' }}
                  className="bg-gradient-to-r from-emerald-600 to-green-500 text-white font-extrabold text-[10px] tracking-[0.3em] px-3.5 py-1 rounded-full uppercase shadow-[0_4px_12px_rgba(16,185,129,0.3)] border border-emerald-300 inline-block mt-2 font-mono whitespace-nowrap"
                >
                  💚 LIFE RECOVERED 💚
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dual Arena Combatants Layout */}
        <div className="relative grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch mb-6 z-10">
          
          {/* Centered VS Shield Emblem */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex items-center justify-center z-20 pointer-events-none">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
              className="absolute w-14 h-14 rounded-full border border-dashed border-[#c4a661]/40 opacity-40"
            />
            <div className="w-10 h-10 rounded-full bg-slate-950 border-2 border-[#c4a661]/60 flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.8)]">
              <span className="text-xs font-black text-[#c4a661] tracking-wider font-mono">VS</span>
            </div>
          </div>

          {/* Left Wing: Player Card */}
          <motion.div 
            animate={isPlayerTurn && !isBattleOver ? { boxShadow: '0 0 25px rgba(196,166,97,0.15)' } : {}}
            className={`p-5 rounded-2xl border transition-all duration-500 ${
              isPlayerTurn && !isBattleOver
                ? 'bg-[#15151b] border-[#c4a661]/60' 
                : 'bg-slate-950/45 border-[#232329]/60'
            }`}
          >
            <div className="flex items-center gap-3.5 mb-4">
              {/* Styled Avatar Frame */}
              <div className="w-12 h-12 rounded-full bg-[#1b1b22] border border-[#c4a661]/40 flex items-center justify-center shadow-inner relative overflow-hidden shrink-0">
                <User className="w-6 h-6 text-[#c4a661]/80" />
                {isPlayerTurn && !isBattleOver && (
                  <span className="absolute inset-0 bg-[#c4a661]/10 animate-ping rounded-full pointer-events-none" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-base truncate">{character.name}</h3>
                  <span className="text-[10px] font-bold text-[#c4a661] bg-[#c4a661]/10 px-2 py-0.5 rounded border border-[#c4a661]/30 font-mono shrink-0">
                    Lv.{character.level}
                  </span>
                </div>
                {character.title && (
                  <span className="text-[10px] font-semibold text-amber-400 tracking-wider block mt-0.5 truncate">
                    【{TITLES.find(t => t.id === character.title)?.name}】
                  </span>
                )}
              </div>
            </div>

            {/* HP and MP Gauge Bars */}
            <div className="space-y-3.5 text-xs">
              <div>
                <div className="flex justify-between items-center mb-1 font-mono">
                  <span className="text-[#a09a8a] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]" />
                    HP
                  </span>
                  <span className="text-[#f3e5be] font-bold tracking-wide">{charHp} / {totalMaxHp}</span>
                </div>
                <div className="w-full bg-[#08080a] rounded-full h-3.5 overflow-hidden border border-[#2a2720] p-0.5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(0, (charHp / totalMaxHp) * 100)}%` }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className="bg-gradient-to-r from-[#9e7d33] via-[#c4a661] to-[#f3e5be] h-full rounded-full"
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1 font-mono">
                  <span className="text-[#a09a8a] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#e2c98a]" />
                    MP
                  </span>
                  <span className="text-[#e2c98a] font-bold tracking-wide">{charMp} / {totalMaxMp}</span>
                </div>
                <div className="w-full bg-[#08080a] rounded-full h-3.5 overflow-hidden border border-[#2a2720] p-0.5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(0, (charMp / totalMaxMp) * 100)}%` }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className="bg-gradient-to-r from-[#5a4c28] via-[#8c7438] to-[#e2c98a] h-full rounded-full"
                  />
                </div>
              </div>
            </div>

            {isDefending && (
              <div className="mt-3.5 flex items-center gap-1.5 text-[10px] bg-[#1a1710] text-[#d4af37] px-2.5 py-1 rounded border border-[#c4a661]/60 font-semibold uppercase tracking-wider">
                <Shield className="w-3.5 h-3.5" />
                <span>防御体制中 / DEFENSE ENGAGED</span>
              </div>
            )}
          </motion.div>

          {/* Right Wing: Enemy Card */}
          <motion.div 
            animate={!isPlayerTurn && !isBattleOver ? { boxShadow: '0 0 25px rgba(196,166,97,0.15)' } : {}}
            className={`p-5 rounded-2xl border transition-all duration-500 ${
              !isPlayerTurn && !isBattleOver
                ? 'bg-[#181512] border-[#c4a661]/80' 
                : 'bg-[#0a0a0d]/80 border-[#23201a]'
            }`}
          >
            <div className="flex items-center justify-between mb-4 gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-[#f3e5be] text-base truncate">{enemy.name}</h3>
                  <span className="text-[10px] font-bold text-[#d4af37] bg-[#1a1710] px-2 py-0.5 rounded border border-[#3a3322] font-mono shrink-0">
                    Lv.{enemy.level}
                  </span>
                </div>
                <span className="text-[10px] text-[#706c62] block mt-0.5 font-mono">ENCOUNTER</span>
              </div>
              <div className="w-12 h-12 rounded-full bg-[#181510] border border-[#c4a661]/40 flex items-center justify-center shadow-inner relative overflow-hidden shrink-0">
                <Skull className="w-5 h-5 text-[#d4af37]" />
                {!isPlayerTurn && !isBattleOver && (
                  <span className="absolute inset-0 bg-[#c4a661]/10 animate-ping rounded-full pointer-events-none" />
                )}
              </div>
            </div>

            {/* Enemy HP Gauge */}
            <div className="text-xs">
              <div className="flex justify-between items-center mb-1 font-mono">
                <span className="text-[#a09a8a] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]" />
                  ENEMY HP
                </span>
                <span className="text-[#e2c98a] font-bold tracking-wide">{enemyHp} / {enemyMaxHp}</span>
              </div>
              <div className="w-full bg-[#08080a] rounded-full h-3.5 overflow-hidden border border-[#2a2720] p-0.5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(0, (enemyHp / enemyMaxHp) * 100)}%` }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  className="bg-gradient-to-r from-[#735e2e] via-[#b89542] to-[#d4af37] h-full rounded-full"
                />
              </div>
            </div>

            {enemyStatus && (
              <div className="mt-3.5 flex items-center gap-1.5 text-[10px] bg-[#1a1710] text-[#e2c98a] px-2.5 py-1 rounded border border-[#3a3322] font-semibold tracking-wider">
                <ShieldAlert className="w-3.5 h-3.5 animate-pulse" />
                <span>{enemyStatus.type.toUpperCase()} 状態 (残り{enemyStatus.duration}T)</span>
              </div>
            )}
          </motion.div>
        </div>

        {/* Cinematic Aether Gauge Controller */}
        {!isBattleOver && (
          <div className="mb-6 bg-[#0c0d11] p-4 rounded-2xl border border-[#2a2720] relative z-10 overflow-hidden">
            <div className="flex justify-between items-center mb-1.5 text-xs">
              <span className="text-[#c4a661] font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#d4af37] animate-pulse" />
                エーテルバーストゲージ / AETHER RESONANCE
              </span>
              <span className="font-mono text-[#d4af37] font-bold tracking-widest">{aetherGauge}%</span>
            </div>
            <div className="w-full bg-[#07070a] h-2 rounded-full overflow-hidden border border-[#2a2720] p-0.5">
              <motion.div 
                animate={{ width: `${aetherGauge}%` }}
                className={`h-full rounded-full transition-all duration-300 ${isAetherBurstActive ? 'bg-gradient-to-r from-[#b89542] via-[#d4af37] to-[#f3e5be] animate-pulse shadow-[0_0_10px_rgba(212,175,55,0.5)]' : 'bg-[#c4a661]'}`}
              />
            </div>

            {/* Ultimate Burst Button */}
            {aetherGauge >= 100 && !isAetherBurstActive && (
              <motion.button
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.985 }}
                onClick={handleActivateBurst}
                className="w-full mt-3 py-3 bg-gradient-to-r from-[#b89542] via-[#d4af37] to-[#f3e5be] text-[#07070a] text-xs font-black tracking-[0.15em] rounded-xl hover:shadow-[0_0_20px_rgba(212,175,55,0.5)] transition duration-300 cursor-pointer animate-pulse border border-white/20"
              >
                🔥 次元覚醒 【AETHER BURST】 を発動する！ 🔥
              </motion.button>
            )}
            
            {isAetherBurstActive && (
              <div className="w-full mt-2 text-center text-[10px] text-[#d4af37] font-mono tracking-[0.2em] animate-pulse font-bold">
                BURST ACTIVE: 残り {burstTurnsLeft} ターン 
              </div>
            )}
          </div>
        )}

        {/* Elemental Combo Active HUD Banner */}
        {currentActiveElementInfo && elementComboCount >= 1 && !isBattleOver && (
          <motion.div 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded-2xl bg-[#0c0d12] border border-[#2d2d38] relative overflow-hidden flex items-center justify-between shadow-lg z-10"
          >
            <div 
              className="absolute inset-0 pointer-events-none opacity-20 transition-all duration-500"
              style={{
                background: `radial-gradient(circle at left, ${currentActiveElementInfo.glowColor}, transparent 70%)`
              }}
            />

            <div className="flex items-center gap-3 relative z-10 min-w-0">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black shrink-0 border ${currentActiveElementInfo.borderColor} ${currentActiveElementInfo.badgeBg} shadow-inner`}>
                {currentActiveElementInfo.icon}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-white tracking-wide">
                    {currentActiveElementInfo.elementName}魔力連鎖
                  </span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full font-mono border ${currentActiveElementInfo.borderColor} ${currentActiveElementInfo.badgeBg} ${elementComboCount >= 2 ? 'animate-pulse' : ''}`}>
                    COMBO x{elementComboCount}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 block truncate mt-0.5 font-mono">
                  {elementComboCount >= 2 ? (
                    <span className="text-amber-400 font-bold">
                      🔥 ダメージ倍率: {getComboMultiplier(elementComboCount).toFixed(2)}倍 UP中！
                    </span>
                  ) : (
                    <span>同属性魔法の連続使用でダメージ倍率UP！（次で1.25倍）</span>
                  )}
                </span>
              </div>
            </div>

            {elementComboCount >= 2 && (
              <div className="relative z-10 shrink-0 text-right">
                <span className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-amber-500 font-mono tracking-tight drop-shadow">
                  +{Math.round((getComboMultiplier(elementComboCount) - 1) * 100)}%
                </span>
                <span className="text-[9px] text-amber-400/80 block font-bold font-mono">POWER BOOST</span>
              </div>
            )}
          </motion.div>
        )}

        {/* Primary Action Button Bar */}
        {!isBattleOver && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative z-10">
            <motion.button
              whileHover={isPlayerTurn ? { scale: 1.025, y: -2 } : {}}
              whileTap={isPlayerTurn ? { scale: 0.975 } : {}}
              disabled={!isPlayerTurn}
              onClick={handleAttack}
              className={`py-3 px-4 rounded-xl font-bold flex flex-col items-center justify-center gap-1 border transition-all duration-300 ${
                isPlayerTurn
                  ? 'bg-[#1c1810] hover:bg-[#282218] text-[#d4af37] border-[#c4a661] shadow-lg cursor-pointer'
                  : 'bg-[#09090c] text-[#555] border-[#1c1a15] cursor-not-allowed'
              }`}
            >
              <Swords className={`w-4 h-4 mb-0.5 ${isPlayerTurn ? 'text-[#d4af37]' : ''}`} />
              <span className="text-xs">{isAetherBurstActive ? '神撃エーテルノヴァ' : '通常攻撃'}</span>
            </motion.button>

            <motion.button
              whileHover={isPlayerTurn ? { scale: 1.025, y: -2 } : {}}
              whileTap={isPlayerTurn ? { scale: 0.975 } : {}}
              disabled={!isPlayerTurn}
              onClick={() => { setShowSpellMenu(!showSpellMenu); setShowItemMenu(false); }}
              className={`py-3 px-4 rounded-xl font-bold flex flex-col items-center justify-center gap-1 border transition-all duration-300 ${
                isPlayerTurn
                  ? showSpellMenu
                    ? 'bg-[#2a2416] text-[#f3e5be] border-[#d4af37] shadow-lg cursor-pointer'
                    : 'bg-[#1c1810] hover:bg-[#282218] text-[#f3e5be] border-[#c4a661]/80 shadow-lg cursor-pointer'
                  : 'bg-[#09090c] text-[#555] border-[#1c1a15] cursor-not-allowed'
              }`}
            >
              <Wand2 className={`w-4 h-4 mb-0.5 ${isPlayerTurn ? 'text-[#e2c98a]' : ''}`} />
              <span className="text-xs">魔法を使う</span>
            </motion.button>

            <motion.button
              whileHover={isPlayerTurn ? { scale: 1.025, y: -2 } : {}}
              whileTap={isPlayerTurn ? { scale: 0.975 } : {}}
              disabled={!isPlayerTurn}
              onClick={() => { setShowItemMenu(!showItemMenu); setShowSpellMenu(false); }}
              className={`py-3 px-4 rounded-xl font-bold flex flex-col items-center justify-center gap-1 border transition-all duration-300 ${
                isPlayerTurn
                  ? showItemMenu
                    ? 'bg-[#2a2416] text-[#f3e5be] border-[#d4af37] shadow-lg cursor-pointer'
                    : 'bg-[#1c1810] hover:bg-[#282218] text-[#e2c98a] border-[#c4a661]/80 shadow-lg cursor-pointer'
                  : 'bg-[#09090c] text-[#555] border-[#1c1a15] cursor-not-allowed'
              }`}
            >
              <Backpack className={`w-4 h-4 mb-0.5 ${isPlayerTurn ? 'text-[#c4a661]' : ''}`} />
              <span className="text-xs">アイテム</span>
            </motion.button>

            <motion.button
              whileHover={isPlayerTurn ? { scale: 1.025, y: -2 } : {}}
              whileTap={isPlayerTurn ? { scale: 0.975 } : {}}
              disabled={!isPlayerTurn}
              onClick={handleDefend}
              className={`py-3 px-4 rounded-xl font-bold flex flex-col items-center justify-center gap-1 border transition-all duration-300 ${
                isPlayerTurn
                  ? 'bg-[#121318] hover:bg-[#1a1b22] text-[#b8b0a0] border-[#3a3528] shadow-lg cursor-pointer'
                  : 'bg-[#09090c] text-[#555] border-[#1c1a15] cursor-not-allowed'
              }`}
            >
              <Shield className={`w-4 h-4 mb-0.5 ${isPlayerTurn ? 'text-[#b8b0a0]' : ''}`} />
              <span className="text-xs">防御する</span>
            </motion.button>
          </div>
        )}

        {/* Collapsible Spell Sub-menu Drawer */}
        {showSpellMenu && !isBattleOver && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 p-4 bg-[#0a0a0e] rounded-2xl border border-purple-800/60 overflow-hidden relative z-10 shadow-inner"
          >
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-[10px] font-black tracking-[0.2em] text-purple-400 uppercase">SPELLBOOK & MASTERY / 習得中の魔術と習熟度</h4>
              <span className="text-[10px] text-slate-500 font-mono">AVAILABLE MANA: {charMp} MP</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto pr-1">
              {currentSpells.map((spell) => {
                const mLvl = spell.masteryLevel ?? 1;
                const mExp = spell.masteryExp ?? 0;
                const mMax = spell.masteryMaxExp ?? 3;
                const expPercent = Math.min(100, (mExp / mMax) * 100);
                const spellElem = getSpellElementInfo(spell);
                const isComboMatch = lastSpellElement === spellElem.id;
                const nextComboCount = isComboMatch ? elementComboCount + 1 : 1;
                const nextMult = getComboMultiplier(nextComboCount);

                return (
                  <button
                    key={spell.id}
                    disabled={charMp < spell.mpCost}
                    onClick={() => handleCastSpell(spell)}
                    className={`p-3 border rounded-xl text-left flex flex-col justify-between transition duration-300 relative overflow-hidden ${
                      charMp >= spell.mpCost
                        ? isComboMatch && elementComboCount >= 1
                          ? 'bg-slate-900/90 border-amber-500/80 shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:border-amber-400 cursor-pointer'
                          : 'bg-slate-900/90 hover:bg-purple-950/20 border-slate-800/80 hover:border-purple-500/60 cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.5)]'
                        : 'bg-slate-950/50 border-slate-950/80 text-slate-600 cursor-not-allowed'
                    }`}
                  >
                    {/* Combo badge overlay if this spell will extend combo */}
                    {isComboMatch && elementComboCount >= 1 && (
                      <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 via-orange-500 to-transparent text-slate-950 text-[9px] font-black px-2.5 py-0.5 font-mono shadow-sm z-10">
                        🔥 COMBO (+{Math.round((nextMult - 1) * 100)}% DMG)
                      </div>
                    )}

                    {/* Mastery background subtle purple glow for high mastery */}
                    {mLvl > 1 && (
                      <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 blur-2xl pointer-events-none rounded-full" />
                    )}

                    <div className="flex justify-between items-start w-full mb-1">
                      <div className="min-w-0 flex-1 pr-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-white text-sm truncate">{spell.name}</span>
                          <span className={`text-[9px] font-extrabold tracking-wider px-1.5 py-0.5 rounded font-mono shrink-0 border ${spellElem.borderColor} ${spellElem.badgeBg}`}>
                            {spellElem.icon} {spellElem.elementName}
                          </span>
                          <span className={`text-[9px] font-extrabold tracking-wider px-1.5 py-0.5 rounded font-mono shrink-0 ${
                            mLvl >= 5 
                              ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-[0_2px_5px_rgba(245,158,11,0.35)]'
                              : mLvl > 1
                                ? 'bg-purple-950/80 text-purple-300 border border-purple-500/30'
                                : 'bg-slate-800 text-slate-400'
                          }`}>
                            Lv.{mLvl}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400 block line-clamp-1 mt-0.5">{spell.desc}</span>
                      </div>
                      
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded border font-mono shrink-0 ${
                        charMp >= spell.mpCost
                          ? 'text-purple-400 bg-purple-950/40 border-purple-800/30'
                          : 'text-slate-600 bg-slate-900/30 border-slate-800/20'
                      }`}>
                        MP {spell.mpCost}
                      </span>
                    </div>

                    {/* Mastery progress bar & power helper */}
                    <div className="w-full mt-2 pt-1 border-t border-slate-800/50">
                      <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono mb-1">
                        <span className="flex items-center gap-1">
                          習熟度: {mExp}/{mMax} 回
                          {mLvl > 1 && (
                            <span className="text-emerald-500 font-bold">(威力+{Math.floor((mLvl - 1) * 25)}%)</span>
                          )}
                        </span>
                        <span className="text-slate-400">基本威力 {spell.power}</span>
                      </div>
                      <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden p-0.5 border border-slate-800/60">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${expPercent}%` }}
                          transition={{ duration: 0.3 }}
                          className={`h-full rounded-full ${
                            mLvl >= 5
                              ? 'bg-gradient-to-r from-amber-400 to-orange-500 shadow-[0_0_8px_rgba(245,158,11,0.5)] animate-pulse'
                              : 'bg-gradient-to-r from-purple-500 to-indigo-500'
                          }`}
                        />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Collapsible Item Sub-menu Drawer */}
        {showItemMenu && !isBattleOver && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 p-4 bg-slate-950 rounded-2xl border border-emerald-800/60 overflow-hidden relative z-10"
          >
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-[10px] font-black tracking-[0.2em] text-emerald-400 uppercase">INVENTORY / 所持ポーション</h4>
              <span className="text-[10px] text-slate-500 font-mono">USE DURING COMBAT</span>
            </div>
            {character.inventory.filter((i) => i.type === 'potion').length === 0 ? (
              <div className="py-4 text-center text-xs text-slate-500">
                使用できる戦闘用ポーションを所持していません。
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                {character.inventory.map((item, idx) => {
                  if (item.type !== 'potion') return null;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleUseItem(item, idx)}
                      className="p-3 bg-slate-900 hover:bg-emerald-950/30 border border-slate-800/80 hover:border-emerald-500/60 rounded-xl text-left flex justify-between items-center transition duration-300 cursor-pointer"
                    >
                      <div className="min-w-0 pr-2">
                        <span className="font-bold text-white text-sm block truncate">{item.name}</span>
                        <span className="text-xs text-slate-400 block truncate">{item.desc}</span>
                      </div>
                      <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/50 px-2.5 py-1 rounded border border-emerald-800/40 shrink-0">
                        使用する
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* Stunning Victory Banner Overlay */}
        <AnimatePresence>
          {isBattleOver && victoryRewards && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-30"
            >
              <motion.div
                initial={{ scale: 0.8, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: 'spring', damping: 15 }}
                className="max-w-sm"
              >
                <div className="w-14 h-14 rounded-full bg-amber-950/40 border border-amber-500/30 flex items-center justify-center mx-auto mb-3.5 shadow-lg">
                  <Trophy className="w-7 h-7 text-amber-400" />
                </div>
                <h2 className="text-4xl font-black tracking-[0.1em] text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-200 mb-1">
                  VICTORY
                </h2>
                <p className="text-[10px] font-bold tracking-[0.25em] text-slate-400 mb-6 font-mono">BATTLE COMPLETED</p>
                <p className="text-slate-300 text-xs mb-6 px-4">
                  驚異的な戦略により <span className="text-rose-400 font-bold">{enemy.name}</span> の討伐に成功した！
                </p>

                <div className="flex gap-4 justify-center mb-6">
                  <div className="bg-[#121216] border border-[#232329] px-6 py-3 rounded-2xl shadow-xl min-w-[110px]">
                    <span className="text-[9px] text-slate-500 block font-mono font-bold tracking-wider mb-0.5">GOLD PIECES</span>
                    <strong className="text-amber-400 text-lg font-mono flex items-center justify-center gap-1">
                      <Coins className="w-4 h-4" />
                      +{victoryRewards.gold}
                    </strong>
                  </div>
                  <div className="bg-[#121216] border border-[#232329] px-6 py-3 rounded-2xl shadow-xl min-w-[110px]">
                    <span className="text-[9px] text-slate-500 block font-mono font-bold tracking-wider mb-0.5">EXPERIENCE</span>
                    <strong className="text-indigo-400 text-lg font-mono">+{victoryRewards.exp}</strong>
                  </div>
                </div>
                
                <div className="flex items-center justify-center gap-2 text-xs text-slate-500 font-medium">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
                    <Hourglass className="w-3.5 h-3.5 text-[#c4a661]" />
                  </motion.div>
                  <span>迷宮深部（次フロア）へ進行中...</span>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Magic Mastery Level Up Cinematic Event Overlay */}
      <AnimatePresence>
        {masteryLevelUpEvent && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 pointer-events-auto"
            onClick={() => setMasteryLevelUpEvent(null)}
          >
            <motion.div 
              initial={{ scale: 0.88, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.88, opacity: 0 }}
              transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.28 }}
              className="bg-gradient-to-b from-[#16161f] to-[#0c0c11] border-2 border-amber-400/80 p-8 rounded-3xl max-w-sm w-full text-center relative overflow-hidden shadow-[0_20px_50px_rgba(245,158,11,0.25)]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Ray particles or sparkles */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.15)_0%,transparent_70%)]" />
              
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-tr from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.4)] border border-yellow-300">
                <Wand2 className="w-8 h-8 text-slate-950 animate-pulse" />
              </div>

              <span className="text-[10px] font-black tracking-[0.4em] text-amber-400 uppercase block mb-1">
                SPELL AWAKENED
              </span>
              
              <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300 tracking-tight mb-2">
                魔法習熟度が上昇！
              </h3>

              <p className="text-base font-bold text-amber-200 bg-amber-950/40 border border-amber-800/40 rounded-xl py-2 px-4 inline-block mb-4">
                {masteryLevelUpEvent.spellName}
              </p>

              <div className="flex justify-center items-center gap-6 mb-5 font-mono text-xl">
                <div className="text-slate-500">Lv.{masteryLevelUpEvent.prevLevel}</div>
                <ChevronRight className="w-5 h-5 text-amber-400 animate-pulse" />
                <div className="text-amber-400 font-extrabold text-2xl animate-bounce">
                  Lv.{masteryLevelUpEvent.newLevel}
                </div>
              </div>

              <div className="text-xs text-slate-400 space-y-1 mb-6">
                <div>呪文威力が <span className="text-emerald-400 font-bold">+{masteryLevelUpEvent.powerBonus}</span> 上昇しました！</div>
                <div>呪文のエフェクトがより洗練され輝きます。</div>
              </div>

              <button 
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-extrabold text-xs tracking-wider rounded-xl hover:opacity-90 transition cursor-pointer"
                onClick={() => setMasteryLevelUpEvent(null)}
              >
                意思を継ぐ者として昇華する
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive Roguelike Combat Log Terminal */}
      <div className="mt-4 bg-[#09090d] border border-[#23232b] rounded-2xl p-4 shadow-2xl relative overflow-hidden transition-all duration-300">
        {/* Subtle grid accent glow */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.03)_0%,transparent_70%)]" />

        {/* Terminal Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1b1b22] mb-3 relative z-10">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <h4 className="text-[11px] font-black tracking-[0.18em] text-slate-300 uppercase flex items-center gap-1.5 font-mono">
              <Terminal className="w-3.5 h-3.5 text-amber-400" />
              <span>ROGUELIKE COMBAT LOG</span>
              <span className="text-[10px] text-slate-500 font-bold font-mono bg-[#14141a] px-2 py-0.5 rounded border border-[#262633]">
                {filteredLogs.length}件
              </span>
            </h4>
          </div>

          {/* Log Controls & Filters */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <div className="flex items-center bg-[#101016] p-1 rounded-xl border border-[#23232b] text-[10px] font-mono">
              {(['all', 'attack', 'magic', 'dodge', 'item', 'status'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setLogCategoryFilter(cat)}
                  className={`px-2 py-0.5 rounded-lg font-bold transition cursor-pointer ${
                    logCategoryFilter === cat
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {cat === 'all' && 'すべて'}
                  {cat === 'attack' && '⚔️ 物理'}
                  {cat === 'magic' && '🔮 魔法'}
                  {cat === 'dodge' && '💨 回避'}
                  {cat === 'item' && '🧪 薬'}
                  {cat === 'status' && '⚡ 状態'}
                </button>
              ))}
            </div>

            {/* Auto-scroll toggle */}
            <button
              onClick={() => setAutoScroll(!autoScroll)}
              title={autoScroll ? "自動追従中" : "手動固定中"}
              className={`px-2 py-1 rounded-xl border text-[10px] font-mono font-bold flex items-center gap-1 transition cursor-pointer ${
                autoScroll
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-900 border-slate-700 text-slate-400'
              }`}
            >
              <ArrowDown className={`w-3 h-3 ${autoScroll ? 'animate-bounce text-emerald-400' : ''}`} />
              <span>{autoScroll ? '追従ON' : '追従OFF'}</span>
            </button>

            {/* Expand / Minimize Height toggle */}
            <button
              onClick={() => setIsLogExpanded(!isLogExpanded)}
              className="px-2 py-1 rounded-xl border border-[#2a2a38] bg-[#121219] text-slate-400 hover:text-white text-[10px] font-mono font-bold flex items-center gap-1 transition cursor-pointer"
            >
              {isLogExpanded ? (
                <>
                  <Minimize2 className="w-3 h-3" />
                  <span>標準</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3 h-3" />
                  <span>拡大</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Log List Scroll Container */}
        <div
          ref={logContainerRef}
          className={`space-y-1.5 overflow-y-auto pr-1.5 font-mono text-xs scrollbar-thin scrollbar-thumb-amber-500/30 scrollbar-track-slate-950/80 transition-all duration-300 relative z-10 ${
            isLogExpanded ? 'max-h-96 min-h-[280px]' : 'max-h-48 min-h-[160px]'
          }`}
        >
          {filteredLogs.length === 0 ? (
            <div className="py-8 text-center text-slate-600 text-xs font-mono">
              該当カテゴリーの戦闘プロセスはありません。
            </div>
          ) : (
            filteredLogs.map((log) => {
              let badgeColor = 'text-slate-400 bg-slate-900 border-slate-800';
              let textClass = 'text-slate-300';

              if (log.category === 'attack') {
                badgeColor = log.isCrit 
                  ? 'text-amber-300 bg-amber-950/80 border-amber-500/50 shadow-[0_0_8px_rgba(245,158,11,0.2)]' 
                  : 'text-rose-300 bg-rose-950/60 border-rose-800/40';
                textClass = log.isCrit ? 'text-amber-200 font-bold' : 'text-slate-200';
              } else if (log.category === 'magic') {
                badgeColor = 'text-purple-300 bg-purple-950/60 border-purple-800/40';
                textClass = 'text-purple-200 font-medium';
              } else if (log.category === 'dodge') {
                badgeColor = 'text-cyan-300 bg-cyan-950/60 border-cyan-800/40';
                textClass = 'text-cyan-200 font-bold';
              } else if (log.category === 'item') {
                badgeColor = 'text-emerald-300 bg-emerald-950/60 border-emerald-800/40';
                textClass = 'text-emerald-200';
              } else if (log.category === 'defend') {
                badgeColor = 'text-blue-300 bg-blue-950/60 border-blue-800/40';
                textClass = 'text-blue-200';
              } else if (log.category === 'status') {
                badgeColor = 'text-yellow-300 bg-yellow-950/60 border-yellow-800/40';
                textClass = 'text-yellow-200';
              } else if (log.category === 'system') {
                badgeColor = 'text-amber-400 bg-amber-950/80 border-amber-500/50';
                textClass = 'text-amber-300 font-bold';
              }

              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.18 }}
                  className="p-2 rounded-xl bg-[#0c0c11]/90 hover:bg-[#13131b] border border-[#1a1a23] hover:border-[#2a2a38] transition flex flex-col gap-1 group"
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Turn & Time Badge */}
                    <span className="text-[10px] font-mono text-slate-500 bg-[#14141c] px-1.5 py-0.5 rounded border border-[#22222d] shrink-0 font-bold">
                      T{log.turn} • {log.time}
                    </span>

                    {/* Category tag */}
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border font-mono shrink-0 ${badgeColor}`}>
                      {log.category.toUpperCase()}
                    </span>

                    {/* Main log title */}
                    <span className={`text-xs leading-relaxed flex-1 ${textClass}`}>
                      {log.title}
                    </span>
                  </div>

                  {/* Detailed math formula / stats breakdown */}
                  {log.detail && (
                    <div className="pl-2 border-l-2 border-amber-500/30 text-[10px] text-slate-400 font-mono tracking-tight opacity-85 group-hover:opacity-100 transition">
                      {log.detail}
                    </div>
                  )}
                </motion.div>
              );
            })
          )}
        </div>

        {/* Jump to bottom button when auto-scroll is OFF */}
        {!autoScroll && (
          <button
            onClick={() => {
              setAutoScroll(true);
              if (logContainerRef.current) {
                logContainerRef.current.scrollTo({ top: logContainerRef.current.scrollHeight, behavior: 'smooth' });
              }
            }}
            className="absolute bottom-3 right-5 z-20 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-full shadow-[0_0_15px_rgba(245,158,11,0.5)] flex items-center gap-1.5 cursor-pointer animate-pulse font-mono"
          >
            <ArrowDown className="w-3.5 h-3.5" />
            <span>最新ログへ移動</span>
          </button>
        )}
      </div>
    </div>
  );
};
