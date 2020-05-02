import Axios from "axios";
import cheerio from 'cheerio';
import { Page, Browser } from 'puppeteer';





export const getKeyWords = async (question: string, browser: Browser) => {
    let page = await browser.newPage();
    await page.goto(`https://wordstat.yandex.ru/#!/?words=${question}`);
    await page.waitForSelector('.b-word-statistics__td.b-word-statistics__td-phrase .b-phrase-link.i-bem.b-phrase-link_js_inited a');
    let content = await page.content();
    let $ = cheerio.load(content);
    let data = $('.b-word-statistics__td.b-word-statistics__td-phrase .b-phrase-link.i-bem.b-phrase-link_js_inited a');
    page.close();
    console.log(data[0].children[0].data);
    return data[0].children[0].data;
}