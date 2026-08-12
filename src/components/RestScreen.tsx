import React, { useState } from 'react';
import { CharacterState } from '../types';
import { Shield, Heart, Sparkles, Check } from 'lucide-react';
import { getSkillStatsBonus } from '../utils/skillUtils';
import { getTitleBonuses } from '../utils/titleUtils';

interface RestScreenProps {
  character: CharacterState;
  onFinishRest: (updatedChar: CharacterState, msg: string) => void;
}

export const RestScreen: React.FC<RestScreenProps> = ({ character, onFinishRest }) => {
  const [rested, setRested] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleRest = (type: 'heal' | 'train') => {
    let updated = { ...character };
    let msg = '';

    if (type === 'heal') {
      const titleBonus = getTitleBonuses(character.title);
      const skillBonus = getSkillStatsBonus(character);
      const totalMaxHp = updated.maxHp + titleBonus.hp + skillBonus.hp;
      const totalMaxMp = updated.maxMp + titleBonus.mp + skillBonus.mp;

      const healHp = Math.floor(totalMaxHp * 0.6);
      const healMp = Math.floor(totalMaxMp * 0.6);
      updated.hp = Math.min(totalMaxHp, updated.hp + healHp);
      updated.mp = Math.min(totalMaxMp, updated.mp + healMp);
      msg = `キャンプで十分に休息を取り、HPが ${healHp}、MPが ${healMp} 回復した！`;
    } else {
      updated.atk += 3;
      updated.def += 2;
      msg = '焚き火の前で基礎鍛錬を行い、攻撃力+3、防御力+2 が向上した！';
    }

    setMessage(msg);
    setRested(true);
    setTimeout(() => {
      onFinishRest(updated, msg);
    }, 1800);
  };

  return (
    <div className="max-w-xl mx-auto p-4 md:p-6 text-slate-100">
      <div className="bg-slate-900/90 backdrop-blur border border-blue-500/40 rounded-2xl p-6 shadow-2xl text-center">
        <div className="w-14 h-14 bg-blue-950 border border-blue-500/50 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-400">
          <Shield className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">キャンプ（休憩所）</h2>
        <p className="text-slate-300 text-sm mb-6">
          安全な場所で焚き火を囲み、英気を養うことができる。行動を選択しよう。
        </p>

        {rested && message ? (
          <div className="bg-emerald-950/80 border border-emerald-500/60 p-4 rounded-xl text-emerald-300 font-bold animate-fadeIn">
            {message}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => handleRest('heal')}
              className="p-4 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-blue-500 rounded-xl text-left transition cursor-pointer"
            >
              <h3 className="font-bold text-white text-base mb-1 flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-400" />
                休息して回復
              </h3>
              <p className="text-xs text-slate-400">HPとMPを60%回復する。</p>
            </button>

            <button
              onClick={() => handleRest('train')}
              className="p-4 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-amber-500 rounded-xl text-left transition cursor-pointer"
            >
              <h3 className="font-bold text-white text-base mb-1 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                基礎鍛錬
              </h3>
              <p className="text-xs text-slate-400">攻撃力と防御力を少し向上させる。</p>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
