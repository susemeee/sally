
import talib from 'talib';

import util from 'util';
import _ from 'lodash';

export default class Algorithm {
  constructor() {
    this.defaultCandlePeriod = '15m';
    this.data = {
      open: [/* { time: Date, val: Number } */],
      high: [/* { time: Date, val: Number } */],
      low: [/* { time: Date, val: Number } */],
      close: [/* { time: Date, val: Number } */],
      volume: [/* { time: Date, val: Number } */],
    };
  }

  fillData(dataToAdd) {
    for (let [ key, data ] of Object.entries(this.data)) {
      data.push(...dataToAdd.map(d => {
        return { time: d.time, val: parseFloat(d[key]) };
      }));
    }
  }

  get TALibData() {
    return _.mapValues(this.data, (v) => _.orderBy(v, 't').map(v => v.val));
  }

  /**
   * @returns Promise<TALibResult>
   */
  async executeTALib(name, params) {
    try {
      const talibResult = await util.promisify(talib.execute)({
        name: name,
        startIdx: 0,
        endIdx: this.data.close.length,
        ...params,
      });
      return talibResult.result;
    } catch (err) {
      consola.error(err);
      throw err;
    }
  }

  async determineSignal() {
  }
}
