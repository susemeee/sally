import { TelegramBot } from './telegram/bot';
import Handler from './telegram/handler';


/**
 * Bart Entrypoint
 */
export async function run() {
  const telegramBot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, Handler.handlers);

  process.on('SIGINT', () => {
    telegramBot.stopPolling();
  });
};
