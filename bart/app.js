
import consola from 'consola';
import BinanceApi from 'node-binance-api';

import { TelegramBot } from './telegram/bot';
import TelegramHandler from './telegram/handler';
import BinanceApiDispatcher from './traders/binance/api';
import TradeBot from './tradebot';

import * as config from '../config';

import MACDAlgorithm from './algorithms/macd';
import TelegramReporter from './telegram/reporter';

/**
 * Bart Entrypoint
 */
export async function run() {
  const telegramBot = new TelegramBot(config.TELEGRAM_BOT_TOKEN, TelegramHandler.handlers);

  // Add consola reporter
  const telegramReporter = new TelegramReporter(telegramBot);
  consola.add(telegramReporter);

  const binanceApiCaller = new BinanceApi().options({
    APIKEY: config.BINANCE_API_KEY,
    APISECRET: config.BINANCE_API_SECRET,
    useServerTime: true,
    test: config.BINANCE_API_TEST_MODE,
  });
  const binance = new BinanceApiDispatcher(binanceApiCaller);

  /**
   * it uses macdalgorithm, firstly.
   */
  const algorithm = new MACDAlgorithm();
  const tradeBot = new TradeBot(config.TRADING_SECURITY_SYMBOL, algorithm, binance, telegramBot);
  await tradeBot.init();
  tradeBot.startTrading();

  let _stopping = false;
  process.on('SIGINT', () => {
    if (_stopping) return;
    _stopping = true;
    consola.warn('SIGINT');
    telegramBot.stopPolling();
    tradeBot.stopTrading();
  });
}
