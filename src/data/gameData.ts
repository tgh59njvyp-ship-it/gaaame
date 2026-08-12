import { RaceInfo, MagicTypeInfo, ClassInfo, Item, Enemy, FloorNode } from '../types';

export const RACES: RaceInfo[] = [
  {
    id: 'human',
    name: '人間 (Human)',
    desc: 'バランスの取れた能力と高い適応力を持つ。経験値の獲得量が常時増加する。',
    icon: 'User',
    bonuses: { hp: 50, mp: 30, atk: 5, def: 5, spd: 5, crit: 5, expBonus: 1.2 },
    traitName: '適応の血統',
    traitDesc: 'クエストでの獲得EXPが20%アップ。',
  },
  {
    id: 'elf',
    name: 'エルフ (Elf)',
    desc: '高い魔力と素早さを誇る森の民。MPの自然回復と魔法の威力が高い。',
    icon: 'Sparkles',
    bonuses: { hp: 20, mp: 80, atk: 2, def: 3, spd: 12, crit: 8 },
    traitName: '精霊の加護',
    traitDesc: '戦闘開始時、MPが20%回復し、魔法ダメージ+15%。',
  },
  {
    id: 'dwarf',
    name: 'ドワーフ (Dwarf)',
    desc: '強靭な肉体と頑丈な装甲を持つ鉱山の民。防御力が高く、所持金が増える。',
    icon: 'Shield',
    bonuses: { hp: 100, mp: 10, atk: 8, def: 15, spd: 1, crit: 3, goldBonus: 1.3 },
    traitName: '強靭な肉体',
    traitDesc: '物理被ダメージが15%軽減され、獲得ゴールド+30%。',
  },
  {
    id: 'demon',
    name: 'デーモン (Demon)',
    desc: '闇の血を引く戦闘種族。攻撃力とクリティカル率が極めて高い代わりにHPが低い。',
    icon: 'Flame',
    bonuses: { hp: -10, mp: 40, atk: 18, def: 2, spd: 10, crit: 20 },
    traitName: '狂乱の血潮',
    traitDesc: 'クリティカル時のダメージ倍率が1.8倍から2.5倍に増加。',
  },
  {
    id: 'angel',
    name: '天使 (Angel)',
    desc: '神聖なる加護を受けた天界の使者。毎ターンHPが微小回復し、状態異常に強い。',
    icon: 'Sun',
    bonuses: { hp: 60, mp: 60, atk: 6, def: 8, spd: 8, crit: 5 },
    traitName: '聖なる光輪',
    traitDesc: '毎ターン開始時、最大HPの5%を自動回復する。',
  },
  // --- 転生 / 昇華解放種族 (NEW REINCARNATION RACES) ---
  {
    id: 'dragonkin',
    name: '龍人 (Dragonkin) ✦転生解放',
    desc: '古の神竜の血を宿す最高位の覇者。絶大な体力と威圧的な威力を誇る。',
    icon: 'Flame',
    isReincarnationOnly: true,
    minReincarnationReq: 1,
    bonuses: { hp: 180, mp: 60, atk: 35, def: 25, spd: 10, crit: 15 },
    traitName: '龍王の威圧',
    traitDesc: '全ダメージ+25%、状態異常無効化確率50%。',
  },
  {
    id: 'spirit_king',
    name: '精霊王 (Spirit King) ✦転生解放',
    desc: '世界樹の精霊を束ねる最高位魔導種族。圧倒的なMPと極大威力の魔法を放つ。',
    icon: 'Sparkles',
    isReincarnationOnly: true,
    minReincarnationReq: 1,
    bonuses: { hp: 80, mp: 200, atk: 15, def: 15, spd: 20, crit: 12 },
    traitName: '無限のエーテル',
    traitDesc: '全魔法の消費MP半減＆魔法ダメージ+30%。',
  },
  {
    id: 'berserker',
    name: '狂戦士 (Berserker) ✦転生解放',
    desc: '戦場を蹂躙する狂皇。圧倒的な破砕攻撃力で敵を一瞬で屠る。',
    icon: 'Sword',
    isReincarnationOnly: true,
    minReincarnationReq: 1,
    bonuses: { hp: 220, mp: 20, atk: 48, def: 10, spd: 15, crit: 25 },
    traitName: '血塗られた狂乱',
    traitDesc: '会心ダメージ3.0倍。敵討伐時にHP100自動回復。',
  },
  {
    id: 'celestial',
    name: '星の神子 (Celestial) ✦転生解放',
    desc: '銀河の星光をまとう奇跡の種族。常に強固な星光バリアを身に纏う。',
    icon: 'Sun',
    isReincarnationOnly: true,
    minReincarnationReq: 1,
    bonuses: { hp: 120, mp: 140, atk: 22, def: 20, spd: 18, crit: 15 },
    traitName: '創世の星輝',
    traitDesc: '毎ターン最大HPの10%分の星光バリアを自動展開＆SP獲得量2倍。',
  },
  {
    id: 'void_archdemon',
    name: '虚無の魔神 (Void Archdemon) ✦転生解放',
    desc: '深淵の暗黒次元より顕現せし魔神。あらゆる次元を抉る壊滅的呪術を操る。',
    icon: 'Skull',
    isReincarnationOnly: true,
    minReincarnationReq: 1,
    bonuses: { hp: 100, mp: 160, atk: 40, def: 18, spd: 22, crit: 20 },
    traitName: '次元蝕む深淵',
    traitDesc: '全攻撃に25%確率で致死ドレイン呪印を付与。',
  },
  {
    id: 'vampire_princess',
    name: '吸血姫 (Vampire Princess) ✦転生解放',
    desc: '夜の静寂を統べる真祖の姫君。与えたダメージの多くを生命力に還元する。',
    icon: 'Crown',
    isReincarnationOnly: true,
    minReincarnationReq: 1,
    bonuses: { hp: 140, mp: 110, atk: 30, def: 18, spd: 25, crit: 18 },
    traitName: '真祖の吸血牙',
    traitDesc: '物理・魔法ダメージの35%をHPとして即座に吸収。',
  },
  {
    id: 'kitsune',
    name: '九尾の狐仙 (Nine-Tailed Kitsune) ✦転生解放',
    desc: '千年の霊力を宿す伝説の仙狐。莫大な財宝と経験値を引き寄せる。',
    icon: 'Zap',
    isReincarnationOnly: true,
    minReincarnationReq: 1,
    bonuses: { hp: 110, mp: 130, atk: 25, def: 16, spd: 28, crit: 22 },
    traitName: '千客万来の幻術',
    traitDesc: '獲得ゴールド+100%、EXP+80%、攻撃回避率15%。',
  },
  {
    id: 'automaton',
    name: '機工生命体 (Automaton) ✦転生解放',
    desc: '超合金で構築された絶対装甲生命体。あらゆる打撃を無力化する。',
    icon: 'Shield',
    isReincarnationOnly: true,
    minReincarnationReq: 1,
    bonuses: { hp: 250, mp: 40, atk: 28, def: 35, spd: 8, crit: 10 },
    traitName: 'エーテル要塞装甲',
    traitDesc: '被ダメージを常時30%カット＆ノックバック無効。',
  },
];

