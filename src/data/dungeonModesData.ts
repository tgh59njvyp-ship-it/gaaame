import { Enemy, FloorNode } from '../types';

export type DungeonCategory = 'story' | 'elemental' | 'endless' | 'vault' | 'raid';

export interface ElementalTowerInfo {
  id: string;
  name: string;
  element: string;
  desc: string;
  recommendedLv: number;
  bg: string;
  icon: string;
  color: string;
  floorsCount: number;
  enemies: Enemy[];
  boss: Enemy;
  specialRewardName: string;
}

export interface RaidBossInfo {
  id: string;
  name: string;
  title: string;
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  spd: number;
  desc: string;
  bg: string;
  sprite: string;
}

export const ELEMENTAL_TOWERS: ElementalTowerInfo[] = [
  {
    id: 'tower_fire',
    name: '【試練】炎獄の猛炎塔',
    element: '火属性',
    desc: '熱風と灼熱のマグマが噴き出す炎の階層。火炎魔物がうごめき、高火力の熱風攻撃を仕掛けてくる。',
    recommendedLv: 3,
    bg: 'from-red-950 via-[#2a0e0e] to-[#120505]',
    icon: 'Flame',
    color: '#ef4444',
    floorsCount: 5,
    enemies: [
      { id: 'fire_elemental', name: 'フレイム・エレメンタル', level: 4, hp: 120, maxHp: 120, atk: 38, def: 12, spd: 14, expReward: 80, goldReward: 50, sprite: 'Flame' },
      { id: 'lava_golem', name: 'マグマ・イグニス', level: 5, hp: 180, maxHp: 180, atk: 45, def: 22, spd: 8, expReward: 110, goldReward: 70, sprite: 'Shield' },
    ],
    boss: { id: 'boss_fire_tower', name: '炎獄帝 イフリート', level: 7, hp: 900, maxHp: 900, atk: 72, def: 28, spd: 18, expReward: 500, goldReward: 400, sprite: 'Flame', isBoss: true },
    specialRewardName: '【火炎の秘術】SP+3 & 炎の秘薬',
  },
  {
    id: 'tower_ice',
    name: '【試練】氷華の極寒塔',
    element: '水氷属性',
    desc: '吹雪と永久凍土に包まれた極寒の塔。敵は素早さと回避に長ける。クリアでMP回復アイテムを多数獲得！',
    recommendedLv: 4,
    bg: 'from-blue-950 via-[#0a182e] to-[#040a14]',
    icon: 'Snowflake',
    color: '#38bdf8',
    floorsCount: 5,
    enemies: [
      { id: 'frost_wolf', name: 'フロスト・ウルフ', level: 5, hp: 130, maxHp: 130, atk: 42, def: 14, spd: 24, expReward: 90, goldReward: 60, sprite: 'Dog' },
      { id: 'ice_witch', name: '凍土の魔女', level: 6, hp: 160, maxHp: 160, atk: 52, def: 16, spd: 20, expReward: 130, goldReward: 85, sprite: 'Sparkles' },
    ],
    boss: { id: 'boss_ice_tower', name: '氷雪女王 ヴァルキリー', level: 8, hp: 1100, maxHp: 1100, atk: 80, def: 32, spd: 22, expReward: 650, goldReward: 500, sprite: 'Crown', isBoss: true },
    specialRewardName: '【絶対零度の加護】SP+3 & エリクサー',
  },
  {
    id: 'tower_thunder',
    name: '【試練】疾風と迅雷の塔',
    element: '雷風属性',
    desc: '激しい稲妻と狂風が吹き荒れる高塔。敵の会心率と素早さが高い。突破者には激レア素早さアクセサリが贈られる。',
    recommendedLv: 6,
    bg: 'from-amber-950 via-[#261d08] to-[#0f0b03]',
    icon: 'Zap',
    color: '#eab308',
    floorsCount: 5,
    enemies: [
      { id: 'thunder_bird', name: 'ボルト・ハーピー', level: 7, hp: 200, maxHp: 200, atk: 68, def: 18, spd: 32, expReward: 160, goldReward: 100, sprite: 'Zap' },
      { id: 'lightning_golem', name: '雷鳴の自動人形', level: 8, hp: 260, maxHp: 260, atk: 75, def: 28, spd: 22, expReward: 200, goldReward: 130, sprite: 'Shield' },
    ],
    boss: { id: 'boss_thunder_tower', name: '雷帝 ライジン', level: 10, hp: 1500, maxHp: 1500, atk: 110, def: 38, spd: 30, expReward: 900, goldReward: 800, sprite: 'Zap', isBoss: true },
    specialRewardName: '【迅雷の一撃】SP+4 & 疾風のタリスマン',
  },
  {
    id: 'tower_holy',
    name: '【試練】聖光の輝天塔',
    element: '聖光属性',
    desc: '神聖なる光が満ちる聖域。高耐久の聖騎士と大天使が試練を与える。討伐で高レベル武器とSPを獲得。',
    recommendedLv: 8,
    bg: 'from-[#1c180e] via-[#2a2416] to-[#12100a]',
    icon: 'Sun',
    color: '#f3e5be',
    floorsCount: 5,
    enemies: [
      { id: 'holy_knight', name: 'サンクチュアリ・ナイト', level: 9, hp: 320, maxHp: 320, atk: 88, def: 38, spd: 20, expReward: 260, goldReward: 170, sprite: 'ShieldCheck' },
      { id: 'cherub', name: '光臨のチェラブ', level: 10, hp: 300, maxHp: 300, atk: 100, def: 30, spd: 26, expReward: 300, goldReward: 200, sprite: 'Sparkles' },
    ],
    boss: { id: 'boss_holy_tower', name: '熾天使 セラフィム', level: 12, hp: 2000, maxHp: 2000, atk: 130, def: 50, spd: 28, expReward: 1400, goldReward: 1200, sprite: 'Sun', isBoss: true },
    specialRewardName: '【神聖光輪】SP+5 & 聖光の鎧',
  },
  {
    id: 'tower_dark',
    name: '【試練】深淵の暗黒塔',
    element: '暗黒属性',
    desc: 'あらゆる光を呑み込む暗黒の深淵。呪いとドレイン攻撃を行う凶悪な魔族が集う。最難関の試練！',
    recommendedLv: 10,
    bg: 'from-purple-950 via-[#180a24] to-[#0a0410]',
    icon: 'Skull',
    color: '#a855f7',
    floorsCount: 5,
    enemies: [
      { id: 'void_stalker', name: 'ヴォイド・ストーカー', level: 11, hp: 380, maxHp: 380, atk: 115, def: 36, spd: 35, expReward: 380, goldReward: 250, sprite: 'Skull' },
      { id: 'abyss_lich', name: 'アビス・リッチ', level: 12, hp: 360, maxHp: 360, atk: 130, def: 32, spd: 28, expReward: 420, goldReward: 280, sprite: 'Ghost' },
    ],
    boss: { id: 'boss_dark_tower', name: '深淵の魔神 ヴォイドロード', level: 14, hp: 2800, maxHp: 2800, atk: 160, def: 60, spd: 32, expReward: 2500, goldReward: 2500, sprite: 'Skull', isBoss: true },
    specialRewardName: '【深淵覇権】SP+8 & ヴォイドブレード',
  },
];

