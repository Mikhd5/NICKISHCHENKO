"use strict";

const crypto = require("node:crypto");

const FLOWS = {
  usa: {
    title: "Авто зі США під ключ",
    steps: [
      { key: "vehicle", label: "Марка та модель", type: "text", prompt: "Яку марку або модель автомобіля розглядаєте?", hint: "Можна написати конкретну модель або кілька варіантів." },
      { key: "budget", label: "Бюджет", type: "choice", prompt: "Який бюджет на автомобіль під ключ?", choices: ["До $10 000", "$10 000–15 000", "$15 000–25 000", "$25 000+", "Потрібна консультація"] },
      { key: "year", label: "Рік випуску", type: "text", prompt: "Який рік випуску вас цікавить?", hint: "Наприклад: від 2019 року або без обмежень." },
      { key: "fuel", label: "Тип пального", type: "choice", prompt: "Який тип двигуна вам підходить?", choices: ["Бензин", "Дизель", "Гібрид", "Електро", "Не принципово"] },
      { key: "preferences", label: "Побажання", type: "text", prompt: "Що ще важливо врахувати?", hint: "Комплектація, привід, колір або інші побажання. Напишіть «Немає», якщо без уточнень." },
      { key: "name", label: "Ім’я", type: "text", prompt: "Як до вас звертатися?" },
      { key: "contact", label: "Контакт", type: "contact", prompt: "Залиште номер телефону або Telegram-контакт, щоб менеджер міг з вами зв’язатися." }
    ]
  },
  sell: {
    title: "Продати автомобіль",
    steps: [
      { key: "vehicle", label: "Автомобіль", type: "text", prompt: "Який автомобіль хочете продати?", hint: "Марка, модель, комплектація." },
      { key: "yearMileage", label: "Рік і пробіг", type: "text", prompt: "Вкажіть рік випуску та пробіг.", hint: "Наприклад: 2018 рік · 145 000 км." },
      { key: "condition", label: "Стан", type: "text", prompt: "Опишіть стан автомобіля.", hint: "Пошкодження, технічний стан, історія обслуговування." },
      { key: "price", label: "Бажана ціна", type: "text", prompt: "За яку суму плануєте продати автомобіль?", hint: "Можна написати «Потрібна оцінка»." },
      { key: "name", label: "Ім’я", type: "text", prompt: "Як до вас звертатися?" },
      { key: "contact", label: "Контакт", type: "contact", prompt: "Залиште номер телефону або Telegram-контакт." },
      { key: "photos", label: "Фотографії", type: "photos", prompt: "Можете надіслати до 5 фотографій автомобіля. Це необов’язково." }
    ]
  },
  trade: {
    title: "Обміняти автомобіль",
    steps: [
      { key: "currentVehicle", label: "Ваш автомобіль", type: "text", prompt: "Який автомобіль пропонуєте на обмін?", hint: "Марка, модель, рік і пробіг." },
      { key: "targetVehicle", label: "Бажаний автомобіль", type: "text", prompt: "На який автомобіль хочете обміняти?", hint: "Можна вказати модель або побажання." },
      { key: "budget", label: "Доплата", type: "choice", prompt: "Який варіант доплати розглядаєте?", choices: ["Без доплати", "До $2 000", "$2 000–5 000", "$5 000+", "Хочу обговорити"] },
      { key: "details", label: "Додаткова інформація", type: "text", prompt: "Є додаткові побажання щодо обміну?", hint: "Можна написати «Немає»." },
      { key: "name", label: "Ім’я", type: "text", prompt: "Як до вас звертатися?" },
      { key: "contact", label: "Контакт", type: "contact", prompt: "Залиште номер телефону або Telegram-контакт." }
    ]
  },
  pick: {
    title: "Підібрати автомобіль",
    steps: [
      { key: "body", label: "Тип кузова", type: "choice", prompt: "Який тип автомобіля шукаєте?", choices: ["Кросовер / SUV", "Седан", "Універсал", "Купе", "Не принципово"] },
      { key: "vehicle", label: "Марка та модель", type: "text", prompt: "Які марки або моделі розглядаєте?", hint: "Можна вказати кілька або написати «На ваш розсуд»." },
      { key: "budget", label: "Бюджет", type: "choice", prompt: "Який ваш орієнтовний бюджет?", choices: ["До $10 000", "$10 000–15 000", "$15 000–25 000", "$25 000+", "Потрібна консультація"] },
      { key: "year", label: "Рік випуску", type: "text", prompt: "Який рік випуску розглядаєте?", hint: "Наприклад: від 2020 року." },
      { key: "fuel", label: "Тип пального", type: "choice", prompt: "Який тип двигуна вам підходить?", choices: ["Бензин", "Дизель", "Гібрид", "Електро", "Не принципово"] },
      { key: "preferences", label: "Побажання", type: "text", prompt: "Що ще важливо врахувати під час підбору?", hint: "Комплектація, привід, колір та інші критерії." },
      { key: "name", label: "Ім’я", type: "text", prompt: "Як до вас звертатися?" },
      { key: "contact", label: "Контакт", type: "contact", prompt: "Залиште номер телефону або Telegram-контакт." }
    ]
  }
};

