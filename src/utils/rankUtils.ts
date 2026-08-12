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

export interface AdventurerRankInfo {
  rankNum: number; // e.g. Rank 1, Rank 12, Rank 50
  rank: string;    // e.g. 'F', 'E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS'
  title: string;   // e.g. '新進冒険者', '英雄級冒険者'
  gradeIndex: number; // 1 (F) ~ 9 (SSS)
  color: string;
  badgeBg: string;
  nextThreshold: number | null;
  prevThreshold: number;
}

export function getAdventurerRank(power: number): AdventurerRankInfo {
  // Numerical rank is directly derived from combat power (every 100 power = +1 Rank Level)
  const rankNum = Math.max(1, Math.floor(power / 100) + 1);

  if (power >= 5000) {
    return {
      rankNum,
      rank: 'SSS',
      title: '神話級・覇王冒険者',
      gradeIndex: 9,
      color: 'text-amber-300 border-amber-400 bg-amber-950/80 shadow-[0_0_20px_rgba(245,158,11,0.5)]',
      badgeBg: 'from-amber-300 via-yellow-500 to-amber-700',
      nextThreshold: null,
      prevThreshold: 3500,
    };
  }
  if (power >= 3500) {
    return {
      rankNum,
      rank: 'SS',
      title: '伝説級・超強冒険者',
      gradeIndex: 8,
      color: 'text-purple-300 border-purple-400 bg-purple-950/80 shadow-[0_0_20px_rgba(168,85,247,0.4)]',
      badgeBg: 'from-purple-300 via-purple-500 to-indigo-800',
      nextThreshold: 5000,
      prevThreshold: 2200,
    };
  }
  if (power >= 2200) {
    return {
      rankNum,
      rank: 'S',
      title: '英雄級・極光冒険者',
      gradeIndex: 7,
      color: 'text-indigo-300 border-indigo-400 bg-indigo-950/80 shadow-[0_0_20px_rgba(99,102,241,0.4)]',
      badgeBg: 'from-indigo-300 via-blue-500 to-indigo-800',
      nextThreshold: 3500,
      prevThreshold: 1400,
    };
  }
  if (power >= 1400) {
    return {
      rankNum,
      rank: 'A',
      title: '精鋭・高級冒険者',
      gradeIndex: 6,
      color: 'text-rose-300 border-rose-400 bg-rose-950/80 shadow-[0_0_15px_rgba(244,63,94,0.3)]',
      badgeBg: 'from-rose-300 via-rose-500 to-red-800',
      nextThreshold: 2200,
      prevThreshold: 900,
    };
  }
  if (power >= 900) {
    return {
      rankNum,
      rank: 'B',
      title: '熟練・一級冒険者',
      gradeIndex: 5,
      color: 'text-blue-300 border-blue-400 bg-blue-950/80 shadow-[0_0_15px_rgba(59,130,246,0.3)]',
      badgeBg: 'from-blue-300 via-blue-500 to-cyan-800',
      nextThreshold: 1400,
      prevThreshold: 550,
    };
  }
  if (power >= 550) {
    return {
      rankNum,
      rank: 'C',
      title: '中堅・二級冒険者',
      gradeIndex: 4,
      color: 'text-emerald-300 border-emerald-400 bg-emerald-950/80 shadow-[0_0_15px_rgba(16,185,129,0.3)]',
      badgeBg: 'from-emerald-300 via-emerald-500 to-teal-800',
      nextThreshold: 900,
      prevThreshold: 300,
    };
  }
  if (power >= 300) {
    return {
      rankNum,
      rank: 'D',
      title: '新進・三級冒険者',
      gradeIndex: 3,
      color: 'text-teal-300 border-teal-400 bg-teal-950/80 shadow-[0_0_10px_rgba(20,184,166,0.25)]',
      badgeBg: 'from-teal-300 via-teal-500 to-emerald-800',
      nextThreshold: 550,
      prevThreshold: 150,
    };
  }
  if (power >= 150) {
    return {
      rankNum,
      rank: 'E',
      title: '駆け出し冒険者',
      gradeIndex: 2,
      color: 'text-slate-200 border-slate-400 bg-slate-900 shadow-md',
      badgeBg: 'from-slate-300 via-slate-500 to-slate-800',
      nextThreshold: 300,
      prevThreshold: 0,
    };
  }
  return {
    rankNum,
    rank: 'F',
    title: '見習い冒険者',
    gradeIndex: 1,
    color: 'text-slate-400 border-slate-600 bg-slate-950 shadow-sm',
    badgeBg: 'from-slate-400 via-slate-600 to-slate-900',
    nextThreshold: 150,
    prevThreshold: 0,
  };
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