export const TREASURE_VAULT_INFO = {
  name: '黄金と秘宝の宝物庫',
  desc: '古代王の金庫室。ゴールドスライムやミミックが蠢き、大量の金貨と恒久ステータス強化薬がザクザク湧き出る！',
  bg: 'from-[#221c0a] via-[#1a1408] to-[#0c0904]',
  recommendedLv: 2,
  enemies: [
    { id: 'gold_slime', name: '✨ ゴールド・スライム', level: 3, hp: 100, maxHp: 100, atk: 20, def: 15, spd: 15, expReward: 100, goldReward: 500, sprite: 'Sparkles' },
    { id: 'mimic', name: '📦 トレジャー・ミミック', level: 4, hp: 180, maxHp: 180, atk: 35, def: 20, spd: 12, expReward: 150, goldReward: 800, sprite: 'Gift' },
    { id: 'diamond_golem', name: '💎 ダイヤ・ゴーレム', level: 5, hp: 350, maxHp: 350, atk: 45, def: 40, spd: 8, expReward: 250, goldReward: 1500, sprite: 'Shield' },
  ],
  boss: { id: 'boss_vault', name: '👑 黄金龍 ゴルディグランド', level: 7, hp: 1200, maxHp: 1200, atk: 75, def: 35, spd: 16, expReward: 800, goldReward: 5000, sprite: 'Crown', isBoss: true },
};