const MAIN_KEYBOARD = {
  inline_keyboard: [
    [
      { text: "🇺🇸 Авто зі США", callback_data: "flow:usa" },
      { text: "🔎 Підібрати авто", callback_data: "flow:pick" }
    ],
    [
      { text: "💰 Продати авто", callback_data: "flow:sell" },
      { text: "🔄 Обміняти авто", callback_data: "flow:trade" }
    ],
    [
      { text: "🚢 Доставка зі США", callback_data: "delivery" },
      { text: "❓ Питання та відповіді", callback_data: "faq" }
    ],
    [{ text: "👨‍💼 Зв’язатися з менеджером", callback_data: "manager" }]
  ]
};

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    const error = new Error("Missing environment configuration");
    error.code = "MISSING_ENV";
    throw error;
  }
  return value.replace(/\/+$/, "");
}

function isValidWebhookSecret(received, expected) {
  if (typeof received !== "string" || typeof expected !== "string" || !received || !expected) return false;
  const a = Buffer.from(received);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function supabaseHeaders(extra) {
  const key = requiredEnv("SUPABASE_SERVICE_ROLE_KEY");
  return Object.assign({
    apikey: key,
    Authorization: "Bearer " + key,
    "Content-Type": "application/json"
  }, extra || {});
}

async function db(table, query, options) {
  const url = requiredEnv("SUPABASE_URL") + "/rest/v1/" + table + (query ? "?" + query : "");
  const opts = options || {};
  const response = await fetch(url, {
    method: opts.method || "GET",
    headers: supabaseHeaders(opts.headers),
    body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
    signal: AbortSignal.timeout(10000)
  });
  const text = await response.text();
  if (!response.ok) {
    const error = new Error("Supabase request failed");
    error.code = "SUPABASE_" + response.status;
    throw error;
  }
  if (!text) return null;
  try { return JSON.parse(text); } catch { return null; }
}

async function tg(method, payload) {
  const token = requiredEnv("TELEGRAM_BOT_TOKEN");
  const response = await fetch("https://api.telegram.org/bot" + token + "/" + method, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload || {}),
    signal: AbortSignal.timeout(10000)
  });
  const data = await response.json().catch(() => null);
  if (!response.ok || !data || !data.ok) {
    const error = new Error("Telegram API request failed");
    error.code = "TELEGRAM_" + (data && data.error_code ? data.error_code : response.status);
    throw error;
  }
  return data.result;
}

async function send(chatId, text, markup, extra) {
  const payload = Object.assign({
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    disable_web_page_preview: true
  }, markup ? { reply_markup: markup } : {}, extra || {});
  return tg("sendMessage", payload);
}

async function answerCallback(id) {
  try { await tg("answerCallbackQuery", { callback_query_id: id }); }
  catch (error) { console.error("[telegram] callback answer failed:", error.code || "ERROR"); }
}

async function getState(chatId) {
  const rows = await db("telegram_bot_sessions", "chat_id=eq." + encodeURIComponent(String(chatId)) + "&select=state&limit=1");
  return rows && rows[0] && rows[0].state ? rows[0].state : {};
}

async function saveState(chatId, state) {
  await db("telegram_bot_sessions", "on_conflict=chat_id", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: { chat_id: String(chatId), state, updated_at: new Date().toISOString() }
  });
}

