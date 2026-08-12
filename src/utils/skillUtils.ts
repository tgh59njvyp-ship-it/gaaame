import { CharacterState } from '../types';

export interface SkillNode {
  id: string;
  name: string;
  desc: string;
  cost: number;
  type: 'race' | 'magic' | 'class';
  branchId: string; // matches RaceId, MagicTypeId, or ClassId
  reqSkillId?: string; // prerequisite skill ID
  stats?: {
    atk?: number;
    def?: number;
    hp?: number;
    mp?: number;
    spd?: number;
    crit?: number;
  };
  effectDesc: string;
}

export const ALL_SKILLS: SkillNode[] = [
  // --- RACE BRANCHES ---
  // HUMAN (人間)
  {
    id: 'human_mastery',
    name: '人間の叡智',
    desc: '過酷な運命から学びを得る力。あらゆる技術の習得が容易になる。',
    cost: 1,
    type: 'race',
    branchId: 'human',
    stats: { hp: 30, mp: 10 },
    effectDesc: '最大HP +30, 最大MP +10'
  },
  {
    id: 'human_resolve',
    name: '不屈の生存本能',
    desc: '極限まで追い詰められた時に真価を発揮する人類の底力。',
    cost: 2,
    type: 'race',
    branchId: 'human',
    reqSkillId: 'human_mastery',
    stats: { atk: 12, def: 8 },
    effectDesc: '攻撃力 +12, 防御力 +8'
  },

  // ELF (エルフ)
  {
    id: 'elf_mp_flow',
    name: '世界樹の加護',
    desc: 'エーテル循環を効率化し、魔法発動に必要なマナを極限まで貯蔵する。',
    cost: 1,
    type: 'race',
    branchId: 'elf',
    stats: { mp: 40, spd: 4 },
    effectDesc: '最大MP +40, 素早さ +4'
  },
  {
    id: 'elf_magic_crit',
    name: '元素共鳴会心',
    desc: '大気中のマナを攻撃の極点へ集中させ、必殺の衝撃を与える。',
    cost: 2,
    type: 'race',
    branchId: 'elf',
    reqSkillId: 'elf_mp_flow',
    stats: { crit: 10, atk: 15 },
    effectDesc: 'クリティカル率 +10%, 攻撃力 +15'
  },

  // DWARF (ドワーフ)
  {
    id: 'dwarf_greed',
    name: '鉱石の目利き',
    desc: '地中に眠る秘宝や金属の波動を感じ取り、肉体の耐久力を高める。',
    cost: 1,
    type: 'race',
    branchId: 'dwarf',
    stats: { hp: 40, def: 10 },
    effectDesc: '最大HP +40, 防御力 +10'
  },
  {
    id: 'dwarf_sturdy',
    name: '大地の剛体',
    desc: '山脈の如き、何者にも揺るがされぬ強靭な不壊の肉体を構築する。',
    cost: 2,
    type: 'race',
    branchId: 'dwarf',
    reqSkillId: 'dwarf_greed',
    stats: { def: 18, hp: 50 },
    effectDesc: '防御力 +18, 最大HP +50'
  },

  // DEMON (魔族)
  {
    id: 'demon_fury',
    name: '魔神の脈動',
    desc: '血脈に眠る混沌と破壊の衝動を呼び覚まし、敵を畏怖させる。',
    cost: 1,
    type: 'race',
    branchId: 'demon',
    stats: { atk: 15, crit: 5 },
    effectDesc: '攻撃力 +15, クリティカル率 +5%'
  },
  {
    id: 'demon_drain',
    name: '魂の狂宴',
    desc: '攻撃時に敵のエーテルを貪り、肉体と魔力の渇きを潤す。',
    cost: 2,
    type: 'race',
    branchId: 'demon',
    reqSkillId: 'demon_fury',
    stats: { atk: 25, mp: 20 },
    effectDesc: '攻撃力 +25, 最大MP +20'
  },

  // ANGEL (天使)
  {
    id: 'angel_saving',
    name: '聖光の飛翔',
    desc: '純白の翼から神聖なオーラを放ち、肉体の負荷を劇的に軽減する。',
    cost: 1,
    type: 'race',
    branchId: 'angel',
    stats: { mp: 30, hp: 30 },
    effectDesc: '最大HP +30, 最大MP +30'
  },
  {
    id: 'angel_protection',
    name: '大天使の守護聖障',
    desc: '神域の結界で物理、魔法のあらゆる攻撃を減衰・遮断する。',
    cost: 2,
    type: 'race',
    branchId: 'angel',
    reqSkillId: 'angel_saving',
    stats: { def: 15, crit: 8 },
    effectDesc: '防御力 +15, クリティカル率 +8%'
  },


  // --- MAGIC BRANCHES ---
  // FIRE (火)
  {
    id: 'fire_spark',
    name: '火霊の着火',
    desc: '体内の魔力へ高熱を宿し、魔法の威力を根底から高める。',
    cost: 1,
    type: 'magic',
    branchId: 'fire',
    stats: { atk: 12, crit: 4 },
    effectDesc: '攻撃力 +12, クリティカル +4%'
  },
  {
    id: 'fire_blaze',
    name: '劫火のインフェルノ',
    desc: '周囲の熱線を完全に掌握し、立ち塞がる者を灰塵へと変える。',
    cost: 2,
    type: 'magic',
    branchId: 'fire',
    reqSkillId: 'fire_spark',
    stats: { atk: 24, hp: 30 },
    effectDesc: '攻撃力 +24, 最大HP +30'
  },

  // ICE (氷)
  {
    id: 'ice_armor',
    name: '氷雪のベール',
    desc: '絶対零度の薄氷を全身に展開し、刃や打撃を滑らせて減衰する。',
    cost: 1,
    type: 'magic',
    branchId: 'ice',
    stats: { def: 10, hp: 25 },
    effectDesc: '防御力 +10, 最大HP +25'
  },
  {
    id: 'ice_shatter',
    name: '永久凍土の結晶壁',
    desc: '周囲の水蒸気を一瞬で凍結させ、要塞の如き凍土の防御シールドを作る。',
    cost: 2,
    type: 'magic',
    branchId: 'ice',
    reqSkillId: 'ice_armor',
    stats: { def: 20, mp: 30 },
    effectDesc: '防御力 +20, 最大MP +30'
  },

  // THUNDER (雷)
  {
    id: 'thunder_static',
    name: '電光石火の静電',
    desc: '体内に微弱な電流を流し、反射神経と肉体の駆動力を引き上げる。',
    cost: 1,
    type: 'magic',
    branchId: 'thunder',
    stats: { spd: 8, crit: 5 },
    effectDesc: '素早さ +8, クリティカル +5%'
  },
  {
    id: 'thunder_overdrive',
    name: '神罰のサンダーボルト',
    desc: '落雷の如き神速をもって、瞬きする間に敵を殲滅する。',
    cost: 2,
    type: 'magic',
    branchId: 'thunder',
    reqSkillId: 'thunder_static',
    stats: { spd: 16, atk: 15 },
    effectDesc: '素早さ +16, 攻撃力 +15'
  },

  // HOLY (光/聖)
  {
    id: 'holy_heal',
    name: '陽光のセイントブレス',
    desc: '天界の光を浴び、細胞の結合と生命力の核を極めて活性化させる。',
    cost: 1,
    type: 'magic',
    branchId: 'holy',
    stats: { hp: 45, mp: 15 },
    effectDesc: '最大HP +45, 最大MP +15'
  },
  {
    id: 'holy_blessing',
    name: '神聖のゴッドオーラ',
    desc: '神罰を跳ね除ける聖なるベールを構築し、肉体を不滅へと近づける。',
    cost: 2,
    type: 'magic',
    branchId: 'holy',
    reqSkillId: 'holy_heal',
    stats: { hp: 80, def: 12 },
    effectDesc: '最大HP +80, 防御力 +12'
  },

  // DARK (闇)
  {
    id: 'dark_corruption',
    name: '深淵のシャドウアイ',
    desc: '冥府の門を開き、闇より溢れる不吉な破滅の魔力をその手に受ける。',
    cost: 1,
    type: 'magic',
    branchId: 'dark',
    stats: { mp: 35, atk: 10 },
    effectDesc: '最大MP +35, 攻撃力 +10'
  },
  {
    id: 'dark_nightmare',
    name: '漆黒の奈落ダークネス',
    desc: '敵を果てなき暗黒へ突き落とし、防御の隙を完全に射抜く。',
    cost: 2,
    type: 'magic',
    branchId: 'dark',
    reqSkillId: 'dark_corruption',
    stats: { crit: 12, atk: 18 },
    effectDesc: 'クリティカル率 +12%, 攻撃力 +18'
  },


  // --- CLASS BRANCHES ---
  // WARRIOR (戦士)
  {
    id: 'warrior_might',
    name: '剛力ブレイク撃',
    desc: '修行によって極限まで研ぎ澄まされた、圧倒的質量を誇る斬撃。',
    cost: 1,
    type: 'class',
    branchId: 'warrior',
    stats: { atk: 15, hp: 30 },
    effectDesc: '攻撃力 +15, 最大HP +30'
  },
  {
    id: 'warrior_retaliation',
    name: '不撓不屈の闘魂',
    desc: '致命傷を受けるほどに闘争心が滾り、攻撃威力が異次元へと加速する。',
    cost: 2,
    type: 'class',
    branchId: 'warrior',
    reqSkillId: 'warrior_might',
    stats: { atk: 30, crit: 8 },
    effectDesc: '攻撃力 +30, クリティカル率 +8%'
  },

  // MAGE (魔法使い)
  {
    id: 'mage_intellect',
    name: '賢者のマナ理論',
    desc: 'エーテルの高次元構造を読み解くことで、魔法攻撃力の絶対閾を高める。',
    cost: 1,
    type: 'class',
    branchId: 'mage',
    stats: { mp: 50, atk: 10 },
    effectDesc: '最大MP +50, 攻撃力 +10'
  },
  {
    id: 'mage_focus',
    name: '叡智の極点「境界」',
    desc: '詠唱の精神集中を常時維持することで、スペルの消費ロスを極限まで抑える。',
    cost: 2,
    type: 'class',
    branchId: 'mage',
    reqSkillId: 'mage_intellect',
    stats: { mp: 80, spd: 8 },
    effectDesc: '最大MP +80, 素早さ +8'
  },

  // THIEF (盗賊)
  {
    id: 'thief_haste',
    name: '疾風シャドーステップ',
    desc: '残像を残すほどの身軽な動きで、敵の視線を完全に翻弄する。',
    cost: 1,
    type: 'class',
    branchId: 'thief',
    stats: { spd: 12, crit: 6 },
    effectDesc: '素早さ +12, クリティカル +6%'
  },
  {
    id: 'thief_crit_strike',
    name: '暗殺の極意「刹那」',
    desc: '完全に気配を消し去り、防御力の隙間を突いて急所を蹂躙する。',
    cost: 2,
    type: 'class',
    branchId: 'thief',
    reqSkillId: 'thief_haste',
    stats: { crit: 15, spd: 15 },
    effectDesc: 'クリティカル率 +15%, 素早さ +15'
  },

  // CLERIC (神官)
  {
    id: 'cleric_grace',
    name: '主神アストリアの憐れみ',
    desc: '純真な祈りを捧げることで、慈愛のベールが傷を瞬時に修復する。',
    cost: 1,
    type: 'class',
    branchId: 'cleric',
    stats: { hp: 40, mp: 30 },
    effectDesc: '最大HP +40, 最大MP +30'
  },
  {
    id: 'cleric_revive',
    name: '不滅の奇跡ミラクライフ',
    desc: '天上の祝福を受け、戦闘で極限状態を生き抜く加護を常時得る。',
    cost: 2,
    type: 'class',
    branchId: 'cleric',
    reqSkillId: 'cleric_grace',
    stats: { hp: 70, def: 15 },
    effectDesc: '最大HP +70, 防御力 +15'
  },

  // KNIGHT (騎士)
  {
    id: 'knight_bastion',
    name: '守護騎士の要塞聖盾',
    desc: '体幹と防壁の極限。いかなる魔物の激しい猛進もその盾で無に帰す。',
    cost: 1,
    type: 'class',
    branchId: 'knight',
    stats: { def: 18, hp: 40 },
    effectDesc: '防御力 +18, 最大HP +40'
  },
  {
    id: 'knight_immortality',
    name: '王国の覇道守護鎧',
    desc: 'あらゆる打撃を跳ね返す、国家最高の鍛冶師が手がけた絶対不落の鎧。',
    cost: 2,
    type: 'class',
    branchId: 'knight',
    reqSkillId: 'knight_bastion',
    stats: { def: 35, hp: 60 },
    effectDesc: '防御力 +35, 最大HP +60'
  }
];

