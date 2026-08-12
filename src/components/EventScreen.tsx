import React, { useEffect, useState } from 'react';
import { CharacterState } from '../types';
import { Sparkles, ArrowRight, Shield, Check } from 'lucide-react';

interface EventScreenProps {
  character: CharacterState;
  stageName: string;
  floorNumber: number;
  onFinishEvent: (updatedChar: CharacterState, resultMsg: string) => void;
}

export const EventScreen: React.FC<EventScreenProps> = ({
  character,
  stageName,
  floorNumber,
  onFinishEvent,
}) => {
  const [eventData, setEventData] = useState<{
    title: string;
    desc: string;
    choiceA: string;
    choiceB: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/ai-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        stageName,
        floorNumber,
        raceName: character.race.name,
        className: character.classInfo.name,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setEventData(data);
        setIsLoading(false);
      })
      .catch(() => {
        setEventData({
          title: '神秘のほこら',
          desc: 'ダンジョンの奥深くで静かに光るほこらを見つけた。微かな魔力があなたを癒やしている。',
          choiceA: '祈りを捧げる (HP/MP全快)',
          choiceB: '無視して先へ進む',
        });
        setIsLoading(false);
      });
  }, [stageName, floorNumber]);

  const handleChoice = (choiceType: 'A' | 'B') => {
    let updatedChar = { ...character };
    let msg = '';

    if (choiceType === 'A') {
      updatedChar.hp = updatedChar.maxHp;
      updatedChar.mp = updatedChar.maxMp;
      msg = 'ほこらに祈りを捧げ、HPとMPが完全に回復した！';
    } else {
      updatedChar.gold += 50;
      msg = 'ほこらの周りから落ちていた金貨 50G を拾った！';
    }

    setResultMessage(msg);
    setTimeout(() => {
      onFinishEvent(updatedChar, msg);
    }, 1800);
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center text-slate-300">
        <Sparkles className="w-10 h-10 animate-spin mx-auto mb-4 text-purple-400" />
        <p>神秘のイベントを生成中...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6 text-slate-100">
      <div className="bg-slate-900/90 backdrop-blur border border-purple-500/40 rounded-2xl p-6 shadow-2xl relative">
        <div className="flex items-center gap-2 text-purple-400 mb-2">
          <Sparkles className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">神秘のイベント</span>
        </div>
        <h2 className="text-2xl font-extrabold text-white mb-3">{eventData?.title}</h2>
        <p className="text-slate-300 text-sm leading-relaxed mb-6 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
          {eventData?.desc}
        </p>

        {resultMessage ? (
          <div className="bg-emerald-950/80 border border-emerald-500/60 p-4 rounded-xl text-center text-emerald-300 font-bold animate-fadeIn">
            {resultMessage}
          </div>
        ) : (
          <div className="space-y-3">
            <button
              onClick={() => handleChoice('A')}
              className="w-full p-4 bg-purple-950/60 hover:bg-purple-900/80 border border-purple-500/50 rounded-xl text-left font-semibold text-white flex justify-between items-center transition cursor-pointer"
            >
              <span>{eventData?.choiceA}</span>
              <ArrowRight className="w-4 h-4 text-purple-400" />
            </button>
            <button
              onClick={() => handleChoice('B')}
              className="w-full p-4 bg-slate-950/60 hover:bg-slate-900/80 border border-slate-800 rounded-xl text-left font-semibold text-white flex justify-between items-center transition cursor-pointer"
            >
              <span>{eventData?.choiceB}</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
