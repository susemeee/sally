
import path from 'path';
import fs from 'fs';

import TelegramBotApi from 'node-telegram-bot-api';

export class TelegramBot {

  static SUBSCRIBERS_PATH = path.join(process.cwd(), 'data', 'subscribers.json');

  constructor(token, handlers) {
    this.token = token;
    this.initialized = false;
    this.handlers = handlers;

    this.bot = null;
    this.data = {
      subscribers: [],
    };

    this.initialize();
  }

  _loadSubscribers() {
    try {
      const _subscribersJSON = fs.readFileSync(TelegramBot.SUBSCRIBERS_PATH);
      this.data.subscribers = JSON.parse(_subscribersJSON);
      console.log(`subscribers = ${_subscribersJSON}`);
    } catch (err) {
      console.log('Load error; subscribers = []');
    }
  }

  _saveSubscribers() {
    fs.writeFileSync(TelegramBot.SUBSCRIBERS_PATH, JSON.stringify(this.data.subscribers));
  }

  _registerHandlers() {
    if (!Array.isArray(this.handlers)) {
      throw new Error('handlers must be an array.');
    }

    for (let [ listenerName, matchRe, func ] of this.handlers) {
      this.bot[listenerName](matchRe, func.bind(this));
    }
  }

  initialize() {
    this.initialized = true;

    this.bot = new TelegramBotApi(this.token, {polling: true});
    // load subscribers
    this._loadSubscribers();
    // register handlers
    this._registerHandlers();
  }

  stopPolling() {
    this.bot.stopPolling();

    // dump subscribers
    this._saveSubscribers();
  }

  async waitForMessage(from, timeout = 30000) {
    return new Promise((resolve, reject) => {
      // timeout
      if (timeout) {
        setTimeout(() => reject(new Error('timed out')), timeout);
      }

      this.bot.onText(/.*/, (msg, content) => {
        const chatId = msg.chat.id;
        if (chatId === from) {
          resolve(content[0]);
        }
      });
    });
  }

  _onFetchRequest(currency) {
    return 'WIP';
  }

  sendTo(to, message) {
    if (!this.initialized) return console.log(message);

    this.bot.sendMessage(to, message);
  }

  broadcast(message) {
    if (!this.initialized) return console.log(message);

    for (let subscriber of this.data.subscribers) {
      this.bot.sendMessage(subscriber, message);
    }
  }

}
