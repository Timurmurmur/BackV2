import express, { Request, Response } from "express";

import bodyParser from "body-parser";
import puppeteer, { Browser } from 'puppeteer';
import cors from "cors";
// import { getKeyWords } from "./nlp/nlp";
import { getKeyWords,  } from "./mystem";
import { ParseArticlesByWords } from './parse/parse'
const app:any = express();

let expressWs = require('express-ws')(app);

// let browser = puppeteer.launch({
//   headless: false
// }).then((browser) => {
//   initLogin(browser);
//   return browser;
// });

// const initLogin = async (browser: Browser) => {
//   const page = await browser.newPage();
//   const url = "https://wordstat.yandex.ru/#!/?words=";
//   const login = '***';
//   const pass = '***';
//   const loginSelector = "#b-domik_popup-username";
//   const passSelector = "#b-domik_popup-password";

//   await page.goto(`${url}test`);
//   await page.waitForSelector(loginSelector);
//   await page.type(loginSelector,login);
//   await page.waitForSelector(loginSelector);
//   await page.type(passSelector, pass);
//   setTimeout(async () => {
//     await page.click('.b-domik__button .b-form-button.b-form-button_size_m.b-form-button_theme_grey-m.b-form-button_valign_middle.i-bem.b-form-button_js_inited span.b-form-button__content');
//   }, 1000);
//   await page.content();
// }


app.use(
  cors({
    allowedHeaders: ["sessionId", "Content-Type"],
    exposedHeaders: ["sessionId"],
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false
  })
);

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

app.ws('/addTermins',async (ws:any,req:Request, res:Response)=>{
  ws.on('message',async (data:any)=>{
    let sendsData = JSON.parse(data)
    console.log(sendsData);
    ws.send(await ParseArticlesByWords(sendsData.words))
    ws.close()
  })
})

app.get('/word', async (req: Request, res: Response) => {
  const message = 'Как правильно настроить linux';
  const keyWords = await getKeyWords(message);
  res.send(keyWords);
});

app.listen(80);