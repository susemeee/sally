import Algorithm from './algorithm';

import consola from 'consola';
import _ from 'lodash';

export default class MACDAlgorithm extends Algorithm {

  constructor() {
    super();
    this.macd = {
      outMACD: [],
      outMACDSignal: [],
      outMACDHist: [],
    };

    this.rsi = [];
    this.roc240 = [];
    this.roc480 = [];
  }

  _positiveCrossOver() {

  }

  async determineSignal() {
    super.determineSignal();

    this.macd = {
      ...await this.executeTALib('MACD', {
        inReal: this.data.close,
        optInFastPeriod: 12,
        optInSlowPeriod: 26,
        optInSignalPeriod: 9,
      }),
    };

    this.rsi = (await this.executeTALib('RSI', {
      inReal: this.data.close,
      optInTimePeriod: 14,
    })).outReal;

    this.roc240 = (await this.executeTALib('ROC', {
      inReal: this.data.close,
      optInTimePeriod: 240,
    })).outReal;

    this.roc480 = (await this.executeTALib('ROC', {
      inReal: this.data.close,
      optInTimePeriod: 480,
    })).outReal;

    console.log('------------------------------------');
    console.log(this.roc240.reverse());
    console.log('------------------------------------');
  }

}
