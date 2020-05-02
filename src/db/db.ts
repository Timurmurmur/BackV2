import { exists } from "fs";

const Sequelize = require('sequelize')


const sequelize = new Sequelize('heroku_a0a8202b53d48f8', 'b3d0823c0e716e', 'aefe8fe6', {
    host: 'eu-cdbr-west-02.cleardb.net',
    dialect: 'mysql',
    define: {
        timestamps: false
    }
});

let start = sequelize.authenticate()
    .then(() => console.log('Connected to DB'))
    .catch((err: Error) => console.error('Connection error: ', err));

const Word = sequelize.define("word", {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    word: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

const Article = sequelize.define("article", {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    title: {
        type: Sequelize.STRING,
        allowNull: false
    },
    article: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    link: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

Word.hasMany(Article, {
    onDelete: "cascade"
});

const addArticles = async (word: string, articles: any[]) => {
    Word.create({
        word: word
    }).then(async (res: any) => {
        const wordId = res.id;

        async function pushing(this: any, article: any) {
            await Article.create({
                title: article.title,
                link: article.link,
                article: article.article,
                wordId: this.wordId
            }).catch((err: Error) => console.log(err));
        }

        const promises = articles.map(pushing, {
            wordId: wordId
        });
        await Promise.all(promises)
        console.log("OK");
    }).catch((err: Error) => console.log(err));
}

const wordExist = async (word: string) => {
    let exists = await Word.findOne({
        where: {
            word: word
        }
    }).then((Word: any) => {
        if (!Word) {
            return false;
        } else {
            return true;
        }
    }).catch((err: Error) => console.log(err));
    return exists;
}

const getArticles = async (word: string) => {
    let articlesReturn;
    await Word.findOne({
        where: {
            word: word
        }
    }).then(async (Word: any) => {
        await Article.findAll({
            where: {
                WordId: Word.id
            },
            raw: true
        }).then((articles: any[]) => {
            articlesReturn = articles;
        }).catch((err: Error) => console.log(err));
    }).catch((err: Error) => console.log(err));
    return articlesReturn;
}

export { addArticles, getArticles, wordExist };