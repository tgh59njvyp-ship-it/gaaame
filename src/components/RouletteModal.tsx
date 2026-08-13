import React, { useState } from 'react';
import { CharacterState } from '../types';
import { Sparkles, Gift, Trophy, CheckCircle, RotateCw, Flame, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { createLogEntry, appendLogToCharacter } from '../utils/logHelper';
import { checkAndUpdateBeginnerQuests } from '../utils/beginnerQuests';

interface RouletteModalProps {
  character: CharacterState;
  onClose: () => void;
  onUpdateCharacter: (char: CharacterState) => void;
  onShowMessage: (msg: string) => void;
}

interface WheelSlice {
  id: number;
  label: string;
  subLabel: string;
  color: string;
  tickets: number;
  gems: number;
  isJackpot?: boolean;
}

const WHEEL_SLICES: WheelSlice[] = [
  { id: 0, label: '10連ガチャ券', subLabel: '【最低保証】10連無料!', color: '#2563eb', tickets: 1, gems: 0 },
  { id: 1, label: '10連券 + 1000Gems', subLabel: '大当り! 追加ジェム!', color: '#7c3aed', tickets: 1, gems: 1000 },
  { id: 2, label: '15連分チケット', subLabel: '10連券 + 1500Gems', color: '#059669', tickets: 1, gems: 1500 },
  { id: 3, label: '20連ガチャチケット', subLabel: '超当り! 10連券x2!', color: '#d97706', tickets: 2, gems: 0 },
  { id: 4, label: '10連ガチャ券', subLabel: '10連無料プレゼント', color: '#1d4ed8', tickets: 1, gems: 0 },
  { id: 5, label: '30連ガチャチケット', subLabel: '極当り! 10連券x3!', color: '#dc2626', tickets: 3, gems: 0 },
  { id: 6, label: '10連券 + 2000Gems', subLabel: '豪華ボーナス!', color: '#0284c7', tickets: 1, gems: 2000 },
  { id: 7, label: '👑 100連ジャックポット', subLabel: '10連券x10 + 5000Gems', color: '#b45309', tickets: 10, gems: 5000, isJackpot: true },
];

export const RouletteModal: React.FC<RouletteModalProps> = ({
  character,
  onClose,
  onUpdateCharacter,
  onShowMessage,
}) => {
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [rotationDegree, setRotationDegree] = useState<number>(0);
  const [wonPrize, setWonPrize] = useState<WheelSlice | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const hasSpunToday = character.lastRouletteDate === todayStr;

  const handleSpin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setWonPrize(null);

    // Weighted random selection: Guarantee at least 10-pull, give 80% 10-pull variants, 15% 15~20-pull, 5% jackpot/30-pull
    const rand = Math.random() * 100;
    let selectedSliceIndex = 0;
    if (rand < 40) selectedSliceIndex = 0;
    else if (rand < 65) selectedSliceIndex = 1;
    else if (rand < 80) selectedSliceIndex = 4;
    else if (rand < 90) selectedSliceIndex = 2;
    else if (rand < 96) selectedSliceIndex = 3;
    else if (rand < 99) selectedSliceIndex = 5;
    else selectedSliceIndex = 7; // Jackpot!

    const sliceAngle = 360 / WHEEL_SLICES.length;
    const targetAngle = 360 - (selectedSliceIndex * sliceAngle + sliceAngle / 2);
    const extraRounds = 360 * 7; // 7 full rotations for grand excitement
    const finalRotation = rotationDegree + extraRounds + targetAngle;

    setRotationDegree(finalRotation);

    setTimeout(() => {
      const prize = WHEEL_SLICES[selectedSliceIndex];
      setWonPrize(prize);
      setIsSpinning(false);

      let updatedChar: CharacterState = {
        ...character,
        gacha10Tickets: (character.gacha10Tickets || 0) + prize.tickets,
        gems: (character.gems || 0) + prize.gems,
        lastRouletteDate: todayStr,
      };

      updatedChar = checkAndUpdateBeginnerQuests(updatedChar, 'roulette', 1);

      const logMsg = createLogEntry(
        'gacha',
        `盛大ログボ獲得: 「${prize.label}」`,
        `デイリールーレットで 【${prize.label} (${prize.subLabel})】 を盛大に獲得しました！`,
        undefined,
        { gold: 0, exp: 0 }
      );
      updatedChar = appendLogToCharacter(updatedChar, logMsg);

      onUpdateCharacter(updatedChar);
      onShowMessage(`🎉 【盛大報酬】ログインボーナス「${prize.label}」を獲得しました！`);
    }, 4500);
  };

  return (
    <div 
      className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-4 animate-backdropFadeIn"
      onClick={onClose}
    >
      
      {/* Spectacular celebratory background rays */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/20 via-purple-900/10 to-transparent pointer-events-none animate-pulse" />

      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-b from-[#12131c] via-[#0b0c10] to-[#07080a] border-2 border-amber-400/90 max-w-lg w-full rounded-3xl p-6 sm:p-8 shadow-[0_0_80px_rgba(245,158,11,0.45)] text-white relative overflow-hidden pointer-events-auto"
      >
        
        {/* Floating sparkles and particles */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header with grand badge */}
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/15 relative z-10">
          <div>
            <div className="flex items-center gap-1.5 text-amber-400 text-xs font-mono font-black tracking-widest uppercase">
              <Star className="w-4 h-4 fill-amber-400 animate-spin" /> GRAND DAILY LOGIN BONUS
            </div>
            <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-100 to-amber-500 tracking-tight flex items-center gap-2 mt-1">
              <span>👑 盛大ログインボーナス祭</span>
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-xs text-slate-300 hover:text-white px-3.5 py-2 bg-slate-900/90 border border-slate-700 rounded-xl cursor-pointer hover:bg-slate-800 transition shadow-md"
          >
            閉じる ✕
          </button>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3 text-center mb-6 relative z-10 shadow-inner">
          <p className="text-xs sm:text-sm text-amber-200 font-bold leading-relaxed flex items-center justify-center gap-1.5">
            <Flame className="w-4 h-4 text-amber-400 shrink-0" />
            <span>本日ログイン記念！<span className="text-amber-400 underline font-black">【10連ガチャ券】が100%確定</span>で今すぐ手に入ります！</span>
          </p>
        </div>

        {/* ROULETTE WHEEL CONTAINER */}
        <div className="relative my-4 flex flex-col items-center justify-center">
          {/* Wheel Pointer Arrow */}
          <div className="absolute -top-3 z-30 w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[22px] border-t-amber-400 drop-shadow-[0_4px_15px_rgba(245,158,11,0.9)] animate-bounce" />

          {/* Wheel Graphic */}
          <div className="w-72 h-72 sm:w-80 sm:h-80 rounded-full border-4 border-amber-400 shadow-[0_0_40px_rgba(245,158,11,0.5)] relative overflow-hidden flex items-center justify-center">
            <motion.div
              className="w-full h-full rounded-full relative"
              animate={{ rotate: rotationDegree }}
              transition={{ duration: 4.5, ease: [0.15, 0.85, 0.35, 1] }}
              style={{
                background: `conic-gradient(
                  #2563eb 0deg 45deg,
                  #7c3aed 45deg 90deg,
                  #059669 90deg 135deg,
                  #d97706 135deg 180deg,
                  #1d4ed8 180deg 225deg,
                  #dc2626 225deg 270deg,
                  #0284c7 270deg 315deg,
                  #b45309 315deg 360deg
                )`,
              }}
            >
              {WHEEL_SLICES.map((slice, idx) => {
                const angle = idx * 45 + 22.5;
                return (
                  <div
                    key={slice.id}
                    className="absolute top-0 left-1/2 w-1.5 h-1/2 origin-bottom flex items-start justify-center pt-3"
                    style={{ transform: `translateX(-50%) rotate(${angle}deg)` }}
                  >
                    <span className="text-[10px] sm:text-xs font-black text-white text-center leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] max-w-[75px] font-mono">
                      {slice.label}
                    </span>
                  </div>
                );
              })}
            </motion.div>

            {/* Center Peg */}
            <div className="absolute w-16 h-16 rounded-full bg-slate-950 border-3 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.8)] flex items-center justify-center z-20">
              <Sparkles className="w-7 h-7 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
          </div>
        </div>

        {/* SPIN BUTTON OR ALREADY SPUN STATE */}
        <div className="mt-6 text-center space-y-3 relative z-10">
          {!hasSpunToday ? (
            <button
              onClick={handleSpin}
              disabled={isSpinning}
              className={`w-full py-4 sm:py-5 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-base sm:text-lg rounded-2xl shadow-[0_0_35px_rgba(245,158,11,0.6)] flex items-center justify-center gap-2.5 transition cursor-pointer transform hover:scale-[1.02] active:scale-95 ${
                isSpinning ? 'opacity-60 cursor-not-allowed animate-pulse' : ''
              }`}
            >
              <RotateCw className={`w-6 h-6 ${isSpinning ? 'animate-spin' : ''}`} />
              <span>{isSpinning ? 'ルーレット高速回転中...' : '🎯 今すぐ盛大にルーレットを回す！'}</span>
            </button>
          ) : (
            <div className="p-4 bg-slate-900/90 border border-emerald-500/40 rounded-2xl space-y-2.5 shadow-lg">
              <div className="flex items-center justify-center gap-2 text-emerald-400 font-black text-sm">
                <CheckCircle className="w-5 h-5" /> 本日の盛大ログインボーナス受取済み！
              </div>
              <p className="text-xs text-slate-300">明日日付が変わると、再び豪華なルーレットに挑戦できます。</p>
              
              <button
                onClick={handleSpin}
                disabled={isSpinning}
                className="text-xs text-amber-400 hover:text-amber-300 underline font-mono cursor-pointer pt-1"
              >
                （テスト確認用: もう一度回す）
              </button>
            </div>
          )}
        </div>

        {/* SPECTACULAR WON PRIZE ANNOUNCEMENT */}
        {wonPrize && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="mt-5 p-5 bg-gradient-to-r from-amber-950 via-purple-950 to-amber-950 border-2 border-amber-400 rounded-3xl text-center space-y-2 shadow-[0_0_50px_rgba(245,158,11,0.6)] relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-400/20 via-transparent to-transparent pointer-events-none" />
            
            <div className="inline-flex items-center gap-1.5 text-xs font-black px-4 py-1.5 bg-amber-400 text-slate-950 rounded-full font-mono uppercase shadow-md animate-pulse">
              <Trophy className="w-4 h-4" /> 盛大当選おめでとうございます！
            </div>
            
            <h4 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-400 tracking-tight">
              {wonPrize.label}
            </h4>
            
            <p className="text-xs sm:text-sm text-amber-300 font-mono font-bold">{wonPrize.subLabel}</p>
            
            <div className="text-xs sm:text-sm text-slate-100 bg-black/40 py-2 px-4 rounded-xl border border-white/10 inline-block">
              🎁 【10連ガチャチケット】 × <strong className="text-amber-400 text-lg">{wonPrize.tickets}</strong> 枚 獲得完了！
              {wonPrize.gems > 0 && <span className="text-purple-300 ml-2">+ {wonPrize.gems} Gems</span>}
            </div>
          </motion.div>
        )}

      </motion.div>
    </div>
  );
};
