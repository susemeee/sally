
import consola from 'consola';
import BinanceApi from 'node-binance-api';

import { TelegramBot } from './telegram/bot';
import TelegramHandler from './telegram/handler';
import BinanceApiDispatcher from './binance/api';

import * as config from '../config';

/**
 * Bart Entrypoint
 */
export async function run() {
  const telegramBot = new TelegramBot(config.TELEGRAM_BOT_TOKEN, TelegramHandler.handlers);

  const binanceApiCaller = new BinanceApi().options({
    APIKEY: config.BINANCE_API_KEY,
    APISECRET: config.BINANCE_API_SECRET,
    useServerTime: true,
    test: config.BINANCE_API_TEST_MODE,
  });
  const binance = new BinanceApiDispatcher(binanceApiCaller);

  process.on('SIGINT', () => {
    consola.warn('SIGINT');
    telegramBot.stopPolling();
  });
};
