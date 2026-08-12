import { Spell, CharacterState } from '../types';
import { MASSIVE_SPELL_LIST } from '../data/massiveSpellList';

// Standard level-up spells per MagicType Element
export const ELEMENTAL_SPELLS: Record<string, { level: number; spell: Spell }[]> = {
  fire: [
    {
      level: 1,
      spell: {
        id: 'fireball',
        name: 'ファイアボール',
        mpCost: 15,
        power: 45,
        desc: '敵単体に炎の塊を放つ。[火傷40%]',
        effectType: 'damage',
        rarity: 'common',
        statusEffect: { type: 'burn', chance: 0.4, duration: 3 }
      }
    },
    {
      level: 3,
      spell: {
        id: 'flame_wall',
        name: 'フレイムウォール',
        mpCost: 22,
        power: 65,
        desc: '炎の壁を出現させ、敵を圧迫する。[火傷50%]',
        effectType: 'damage',
        rarity: 'rare',
        statusEffect: { type: 'burn', chance: 0.5, duration: 3 }
      }
    },
    {
      level: 5,
      spell: {
        id: 'flame_burst',
        name: 'フレイムバースト',
        mpCost: 35,
        power: 95,
        desc: '強烈な爆風で敵を焼き尽くす。[火傷70%]',
        effectType: 'damage',
        rarity: 'epic',
        statusEffect: { type: 'burn', chance: 0.7, duration: 3 }
      }
    },
    {
      level: 8,
      spell: {
        id: 'meteor_strike',
        name: 'メテオストライク',
        mpCost: 55,
        power: 150,
        desc: '巨大な隕石を落とし、大爆発を引き起こす。[火傷80%]',
        effectType: 'damage',
        rarity: 'epic',
        statusEffect: { type: 'burn', chance: 0.8, duration: 3 }
      }
    },
    {
      level: 12,
      spell: {
        id: 'inferno_catastrophe',
        name: '獄炎インフェルノ',
        mpCost: 85,
        power: 240,
        desc: '万物を灰塵に帰す究極の天災地変火炎魔法。[火傷95%]',
        effectType: 'damage',
        rarity: 'legendary',
        statusEffect: { type: 'burn', chance: 0.95, duration: 4 }
      }
    }
  ],
  ice: [
    {
      level: 1,
      spell: {
        id: 'ice_lance',
        name: 'アイスランス',
        mpCost: 15,
        power: 40,
        desc: '鋭い氷の槍で敵を貫く。[凍結30%]',
        effectType: 'damage',
        rarity: 'common',
        statusEffect: { type: 'freeze', chance: 0.3, duration: 1 }
      }
    },
    {
      level: 3,
      spell: {
        id: 'freeze_bites',
        name: 'フリーズバイツ',
        mpCost: 20,
        power: 60,
        desc: '凍える冷気で敵を噛み裂く。[凍結40%]',
        effectType: 'damage',
        rarity: 'rare',
        statusEffect: { type: 'freeze', chance: 0.4, duration: 1 }
      }
    },
    {
      level: 5,
      spell: {
        id: 'blizzard',
        name: 'ブリザード',
        mpCost: 30,
        power: 80,
        desc: '吹雪で敵の動きを完全に封じる。[凍結60%]',
        effectType: 'damage',
        rarity: 'epic',
        statusEffect: { type: 'freeze', chance: 0.6, duration: 2 }
      }
    },
    {
      level: 8,
      spell: {
        id: 'glacial_prison',
        name: 'グラシアルプリズン',
        mpCost: 50,
        power: 130,
        desc: '巨大な氷柱で敵を閉じ込め大ダメージ。[凍結75%]',
        effectType: 'damage',
        rarity: 'epic',
        statusEffect: { type: 'freeze', chance: 0.75, duration: 2 }
      }
    },
    {
      level: 12,
      spell: {
        id: 'absolute_zero',
        name: '絶対零度アブソリュートゼロ',
        mpCost: 80,
        power: 220,
        desc: '全てを氷結させ時間を停止させる終焉の極致。[凍結90%]',
        effectType: 'damage',
        rarity: 'legendary',
        statusEffect: { type: 'freeze', chance: 0.9, duration: 3 }
      }
    }
  ],
  thunder: [
    {
      level: 1,
      spell: {
        id: 'spark',
        name: 'スパーク',
        mpCost: 12,
        power: 38,
        desc: '素早い電撃で敵を感電させる。[麻痺30%]',
        effectType: 'damage',
        rarity: 'common',
        statusEffect: { type: 'paralyze', chance: 0.3, duration: 1 }
      }
    },
    {
      level: 3,
      spell: {
        id: 'lightning_nova',
        name: 'ライトニングノヴァ',
        mpCost: 18,
        power: 58,
        desc: '周囲に高圧電流を放出し敵を威嚇する。[麻痺40%]',
        effectType: 'damage',
        rarity: 'rare',
        statusEffect: { type: 'paralyze', chance: 0.4, duration: 1 }
      }
    },
    {
      level: 5,
      spell: {
        id: 'thunderbolt',
        name: 'サンダーボルト',
        mpCost: 32,
        power: 90,
        desc: '天から強力な雷を落とし穿つ。[麻痺50%]',
        effectType: 'damage',
        rarity: 'epic',
        statusEffect: { type: 'paralyze', chance: 0.5, duration: 2 }
      }
    },
    {
      level: 8,
      spell: {
        id: 'gigabolt',
        name: '天雷ジゴバルト',
        mpCost: 55,
        power: 145,
        desc: '神なる雷鳴を敵に浴びせる超強力電撃。[麻痺75%]',
        effectType: 'damage',
        rarity: 'epic',
        statusEffect: { type: 'paralyze', chance: 0.75, duration: 2 }
      }
    },
    {
      level: 12,
      spell: {
        id: 'indra_roar',
        name: '雷神咆哮・インドラ',
        mpCost: 85,
        power: 235,
        desc: '神話の雷霆をもって、敵を塵芥へと変える。[麻痺90%]',
        effectType: 'damage',
        rarity: 'legendary',
        statusEffect: { type: 'paralyze', chance: 0.9, duration: 3 }
      }
    }
  ],
  holy: [
    {
      level: 1,
      spell: {
        id: 'heal',
        name: 'ヒール',
        mpCost: 15,
        power: 50,
        desc: '聖なる光で自身のHPを回復する。',
        effectType: 'heal',
        rarity: 'common'
      }
    },
    {
      level: 3,
      spell: {
        id: 'saint_barrier',
        name: 'セイントバリア',
        mpCost: 20,
        power: 40,
        desc: '光の盾を張り、HPを回復しバリア展開する。[シールド50%]',
        effectType: 'heal',
        rarity: 'rare',
        statusEffect: { type: 'shield', chance: 0.5, duration: 2 }
      }
    },
    {
      level: 5,
      spell: {
        id: 'holy_smite',
        name: 'ホーリースマイト',
        mpCost: 28,
        power: 75,
        desc: '神聖な光の槌で邪悪を打ち砕く。',
        effectType: 'damage',
        rarity: 'epic'
      }
    },
    {
      level: 8,
      spell: {
        id: 'divine_blessing',
        name: 'ゴッドブレッシング',
        mpCost: 45,
        power: 140,
        desc: '天界の祝福により、膨大なHPを急速回復。',
        effectType: 'heal',
        rarity: 'epic'
      }
    },
    {
      level: 12,
      spell: {
        id: 'last_judgment',
        name: 'ラスト・ジャッジメント',
        mpCost: 75,
        power: 210,
        desc: '最後の審判。神の光で敵の生命を極大強奪する。',
        effectType: 'drain',
        rarity: 'legendary'
      }
    }
  ],
  dark: [
    {
      level: 1,
      spell: {
        id: 'drain',
        name: 'ライフドレイン',
        mpCost: 18,
        power: 45,
        desc: '敵の生命力を奪い、HPを吸収する。[毒40%]',
        effectType: 'drain',
        rarity: 'common',
        statusEffect: { type: 'poison', chance: 0.4, duration: 3 }
      }
    },
    {
      level: 3,
      spell: {
        id: 'chaos_curse',
        name: 'カオスコーション',
        mpCost: 22,
        power: 60,
        desc: '昏き呪いで、継続して生命力を蝕む。[毒50%]',
        effectType: 'damage',
        rarity: 'rare',
        statusEffect: { type: 'poison', chance: 0.5, duration: 3 }
      }
    },
    {
      level: 5,
      spell: {
        id: 'dark_nova',
        name: 'ダークノヴァ',
        mpCost: 35,
        power: 100,
        desc: '虚無の闇で敵の空間ごと抉り取る。[毒70%]',
        effectType: 'damage',
        rarity: 'epic',
        statusEffect: { type: 'poison', chance: 0.7, duration: 4 }
      }
    },
    {
      level: 8,
      spell: {
        id: 'abyss_aspiration',
        name: 'アビスアスピレイション',
        mpCost: 52,
        power: 140,
        desc: '深淵の渇望。敵のエネルギーを貪り喰らうHP吸収魔法。',
        effectType: 'drain',
        rarity: 'epic',
        statusEffect: { type: 'poison', chance: 0.5, duration: 3 }
      }
    },
    {
      level: 12,
      spell: {
        id: 'thanatos_descent',
        name: '冥界降臨・サナトス',
        mpCost: 90,
        power: 250,
        desc: '死神サナトスを降臨させ魂を刈り取る暗黒極大呪術。[毒90%]',
        effectType: 'damage',
        rarity: 'legendary',
        statusEffect: { type: 'poison', chance: 0.9, duration: 4 }
      }
    }
  ]
};

