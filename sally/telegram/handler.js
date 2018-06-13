
import _ from 'lodash';
import consola from 'consola';

import Tradebot from '../tradebot';

class Handler {

  static _handlers = [];

  static onText(match) {
    return function (target, name, { value }) {
      const _cls = target.constructor;

      // for (let [ listenerName, matchRe, func ] of Handler._handlers)
      _cls._handlers.push(['onText', match, value]);
    };
  }

  static get handlers() {
    return this._handlers;
  }
}


export default class TelegramHandler extends Handler {

  @Handler.onText(/\/subscribe$/)
  onSubscribe({ chat }) {
    this.data.subscribers = _.union(this.data.subscribers, [ chat.id ]);
    consola.info(`${chat.id} subscribed`);
    this.bot.sendMessage(chat.id, 'subscribed.');
  }

  @Handler.onText(/\/unsubscribe/)
  onUnsubscribe({ chat }) {

    _.remove(this.data.subscribers, s => s === chat.id);

    consola.info(`${chat.id} unsubscribed`);
    this.bot.sendMessage(chat.id, 'unsubscribed.');
  }

  @Handler.onText(/\/(fetch|f) ([^\s]+) ?(\d+)?/)
  async onFetchRequest({ chat }, match) {

    const currency = (match[2] || '').toUpperCase();
    const n = match[3];

    new Promise((resolve, reject) => {

      Tradebot.EVENT_BUS.emit(Tradebot.EVENT_FETCH_REQUEST, {
        currency: currency,
        n: n,
      });

      Tradebot.EVENT_BUS.once(Tradebot.EVENT_FETCH_RESPONSE, (err, response) => {
        if (err) return reject(err);
        return resolve(response.screenshotPath);
      });

    })
    .then(screenshotPath => {
      this.sendImage(chat.id, screenshotPath, currency);
    })
    .catch(err => {
      consola.error(err);
      this.bot.sendMessage(chat.id, `Fetch error. ${currency}.`);
    });

  }

  @Handler.onText(/\/ping/)
  onPing({ chat }) {
    this.bot.sendMessage(chat.id, 'pong');
  }

  /**
   * admin features
   */
  @Handler.onText(/\/subscriberscount/)
  onSubscribersCount({ chat }) {
    this.bot.sendMessage(chat.id, this.data.subscribers.length);
  }

  @Handler.onText(/\/announce (.+)/)
  onAnnouncement({ chat }, content) {
    if (!content) {
      return this.bot.sendMessage(chat.id, '/announce {{content}}');
    }

    for (let subscriber of this.subscribers) {
      this.bot.sendMessage(subscriber, content);
    }

    this.bot.sendMessage(chat.id, 'broadcasted.');
  }
}
