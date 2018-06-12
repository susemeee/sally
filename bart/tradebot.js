
import consola from 'consola';
import Algorithm from './algorithms/algorithm';
import Trader from './traders/trader';
import Plotter from './plotter/plotter';

export default class Tradebot {

  /**
   * @param {String} symbol
   * @param {Algorithm} algorithm
   * @param {Trader} trader
   * @param {Telegram} notifier
   * @param {Plotter} plotter
   */
  constructor(symbol, algorithm, trader, notifier, plotter) {
    this.symbol = symbol;
    this.algorithm = algorithm;
    this.trader = trader;
    this.notifier = notifier;
    this.plotter = plotter;

    this.logger = consola.withScope('Trader');
  }

  async init() {
    // it is currently not needed
    // const previousData = await this.trader.getCandleHistory(this.symbol, this.algorithm.defaultCandlePeriod);
    // this.algorithm.fillData(previousData);
  }

  async _onChartUpdate(chartAsArray) {
    this.algorithm.fillArrayData(chartAsArray);
    if (this.algorithm.isDataUpdated) {
      this.logger.debug('Determining signal');
      await this.algorithm.determineSignal();

      await this.plotter.renderData((roc240, roc480, close) => {

        const tradeRoc240 = {
          x: [...Array(close.length).keys()],
          y: roc240,
          type: 'scatter'
        };

        const tradeRoc480 = {
          x: [...Array(close.length).keys()],
          y: roc480,
          type: 'scatter'
        };

        const tradeClose = {
          x: [...Array(close.length).keys()],
          y: close,
          xaxis: 'x2',
          yaxis: 'y2',
          type: 'scatter'
        };

        const data = [tradeClose, tradeRoc240, tradeRoc480];

        const layout = {
          yaxis: {domain: [0, 0.3]},
          legend: {traceorder: 'reversed'},
          xaxis2: {anchor: 'y2'},
          yaxis2: {domain: [0.4, 1]},
        };

        Plotly.newPlot('plot', data, layout);

      }, [ this.algorithm.roc240, this.algorithm.roc480, this.algorithm.data.close ]);
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
