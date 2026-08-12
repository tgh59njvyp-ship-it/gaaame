import { BeginnerQuest, CharacterState } from '../types';
import { createLogEntry, appendLogToCharacter } from './logHelper';

export const getInitialBeginnerQuests = (): BeginnerQuest[] => [
  {
    id: 'bq_floor1',
    title: '初陣への一歩',
    desc: 'ダンジョンで 1回 以上階層を突破する',
    gemReward: 1000,
    targetCount: 1,
    currentCount: 0,
    isCompleted: false,
    isClaimed: false,
    icon: 'Swords',
  },
  {
    id: 'bq_equip',
    title: '武具の着脱',
    desc: '武器、防具、またはアクセサリーを装備する',
    gemReward: 1000,
    targetCount: 1,
    currentCount: 0,
    isCompleted: false,
    isClaimed: false,
    icon: 'Shield',
  },
  {
    id: 'bq_spell',
    title: '魔法の熟練',
    desc: '戦闘で魔法を 1回 以上発動・熟練度を獲得する',
    gemReward: 1000,
    targetCount: 1,
    currentCount: 0,
    isCompleted: false,
    isClaimed: false,
    icon: 'Wand2',
  },
  {
    id: 'bq_gacha',
    title: '運命のガチャ召喚',
    desc: 'ガチャで武器・防具・魔法のいずれかを召喚する',
    gemReward: 1000,
    targetCount: 1,
    currentCount: 0,
    isCompleted: false,
    isClaimed: false,
    icon: 'Sparkles',
  },
  {
    id: 'bq_roulette',
    title: '毎日の運試し',
    desc: 'ログボルーレットを 1回 回してガチャ券を獲得する',
    gemReward: 1000,
    targetCount: 1,
    currentCount: 0,
    isCompleted: false,
    isClaimed: false,
    icon: 'Gift',
  },
  {
    id: 'bq_level3',
    title: '冒険者の成長',
    desc: 'キャラクターレベルが 3 に到達する',
    gemReward: 1000,
    targetCount: 3,
    currentCount: 1,
    isCompleted: false,
    isClaimed: false,
    icon: 'Award',
  },
];

export const checkAndUpdateBeginnerQuests = (
  character: CharacterState,
  actionType: 'floor' | 'equip' | 'gacha' | 'spell' | 'roulette' | 'level',
  val: number = 1
): CharacterState => {
  if (!character.beginnerQuests || character.beginnerQuests.length === 0) {
    character.beginnerQuests = getInitialBeginnerQuests();
  }

  let updated = false;
  const newQuests = character.beginnerQuests.map((q) => {
    if (q.isCompleted) return q;

    let newCount = q.currentCount;
    if (actionType === 'floor' && q.id === 'bq_floor1') newCount += val;
    if (actionType === 'equip' && q.id === 'bq_equip') newCount += val;
    if (actionType === 'spell' && q.id === 'bq_spell') newCount += val;
    if (actionType === 'gacha' && q.id === 'bq_gacha') newCount += val;
    if (actionType === 'roulette' && q.id === 'bq_roulette') newCount += val;
    if (actionType === 'level' && q.id === 'bq_level3') newCount = Math.max(q.currentCount, character.level);

    if (newCount !== q.currentCount) {
      updated = true;
      const completedNow = newCount >= q.targetCount;
      return {
        ...q,
        currentCount: Math.min(q.targetCount, newCount),
        isCompleted: completedNow,
      };
    }
    return q;
  });

  if (!updated) return character;

  return {
    ...character,
    beginnerQuests: newQuests,
  };
};
