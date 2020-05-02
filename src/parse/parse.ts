import axios from "axios";
import cheerio from "cheerio";

import { addArticles, getArticles, wordExist } from '../db/db';



export const Parse = async (word: string) => {
  if (await wordExist(word) == true) {
    let data = await getArticles(word);
    return data;
  } else {
    let articles = await wikiParse(word);
    await addArticles(word, articles);
    let data = await getArticles(word);
    return data;
  }
}

const wikiParse = async (word: string) => {
  let articles = await axios
    .post(
      `https://ru.wikipedia.org/w/index.php?sort=relevance&search=${word}&title=%D0%A1%D0%BB%D1%83%D0%B6%D0%B5%D0%B1%D0%BD%D0%B0%D1%8F:%D0%9F%D0%BE%D0%B8%D1%81%D0%BA&profile=advanced&fulltext=1&advancedSearch-current=%7B%7D&ns0=1`
    )
    .then(async (data) => {
      var $ = cheerio.load(data.data);
      var links: string[] = []
      $('div .mw-search-result-heading a').each(function (i, elem) {
        links.push('https://ru.wikipedia.org' + $(elem).attr('href'));
      });
      let articles = await articlesParse(links);
      return articles;
    });
  return articles;
};

const articlesParse = async (links: string[]) => {
  let articles: any[] = [];
  const pushing = async (link: string) => {
    await axios
      .post(
        link
      )
      .then((data) => {
        var $ = cheerio.load(data.data);
        articles.push({ title: $('#firstHeading').text(), article: $('#mw-content-text').html(), link: link });
      })
  }
  const promises = links.map(pushing);
  await Promise.all(promises)
  return articles;
}

