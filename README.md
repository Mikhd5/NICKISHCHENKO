# NICKISHCHENKO

Адаптивний сайт для послуг підбору та доставки автомобілів зі США, викупу й обміну автомобілів.

## Сайт

- index.html — головна сторінка та форми звернень.
- styles.css — стилі й адаптивна верстка.
- main.js — меню, фільтри, FAQ, модальні вікна та підготовка звернень.
- assets/ — логотип, відео, постери й інші матеріали.
- privacy.html — політика конфіденційності.
- terms.html — умови користування.

Форми поточного статичного сайту готують текст звернення у браузері; Telegram-бот працює окремо через захищений серверний webhook.

## Telegram bot

У репозиторії є окремий Telegram-only бот без вебадмінки:

- api/telegram/webhook.js — захищений Vercel webhook.
- lib/telegram-bot.js — логіка діалогів, меню та заявок.
- supabase/migrations/202611030001_telegram_bot.sql — таблиці для сесій, заявок і захисту від повторних webhook updates.
- TELEGRAM-BOT-SETUP.md — повна інструкція підключення.
- .env.example — перелік необхідних змінних середовища.

Бот підтримує замовлення авто зі США, підбір, викуп, обмін, передачу фотографій до заявки на викуп, FAQ та сповіщення менеджера в Telegram. Кожна заявка перед збереженням показується клієнту для підтвердження.

## Підключення Telegram-бота

1. Створи бота через @BotFather і збережи токен у секретах Vercel.
2. Виконай SQL з supabase/migrations/202611030001_telegram_bot.sql у Supabase SQL Editor.
3. Додай змінні з .env.example у Vercel.
4. Налаштуй Telegram webhook за інструкцією в TELEGRAM-BOT-SETUP.md.
5. Перевір отримання заявки та сповіщення менеджера.

Не коміть Telegram token або Supabase service_role key у GitHub. Не використовуй ці секрети у браузерному коді.

## Deployment

Проєкт розміщується на Vercel. Головна сторінка залишається статичною; Telegram webhook працює як serverless function за адресою /api/telegram/webhook.
