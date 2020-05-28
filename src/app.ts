import express, {
  Request,
  Response
} from "express";

import bodyParser from "body-parser";
import cors from "cors";
import { ParseArticlesByWords, GetArticlesByWords } from "./parse/parse";
import { addDefinition } from "./term/term";
import { data } from "./data";
// import { getKeyWords } from "./nlp/nlp";
import { getKeyWords,  } from "./mystem";
const app:any = express();

let expressWs = require('express-ws')(app);


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

app.put('/termin', async (req: Request, res: Response) => {
  const { termin, definition } = req.body;
  console.log(typeof termin, typeof definition);
  console.log();
  res.send({ success: true })
})

app.post('/termin' , async (req: Request, res: Response) => {
  const { question } = req.body;
  const keyWords = await getKeyWords(question);

  res.send(req.body);
})


app.ws('/addTermins',async (ws:any,req:Request, res:Response)=>{
  ws.on('message',async (data:any)=>{
    let sendsData = JSON.parse(data)
    console.log(sendsData);
    ws.send(await ParseArticlesByWords(sendsData.words))
    ws.close()
  })
})

app.get('/word', async (req: Request, res: Response) => {
  const message = 'Что такое html';
  const keyWords = await getKeyWords(message);
  await ParseArticlesByWords(keyWords);
  // const articles = await GetArticlesByWords(keyWords);
  // res.send(articles);
});

app.listen(80);