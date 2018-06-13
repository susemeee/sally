
import { TelegramBot } from "./bot";

export default class TelegramReporter {
  /**
   * @param {TelegramBot} telegramBot
   */
  constructor (telegramBot) {
    this.telegramBot = telegramBot;
    // default - higher than info
    this.maxReportLevel = 2;
  }

  formatTag (logObj) {
    return `[${logObj.date.toLocaleTimeString().toUpperCase()}][${logObj.type.toUpperCase()}]`;
  }

  log (logObj) {
    if (logObj.level > this.maxReportLevel) return;

    let l = [this.formatTag(logObj)];

    if (logObj.scope) {
      l.push(`[${logObj.scope}]`);
    }

    l.push(logObj.message);

    if (logObj.additional) {
      l.push(logObj.additional);
    }

    this.telegramBot.sendTo(this.telegramBot.adminId, l.join(' '));

  }
}
