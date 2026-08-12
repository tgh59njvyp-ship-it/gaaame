import { Spell } from '../types';

/**
 * MASSIVE SPELL DATABASE (Over 260 distinct spells)
 * Categorized by minReincarnationReq (0 = Default, 1 = Reincarnation Tier 1, 2 = Tier 2, 3 = Tier 3, 4 = Tier 4, 5 = Tier 5+)
 */
export const MASSIVE_SPELL_LIST: Spell[] = [
  // --- TIER 0 SPELLS (Default / General Pulls) [35 Spells] ---
  { id: 'f_01', name: 'ファイアボール', mpCost: 10, power: 35, desc: '小さな火の玉を放ち敵を撃ち抜く。[火傷20%]', effectType: 'damage', rarity: 'common', minReincarnationReq: 0, statusEffect: { type: 'burn', chance: 0.2, duration: 2 } },
  { id: 'f_02', name: 'フレイムアロー', mpCost: 14, power: 45, desc: '炎で形作られた矢を放つ。[火傷30%]', effectType: 'damage', rarity: 'common', minReincarnationReq: 0, statusEffect: { type: 'burn', chance: 0.3, duration: 2 } },
  { id: 'i_01', name: 'アイスランス', mpCost: 10, power: 32, desc: '鋭い氷の槍を放つ。[凍結20%]', effectType: 'damage', rarity: 'common', minReincarnationReq: 0, statusEffect: { type: 'freeze', chance: 0.2, duration: 1 } },
  { id: 'i_02', name: 'フロストボルト', mpCost: 14, power: 42, desc: '冷気の弾丸で敵の動きを削ぎ落とす。[凍結25%]', effectType: 'damage', rarity: 'common', minReincarnationReq: 0, statusEffect: { type: 'freeze', chance: 0.25, duration: 1 } },
  { id: 't_01', name: 'スパーク', mpCost: 10, power: 30, desc: '静電気の火花で麻痺を狙う。[麻痺20%]', effectType: 'damage', rarity: 'common', minReincarnationReq: 0, statusEffect: { type: 'paralyze', chance: 0.2, duration: 1 } },
  { id: 't_02', name: 'ライトニングボルト', mpCost: 14, power: 40, desc: '鋭い電撃の筋を放つ。[麻痺25%]', effectType: 'damage', rarity: 'common', minReincarnationReq: 0, statusEffect: { type: 'paralyze', chance: 0.25, duration: 1 } },
  { id: 'h_01', name: 'ヒール', mpCost: 10, power: 45, desc: '聖なる光でHPを小回復する。', effectType: 'heal', rarity: 'common', minReincarnationReq: 0 },
  { id: 'h_02', name: 'ホーリーライト', mpCost: 12, power: 35, desc: 'まばゆい光で敵を浄化攻撃。', effectType: 'damage', rarity: 'common', minReincarnationReq: 0 },
  { id: 'd_01', name: 'ライフドレイン', mpCost: 12, power: 35, desc: '敵の生命力を吸い取りHP回復。[毒20%]', effectType: 'drain', rarity: 'common', minReincarnationReq: 0, statusEffect: { type: 'poison', chance: 0.2, duration: 2 } },
  { id: 'd_02', name: 'シャドウボルト', mpCost: 15, power: 42, desc: '影の弾丸で肉体をむしばむ。[毒25%]', effectType: 'damage', rarity: 'common', minReincarnationReq: 0, statusEffect: { type: 'poison', chance: 0.25, duration: 2 } },
  { id: 'f_03', name: 'ヒートインパクト', mpCost: 18, power: 55, desc: '高熱の衝撃波で敵を吹き飛ばす。[火傷35%]', effectType: 'damage', rarity: 'rare', minReincarnationReq: 0, statusEffect: { type: 'burn', chance: 0.35, duration: 2 } },
  { id: 'i_03', name: 'チリングウェイブ', mpCost: 18, power: 52, desc: '波打つ寒気で周囲を凍りつかせる。[凍結30%]', effectType: 'damage', rarity: 'rare', minReincarnationReq: 0, statusEffect: { type: 'freeze', chance: 0.3, duration: 1 } },
  { id: 't_03', name: 'ショックウェーブ', mpCost: 18, power: 50, desc: '衝撃的な電流で神経を刺激する。[麻痺30%]', effectType: 'damage', rarity: 'rare', minReincarnationReq: 0, statusEffect: { type: 'paralyze', chance: 0.3, duration: 1 } },
  { id: 'h_03', name: 'ピュリファイ', mpCost: 15, power: 55, desc: '浄化の光でHPを中回復。', effectType: 'heal', rarity: 'rare', minReincarnationReq: 0 },
  { id: 'd_03', name: 'ナイトメア', mpCost: 18, power: 52, desc: '悪夢を見せて精神を破壊する。[毒30%]', effectType: 'damage', rarity: 'rare', minReincarnationReq: 0, statusEffect: { type: 'poison', chance: 0.3, duration: 2 } },
  { id: 's_01', name: 'ディメンションカッター', mpCost: 14, power: 40, desc: '空間のひずみで敵の装甲を切り裂く。', effectType: 'damage', rarity: 'common', minReincarnationReq: 0 },
  { id: 'c_01', name: 'クロノボルト', mpCost: 12, power: 38, desc: '時間の波を撃ち出し動きを鈍らせる。', effectType: 'damage', rarity: 'common', minReincarnationReq: 0 },
  { id: 'dr_01', name: 'ドラゴンクロー', mpCost: 12, power: 42, desc: '竜の爪で敵を引き裂く。[火傷20%]', effectType: 'damage', rarity: 'common', minReincarnationReq: 0 },
  { id: 'st_01', name: 'スターダスト', mpCost: 10, power: 35, desc: '星の屑を振り撒き優しく包み込む。', effectType: 'damage', rarity: 'common', minReincarnationReq: 0 },
  { id: 'su_01', name: '召喚・霊精スライム', mpCost: 10, power: 30, desc: '可愛いスライムを呼び体当たりさせる。', effectType: 'damage', rarity: 'common', minReincarnationReq: 0 },
  { id: 'gr_01', name: 'グラビティショット', mpCost: 12, power: 36, desc: '重力の弾丸で足取りを重くする。', effectType: 'damage', rarity: 'common', minReincarnationReq: 0 },
  { id: 'so_01', name: 'ソニックウェーブ', mpCost: 10, power: 32, desc: '鋭い音波で耳鳴りを起こす。[麻痺20%]', effectType: 'damage', rarity: 'common', minReincarnationReq: 0 },
  { id: 'f_04', name: 'フレイムウォール', mpCost: 22, power: 65, desc: '炎の壁を爆発させて包囲する。[火傷45%]', effectType: 'damage', rarity: 'rare', minReincarnationReq: 0, statusEffect: { type: 'burn', chance: 0.45, duration: 3 } },
  { id: 'i_04', name: 'フリーズバイツ', mpCost: 22, power: 62, desc: '凍える冷気で敵を噛み裂く。[凍結40%]', effectType: 'damage', rarity: 'rare', minReincarnationReq: 0, statusEffect: { type: 'freeze', chance: 0.4, duration: 1 } },
  { id: 't_04', name: 'ライトニングノヴァ', mpCost: 22, power: 60, desc: '周囲に高圧電流を急展開。[麻痺40%]', effectType: 'damage', rarity: 'rare', minReincarnationReq: 0, statusEffect: { type: 'paralyze', chance: 0.4, duration: 1 } },
  { id: 'h_04', name: 'セイントバリア', mpCost: 20, power: 40, desc: '光の盾を張りHP回復＆バリア。[シールド40%]', effectType: 'heal', rarity: 'rare', minReincarnationReq: 0, statusEffect: { type: 'shield', chance: 0.4, duration: 2 } },
  { id: 'd_04', name: 'カオスコーション', mpCost: 22, power: 60, desc: '昏き呪いで持続ダメージ。[毒45%]', effectType: 'damage', rarity: 'rare', minReincarnationReq: 0, statusEffect: { type: 'poison', chance: 0.45, duration: 3 } },
  { id: 'f_05', name: 'プロミネンスランス', mpCost: 26, power: 78, desc: '太陽表面の紅蓮の炎槍で貫く。[火傷55%]', effectType: 'damage', rarity: 'epic', minReincarnationReq: 0, statusEffect: { type: 'burn', chance: 0.55, duration: 3 } },
  { id: 'i_05', name: 'アイスニードル', mpCost: 26, power: 72, desc: '無数の氷針を降らせて急所を射抜く。[凍結50%]', effectType: 'damage', rarity: 'epic', minReincarnationReq: 0, statusEffect: { type: 'freeze', chance: 0.5, duration: 1 } },
  { id: 't_05', name: 'サンダーチェイン', mpCost: 26, power: 70, desc: '伝導する高圧スパークの連鎖。[麻痺50%]', effectType: 'damage', rarity: 'epic', minReincarnationReq: 0, statusEffect: { type: 'paralyze', chance: 0.5, duration: 1 } },
  { id: 'h_05', name: 'シャイニングアロー', mpCost: 24, power: 65, desc: '無数の光矢で邪悪を射貫く。', effectType: 'damage', rarity: 'epic', minReincarnationReq: 0 },
  { id: 'd_05', name: 'ソウルイーター', mpCost: 26, power: 72, desc: '魂を食らい尽くす濃密な暗黒吸血。[毒55%]', effectType: 'drain', rarity: 'epic', minReincarnationReq: 0, statusEffect: { type: 'poison', chance: 0.55, duration: 3 } },
  { id: 'f_06', name: 'ブラストキャノン', mpCost: 30, power: 88, desc: '爆熱のエネミーキラー波動を放つ。[火傷60%]', effectType: 'damage', rarity: 'epic', minReincarnationReq: 0, statusEffect: { type: 'burn', chance: 0.6, duration: 3 } },
  { id: 'i_06', name: 'グラシアルバリア', mpCost: 28, power: 45, desc: '氷の結晶シールドを張りHP回復＆凍結。', effectType: 'heal', rarity: 'epic', minReincarnationReq: 0, statusEffect: { type: 'freeze', chance: 0.4, duration: 1 } },
  { id: 't_06', name: 'ボルトブレード', mpCost: 30, power: 82, desc: '電撃の剣で敵を縦横無尽に斬る。[麻痺55%]', effectType: 'damage', rarity: 'epic', minReincarnationReq: 0, statusEffect: { type: 'paralyze', chance: 0.55, duration: 1 } },

  // --- TIER 1 REINCARNATION SPELLS (転生1回以上で解禁) [50 Spells] ---
  ...Array.from({ length: 50 }, (_, idx) => {
    const spellTypes = ['火炎', '氷結', '疾風雷電', '聖光', '暗黒冥界', '次元', '時空', '滅竜', '銀河', '神獣召喚'];
    const spellNames = [
      '昇華ノ炎', '覚醒アイスブレード', '昇華ヴォルテックス', '転生ホーリークロス', '冥府ノ咆哮', 
      '次元断裂斬', 'クロノスシフト', '竜王ノ爪撃', 'コズミックバースト', '幻獣フェンリル爪',
      '重力高圧波', '超音波アサルト', 'エレメンタルバースト', '昇華フレイムランス', '絶対零度ニードル',
      'プラズマインパクト', 'セイントクロスバリア', 'シャドウイーター', 'スペーストライク', 'タイムスライサー',
      'ドラゴンテール爆碎', 'スターダストレイ', 'サラマンダー熱風', 'グラビティクラッシュ', 'ソニックインパクト',
      '昇華・紅蓮陣', '昇華・凍結陣', '昇華・迅雷陣', '昇華・聖光陣', '昇華・暗黒陣',
      '創世火炎弾', '氷華咲き', '雷帝の一閃', '天使の祝福レイ', '漆黒の吸血爪',
      '異次元ゲート撃', '刻の遅延波', '滅竜拳・一式', '星屑の救済', '召喚・ガルーダ疾風',
      '高重力プレス', '共鳴振動波', '昇華エレメンタル・ノヴァ', '業火プロミネンス', '極冷ブリザード',
      '雷神スパーク', '熾天使ヒール', '深淵ダークネス', '空間歪曲 strike', 'タイムアクセル・極'
    ];
    const name = spellNames[idx % spellNames.length] + ` [第1世代秘術 ${idx + 1}]`;
    const rarity: 'rare' | 'epic' | 'legendary' = idx % 5 === 0 ? 'legendary' : idx % 2 === 0 ? 'epic' : 'rare';
    return {
      id: `reinc1_spell_${idx + 1}`,
      name: `✦ ${name}`,
      mpCost: 20 + (idx % 10) * 4,
      power: 80 + idx * 3,
      desc: `【第1世代転生解禁】転生した勇者のみが扱える秘術。${spellTypes[idx % spellTypes.length]}属性の強力な波動。`,
      effectType: idx % 6 === 0 ? 'heal' : idx % 7 === 0 ? 'drain' : 'damage',
      rarity: rarity,
      minReincarnationReq: 1,
      statusEffect: idx % 3 === 0 ? { type: 'burn', chance: 0.6, duration: 2 } : undefined
    } as Spell;
  }),

  // --- TIER 2 REINCARNATION SPELLS (転生2回以上で解禁) [55 Spells] ---
  ...Array.from({ length: 55 }, (_, idx) => {
    const names = [
      '双頭龍ノ吐息', '絶対零度アブソリュート', '神雷トールハンマー', '熾天使セラフィムノ羽', '冥界神サナトス',
      '次元崩壊ラグナロク', 'ザ・ワールド・クロノス', '神竜王アルティメット', '銀河全崩壊ギャラクティカ', '召喚・神獣オーディン',
      'ブラックホール・インフィニティ', '神響レクイエム', '元素融合エレメンタルクロス', '紅蓮鳳凰陣', '氷龍王ノ吐息',
      '紫電閃光迅雷', 'サクレッドレイ・極', 'ヘルズアポカリプス', 'ヴォイドラプチャー', 'タイムリープバースト',
      'バハムートフレア', 'クエーサー・ノヴァ', 'リヴァイアサン津波', 'ダークマターアナイアレイター', 'シンフォニックカノン',
      '第2世代・龍炎爆発', '第2世代・絶対氷河', '第2世代・全域天雷', '第2世代・神聖光輪', '第2世代・虚無蝕む闇',
      '超空間ヴォイドキャノン', '時間停止クロノスタシス', '滅竜神罰撃', '星霊王の輝き', '召喚・イフリート炎',
      '重力反転カタパルト', '超周波ソニックブレード', '相克ルクスウインブラ', '極大火炎バーニング', '氷華百夜咲き',
      '億劫ボルトブレイク', 'イージス・フルバリア', 'ルシファーフォールン', 'アナザーディメンション', 'クロノス・テンペスト',
      'ドラゴニックオーバードライブ', 'ミルキーウェイカタルシス', 'ギルガメッシュ宝具', '事象の地平線・黒洞', '創世交響曲第9番'
    ];
    const name = names[idx % names.length] + ` [第2世代奥義 ${idx + 1}]`;
    const rarity: 'rare' | 'epic' | 'legendary' = idx % 3 === 0 ? 'legendary' : 'epic';
    return {
      id: `reinc2_spell_${idx + 1}`,
      name: `✦✦ ${name}`,
      mpCost: 35 + (idx % 12) * 5,
      power: 140 + idx * 4,
      desc: `【第2世代転生解禁】2回以上の転生を経た高次元の魂にしか宿らない超奥義。圧倒的破壊力を誇る。`,
      effectType: idx % 5 === 0 ? 'heal' : idx % 8 === 0 ? 'drain' : 'damage',
      rarity: rarity,
      minReincarnationReq: 2,
      statusEffect: { type: 'paralyze', chance: 0.7, duration: 3 }
    } as Spell;
  }),

  // --- TIER 3 REINCARNATION SPELLS (転生3回以上で解禁) [50 Spells] ---
  ...Array.from({ length: 50 }, (_, idx) => {
    const names = [
      '創世ノ焔柱', 'コキュートス・アビス', '神威・天界雷霆陣', '聖剣エクスカリバー裁断', '魔王ベエルゼブブ饗宴',
      '次元覇王断罪陣', '永久時空ノ檻', '九頭龍ヤマタノオロチ', '創世十二星座ノ神罰', '破壊神シヴァ降臨',
      '特異点ビッグクランチ', '神聖オルガン・アルティメット', '『創世のアポカリプス』', '煉獄帝王ノ裁き', '凍てつく神々の棺',
      '電磁領域レールガン', '神域イージスバリア', '深淵のオーバーロード', '超次元ハイパーヴォイド', 'クロノス神のクロニクル',
      '神滅龍帝ドラゴンゴッド', 'ビッグバン・オリジン', '創世神ヴィシュヌ加護', '反物質バースト', 'ヴォルテックスシンフォニー',
      '【第3世代】原初太陽神アトゥム', '【第3世代】黒太陽ブラックサン', '【第3世代】極光全宇宙アストラル', '【第3世代】天照大御神八咫鏡', '【第3世代】次元無限崩壊',
      '創世火炎プロミネンス', '絶対氷獄アビス', '天界雷霆万雷', '神聖アルティメットサンクチュアリ', '漆黒カオスアビス',
      '空間消滅ハイパーブレイカー', '時空統御オメガクロノス', '無上神竜インフィニティ', '全能神子アストラル', '万物召喚クライマックス',
      '存在否定グラビトン', '宇宙誕生コンチェルト', '全知全能の理', '無限昇華アストラル', '創世極光ノ神威'
    ];
    const name = names[idx % names.length] + ` [第3世代秘奥義 ${idx + 1}]`;
    return {
      id: `reinc3_spell_${idx + 1}`,
      name: `✵ ${name}`,
      mpCost: 55 + (idx % 15) * 6,
      power: 220 + idx * 5,
      desc: `【第3世代転生解禁】3回の転生を達成した英雄へ贈られる神格級の秘奥義。世界法則を書き換える。`,
      effectType: idx % 4 === 0 ? 'heal' : 'damage',
      rarity: 'legendary',
      minReincarnationReq: 3,
      statusEffect: { type: 'burn', chance: 0.85, duration: 4 }
    } as Spell;
  }),

  // --- TIER 4 REINCARNATION SPELLS (転生4回以上で解禁) [45 Spells] ---
  ...Array.from({ length: 45 }, (_, idx) => {
    const names = [
      '神火アグニの憤怒', '白夜のヴァルキリー', '蒼天・雷帝神降臨', '創世光輪アルティメットノア', '黒太陽ブラックサン・ヴォイド',
      '創世次元歪曲ビッグバン', '未来予知・絶対回避strike', '終焉竜ヴォルカニックノヴァ', '万華鏡コズミックシンフォニー', '冥界神アナビス・デス',
      '万物超圧壊オメガグラビトン', '音神ミューズ至高旋律', '全知全能ゴッドサンクチュアリ', '虚無と混沌の最終審判', '多重次元パラレルコラプス',
      '時空超越クロノクライマックス', '絶対覇王ドラゴニックラグナロク', '極光全宇宙アルティメットスター', '万物の祖・創世神アトゥム', 'ブラックホール神降臨・絶対吸滅',
      '次元激震ハイパーソニック', '第4世代・天界絶対創世', '第4世代・深淵終焉領域', '第4世代・時空統御オメガ', '第4世代・神威竜帝無限'
    ];
    const name = names[idx % names.length] + ` [第4世代神威 ${idx + 1}]`;
    return {
      id: `reinc4_spell_${idx + 1}`,
      name: `☸ ${name}`,
      mpCost: 75 + (idx % 10) * 8,
      power: 320 + idx * 6,
      desc: `【第4世代転生解禁】4回の転生を超克した神々の領域。一撃で敵群を完全に無へと還元する。`,
      effectType: 'damage',
      rarity: 'legendary',
      minReincarnationReq: 4,
      statusEffect: { type: 'freeze', chance: 0.95, duration: 4 }
    } as Spell;
  }),

  // --- TIER 5+ REINCARNATION SPELLS (転生5回以上で解禁) [30 Spells] ---
  ...Array.from({ length: 30 }, (_, idx) => {
    const names = [
      '終焉プロミネンスオーバードライブ', '創世氷壁アビス・オーロラ', '創世閃光・万雷クライマックス', '全知全能ゴッド・サンクチュアリ', '虚無と混沌の最終審判',
      '万物崩壊ディメンション・エンド', '終焉・時空統御オメガ・クロノス', '無上神竜・創世破滅インフィニティ', '全能の神子・創世星輝・アストラル', '神獣全降臨・万物召喚クライマックス',
      '終焉特異点・存在否定フィールド', '万物共振・宇宙誕生コンチェルト', '【極限神威】無限昇華・アストラル神威', '【極限神威】全知全能の理', '【極限神威】創世のアポカリプス・真'
    ];
    const name = names[idx % names.length] + ` [第5世代極限神威 ${idx + 1}]`;
    return {
      id: `reinc5_spell_${idx + 1}`,
      name: `☯ ${name}`,
      mpCost: 100 + (idx % 10) * 10,
      power: 450 + idx * 8,
      desc: `【第5世代全解禁】5回以上の転生を重ねた至高の存在のみが扱える究極神威魔法。世界そのものを一瞬で灰塵に変える。`,
      effectType: idx % 3 === 0 ? 'drain' : 'damage',
      rarity: 'legendary',
      minReincarnationReq: 5,
      statusEffect: { type: 'shield', chance: 1.0, duration: 5 }
    } as Spell;
  })
];
