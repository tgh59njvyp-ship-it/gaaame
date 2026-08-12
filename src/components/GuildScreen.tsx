import React, { useState, useEffect } from 'react';
import { CharacterState, GuildQuest } from '../types';
import { Award, CheckCircle, ShieldCheck, Coins, Trophy, ArrowRight, Crown, Sparkles, ChevronRight, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getAdventurerRank, calculateCombatPower, AdventurerRankInfo } from '../utils/rankUtils';
import { createLogEntry, appendLogToCharacter } from '../utils/logHelper';

interface GuildScreenProps {
  character: CharacterState;
  onUpdateCharacter: (updated: CharacterState) => void;
  onShowMessage: (msg: string) => void;
}

export const GuildScreen: React.FC<GuildScreenProps> = ({ character, onUpdateCharacter, onShowMessage }) => {
  const combatPower = calculateCombatPower(character);
  const rankInfo = getAdventurerRank(combatPower);

  // Modal state for Rank Up Promotion Animation
  const [showRankUpModal, setShowRankUpModal] = useState<boolean>(false);
  const [promotionData, setPromotionData] = useState<{
    oldRank: AdventurerRankInfo;
    newRank: AdventurerRankInfo;
    oldPower: number;
    newPower: number;
  } | null>(null);

  const handleClaimQuestReward = (questId: string) => {
    const targetQuest = character.quests.find((q) => q.id === questId);
    if (!targetQuest || !targetQuest.isCompleted || targetQuest.isClaimed) return;

    const oldPower = calculateCombatPower(character);
    const oldRank = getAdventurerRank(oldPower);

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

    const newPower = calculateCombatPower(updatedChar);
    const newRank = getAdventurerRank(newPower);

    onUpdateCharacter(updatedChar);
    onShowMessage(`クエスト「${targetQuest.title}」の報酬を獲得しました！ (金貨 +${targetQuest.reward.gold}G, EXP +${targetQuest.reward.exp})`);

    // Check if Rank Up occurred!
    if (newRank.rankNum > oldRank.rankNum || newRank.gradeIndex > oldRank.gradeIndex) {
      setPromotionData({
        oldRank,
        newRank,
        oldPower,
        newPower,
      });
      setShowRankUpModal(true);
    }
  };

  const triggerTestPromotion = () => {
    const dummyOldRank = {
      ...rankInfo,
      rankNum: Math.max(1, rankInfo.rankNum - 1),
    };
    setPromotionData({
      oldRank: dummyOldRank,
      newRank: rankInfo,
      oldPower: Math.max(0, combatPower - 120),
      newPower: combatPower,
    });
    setShowRankUpModal(true);
  };

  // Calculate progress percent to next rank
  let nextRankPercent = 100;
  if (rankInfo.nextThreshold) {
    const currentProgress = combatPower - rankInfo.prevThreshold;
    const totalRequired = rankInfo.nextThreshold - rankInfo.prevThreshold;
    nextRankPercent = Math.min(100, Math.max(0, Math.floor((currentProgress / totalRequired) * 100)));
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6 animate-fadeIn relative pb-24">
      {/* GUILD HEADER */}
      <div className="bg-[#0f0f12] border border-[#2d2d30] rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 text-center md:text-left z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-950/40 border border-amber-500/40 text-amber-300 text-xs font-mono uppercase tracking-widest rounded-full">
            <Award className="w-4 h-4 text-amber-400" /> 王都冒険者ギルド総本部
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">ギルドクエスト＆実力認定所</h1>
          <p className="text-xs md:text-sm text-slate-400 max-w-md">
            クエストを達成して冒険者実力ランクを高めよ。高ランク者には王立騎士団に匹敵する特権と報酬が与えられる。
          </p>
        </div>

        {/* ORNATE GOLDEN BADGE FOR NUMERICAL RANK */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="relative group cursor-pointer animate-badge-float" onClick={triggerTestPromotion}>
            {/* Outer Golden Glow */}
            <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-600 opacity-60 blur-xl group-hover:opacity-100 transition duration-500" />

            {/* Multi-layered Ornate Golden Badge Box */}
            <div className="relative w-72 bg-gradient-to-b from-[#2a2110] via-[#1c160b] to-[#0c0903] border-2 border-amber-400/80 rounded-3xl p-4 shadow-[0_0_30px_rgba(245,158,11,0.35)] flex flex-col items-center text-center overflow-hidden">
              {/* Metallic Shimmer Reflection */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-metallic-shimmer pointer-events-none" />

              {/* Top Wings & Crown Header */}
              <div className="flex items-center justify-between w-full px-2 mb-1 text-amber-400">
                <Crown className="w-5 h-5 text-amber-300 animate-pulse" />
                <span className="text-[10px] font-mono font-black uppercase tracking-widest text-amber-300">
                  OFFICIAL GUILD BADGE
                </span>
                <Trophy className="w-5 h-5 text-amber-300 animate-pulse" />
              </div>

              {/* Main Numerical Rank Crest */}
              <div className="relative my-2 w-full flex items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-200 via-amber-400 to-amber-700 p-[3px] shadow-[0_0_20px_rgba(251,191,36,0.6)]">
                  <div className="w-full h-full rounded-full bg-gradient-to-b from-[#181105] to-[#0a0702] flex flex-col items-center justify-center border border-amber-300/40 relative overflow-hidden">
                    <span className="text-[9px] font-mono font-black text-amber-400/80 uppercase tracking-wider">RANK</span>
                    <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-yellow-100 to-amber-500 font-mono tracking-tighter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                      No.{rankInfo.rankNum}
                    </span>
                    <span className="text-[10px] font-black text-amber-300 font-mono mt-0.5">
                      [{rankInfo.rank} 級]
                    </span>
                  </div>
                </div>
              </div>

              {/* Title & Combat Power */}
              <div className="space-y-1 w-full">
                <div className="text-xs font-black text-amber-200 tracking-wide font-sans">
                  {rankInfo.title}
                </div>
                <div className="text-xs font-mono font-extrabold text-white flex items-center justify-center gap-1.5 bg-amber-950/60 border border-amber-500/30 rounded-xl py-1 px-3">
                  <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span>戦闘力: <strong className="text-amber-300">{combatPower.toLocaleString()}</strong></span>
                </div>
              </div>

              {/* Rank Progress Bar */}
              <div className="w-full mt-3 space-y-1 text-left">
                <div className="flex justify-between items-center text-[10px] font-mono text-amber-200/80 font-bold">
                  <span>次ランク承認まで</span>
                  <span>{rankInfo.nextThreshold ? `${rankInfo.nextThreshold - combatPower} CP` : 'MAX RANK'}</span>
                </div>
                <div className="w-full bg-black/60 h-2 rounded-full overflow-hidden border border-amber-500/30">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-400 transition-all duration-500" 
                    style={{ width: `${nextRankPercent}%` }} 
                  />
                </div>
              </div>

              {/* Replay Promotion Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  triggerTestPromotion();
                }}
                className="mt-3 text-[10px] font-bold text-amber-300/90 hover:text-white underline decoration-amber-400 flex items-center justify-center gap-1 cursor-pointer transition"
              >
                <Sparkles className="w-3 h-3 text-amber-300 animate-spin duration-3000" />
                <span>昇格演出を再生</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* QUEST LIST */}
      <div className="bg-[#0f0f12] border border-[#2d2d30] rounded-3xl p-6 md:p-8 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#222] pb-4">
          <h2 className="text-sm font-sans font-black tracking-widest text-[#d4af37] uppercase flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" /> 冒険者ギルド任務板（クエストボード）
          </h2>
          <span className="text-xs font-mono text-slate-400">達成数: {character.quests.filter(q => q.isClaimed).length} / {character.quests.length}</span>
        </div>

        <div className="space-y-4">
          {character.quests.map((quest) => {
            const progressPercent = Math.min(100, Math.floor((quest.currentProgress / quest.targetCount) * 100));
            const isReadyToClaim = quest.currentProgress >= quest.targetCount && !quest.isClaimed;

            return (
              <div
                key={quest.id}
                className={`p-5 rounded-2xl border transition-all duration-300 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
                  quest.isClaimed
                    ? 'bg-[#121215]/50 border-[#222] opacity-60'
                    : isReadyToClaim
                    ? 'bg-gradient-to-r from-amber-950/40 via-[#151522] to-amber-950/30 border-amber-500/80 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                    : 'bg-[#151518] border-[#2d2d30] hover:border-[#444]'
                }`}
              >
                <div className="space-y-2 flex-1 w-full">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 bg-amber-950/80 border border-amber-500/50 text-[10px] font-mono font-bold text-amber-300 rounded-lg">
                      推奨 Rank {quest.rankReq}
                    </span>
                    <h3 className="text-base font-bold text-white">{quest.title}</h3>
                    {quest.isClaimed && (
                      <span className="text-xs text-emerald-400 font-mono font-bold flex items-center gap-1 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-500/30">
                        <CheckCircle className="w-3.5 h-3.5" /> 受領済
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">{quest.desc}</p>

                  <div className="w-full max-w-md bg-[#0a0a0c] h-2.5 rounded-full overflow-hidden border border-[#222] mt-2">
                    <div
                      className="bg-gradient-to-r from-amber-500 to-yellow-300 h-full transition-all duration-300 rounded-full"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono flex justify-between max-w-md font-bold">
                    <span>進捗: {quest.currentProgress} / {quest.targetCount}</span>
                    <span className="text-amber-400">報酬: 金貨 {quest.reward.gold}G / EXP {quest.reward.exp}</span>
                  </div>
                </div>

                <div className="shrink-0 w-full sm:w-auto text-right">
                  {quest.isClaimed ? (
                    <span className="inline-block px-4 py-2.5 bg-[#1a1a1e] text-slate-500 text-xs rounded-xl font-bold border border-[#222] cursor-not-allowed">
                      受領完了
                    </span>
                  ) : isReadyToClaim ? (
                    <button
                      onClick={() => handleClaimQuestReward(quest.id)}
                      className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 hover:to-yellow-300 text-slate-950 text-xs font-black rounded-xl transition cursor-pointer shadow-[0_0_20px_rgba(245,158,11,0.5)] animate-pulse flex items-center justify-center gap-2"
                    >
                      <span>報酬受領＆実績報告</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <span className="inline-block px-4 py-2.5 bg-[#1a1a1e] border border-[#333] text-slate-400 text-xs rounded-xl font-mono">
                      任務遂行中...
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FULLSCREEN RANK UP PROMOTION OVERLAY (専用の昇格演出) */}
      <AnimatePresence>
        {showRankUpModal && promotionData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center bg-black/90 backdrop-blur-xl p-4"
          >
            {/* 1. Golden Screen Flash animation */}
            <div className="absolute inset-0 animate-gold-flash pointer-events-none z-10" />

            {/* 2. Rotating Golden Conic Rays Background */}
            <div 
              className="absolute w-[150vw] h-[150vw] animate-spin-slow pointer-events-none opacity-40 z-0"
              style={{
                background: `conic-gradient(from 0deg at 50% 50%, 
                  rgba(254, 240, 138, 0.4) 0deg, transparent 15deg, 
                  rgba(245, 158, 11, 0.4) 30deg, transparent 45deg, 
                  rgba(254, 240, 138, 0.4) 60deg, transparent 75deg, 
                  rgba(245, 158, 11, 0.4) 90deg, transparent 105deg, 
                  rgba(254, 240, 138, 0.4) 120deg, transparent 135deg, 
                  rgba(245, 158, 11, 0.4) 150deg, transparent 165deg, 
                  rgba(254, 240, 138, 0.4) 180deg, transparent 195deg, 
                  rgba(245, 158, 11, 0.4) 210deg, transparent 225deg, 
                  rgba(254, 240, 138, 0.4) 240deg, transparent 255deg, 
                  rgba(245, 158, 11, 0.4) 270deg, transparent 285deg, 
                  rgba(254, 240, 138, 0.4) 300deg, transparent 315deg, 
                  rgba(245, 158, 11, 0.4) 330deg, transparent 345deg)`
              }}
            />

            {/* 3. Floating Gold Stars / Particles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
              {[...Array(16)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ 
                    x: `${Math.random() * 100}%`, 
                    y: '110%', 
                    opacity: 0, 
                    scale: Math.random() * 0.8 + 0.5 
                  }}
                  animate={{ 
                    y: '-10%', 
                    opacity: [0, 1, 0], 
                    rotate: 360 
                  }}
                  transition={{ 
                    duration: 2.5 + Math.random() * 2, 
                    repeat: Infinity, 
                    delay: Math.random() * 1.5,
                    ease: "easeOut"
                  }}
                  className="absolute text-amber-300 text-xl font-bold"
                >
                  ✨
                </motion.div>
              ))}
            </div>

            {/* 4. Center Main Promotion Emblem Card */}
            <motion.div
              initial={{ scale: 0.2, rotate: -5, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 220, damping: 18 }}
              className="relative z-20 max-w-lg w-full bg-gradient-to-b from-[#2a1d08] via-[#1a1205] to-[#0a0702] border-4 border-amber-400 rounded-3xl p-6 md:p-8 text-center shadow-[0_0_80px_rgba(245,158,11,0.7)] space-y-6 overflow-hidden"
            >
              {/* Gold Shimmer Bar */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-200/20 to-transparent animate-metallic-shimmer pointer-events-none" />

              {/* Title & Crown Banner */}
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-4 py-1 bg-amber-400 text-slate-950 font-black text-xs rounded-full uppercase tracking-widest font-mono shadow-md animate-pulse">
                  <Crown className="w-4 h-4" /> GUILD PROMOTION ANNOUNCEMENT
                </div>
                <h2 className="text-3xl md:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-400 drop-shadow-[0_4px_10px_rgba(0,0,0,0.9)]">
                  冒険者ランク 昇格 !
                </h2>
                <p className="text-xs text-amber-200/80 font-medium">
                  王都ギルド総本部より、貴殿の強さと実績が正式承認されました。
                </p>
              </div>

              {/* Gold Crest Icon */}
              <div className="relative mx-auto w-32 h-32 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-amber-400/20 animate-ping" />
                <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-amber-200 via-amber-400 to-amber-600 p-1 shadow-[0_0_40px_rgba(251,191,36,0.8)]">
                  <div className="w-full h-full rounded-full bg-[#0d0902] border-2 border-amber-300 flex flex-col items-center justify-center">
                    <Trophy className="w-10 h-10 text-amber-300 mb-0.5 animate-bounce" />
                    <span className="text-2xl font-black text-amber-300 font-mono tracking-tighter">
                      No.{promotionData.newRank.rankNum}
                    </span>
                  </div>
                </div>
              </div>

              {/* Rank Transition Details */}
              <div className="bg-[#120d04] border border-amber-500/40 rounded-2xl p-4 space-y-3 shadow-inner">
                <div className="flex items-center justify-around">
                  {/* Old Rank */}
                  <div className="text-center space-y-0.5 opacity-70">
                    <div className="text-[10px] text-amber-200/60 font-mono uppercase">旧ランク</div>
                    <div className="text-lg font-black text-slate-300 font-mono">No.{promotionData.oldRank.rankNum}</div>
                    <div className="text-xs font-bold text-slate-400">[{promotionData.oldRank.rank} 級]</div>
                  </div>

                  {/* Golden Arrow */}
                  <div className="flex flex-col items-center text-amber-400 animate-pulse">
                    <ArrowRight className="w-8 h-8" />
                    <span className="text-[9px] font-black uppercase font-mono">RANK UP</span>
                  </div>

                  {/* New Rank */}
                  <div className="text-center space-y-0.5">
                    <div className="text-[10px] text-amber-300 font-mono uppercase font-black">新ランク</div>
                    <div className="text-2xl font-black text-amber-300 font-mono drop-shadow-[0_0_10px_rgba(245,158,11,0.8)]">
                      No.{promotionData.newRank.rankNum}
                    </div>
                    <div className="text-xs font-black text-amber-200">[{promotionData.newRank.rank} 級]</div>
                  </div>
                </div>

                <div className="border-t border-amber-500/20 pt-2 text-xs font-bold text-amber-200">
                  新称号: <span className="text-amber-300 font-extrabold">【{promotionData.newRank.title}】</span>
                </div>
              </div>

              {/* Action Close Button */}
              <button
                onClick={() => setShowRankUpModal(false)}
                className="w-full py-4 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm rounded-2xl shadow-[0_0_30px_rgba(245,158,11,0.6)] cursor-pointer transition transform hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5 fill-current" />
                <span>昇格を受託し、更なる高みへ！</span>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

