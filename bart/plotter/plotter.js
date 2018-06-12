
import puppeteer from 'puppeteer';
import consola from 'consola';

import fs from 'fs';
import path from 'path';

export default class Plotter {


  constructor() {
    this.browser = null;
    this.page = null;
    this.error = consola.withScope('Plotter');
  }

  get VIEWPORT() {
    return {
      width: 1280,
      height: 960,
      deviceScaleFactor: 2,
    };
  }

  async initRenderer(headless = true) {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: headless
      });
    }
    this.page = await this.browser.newPage();

    // logging page error
    this.page.on('pageerror', e => this.logger.error(e));

    await this.page.setViewport(this.VIEWPORT);
    await this.page.goto(this._getDataUri(fs.readFileSync(path.join(__dirname, 'template.html'))));
  }

  async closeRenderer() {
    await this.page.close();
  }

  _getDataUri(html) {
    return `data:text/html,${encodeURIComponent(html.toString())}`;
  }

  async renderData(execFunction, execParams, screenshotPath = 'screenshot.png') {
    // TODO: re-using browser
    await this.initRenderer();

    await this.page.evaluate(execFunction, ...execParams);
    await this.page.screenshot({
      path: screenshotPath,
    });

    await this.closeRenderer();
  }

}