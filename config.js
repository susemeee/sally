
require('dotenv').config();
// loads api key
require('dotenv').config({
  path: require('path').join(__dirname, '.apikey'),
});

if (!process.env.API_KEY) {
  throw new Error('You should provide Binance API Key via .apikey file.');
}

process.env.NODE_ENV = process.env.NODE_ENV || 'development';