export const MAGIC_TYPES: MagicTypeInfo[] = [
  {
    id: 'fire',
    name: '炎魔法 (Fire)',
    desc: '高い火力と継続ダメージ（火傷）を敵に与える攻撃特化の魔法。',
    color: 'from-red-500 to-orange-600',
    element: '炎',
    spells: [
      {
        id: 'fireball',
        name: 'ファイアボール',
        mpCost: 15,
        power: 45,
        desc: '敵単体に炎の塊を放つ。',
        effectType: 'damage',
        statusEffect: { type: 'burn', chance: 0.4, duration: 3 },
      },
      {
        id: 'flame_burst',
        name: 'フレイムバースト',
        mpCost: 35,
        power: 95,
        desc: '強烈な爆風で敵を焼き尽くす。',
        effectType: 'damage',
        statusEffect: { type: 'burn', chance: 0.7, duration: 3 },
      },
    ],
  },
  {
    id: 'ice',
    name: '氷魔法 (Ice)',
    desc: '敵の動きを凍結させたり素早さを下げる妨害・コントロール魔法。',
    color: 'from-blue-400 to-cyan-600',
    element: '氷',
    spells: [
      {
        id: 'ice_lance',
        name: 'アイスランス',
        mpCost: 15,
        power: 40,
        desc: '鋭い氷の槍で敵を貫く。',
        effectType: 'damage',
        statusEffect: { type: 'freeze', chance: 0.3, duration: 1 },
      },
      {
        id: 'blizzard',
        name: 'ブリザード',
        mpCost: 30,
        power: 80,
        desc: '吹雪で敵の動きを完全に封じる。',
        effectType: 'damage',
        statusEffect: { type: 'freeze', chance: 0.6, duration: 2 },
      },
    ],
  },
  {
    id: 'thunder',
    name: '雷魔法 (Thunder)',
    desc: '高確率でクリティカルや麻痺（行動阻害）を狙える電撃魔法。',
    color: 'from-amber-400 to-yellow-600',
    element: '雷',
    spells: [
      {
        id: 'spark',
        name: 'スパーク',
        mpCost: 12,
        power: 38,
        desc: '素早い電撃で敵を感電させる。',
        effectType: 'damage',
        statusEffect: { type: 'paralyze', chance: 0.3, duration: 1 },
      },
      {
        id: 'thunderbolt',
        name: 'サンダーボルト',
        mpCost: 32,
        power: 90,
        desc: '天から強力な雷を落とす。',
        effectType: 'damage',
        statusEffect: { type: 'paralyze', chance: 0.5, duration: 2 },
      },
    ],
  },
  {
    id: 'holy',
    name: '聖魔法 (Holy)',
    desc: '自身のHP回復やバリア展開、アンデッドを浄化する慈愛の魔法。',
    color: 'from-yellow-200 to-amber-400',
    element: '聖',
    spells: [
      {
        id: 'heal',
        name: 'ヒール',
        mpCost: 15,
        power: 50,
        desc: '聖なる光で自身のHPを回復する。',
        effectType: 'heal',
      },
      {
        id: 'holy_smite',
        name: 'ホーリースマイト',
        mpCost: 28,
        power: 75,
        desc: '神聖な光の槌で邪悪を撃つ。',
        effectType: 'damage',
      },
    ],
  },
  {
    id: 'dark',
    name: '暗黒魔法 (Dark)',
    desc: '敵のHPを吸収したり毒を与える危険かつ強力な呪術。',
    color: 'from-purple-600 to-slate-900',
    element: '闇',
    spells: [
      {
        id: 'drain',
        name: 'ライフドレイン',
        mpCost: 18,
        power: 45,
        desc: '敵の生命力を奪い、自身のHPとして吸収する。',
        effectType: 'drain',
        statusEffect: { type: 'poison', chance: 0.4, duration: 3 },
      },
      {
        id: 'dark_nova',
        name: 'ダークノヴァ',
        mpCost: 35,
        power: 100,
        desc: '虚無の闇で周囲の空間を抉り取る。',
        effectType: 'damage',
        statusEffect: { type: 'poison', chance: 0.7, duration: 4 },
      },
    ],
  },
  // --- 転生 / 昇華解放魔法 (NEW REINCARNATION MAGIC TYPES) ---
  {
    id: 'spatial',
    name: '空間魔法 (Spatial) ✦転生解放',
    desc: '次元のひずみを切り裂き、装甲を無視した絶大ダメージを与える奥義秘術。',
    color: 'from-purple-500 via-[#8b5cf6] to-indigo-800',
    element: '空間',
    isReincarnationOnly: true,
    minReincarnationReq: 1,
    spells: [
      {
        id: 'dimension_slash',
        name: '次元斬 (Dimensional Slash)',
        mpCost: 22,
        power: 75,
        desc: '空間そのものを切り裂き、敵の防御を貫通する一撃。',
        effectType: 'damage',
        rarity: 'epic',
      },
      {
        id: 'wormhole_burst',
        name: '次元穿孔 (Wormhole Burst)',
        mpCost: 45,
        power: 140,
        desc: '敵の直上に事象の特異点を発生させ超高圧崩壊を起こす。',
        effectType: 'damage',
        rarity: 'legendary',
        statusEffect: { type: 'paralyze', chance: 0.7, duration: 2 },
      },
    ],
  },
  {
    id: 'chrono',
    name: '時間魔法 (Chrono) ✦転生解放',
    desc: '時間の流れを自在に操り、敵のターンを封じながら自身の過去を復元する。',
    color: 'from-cyan-400 via-teal-500 to-blue-900',
    element: '時間',
    isReincarnationOnly: true,
    minReincarnationReq: 1,
    spells: [
      {
        id: 'time_stop_strike',
        name: '刻の静止 (Chronostasis)',
        mpCost: 26,
        power: 65,
        desc: '敵の周囲の時間を数秒停止させ、確定で行動不能にする。',
        effectType: 'damage',
        rarity: 'epic',
        statusEffect: { type: 'freeze', chance: 0.9, duration: 2 },
      },
      {
        id: 'temporal_drain',
        name: '時間回帰・タイムドレイン',
        mpCost: 48,
        power: 125,
        desc: '敵の時間を強奪して自身の生命力を回復し、絶大なダメージを与える。',
        effectType: 'drain',
        rarity: 'legendary',
      },
    ],
  },
  {
    id: 'draconic',
    name: '龍炎・神滅魔法 (Draconic) ✦転生解放',
    desc: '神竜の滅びの炎。焦土と化した敵に圧倒的な壊滅を与える。',
    color: 'from-orange-500 via-red-600 to-amber-700',
    element: '神竜',
    isReincarnationOnly: true,
    minReincarnationReq: 1,
    spells: [
      {
        id: 'dragon_breath',
        name: '竜王の息吹 (Dragon Breath)',
        mpCost: 28,
        power: 90,
        desc: '龍の息吹で灼熱の極炎を浴びせる。激しい火傷を必至。',
        effectType: 'damage',
        rarity: 'epic',
        statusEffect: { type: 'burn', chance: 0.8, duration: 3 },
      },
      {
        id: 'draconic_cataclysm',
        name: '神滅龍焔波 (Draconic Cataclysm)',
        mpCost: 60,
        power: 185,
        desc: '大地を灼き尽くす龍神の絶大光波。敵を一瞬で焦土と化す。',
        effectType: 'damage',
        rarity: 'legendary',
        statusEffect: { type: 'burn', chance: 1.0, duration: 4 },
      },
    ],
  },
  {
    id: 'stellar',
    name: '創世・星輝魔法 (Stellar) ✦転生解放',
    desc: '銀河の星々から放たれる神聖な星光。極上の回復と創世の流星をもたらす。',
    color: 'from-amber-300 via-yellow-400 to-indigo-600',
    element: '星輝',
    isReincarnationOnly: true,
    minReincarnationReq: 1,
    spells: [
      {
        id: 'starlight_heal',
        name: '星光の慈愛 (Starlight Heal)',
        mpCost: 25,
        power: 95,
        desc: '星々の祝福を降らせ、HPを大幅に回復する。',
        effectType: 'heal',
        rarity: 'epic',
      },
      {
        id: 'supernova_starfall',
        name: '創世超新星 (Supernova Starfall)',
        mpCost: 65,
        power: 210,
        desc: '超新星爆発のエネルギーを集束させ、壊滅的な星降りを起こす。',
        effectType: 'damage',
        rarity: 'legendary',
      },
    ],
  },
  {
    id: 'summoning',
    name: '召喚・幻獣魔法 (Summoning) ✦転生解放',
    desc: '神域の幻獣・神獣を呼び出し、異次元の一撃を放たせる神聖呪術。',
    color: 'from-[#10b981] via-emerald-600 to-teal-900',
    element: '召喚',
    isReincarnationOnly: true,
    minReincarnationReq: 1,
    spells: [
      {
        id: 'summon_fenrir',
        name: '霊獣フェンリル召喚',
        mpCost: 30,
        power: 85,
        desc: '銀狼フェンリルを召喚し、絶対ゼロ度の爪で引き裂く。',
        effectType: 'damage',
        rarity: 'epic',
        statusEffect: { type: 'freeze', chance: 0.6, duration: 2 },
      },
      {
        id: 'summon_bahamut',
        name: '幻獣バハムート光臨 (Mega Flare)',
        mpCost: 70,
        power: 220,
        desc: '龍神バハムートの真の姿を召喚し、メガフレアで世界を消失させる。',
        effectType: 'damage',
        rarity: 'legendary',
      },
    ],
  },
  {
    id: 'gravity',
    name: '禁忌・重力魔法 (Gravity) ✦転生解放',
    desc: '超高重力フィールドを発生させ、敵を圧壊させる禁断の呪文。',
    color: 'from-[#4338ca] via-violet-700 to-slate-950',
    element: '重力',
    isReincarnationOnly: true,
    minReincarnationReq: 1,
    spells: [
      {
        id: 'gravity_press',
        name: '高重力圧壊 (Gravity Press)',
        mpCost: 24,
        power: 80,
        desc: '超高重力フィールドで敵を押し潰し、動作を著しく阻害。',
        effectType: 'damage',
        rarity: 'epic',
        statusEffect: { type: 'paralyze', chance: 0.6, duration: 2 },
      },
      {
        id: 'event_horizon',
        name: '事象の地平線 (Black Hole)',
        mpCost: 62,
        power: 195,
        desc: 'ブラックホールを発生させ、敵の生命力と質量を完全に呑み込む。',
        effectType: 'drain',
        rarity: 'legendary',
      },
    ],
  },
  {
    id: 'sonic',
    name: '重奏・音波魔法 (Sonic) ✦転生解放',
    desc: '音の波長を共鳴・増幅させ、細胞レベルで震わせる破壊の旋律。',
    color: 'from-pink-500 via-fuchsia-600 to-purple-900',
    element: '共鳴',
    isReincarnationOnly: true,
    minReincarnationReq: 1,
    spells: [
      {
        id: 'sonic_impulse',
        name: '共鳴音波 (Sonic Impulse)',
        mpCost: 20,
        power: 65,
        desc: '衝撃的な音波で脳揺さぶりを起こす。高確率で痺れを付与。',
        effectType: 'damage',
        rarity: 'common',
        statusEffect: { type: 'paralyze', chance: 0.5, duration: 1 },
      },
      {
        id: 'resonating_tempest',
        name: '破滅の協奏曲 (Resonating Tempest)',
        mpCost: 50,
        power: 155,
        desc: '暴風と超音波を共鳴増幅させ、次元全域を激震させる。',
        effectType: 'damage',
        rarity: 'legendary',
      },
    ],
  },
];

