
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

    this.logger = consola.withScope('Trader');
  }

  async init() {
    // it is currently not needed
    // const previousData = await this.trader.getCandleHistory(this.symbol, this.algorithm.defaultCandlePeriod);
    // this.algorithm.fillData(previousData);
  }

  _onChartUpdate(chartAsArray) {
    this.algorithm.fillArrayData(chartAsArray);
    if (this.algorithm.isDataUpdated) {
      this.logger.debug('Determining signal');
      this.algorithm.determineSignal();
    }
  }

  startTrading() {
    this.trader.hookChartUpdate(this.symbol, this.algorithm.defaultCandlePeriod, this._onChartUpdate.bind(this));

    this.logger.debug('candleEvent hooked.');
    this.logger.info('started.');
  }

  stopTrading() {
    this.trader.unhookFromEvents();
    this.logger.info('stopped.');
  }
}
