import React, { useState, useEffect } from 'react';
import { CharacterState, FloorNode, GamePhase, Enemy, Item, HubTab } from './types';
import { generateStageFloors, STAGES } from './data/gameData';
import { generateRandomLoot } from './utils/lootGenerator';
import { CharacterCreation } from './components/CharacterCreation';
import { StageMap } from './components/StageMap';
import { BattleScreen } from './components/BattleScreen';
import { ShopScreen } from './components/ShopScreen';
import { EventScreen } from './components/EventScreen';
import { RestScreen } from './components/RestScreen';
import { InventoryModal } from './components/InventoryModal';
import { VictoryScreen } from './components/VictoryScreen';
import { LootModal } from './components/LootModal';
import { GuildScreen } from './components/GuildScreen';
import { GachaScreen } from './components/GachaScreen';
import { AdventureLog } from './components/AdventureLog';
import { HubTabs } from './components/HubTabs';
import { RouletteModal } from './components/RouletteModal';
import { AiMonthlyEventModal } from './components/AiMonthlyEventModal';
import { BeginnerQuestsModal } from './components/BeginnerQuestsModal';
import { getInitialBeginnerQuests } from './utils/beginnerQuests';
import { createLogEntry, appendLogToCharacter } from './utils/logHelper';
import { evaluateTitles, getTitleBonuses } from './utils/titleUtils';
import { getSkillStatsBonus } from './utils/skillUtils';
import { Backpack, MapPin, ShieldAlert, Sparkles, User, Award, RotateCcw, Trash2, AlertTriangle } from 'lucide-react';

