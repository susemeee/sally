
import dotenv from 'dotenv';

// loads .env
dotenv.config();
// loads api key
dotenv.config({
  path: require('path').join(__dirname, '.apikey'),
});

process.env.NODE_ENV = process.env.NODE_ENV || 'development';


const {
  LOG_LEVEL,
  TRADING_SECURITY_SYMBOL,
  TELEGRAM_BOT_TOKEN,
  TELEGRAM_BOT_ADMIN_ID,
  LOG_TO_TELEGRAM,
  BINANCE_API_KEY,
  BINANCE_API_SECRET,
  // If you want to use sandbox mode where orders are simulated
  BINANCE_API_TEST_MODE,
} = {
  // defaults
  LOG_LEVEL: 4,
  BINANCE_API_TEST_MODE: true,
  LOG_TO_TELEGRAM: false,
  // from env
  ...process.env,
};

export {
  LOG_LEVEL,
  TRADING_SECURITY_SYMBOL,
  TELEGRAM_BOT_TOKEN,
  TELEGRAM_BOT_ADMIN_ID,
  LOG_TO_TELEGRAM,
  BINANCE_API_KEY,
  BINANCE_API_SECRET,
  BINANCE_API_TEST_MODE,
};
