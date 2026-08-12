import { CharacterState } from '../types';

/**
 * Calculates total Combat Power (戦闘力) of a character based on level, stats, equipment, and reincarnation count.
 */
export function calculateCombatPower(char: CharacterState | null): number {
  if (!char) return 0;
  
  const level = char.level || 1;
  const hp = char.maxHp || 100;
  const mp = char.maxMp || 50;
  const atk = char.atk || 10;
  const def = char.def || 5;
  const spd = char.spd || 5;
  const crit = char.crit || 5;

  const weaponAtk = char.equipment?.weapon?.stats?.atk || 0;
  const armorDef = char.equipment?.armor?.stats?.def || 0;
  const accAtk = char.equipment?.accessory?.stats?.atk || 0;
  const accDef = char.equipment?.accessory?.stats?.def || 0;

  const reincarnation = char.reincarnationCount || 0;

  // Weighted combat power formula
  const power = Math.floor(
    level * 18 +
    hp * 0.45 +
    mp * 0.35 +
    (atk + weaponAtk + accAtk) * 3.2 +
    (def + armorDef + accDef) * 2.8 +
    spd * 2.2 +
    crit * 3.5 +
    reincarnation * 120
  );

  return power;
}

/**
 * Reincarnation Requirement Threshold
 * Can reincarnate if Combat Power >= 280 OR Level >= 8 OR stage cleared
 */
export const REINCARNATION_POWER_REQ = 280;

export function canReincarnate(char: CharacterState | null): boolean {
  if (!char) return false;
  const power = calculateCombatPower(char);
  return power >= REINCARNATION_POWER_REQ || char.level >= 8 || (char.reincarnationCount || 0) > 0;
}