export const CLASSES: ClassInfo[] = [
  {
    id: 'warrior',
    name: '戦士 (Warrior)',
    desc: '高いHPと物理攻撃力を誇る前衛のスペシャリスト。',
    role: '物理アタッカー / タンク',
    baseStats: { hp: 150, mp: 30, atk: 25, def: 15, spd: 8, crit: 5 },
    icon: 'Sword',
  },
  {
    id: 'mage',
    name: '魔法使い (Mage)',
    desc: '圧倒的な魔力で魔法の威力を極限まで高めた大魔導士。',
    role: '魔法アタッカー',
    baseStats: { hp: 90, mp: 120, atk: 10, def: 5, spd: 12, crit: 8 },
    icon: 'Wand2',
  },
  {
    id: 'thief',
    name: '盗賊 (Thief)',
    desc: '驚異的な素早さとクリティカル率で敵を翻弄する。',
    role: 'スピード / クリティカル',
    baseStats: { hp: 110, mp: 50, atk: 18, def: 8, spd: 22, crit: 20 },
    icon: 'Zap',
  },
  {
    id: 'cleric',
    name: '聖職者 (Cleric)',
    desc: '高い耐久力と強力な回復・治癒能力で生存特化した聖職者。',
    role: 'ヒーラー / サポーター',
    baseStats: { hp: 130, mp: 90, atk: 12, def: 12, spd: 9, crit: 5 },
    icon: 'Heart',
  },
  {
    id: 'knight',
    name: '魔法剣士 (Magic Knight)',
    desc: '剣技と魔法を融合させ、攻防ともに隙のない万能戦闘員。',
    role: 'オールラウンダー',
    baseStats: { hp: 130, mp: 70, atk: 20, def: 14, spd: 10, crit: 10 },
    icon: 'ShieldAlert',
  },
];