export default function App() {
  const [phase, setPhase] = useState<GamePhase>('creation');
  const [hubTab, setHubTab] = useState<HubTab>('dungeon');
  const [character, setCharacter] = useState<CharacterState | null>(null);
  const [currentStage, setCurrentStage] = useState<number>(1);
  const [floors, setFloors] = useState<FloorNode[]>([]);
  const [currentEnemy, setCurrentEnemy] = useState<Enemy | null>(null);
  const [activeFloor, setActiveFloor] = useState<FloorNode | null>(null);
  const [showInventory, setShowInventory] = useState<boolean>(false);
  const [showRouletteModal, setShowRouletteModal] = useState<boolean>(false);
  const [showAiEventModal, setShowAiEventModal] = useState<boolean>(false);
  const [showBeginnerQuestsModal, setShowBeginnerQuestsModal] = useState<boolean>(false);
  const [pendingLoot, setPendingLoot] = useState<Item | null>(null);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);
  const [hasSaveData, setHasSaveData] = useState<boolean>(false);
  const [showResetModal, setShowResetModal] = useState<boolean>(false);
  const [reincarnationMeta, setReincarnationMeta] = useState<{
    count: number;
    buffs?: {
      hpBonusPct: number;
      mpBonusPct: number;
      atkBonusPct: number;
      defBonusPct: number;
      expGoldBonusPct: number;
    };
  }>({ count: 0 });

  useEffect(() => {
    try {
      const saved = localStorage.getItem('astral_rogue_save_v1');
      if (saved) {
        setHasSaveData(true);
        const parsed = JSON.parse(saved);
        const loadedChar = parsed.character;
        if (loadedChar) {
          if (loadedChar.sp === undefined) loadedChar.sp = 0;
          if (loadedChar.gems === undefined) loadedChar.gems = 3000;
          if (loadedChar.gacha10Tickets === undefined) loadedChar.gacha10Tickets = 0;
          if (loadedChar.eventTokens === undefined) loadedChar.eventTokens = 0;
          if (!loadedChar.beginnerQuests) loadedChar.beginnerQuests = getInitialBeginnerQuests();
          if (!loadedChar.unlockedSkills) loadedChar.unlockedSkills = [];
          if (loadedChar.gameMonth === undefined) loadedChar.gameMonth = 1;
          setCharacter(loadedChar);
          setCurrentStage(parsed.currentStage || 1);
          setFloors(parsed.floors || []);
          setPhase(parsed.phase || 'hub');
          setHubTab('dungeon');
          
          if (loadedChar.reincarnationCount) {
            setReincarnationMeta({
              count: loadedChar.reincarnationCount,
              buffs: loadedChar.reincarnationBuffs,
            });
          }
        }
      }
      const reincSaved = localStorage.getItem('astral_rogue_reinc_v1');
      if (reincSaved) {
        const parsedReinc = JSON.parse(reincSaved);
        setReincarnationMeta((prev) => ({
          count: Math.max(prev.count, parsedReinc.count || 0),
          buffs: parsedReinc.buffs || prev.buffs,
        }));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    if (phase === 'hub' && character) {
      const todayStr = new Date().toISOString().split('T')[0];
      if (character.lastRouletteDate !== todayStr) {
        const timer = setTimeout(() => {
          setShowRouletteModal(true);
        }, 400);
        return () => clearTimeout(timer);
      }
    }
  }, [phase, character?.name]);

  const handleReincarnate = () => {
    const currentCount = character?.reincarnationCount || reincarnationMeta.count || 0;
    const nextCount = currentCount + 1;

    const currentBuffs = character?.reincarnationBuffs || reincarnationMeta.buffs || {
      hpBonusPct: 0,
      mpBonusPct: 0,
      atkBonusPct: 0,
      defBonusPct: 0,
      expGoldBonusPct: 0,
    };

    const newBuffs = {
      hpBonusPct: currentBuffs.hpBonusPct + 25,
      mpBonusPct: currentBuffs.mpBonusPct + 25,
      atkBonusPct: currentBuffs.atkBonusPct + 15,
      defBonusPct: currentBuffs.defBonusPct + 15,
      expGoldBonusPct: currentBuffs.expGoldBonusPct + 20,
    };

    const updatedMeta = { count: nextCount, buffs: newBuffs };
    setReincarnationMeta(updatedMeta);

    try {
      localStorage.setItem('astral_rogue_reinc_v1', JSON.stringify(updatedMeta));
    } catch (e) {
      console.error(e);
    }

    clearSaveData();
    setCharacter(null);
    setShowInventory(false);
    setPhase('creation');
    showNotification(`【昇華成就】第 ${nextCount} 世代の英雄として転生！ 8種の伝説種族と7種の秘奥義魔法系統が開放されました！`);
  };

  const saveGameToStorage = (char: CharacterState, stage: number, flrs: FloorNode[], phs: GamePhase) => {
    try {
      const data = { character: char, currentStage: stage, floors: flrs, phase: phs };
      localStorage.setItem('astral_rogue_save_v1', JSON.stringify(data));
      setHasSaveData(true);
    } catch (e) {
      console.error(e);
    }
  };

  const handleContinueAdventure = () => {
    try {
      const saved = localStorage.getItem('astral_rogue_save_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        const loadedChar = parsed.character;
        if (loadedChar) {
          if (loadedChar.sp === undefined) loadedChar.sp = 0;
          if (!loadedChar.unlockedSkills) loadedChar.unlockedSkills = [];
        }
        setCharacter(loadedChar);
        setCurrentStage(parsed.currentStage);
        setFloors(parsed.floors);
        setPhase(parsed.phase || 'hub');
        setHubTab('dungeon');
        showNotification('冒険のセーブデータをロードしました！');
      }
    } catch (e) {
      console.error(e);
      showNotification('セーブデータの読み込みに失敗しました。');
    }
  };

  const clearSaveData = () => {
    try {
      localStorage.removeItem('astral_rogue_save_v1');
      setHasSaveData(false);
    } catch (e) {
      console.error(e);
    }
  };

  const showNotification = (msg: string) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(null), 3500);
  };

  const updateQuestProgress = (char: CharacterState, type: 'defeat' | 'floor' | 'elite') => {
    if (!char.quests) return char;
    const updatedQuests = char.quests.map((q) => {
      if (q.isClaimed || q.isCompleted) return q;
      let newProg = q.currentProgress;
      if (q.id === 'q1' && type === 'defeat') newProg += 1;
      if (q.id === 'q2' && type === 'floor') newProg += 1;
      if (q.id === 'q3' && type === 'elite') newProg += 1;
      const isCompleted = newProg >= q.targetCount;
      if (isCompleted && q.currentProgress < q.targetCount) {
        showNotification(`【クエスト達成！】「${q.title}」が達成可能です！ ギルドで報酬を受け取ろう。`);
      }
      return { ...q, currentProgress: Math.min(q.targetCount, newProg), isCompleted };
    });
    return { ...char, quests: updatedQuests };
  };

  const updateCharacterWithTitleCheck = (char: CharacterState, actionType?: string) => {
    const { updatedChar, unlockedNow } = evaluateTitles(char, currentStage, actionType);
    if (unlockedNow.length > 0) {
      unlockedNow.forEach((titleName) => {
        showNotification(`🎖️ 【称号解放】新たな称号「${titleName}」を獲得しました！`);
        const titleLog = createLogEntry(
          'system',
          `🎖️ 称号獲得: ${titleName}`,
          `条件を達成し、栄誉ある称号「${titleName}」が解放されました。ステータス画面で装備可能です。`,
          currentStage
        );
        updatedChar.logs = [titleLog, ...updatedChar.logs];
      });
    }
    setCharacter(updatedChar);
    return updatedChar;
  };

  const handleStartAdventure = (newChar: CharacterState) => {
    const charWithTitles: CharacterState = {
      ...newChar,
      gameMonth: 1,
      title: 'developer_mode',
      titlesUnlocked: ['developer_mode']
    };
    setCharacter(charWithTitles);
    setCurrentStage(1);
    const initFloors = generateStageFloors(1);
    setFloors(initFloors);
    setPhase('hub');
    setHubTab('dungeon');
    setShowRouletteModal(true);
    saveGameToStorage(charWithTitles, 1, initFloors, 'hub');
  };

  const handleSelectFloor = (floor: FloorNode) => {
    setActiveFloor(floor);

    if (character) {
      const typeLabel = floor.type === 'battle' ? '戦闘' : floor.type === 'elite' ? '強敵' : floor.type === 'boss' ? 'ボス' : floor.type === 'shop' ? '商人' : floor.type === 'event' ? 'イベント' : floor.type === 'rest' ? '休息地' : '宝箱';
      const floorLog = createLogEntry(
        'floor',
        `階層移動: フロア ${floor.floorNumber}`,
        `第 ${currentStage} ステージ フロア ${floor.floorNumber}（${typeLabel}）へ進撃しました。`,
        currentStage
      );
      updateCharacterWithTitleCheck(appendLogToCharacter(character, floorLog));
    }

    if (floor.type === 'battle' || floor.type === 'elite' || floor.type === 'boss') {
      if (floor.enemy) {
        setCurrentEnemy(floor.enemy);
        setPhase('battle');
      }
    } else if (floor.type === 'shop') {
      setPhase('shop');
    } else if (floor.type === 'event') {
      setPhase('event');
    } else if (floor.type === 'rest') {
      setPhase('rest');
    } else if (floor.type === 'treasure') {
      if (character) {
        const goldFound = 60 + currentStage * 25;
        const loot = generateRandomLoot(character.level, currentStage, true);
        let updated = { ...character, gold: character.gold + goldFound };
        updated = updateQuestProgress(updated, 'floor');

        const treasureLog = createLogEntry(
          'loot',
          `宝箱発見: 「${loot.name}」`,
          `宝箱を開け、金貨 ${goldFound}G と戦利品 [${loot.rarity.toUpperCase()}] ${loot.name} を発見！`,
          currentStage,
          { rarity: loot.rarity, gold: goldFound }
        );
        updated = appendLogToCharacter(updated, treasureLog);

        const finalChar = updateCharacterWithTitleCheck(updated);
        setPendingLoot(loot);
        showNotification(`宝箱を開けた！ 金貨 ${goldFound}G と貴重な戦利品を発見！`);
        saveGameToStorage(finalChar, currentStage, floors, 'hub');
      }
    }
  };

  const handleUpdateCharacter = (updated: CharacterState) => {
    const finalChar = updateCharacterWithTitleCheck(updated);
    saveGameToStorage(finalChar, currentStage, floors, phase);
  };

  const markFloorCompleted = (floor: FloorNode) => {
    const updatedFloors = floors.map((f) =>
      f.floorNumber === floor.floorNumber ? { ...f, completed: true } : f
    );
    setFloors(updatedFloors);

    let updatedChar = character;
    if (updatedChar) {
      updatedChar = updateQuestProgress(updatedChar, 'floor');
    }

    let nextStage = currentStage;
    if (floor.type === 'boss') {
      if (currentStage >= 5) {
        setPhase('victory');
        clearSaveData();
        return;
      } else {
        nextStage = currentStage + 1;
        setCurrentStage(nextStage);
        const newStageFloors = generateStageFloors(nextStage);
        setFloors(newStageFloors);

        if (updatedChar) {
          const stageClearLog = createLogEntry(
            'floor',
            `【ステージクリア】 第 ${currentStage} ステージ制覇！`,
            `第 ${currentStage} ステージのボスを討伐し、ダンジョン深部へと進軍！`,
            currentStage
          );
          updatedChar = appendLogToCharacter(updatedChar, stageClearLog);
          const finalChar = updateCharacterWithTitleCheck(updatedChar);
          showNotification(`【ステージクリア！】 第 ${currentStage} ステージ制覇！ 次のステージへ進みます。`);
          setPhase('hub');
          setHubTab('dungeon');
          saveGameToStorage(finalChar, nextStage, newStageFloors, 'hub');
        }
        return;
      }
    } else {
      setPhase('hub');
    }

    if (updatedChar) {
      const finalChar = updateCharacterWithTitleCheck(updatedChar);
      saveGameToStorage(finalChar, nextStage, updatedFloors, 'hub');
    }
  };

  const handleBattleVictory = (updatedChar: CharacterState, gold: number, exp: number, isPhoenix: boolean) => {
    let charWithQuests = updateQuestProgress(updatedChar, 'defeat');
    if (activeFloor?.type === 'elite' || activeFloor?.type === 'boss') {
      charWithQuests = updateQuestProgress(charWithQuests, 'elite');
    }

    const enemyName = currentEnemy?.name || '強敵';
    const victoryLog = createLogEntry(
      'battle',
      `戦闘勝利: ${enemyName}`,
      `${enemyName} を撃破！ 戦果として金貨 ${gold}G と EXP ${exp} を獲得。`,
      currentStage,
      { gold, exp }
    );
    charWithQuests = appendLogToCharacter(charWithQuests, victoryLog);

    // Run Title Check (checks phoenix state, highest damage, etc)
    const finalChar = updateCharacterWithTitleCheck(charWithQuests, isPhoenix ? 'phoenix_victory' : undefined);

    const isEliteOrBoss = activeFloor?.type === 'elite' || activeFloor?.type === 'boss';
    const dropChance = isEliteOrBoss ? 1.0 : 0.55;

    if (Math.random() < dropChance && character) {
      const loot = generateRandomLoot(finalChar.level, currentStage, isEliteOrBoss);
      setPendingLoot(loot);
    } else {
      if (activeFloor) {
        markFloorCompleted(activeFloor);
      } else {
        setPhase('hub');
        saveGameToStorage(finalChar, currentStage, floors, 'hub');
      }
    }
  };

  const handleClaimLoot = (updatedChar: CharacterState, equipped: boolean) => {
    let charWithLog = updatedChar;
    if (pendingLoot) {
      const lootLog = createLogEntry(
        'loot',
        `戦利品獲得: ${pendingLoot.name}`,
        `戦利品 [${pendingLoot.rarity.toUpperCase()}] ${pendingLoot.name} を${equipped ? '装備し' : '所持品に収納し'}ました。`,
        currentStage,
        { rarity: pendingLoot.rarity }
      );
      charWithLog = appendLogToCharacter(updatedChar, lootLog);
    }

    setCharacter(charWithLog);
    setPendingLoot(null);
    if (activeFloor) {
      markFloorCompleted(activeFloor);
    } else {
      setPhase('hub');
      saveGameToStorage(charWithLog, currentStage, floors, 'hub');
    }
  };

  const handleBattleDefeat = () => {
    setPhase('gameover');
    clearSaveData();
  };

  const handleShopFinish = (updatedChar: CharacterState) => {
    setCharacter(updatedChar);
    if (activeFloor) markFloorCompleted(activeFloor);
  };

  const handleEventFinish = (updatedChar: CharacterState, msg: string) => {
    const eventLog = createLogEntry('event', '遭遇イベント完了', msg, currentStage);
    const updatedWithLog = appendLogToCharacter(updatedChar, eventLog);
    setCharacter(updatedWithLog);
    showNotification(msg);
    if (activeFloor) markFloorCompleted(activeFloor);
  };

  const handleRestFinish = (updatedChar: CharacterState, msg: string) => {
    const restLog = createLogEntry('event', '休息地で回復', msg, currentStage);
    const updatedWithLog = appendLogToCharacter(updatedChar, restLog);
    setCharacter(updatedWithLog);
    showNotification(msg);
    if (activeFloor) markFloorCompleted(activeFloor);
  };

  return (
    <div className="min-h-screen bg-[#07070a] text-[#e2e2e2] flex flex-col justify-between font-sans selection:bg-[#c4a661] selection:text-[#0a0a0c] pb-28 md:pb-32 relative overflow-x-hidden">
      
      {/* Premium Cinematic Hologram Ambient Background Grid */}
      <div className="fixed inset-0 bg-[#07070a] pointer-events-none z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(196,166,97,0.06)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(99,102,241,0.04)_0%,transparent_60%)]" />
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:32px_32px]" />
        
        {/* Ambient lighting spheres */}
        <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] rounded-full bg-gradient-to-tr from-amber-500/5 to-transparent blur-[120px]" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[50%] h-[50%] rounded-full bg-gradient-to-tr from-[#6366f1]/4 to-transparent blur-[140px]" />
      </div>

      {/* Floating Notification */}
      {notificationMsg && (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50 bg-[#151518]/90 border border-[#c4a661] text-[#c4a661] px-6 py-3 rounded-xl shadow-[0_10px_35px_rgba(196,166,97,0.25)] backdrop-blur-md text-xs font-bold tracking-wider animate-bounce">
          {notificationMsg}
        </div>
      )}

      {/* App Header */}
      <header className="h-16 border-b border-[#2d2d30]/70 flex items-center justify-between px-6 bg-[#0c0d11]/90 sticky top-0 z-40 backdrop-blur-md relative">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setPhase('creation')}>
          <div className="w-8 h-8 border border-[#c4a661] flex items-center justify-center rotate-45 bg-[#151518]">
            <div className="w-3 h-3 bg-[#c4a661]"></div>
          </div>
          <span className="tracking-[0.2em] text-[#c4a661] text-sm md:text-base font-bold">
            AETHER DRIFT: ROGUE
          </span>
        </div>
        <div className="flex items-center gap-3">
          {character && phase !== 'creation' && phase !== 'victory' && phase !== 'gameover' && (() => {
            const titleBonus = getTitleBonuses(character.title);
            const skillBonus = getSkillStatsBonus(character);
            const totalMaxHp = character.maxHp + titleBonus.hp + skillBonus.hp;
            return (
              <>
                <div className="hidden sm:flex items-center gap-4 text-xs font-mono text-[#888] tracking-widest">
                  <span>STAGE: 0{currentStage}-0X</span>
                  <span className="text-[#c4a661]">HP: {character.hp}/{totalMaxHp}</span>
                </div>
                <button
                  onClick={() => setShowInventory(true)}
                  className="min-h-[36px] px-3 bg-[#1a1a1e] hover:bg-[#222228] border border-[#c4a661]/60 text-[#c4a661] text-xs font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Backpack className="w-4 h-4" />
                  <span>ステータス / バッグ</span>
                </button>
                <button
                  onClick={() => setShowAiEventModal(true)}
                  className="min-h-[36px] px-3 bg-gradient-to-r from-purple-950 to-indigo-950 hover:from-purple-900 hover:to-indigo-900 border border-purple-500/80 text-purple-200 text-xs font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-md animate-pulse"
                >
                  <span>🤖 AI月次イベント (第{character.gameMonth || 1}月)</span>
                </button>
              </>
            );
          })()}
          <button
            onClick={() => setShowResetModal(true)}
            className="min-h-[36px] px-3 bg-[#181010] hover:bg-[#281414] border border-[#522222] hover:border-red-500 text-[#e57373] text-xs font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-sm shrink-0"
            title="セーブデータを完全削除して初期化"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">データ初期化</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow py-6 px-4 md:px-8 max-w-6xl mx-auto w-full relative z-10">
        {phase === 'creation' && (
          <CharacterCreation
            onStartAdventure={handleStartAdventure}
            onContinueAdventure={handleContinueAdventure}
            hasSavedGame={hasSaveData}
            reincarnationCount={reincarnationMeta.count}
            reincarnationBuffs={reincarnationMeta.buffs}
          />
        )}
        {phase === 'hub' && character && (
          <div>
            <HubTabs activeTab={hubTab} onChangeTab={(tab) => {
              if (tab === 'status') {
                setShowInventory(true);
              } else {
                setHubTab(tab);
              }
            }} />

            {hubTab === 'dungeon' && (
              <StageMap
                character={character}
                currentStage={currentStage}
                floors={floors}
                onSelectFloor={handleSelectFloor}
                onOpenInventory={() => setShowInventory(true)}
                onUpdateCharacter={handleUpdateCharacter}
                onShowMessage={showNotification}
                onOpenRoulette={() => setShowRouletteModal(true)}
                onOpenBeginnerQuests={() => setShowBeginnerQuestsModal(true)}
                onSelectSpecialBattle={(enemy) => {
                  setCurrentEnemy(enemy);
                  setPhase('battle');
                }}
                onLoadSpecialFloors={(specialFloors, stageName) => {
                  setFloors(specialFloors);
                  showNotification(`「${stageName}」のマップを読み込みました！`);
                }}
              />
            )}

            {hubTab === 'guild' && (
              <GuildScreen
                character={character}
                onUpdateCharacter={handleUpdateCharacter}
                onShowMessage={showNotification}
              />
            )}

            {hubTab === 'gacha' && (
              <GachaScreen
                character={character}
                onUpdateCharacter={handleUpdateCharacter}
                onShowMessage={showNotification}
              />
            )}

            {hubTab === 'log' && (
              <AdventureLog
                character={character}
                currentStage={currentStage}
              />
            )}
          </div>
        )}
        {phase === 'battle' && character && currentEnemy && (
          <BattleScreen
            character={character}
            enemy={currentEnemy}
            onVictory={handleBattleVictory}
            onDefeat={handleBattleDefeat}
            onOpenInventory={() => setShowInventory(true)}
          />
        )}
        {phase === 'shop' && character && (
          <ShopScreen
            character={character}
            onBuyItem={handleShopFinish}
            onLeaveShop={() => {
              if (activeFloor) markFloorCompleted(activeFloor);
            }}
          />
        )}
        {phase === 'event' && character && (
          <EventScreen
            character={character}
            stageName={STAGES[currentStage - 1].name}
            floorNumber={activeFloor?.floorNumber || 1}
            onFinishEvent={handleEventFinish}
          />
        )}
        {phase === 'rest' && character && (
          <RestScreen
            character={character}
            onFinishRest={handleRestFinish}
          />
        )}
        {(phase === 'victory' || phase === 'gameover') && character && (
          <VictoryScreen
            character={character}
            isVictory={phase === 'victory'}
            onRestart={() => setPhase('creation')}
          />
        )}
      </main>

      {showInventory && character && (
        <InventoryModal
          character={character}
          onClose={() => setShowInventory(false)}
          onEquipItem={handleUpdateCharacter}
          onTriggerReincarnate={handleReincarnate}
        />
      )}

      {showRouletteModal && character && (
        <RouletteModal
          character={character}
          onClose={() => setShowRouletteModal(false)}
          onUpdateCharacter={handleUpdateCharacter}
          onShowMessage={showNotification}
        />
      )}

      {showBeginnerQuestsModal && character && (
        <BeginnerQuestsModal
          character={character}
          onClose={() => setShowBeginnerQuestsModal(false)}
          onUpdateCharacter={handleUpdateCharacter}
          onShowMessage={showNotification}
        />
      )}

      {pendingLoot && character && (
        <LootModal
          item={pendingLoot}
          character={character}
          onClaim={handleClaimLoot}
        />
      )}

      {/* AI Monthly Event Modal */}
      {showAiEventModal && character && (
        <AiMonthlyEventModal
          character={character}
          onClose={() => setShowAiEventModal(false)}
          onUpdateCharacter={handleUpdateCharacter}
          onShowMessage={showNotification}
        />
      )}

      {/* Global Hard Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-backdropFadeIn">
          <div className="bg-[#120808] border-2 border-red-600 max-w-md w-full rounded-3xl p-6 shadow-[0_0_50px_rgba(220,38,38,0.3)] text-[#e2e2e2] relative animate-modalExpand">
            <div className="flex items-center gap-3 text-red-500 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-red-950/80 border border-red-500/60 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-black text-red-400">【警告】全データ完全初期化</h3>
                <p className="text-xs text-red-300/80">セーブデータの完全削除</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              これまでの進行状況、キャラクター、獲得した称号、所持アイテム、および <strong className="text-amber-400">転生・昇華履歴（世代数）</strong> のすべてのセーブデータを完全に削除して最初からやり直しますか？
            </p>

            <div className="p-3 bg-red-950/40 rounded-xl border border-red-900/60 text-[11px] text-red-300 font-bold mb-6">
              ※ この操作は取り消せません。完全な初回状態に戻ります。
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowResetModal(false)}
                className="flex-1 py-3 bg-[#181820] hover:bg-[#252530] border border-[#3a3528] text-slate-300 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                キャンセル
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('astral_rogue_save_v1');
                  localStorage.removeItem('astral_rogue_reinc_v1');
                  localStorage.clear();
                  setCharacter(null);
                  setHasSaveData(false);
                  setReincarnationMeta({ count: 0 });
                  setPhase('creation');
                  setShowInventory(false);
                  setShowResetModal(false);
                  showNotification('【全データ初期化完了】セーブデータおよび転生履歴を完全消去しました。');
                }}
                className="flex-1 py-3 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-black text-xs rounded-xl shadow-lg border border-red-400/60 flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Trash2 className="w-4 h-4 text-white" />
                完全に初期化する
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="h-12 border-t border-[#2d2d30] hidden sm:flex items-center px-10 gap-10 bg-[#0f0f12] text-[10px] font-sans tracking-widest text-[#555] uppercase">
        <span>F1 Help</span>
        <span>F2 Character Sheet</span>
        <span>Esc Settings</span>
        <div className="ml-auto text-[#c4a661]">Aether Drift RPG — App Edition v2.4</div>
      </footer>
    </div>
  );
}