async function clearFlow(chatId, state) {
  const next = { consentedAt: state && state.consentedAt ? state.consentedAt : null };
  await saveState(chatId, next);
}

async function wasProcessed(updateId) {
  const rows = await db("telegram_bot_updates", "update_id=eq." + encodeURIComponent(String(updateId)) + "&select=update_id&limit=1");
  return Boolean(rows && rows.length);
}

async function markProcessed(updateId) {
  await db("telegram_bot_updates", "on_conflict=update_id", {
    method: "POST",
    headers: { Prefer: "resolution=ignore-duplicates,return=minimal" },
    body: { update_id: String(updateId), processed_at: new Date().toISOString() }
  });
}

function esc(value) {
  return String(value == null ? "" : value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[char]));
}

function privacyKeyboard() {
  return {
    inline_keyboard: [
      [{ text: "✅ Продовжити", callback_data: "consent:yes" }],
      [{ text: "Політика конфіденційності", url: "https://nickishchenko.vercel.app/privacy.html" }]
    ]
  };
}

async function welcome(chatId, state) {
  if (!state.consentedAt) {
    return send(
      chatId,
      "<b>NICKISHCHENKO</b> · AUTO ASSISTANT\n\nВітаємо! Допоможемо замовити автомобіль зі США, підібрати авто, продати або обміняти ваш автомобіль.\n\nПеред початком ознайомтеся з політикою конфіденційності. Для обробки заявки ми використаємо відповіді та контактні дані, які ви самі надішлете.",
      privacyKeyboard()
    );
  }
  return mainMenu(chatId);
}

async function mainMenu(chatId, text) {
  return send(
    chatId,
    text || "<b>NICKISHCHENKO</b> · ВАШ АВТОМОБІЛЬНИЙ АСИСТЕНТ\n\nОберіть, із чим допомогти. Я поставлю кілька коротких запитань і підготую заявку для менеджера.",
    MAIN_KEYBOARD
  );
}

function navKeyboard() {
  return {
    inline_keyboard: [[
      { text: "↩ Назад", callback_data: "nav:back" },
      { text: "✖ Скасувати", callback_data: "nav:cancel" }
    ]]
  };
}

function choiceKeyboard(choices) {
  const rows = [];
  for (let i = 0; i < choices.length; i += 2) {
    const row = [{ text: choices[i], callback_data: "choice:" + i }];
    if (choices[i + 1]) row.push({ text: choices[i + 1], callback_data: "choice:" + (i + 1) });
    rows.push(row);
  }
  rows.push([{ text: "↩ Назад", callback_data: "nav:back" }, { text: "✖ Скасувати", callback_data: "nav:cancel" }]);
  return { inline_keyboard: rows };
}

async function sendStep(chatId, state) {
  const flow = FLOWS[state.flow];
  if (!flow || !flow.steps[state.step]) return mainMenu(chatId);
  const step = flow.steps[state.step];
  let text = "<b>" + esc(flow.title) + "</b>\n\n" + esc(step.prompt) + "\n\n<em>КРОК " + (state.step + 1) + " ІЗ " + flow.steps.length + "</em>";
  if (step.hint) text += "\n" + esc(step.hint);

  if (step.type === "choice") {
    return send(chatId, text, choiceKeyboard(step.choices));
  }
  if (step.type === "contact") {
    return send(chatId, text, {
      keyboard: [
        [{ text: "📱 Поділитися номером телефону", request_contact: true }],
        [{ text: "↩ Назад" }, { text: "✖ Скасувати" }]
      ],
      resize_keyboard: true,
      one_time_keyboard: true,
      input_field_placeholder: "Номер телефону або @username"
    });
  }
  if (step.type === "photos") {
    return send(chatId, text + "\n\nНадішліть фотографії окремими повідомленнями або завершіть заявку без фото.", {
      keyboard: [
        [{ text: "✅ Завершити заявку" }],
        [{ text: "↩ Назад" }, { text: "✖ Скасувати" }]
      ],
      resize_keyboard: true
    });
  }
  return send(chatId, text, navKeyboard());
}

