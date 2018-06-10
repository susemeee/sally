
import consola from 'consola';
import Algorithm from './algorithms/algorithm';
import Trader from './traders/trader';

export default class Tradebot {

  /**
   * @param {String} symbol
   * @param {Algorithm} algorithm
   * @param {Trader} trader
   * @param {Telegram} notifier
   */
  constructor(symbol, algorithm, trader, notifier) {
    this.symbol = symbol;
    this.algorithm = algorithm;
    this.trader = trader;
    this.notifier = notifier;
  }

  async init() {
    const previousData = await this.trader.getCandleHistory(this.symbol, this.algorithm.defaultCandlePeriod);
    this.algorithm.fillData(previousData);
  }

  startTrading() {
    consola.info('Trader: started.');

    this.algorithm.determineSignal();
  }

  stopTrading() {
    consola.info('Trader: stopped.');
  }
}
