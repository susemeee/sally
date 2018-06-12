
import consola from 'consola';
import MACDAlgorithm from './algorithms/macd';
import Trader from './traders/trader';
import Plotter from './plotter/plotter';
import { TelegramBot } from './telegram/bot';

import path from 'path';

export default class Tradebot {

  /**
   * @param {String} symbol
   * @param {MACDAlgorithm} algorithm
   * @param {Trader} trader
   * @param {TelegramBot} notifier
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

  async plotData(maxShowRange, screenshotPath) {
    await this.plotter.renderData((maxShowRange, roc240, roc480, macd, macdSignal, macdHistogram, rsi, ohlc) => {

      const _zeroFilledArray = n => Array(...Array(n)).map(a => 0);
      const _padLeft = (array, n) => _zeroFilledArray(n).concat(...array);

      const dataLen = ohlc.close.length;

      const data = [
        {
          x: [...Array(dataLen).keys()],
          y: _padLeft(roc240, dataLen - roc240.length),
          type: 'scatter',
          name: 'roc240',
        },
        {
          x: [...Array(dataLen).keys()],
          y: _padLeft(roc480, dataLen - roc480.length),
          type: 'scatter',
          name: 'roc480',
        },
        {
          x: [...Array(dataLen).keys()],
          y: _padLeft(macd, dataLen - macd.length),
          xaxis: 'x2',
          yaxis: 'y2',
          type: 'scatter',
          name: 'macd',
        },
        {
          x: [...Array(dataLen).keys()],
          y: _padLeft(macdSignal, dataLen - macdSignal.length),
          xaxis: 'x2',
          yaxis: 'y2',
          type: 'scatter',
          name: 'macdSignal',
        },
        {
          x: [...Array(dataLen).keys()],
          y: _padLeft(macdHistogram, dataLen - macdHistogram.length),
          xaxis: 'x2',
          yaxis: 'y2',
          type: 'bar',
          name: 'macdHisto',
        },
        {
          x: [...Array(dataLen).keys()],
          y: _padLeft(rsi, dataLen - rsi.length),
          xaxis: 'x3',
          yaxis: 'y3',
          type: 'scatter',
          name: 'rsi',
        },
        Object.assign({
          x: ohlc._time,
          xaxis: 'x4',
          yaxis: 'y4',
          type: 'candlestick',
          name: 'close',
        }, ohlc),
      ];

      const rangeToShow = [dataLen - maxShowRange, dataLen];
      const ohlcYrange = [ Math.min(...ohlc.low.slice(...rangeToShow)), Math.max(...ohlc.high.slice(...rangeToShow)) /* TODO: find a better way. */ ];

      const layout = {
        title: this.symbol,
        xaxis: { range: rangeToShow },
        yaxis: { domain: [0, 0.15] },
        legend: { traceorder: 'reversed' },
        xaxis2: { anchor: 'y2', range: rangeToShow },
        yaxis2: { domain: [0.2, 0.35] },
        xaxis3: { anchor: 'y3', range: rangeToShow },
        yaxis3: { domain: [0.4, 0.55] },
        xaxis4: { anchor: 'y4', range: rangeToShow, rangeslider: { visible: false } },
        yaxis4: { domain: [0.6, 1], dtick: 0.5, range: ohlcYrange },
        margin: {
          autoexpand: true,
          l: 50,
          r: 0,
          t: 0,
        },
      };

      Plotly.newPlot('plot', data, layout);

    }, [
      maxShowRange,
      this.algorithm.roc240,
      this.algorithm.roc480,
      this.algorithm.macd.outMACD,
      this.algorithm.macd.outMACDSignal,
      this.algorithm.macd.outMACDHist,
      this.algorithm.rsi,
      this.algorithm.data
    ], screenshotPath);
  }

  async _onChartUpdate(chartAsArray) {
    this.algorithm.fillArrayData(chartAsArray);
    if (this.algorithm.isDataUpdated) {
      this.logger.debug('Determining signal');
      await this.algorithm.determineSignal();

      const _screenshotPath = path.join('data', `screenshot_${new Date().toISOString().replace(/:/g, '')}.png`);
      await this.plotData(200, _screenshotPath);

      this.notifier.sendImage(this.notifier.adminId, _screenshotPath, this.symbol);
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
