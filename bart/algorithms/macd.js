import Algorithm from './algorithm';

import consola from 'consola';
import _ from 'lodash';

export default class MACDAlgorithm extends Algorithm {

  constructor() {
    super('MACDAlgorithm');
    this.macd = {
      outMACD: [],
      outMACDSignal: [],
      outMACDHist: [],
    };

    this.rsi = [];
    this.roc240 = [];
    this.roc480 = [];
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


    // roc240 > 0
    if (this.latest(this.roc240) > 0) {
      // macd > 0
      if (this.latest(this.macd.outMACD) > 0) {
        // Or(rsi < 25, Crossover(macd, macd_signal)
        if (
          this._isPositiveCrossOver(this.macd.outMACD, this.macd.outMACDSignal) ||
          this.latest(this.rsi) < 25
        ) {
          this.logger.info('Buy signal!');
        }
      }
    }

    this.logger.debug(`MACD: ${this.latest(this.macd.outMACD)}`);

    if (this._isPositiveCrossOver(this.macd.outMACD, this.macd.outMACDSignal)) {
      this.logger.debug('MACD Positive crossOver');
    }

    if (this._isNegativeCrossOver(this.macd.outMACD, this.macd.outMACDSignal)) {
      this.logger.debug('MACD Negative crossOver');
    }

  }

}
