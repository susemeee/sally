import Algorithm from './algorithm';

export default class MACDAlgorithm extends Algorithm {

  constructor() {
    super();
    this.macd = {
      outMACD: [],
      outMACDSignal: [],
      outMACDHist: [],
    };
  }

  async determineSignal() {
    const { outMACD, outMACDSignal, outMACDHist } = await this.executeTALib('MACD', {
      inReal: this.TALibData.close,
      optInFastPeriod: 12,
      optInSlowPeriod: 26,
      optInSignalPeriod: 9,
    });

    this.macd.outMACD.push(outMACD);
    this.macd.outMACDSignal.push(outMACDSignal);
    this.macd.outMACDHist.push(outMACDHist);

    // TODO:
  }

}