async function beginFlow(chatId, state, key) {
  if (!FLOWS[key]) return mainMenu(chatId, "Оберіть одну з доступних послуг:");
  state.flow = key;
  state.step = 0;
  state.answers = {};
  delete state.awaitingConfirmation;
  await saveState(chatId, state);
  return sendStep(chatId, state);
}

async function goBack(chatId, state) {
  if (!state.flow) return mainMenu(chatId);
  if (state.step <= 0) {
    await clearFlow(chatId, state);
    return mainMenu(chatId, "Повернулися до головного меню. Оберіть послугу:");
  }
  const previous = FLOWS[state.flow].steps[state.step - 1];
  delete state.answers[previous.key];
  state.step -= 1;
  delete state.awaitingConfirmation;
  await saveState(chatId, state);
  return sendStep(chatId, state);
}

async function cancelFlow(chatId, state) {
  await clearFlow(chatId, state);
  await tg("sendMessage", { chat_id: chatId, text: "Заявку скасовано.", reply_markup: { remove_keyboard: true } });
  return mainMenu(chatId, "Коли будете готові — оберіть послугу:");
}

function validateText(value, step) {
  const cleaned = String(value || "").trim().replace(/\u0000/g, "").slice(0, 500);
  if (cleaned.length < 2) return { ok: false, message: "Напишіть трохи більше інформації, будь ласка." };
  if (step.key === "year" && !/(19|20)\d{2}|без обмежень|будь-як/i.test(cleaned)) {
    return { ok: false, message: "Вкажіть рік, наприклад 2020, або напишіть «без обмежень»." };
  }
  return { ok: true, value: cleaned };
}

function validateContact(value) {
  const cleaned = String(value || "").trim().slice(0, 100);
  const compact = cleaned.replace(/[\s().-]/g, "");
  if (/^\+?\d{7,16}$/.test(compact) || /^@[A-Za-z0-9_]{5,32}$/.test(cleaned)) {
    return { ok: true, value: cleaned };
  }
  return { ok: false };
}

async function advance(chatId, state, value) {
  const flow = FLOWS[state.flow];
  state.answers[flow.steps[state.step].key] = value;
  state.step += 1;
  await saveState(chatId, state);
  if (state.step >= flow.steps.length) return sendSummary(chatId, state);
  return sendStep(chatId, state);
}

function summaryText(state) {
  const flow = FLOWS[state.flow];
  const lines = flow.steps.map((step) => {
    const value = state.answers[step.key];
    if (step.key === "photos") return "• <b>" + esc(step.label) + ":</b> " + ((value || []).length ? String(value.length) + " фото" : "не додано");
    return "• <b>" + esc(step.label) + ":</b> " + esc(value || "—");
  });
  return "<b>ПЕРЕВІРТЕ ВАШУ ЗАЯВКУ</b>\n\n<b>" + esc(flow.title) + "</b>\n\n" + lines.join("\n") + "\n\nЯкщо все правильно, підтвердіть надсилання менеджеру.";
}

async function sendSummary(chatId, state) {
  state.awaitingConfirmation = true;
  delete state.awaitingPhotos;
  await saveState(chatId, state);
  await tg("sendMessage", { chat_id: chatId, text: summaryText(state), parse_mode: "HTML", reply_markup: { remove_keyboard: true } });
  return send(chatId, "Підтверджуєте відправлення заявки?", {
    inline_keyboard: [
      [{ text: "✅ Підтвердити заявку", callback_data: "lead:confirm" }],
      [{ text: "✏️ Заповнити ще раз", callback_data: "lead:edit" }],
      [{ text: "✖ Скасувати", callback_data: "nav:cancel" }]
    ]
  });
}

function adminChatIds() {
  const raw = process.env.TELEGRAM_ADMIN_CHAT_IDS || process.env.TELEGRAM_ADMIN_CHAT_ID || "";
  return [...new Set(raw.split(",").map((value) => value.trim()).filter(Boolean))];
}