export const ITEMS: Item[] = [
  { id: 'potion_s', name: '小ポーション', type: 'potion', rarity: 'common', effect: { type: 'healHp', value: 50 }, desc: 'HPを50回復する。', price: 30, icon: 'FlaskConical' },
  { id: 'potion_l', name: '大ポーション', type: 'potion', rarity: 'rare', effect: { type: 'healHp', value: 120 }, desc: 'HPを120回復する。', price: 80, icon: 'FlaskConical' },
  { id: 'mana_water', name: '魔力の雫', type: 'potion', rarity: 'common', effect: { type: 'healMp', value: 40 }, desc: 'MPを40回復する。', price: 40, icon: 'Droplets' },
  { id: 'elixir_hp_l', name: '特製エリクサー', type: 'potion', rarity: 'epic', effect: { type: 'healHp', value: 250 }, desc: 'HPを250回復する極上のポーション。', price: 150, icon: 'FlaskConical' },
  { id: 'elixir_atk', name: '力の秘薬', type: 'scroll', rarity: 'rare', effect: { type: 'boostAtk', value: 3 }, desc: '使用すると恒久的に攻撃力が +3 上昇する秘薬。', price: 180, icon: 'Sparkles' },
  { id: 'elixir_def', name: '守護の秘薬', type: 'scroll', rarity: 'rare', effect: { type: 'boostDef', value: 3 }, desc: '使用すると恒久的に防御力が +3 上昇する秘薬。', price: 180, icon: 'Shield' },
  { id: 'elixir_hp', name: '生命の霊薬', type: 'scroll', rarity: 'rare', effect: { type: 'boostMaxHp', value: 15 }, desc: '使用すると恒久的に最大HPが +15 上昇する霊薬。', price: 220, icon: 'Heart' },
  { id: 'elixir_mp', name: '賢者の霊薬', type: 'scroll', rarity: 'rare', effect: { type: 'boostMaxMp', value: 10 }, desc: '使用すると恒久的に最大MPが +10 上昇する霊薬。', price: 200, icon: 'Sparkles' },
  { id: 'elixir_crit', name: '幸運の秘薬', type: 'scroll', rarity: 'rare', effect: { type: 'boostCrit', value: 3 }, desc: '使用すると恒久的に会心率が +3% 上昇する秘薬。', price: 250, icon: 'Sparkles' },
  { id: 'sword_iron', name: '鉄の剣', type: 'weapon', rarity: 'common', stats: { atk: 12 }, desc: '頑丈な鉄製の剣。攻撃力+12', price: 100, icon: 'Sword' },
  { id: 'sword_flame', name: '炎の魔剣', type: 'weapon', rarity: 'epic', stats: { atk: 28, spd: 3 }, desc: '炎を纏う魔剣。攻撃力+28, 素早さ+3', price: 350, icon: 'Flame' },
  { id: 'armor_leather', name: '革の鎧', type: 'armor', rarity: 'common', stats: { def: 8 }, desc: '軽快で動きやすい革の鎧。防御力+8', price: 90, icon: 'Shield' },
  { id: 'armor_knight', name: '鋼鉄の鎧', type: 'armor', rarity: 'rare', stats: { def: 20, hp: 30 }, desc: '重厚な鋼鉄の鎧。防御力+20, HP+30', price: 280, icon: 'ShieldCheck' },
  { id: 'ring_speed', name: '風の指輪', type: 'accessory', rarity: 'rare', stats: { spd: 8, crit: 5 }, desc: '疾風の加護を受けた指輪。素早さ+8, クリティカル+5%', price: 200, icon: 'Wind' },
];

