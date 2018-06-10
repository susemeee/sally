
import BinanceApi from 'node-binance-api';
import BinanceApiDispatcher from '../bart/binance/api';

import * as config from '../config';

describe('binance_api', function () {

  before(function () {
    const _binanceApiCaller = new BinanceApi().options({
      APIKEY: config.BINANCE_API_KEY,
      APISECRET: config.BINANCE_API_SECRET,
      useServerTime: true,
      test: true,
    });
    this.binance = new BinanceApiDispatcher(_binanceApiCaller);
  });

  it('should return a current balance', async function () {

    const balance = await this.binance.getBalance();
    console.log(balance);

  });

});
