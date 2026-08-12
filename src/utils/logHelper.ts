import { CharacterState, AdventureLogEntry, LogCategory } from '../types';

export const createLogEntry = (
  category: LogCategory,
  title: string,
  description: string,
  stageNumber?: number,
  details?: {
    rarity?: 'common' | 'rare' | 'epic' | 'legendary';
    gold?: number;
    exp?: number;
  }
): AdventureLogEntry => {
  const now = new Date();
  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

  return {
    id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    time: timeStr,
    stageInfo: stageNumber ? `STAGE 0${stageNumber}` : undefined,
    category,
    title,
    description,
    rarity: details?.rarity,
    gold: details?.gold,
    exp: details?.exp,
  };
};

export const appendLogToCharacter = (
  char: CharacterState,
  entry: AdventureLogEntry
): CharacterState => {
  const currentLogs = char.logs || [];
  // Keep up to 100 recent logs to prevent huge memory usage
  const updatedLogs = [entry, ...currentLogs].slice(0, 100);
  return {
    ...char,
    logs: updatedLogs,
  };
};
