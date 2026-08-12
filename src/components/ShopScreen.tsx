import React from 'react';
import { CharacterState, Item } from '../types';
import { ITEMS } from '../data/gameData';
import { ShoppingBag, ArrowRight, Shield, Sword, FlaskConical, Check } from 'lucide-react';

interface ShopScreenProps {
  character: CharacterState;
  onBuyItem: (updatedChar: CharacterState) => void;
  onLeaveShop: () => void;
}

export const ShopScreen: React.FC<ShopScreenProps> = ({ character, onBuyItem, onLeaveShop }) => {
  const shopItems = ITEMS;

  const handleBuy = (item: Item) => {
    if (character.gold < item.price) {
      alert('ゴールドが足りません！');
      return;
    }

    const newGold = character.gold - item.price;
    let newInventory = [...character.inventory];
    let newEquipment = { ...character.equipment };

    if (item.type === 'weapon' || item.type === 'armor' || item.type === 'accessory') {
      if (item.type === 'weapon') newEquipment.weapon = item;
      if (item.type === 'armor') newEquipment.armor = item;
      if (item.type === 'accessory') newEquipment.accessory = item;
    } else {
      newInventory.push(item);
    }

    const updated: CharacterState = {
      ...character,
      gold: newGold,
      inventory: newInventory,
      equipment: newEquipment,
    };

    onBuyItem(updated);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 text-slate-100">
      <div className="bg-slate-900/90 backdrop-blur border border-slate-700/80 rounded-2xl p-6 mb-6 shadow-2xl flex justify-between items-center">
        <div>
          <span className="inline-block px-3 py-1 bg-emerald-950 text-emerald-300 text-xs font-bold rounded-full mb-1 border border-emerald-800">
            商人の店
          </span>
          <h1 className="text-2xl font-bold text-white">旅の道具屋＆武器屋</h1>
          <p className="text-xs text-slate-400 mt-0.5">冒険に役立つ武具やポーションを購入しよう。</p>
        </div>
        <div className="bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 text-right">
          <span className="text-xs text-slate-400 block">所持ゴールド</span>
          <span className="text-amber-400 font-extrabold text-lg">G {character.gold}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {shopItems.map((item) => {
          const canAfford = character.gold >= item.price;
          return (
            <div key={item.id} className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 flex justify-between items-center shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-amber-400">
                  {item.type === 'weapon' ? <Sword className="w-6 h-6 text-red-400" /> :
                   item.type === 'armor' ? <Shield className="w-6 h-6 text-blue-400" /> :
                   <FlaskConical className="w-6 h-6 text-emerald-400" />}
                </div>
                <div>
                  <h3 className="font-bold text-white">{item.name}</h3>
                  <p className="text-xs text-slate-400 mb-1">{item.desc}</p>
                  <span className="text-xs font-bold text-amber-400">G {item.price}</span>
                </div>
              </div>

              <button
                disabled={!canAfford}
                onClick={() => handleBuy(item)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                  canAfford
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md cursor-pointer'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                }`}
              >
                購入する
              </button>
            </div>
          );
        })}
      </div>

      <div className="text-center">
        <button
          onClick={onLeaveShop}
          className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl border border-slate-700 shadow-lg transition cursor-pointer"
        >
          買い物を終えてダンジョンに戻る
        </button>
      </div>
    </div>
  );
};