export const WORLD_BOSS_RAID_INFO: RaidBossInfo = {
  id: 'world_boss_astral_dragon',
  name: '古の神竜 アストラガルド',
  title: '次元を喰らう終焉の星竜',
  hp: 12000,
  maxHp: 12000,
  atk: 125,
  def: 45,
  spd: 25,
  desc: '時空の歪みより現れた伝説の神竜。討伐または大打撃を与えることで、莫大なガチャエーテル、SP、限定称号を獲得！',
  bg: 'from-[#1a051d] via-[#110414] to-[#08020a]',
  sprite: 'Flame',
};

export function generateEndlessFloors(startFloor: number = 1, count: number = 5): FloorNode[] {
  const floors: FloorNode[] = [];
  for (let i = 0; i < count; i++) {
    const fNum = startFloor + i;
    const isBossFloor = fNum % 5 === 0;

    const level = Math.floor(fNum * 1.2) + 1;
    const hp = Math.floor(120 + fNum * 50);
    const atk = Math.floor(22 + fNum * 12);
    const def = Math.floor(6 + fNum * 4);
    const spd = Math.floor(10 + fNum * 2);
    const expReward = Math.floor(60 + fNum * 35);
    const goldReward = Math.floor(50 + fNum * 40);

    let type: FloorNode['type'] = 'battle';
    if (isBossFloor) {
      type = 'boss';
    } else if (fNum % 3 === 0) {
      type = 'elite';
    } else if (fNum % 2 === 0) {
      type = 'treasure';
    }

    let enemy: Enemy | undefined = undefined;
    if (type === 'battle') {
      enemy = {
        id: `endless_enemy_${fNum}`,
        name: `深層の魔獣 (第${fNum}層)`,
        level,
        hp,
        maxHp: hp,
        atk,
        def,
        spd,
        expReward,
        goldReward,
        sprite: 'Skull',
      };
    } else if (type === 'elite') {
      enemy = {
        id: `endless_elite_${fNum}`,
        name: `【狂暴】深層の魔王影 (第${fNum}層)`,
        level: level + 2,
        hp: Math.floor(hp * 1.6),
        maxHp: Math.floor(hp * 1.6),
        atk: Math.floor(atk * 1.35),
        def: Math.floor(def * 1.3),
        spd: spd + 4,
        expReward: Math.floor(expReward * 1.8),
        goldReward: Math.floor(goldReward * 2.0),
        sprite: 'Flame',
      };
    } else if (type === 'boss') {
      enemy = {
        id: `endless_boss_${fNum}`,
        name: `【深層覇王】アビス・アザトース (第${fNum}層)`,
        level: level + 4,
        hp: Math.floor(hp * 2.5),
        maxHp: Math.floor(hp * 2.5),
        atk: Math.floor(atk * 1.5),
        def: Math.floor(def * 1.5),
        spd: spd + 6,
        expReward: Math.floor(expReward * 3.0),
        goldReward: Math.floor(goldReward * 3.5),
        sprite: 'Crown',
        isBoss: true,
      };
    }

    floors.push({
      floorNumber: fNum,
      stageNumber: 99,
      type,
      completed: false,
      enemy,
    });
  }
  return floors;
}
