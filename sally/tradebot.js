
import consola from 'consola';
import MACDAlgorithm from './algorithms/macd';
import Trader from './traders/trader';
import Plotter from './plotter/plotter';
import { TelegramBot } from './telegram/bot';

import path from 'path';
import { EventEmitter } from 'events';

export default class Tradebot {

  /**
   * @param {String} symbol
   * @param {MACDAlgorithm} algorithm
   * @param {Trader} trader
   * @param {TelegramBot} notifier
   * @param {Plotter} plotter
   */
  constructor(symbol, algorithm, trader, notifier, plotter) {

    if (!symbol) throw new Error('You must give a symbol.');

    this.symbol = symbol;
    this.algorithm = algorithm;
    this.trader = trader;
    this.notifier = notifier;
    this.plotter = plotter;

    this.logger = consola.withScope('Trader');
  }

  static EVENT_BUS = new EventEmitter();
  static EVENT_FETCH_REQUEST = 'fetchRequest';
  static EVENT_FETCH_RESPONSE = 'fetchResponse';

  async init() {
    // registering an event listeners
    Tradebot.EVENT_BUS.on(Tradebot.EVENT_FETCH_REQUEST, async ({ currency, period, n } = {}) => {

      try {
        // plotter needs an algorithm and data structure
        const _dummyAlgorithm = new MACDAlgorithm();
        const _candlesticks = await this.trader.getCandleHistory(currency, period || _dummyAlgorithm.defaultCandlePeriod, n);

        _dummyAlgorithm.fillData(_candlesticks);

        const _screenshotPath = path.join('data', `screenshot_${new Date().toISOString().replace(/:/g, '')}.png`);
        await _dummyAlgorithm.initializeIndicators();
        await this.plotData(_dummyAlgorithm, n, _screenshotPath);

        // sends back response
        Tradebot.EVENT_BUS.emit(Tradebot.EVENT_FETCH_RESPONSE, null, {
          screenshotPath: _screenshotPath,
        });
      } catch (err) {
        Tradebot.EVENT_BUS.emit(Tradebot.EVENT_FETCH_RESPONSE, err);
      }

    });
  }

  async plotData(algorithm, maxShowRange, screenshotPath) {
    await this.plotter.renderData((maxShowRange, bbandHigh, bbandLow, bbandLine, macd, macdSignal, macdHistogram, rsi, ohlc) => {

      const _zeroFilledArray = n => Array(...Array(n)).map(a => 0);
      const _padLeft = (array, n) => _zeroFilledArray(n).concat(...array);

      const dataLen = ohlc.close.length;

      const data = [
        // candle
        Object.assign({
          x: [...Array(dataLen).keys()],
          xaxis: 'x4',
          yaxis: 'y4',
          type: 'candlestick',
          name: 'close',
        }, ohlc),
        // rsi
        {
          x: [...Array(dataLen).keys()],
          y: _padLeft(rsi, dataLen - rsi.length),
          type: 'scatter',
          name: 'rsi',
        },
        // macd
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
          marker: {
            color: '#8C5EB5',
          },
        },
        // volume
        {
          x: ohlc._time,
          y: ohlc.volume,
          xaxis: 'x3',
          yaxis: 'y3',
          type: 'bar',
          name: 'close',
          marker: {
            color: ohlc.close.map((close, i) => close > ohlc.close[i - 1] ? 'rgb(162,214,187)' : 'rgb(238,163,158)'),
          },
        },
        // BBands
        {
          x: [...Array(dataLen).keys()],
          y: _padLeft(bbandHigh, dataLen - bbandHigh.length),
          xaxis: 'x4',
          yaxis: 'y4',
          type: 'scatter',
          name: 'bband_high',
          line: { color: 'rgba(100,100,100,0.5)' },
        },
        {
          x: [...Array(dataLen).keys()],
          y: _padLeft(bbandLow, dataLen - bbandLow.length),
          xaxis: 'x4',
          yaxis: 'y4',
          type: 'scatter',
          name: 'bband_low',
          line: { color: 'rgba(100,100,100,0.5)' },
        },
        {
          x: [...Array(dataLen).keys()],
          y: _padLeft(bbandLine, dataLen - bbandLine.length),
          xaxis: 'x4',
          yaxis: 'y4',
          type: 'scatter',
          name: 'bband_line',
          line: { color: 'rgba(80,80,80,0.5)' },
        },
      ];

      const rangeToShow = [ Math.max(0, dataLen - maxShowRange), dataLen ];
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
        yaxis4: { domain: [0.6, 1], dtick: Math.round(ohlcYrange[1] / 30), range: ohlcYrange },
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
      algorithm.bbands.outRealUpperBand,
      algorithm.bbands.outRealLowerBand,
      algorithm.bbands.outRealMiddleBand,
      algorithm.macd.outMACD,
      algorithm.macd.outMACDSignal,
      algorithm.macd.outMACDHist,
      algorithm.rsi,
      algorithm.data
    ], screenshotPath);
  }

  async _onChartUpdate(chartAsArray) {
    this.algorithm.fillArrayData(chartAsArray);
    if (this.algorithm.isDataUpdated) {
      this.logger.debug('Determining signal');
      await this.algorithm.determineSignal();

      // making a report
      const _screenshotPath = path.join('data', `screenshot_${new Date().toISOString().replace(/:/g, '')}.png`);

      await this.plotData(this.algorithm, 100, _screenshotPath);
      await this.notifier.sendImage(this.notifier.adminId, _screenshotPath, this.symbol);
      await this.plotter.removeScreenshot(_screenshotPath);
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
