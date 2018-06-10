
import _ from 'lodash';

class Handler {
  static onText(match) {
    return function (target, name, { value }) {
      const _cls = target.constructor;

      // for (let [ listenerName, matchRe, func ] of Handler._handlers)
      _cls._handlers.push(['onText', match, value]);
    };
  }
}


export default class TelegramHandler extends Handler {

  static _handlers = [];

  @Handler.onText(/\/subscribe$/)
  onSubscribe({ chat }) {
    this.data.subscribers = _.union(this.data.subscribers, [ chat.id ]);
    console.log(`${chat.id} subscribed`);
    this.bot.sendMessage(chat.id, 'subscribed.');
  }

  @Handler.onText(/\/unsubscribe/)
  onUnsubscribe({ chat }) {

    _.remove(this.data.subscribers, s => s === chat.id);

    this.methods.log(`${chat.id} unsubscribed`);
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

  static get handlers() {
    return this._handlers;
  }
}
