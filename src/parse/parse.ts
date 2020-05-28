import axios from "axios";
import cheerio from "cheerio";

import { Word, Article, Relation } from '../db/db';
interface link {
    link: string,
    sourse: string,
}
interface article {
    title: string,
    sourse: string,
    link: string,
    articleHtml: string,
    articleText: string,
    keyWords: string[],
    description: string
}

export const ParseArticlesByWords = async (words:string[])=>{
    for (let i = 0; i < words.length; i++) {
        await ParseWords(words[i])
    }
}

export const GetArticlesByWords = async (words:string[]) =>{
    let unSortArticlesId: any  = []
    let sortArticles: object[] = []
    for (let i = 0; i < words.length; i++) {
        await Word.findOne({where:{word:words[i]}})
            .then(async(word:any)=>{
               console.log(word.word);
               await word.getArticles().then((articles:any)=>{
                    articles.forEach((article:any) => {
                        let find = false
                        unSortArticlesId.forEach((unSortArticleId:any) => {
                            if(unSortArticleId[0]==article.dataValues.id){
                                unSortArticleId[1]++
                                find = true
                            }
                        });
                        if(!find){
                            unSortArticlesId.push([article.id, 1]);
                        }
                    });
               })    
            })
    }

    unSortArticlesId.sort((a:any,b:any)=>{
        return b[1]-a[1]
    })
    
    let sortArticlesId = unSortArticlesId.slice(0, 10);
    for (let i = 0; i < sortArticlesId.length; i++) {
        await Article.findByPk(sortArticlesId[i][0]).
            then((article:any)=>{
                sortArticles.push(article.dataValues)
            })
    }
    return sortArticles
}

const ParseWords = async (word:string)=>{
    let links : link[] =[]
    links.push(...(await habrParseLinks(word)))
    ///
    const articles = await articlesParse(links)
    await AddArticlesToDB(articles)
}

const habrParseLinks = async (word: string) => {
    const links =  await axios
    .post(
      `https://habr.com/ru/search/?target_type=posts&q=${encodeURI(word)}&order_by=relevance`
    )
    .then(async (data) => {
      var $ = cheerio.load(data.data);
      var links: link[] = []
      $('.post_preview .post__title a').each(function (i, elem) {
        links.push({link:$(elem).attr('href')+'',sourse:'Habr'})
      });
      return links
    })
  return links;
};

const articlesParse = async (links: link[]) => {
    let articles: article[] = [];
    await Promise.all(links.map(async (link:link) => {
        await axios.post(
            link.link
            )
            .then((data) => {
                let article: article = {title: '',sourse: '',link: '',articleText:'',articleHtml:'',keyWords:[],description:''}
                article.link =  link.link
                article.sourse = link.sourse
                var $ = cheerio.load(data.data);
                switch (link.sourse){
                    case 'Habr' :{
                        article.title = $('.post__title-text').text()
                        article.articleHtml = String($('.post__text-html').html())
                        article.articleText = $('.post__text-html').text()
                        article.description = String($('meta[name="description"]').attr('content'))
                        article.keyWords = ((String($('meta[name="keywords"]').attr('content'))).replace(/,/g, '')).split(' ')
                        break
                    }
                }
                articles.push(article)
            })
        }))
  return articles;
};

const AddArticlesToDB = async (articles: article[]) => {
  for (let i = 0; i < articles.length; i++) {
    await Promise.all(
      articles[i].keyWords.map(async (keyword: string) => {
        await Word.findOne({ where: { word: keyword } }).then(
          (word: object) => {
            if (!word) {
              Word.create({ word: keyword });
            }
          }
        );
      })
    );
  }

  for (let i = 0; i < articles.length; i++) {
    try {
      await Article.findOne({ where: { title: articles[i].title } }).then(
        async (findArticle: any) => {
          if (!findArticle) {
            await Article.create({
              articleHtml: articles[i].articleHtml,
              articleText: articles[i].articleText,
              preArticle: articles[i].description,
              sourse: articles[i].sourse,
              link: articles[i].link,
              title: articles[i].title,
            }).then(async (newArticle: any) => {
              await Promise.all(
                articles[i].keyWords.map((keyWord: string) => {
                  Word.findOne({ where: { word: keyWord } }).then(
                    (word: any) => {
                      word.addArticle(newArticle);
                    }
                  );
                })
              );
            });
          }
        }
      );
    } catch (e) {
      console.log(e);
    }
  }
};