export const STAGES = [
  {
    id: 1,
    name: '第1ステージ：はじまりの森',
    desc: '魔物が棲み始めた穏やかな緑の森。手強い敵は少ないが油断は禁物。',
    bg: 'from-emerald-950 to-green-900',
    enemies: [
      { id: 'slime', name: 'グリーン・スライム', level: 1, hp: 60, maxHp: 60, atk: 14, def: 4, spd: 6, expReward: 25, goldReward: 15, sprite: 'Droplet' },
      { id: 'goblin', name: 'ゴブリン・スカウト', level: 1, hp: 75, maxHp: 75, atk: 18, def: 6, spd: 10, expReward: 35, goldReward: 20, sprite: 'Skull' },
      { id: 'wolf', name: 'ワイルド・ウルフ', level: 2, hp: 90, maxHp: 90, atk: 22, def: 8, spd: 16, expReward: 45, goldReward: 25, sprite: 'Dog' },
    ],
    boss: { id: 'boss_1', name: 'ゴブリン・キング', level: 3, hp: 300, maxHp: 300, atk: 28, def: 12, spd: 12, expReward: 150, goldReward: 120, sprite: 'Crown', isBoss: true },
  },
  {
    id: 2,
    name: '第2ステージ：地下迷宮の洞窟',
    desc: '湿気が立ち込め、鉱石が怪しく光る薄暗い地下道。',
    bg: 'from-stone-900 to-zinc-950',
    enemies: [
      { id: 'bat', name: 'ヴァンパイア・バット', level: 3, hp: 110, maxHp: 110, atk: 30, def: 10, spd: 20, expReward: 60, goldReward: 35, sprite: 'Bat' },
      { id: 'skeleton', name: 'スケルトン・ソルジャー', level: 4, hp: 140, maxHp: 140, atk: 35, def: 16, spd: 11, expReward: 80, goldReward: 45, sprite: 'Bone' },
      { id: 'spider', name: 'ポイズン・タランチュラ', level: 4, hp: 125, maxHp: 125, atk: 38, def: 12, spd: 18, expReward: 90, goldReward: 50, sprite: 'Bug' },
    ],
    boss: { id: 'boss_2', name: 'ケイブ・ゴーレム', level: 5, hp: 550, maxHp: 550, atk: 45, def: 25, spd: 6, expReward: 250, goldReward: 220, sprite: 'ShieldAlert', isBoss: true },
  },
  {
    id: 3,
    name: '第3ステージ：忘れられた魔塔',
    desc: 'かつて賢者たちが魔法の研究を行っていたが、現在は魔物に支配された塔。',
    bg: 'from-indigo-950 to-purple-950',
    enemies: [
      { id: 'ghost', name: 'アフェクト・ゴースト', level: 5, hp: 150, maxHp: 150, atk: 48, def: 14, spd: 22, expReward: 110, goldReward: 65, sprite: 'Ghost' },
      { id: 'mage_enemy', name: '堕落した魔導士', level: 6, hp: 170, maxHp: 170, atk: 55, def: 15, spd: 17, expReward: 135, goldReward: 80, sprite: 'Sparkles' },
      { id: 'gargoyle', name: 'ストーン・ガーゴイル', level: 6, hp: 210, maxHp: 210, atk: 50, def: 24, spd: 14, expReward: 150, goldReward: 90, sprite: 'Shield' },
    ],
    boss: { id: 'boss_3', name: 'タワー・ガーディアン', level: 7, hp: 850, maxHp: 850, atk: 68, def: 32, spd: 16, expReward: 400, goldReward: 350, sprite: 'Eye', isBoss: true },
  },
  {
    id: 4,
    name: '第4ステージ：灼熱の業火火山',
    desc: 'マグマが沸き立ち、熱風が吹き荒れる危険極まる溶岩地帯。',
    bg: 'from-red-950 to-orange-950',
    enemies: [
      { id: 'fire_imp', name: 'マグマ・インプ', level: 7, hp: 220, maxHp: 220, atk: 70, def: 18, spd: 26, expReward: 180, goldReward: 110, sprite: 'Flame' },
      { id: 'lizardman', name: 'サラマンダー・ウォリアー', level: 8, hp: 280, maxHp: 280, atk: 80, def: 30, spd: 19, expReward: 220, goldReward: 140, sprite: 'Flame' },
      { id: 'hell_hound', name: 'ヘルハウンド', level: 8, hp: 250, maxHp: 250, atk: 88, def: 22, spd: 28, expReward: 240, goldReward: 150, sprite: 'Dog' },
    ],
    boss: { id: 'boss_4', name: 'フレイム・ドラゴン', level: 9, hp: 1250, maxHp: 1250, atk: 95, def: 40, spd: 20, expReward: 650, goldReward: 600, sprite: 'Flame', isBoss: true },
  },
  {
    id: 5,
    name: '第5ステージ：魔王城・終焉の間',
    desc: '全ての元凶である魔王が君臨する、世界最果ての暗黒の城。',
    bg: 'from-black to-purple-950',
    enemies: [
      { id: 'dark_knight', name: '暗黒騎士', level: 10, hp: 350, maxHp: 350, atk: 105, def: 45, spd: 22, expReward: 320, goldReward: 200, sprite: 'Sword' },
      { id: 'shadow_demon', name: 'シャドウ・デーモン', level: 11, hp: 380, maxHp: 380, atk: 120, def: 35, spd: 32, expReward: 380, goldReward: 240, sprite: 'Skull' },
      { id: 'arch_mage', name: '暗黒大魔導士', level: 11, hp: 320, maxHp: 320, atk: 135, def: 28, spd: 29, expReward: 410, goldReward: 260, sprite: 'Wand2' },
    ],
    boss: { id: 'boss_5', name: '魔王 ゼルグラード', level: 13, hp: 2200, maxHp: 2200, atk: 140, def: 55, spd: 26, expReward: 2000, goldReward: 2000, sprite: 'Crown', isBoss: true },
  },
];

