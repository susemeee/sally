
import _ from 'lodash';
import consola from 'consola';

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

  @Handler.onText(/\/(fetch|f) (.+)/)
  async onFetchRequest({ chat }, match) {

    const currency = match[2];
    const response = await this._onFetchRequest(currency);
    if (!response) {
      this.bot.sendMessage(chat.id, `Invalid request: ${currency}.`);
    } else {
      this.bot.sendMessage(chat.id, response);
    }
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
