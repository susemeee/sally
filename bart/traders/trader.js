

export default class Trader {
  constructor(caller) {
    this._caller = caller;
  }

  async getBalance() {
  }

  async getCandleHistory() {
  }

  hookChartUpdate(symbol, period = '1m', cb) {
  }

  hookCandleEvent(symbols, period = '1m') {
  }

  hookTradeEvent(symbols) {
  }

  async buy() {
  }

  async sell() {
  }

  get caller() {
    return this._caller;
  }

  unhookFromEvents() {
  }
}