export function generateStageFloors(stageNumber: number): FloorNode[] {
  const floors: FloorNode[] = [];
  const stage = STAGES[stageNumber - 1] || STAGES[0];

  for (let f = 1; f <= 5; f++) {
    let type: FloorNode['type'] = 'battle';
    if (f === 5) {
      type = 'boss';
    } else if (f === 2) {
      type = Math.random() > 0.5 ? 'treasure' : 'event';
    } else if (f === 3) {
      type = 'shop';
    } else if (f === 4) {
      type = Math.random() > 0.5 ? 'elite' : 'rest';
    }

    let enemy: Enemy | undefined = undefined;
    if (type === 'battle') {
      const template = stage.enemies[Math.floor(Math.random() * stage.enemies.length)];
      enemy = { ...template, hp: template.maxHp, id: `${template.id}_${f}` };
    } else if (type === 'elite') {
      const template = stage.enemies[Math.floor(Math.random() * stage.enemies.length)];
      enemy = {
        ...template,
        name: `【精鋭】${template.name}`,
        level: template.level + 2,
        hp: Math.floor(template.maxHp * 1.6),
        maxHp: Math.floor(template.maxHp * 1.6),
        atk: Math.floor(template.atk * 1.4),
        def: Math.floor(template.def * 1.3),
        expReward: Math.floor(template.expReward * 1.8),
        goldReward: Math.floor(template.goldReward * 2.0),
        id: `elite_${f}`,
      };
    } else if (type === 'boss') {
      enemy = { ...stage.boss, hp: stage.boss.maxHp, id: `boss_stage_${stageNumber}` };
    }

    let eventData = undefined;
    if (type === 'event') {
      eventData = {
        title: '神秘の泉と女神の像',
        desc: '古代の石像が佇む泉を発見した。聖水が満ちており、祈りを捧げると不思議な力が湧いてくるようだ……。',
        choices: [
          {
            text: '泉の水を飲む（HP/MP全快）',
            resultText: '清らかな水が体内に満ち渡り、HPとMPが完全に回復した！',
            effect: (char) => ({
              updatedChar: { ...char, hp: char.maxHp, mp: char.maxMp },
              message: 'HPとMPが完全回復しました！',
            }),
          },
          {
            text: '像に祈りを捧げる（最大HPアップ）',
            resultText: '女神の加護により、肉体が強靭になった！最大HP+25',
            effect: (char) => ({
              updatedChar: { ...char, maxHp: char.maxHp + 25, hp: char.hp + 25 },
              message: '最大HPが25増加しました！',
            }),
          },
          {
            text: '無視して進む',
            resultText: '余計な危険を避けて先へ進むことにした。',
            effect: (char) => ({
              updatedChar: char,
              message: '何事も起きなかった。',
            }),
          },
        ],
      };
    }

    floors.push({
      floorNumber: f,
      stageNumber,
      type,
      completed: false,
      enemy,
      eventData,
    });
  }

  return floors;
}