// Gacha-Exclusive Spells (Usable by any character, extremely powerful!)
export const GACHA_EXCLUSIVE_SPELLS: Spell[] = [
  // EPIC GACHA-EXCLUSIVE SPELLS
  {
    id: 'gacha_flame_wave',
    name: '【覇王爆炎波】',
    mpCost: 45,
    power: 120,
    desc: '【ガチャ限定】周囲を薙ぎ払う劫火の波動。[火傷75%]',
    effectType: 'damage',
    rarity: 'epic',
    statusEffect: { type: 'burn', chance: 0.75, duration: 3 }
  },
  {
    id: 'gacha_icicle_dolls',
    name: '【アイシクル・ドールズ】',
    mpCost: 40,
    power: 110,
    desc: '【ガチャ限定】氷の妖精が放つ鋭い槍の連弾。[凍結65%]',
    effectType: 'damage',
    rarity: 'epic',
    statusEffect: { type: 'freeze', chance: 0.65, duration: 2 }
  },
  {
    id: 'gacha_thunder_spark',
    name: '【瞬迅プラズマエッジ】',
    mpCost: 38,
    power: 115,
    desc: '【ガチャ限定】光速のプラズマをまとう刃で裂く。[麻痺60%]',
    effectType: 'damage',
    rarity: 'epic',
    statusEffect: { type: 'paralyze', chance: 0.60, duration: 2 }
  },
  {
    id: 'gacha_chaos_rupture',
    name: '【冥風カオスラプチャー】',
    mpCost: 50,
    power: 130,
    desc: '【ガチャ限定】昏き混沌の風で肉体を蝕む呪法。[毒80%]',
    effectType: 'damage',
    rarity: 'epic',
    statusEffect: { type: 'poison', chance: 0.80, duration: 4 }
  },
  {
    id: 'gacha_sacred_shield',
    name: '【天界のガーディアン】',
    mpCost: 35,
    power: 90,
    desc: '【ガチャ限定】天使を召喚しHPを大きく回復。[シールド80%]',
    effectType: 'heal',
    rarity: 'epic',
    statusEffect: { type: 'shield', chance: 0.80, duration: 3 }
  },

  // LEGENDARY GACHA-EXCLUSIVE SPELLS (ULTIMATE)
  {
    id: 'gacha_genesis_apocalypse',
    name: '『創世のアポカリプス』',
    mpCost: 80,
    power: 260,
    desc: '【限定最強魔法】混沌から新世界を紡ぎ出す炎と光の融合超極大呪術。[火傷100%]',
    effectType: 'damage',
    rarity: 'legendary',
    statusEffect: { type: 'burn', chance: 1.0, duration: 4 }
  },
  {
    id: 'gacha_ragnarok_void',
    name: '『次元崩壊ラグナロク』',
    mpCost: 95,
    power: 320,
    desc: '【限定最強魔法】神々の黄昏を招く暗黒絶対時空。敵の全生気を強奪[HP吸収50%]',
    effectType: 'drain',
    rarity: 'legendary',
    statusEffect: { type: 'poison', chance: 0.85, duration: 4 }
  },
  {
    id: 'gacha_seraphic_ultimatia',
    name: '『天使長のアルテマティア』',
    mpCost: 85,
    power: 280,
    desc: '【限定最強魔法】大天使長が裁きを下す。極大聖光ダメージ。[麻痺80%]',
    effectType: 'damage',
    rarity: 'legendary',
    statusEffect: { type: 'paralyze', chance: 0.8, duration: 2 }
  },
  {
    id: 'gacha_absolute_sanctuary',
    name: '『終焉のエリクシル』',
    mpCost: 65,
    power: 240,
    desc: '【限定最強回復】森羅万象を癒やす創生の霊水。HPを極大回復。[シールド100%]',
    effectType: 'heal',
    rarity: 'legendary',
    statusEffect: { type: 'shield', chance: 1.0, duration: 3 }
  }
];

