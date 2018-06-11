
import util from 'util';
import Trader from '../trader';

export default class BinanceApiDispatcher extends Trader {

  static CANDLESTICK_FETCH_COUNT = 500;

  /**
   * BinanceBalance: { BTC: { available: '0.00000000', onOrder: '0.00000000' }, ... }
   * @returns Promise<BinanceBalance>
   */
  async getBalance() {
    return util.promisify(this.caller.balance)();
  }

  /**
   * Gets a candlestick of CANDLESTICK_FETCH_COUNT
   * @param {String} symbol
   * @param {Number} period
   * @param {Date} endTime
   */
  _getCandlesticks(symbol, period, endTime) {
    const KEYS = [
      'time',
      'open',
      'high',
      'low',
      'close',
      'volume',
      'closeTime',
      'assetVolume',
      'trades',
      'buyBaseVolume',
      'buyAssetVolume',
      'ignored'
    ];

    return new Promise((resolve, reject) => {
      this.caller.candlesticks(symbol, period, (err, ticks, symbol) => {
        if (err) reject(err);

        const convertedTicks = ticks.map(tick => {
          return KEYS.reduce((tickObj, key, i) => {
            tickObj[key] = tick[i];
            return tickObj;
          }, {});
        });

        return resolve(convertedTicks);
      });
    }, { limit: BinanceApiDispatcher.CANDLESTICK_FETCH_COUNT, endTime: endTime });
  }

  /**
   * Gets a candlestick history
   * @param {String} symbol
   * @param {Number} period
   * @param {Date} endTime
   */
  async getCandleHistory(symbol, period, n = 500, endTime = Date.now()) {
    const _candlesticks = [];
    let _endTime = endTime;
    let _n = n;

    try {
      while (_n > 0) {
        _candlesticks.unshift(...(await this._getCandlesticks(symbol, period, _endTime)));
        _n -= BinanceApiDispatcher.CANDLESTICK_FETCH_COUNT;
        _endTime = _candlesticks[0].time;
      }

      return _candlesticks;

    } catch (err) {
      throw err;
    }
  }


  /**
   * Hooks a websocket(chart event)
   * @param {String} symbol
   * @param {String} period
   */
  hookChartUpdate(symbol, period = '1m', cb) {
    if (typeof cb !== 'function') {
      throw new Error('hookChartUpdate: cb must be a function.');
    }

    this.caller.websockets.chart(symbol, period, (symbol, interval, chart) => {
      cb(this.caller.ohlc(chart));
    });
  }

  /**
   * Hooks a websocket(candle event).
   * @param {Object<symbol: tradeEvent>} symbols
   * @param {String} period
   */
  hookCandleEvent(symbols, period = '1m') {

    for (let webSocketEvent of Object.values(symbols)) {
      if (typeof webSocketEvent !== 'function') {
        throw new Error('hookCandleEvent: webSocketEvent must be a function.');
      }
    }

    this.caller.websockets.candlesticks(Object.keys(symbols), period, candlesticks => {
      const { e: eventType, E: eventTime, s: symbol, k: ticks } = candlesticks;
      const { o: open, h: high, l: low, c: close, v: volume, n: trades, i: interval, x: isFinal, q: quoteVolume, V: buyVolume, Q: quoteBuyVolume } = ticks;

      const _onCandlestick = symbols[symbol];
      _onCandlestick({
        eventType: eventType,
        eventTime: eventTime,
        symbol: symbol,
        _ticks: ticks,
      }, {
        open: open,
        high: high,
        low: low,
        close: close,
        volume: volume,
        trades: trades,
        interval: interval,
        isFinal: isFinal,
        quoteVolume: quoteVolume,
        buyVolume: buyVolume,
        quoteBuyVolume: quoteBuyVolume,
      });
    });

  }

  /**
   * Hooks a websocket(trade event).
   * @param {Object<symbol: tradeEvent>} symbols
   */
  hookTradeEvent(symbols) {

    for (let webSocketEvent of Object.values(symbols)) {
      if (typeof webSocketEvent !== 'function') {
        throw new Error('hookTradeEvent: webSocketEvent must be a function.');
      }
    }

    this.caller.websockets.trades(Object.keys(symbols), trades => {
      let { e: eventType, E: eventTime, s: symbol, p: price, q: quantity, m: maker, a: tradeId } = trades;

      const _onCandlestick = symbols[symbol];
      _onCandlestick({
        eventType: eventType,
        eventTime: eventTime,
        symbol: symbol,
      }, {
        price: price,
        quantity: quantity,
        maker: maker,
        tradeId: tradeId,
      });
    });
  }

  unhookFromEvents() {
    let endpoints = this.caller.websockets.subscriptions();
    for ( let endpoint in endpoints ) {
      this.caller.websockets.terminate(endpoint);
    }
  }
}
