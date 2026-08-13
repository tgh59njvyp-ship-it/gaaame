import { Item } from '../types';

export function generateRandomLoot(playerLevel: number, stageNumber: number, isEliteOrBoss: boolean = false): Item {
  const rand = Math.random();
  // Rarity determination based on stage and elite/boss status (including Mythic & Divine)
  let rarity: Item['rarity'] = 'common';
  const divineChance = isEliteOrBoss ? 0.04 : 0.008; // 0.8% ~ 4%
  const mythicChance = isEliteOrBoss ? 0.12 : 0.025; // 2.5% ~ 12%
  const legendaryChance = isEliteOrBoss ? 0.22 : 0.06; // 6% ~ 22%
  const epicThreshold = isEliteOrBoss ? 0.45 : 0.20;
  const rareThreshold = isEliteOrBoss ? 0.75 : 0.55;

  if (Math.random() < divineChance) {
    rarity = 'divine';
  } else if (Math.random() < mythicChance) {
    rarity = 'mythic';
  } else if (Math.random() < legendaryChance) {
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
  const rarityMultiplier = rarity === 'divine' ? 7.0 : rarity === 'mythic' ? 4.5 : rarity === 'legendary' ? 2.5 : rarity === 'epic' ? 1.8 : rarity === 'rare' ? 1.3 : 1.0;
  const finalScale = multiplier * rarityMultiplier;

  if (type === 'weapon') {
    const weaponNames = {
      common: ['鉄の短剣', 'ブロンズメイス', 'ハンターソード'],
      rare: ['ミスリルソード', '騎士のサーベル', 'ウィンドスピア'],
      epic: ['フレイムブランド', 'アイスエッジ', '雷鳴の大剣'],
      legendary: ['アストラル・エクスカリバー', '神剣ラグナロク', 'ヴォイド・ブレード'],
      mythic: ['神話創世バルムンク', '終焉の滅世大剣', '星辰のソウル・レイピア'],
      divine: ['創世神剣ジ・エデン', '天極聖剣ラグナロク・ゼロ', '虚空王の裁断鎌'],
    };
    const nameList = weaponNames[rarity];
    const name = nameList[Math.floor(Math.random() * nameList.length)];
    const atkVal = Math.floor((10 + Math.random() * 12) * finalScale);
    const spdVal = Math.random() > 0.3 ? Math.floor(3 * rarityMultiplier) : 0;

    return {
      id: `loot_w_${Date.now()}_${Math.random()}`,
      name,
      type: 'weapon',
      rarity,
      stats: { atk: atkVal, spd: spdVal },
      desc: `[${rarity.toUpperCase()}] 攻撃力+${atkVal}${spdVal > 0 ? `, 素早さ+${spdVal}` : ''}の究極なる武具。`,
      price: Math.floor(80 * finalScale),
      icon: 'Sword',
    };
  } else if (type === 'armor') {
    const armorNames = {
      common: ['革の胸当て', 'ブロンズアーマー', '旅人のローブ'],
      rare: ['鋼鉄の鎧', '魔法のチェインメイル', '精霊の衣'],
      epic: ['ドラゴンメイル', '聖騎士の鎧', 'アビスローブ'],
      legendary: ['神竜の鎧', '星屑のローブ', 'イージスの守護鎧'],
      mythic: ['神竜王の滅世鎧', '星屑のアルケミーローブ', '不滅の覇王プレート'],
      divine: ['神絶衣ゼニス・アーマー', '天界王の聖なる光輪', '次元超越のイージス装甲'],
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
      mythic: ['神話の霊石タリスマン', '太陽王の黄金冠', '時空の砂時計・真'],
      divine: ['全知全能の創世眼', '無限宇宙のクロノ・ペンダント', '神絶のソロモン・リング'],
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
    if (rarity === 'divine') {
      return {
        id: `loot_p_${Date.now()}_${Math.random()}`,
        name: '創世神域の霊泉エリクサー',
        type: 'potion',
        rarity,
        effect: { type: 'healHp', value: 800 },
        desc: '[DIVINE] HPを800回復する、創世の神域で湧き出た究極の霊泉。',
        price: 600,
        icon: 'FlaskConical',
      };
    } else if (rarity === 'mythic') {
      return {
        id: `loot_p_${Date.now()}_${Math.random()}`,
        name: '神話級不死鳥の魂水',
        type: 'potion',
        rarity,
        effect: { type: 'healHp', value: 550 },
        desc: '[MYTHIC] HPを550回復する、神話級の霊薬。',
        price: 350,
        icon: 'FlaskConical',
      };
    } else if (rarity === 'legendary') {
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
    if (rarity === 'divine') {
      return {
        id: `loot_sc_${Date.now()}_${Math.random()}`,
        name: '創世神の天界聖書',
        type: 'scroll',
        rarity,
        effect: { type: 'boostMaxHp', value: 80 },
        desc: '[DIVINE] 使用すると、恒久的に最大HPが +80（全能力値大幅上昇）される天界の聖書。',
        price: 800,
        icon: 'Sparkles',
      };
    } else if (rarity === 'mythic') {
      return {
        id: `loot_sc_${Date.now()}_${Math.random()}`,
        name: '神話覇王の秘術書',
        type: 'scroll',
        rarity,
        effect: { type: 'boostAtk', value: 12 },
        desc: '[MYTHIC] 使用すると、恒久的に攻撃力が +12 上昇する神話級の秘術書。',
        price: 550,
        icon: 'Sparkles',
      };
    } else if (rarity === 'legendary') {
      return {
        id: `loot_sc_${Date.now()}_${Math.random()}`,
        name: '竜神の刻印書',
        type: 'scroll',
        rarity,
        effect: { type: 'boostMaxHp', value: 40 },
        desc: '[LEGENDARY] 使用すると、恒久的に最大HPが +40 される伝説の刻印書。',
        price: 450,
        icon: 'Sparkles',
      };
    } else if (rarity === 'epic') {
      return {
        id: `loot_sc_${Date.now()}_${Math.random()}`,
        name: '覇王の極秘戦術書',
        type: 'scroll',
        rarity,
        effect: { type: 'boostAtk', value: 6 },
        desc: '[EPIC] 使用すると、恒久的に攻撃力が +6 上昇する戦術書。',
        price: 300,
        icon: 'Sparkles',
      };
    } else if (rarity === 'rare') {
      return {
        id: `loot_sc_${Date.now()}_${Math.random()}`,
        name: '腕力の古文書',
        type: 'scroll',
        rarity,
        effect: { type: 'boostAtk', value: 3 },
        desc: '[RARE] 使用すると、恒久的に攻撃力が +3 上昇する古文書。',
        price: 180,
        icon: 'Sparkles',
      };
    } else {
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
    }
  }
}

export function generateRandomWand(playerLevel: number, stageNumber: number): Item {
  const rand = Math.random();
  let rarity: Item['rarity'] = 'common';
  if (rand < 0.01) {
    rarity = 'divine';
  } else if (rand < 0.04) {
    rarity = 'mythic';
  } else if (rand < 0.10) {
    rarity = 'legendary';
  } else if (rand < 0.25) {
    rarity = 'epic';
  } else if (rand < 0.55) {
    rarity = 'rare';
  } else {
    rarity = 'common';
  }

  const multiplier = 1 + (playerLevel - 1) * 0.25 + (stageNumber - 1) * 0.35;
  const rarityMultiplier = rarity === 'divine' ? 7.0 : rarity === 'mythic' ? 4.5 : rarity === 'legendary' ? 2.5 : rarity === 'epic' ? 1.8 : rarity === 'rare' ? 1.3 : 1.0;
  const finalScale = multiplier * rarityMultiplier;

  const wandNames = {
    common: ['見習いのオーク杖', 'マギガジェット・ロッド', '古いルーンの小枝'],
    rare: ['アメジスト・スペルスタッフ', '疾風のエレメンタルワンド', '賢者の魔道ステッキ'],
    epic: ['フェニックスの劫火杖', '凍てつくグラシアルロッド', '雷霆のヴォルテックススタッフ'],
    legendary: ['太古の創世アストラルスタッフ', '魔神アザトースの深淵魔杖', '大天使セファリムの聖光杖'],
    mythic: ['神話創世の創世魔杖', '虚空星辰のアルケミーワンド', '天変地異のオメガロッド'],
    divine: ['創世神域のエデン・スタッフ', '神絶天界のアルティメットワンド', '全知全能のオムニロッド'],
  };
  
  const nameList = wandNames[rarity];
  const name = nameList[Math.floor(Math.random() * nameList.length)];
  const atkVal = Math.floor((4 + Math.random() * 5) * finalScale);
  const mpVal = Math.floor((15 + Math.random() * 15) * finalScale);
  const critVal = rarity === 'divine' ? 18 : rarity === 'mythic' ? 14 : rarity === 'legendary' ? 10 : rarity === 'epic' ? 6 : rarity === 'rare' ? 3 : 0;

  return {
    id: `loot_wand_${Date.now()}_${Math.random()}`,
    name,
    type: 'weapon',
    rarity,
    stats: { atk: atkVal, mp: mpVal, ...(critVal > 0 ? { crit: critVal } : {}) },
    desc: `[${rarity.toUpperCase()}] 攻撃力+${atkVal}, 最大MP+${mpVal}${critVal > 0 ? `, クリティカル+${critVal}%` : ''}の神秘的な魔杖。`,
    price: Math.floor(110 * finalScale),
    icon: 'Sparkles',
  };
}

export function generateSynthesizedLoot(materials: Item[], playerLevel: number): Item {
  if (materials.length === 0) {
    return generateRandomLoot(playerLevel, 1, false);
  }

  const rarityScores: Record<Item['rarity'], number> = {
    common: 1,
    rare: 2,
    epic: 3,
    legendary: 4,
    mythic: 5,
    divine: 6,
  };

  const totalScore = materials.reduce((acc, m) => acc + (rarityScores[m.rarity] || 1), 0);
  const avgScore = totalScore / materials.length;

  const countBonus = (materials.length - 2) * 0.4;
  const finalScore = avgScore + countBonus;

  let targetRarity: Item['rarity'] = 'common';
  const rand = Math.random();

  if (finalScore >= 5.8) {
    targetRarity = rand < 0.45 ? 'divine' : 'mythic';
  } else if (finalScore >= 4.8) {
    targetRarity = rand < 0.70 ? 'mythic' : 'legendary';
  } else if (finalScore >= 4.0) {
    targetRarity = 'legendary';
  } else if (finalScore >= 3.0) {
    targetRarity = rand < 0.60 ? 'legendary' : 'epic';
  } else if (finalScore >= 2.0) {
    targetRarity = rand < 0.30 ? 'epic' : 'rare';
  } else {
    targetRarity = rand < 0.80 ? 'rare' : 'common';
  }

  const alchemyStage = Math.max(1, Math.min(10, Math.ceil(playerLevel / 3) + 2));
  
  const typeRand = Math.random();
  let type: Item['type'] = 'weapon';
  if (typeRand < 0.38) type = 'weapon';
  else if (typeRand < 0.70) type = 'armor';
  else if (typeRand < 0.85) type = 'accessory';
  else if (typeRand < 0.94) type = 'potion';
  else type = 'scroll';

  const multiplier = (1 + (playerLevel - 1) * 0.28 + (alchemyStage - 1) * 0.4) * 1.25;
  const rarityMultiplier = targetRarity === 'divine' ? 7.0 : targetRarity === 'mythic' ? 4.5 : targetRarity === 'legendary' ? 2.8 : targetRarity === 'epic' ? 2.0 : targetRarity === 'rare' ? 1.4 : 1.1;
  const finalScale = multiplier * rarityMultiplier;

  const prefixes = ['【錬成】', '【精霊錬成】', '【アルケミー】', '【錬成秘術】', '【創生】'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];

  if (type === 'weapon') {
    const weaponNames = {
      common: ['真鍮の剣', '練鉄の斧', '試作のコンバットナイフ'],
      rare: ['アルケミーレイピア', 'エレメンタル・バスター', '銀嶺のハルバード'],
      epic: ['極光のソウルブレード', '滅界のアルケミーアックス', '聖霊の神速大剣'],
      legendary: ['真理の扉・万物裁断剣', '錬金神のオメガブレード', '創世神話の断罪杖'],
      mythic: ['神話創世のアルケミーブレード', '虚空王の極大断頭剣', '天変地異のオメガスタッフ'],
      divine: ['創世神絶ジ・エデン・ブレード', '天界王のアルティメットソード', '全知全能のオムニ・カタストロフィ'],
    };
    const nameList = weaponNames[targetRarity];
    const baseName = nameList[Math.floor(Math.random() * nameList.length)];
    const name = `${prefix}${baseName}`;
    const atkVal = Math.floor((12 + Math.random() * 14) * finalScale);
    const spdVal = Math.floor((2 + Math.random() * 4) * rarityMultiplier);

    return {
      id: `syn_w_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name,
      type: 'weapon',
      rarity: targetRarity,
      stats: { atk: atkVal, spd: spdVal },
      desc: `[錬成武具 - ${targetRarity.toUpperCase()}] 複数の素材を錬金釜で融合精製した究極の武具。攻撃力+${atkVal}, 素早さ+${spdVal}`,
      price: Math.floor(150 * finalScale),
      icon: 'Sword',
    };
  } else if (type === 'armor') {
    const armorNames = {
      common: ['強化革の胸当て', 'ブロンズアーマー', '密林の防護服'],
      rare: ['アニマ・プレートアーマー', '錬成ミスリルメイル', '精霊織のルーン衣'],
      epic: ['竜鱗のアルケミープレート', '絶対防御のイージスローブ', '天界の聖重装甲'],
      legendary: ['万有引力の神輝装甲', '絶対零度の星界甲冑', '不滅神獣のルーンアーマー'],
      mythic: ['神話級アストラル・プレート', '虚空星辰の守護衣', '創世神獣のルーンアーマー'],
      divine: ['創世神絶ゼニス・アーマー', '天界王のインフィニティ衣', '全知全能のイージス・シールド'],
    };
    const nameList = armorNames[targetRarity];
    const baseName = nameList[Math.floor(Math.random() * nameList.length)];
    const name = `${prefix}${baseName}`;
    const defVal = Math.floor((10 + Math.random() * 12) * finalScale);
    const hpVal = Math.floor((25 + Math.random() * 35) * finalScale);

    return {
      id: `syn_a_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name,
      type: 'armor',
      rarity: targetRarity,
      stats: { def: defVal, hp: hpVal },
      desc: `[錬成防具 - ${targetRarity.toUpperCase()}] 錬金秘術によって鍛え上げられた最高峰の防具。防御力+${defVal}, 最大HP+${hpVal}`,
      price: Math.floor(140 * finalScale),
      icon: 'Shield',
    };
  } else if (type === 'accessory') {
    const accNames = {
      common: ['真鍮の錬金環', '結晶のカメオ', '導きのブローチ'],
      rare: ['賢者のアルケミーリング', '星屑のフィブラ', 'クロノス・アミュレット'],
      epic: ['世界樹の雫ペンダント', '極彩のプリズムカメオ', '創世のソロモン環'],
      legendary: ['全知全能の眼ペンダント', '無限機関のオーブ', '時空超越のクロノリング'],
      mythic: ['神話創世のオーブ', '時空超越のクロノリング・真', '星辰のソロモン・リング'],
      divine: ['創世神絶のオムニ・アイ', '天界王のインフィニティ・オーブ', '全知全能のクロノス・ハート'],
    };
    const nameList = accNames[targetRarity];
    const baseName = nameList[Math.floor(Math.random() * nameList.length)];
    const name = `${prefix}${baseName}`;
    const spdVal = Math.floor((4 + Math.random() * 6) * rarityMultiplier);
    const critVal = Math.floor((4 + Math.random() * 8) * rarityMultiplier);

    return {
      id: `syn_acc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name,
      type: 'accessory',
      rarity: targetRarity,
      stats: { spd: spdVal, crit: critVal },
      desc: `[錬成装飾 - ${targetRarity.toUpperCase()}] 異界の魔力を極限まで秘めた錬金装飾品。素早さ+${spdVal}, クリティカル率+${critVal}%`,
      price: Math.floor(200 * finalScale),
      icon: 'Sparkles',
    };
  } else if (type === 'potion') {
    if (targetRarity === 'divine') {
      return {
        id: `syn_p_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: `${prefix}創世神絶エリクサー`,
        type: 'potion',
        rarity: targetRarity,
        effect: { type: 'healHp', value: 999 },
        desc: '[錬成薬 - DIVINE] 錬金術の極致。HPを完全全快（999）まで導く究極の神水。',
        price: 800,
        icon: 'FlaskConical',
      };
    } else if (targetRarity === 'mythic') {
      return {
        id: `syn_p_${Date.now()}_${Math.random()}`,
        name: `${prefix}神話級賢者エリクサー`,
        type: 'potion',
        rarity: targetRarity,
        effect: { type: 'healHp', value: 600 },
        desc: '[錬成薬 - MYTHIC] 神話級の錬金術で作られた至高の秘薬。',
        price: 500,
        icon: 'FlaskConical',
      };
    } else if (targetRarity === 'legendary') {
      return {
        id: `syn_p_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: `${prefix}神々の賢者エリクサー`,
        type: 'potion',
        rarity: targetRarity,
        effect: { type: 'healHp', value: 500 },
        desc: '[錬成薬 - LEGENDARY] HPとMPを高濃度回復する至高の秘薬。',
        price: 400,
        icon: 'FlaskConical',
      };
    } else {
      return {
        id: `syn_p_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: `${prefix}錬成ハイポーション`,
        type: 'potion',
        rarity: targetRarity,
        effect: { type: 'healHp', value: 150 },
        desc: `[錬成薬 - ${targetRarity.toUpperCase()}] 錬金釜で精製された回復薬。`,
        price: 100,
        icon: 'FlaskConical',
      };
    }
  } else {
    return {
      id: `syn_sc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: `${prefix}${targetRarity === 'divine' ? '創世天界の神絶奥義書' : targetRarity === 'mythic' ? '神話覇王の秘伝書' : '極大錬金術の奥義書'}`,
      type: 'scroll',
      rarity: targetRarity,
      effect: targetRarity === 'divine' ? { type: 'boostAtk', value: 15 } : targetRarity === 'mythic' ? { type: 'boostAtk', value: 10 } : { type: 'boostAtk', value: 8 },
      desc: `[錬成書 - ${targetRarity.toUpperCase()}] 恒久的にステータスを飛躍的に強化する特別なる錬金書。`,
      price: 500,
      icon: 'Sparkles',
    };
  }
}
