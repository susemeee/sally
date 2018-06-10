
import util from 'util';

export default class BinanceApiDispatcher {

  constructor(binanceApiCaller) {
    this.binanceApiCaller = binanceApiCaller;
  }


  /**
   * BinanceBalance: { BTC: { available: '0.00000000', onOrder: '0.00000000' }, ... }
   * @returns Promise<BinanceBalance>
   */
  async getBalance() {
    return util.promisify(this.binanceApiCaller.balance)();
  }


  /**
   * Hooks a websocket(candle event).
   * @param {Object<symbol: tradeEvent>} symbols
   * @param {String} period
   */
  hookWebSocketCandle(symbols, period = '1m') {

    for (let webSocketEvent of Object.values(symbols)) {
      if (typeof webSocketEvent !== 'function') {
        throw new Error('hookWebSocket: webSocketEvent must be a function.');
      }
    }

    this.binanceApiCaller.websockets.candlesticks(Object.keys(symbols), period, candlesticks => {
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
  hookWebSocketTrade(symbols) {
    this.binanceApiCaller.websockets.trades(Object.keys(symbols), trades => {
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

  /**
   * call delegate for binanceApiCaller
   */
  get caller() {
    return this.binanceApiCaller;
  }
}
