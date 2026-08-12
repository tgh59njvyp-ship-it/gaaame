import { CharacterState } from '../types';

export interface TitleInfo {
  id: string;
  name: string;
  desc: string;
  unlockCondition: string;
  bonusDesc: string;
  bonuses: {
    atk?: number;
    def?: number;
    hp?: number;
    mp?: number;
    crit?: number;
    goldMult?: number;
  };
}

export const TITLES: TitleInfo[] = [
  {
    id: 'f2p_monarch',
    name: '無課金の星',
    desc: 'ガチャを引かずに実力でステージ2に到達した倹約家。',
    unlockCondition: 'ガチャ回数が0回の状態でステージ2に到達する',
    bonusDesc: '攻撃力 +5',
    bonuses: { atk: 5 }
  },
  {
    id: 'aether_whale',
    name: '混沌のガチャ廃人',
    desc: 'エーテル召喚に魂を売り、ガチャを計20回以上引いた豪傑。',
    unlockCondition: 'ガチャを20回以上引く',
    bonusDesc: 'クリティカル率 +12%, ゴールド獲得 +25%',
    bonuses: { crit: 12, goldMult: 0.25 }
  },
  {
    id: 'one_punch_god',
    name: 'ワンパンの神',
    desc: '一撃で敵の息の根を止める、圧倒的破壊力の体現者。',
    unlockCondition: '戦闘で一度に150以上のダメージを与える',
    bonusDesc: 'クリティカル率 +20%',
    bonuses: { crit: 20 }
  },
  {
    id: 'phoenix',
    name: '不滅の不死鳥',
    desc: '瀕死の極限状態から這い上がり、勝利を掴み取った生還者。',
    unlockCondition: 'HPが10%以下の瀕死状態で戦闘に勝利する',
    bonusDesc: '最大HP +40',
    bonuses: { hp: 40 }
  },
  {
    id: 'potion_master',
    name: '国家錬金術師',
    desc: '戦闘中にポーションをがぶ飲みし、ドーピングを極めた者。',
    unlockCondition: 'ポーション（アイテム）を累計15回以上使用する',
    bonusDesc: '最大MP +30, 防御力 +6',
    bonuses: { mp: 30, def: 6 }
  },
  {
    id: 'midas_touch',
    name: 'ミダスの黄金手',
    desc: '金貨の輝きに魅了され、富を蓄積した迷宮の富豪。',
    unlockCondition: '所持金が 5,000G を突破する',
    bonusDesc: 'ゴールド獲得 +20%',
    bonuses: { goldMult: 0.20 }
  },
  {
    id: 'dungeon_conqueror',
    name: '迷宮の支配者',
    desc: '立ちはだかる幾多のボスを薙ぎ倒し、ステージ4に到達した覇王。',
    unlockCondition: 'ステージ4に到達する',
    bonusDesc: '攻撃力 +10, 防御力 +10, 最大HP +25',
    bonuses: { atk: 10, def: 10, hp: 25 }
  },
  {
    id: 'developer_mode',
    name: '禁忌のデバッガー',
    desc: 'バグを書き換え世界の理を歪める、神の領域に立つ者。',
    unlockCondition: '初期から解放（お遊び・バズり枠称号）',
    bonusDesc: '攻撃力 +3, クリティカル率 +5%, ゴールド獲得 +5%',
    bonuses: { atk: 3, crit: 5, goldMult: 0.05 }
  },
  {
    id: 'astral_emperor',
    name: '星宿の超越覇王',
    desc: '最高峰 [LEGENDARY] 装備を2つ以上所持する、選ばれし天命。',
    unlockCondition: 'レジェンダリー装備を2つ以上所持する',
    bonusDesc: '攻撃力 +15, 防御力 +15, クリティカル率 +10%',
    bonuses: { atk: 15, def: 15, crit: 10 }
  }
];

// Calculate Title Bonus to apply to stats
export const getTitleBonuses = (titleId?: string) => {
  const title = TITLES.find(t => t.id === titleId);
  if (!title) return { atk: 0, def: 0, hp: 0, mp: 0, crit: 0, goldMult: 0 };
  return {
    atk: title.bonuses.atk || 0,
    def: title.bonuses.def || 0,
    hp: title.bonuses.hp || 0,
    mp: title.bonuses.mp || 0,
    crit: title.bonuses.crit || 0,
    goldMult: title.bonuses.goldMult || 0
  };
};

// Evaluate and unlock new titles for character
export const evaluateTitles = (char: CharacterState, currentStage: number, actionType?: string): { updatedChar: CharacterState, unlockedNow: string[] } => {
  const currentUnlocked = char.titlesUnlocked || ['developer_mode'];
  const unlockedNow: string[] = [];

  const gachaPulls = char.stats.gachaPulls || 0;
  const highestDamage = char.stats.highestDamage || 0;
  const itemsUsed = char.stats.itemsUsed || 0;
  const legendaryCount = [
    char.equipment.weapon,
    char.equipment.armor,
    char.equipment.accessory,
    ...char.inventory
  ].filter(item => item && item.rarity === 'legendary').length;

  const checkAndUnlock = (id: string) => {
    if (!currentUnlocked.includes(id)) {
      currentUnlocked.push(id);
      const title = TITLES.find(t => t.id === id);
      if (title) unlockedNow.push(title.name);
    }
  };

  // 1. 無課金の星: ガチャ回数が0回の状態でステージ2に到達する
  if (currentStage >= 2 && gachaPulls === 0) {
    checkAndUnlock('f2p_monarch');
  }

  // 2. 混沌のガチャ廃人: ガチャを20回以上引く
  if (gachaPulls >= 20) {
    checkAndUnlock('aether_whale');
  }

  // 3. ワンパンの神: 一撃で150以上のダメージ
  if (highestDamage >= 150) {
    checkAndUnlock('one_punch_god');
  }

  // 4. 不滅の不死鳥 (HPが10%以下の瀕死状態で戦闘に勝利、これはApp.tsx側の戦闘勝利時に評価される)
  if (actionType === 'phoenix_victory') {
    checkAndUnlock('phoenix');
  }

  // 5. 国家錬金術師: ポーションを累計15回以上使用
  if (itemsUsed >= 15) {
    checkAndUnlock('potion_master');
  }

  // 6. ミダスの黄金手: 所持金が 5,000G を突破する
  if (char.gold >= 5000) {
    checkAndUnlock('midas_touch');
  }

  // 7. 迷宮の支配者: ステージ4に到達
  if (currentStage >= 4) {
    checkAndUnlock('dungeon_conqueror');
  }

  // 9. 星宿の超越覇王: レジェンダリー装備を2つ以上
  if (legendaryCount >= 2) {
    checkAndUnlock('astral_emperor');
  }

  return {
    updatedChar: {
      ...char,
      titlesUnlocked: currentUnlocked
    },
    unlockedNow
  };
};
