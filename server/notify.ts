/** Optional Telegram notifications to the business owner about new orders and receipts. */
const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID;

export function notifyAdmin(text: string) {
  if (!TOKEN || !CHAT_ID) return;
  fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: CHAT_ID, text, disable_web_page_preview: true }),
    signal: AbortSignal.timeout(8000),
  }).catch((err) => console.error("[visol] telegram notify failed:", err.message));
}
