import { Item } from '../types';

export function generateRandomLoot(playerLevel: number, stageNumber: number, isEliteOrBoss: boolean = false): Item {
  const rand = Math.random();
  // Rarity determination based on stage and elite/boss status
  let rarity: Item['rarity'] = 'common';
  const epicThreshold = isEliteOrBoss ? 0.35 : 0.15;
  const rareThreshold = isEliteOrBoss ? 0.70 : 0.50;
  const legendaryThreshold = isEliteOrBoss ? 0.10 : 0.02;

  if (Math.random() < legendaryThreshold) {
    rarity = 'legendary';
  } else if (rand < epicThreshold) {
    rarity = 'epic';
  } else if (rand < rareThreshold) {
    rarity = 'rare';
  } else {
    rarity = 'common';
  }

  // Item type determination: 35% weapon, 30% armor, 15% accessory, 12% potion, 8% scroll
  const typeRand = Math.random();
  let type: Item['type'] = 'weapon';
  if (typeRand < 0.35) type = 'weapon';
  else if (typeRand < 0.65) type = 'armor';
  else if (typeRand < 0.80) type = 'accessory';
  else if (typeRand < 0.92) type = 'potion';
  else type = 'scroll';

  const multiplier = 1 + (playerLevel - 1) * 0.25 + (stageNumber - 1) * 0.35;
  const rarityMultiplier = rarity === 'legendary' ? 2.5 : rarity === 'epic' ? 1.8 : rarity === 'rare' ? 1.3 : 1.0;
  const finalScale = multiplier * rarityMultiplier;

  if (type === 'weapon') {
    const weaponNames = {
      common: ['鉄の短剣', 'ブロンズメイス', 'ハンターソード'],
      rare: ['ミスリルソード', '騎士のサーベル', 'ウィンドスピア'],
      epic: ['フレイムブランド', 'アイスエッジ', '雷鳴の大剣'],
      legendary: ['アストラル・エクスカリバー', '神剣ラグナロク', 'ヴォイド・ブレード'],
    };
    const nameList = weaponNames[rarity];
    const name = nameList[Math.floor(Math.random() * nameList.length)];
    const atkVal = Math.floor((10 + Math.random() * 12) * finalScale);
    const spdVal = Math.random() > 0.5 ? Math.floor(2 * rarityMultiplier) : 0;

    return {
      id: `loot_w_${Date.now()}_${Math.random()}`,
      name,
      type: 'weapon',
      rarity,
      stats: { atk: atkVal, spd: spdVal },
      desc: `[${rarity.toUpperCase()}] 攻撃力+${atkVal}${spdVal > 0 ? `, 素早さ+${spdVal}` : ''}の強力な武器。`,
      price: Math.floor(80 * finalScale),
      icon: 'Sword',
    };
  } else if (type === 'armor') {
    const armorNames = {
      common: ['革の胸当て', 'ブロンズアーマー', '旅人のローブ'],
      rare: ['鋼鉄の鎧', '魔法のチェインメイル', '精霊の衣'],
      epic: ['ドラゴンメイル', '聖騎士の鎧', 'アビスローブ'],
      legendary: ['神竜の鎧', '星屑のローブ', 'イージスの守護鎧'],
    };
    const nameList = armorNames[rarity];
    const name = nameList[Math.floor(Math.random() * nameList.length)];
    const defVal = Math.floor((8 + Math.random() * 10) * finalScale);
    const hpVal = Math.floor((20 + Math.random() * 30) * finalScale);

    return {
      id: `loot_a_${Date.now()}_${Math.random()}`,
      name,
      type: 'armor',
      rarity,
      stats: { def: defVal, hp: hpVal },
      desc: `[${rarity.toUpperCase()}] 防御力+${defVal}, 最大HP+${hpVal}の堅固な防具。`,
      price: Math.floor(75 * finalScale),
      icon: 'Shield',
    };
  } else if (type === 'accessory') {
    const accNames = {
      common: ['銅の指輪', '古い護符', 'ガラスのペンダント'],
      rare: ['魔力のアミュレット', '疾風のリング', '幸運のクローバー'],
      epic: ['太陽のペンダント', 'ルビーの指輪', '英雄の証'],
      legendary: ['星空のタリスマン', '神々の王冠', '時空の砂時計'],
    };
    const nameList = accNames[rarity];
    const name = nameList[Math.floor(Math.random() * nameList.length)];
    const spdVal = Math.floor((3 + Math.random() * 5) * rarityMultiplier);
    const critVal = Math.floor((3 + Math.random() * 7) * rarityMultiplier);

    return {
      id: `loot_acc_${Date.now()}_${Math.random()}`,
      name,
      type: 'accessory',
      rarity,
      stats: { spd: spdVal, crit: critVal },
      desc: `[${rarity.toUpperCase()}] 素早さ+${spdVal}, クリティカル率+${critVal}%の神秘的な装飾品。`,
      price: Math.floor(120 * finalScale),
      icon: 'Sparkles',
    };
  } else if (type === 'potion') {
    if (rarity === 'legendary') {
      return {
        id: `loot_p_${Date.now()}_${Math.random()}`,
        name: '不死鳥の神霊薬',
        type: 'potion',
        rarity,
        effect: { type: 'healHp', value: 400 },
        desc: '[LEGENDARY] HPを400回復する、神々の技術で作られた究極の神霊薬。',
        price: 250,
        icon: 'FlaskConical',
      };
    } else if (rarity === 'epic') {
      const isHp = Math.random() > 0.5;
      return {
        id: `loot_p_${Date.now()}_${Math.random()}`,
        name: isHp ? '極大生命ポーション' : '極大魔力エリクサー',
        type: 'potion',
        rarity,
        effect: isHp ? { type: 'healHp', value: 200 } : { type: 'healMp', value: 120 },
        desc: isHp ? '[EPIC] HPを200回復する最高峰の治療薬。' : '[EPIC] MPを120回復する最高峰のエリクサー。',
        price: 120,
        icon: 'FlaskConical',
      };
    } else if (rarity === 'rare') {
      const isHp = Math.random() > 0.5;
      return {
        id: `loot_p_${Date.now()}_${Math.random()}`,
        name: isHp ? '上級HPポーション' : '上級マナポーション',
        type: 'potion',
        rarity,
        effect: isHp ? { type: 'healHp', value: 100 } : { type: 'healMp', value: 60 },
        desc: isHp ? '[RARE] HPを100回復する良質なポーション。' : '[RARE] MPを60回復する良質なマナ水。',
        price: 70,
        icon: 'FlaskConical',
      };
    } else {
      const isHp = Math.random() > 0.5;
      return {
        id: `loot_p_${Date.now()}_${Math.random()}`,
        name: isHp ? '初級HPポーション' : '初級マナポーション',
        type: 'potion',
        rarity,
        effect: isHp ? { type: 'healHp', value: 50 } : { type: 'healMp', value: 30 },
        desc: isHp ? '[COMMON] HPを50回復するポーション。' : '[COMMON] MPを30回復する魔力ポーション。',
        price: 30,
        icon: 'FlaskConical',
      };
    }
  } else {
    if (rarity === 'legendary') {
      return {
        id: `loot_sc_${Date.now()}_${Math.random()}`,
        name: '竜神の刻印書',
        type: 'scroll',
        rarity,
        effect: { type: 'boostMaxHp', value: 40 },
        desc: '[LEGENDARY] 使用すると、恒久的に最大HPが +40（他の能力値も上昇）される伝説の刻印書。',
        price: 450,
        icon: 'Sparkles',
      };
    } else if (rarity === 'epic') {
      const roll = Math.random();
      if (roll < 0.5) {
        return {
          id: `loot_sc_${Date.now()}_${Math.random()}`,
          name: '覇王の極秘戦術書',
          type: 'scroll',
          rarity,
          effect: { type: 'boostAtk', value: 6 },
          desc: '[EPIC] 使用すると、恒久的に攻撃力が +6 上昇する伝説の戦術書。',
          price: 300,
          icon: 'Sparkles',
        };
      } else {
        return {
          id: `loot_sc_${Date.now()}_${Math.random()}`,
          name: '聖騎士の誓い石',
          type: 'scroll',
          rarity,
          effect: { type: 'boostDef', value: 5 },
          desc: '[EPIC] 使用すると、恒久的に防御力が +5 上昇する神秘の守護石。',
          price: 280,
          icon: 'Shield',
        };
      }
    } else if (rarity === 'rare') {
      const roll = Math.random();
      if (roll < 0.33) {
        return {
          id: `loot_sc_${Date.now()}_${Math.random()}`,
          name: '腕力の古文書',
          type: 'scroll',
          rarity,
          effect: { type: 'boostAtk', value: 3 },
          desc: '[RARE] 使用すると、恒久的に攻撃力が +3 上昇する貴重な古文書。',
          price: 180,
          icon: 'Sparkles',
        };
      } else if (roll < 0.66) {
        return {
          id: `loot_sc_${Date.now()}_${Math.random()}`,
          name: '守護の古文書',
          type: 'scroll',
          rarity,
          effect: { type: 'boostDef', value: 3 },
          desc: '[RARE] 使用すると、恒久的に防御力が +3 上昇する貴重な古文書。',
          price: 180,
          icon: 'Shield',
        };
      } else {
        return {
          id: `loot_sc_${Date.now()}_${Math.random()}`,
          name: '幸運のタリスマン',
          type: 'scroll',
          rarity,
          effect: { type: 'boostCrit', value: 3 },
          desc: '[RARE] 使用すると、恒久的にクリティカル率が +3% 上昇するお守り。',
          price: 200,
          icon: 'Sparkles',
        };
      }
    } else {
      const roll = Math.random();
      if (roll < 0.5) {
        return {
          id: `loot_sc_${Date.now()}_${Math.random()}`,
          name: '腕力の秘薬',
          type: 'scroll',
          rarity,
          effect: { type: 'boostAtk', value: 1 },
          desc: '[COMMON] 使用すると、恒久的に攻撃力が +1 上昇する秘薬。',
          price: 100,
          icon: 'FlaskConical',
        };
      } else {
        return {
          id: `loot_sc_${Date.now()}_${Math.random()}`,
          name: '守護の秘薬',
          type: 'scroll',
          rarity,
          effect: { type: 'boostDef', value: 1 },
          desc: '[COMMON] 使用すると、恒久的に防御力が +1 上昇する秘薬。',
          price: 100,
          icon: 'FlaskConical',
        };
      }
    }
  }
}