async function saveLead(state, updateId, from, chatId) {
  const flow = FLOWS[state.flow];
  const answers = Object.assign({}, state.answers);
  const payload = {
    source_update_id: String(updateId),
    chat_id: String(chatId),
    telegram_user_id: from && from.id ? String(from.id) : null,
    telegram_username: from && from.username ? from.username : null,
    customer_name: answers.name || (from && from.first_name) || "Клієнт Telegram",
    customer_contact: answers.contact,
    service_key: state.flow,
    service_title: flow.title,
    answers,
    status: "new"
  };
  const rows = await db("telegram_bot_leads", "on_conflict=source_update_id", {
    method: "POST",
    headers: { Prefer: "resolution=ignore-duplicates,return=representation" },
    body: payload
  });
  if (rows && rows[0]) return { lead: rows[0], created: true };
  const existing = await db("telegram_bot_leads", "source_update_id=eq." + encodeURIComponent(String(updateId)) + "&select=id,created_at&limit=1");
  return { lead: existing && existing[0] ? existing[0] : null, created: false };
}

function managerNotification(lead, state, from, chatId) {
  const flow = FLOWS[state.flow];
  const answers = state.answers || {};
  const lines = flow.steps.map((step) => {
    const value = answers[step.key];
    if (step.key === "photos") return "• <b>" + esc(step.label) + ":</b> " + ((value || []).length ? String(value.length) + " фото" : "не додано");
    return "• <b>" + esc(step.label) + ":</b> " + esc(value || "—");
  });
  const username = from && from.username ? "@" + from.username : "не вказано";
  const leadId = lead && lead.id ? String(lead.id).slice(0, 8).toUpperCase() : "нова";
  return {
    text: "<b>НОВА ЗАЯВКА · NICKISHCHENKO</b>\n\n<b>ID:</b> " + esc(leadId) + "\n<b>Послуга:</b> " + esc(flow.title) + "\n<b>Клієнт:</b> " + esc(answers.name || (from && from.first_name) || "—") + "\n<b>Telegram:</b> " + esc(username) + "\n\n" + lines.join("\n"),
    markup: from && from.id ? { inline_keyboard: [[{ text: "Відкрити чат із клієнтом", url: "tg://user?id=" + from.id }]] } : undefined
  };
}

async function notifyManagers(lead, state, from, chatId) {
  const ids = adminChatIds();
  if (!ids.length) return;
  const notification = managerNotification(lead, state, from, chatId);
  for (const adminId of ids) {
    try {
      await send(adminId, notification.text, notification.markup);
      const photos = state.answers && state.answers.photos ? state.answers.photos : [];
      for (const fileId of photos.slice(0, 5)) {
        await tg("sendPhoto", { chat_id: adminId, photo: fileId, caption: "Фото до заявки NICKISHCHENKO" });
      }
    } catch (error) {
      console.error("[telegram] manager notification failed:", error.code || "ERROR");
    }
  }
}

async function confirmLead(chatId, state, updateId, from) {
  if (!state.flow || !state.awaitingConfirmation) {
    return mainMenu(chatId, "Термін дії заявки завершився. Почнімо спочатку:");
  }
  const result = await saveLead(state, updateId, from, chatId);
  const leadId = result.lead && result.lead.id ? String(result.lead.id).slice(0, 8).toUpperCase() : "заявка";
  if (result.created) await notifyManagers(result.lead, state, from, chatId);
  await clearFlow(chatId, state);
  await tg("sendMessage", { chat_id: chatId, text: "Дякуємо! Заявку збережено.\n\nНомер звернення: " + leadId + "\n\nМенеджер зв’яжеться з вами після опрацювання запиту. Це попереднє звернення, а остаточні умови та наявність автомобіля узгоджуються окремо.", reply_markup: { remove_keyboard: true } });
  return mainMenu(chatId, "Можете обрати іншу послугу або поставити запитання:");
}

async function delivery(chatId) {
  return send(chatId,
    "<b>ЯК ПРАЦЮЄ ДОСТАВКА ЗІ США</b>\n\n<b>01 · Запит і підбір</b>\nУточнюємо бюджет та побажання.\n\n<b>02 · Перевірка варіантів</b>\nОбговорюємо конкретний автомобіль і доступну інформацію про нього.\n\n<b>03 · Узгодження та викуп</b>\nУмови погоджуються з вами до наступного кроку.\n\n<b>04 · Доставка</b>\nМенеджер пояснює логістику та актуальний статус.\n\n<b>05 · Отримання авто</b>\nУзгоджуємо документи й передачу автомобіля.\n\n<em>Строки, вартість і доступні етапи залежать від конкретного авто та маршруту. Їх підтверджує менеджер.</em>",
    { inline_keyboard: [[{ text: "🇺🇸 Замовити авто зі США", callback_data: "flow:usa" }], [{ text: "↩ Головне меню", callback_data: "menu" }]] }
  );
}

