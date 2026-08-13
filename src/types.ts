export type RaceId = string;

export type MagicTypeId = string;

export type ClassId = string;

export interface RaceInfo {
  id: RaceId;
  name: string;
  desc: string;
  icon: string;
  isReincarnationOnly?: boolean;
  minReincarnationReq?: number;
  bonuses: {
    hp: number;
    mp: number;
    atk: number;
    def: number;
    spd: number;
    crit: number;
    goldBonus?: number;
    expBonus?: number;
  };
  traitName: string;
  traitDesc: string;
}

export interface MagicTypeInfo {
  id: MagicTypeId;
  name: string;
  desc: string;
  color: string;
  element: string;
  spells: Spell[];
  isReincarnationOnly?: boolean;
  minReincarnationReq?: number;
}

export interface Spell {
  id: string;
  name: string;
  mpCost: number;
  power: number;
  desc: string;
  effectType: 'damage' | 'heal' | 'buff' | 'debuff' | 'drain';
  element?: 'fire' | 'ice' | 'wind' | 'lightning' | 'holy' | 'dark' | 'arcane';
  rarity?: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic' | 'divine';
  plusLevel?: number;
  minReincarnationReq?: number;
  statusEffect?: {
    type: 'burn' | 'freeze' | 'paralyze' | 'poison' | 'shield';
    chance: number;
    duration: number;
  };
  masteryLevel?: number;
  masteryExp?: number;
  masteryMaxExp?: number;
}

export interface ClassInfo {
  id: ClassId;
  name: string;
  desc: string;
  role: string;
  isReincarnationOnly?: boolean;
  minReincarnationReq?: number;
  baseStats: {
    hp: number;
    mp: number;
    atk: number;
    def: number;
    spd: number;
    crit: number;
  };
  icon: string;
}

export interface GuildQuest {
  id: string;
  title: string;
  rankReq: string;
  desc: string;
  reward: {
    gold: number;
    exp: number;
  };
  targetCount: number;
  currentProgress: number;
  isCompleted: boolean;
  isClaimed: boolean;
}

export type LogCategory = 'battle' | 'floor' | 'loot' | 'quest' | 'gacha' | 'event' | 'system';

export interface AdventureLogEntry {
  id: string;
  time: string;
  stageInfo?: string;
  category: LogCategory;
  title: string;
  description: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic' | 'divine';
  gold?: number;
  exp?: number;
}

export interface BeginnerQuest {
  id: string;
  title: string;
  desc: string;
  gemReward: number;
  targetCount: number;
  currentCount: number;
  isCompleted: boolean;
  isClaimed: boolean;
  icon: string;
}

export interface EquipmentPreset {
  id: 'setA' | 'setB';
  name: string;
  equipment: {
    weapon: Item | null;
    armor: Item | null;
    accessory: Item | null;
  };
  savedAt?: string;
}

export interface CharacterState {
  name: string;
  race: RaceInfo;
  magicType: MagicTypeInfo;
  classInfo: ClassInfo;
  level: number;
  exp: number;
  maxExp: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  atk: number;
  def: number;
  spd: number;
  crit: number;
  gold: number;
  gems: number;
  gacha10Tickets: number;
  eventTokens: number;
  lastRouletteDate?: string;
  gameMonth?: number;
  activeAiEvent?: {
    title: string;
    themeName: string;
    description: string;
    buffType: string;
    buffValue: number;
    rewardItemName: string;
  } | null;
  beginnerQuests: BeginnerQuest[];
  spells: Spell[];
  inventory: Item[];
  equipment: {
    weapon: Item | null;
    armor: Item | null;
    accessory: Item | null;
  };
  equipmentPresets?: {
    setA?: EquipmentPreset | null;
    setB?: EquipmentPreset | null;
  };
  quests: GuildQuest[];
  logs: AdventureLogEntry[];
  title?: string;
  titlesUnlocked?: string[];
  sp: number;
  unlockedSkills: string[];
  reincarnationCount?: number;
  reincarnationBuffs?: {
    hpBonusPct: number;
    mpBonusPct: number;
    atkBonusPct: number;
    defBonusPct: number;
    expGoldBonusPct: number;
  };
  stats: {
    battlesWon: number;
    damageDealt: number;
    itemsUsed: number;
    floorsCleared: number;
    gachaPulls?: number;
    highestDamage?: number;
  };
}

export interface Item {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'accessory' | 'potion' | 'scroll';
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic' | 'divine';
  stats?: {
    atk?: number;
    def?: number;
    hp?: number;
    mp?: number;
    spd?: number;
    crit?: number;
  };
  effect?: {
    type: 'healHp' | 'healMp' | 'buffAtk' | 'teleport' | 'boostAtk' | 'boostDef' | 'boostMaxHp' | 'boostMaxMp' | 'boostCrit';
    value: number;
  };
  desc: string;
  price: number;
  icon: string;
}

export interface Enemy {
  id: string;
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  spd: number;
  expReward: number;
  goldReward: number;
  sprite: string;
  isBoss?: boolean;
  status?: {
    type: 'burn' | 'freeze' | 'paralyze' | 'poison';
    duration: number;
  };
}

export type FloorType = 'battle' | 'elite' | 'treasure' | 'shop' | 'event' | 'rest' | 'boss';

export interface FloorNode {
  floorNumber: number;
  stageNumber: number;
  type: FloorType;
  completed: boolean;
  enemy?: Enemy;
  eventData?: {
    title: string;
    desc: string;
    choices: {
      text: string;
      resultText: string;
      effect: (char: CharacterState) => { updatedChar: CharacterState; message: string };
    }[];
  };
}

export type GamePhase = 'creation' | 'hub' | 'battle' | 'shop' | 'event' | 'rest' | 'victory' | 'gameover';
export type HubTab = 'dungeon' | 'guild' | 'gacha' | 'log' | 'status';
