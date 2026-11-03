# NICKISHCHENKO Telegram bot

Telegram-only customer bot. There is no web admin panel.
The bot collects requests in Telegram, stores them in Supabase, and sends confirmed requests to manager Telegram chats.

## Features

- /start, /menu, /cancel and /help
- Privacy notice before the first request
- USA import, vehicle buyout, trade-in and vehicle selection flows
- Inline choice buttons, Back and Cancel
- Telegram's native contact-sharing button or manual phone / @username
- Up to 5 optional photos for vehicle buyout requests
- Review and explicit confirmation before a request is saved
- Manager notifications with request details and a button to open the customer's Telegram chat
- Delivery overview and FAQ
- Webhook secret validation and duplicate-update protection

## 1. Create the Telegram bot

1. Open @BotFather.
2. Run /newbot and choose a display name and username.
3. Copy the token. Never put it in GitHub, frontend code, screenshots or public messages.
4. Set these commands in BotFather:
   - start - Почати
   - menu - Головне меню
   - cancel - Скасувати заявку
   - help - Допомога

## 2. Prepare Supabase

1. Open the Supabase project used for this website, or create a dedicated project.
2. Open SQL Editor.
3. Run supabase/migrations/202611030001_telegram_bot.sql.
4. Copy the Project URL and the service_role key from the Supabase API settings.
5. Never expose the service role key in browser code or commit it to GitHub.

## 3. Add Vercel environment variables

In the nickishchenko Vercel project, open Settings -> Environment Variables and add:

- TELEGRAM_BOT_TOKEN - token from BotFather
- TELEGRAM_WEBHOOK_SECRET - random string using only A-Z, a-z, 0-9, underscore and hyphen
- TELEGRAM_ADMIN_CHAT_IDS - manager's numeric Telegram chat ID; multiple IDs can be comma-separated
- SUPABASE_URL - Supabase Project URL
- SUPABASE_SERVICE_ROLE_KEY - Supabase service_role key

Generate a webhook secret locally. In Windows PowerShell:

~~~powershell
$bytes = New-Object byte[] 32
[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
$webhookSecret = -join ($bytes | ForEach-Object { $_.ToString("x2") })
$webhookSecret
~~~

Copy the generated value into TELEGRAM_WEBHOOK_SECRET in Vercel. Keep it private.

Apply variables to Production, then redeploy the production deployment. Use Preview only when testing with a separate test bot.

## 4. Get the manager chat ID

The manager must open the bot and press Start before the bot can send private notifications to that account. Obtain the manager's numeric Telegram user/chat ID with a trusted ID lookup bot, then add it to TELEGRAM_ADMIN_CHAT_IDS and redeploy.

## 5. Set the webhook

The production webhook URL is:

https://nickishchenko.vercel.app/api/telegram/webhook

In Windows PowerShell, enter the bot token when prompted. Paste the same webhook secret that you saved in Vercel:

~~~powershell
$botToken = Read-Host "BotFather token"
$webhookSecret = Read-Host "Webhook secret from Vercel"
$body = @{
  url = "https://nickishchenko.vercel.app/api/telegram/webhook"
  secret_token = $webhookSecret
  allowed_updates = @("message", "callback_query")
  max_connections = 10
} | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri "https://api.telegram.org/bot$botToken/setWebhook" -ContentType "application/json" -Body $body
Invoke-RestMethod -Uri "https://api.telegram.org/bot$botToken/getWebhookInfo"
~~~

The setWebhook result should have ok = true. In getWebhookInfo, verify that the URL is correct and last_error_message is empty. Keep the token and webhook secret private.

## 6. Test

- /start -> accept privacy notice -> main menu
- Try all four service flows
- Try Back and Cancel
- Share your own contact or enter a phone number / @username
- For vehicle buyout, send up to five photos and complete the request
- Confirm a request and verify it appears in telegram_bot_leads and reaches the manager chat
- Test FAQ and delivery information

## Important

- The bot does not purchase vehicles, reserve vehicles, calculate a binding final price or promise delivery dates.
- A submitted form is a consultation request. Final prices, availability, condition and delivery terms are confirmed by the manager.
- Customer request details and photos are stored and shared with the manager to process the request. Align the website privacy policy and the business's retention practice with the actual process.
- If a Telegram token has been exposed publicly, revoke it via BotFather and replace the Vercel environment variable.