async function faq(chatId) {
  return send(chatId, "<b>ПОШИРЕНІ ПИТАННЯ</b>\n\nОберіть тему:", {
    inline_keyboard: [
      [{ text: "💵 Вартість і бюджет", callback_data: "faq:price" }],
      [{ text: "⏱️ Строки доставки", callback_data: "faq:time" }],
      [{ text: "🔍 Перевірка автомобіля", callback_data: "faq:check" }],
      [{ text: "↩ Головне меню", callback_data: "menu" }]
    ]
  });
}

async function faqAnswer(chatId, key) {
  const answers = {
    price: "<b>Вартість</b>\nПідсумкова сума залежить від автомобіля, результату торгів, логістики та оформлення. Менеджер допоможе розібрати бюджет до прийняття рішення.",
    time: "<b>Строки</b>\nТривалість залежить від конкретного авто, аукціону, порту та маршруту доставки. Точний орієнтир менеджер надає після уточнення варіанта.",
    check: "<b>Перевірка автомобіля</b>\nПеред погодженням конкретного варіанта менеджер пояснить, які дані про історію, стан і пошкодження доступні для перевірки."
  };
  return send(chatId, answers[key] || "Оберіть тему у списку запитань.", {
    inline_keyboard: [[{ text: "Інше питання", callback_data: "faq" }], [{ text: "↩ Головне меню", callback_data: "menu" }]]
  });
}

async function manager(chatId) {
  return send(chatId,
    "<b>ЗВ’ЯЗОК ІЗ NICKISHCHENKO</b>\n\nПотрібна персональна консультація? Напишіть нам в Instagram або залиште заявку в боті — менеджер отримає ваш запит.",
    { inline_keyboard: [
      [{ text: "Instagram @nickishchenko", url: "https://www.instagram.com/nickishchenko/" }],
      [{ text: "↩ Головне меню", callback_data: "menu" }]
    ] }
  );
}

async function handleCallback(update) {
  const query = update.callback_query;
  const chatId = query && query.message && query.message.chat ? query.message.chat.id : null;
  if (!chatId) return;
  await answerCallback(query.id);
  const data = String(query.data || "");
  const state = await getState(chatId);
  const from = query.from || {};

  if (data === "consent:yes") {
    state.consentedAt = state.consentedAt || new Date().toISOString();
    await saveState(chatId, state);
    return mainMenu(chatId);
  }
  if (data === "menu") {
    await clearFlow(chatId, state);
    return state.consentedAt ? mainMenu(chatId) : welcome(chatId, state);
  }
  if (!state.consentedAt) return welcome(chatId, state);
  if (data.startsWith("flow:")) return beginFlow(chatId, state, data.slice(5));
  if (data === "nav:cancel") return cancelFlow(chatId, state);
  if (data === "nav:back") return goBack(chatId, state);
  if (data === "lead:edit") {
    if (!state.flow) return mainMenu(chatId);
    state.step = 0;
    state.answers = {};
    delete state.awaitingConfirmation;
    return saveState(chatId, state).then(() => sendStep(chatId, state));
  }
  if (data === "lead:confirm") return confirmLead(chatId, state, update.update_id, from);
  if (data === "delivery") return delivery(chatId);
  if (data === "faq") return faq(chatId);
  if (data.startsWith("faq:")) return faqAnswer(chatId, data.slice(4));
  if (data === "manager") return manager(chatId);
  if (data.startsWith("choice:")) {
    const flow = FLOWS[state.flow];
    const step = flow && flow.steps[state.step];
    const index = Number(data.slice(7));
    if (!step || step.type !== "choice" || !Number.isInteger(index) || !step.choices[index]) {
      return send(chatId, "Цей варіант уже неактуальний. Оберіть відповідь ще раз.");
    }
    return advance(chatId, state, step.choices[index]);
  }
}

