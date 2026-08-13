import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// API endpoint for AI-generated dungeon event or lore flavor
app.post("/api/ai-event", async (req, res) => {
  try {
    const { stageName, floorNumber, raceName, className } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        title: "神秘のほこら",
        desc: "迷宮の奥深くで静かに光るほこらを見つけた。微かな魔力があなたを癒やしている。",
        choiceA: "祈りを捧げる (HP・MP回復)",
        choiceB: "無視して先へ進む",
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `ローグライクRPGのダンジョンイベントを作成してください。
ステージ: ${stageName}, 階層: ${floorNumber}階, プレイヤー種族: ${raceName}, 役職: ${className}
以下のJSONフォーマットのみで出力してください:
{
  "title": "イベント名",
  "desc": "イベントの状況説明（3文程度、雰囲気のあるダークファンタジー調）",
  "choiceA": "選択肢1のテキスト（例: 泉の水を飲む）",
  "choiceB": "選択肢2のテキスト（例: 宝箱を開ける）"
}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            desc: { type: Type.STRING },
            choiceA: { type: Type.STRING },
            choiceB: { type: Type.STRING },
          },
          required: ["title", "desc", "choiceA", "choiceB"],
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    res.json(data);
  } catch (error: any) {
    console.error("AI Event Error:", error);
    res.json({
      title: "魔力の残響",
      desc: "空間に漂う微弱な魔力があなたを包み込む。不思議と力がみなぎってくるようだ。",
      choiceA: "魔力を吸収する (HP/MP回復)",
      choiceB: "そのまま通り過ぎる",
    });
  }
});

// API endpoint for AI-generated monthly automatic events
app.post("/api/generate-monthly-event", async (req, res) => {
  try {
    const { monthNumber } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        title: `第${monthNumber || 1}月: 虚空神域の降臨祭`,
        themeName: "虚空降臨",
        description: "1ヶ月の時を経て、異界の門が開かれ全プレイヤーに神話級の祝福が降り注ぎます！全ドロップ率2倍＆限定ガチャチケット配布！",
        buffType: "drop_rate_boost",
        buffValue: 2.0,
        rewardItemName: "虚空の神晶石",
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `ファンタジーRPGの「1ヶ月ごとにAIが自動考案するマンスリー超大型イベント」を生成してください。
現在のゲーム月数: 第${monthNumber || 1}月。
以下のJSONフォーマットのみで出力してください:
{
  "title": "イベントタイトル（例: 第X月 神竜王の覚醒祭）",
  "themeName": "テーマ名（例: 神竜王降臨）",
  "description": "イベントの詳細説明（3文程度、盛大でワクワクするファンタジーRPGのイベント案内文）",
  "buffType": "drop_rate_boost" または "exp_boost" または "gold_boost" または "gacha_discount",
  "buffValue": 2.5,
  "rewardItemName": "イベント限定の報酬アイテム名"
}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            themeName: { type: Type.STRING },
            description: { type: Type.STRING },
            buffType: { type: Type.STRING },
            buffValue: { type: Type.NUMBER },
            rewardItemName: { type: Type.STRING },
          },
          required: ["title", "themeName", "description", "buffType", "buffValue", "rewardItemName"],
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    res.json(data);
  } catch (error: any) {
    console.error("Monthly AI Event Error:", error);
    res.json({
      title: `第${req.body?.monthNumber || 1}月: AI自動生成・星辰降臨祭`,
      themeName: "星辰降臨",
      description: "1ヶ月の周期を終え、AIオーラによって全ダンジョンの魔力が活性化！レジェンド以上のドロップ率が大幅アップ中！",
      buffType: "drop_rate_boost",
      buffValue: 2.5,
      rewardItemName: "星屑のルーン結晶",
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
