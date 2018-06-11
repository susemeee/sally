
import talib from 'talib';
import consola from 'consola';
import _ from 'lodash';

import util from 'util';

export default class Algorithm {
  constructor(algorithmName) {
    this.logger = consola.withScope(algorithmName);
    this.defaultCandlePeriod = '15m';
    this.data = {
      _time: [],
      open: [],
      high: [],
      low: [],
      close: [],
      volume: [],
    };

    this.isDataUpdated = false;
  }

  _get(a, n) { return n >= 0 ? a[n] : a[a.length + n]; }
  latest(a) { return this._get(a, -1); }
  first(a) { return this._get(a, 1); }

  _isPositiveCrossOver(da, db, n) {
    if (this._get(da, -1) === this._get(db, -1)) {
      if (this._get(da, -2) < this._get(da, -2)) {
        return true;
      }
    }

    return false;
  }

  _isNegativeCrossOver(da, db, n) {
    if (this._get(da, -1) === this._get(db, -1)) {
      if (this._get(da, -2) > this._get(da, -2)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Fills data from hookChartUpdate()
   * @param {Object<key: Array>} arrayData { open: [], high: [], low: [], close: [] } ...
   */
  fillArrayData(arrayData) {

    const _validKeys = d => Object.keys(d).filter(k => !k.startsWith('_')).sort();

    if (!_.isEqual(_validKeys(arrayData), _validKeys(this.data))) {
      throw new Error('fillArrayData: Data key integrity check failed.');
    }

    if (this.data.close.length !== arrayData.close.length) {
      this.isDataUpdated = true;
    }

    this.data = arrayData;
  }


  /**
   * Fills data from getCandleHistory()
   * @param {Array<Object>} dataToAdd [ { time: ..., high: ..., low: ..., close: ... }, ... ]
   */
  fillData(dataToAdd) {
    for (let [ key, data ] of Object.entries(this.data)) {
      data.push(...dataToAdd.map(d => {
        return parseFloat(d[key.startsWith('_') ? key.replace('_', '') : key]);
      }));
    }

    this.isDataUpdated = true;
  }


  /**
   * @returns Promise<TALibResult>
   */
  async executeTALib(name, params) {
    try {
      const talibResult = await util.promisify(talib.execute)({
        name: name,
        startIdx: 0,
        endIdx: this.data.close.length - 1,
        ...params,
      });
      return talibResult.result;
    } catch (err) {
      consola.error(err);
      throw err;
    }
  }

  async determineSignal() {
    // wait for next data update if signal is determined
    this.isDataUpdated = false;
  }
}