// Combine standard, exclusive, and massive 200+ spell database for random rolls in Magic Gacha
export const ALL_PULLABLE_SPELLS: Spell[] = [
  ...MASSIVE_SPELL_LIST,
  ...GACHA_EXCLUSIVE_SPELLS,
  ...ELEMENTAL_SPELLS.fire.map(entry => entry.spell),
  ...ELEMENTAL_SPELLS.ice.map(entry => entry.spell),
  ...ELEMENTAL_SPELLS.thunder.map(entry => entry.spell),
  ...ELEMENTAL_SPELLS.holy.map(entry => entry.spell),
  ...ELEMENTAL_SPELLS.dark.map(entry => entry.spell)
];

/**
 * Checks and automatically unlocks any elemental spells the player has level-unlocked.
 */
export function checkAndUnlockLevelUpSpells(character: CharacterState, level: number): { updatedChar: CharacterState; unlockedSpells: Spell[] } {
  const elementId = character.magicType.id;
  const spellPool = ELEMENTAL_SPELLS[elementId] || [];
  
  const unlockedSpells: Spell[] = [];
  const currentSpellIds = new Set(character.spells.map(s => s.id));
  
  spellPool.forEach(entry => {
    if (level >= entry.level && !currentSpellIds.has(entry.spell.id)) {
      unlockedSpells.push(entry.spell);
    }
  });
  
  if (unlockedSpells.length > 0) {
    return {
      updatedChar: {
        ...character,
        spells: [...character.spells, ...unlockedSpells]
      },
      unlockedSpells
    };
  }
  
  return { updatedChar: character, unlockedSpells: [] };
}

