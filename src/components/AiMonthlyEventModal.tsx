import React, { useState } from 'react';
import { CharacterState, Item } from '../types';
import { Sparkles, Calendar, Trophy, Gift, Bot, Zap, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { createLogEntry, appendLogToCharacter } from '../utils/logHelper';

interface AiMonthlyEventModalProps {
  character: CharacterState;
  onClose: () => void;
  onUpdateCharacter: (char: CharacterState) => void;
  onShowMessage: (msg: string) => void;
}

export const AiMonthlyEventModal: React.FC<AiMonthlyEventModalProps> = ({
  character,
  onClose,
  onUpdateCharacter,
  onShowMessage,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [generatedEvent, setGeneratedEvent] = useState<any>(character.activeAiEvent || null);
  const [hasClaimedReward, setHasClaimedReward] = useState<boolean>(false);

  const currentMonth = character.gameMonth || 1;

  const handleFetchAiEvent = async () => {
    setIsLoading(true);
    try {
      const nextMonth = currentMonth + 1;
      const res = await fetch('/api/generate-monthly-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monthNumber: nextMonth }),
      });
      const data = await res.json();
      setGeneratedEvent(data);
      setHasClaimedReward(false);

      let updatedChar: CharacterState = {
        ...character,
        gameMonth: nextMonth,
        activeAiEvent: data,
      };

      const logMsg = createLogEntry(
        'event',
        `AI自動考案イベント [${data.title}] 開催！`,
        `1ヶ月の経過により、AIオーラが新月イベント「${data.title}」を自動生成しました！(${data.description})`,
        undefined,
        { gold: 0, exp: 0 }
      );
      updatedChar = appendLogToCharacter(updatedChar, logMsg);
      onUpdateCharacter(updatedChar);
      onShowMessage(`🤖 AIが第${nextMonth}月の新イベント「${data.title}」を自動生成しました！`);
    } catch (e) {
      console.error(e);
      onShowMessage('AIイベントの生成に失敗しました。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaimReward = () => {
    if (!generatedEvent || hasClaimedReward) return;
    setHasClaimedReward(true);

    const rewardItem: Item = {
      id: `ai_event_reward_${Date.now()}`,
      name: generatedEvent.rewardItemName || 'AI自動生成・神秘の結晶',
      type: 'accessory',
      rarity: 'mythic',
      stats: { atk: 25, def: 20, spd: 15, crit: 10 },
      desc: `[MYTHIC - AI第${currentMonth}月イベント限定] ${generatedEvent.title}の記念報酬。全能力値が大きく上昇する至高のアーティファクト。`,
      price: 1500,
      icon: 'Sparkles',
    };

    let updatedChar: CharacterState = {
      ...character,
      gacha10Tickets: (character.gacha10Tickets || 0) + 3,
      gems: (character.gems || 0) + 2000,
      inventory: [rewardItem, ...character.inventory],
    };

    const logMsg = createLogEntry(
      'loot',
      `AIイベント報酬獲得: ${rewardItem.name}`,
      `AIマンスリーイベント報酬として「${rewardItem.name}」と10連ガチャ券x3、2000Gemsを獲得しました！`,
      undefined,
      { gold: 0, exp: 0 }
    );
    updatedChar = appendLogToCharacter(updatedChar, logMsg);

    onUpdateCharacter(updatedChar);
    onShowMessage(`🎁 AIイベント記念報酬（10連券x3 & 神話級アーティファクト）を受け取りました！`);
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-xl z-50 flex items-center justify-center p-4 animate-backdropFadeIn">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-gradient-to-b from-[#161326] via-[#0b0c16] to-[#07080b] border-2 border-purple-500/80 max-w-xl w-full rounded-3xl p-6 sm:p-8 shadow-[0_0_80px_rgba(168,85,247,0.4)] text-white relative overflow-hidden"
      >
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/15 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-purple-300 text-xs font-mono font-black uppercase tracking-wider">
              <Bot className="w-4 h-4 text-purple-400 animate-pulse" /> AI AUTOMATED MONTHLY EVENT SYSTEM
            </div>
            <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-pink-200 to-amber-300 tracking-tight mt-1">
              ✨ 1ヶ月経過・AI自動イベントカレンダー
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-xs text-slate-300 hover:text-white px-3.5 py-2 bg-slate-900/90 border border-slate-700 rounded-xl cursor-pointer hover:bg-slate-800 transition shadow"
          >
            閉じる ✕
          </button>
        </div>

        {/* Current Month Info */}
        <div className="bg-purple-950/40 border border-purple-500/30 rounded-2xl p-4 mb-6 relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center shadow-lg border border-purple-400/50">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-xs text-purple-300 font-mono font-bold">現在のゲーム時間軸</div>
              <div className="text-xl font-black text-white">第 {currentMonth} ヶ月目</div>
            </div>
          </div>
          <button
            onClick={handleFetchAiEvent}
            disabled={isLoading}
            className="px-4 py-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black text-xs sm:text-sm rounded-xl shadow-[0_0_25px_rgba(168,85,247,0.5)] flex items-center gap-2 cursor-pointer transition transform active:scale-95 disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'AIが新月イベント考案中...' : '⏩ 1ヶ月進めてAIイベント発動！'}</span>
          </button>
        </div>

        {/* Generated Event Showcase */}
        {generatedEvent ? (
          <div className="space-y-4 relative z-10">
            <div className="p-5 bg-gradient-to-r from-purple-950/80 via-slate-900 to-purple-950/80 border-2 border-purple-400/60 rounded-2xl shadow-xl space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 px-3 py-1 bg-purple-500 text-slate-950 font-black text-[10px] font-mono rounded-bl-xl uppercase tracking-widest">
                AI Theme: {generatedEvent.themeName}
              </div>

              <div className="inline-flex items-center gap-1.5 text-xs text-amber-300 font-mono font-bold px-3 py-1 bg-amber-950/60 border border-amber-500/40 rounded-full">
                <Zap className="w-3.5 h-3.5 text-amber-400" /> 特殊バフ: {generatedEvent.buffType} (+{generatedEvent.buffValue * 100}%効果)
              </div>

              <h4 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-400">
                {generatedEvent.title}
              </h4>

              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
                {generatedEvent.description}
              </p>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-purple-200">
                <span>🎁 限定記念報酬: <strong className="text-amber-300">{generatedEvent.rewardItemName}</strong></span>
                <span className="text-emerald-400 font-mono font-bold">+ 10連券x3 & 2000 Gems</span>
              </div>
            </div>

            {/* Claim Reward Button */}
            <div className="text-center pt-2">
              {!hasClaimedReward ? (
                <button
                  onClick={handleClaimReward}
                  className="w-full py-4 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-base rounded-2xl shadow-[0_0_35px_rgba(245,158,11,0.6)] flex items-center justify-center gap-2 cursor-pointer transform hover:scale-[1.01] active:scale-95 transition"
                >
                  <Gift className="w-5 h-5" />
                  <span>AI今月イベント記念報酬を受け取る！</span>
                </button>
              ) : (
                <div className="p-4 bg-emerald-950/50 border border-emerald-500/50 rounded-2xl text-center flex items-center justify-center gap-2 text-emerald-300 font-black text-sm">
                  <CheckCircle className="w-5 h-5 text-emerald-400" /> 今月のAIイベント報酬受取完了！
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-10 bg-slate-900/60 border border-white/10 rounded-2xl p-6 relative z-10 space-y-3">
            <Bot className="w-12 h-12 text-purple-400 mx-auto animate-bounce" />
            <h4 className="text-base font-bold text-slate-200">まだ今月のAI自動イベントは発生していません</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              上の「1ヶ月進めてAIイベント発動！」ボタンを押すと、AIがその月にふさわしい画期的なダンジョンイベントや祝祭を自動考案します。
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};
