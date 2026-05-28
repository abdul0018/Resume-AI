import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { Telegraf } from "telegraf";

// Import AI and service modules
import { generateAICV, improveAICV, generateAICoverLetter, generateAIInterviewPrep } from "./server/ai";
import { getFilteredJobs, UZ_VACANCIES } from "./server/jobs";
import { processBotMessage, getOrCreateSession, cvStore } from "./server/bot";

// Load configuration
dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json());

// Enable CORS for external Mini App web page clients (such as Netlify)
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// 1. Core Service APIs
app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// GET active jobs matching category and location
app.get("/api/jobs", (req: Request, res: Response) => {
  const category = (req.query.category as string) || "all";
  const location = (req.query.location as string) || "all";
  const results = getFilteredJobs(category, location);
  res.json({ success: true, count: results.length, jobs: results });
});

// POST to generate AI formatted ATS CV
app.post("/api/cv/generate", async (req: Request, res: Response) => {
  try {
    const { cvData, targetLang } = req.body;
    const result = await generateAICV(cvData, targetLang || "uz");
    res.json({ success: true, cv: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST to analyze / improve existing raw resume (Before vs After)
app.post("/api/cv/improve", async (req: Request, res: Response) => {
  try {
    const { rawText } = req.body;
    if (!rawText) {
      return res.status(400).json({ success: false, error: "Raw resume text is required" });
    }
    const result = await improveAICV(rawText);
    res.json({ success: true, analysis: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST to generate custom Cover Letter
app.post("/api/cover-letter", async (req: Request, res: Response) => {
  try {
    const { cvData, jobDescription, targetLang } = req.body;
    const result = await generateAICoverLetter(cvData || {}, jobDescription || "", targetLang || "uz");
    res.json({ success: true, coverLetter: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST to generate role-specific interview prep Q&As
app.post("/api/interview", async (req: Request, res: Response) => {
  try {
    const { jobType } = req.body;
    const result = await generateAIInterviewPrep(jobType || "Sales");
    res.json({ success: true, exam: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST for simulating Click/Payme Uzbekistan billing transaction integration
app.post("/api/payment", (req: Request, res: Response) => {
  const { provider, amount, userId } = req.body;
  if (!userId) {
    return res.status(400).json({ success: false, error: "User ID is required" });
  }
  const session = getOrCreateSession(userId);
  session.isPremium = true; // Simulating active premium activation instantly

  res.json({
    success: true,
    message: `To'lovingiz qabul qilindi! (${provider.toUpperCase()}) orqali ${amount} UZS muvaffaqiyatli amalga oshirildi.`,
    isPremium: true,
    user: session
  });
});

// POST for simulator bot chats in the frontend playground
app.post("/api/bot-simulate", async (req: Request, res: Response) => {
  try {
    const { userId, username, text } = req.body;
    const targetUserId = userId || "simulator-user-999";
    const targetUsername = username || "UzbekKandidat";
    
    const botReply = await processBotMessage(targetUserId, targetUsername, text || "");
    const session = getOrCreateSession(targetUserId, targetUsername);

    res.json({
      success: true,
      reply: botReply,
      session: {
        userId: session.userId,
        state: session.state,
        cvDraft: session.cvDraft,
        isPremium: session.isPremium,
        lang: session.lang
      }
    });
  } catch (error: any) {
    console.error("Simulation error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Real Bot status dashboard details
let isBotActive = false;
let botErrorLine: string | null = null;
const botTokenSupplied = !!process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_BOT_TOKEN !== "MY_GEMINI_API_KEY" && process.env.TELEGRAM_BOT_TOKEN !== "YOUR_TELEGRAM_BOT_TOKEN";

app.get("/api/bot-status", (req: Request, res: Response) => {
  res.json({
    botName: "ResumeAI UZ Bot",
    isBotActive,
    botTokenSupplied,
    botError: botErrorLine,
    appUrl: process.env.APP_URL || "http://localhost:3000",
    geminiStatus: process.env.GEMINI_API_KEY ? "CONFIGURED" : "MISSING_KEY"
  });
});

// PDF generator router stub (supports simulated download on bot request)
app.get("/api/cv/download", (req: Request, res: Response) => {
  const { id } = req.query;
  
  let name = req.query.name as string || "";
  let email = req.query.email as string || "";
  let phone = req.query.phone as string || "";
  let education = req.query.education as string || "";
  let skills = req.query.skills as string || "";
  let experience = req.query.experience as string || "[]";
  let languages = req.query.languages as string || "[]";
  let picture = req.query.picture as string || "";
  let designStyle = req.query.designStyle as string || "classic";

  if (id && typeof id === "string") {
    const savedCv = cvStore[id];
    if (savedCv) {
      name = savedCv.fullName || "";
      email = savedCv.email || "";
      phone = savedCv.phone || "";
      education = savedCv.education || "";
      skills = (savedCv.skills || []).join(",");
      experience = JSON.stringify(savedCv.experience || []);
      languages = JSON.stringify(savedCv.languages || []);
      picture = savedCv.picture || "";
      designStyle = savedCv.designStyle || "classic";
    }
  }
  
  // Return an incredibly clean, beautiful printable HTML resume that acts as perfect print fallback or download screen
  const skillsList = (skills || "").split(",").map((s) => `<li>${s.trim()}</li>`).join("");
  
  let parsedExp: any[] = [];
  try {
    parsedExp = JSON.parse(experience || "[]");
  } catch(e) {}

  let parsedLang: any[] = [];
  try {
    parsedLang = JSON.parse(languages || "[]");
  } catch(e) {}

  const experienceHTML = parsedExp.map((exp: any) => `
    <div style="margin-bottom: 12px;">
      <div style="display: flex; justify-content: space-between; font-weight: bold; color: #1e293b;">
        <span>${exp.company}</span>
        <span style="font-weight: normal; color: #64748b;">${exp.duration}</span>
      </div>
      <div style="font-style: italic; color: #475569; margin-bottom: 4px;">${exp.position}</div>
      <p style="margin: 0; color: #334155; font-size: 13px;">${exp.description}</p>
    </div>
  `).join("");

  const languagesHTML = parsedLang.map((l: any) => `
    <span><strong>${l.language}:</strong> ${l.level}</span>
  `).join(" &nbsp;|&nbsp; ");

  // Custom styling classes based on designStyle
  let headerHTML = "";
  let additionalStyles = "";

  if (designStyle === "creative") {
    additionalStyles = `
      .resume-card { border-top: 15px solid #2563eb; position: relative; overflow: hidden; }
      .header { background: #f8fafc; padding: 25px; border-radius: 6px; margin-bottom: 25px; border-bottom: none; display: flex; align-items: center; justify-content: space-between; }
      .header h1 { color: #1e3a8a !important; font-size: 32px; }
      .section-title { background: #eff6ff; color: #1e40af; padding: 6px 12px; border-radius: 4px; border-bottom: none; }
    `;
    headerHTML = `
      <div class="header">
        <div class="header-text">
          <h1>${name || "JASUR ALIMOV"}</h1>
          <div class="contact-info">
            📍 Toshkent, O'zbekiston &nbsp;•&nbsp; 📞 ${phone || "+998 (90) 123-45-67"} &nbsp;•&nbsp; ✉️ ${email || 'kontakt@resume.uz'}
          </div>
        </div>
        ${picture ? `<img src="${picture}" class="header-photo" style="border-radius: 50%; border: 3px solid #3b82f6;" alt="Photo" />` : ""}
      </div>
    `;
  } else if (designStyle === "modern") {
    additionalStyles = `
      .resume-card { border-left: 8px solid #0f172a; padding-left: 45px; }
      .header { border-bottom: 3px solid #0f172a; padding-bottom: 20px; }
      .header h1 { font-size: 30px; font-weight: 800; color: #0f172a; }
      .section-title { color: #0f172a; font-size: 17px; border-left: 4px solid #0f172a; padding-left: 8px; border-bottom: none; }
    `;
    headerHTML = `
      <div class="header">
        <div class="header-text">
          <h1>${name || "JASUR ALIMOV"}</h1>
          <div class="contact-info">
            📍 Toshkent, O'zbekiston &nbsp;•&nbsp; 📞 ${phone || "+998 (90) 123-45-67"} &nbsp;•&nbsp; ✉️ ${email || 'kontakt@resume.uz'}
          </div>
        </div>
        ${picture ? `<img src="${picture}" class="header-photo" alt="Photo" />` : ""}
      </div>
    `;
  } else if (designStyle === "minimal") {
    additionalStyles = `
      body { background-color: #fafafa; }
      .resume-card { box-shadow: none; border: 1px solid #e2e8f0; padding: 50px; }
      .header { flex-direction: column; text-align: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 25px; }
      .header-text { text-align: center; }
      .header-photo { margin: 0 auto 15px auto; display: block; border-radius: 50px; width: 80px; height: 80px; }
      .header h1 { font-size: 26px; font-weight: 300; letter-spacing: 1px; color: #334155; }
      .section-title { text-align: center; font-size: 13px; font-weight: 600; letter-spacing: 2px; color: #475569; border: none; padding-bottom: 0; margin-top: 35px; }
      .section-title::after { content: ''; display: block; width: 40px; height: 1px; background: #cbd5e1; margin: 8px auto 0 auto; }
    `;
    headerHTML = `
      <div class="header">
        ${picture ? `<img src="${picture}" class="header-photo" alt="Photo" />` : ""}
        <div class="header-text">
          <h1>${name || "JASUR ALIMOV"}</h1>
          <div class="contact-info">
            📍 Toshkent, O'zbekiston &nbsp;•&nbsp; 📞 ${phone || "+998 (90) 123-45-67"} &nbsp;•&nbsp; ✉️ ${email || 'kontakt@resume.uz'}
          </div>
        </div>
      </div>
    `;
  } else {
    // Classic
    headerHTML = `
      <div class="header">
        <div class="header-text">
          <h1>${name || "JASUR ALIMOV"}</h1>
          <div class="contact-info">
            📍 Toshkent, O'zbekiston &nbsp;•&nbsp; 📞 ${phone || "+998 (90) 123-45-67"} &nbsp;•&nbsp; ✉️ ${email || 'kontakt@resume.uz'}
          </div>
        </div>
        ${picture ? `<img src="${picture}" class="header-photo" alt="Photo" />` : ""}
      </div>
    `;
  }

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Resume - ${name}</title>
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 0; padding: 40px; color: #1e293b; background-color: #f1f5f9; }
        .resume-card { background: white; max-width: 800px; margin: 0 auto; padding: 40px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
        .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #1e293b; padding-bottom: 15px; margin-bottom: 25px; }
        .header-text { flex: 1; text-align: left; }
        .header h1 { margin: 0; color: #1e293b; font-size: 28px; letter-spacing: -0.5px; }
        .contact-info { margin-top: 5px; color: #64748b; font-size: 14px; }
        .header-photo { width: 90px; height: 90px; border-radius: 6px; object-fit: cover; border: 1.5px solid #cbd5e1; margin-left: 20px; }
        .section-title { font-size: 16px; font-weight: bold; color: #1e293b; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-top: 25px; margin-bottom: 12px; letter-spacing: 0.5px; text-transform: uppercase; }
        ul { margin: 0; padding-left: 20px; }
        li { margin-bottom: 4px; font-size: 14px; }
        .footer { text-align: center; margin-top: 40px; font-size: 11px; color: #94a3b8; border-top: 1px dashed #cbd5e1; padding-top: 12px; }
        @media print {
          body { background: white; padding: 0; }
          .resume-card { box-shadow: none; padding: 0; border: none !important; }
          .btn-print { display: none; }
        }
        ${additionalStyles}
      </style>
    </head>
    <body>
      <div style="text-align: center; margin-bottom: 20px;" class="btn-print">
        <button onclick="window.print()" style="padding: 10px 20px; background-color: #1e293b; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">🖨️ PDF shaklida saqlash (Chop etish)</button>
      </div>
      <div class="resume-card">
        ${headerHTML}
        
        <div class="section-title">Professional Maqsad / Summary</div>
        <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #334155;">
          Natijalarga yo'naltirilgan va texnik bilimlarni amalda yuqori qo'llay oladigan mutaxassis. ATS rezyume filtri va xalqaro tanlov mezonlariga to'liq javob beruvchi rezyume egasi.
        </p>

        <div class="section-title">Ko'nikmalar</div>
        <ul style="grid-template-columns: repeat(2, minmax(0, 1fr)); display: grid;">
          ${skillsList}
        </ul>

        ${experienceHTML ? `
          <div class="section-title">Ish tajribasi</div>
          <div>${experienceHTML}</div>
        ` : ''}

        <div class="section-title">Ma'lumoti</div>
        <p style="margin: 0; font-size: 14px; color: #334155;">${education}</p>

        ${languagesHTML ? `
          <div class="section-title">Tillar</div>
          <p style="margin: 0; font-size: 14px; color: #334155;">${languagesHTML}</p>
        ` : ''}

        <div class="footer">
          Sertifikatlangan ATS-Friendly ${designStyle.toUpperCase()} shakl  |  Yaratilgan tizim: ResumeAI UZ Telegram Bot
        </div>
      </div>
    </body>
    </html>
  `);
});

// --- Helper to split Telegram messages over 4096 character limits ---
function splitMessage(text: string, maxLength: number = 4000): string[] {
  if (text.length <= maxLength) return [text];
  
  const paragraphs = text.split("\n");
  const chunks: string[] = [];
  let currentChunk = "";
  
  for (const paragraph of paragraphs) {
    if ((currentChunk + "\n" + paragraph).length > maxLength) {
      if (currentChunk) {
        chunks.push(currentChunk);
        currentChunk = paragraph;
      } else {
        // Individual paragraph exceeds length limit, slice chunks
        let temp = paragraph;
        while (temp.length > maxLength) {
          chunks.push(temp.substring(0, maxLength));
          temp = temp.substring(maxLength);
        }
        currentChunk = temp;
      }
    } else {
      if (currentChunk) {
        currentChunk += "\n" + paragraph;
      } else {
        currentChunk = paragraph;
      }
    }
  }
  
  if (currentChunk) {
    chunks.push(currentChunk);
  }
  
  return chunks;
}

// --- Real Telegram Bot Initialization ---
if (botTokenSupplied) {
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN!;
    const bot = new Telegraf(token);

    // Global Telegraf telemetry/recovery error catcher
    bot.catch((err: any, ctx) => {
      console.error(`Global Telegraf error for update ${ctx?.update?.update_id || "unknown"}:`, err);
    });

    bot.start(async (ctx) => {
      try {
        const appUrl = process.env.APP_URL || "https://ais-pre-pwopdacpyx4cwt7pbyrh7y-786405147346.asia-southeast1.run.app";
        
        try {
          await bot.telegram.setChatMenuButton({
            menuButton: {
              type: "web_app",
              text: "ResumeAI App 📲",
              web_app: { url: appUrl }
            }
          });
        } catch (menuErr) {
          console.warn("Failed to set chat menu button:", menuErr);
        }

        await ctx.reply(
          "Asalomu alaykum! 🤖\n\nMen **ResumeAI UZ** botiman. Sizga professional CV/Rezyume yaratishda, asosiy xatolarni tuzatishda, to'g'ri vakansiya topishda va suhbatga tayyorlanishda ko'maklashaman!\n\nBizning **AI Mini App**imiz orqali yanada qulay, visual va chiroyli interfeysda o'z professional rezyumengizni yaratishingiz mumkin! Pastdagi **Mini Appni ochish** tugmasini bosing:",
          {
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "🚀 AI Mini Appni ochish (Visual va qulay)",
                    web_app: { url: appUrl }
                  }
                ]
              ]
            }
          }
        );

        await ctx.reply(
          "Yoki tizimda tezkor matnli buyruqlar orqali davom etish uchun quyidagi tugmalardan foydalaning:",
          {
            reply_markup: {
              keyboard: [
                [{ text: "📲 AI Mini Appni ochish", web_app: { url: appUrl } }],
                [{ text: "📄 Yangi CV yaratish (AI)" }, { text: "✨ CVni yaxshilash (AI)" }],
                [{ text: "💼 Ishlar ro'yxati" }, { text: "💡 Suhbatga tayyorgarlik" }],
                [{ text: "✉️ Kuzatuv xati (AI Cover Letter)" }, { text: "💳 Premium & To'lov" }],
                [{ text: "🇺🇿/🇬🇧 Tilni almashtirish" }]
              ],
              resize_keyboard: true
            }
          }
        );
      } catch (err: any) {
        console.error("Error inside bot.start handler:", err);
      }
    });

    bot.on("text", async (ctx) => {
      try {
        const text = ctx.message.text;
        const userId = ctx.from.id.toString();
        const first_name = ctx.from.first_name || "Kandidat";

        // Process message through decoupled state machine
        const res = await processBotMessage(userId, first_name, text);

        // Structure customized reply keyboard if supplied by bot action
        let extraOpts: any = {};
        if (res.replyKeyboard) {
          extraOpts.reply_markup = {
            keyboard: res.replyKeyboard.map(row => row.map(col => {
              if (col && typeof col === "object") {
                return col;
              }
              return { text: col };
            })),
            resize_keyboard: true
          };
        }

        // Structure inline payments / quick selection triggers if supplied
        if (res.inlineKeyboard) {
          extraOpts.reply_markup = {
            inline_keyboard: res.inlineKeyboard.map(row => 
              row.map(btn => ({ text: btn.text, callback_data: btn.callbackData }))
            )
          };
        }

        // Send textual analysis safely splitting values if over Telegram API string constraints
        const MAX_LENGTH = 4000;
        if (res.text.length <= MAX_LENGTH) {
          await ctx.reply(res.text, { parse_mode: "Markdown", ...extraOpts });
        } else {
          const chunks = splitMessage(res.text, MAX_LENGTH);
          for (let i = 0; i < chunks.length; i++) {
            const opts = i === chunks.length - 1 ? extraOpts : {};
            await ctx.reply(chunks[i], { parse_mode: "Markdown", ...opts });
          }
        }

        // If downloadable PDF is ready, offer URL
        if (res.documentUrl) {
          const appUrl = process.env.APP_URL || "http://localhost:3000";
          await ctx.reply(`⬇️ **ATS-Friendly Rezyumeni bu yerda yuklang:**\n${appUrl}${res.documentUrl}`);
        }
      } catch (err: any) {
        console.error("Unhandled error processing user text message inside Telegraf handler:", err);
        try {
          await ctx.reply("⚠️ Xabarni qayta ishlashda xatolik yuz berdi. Iltimos, sahifani boshlash uchun /start buyrug'ini bosing yoki yana urinib ko'ring.");
        } catch (replyErr) {
          console.error("Unable to notify user of processing crash:", replyErr);
        }
      }
    });

    // Handle Inline button callback triggers (Payments & verification)
    bot.on("callback_query", async (ctx) => {
      try {
        const data = (ctx.callbackQuery as any).data;
        const userId = ctx.from.id.toString();
        const session = getOrCreateSession(userId);

        if (data.startsWith("pay_")) {
          const method = data.split("_")[1].toUpperCase();
          session.isPremium = true; // Simulating successful immediate payment
          await ctx.answerCbQuery(`Simulyatsiya qilingan to'lov: ${method}!`);
          await ctx.reply(`🎉 **Muvaffaqiyatli to'lov!**\n\nPremium faollashtirildi. Endi siz cheksiz AI funksiyalaridan mukammal foydalana olasiz!`);
        } else if (data === "check_premium") {
          await ctx.answerCbQuery("Tekshirilmoqda...");
          if (session.isPremium) {
            await ctx.reply("💎 Sizda premium status faol!");
          } else {
            await ctx.reply("Siz hozircha bepul tarifdasiz. Faollashtirish uchun yuqoridagi to'lov tugmalarini bosing.");
          }
        }
      } catch (err: any) {
        console.error("Error handling callback query index:", err);
        try {
          await ctx.answerCbQuery("Tizimda xatolik yuz berdi.");
        } catch (ansErr) {
          console.error("Failed answering invalid cbQuery callback:", ansErr);
        }
      }
    });

    bot.launch();
    isBotActive = true;
    console.log("Telegraf real-time Telegram Bot matching initialized and active!");
  } catch (err: any) {
    isBotActive = false;
    botErrorLine = err.message || "Token authorization rejected";
    console.error("Critical: Telegraf launcher crashed:", err);
  }
}

// --- Vite & Client Asset Routing Engine ---
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express Full-stack running elegantly at http://localhost:${PORT}`);
  });
}

startServer();
