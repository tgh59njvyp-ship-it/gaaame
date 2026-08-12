import React, { useState } from 'react';
import { CharacterState } from '../types';
import { Sparkles, Gift, Trophy, CheckCircle, RotateCw } from 'lucide-react';
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
    if (rand < 40) selectedSliceIndex = 0; // 10連
    else if (rand < 65) selectedSliceIndex = 1; // 10連 + 1000Gems
    else if (rand < 80) selectedSliceIndex = 4; // 10連
    else if (rand < 90) selectedSliceIndex = 2; // 15連分
    else if (rand < 96) selectedSliceIndex = 3; // 20連分
    else if (rand < 99) selectedSliceIndex = 5; // 30連分
    else selectedSliceIndex = 7; // 100連 Jackpot!

    const sliceAngle = 360 / WHEEL_SLICES.length;
    // Align target slice to the top pointer (index 0 is at 0 deg, so slice N is at N * 45 deg)
    const targetAngle = 360 - (selectedSliceIndex * sliceAngle + sliceAngle / 2);
    const extraRounds = 360 * 6; // 6 full rotations for excitement
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

      // Beginner quest check
      updatedChar = checkAndUpdateBeginnerQuests(updatedChar, 'roulette', 1);

      const logMsg = createLogEntry(
        'gacha',
        `ログボルーレット実行: 「${prize.label}」`,
        `デイリールーレットで 【${prize.label} (${prize.subLabel})】 を獲得！`,
        undefined,
        { gold: 0, exp: 0 }
      );
      updatedChar = appendLogToCharacter(updatedChar, logMsg);

      onUpdateCharacter(updatedChar);
      onShowMessage(`🎉 ログボルーレット当選: 「${prize.label}」を獲得しました！`);
    }, 4500);
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-backdropFadeIn">
      <div className="bg-[#0b0c10] border-2 border-amber-500/80 max-w-lg w-full rounded-3xl p-6 shadow-[0_0_50px_rgba(245,158,11,0.3)] text-white relative overflow-hidden animate-modalExpand">
        
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-white/10 relative z-10">
          <div>
            <div className="flex items-center gap-1.5 text-amber-400 text-xs font-mono font-bold tracking-widest uppercase">
              <Gift className="w-4 h-4" /> DAILY LOGIN ROULETTE
            </div>
            <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2 mt-0.5">
              <span>ログボガチャ券ルーレット</span>
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-white px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl cursor-pointer"
          >
            閉じる ✕
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed mb-4 text-center font-bold relative z-10">
          ✨ 毎日1回挑戦！<span className="text-amber-400 underline">最低でも「10連ガチャ券」が100%確定当選</span>！
        </p>

        {/* ROULETTE WHEEL CONTAINER */}
        <div className="relative my-6 flex flex-col items-center justify-center">
          {/* Wheel Pointer Arrow */}
          <div className="absolute -top-3 z-30 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-amber-400 drop-shadow-[0_4px_10px_rgba(245,158,11,0.8)]" />

          {/* Wheel Graphic */}
          <div className="w-64 h-64 md:w-72 md:h-72 rounded-full border-4 border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.4)] relative overflow-hidden flex items-center justify-center">
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
              {/* Slice Labels */}
              {WHEEL_SLICES.map((slice, idx) => {
                const angle = idx * 45 + 22.5;
                return (
                  <div
                    key={slice.id}
                    className="absolute top-0 left-1/2 w-1 h-1/2 origin-bottom flex items-start justify-center pt-2"
                    style={{ transform: `translateX(-50%) rotate(${angle}deg)` }}
                  >
                    <span className="text-[10px] font-black text-white text-center leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] max-w-[65px] font-mono">
                      {slice.label.split(' ')[0]}
                    </span>
                  </div>
                );
              })}
            </motion.div>

            {/* Wheel Center Peg */}
            <div className="absolute w-14 h-14 rounded-full bg-slate-950 border-2 border-amber-400 shadow-2xl flex items-center justify-center z-20">
              <Sparkles className="w-6 h-6 text-amber-400 animate-pulse" />
            </div>
          </div>
        </div>

        {/* SPIN BUTTON OR ALREADY SPUN STATE */}
        <div className="mt-6 text-center space-y-3 relative z-10">
          {!hasSpunToday ? (
            <button
              onClick={handleSpin}
              disabled={isSpinning}
              className={`w-full py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-base rounded-2xl shadow-[0_0_25px_rgba(245,158,11,0.5)] flex items-center justify-center gap-2 transition cursor-pointer transform hover:scale-[1.02] ${
                isSpinning ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <RotateCw className={`w-5 h-5 ${isSpinning ? 'animate-spin' : ''}`} />
              <span>{isSpinning ? 'ルーレット回転中...' : '🎯 ログボルーレットを回す！ (100% 10連券GET)'}</span>
            </button>
          ) : (
            <div className="p-4 bg-slate-900/80 border border-slate-700/80 rounded-2xl space-y-2">
              <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold text-sm">
                <CheckCircle className="w-4 h-4" /> 本日のログボルーレットは回し終えています！
              </div>
              <p className="text-xs text-slate-400">明日日付が変わると、再び10連ガチャ券以上が当たるルーレットに挑戦できます！</p>
              
              {/* Allow test spin button for player if they want */}
              <button
                onClick={handleSpin}
                disabled={isSpinning}
                className="mt-2 text-xs text-amber-400 hover:text-amber-300 underline font-mono cursor-pointer"
              >
                （開発検証用: もう一度回す）
              </button>
            </div>
          )}
        </div>

        {/* WON PRIZE MODAL ANNOUNCEMENT */}
        {wonPrize && (
          <div className="mt-4 p-4 bg-gradient-to-r from-amber-950/90 via-orange-950/90 to-amber-950/90 border-2 border-amber-400 rounded-2xl text-center space-y-2 animate-bounce">
            <div className="inline-flex items-center gap-1.5 text-xs font-black px-3 py-1 bg-amber-400 text-slate-950 rounded-full font-mono uppercase">
              <Trophy className="w-4 h-4" /> 当選おめでとうございます！
            </div>
            <h4 className="text-lg font-black text-amber-200">{wonPrize.label}</h4>
            <p className="text-xs text-amber-300 font-mono font-bold">{wonPrize.subLabel}</p>
            <div className="text-xs text-slate-200">
              【10連ガチャチケット】 × <strong className="text-amber-400 text-base">{wonPrize.tickets}</strong> 枚 追加完了！
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
