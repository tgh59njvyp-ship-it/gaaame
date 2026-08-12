import { CharacterState, Item } from '../types';
import { generateRandomLoot } from './lootGenerator';
import { createLogEntry, appendLogToCharacter } from './logHelper';
import { evaluateTitles } from './titleUtils';

export interface SweepResult {
  stageName: string;
  goldGained: number;
  expGained: number;
  spGained: number;
  itemsGained: Item[];
  leveledUp: boolean;
  newLevel: number;
  summaryText: string;
}

export function executeStageSweep(
  character: CharacterState,
  stageNumber: number,
  stageName: string
): { updatedChar: CharacterState; result: SweepResult } {
  // Base scaling according to stage difficulty
  const baseGold = 120 + stageNumber * 180 + Math.floor(Math.random() * 80);
  const baseExp = 150 + stageNumber * 220 + Math.floor(Math.random() * 100);
  const spGained = Math.random() < 0.6 ? 1 : 2;

  // Gold & EXP bonuses from character traits / reincarnation
  let goldMult = 1.0;
  let expMult = 1.0;

  if (character.race.bonuses.goldBonus) goldMult += character.race.bonuses.goldBonus - 1;
  if (character.race.bonuses.expBonus) expMult += character.race.bonuses.expBonus - 1;

  if (character.reincarnationBuffs) {
    goldMult += (character.reincarnationBuffs.expGoldBonusPct || 0) / 100;
    expMult += (character.reincarnationBuffs.expGoldBonusPct || 0) / 100;
  }

  const finalGold = Math.floor(baseGold * goldMult);
  const finalExp = Math.floor(baseExp * expMult);

  // Generate 1 ~ 2 items
  const itemsGained: Item[] = [];
  const item1 = generateRandomLoot(character.level, stageNumber, true);
  itemsGained.push(item1);
  if (Math.random() < 0.4 + stageNumber * 0.1) {
    const item2 = generateRandomLoot(character.level, stageNumber, false);
    itemsGained.push(item2);
  }

  // Update character EXP, Gold, SP, Inventory
  let newGold = character.gold + finalGold;
  let newExp = character.exp + finalExp;
  let newMaxExp = character.maxExp;
  let newLevel = character.level;
  let newSp = character.sp + spGained;
  let leveledUp = false;

  let newAtk = character.atk;
  let newDef = character.def;
  let newHp = character.hp;
  let newMaxHp = character.maxHp;
  let newMp = character.mp;
  let newMaxMp = character.maxMp;

  // Level Up loop
  while (newExp >= newMaxExp) {
    newExp -= newMaxExp;
    newLevel += 1;
    newMaxExp = Math.floor(newMaxExp * 1.25);
    leveledUp = true;
    newSp += 3;

    // Stat gains on level up
    newAtk += 4;
    newDef += 2;
    newMaxHp += 20;
    newHp = newMaxHp; // Restore HP on level up
    newMaxMp += 10;
    newMp = newMaxMp; // Restore MP on level up
  }

  // Update Inventory (add non-full inventory items)
  const updatedInventory = [...character.inventory, ...itemsGained];

  // Update Quests progress
  const updatedQuests = character.quests ? character.quests.map((q) => {
    if (q.isClaimed || q.isCompleted) return q;
    let newProg = q.currentProgress + 5; // count as 5 enemies defeated per sweep
    const isCompleted = newProg >= q.targetCount;
    return { ...q, currentProgress: Math.min(q.targetCount, newProg), isCompleted };
  }) : [];

  // Update Stats
  const updatedStats = {
    ...character.stats,
    battlesWon: character.stats.battlesWon + 5,
    floorsCleared: character.stats.floorsCleared + 5,
  };

  let updatedChar: CharacterState = {
    ...character,
    gold: newGold,
    exp: newExp,
    maxExp: newMaxExp,
    level: newLevel,
    sp: newSp,
    atk: newAtk,
    def: newDef,
    hp: newHp,
    maxHp: newMaxHp,
    mp: newMp,
    maxMp: newMaxMp,
    inventory: updatedInventory,
    quests: updatedQuests,
    stats: updatedStats,
  };

  // Add Log Entry
  const sweepLog = createLogEntry(
    'system',
    `⚡ 【迷宮制圧】 ${stageName}`,
    `一括制圧を完了。獲得: 金貨 +${finalGold}G, EXP +${finalExp}, SP +${spGained}, 戦利品 ${itemsGained.length}点。`,
    stageNumber,
    { gold: finalGold, exp: finalExp }
  );

  updatedChar = appendLogToCharacter(updatedChar, sweepLog);
  const { updatedChar: finalChar } = evaluateTitles(updatedChar, stageNumber);

  return {
    updatedChar: finalChar,
    result: {
      stageName,
      goldGained: finalGold,
      expGained: finalExp,
      spGained,
      itemsGained,
      leveledUp,
      newLevel,
      summaryText: `${stageName} を一瞬で完封制圧！ 戦利品 ${itemsGained.length} 個を回収しました。`,
    },
  };
}