// Calculate cumulative stat bonuses from all unlocked skills
export function getSkillStatsBonus(character: CharacterState) {
  const bonus = { hp: 0, mp: 0, atk: 0, def: 0, spd: 0, crit: 0 };
  if (!character || !character.unlockedSkills) return bonus;

  character.unlockedSkills.forEach((skillId) => {
    const node = ALL_SKILLS.find(s => s.id === skillId);
    if (node && node.stats) {
      if (node.stats.hp) bonus.hp += node.stats.hp;
      if (node.stats.mp) bonus.mp += node.stats.mp;
      if (node.stats.atk) bonus.atk += node.stats.atk;
      if (node.stats.def) bonus.def += node.stats.def;
      if (node.stats.spd) bonus.spd += node.stats.spd;
      if (node.stats.crit) bonus.crit += node.stats.crit;
    }
  });

  return bonus;
}

// Purchase and unlock a skill node
export function unlockSkillNode(character: CharacterState, skillId: string): { updatedChar: CharacterState; success: boolean; message: string } {
  if (!character) {
    return { updatedChar: character, success: false, message: 'キャラクターが見つかりません。' };
  }

  const node = ALL_SKILLS.find(s => s.id === skillId);
  if (!node) {
    return { updatedChar: character, success: false, message: '指定されたスキルは存在しません。' };
  }

  // Already unlocked check
  if (character.unlockedSkills.includes(skillId)) {
    return { updatedChar: character, success: false, message: '既にこのスキルは習得済みです。' };
  }

  // Cost check
  const currentSp = character.sp !== undefined ? character.sp : 0;
  if (currentSp < node.cost) {
    return { updatedChar: character, success: false, message: `スキルポイント(SP)が不足しています。（必要: ${node.cost} SP, 所持: ${currentSp} SP）` };
  }

  // Prerequisite skill check
  if (node.reqSkillId && !character.unlockedSkills.includes(node.reqSkillId)) {
    const reqNode = ALL_SKILLS.find(s => s.id === node.reqSkillId);
    const reqName = reqNode ? reqNode.name : '前提スキル';
    return { updatedChar: character, success: false, message: `前提スキル「${reqName}」を先に習得してください。` };
  }

  // Branch mismatch checks (Race, Magic, Class alignment)
  if (node.type === 'race' && character.race.id !== node.branchId) {
    return { updatedChar: character, success: false, message: 'あなたの種族ではこのスキルを習得できません。' };
  }
  if (node.type === 'magic' && character.magicType.id !== node.branchId) {
    return { updatedChar: character, success: false, message: 'あなたの魔法属性ではこのスキルを習得できません。' };
  }
  if (node.type === 'class' && character.classInfo.id !== node.branchId) {
    return { updatedChar: character, success: false, message: 'あなたの役職（クラス）ではこのスキルを習得できません。' };
  }

  // Unlock and deduct SP
  const updatedChar: CharacterState = {
    ...character,
    sp: currentSp - node.cost,
    unlockedSkills: [...character.unlockedSkills, skillId],
  };

  return {
    updatedChar,
    success: true,
    message: `✨ スキル「${node.name}」を習得しました！`
  };
}
