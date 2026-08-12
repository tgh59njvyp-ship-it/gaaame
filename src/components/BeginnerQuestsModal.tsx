import React from 'react';
import { CharacterState } from '../types';
import { Award, CheckCircle, Sparkles, Gift, Swords, Shield, Wand2 } from 'lucide-react';
import { createLogEntry, appendLogToCharacter } from '../utils/logHelper';

interface BeginnerQuestsModalProps {
  character: CharacterState;
  onClose: () => void;
  onUpdateCharacter: (char: CharacterState) => void;
  onShowMessage: (msg: string) => void;
}

export const BeginnerQuestsModal: React.FC<BeginnerQuestsModalProps> = ({
  character,
  onClose,
  onUpdateCharacter,
  onShowMessage,
}) => {
  const quests = character.beginnerQuests || [];
  const completedCount = quests.filter((q) => q.isCompleted).length;
  const claimedCount = quests.filter((q) => q.isClaimed).length;
  const totalGemsClaimable = quests
    .filter((q) => q.isCompleted && !q.isClaimed)
    .reduce((sum, q) => sum + q.gemReward, 0);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Swords': return <Swords className="w-5 h-5 text-red-400" />;
      case 'Shield': return <Shield className="w-5 h-5 text-blue-400" />;
      case 'Wand2': return <Wand2 className="w-5 h-5 text-purple-400" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5 text-amber-400" />;
      case 'Gift': return <Gift className="w-5 h-5 text-emerald-400" />;
      default: return <Award className="w-5 h-5 text-amber-400" />;
    }
  };

  const handleClaimReward = (questId: string) => {
    const quest = quests.find((q) => q.id === questId);
    if (!quest || !quest.isCompleted || quest.isClaimed) return;

    const newGems = (character.gems || 0) + quest.gemReward;
    const updatedQuests = quests.map((q) =>
      q.id === questId ? { ...q, isClaimed: true } : q
    );

    let updatedChar: CharacterState = {
      ...character,
      gems: newGems,
      beginnerQuests: updatedQuests,
    };

    const logEntry = createLogEntry(
      'quest',
      `初心者ミッション達成: 「${quest.title}」`,
      `初心者ミッション「${quest.title}」を達成し、ジェム +${quest.gemReward} を受領！`,
      undefined,
      { gold: 0, exp: 0 }
    );
    updatedChar = appendLogToCharacter(updatedChar, logEntry);

    onUpdateCharacter(updatedChar);
    onShowMessage(`🎉 「${quest.title}」達成！ ジェム +${quest.gemReward} 個を獲得しました！`);
  };

  const handleClaimAll = () => {
    const claimable = quests.filter((q) => q.isCompleted && !q.isClaimed);
    if (claimable.length === 0) return;

    let totalGems = 0;
    const updatedQuests = quests.map((q) => {
      if (q.isCompleted && !q.isClaimed) {
        totalGems += q.gemReward;
        return { ...q, isClaimed: true };
      }
      return q;
    });

    let updatedChar: CharacterState = {
      ...character,
      gems: (character.gems || 0) + totalGems,
      beginnerQuests: updatedQuests,
    };

    const logEntry = createLogEntry(
      'quest',
      `初心者ミッション一括受領`,
      `初心者ミッション報酬として 合計 ジェム +${totalGems} 個を一括受領！`,
      undefined,
      { gold: 0, exp: 0 }
    );
    updatedChar = appendLogToCharacter(updatedChar, logEntry);

    onUpdateCharacter(updatedChar);
    onShowMessage(`🎉 初心者ミッションを一括受領！ ジェム +${totalGems} 個 (ガチャ20連分相当) を獲得！`);
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-backdropFadeIn">
      <div className="bg-[#0c0d12] border-2 border-emerald-500/80 max-w-xl w-full rounded-3xl p-6 shadow-[0_0_50px_rgba(16,185,129,0.3)] text-white relative animate-modalExpand">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-white/10">
          <div>
            <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-mono font-bold tracking-widest uppercase">
              <Award className="w-4 h-4" /> BEGINNER MISSION BOUNTY
            </div>
            <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2 mt-0.5">
              <span>初心者応援スタートダッシュミッション</span>
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-white px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl cursor-pointer"
          >
            閉じる ✕
          </button>
        </div>

        {/* Overview Banner */}
        <div className="p-4 bg-gradient-to-r from-emerald-950/80 via-teal-950/80 to-emerald-950/80 border border-emerald-500/50 rounded-2xl mb-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <div className="text-xs font-bold text-emerald-300">
              🎁 すべてクリアで <strong className="text-amber-400 text-base font-mono">合計 6,000 ジェム（ガチャ20連分）</strong> を全GET！
            </div>
            <div className="text-[11px] text-slate-300 mt-0.5">
              進捗: {completedCount} / {quests.length} 達成済み ({claimedCount} 受領完了)
            </div>
          </div>

          {totalGemsClaimable > 0 && (
            <button
              onClick={handleClaimAll}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs rounded-xl shadow-lg shrink-0 animate-pulse cursor-pointer"
            >
              一括受領 (+{totalGemsClaimable} Gems)
            </button>
          )}
        </div>

        {/* Quests List */}
        <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
          {quests.map((q) => {
            const isDone = q.isCompleted;
            const isClaimed = q.isClaimed;

            return (
              <div
                key={q.id}
                className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition ${
                  isClaimed
                    ? 'bg-slate-950/50 border-slate-800/60 text-slate-500'
                    : isDone
                      ? 'bg-emerald-950/40 border-emerald-500/70 text-slate-200 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                      : 'bg-slate-900/80 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                    isClaimed ? 'bg-slate-900 border-slate-800' : isDone ? 'bg-emerald-900/60 border-emerald-500' : 'bg-slate-800 border-slate-700'
                  }`}>
                    {getIcon(q.icon)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-white truncate">{q.title}</span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-950/80 border border-amber-500/50 text-amber-300 shrink-0">
                        +1,000 Gems (10連半分)
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">{q.desc}</p>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-950 rounded-full h-1.5 mt-2 border border-slate-800 overflow-hidden">
                      <div
                        className="bg-emerald-400 h-full transition-all duration-300"
                        style={{ width: `${Math.min(100, (q.currentCount / q.targetCount) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Claim Button or Status */}
                <div className="shrink-0">
                  {isClaimed ? (
                    <span className="text-xs font-bold text-slate-500 flex items-center gap-1 font-mono">
                      <CheckCircle className="w-4 h-4 text-slate-600" /> 受領済み
                    </span>
                  ) : isDone ? (
                    <button
                      onClick={() => handleClaimReward(q.id)}
                      className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-md cursor-pointer animate-pulse"
                    >
                      受領
                    </button>
                  ) : (
                    <span className="text-xs font-mono text-slate-400 font-bold px-2.5 py-1 bg-slate-900 rounded-lg border border-slate-800">
                      {q.currentCount} / {q.targetCount}
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