/**
 * Rolls magic gacha pulls.
 * Rarities: Common, Rare, Epic, Legendary
 * Higher reincarnation levels boost Legendary & Epic drop rates!
 */
export function rollMagicGacha(count: number, playerLevel: number, reincarnationCount: number = 0): Spell[] {
  const results: Spell[] = [];
  
  // Reincarnation bonuses boost legendary rate by +4% per reincarnation
  const baseLegendaryChance = 0.05 + Math.min(0.35, reincarnationCount * 0.04);
  const baseEpicChance = 0.20 + Math.min(0.30, reincarnationCount * 0.03);
  const baseRareChance = 0.50;

  for (let i = 0; i < count; i++) {
    const roll = Math.random();
    let targetRarity: 'common' | 'rare' | 'epic' | 'legendary' = 'common';
    
    if (roll < baseLegendaryChance) {
      targetRarity = 'legendary';
    } else if (roll < baseEpicChance) {
      targetRarity = 'epic';
    } else if (roll < baseRareChance) {
      targetRarity = 'rare';
    } else {
      targetRarity = 'common';
    }
    
    // Filter spells matching that rarity
    let pool = ALL_PULLABLE_SPELLS.filter(s => s.rarity === targetRarity);
    if (pool.length === 0) {
      pool = ALL_PULLABLE_SPELLS;
    }
    
    // Pick random spell and clone it
    const baseSpell = pool[Math.floor(Math.random() * pool.length)];
    const spellClone: Spell = {
      ...baseSpell,
      // Enhance power slightly if player level or reincarnation count is high
      power: Math.floor(baseSpell.power * (1 + (playerLevel - 1) * 0.02 + reincarnationCount * 0.05))
    };
    
    results.push(spellClone);
  }
  
  return results;
}
