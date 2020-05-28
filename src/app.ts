import express, {
  Request,
  Response
} from "express";
import { sign } from 'jsonwebtoken';
import bodyParser from "body-parser";
import cors from "cors";
import { ParseArticlesByWords, GetArticlesByWords } from "./parse/parse";
import { addDefinition, getAllTermins, changeTermin } from "./term/term";
import { data } from "./data";
import { getKeyWords } from "./mystem";
import { login, password, secret } from "./config/config";
import { authMiddleWare } from "./middleware/auth";
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

app.post('/login', async (req: Request, res: Response) => {
  const isVlid = req.body.login === login && req.body.password === password;
  if (isVlid) {
    const token = sign({ login, password  }, secret)
    res.json({ token })
  } else {
    res.status(401).json({ error: "Не верный логин или пароль" })
  }
})

app.put('/termin',authMiddleWare, async (req: Request, res: Response) => {
  const { termin, definition } = req.body;
  await changeTermin(termin, definition);
  res.send({ success: true })
})

app.get('/termin',authMiddleWare, async (req: Request, res: Response) => {
  const { from, to } = req.query;
  const data = await getAllTermins(Number(from + '1'), Number(to + '1'));
  res.send(data);
})

app.post('/termin/add',authMiddleWare, async (req: Request, res: Response) => {
  const { termin, definition } = req.body;
  const result = await addDefinition(termin, definition);
  res.send({ success: 'Success' })
});

app.post('/termin' , async (req: Request, res: Response) => {
  const { question } = req.body;
  const keyWords = await getKeyWords(question);

  res.send(req.body);
})


app.ws('/addArticles',authMiddleWare,async (ws:any,req:Request, res:Response)=>{
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
  // await ParseArticlesByWords(keyWords);
  const articles = await GetArticlesByWords(keyWords);
  res.send(articles);
});

app.listen(80);