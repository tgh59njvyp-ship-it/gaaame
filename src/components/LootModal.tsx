import React from 'react';
import { Item, CharacterState } from '../types';
import { Gift, Sword, Shield, Sparkles, FlaskConical, Check } from 'lucide-react';

interface LootModalProps {
  item: Item;
  character: CharacterState;
  onClaim: (updatedChar: CharacterState, equipped: boolean) => void;
}

export const LootModal: React.FC<LootModalProps> = ({ item, character, onClaim }) => {
  const getRarityColor = (rarity: Item['rarity']) => {
    switch (rarity) {
      case 'legendary': return 'text-amber-400 border-amber-500/80 bg-amber-950/40 shadow-amber-950';
      case 'epic': return 'text-purple-400 border-purple-500/80 bg-purple-950/40 shadow-purple-950';
      case 'rare': return 'text-blue-400 border-blue-500/80 bg-blue-950/40 shadow-blue-950';
      default: return 'text-slate-200 border-slate-700 bg-slate-900';
    }
  };

  const handleClaimInventory = () => {
    const updated = {
      ...character,
      inventory: [...character.inventory, item],
    };
    onClaim(updated, false);
  };

  const handleClaimEquip = () => {
    let newEquipment = { ...character.equipment };
    let newInventory = [...character.inventory];

    if (item.type === 'weapon') {
      if (newEquipment.weapon) newInventory.push(newEquipment.weapon);
      newEquipment.weapon = item;
    } else if (item.type === 'armor') {
      if (newEquipment.armor) newInventory.push(newEquipment.armor);
      newEquipment.armor = item;
    } else if (item.type === 'accessory') {
      if (newEquipment.accessory) newInventory.push(newEquipment.accessory);
      newEquipment.accessory = item;
    } else {
      newInventory.push(item);
    }

    const updated = {
      ...character,
      equipment: newEquipment,
      inventory: newInventory,
    };
    onClaim(updated, true);
  };

  const isEquippable = item.type === 'weapon' || item.type === 'armor' || item.type === 'accessory';

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-backdropFadeIn">
      <div className={`w-full max-w-md rounded-2xl p-6 border shadow-2xl text-center relative animate-modalExpand ${getRarityColor(item.rarity)}`}>
        <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4 bg-slate-950 border border-slate-800 shadow-lg">
          {item.type === 'weapon' ? <Sword className="w-8 h-8 text-red-400" /> :
           item.type === 'armor' ? <Shield className="w-8 h-8 text-blue-400" /> :
           item.type === 'accessory' ? <Sparkles className="w-8 h-8 text-purple-400" /> :
           <FlaskConical className="w-8 h-8 text-emerald-400" />}
        </div>

        <span className="inline-block px-3 py-1 bg-black/40 text-xs font-bold uppercase tracking-wider rounded-full mb-2 border border-white/10">
          🎁 戦利品を獲得！ [{item.rarity.toUpperCase()}]
        </span>

        <h2 className="text-2xl font-black text-white mb-2">{item.name}</h2>
        <p className="text-sm text-slate-300 mb-6 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
          {item.desc}
        </p>

        <div className="space-y-3">
          {isEquippable && (
            <button
              onClick={handleClaimEquip}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg transition cursor-pointer"
            >
              今すぐ装備する
            </button>
          )}
          <button
            onClick={handleClaimInventory}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl border border-slate-700 transition cursor-pointer"
          >
            インベントリに入れる
          </button>
        </div>
      </div>
    </div>
  );
};