export function generateRandomWand(playerLevel: number, stageNumber: number): Item {
  const rand = Math.random();
  let rarity: Item['rarity'] = 'common';
  if (rand < 0.04) {
    rarity = 'legendary';
  } else if (rand < 0.18) {
    rarity = 'epic';
  } else if (rand < 0.48) {
    rarity = 'rare';
  } else {
    rarity = 'common';
  }

  const multiplier = 1 + (playerLevel - 1) * 0.25 + (stageNumber - 1) * 0.35;
  const rarityMultiplier = rarity === 'legendary' ? 2.5 : rarity === 'epic' ? 1.8 : rarity === 'rare' ? 1.3 : 1.0;
  const finalScale = multiplier * rarityMultiplier;

  const wandNames = {
    common: ['見習いのオーク杖', 'マギガジェット・ロッド', '古いルーンの小枝'],
    rare: ['アメジスト・スペルスタッフ', '疾風のエレメンタルワンド', '賢者の魔道ステッキ'],
    epic: ['フェニックスの劫火杖', '凍てつくグラシアルロッド', '雷霆のヴォルテックススタッフ'],
    legendary: ['太古の創世アストラルスタッフ', '魔神アザトースの深淵魔杖', '大天使セファリムの聖光杖'],
  };
  
  const nameList = wandNames[rarity];
  const name = nameList[Math.floor(Math.random() * nameList.length)];
  const atkVal = Math.floor((4 + Math.random() * 5) * finalScale);
  const mpVal = Math.floor((15 + Math.random() * 15) * finalScale);
  const critVal = rarity === 'legendary' ? 10 : rarity === 'epic' ? 6 : rarity === 'rare' ? 3 : 0;

  return {
    id: `loot_wand_${Date.now()}_${Math.random()}`,
    name,
    type: 'weapon',
    rarity,
    stats: { atk: atkVal, mp: mpVal, ...(critVal > 0 ? { crit: critVal } : {}) },
    desc: `[${rarity.toUpperCase()}] 攻撃力+${atkVal}, 最大MP+${mpVal}${critVal > 0 ? `, クリティカル+${critVal}%` : ''}の魔道士・神官向けの神秘的な魔杖。`,
    price: Math.floor(110 * finalScale),
    icon: 'Sparkles',
  };
}
