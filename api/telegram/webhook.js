"use strict";

const { processTelegramUpdate, isValidWebhookSecret } = require("../../lib/telegram-bot");

module.exports = async function telegramWebhook(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET || "";
  const receivedSecret = req.headers["x-telegram-bot-api-secret-token"] || "";
  if (!expectedSecret || !isValidWebhookSecret(receivedSecret, expectedSecret)) {
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }

  let update = req.body;
  if (typeof update === "string") {
    try {
      update = JSON.parse(update);
    } catch {
      return res.status(400).json({ ok: false, error: "Invalid JSON" });
    }
  }
  if (!update || typeof update !== "object" || !Number.isInteger(update.update_id)) {
    return res.status(400).json({ ok: false, error: "Invalid Telegram update" });
  }

  try {
    await processTelegramUpdate(update);
    return res.status(200).json({ ok: true });
  } catch (error) {
    // Do not log tokens, message text, phone numbers, or customer data.
    console.error("[telegram-webhook] processing failed:", error && error.code ? error.code : "INTERNAL_ERROR");
    return res.status(500).json({ ok: false });
  }
};
