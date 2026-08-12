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
