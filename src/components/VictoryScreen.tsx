import React from 'react';
import { CharacterState } from '../types';
import { Trophy, RotateCcw, Skull, Award } from 'lucide-react';

interface VictoryScreenProps {
  character: CharacterState;
  isVictory: boolean;
  onRestart: () => void;
}

export const VictoryScreen: React.FC<VictoryScreenProps> = ({ character, isVictory, onRestart }) => {
  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 text-slate-100 text-center">
      <div className={`bg-slate-900/90 backdrop-blur border ${isVictory ? 'border-amber-500/60 shadow-amber-950/50' : 'border-red-500/60 shadow-red-950/50'} rounded-2xl p-8 shadow-2xl relative overflow-hidden animate-fadeIn`}>
        <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4 bg-slate-950 border border-slate-800">
          {isVictory ? <Trophy className="w-8 h-8 text-amber-400" /> : <Skull className="w-8 h-8 text-red-400" />}
        </div>

        <h1 className={`text-3xl md:text-4xl font-black mb-2 ${isVictory ? 'text-amber-400' : 'text-red-400'}`}>
          {isVictory ? 'QUEST CLEARED!' : 'GAME OVER'}
        </h1>
        <p className="text-slate-300 text-sm mb-6">
          {isVictory
            ? 'おめでとうございます！あなたは魔王を打ち倒し、世界に平和をもたらした伝説の冒険者となりました！'
            : '激しい戦いの末、力尽きてしまいました……。あなたの冒険はここで幕を閉じます。'}
        </p>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8 text-left">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 block">到達レベル</span>
            <strong className="text-white text-lg">Lv.{character.level}</strong>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 block">討伐勝利数</span>
            <strong className="text-emerald-400 text-lg">{character.stats.battlesWon} 回</strong>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 block">総与ダメージ</span>
            <strong className="text-indigo-400 text-lg">{character.stats.damageDealt}</strong>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 block">所持金</span>
            <strong className="text-amber-400 text-lg">G {character.gold}</strong>
          </div>
        </div>

        <button
          onClick={onRestart}
          className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 mx-auto transition transform hover:scale-105 cursor-pointer"
        >
          <RotateCcw className="w-5 h-5" />
          タイトルに戻る（再挑戦）
        </button>
      </div>
    </div>
  );
};
