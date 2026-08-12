import React from 'react';
import { CharacterState, GuildQuest } from '../types';
import { Award, CheckCircle, ShieldCheck, Coins, Trophy, ArrowRight } from 'lucide-react';
import { getAdventurerRank, calculateCombatPower } from '../utils/rankUtils';
import { createLogEntry, appendLogToCharacter } from '../utils/logHelper';

interface GuildScreenProps {
  character: CharacterState;
  onUpdateCharacter: (updated: CharacterState) => void;
  onShowMessage: (msg: string) => void;
}

export const GuildScreen: React.FC<GuildScreenProps> = ({ character, onUpdateCharacter, onShowMessage }) => {
  const combatPower = calculateCombatPower(character);
  const rankInfo = getAdventurerRank(combatPower);

  const handleClaimQuestReward = (questId: string) => {
    const targetQuest = character.quests.find((q) => q.id === questId);
    if (!targetQuest || !targetQuest.isCompleted || targetQuest.isClaimed) return;

    let newGold = character.gold + targetQuest.reward.gold;
    let newExp = character.exp + targetQuest.reward.exp;
    let newLevel = character.level;
    let newMaxExp = character.maxExp;
    let newHp = character.hp;
    let newMaxHp = character.maxHp;
    let newAtk = character.atk;
    let newDef = character.def;

    while (newExp >= newMaxExp) {
      newExp -= newMaxExp;
      newLevel += 1;
      newMaxExp = Math.floor(newMaxExp * 1.4);
      newMaxHp += 15;
      newHp = newMaxHp;
      newAtk += 4;
      newDef += 3;
    }

    const updatedQuests = character.quests.map((q) =>
      q.id === questId ? { ...q, isClaimed: true } : q
    );

    const logEntry = createLogEntry(
      'quest',
      `ギルド報酬受領: 「${targetQuest.title}」`,
      `ギルドクエスト「${targetQuest.title}」を達成し、報酬を受け取りました。`,
      undefined,
      { gold: targetQuest.reward.gold, exp: targetQuest.reward.exp }
    );

    let updatedChar: CharacterState = {
      ...character,
      gold: newGold,
      exp: newExp,
      level: newLevel,
      maxExp: newMaxExp,
      hp: newHp,
      maxHp: newMaxHp,
      atk: newAtk,
      def: newDef,
      quests: updatedQuests,
    };

    updatedChar = appendLogToCharacter(updatedChar, logEntry);

    onUpdateCharacter(updatedChar);
    onShowMessage(`クエスト「${targetQuest.title}」の報酬を獲得しました！ (金貨 +${targetQuest.reward.gold}G, EXP +${targetQuest.reward.exp})`);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6 animate-fadeIn">
      {/* Guild Header & Rank Card */}
      <div className="bg-[#0f0f12] border border-[#2d2d30] rounded-2xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#c4a661]/5 rounded-full blur-3xl pointer-events-none"></div>

        <div>
          <div className="flex items-center gap-2 text-[#c4a661] text-xs font-mono uppercase tracking-widest mb-1">
            <Award className="w-4 h-4" /> 冒険者ギルド本部
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">ギルドクエストボード</h1>
          <p className="text-sm text-[#888] mt-1">実績を重ねて実力ランクを高め、高難度クエストに挑め。</p>
        </div>

        <div className="bg-[#151518] border border-[#2d2d30] px-6 py-4 rounded-xl flex items-center gap-5">
          <div className={`w-14 h-14 rounded-xl border flex items-center justify-center text-2xl font-black font-mono shadow-inner ${rankInfo.color}`}>
            {rankInfo.rank}
          </div>
          <div>
            <div className="text-[10px] text-[#777] uppercase font-mono">冒険者実力ランク</div>
            <div className="text-sm font-bold text-white font-mono">戦闘力: {combatPower}</div>
            {rankInfo.nextThreshold && (
              <div className="text-[10px] text-[#888] mt-0.5">次ランクまで残り {rankInfo.nextThreshold - combatPower}</div>
            )}
          </div>
        </div>
      </div>

      {/* Quest List */}
      <div className="bg-[#0f0f12] border border-[#2d2d30] rounded-2xl p-6 md:p-8 shadow-2xl space-y-4">
        <h2 className="text-sm font-sans tracking-[0.2em] text-[#666] uppercase mb-4">受託可能クエスト一覧</h2>

        <div className="space-y-4">
          {character.quests.map((quest) => {
            const progressPercent = Math.min(100, Math.floor((quest.currentProgress / quest.targetCount) * 100));
            const isReadyToClaim = quest.currentProgress >= quest.targetCount && !quest.isClaimed;

            return (
              <div
                key={quest.id}
                className={`p-5 rounded-xl border transition flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
                  quest.isClaimed
                    ? 'bg-[#121215]/50 border-[#222] opacity-60'
                    : isReadyToClaim
                    ? 'bg-[#15151e] border-[#c4a661]'
                    : 'bg-[#151518] border-[#2d2d30]'
                }`}
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-[#22222a] border border-[#333] text-[10px] font-mono text-[#c4a661] rounded">
                      Rank {quest.rankReq}
                    </span>
                    <h3 className="text-base font-bold text-white">{quest.title}</h3>
                    {quest.isClaimed && (
                      <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> 完了済
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#999]">{quest.desc}</p>

                  <div className="w-full max-w-md bg-[#0a0a0c] h-2 rounded-full overflow-hidden border border-[#222] mt-2">
                    <div
                      className="bg-[#c4a661] h-full transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                  <div className="text-[10px] text-[#777] font-mono flex justify-between max-w-md">
                    <span>進捗: {quest.currentProgress} / {quest.targetCount}</span>
                    <span>報酬: 金貨 {quest.reward.gold}G / EXP {quest.reward.exp}</span>
                  </div>
                </div>

                <div>
                  {quest.isClaimed ? (
                    <span className="px-4 py-2 bg-[#222] text-[#666] text-xs rounded-xl font-bold cursor-not-allowed">
                      受取済み
                    </span>
                  ) : isReadyToClaim ? (
                    <button
                      onClick={() => handleClaimQuestReward(quest.id)}
                      className="px-6 py-3 bg-[#c4a661] hover:bg-white text-[#0a0a0c] text-xs font-bold rounded-xl transition cursor-pointer shadow-lg animate-pulse"
                    >
                      報酬を受け取る
                    </button>
                  ) : (
                    <span className="px-4 py-2 bg-[#1a1a1e] border border-[#333] text-[#777] text-xs rounded-xl font-mono">
                      進行中...
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
