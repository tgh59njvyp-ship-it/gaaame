import { CharacterState } from '../types';

export function calculateCombatPower(character: CharacterState): number {
  const base = character.level * 25;
  const hpScore = Math.floor(character.maxHp / 2);
  const mpScore = character.maxMp;
  const atkScore = character.atk * 4;
  const defScore = character.def * 3;
  const spdScore = character.spd * 3;
  const critScore = character.crit * 15;
  return base + hpScore + mpScore + atkScore + defScore + spdScore + critScore;
}

export function getAdventurerRank(power: number): { rank: string; color: string; nextThreshold: number | null } {
  if (power >= 5000) return { rank: 'SSS', color: 'text-amber-300 border-amber-400 bg-amber-950/40', nextThreshold: null };
  if (power >= 3500) return { rank: 'SS', color: 'text-purple-400 border-purple-500 bg-purple-950/40', nextThreshold: 5000 };
  if (power >= 2200) return { rank: 'S', color: 'text-indigo-400 border-indigo-500 bg-indigo-950/40', nextThreshold: 3500 };
  if (power >= 1400) return { rank: 'A', color: 'text-rose-400 border-rose-500 bg-rose-950/40', nextThreshold: 2200 };
  if (power >= 900) return { rank: 'B', color: 'text-blue-400 border-blue-500 bg-blue-950/40', nextThreshold: 1400 };
  if (power >= 550) return { rank: 'C', color: 'text-emerald-400 border-emerald-500 bg-emerald-950/40', nextThreshold: 900 };
  if (power >= 300) return { rank: 'D', color: 'text-teal-400 border-teal-500 bg-teal-950/40', nextThreshold: 550 };
  if (power >= 150) return { rank: 'E', color: 'text-slate-300 border-slate-500 bg-slate-900', nextThreshold: 300 };
  return { rank: 'F', color: 'text-slate-400 border-slate-700 bg-slate-900', nextThreshold: 150 };
}

export function getInitialQuests(): CharacterState['quests'] {
  return [
    {
      id: 'q1',
      title: '迷宮の初回掃討作戦',
      rankReq: 'F',
      desc: '最初のダンジョンでモンスターを3体討伐せよ。',
      reward: { gold: 200, exp: 100 },
      targetCount: 3,
      currentProgress: 0,
      isCompleted: false,
      isClaimed: false,
    },
    {
      id: 'q2',
      title: '異界の財宝回収',
      rankReq: 'E',
      desc: 'ダンジョン内のフロアを5つクリアせよ。',
      reward: { gold: 500, exp: 250 },
      targetCount: 5,
      currentProgress: 0,
      isCompleted: false,
      isClaimed: false,
    },
    {
      id: 'q3',
      title: 'エリート討伐：闇の先兵',
      rankReq: 'D',
      desc: 'エリートモンスターや強敵との戦いに勝利せよ。',
      reward: { gold: 1200, exp: 600 },
      targetCount: 1,
      currentProgress: 0,
      isCompleted: false,
      isClaimed: false,
    },
  ];
}