async function handleMessage(update) {
  const message = update.message;
  const chatId = message && message.chat ? message.chat.id : null;
  const from = message && message.from ? message.from : {};
  if (!chatId) return;
  const text = typeof message.text === "string" ? message.text.trim() : "";
  const state = await getState(chatId);

  if (text.startsWith("/start")) return welcome(chatId, state);
  if (text === "/menu") {
    await clearFlow(chatId, state);
    return state.consentedAt ? mainMenu(chatId) : welcome(chatId, state);
  }
  if (text === "/cancel" || text === "✖ Скасувати") return cancelFlow(chatId, state);
  if (text === "/help") {
    return send(chatId, "Команди бота:\n/start — почати\n/menu — головне меню\n/cancel — скасувати заявку\n\nОберіть послугу в меню або зв’яжіться з менеджером.");
  }
  if (text === "↩ Назад") return goBack(chatId, state);
  if (!state.consentedAt) return welcome(chatId, state);
  if (!state.flow) return mainMenu(chatId, "Щоб я міг допомогти, оберіть послугу в меню нижче:");

  const flow = FLOWS[state.flow];
  const step = flow && flow.steps[state.step];
  if (!step) {
    await clearFlow(chatId, state);
    return mainMenu(chatId, "Поточний сценарій завершився. Оберіть послугу ще раз:");
  }

  if (step.type === "photos") {
    if (text === "✅ Завершити заявку") {
      delete state.awaitingPhotos;
      return sendSummary(chatId, state);
    }
    if (Array.isArray(message.photo) && message.photo.length) {
      const current = Array.isArray(state.answers.photos) ? state.answers.photos : [];
      if (current.length >= 5) return send(chatId, "Можна додати не більше 5 фотографій. Натисніть «✅ Завершити заявку», щоб продовжити.");
      current.push(message.photo[message.photo.length - 1].file_id);
      state.answers.photos = current;
      state.awaitingPhotos = true;
      await saveState(chatId, state);
      return send(chatId, "Фото отримано (" + current.length + "/5). Надішліть ще або натисніть «✅ Завершити заявку».", {
        keyboard: [[{ text: "✅ Завершити заявку" }], [{ text: "↩ Назад" }, { text: "✖ Скасувати" }]],
        resize_keyboard: true
      });
    }
    return send(chatId, "Надішліть фотографію або натисніть «✅ Завершити заявку».", {
      keyboard: [[{ text: "✅ Завершити заявку" }], [{ text: "↩ Назад" }, { text: "✖ Скасувати" }]],
      resize_keyboard: true
    });
  }

  if (step.type === "contact") {
    let value = "";
    if (message.contact && message.contact.phone_number) {
      if (message.contact.user_id && message.contact.user_id !== from.id) {
        return send(chatId, "Будь ласка, поділіться саме власним номером або введіть номер вручну.");
      }
      value = "+" + String(message.contact.phone_number).replace(/[^\d]/g, "");
    } else {
      value = text;
    }
    const checked = validateContact(value);
    if (!checked.ok) {
      return send(chatId, "Не вдалося розпізнати контакт. Надішліть номер телефону з кодом країни або Telegram username у форматі @username.", {
        keyboard: [[{ text: "📱 Поділитися номером телефону", request_contact: true }], [{ text: "↩ Назад" }, { text: "✖ Скасувати" }]],
        resize_keyboard: true
      });
    }
    await tg("sendMessage", { chat_id: chatId, text: "Дякую! Контакт збережено.", reply_markup: { remove_keyboard: true } });
    return advance(chatId, state, checked.value);
  }

  if (step.type === "text") {
    const checked = validateText(text, step);
    if (!checked.ok) return send(chatId, checked.message, navKeyboard());
    return advance(chatId, state, checked.value);
  }

  return send(chatId, "Скористайтеся кнопками під повідомленням, щоб продовжити.");
}

async function processTelegramUpdate(update) {
  if (await wasProcessed(update.update_id)) return;
  if (update.callback_query) await handleCallback(update);
  else if (update.message) await handleMessage(update);
  await markProcessed(update.update_id);
}

module.exports = { processTelegramUpdate, isValidWebhookSecret };
