import axios from "axios";
import cheerio from "cheerio";

import { Word, Article,Relation ,Association } from '../db/db';
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

export const ParseArticlesByWords = async (words: string[]) => {
  for (let i = 0; i < words.length; i++) {
    await ParseWords(words[i])
  }
  await CountAssociationRang()
}

export const GetArticlesByWords = async (words:any)=>{
    let allAssociations:any[] = []
    let allArticles:any[] = []
    for (const word of words) {
        await Word.findOne({where:{word}}).then(async (findWord:any)=>{
            if(!findWord){
              await ParseArticlesByWords(words)
            }
            await findWord.getAssociations().then((associations:any)=>{
                allAssociations.push(...associations)
            })
        })
    }
    allAssociations.sort((a:any,b:any)=>{
        return b.dataValues.num - a.dataValues.num
    })
    console.log(allAssociations);
    for (const association of allAssociations) {
        await Relation.findOne({where:{associationId:association.id}}).then(async (relation:any)=>{
            await Article.findByPk(relation.articleId).then((article:any)=>{
                allArticles.push(article)
            })
        })
    }
    return allArticles
}

export const CountAssociationRang = async ()=>{
  if(!(await Association.count()==0)){
    await Association.destroy({
      where: {},
      truncate: true
    })
  }
  const CountOfArticles = await Article.count()
  await Relation.findAll().then(async(data:any)=>{
    for (const item of data) {
      await Word.findByPk(item.dataValues.wordId).then(async(word:any)=>{
        await word.getArticles().then(async(articles:any)=>{
          const ArticleOfWord = articles.length
          for (const article of articles) {
            await Association.create({num:Math.abs((article.dataValues.articleText.match(new RegExp(word.word, "g")) || []).length*Math.log10(ArticleOfWord/CountOfArticles))}).then(async(association:any)=>{
              await Relation.update({associationId:association.id},{where:{wordId:word.id,articleId:article.dataValues.id}})
            })
          } 
        })
      })
    }
  })
}

const ParseWords = async (word: string) => {
  let links: link[] = []
  links.push(...(await habrParseLinks(word)))
  ///
  const articles = await articlesParse(links)
  await AddArticlesToDB(articles)
}

const habrParseLinks = async (word: string) => {
  const links = await axios
    .post(
      `https://habr.com/ru/search/?target_type=posts&q=${encodeURI(word)}&order_by=relevance`
    )
    .then(async (data) => {
      var $ = cheerio.load(data.data);
      var links: link[] = []
      $('.post_preview .post__title a').each(function (i, elem) {
        links.push({
          link: $(elem).attr('href') + '',
          sourse: 'Habr'
        })
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
                        article.articleText = $('.post__text-html').text().toLowerCase()
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
        await Word.findOne({
          where: {
            word: keyword
          }
        }).then(
          (word: any) => {
            if (!word) {
              Word.create({ word: keyword.toLowerCase() });
            }
          }
        );
      })
    );
  }

  for (let i = 0; i < articles.length; i++) {
    try {
      await Article.findOne({
        where: {
          title: articles[i].title
        }
      }).then(
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
                  Word.findOne({
                    where: {
                      word: keyWord
                    }
                  }).then(
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
