const Sequelize = require('sequelize')

const sequelize = new Sequelize('heroku_a0a8202b53d48f8', 'b3d0823c0e716e', 'aefe8fe6', {
    host: 'eu-cdbr-west-02.cleardb.net',
    dialect: 'mysql',
    define: {
        timestamps: false
    },
    logging:false
});

sequelize.authenticate()
    .then(() => console.log('Connected to DB'))
    .catch((err: Error) => console.error('Connection error: ', err));

// sequelize.sync({ force: true })
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
    },
    title: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    articleHtml: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    articleText: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    link: {
        type: Sequelize.STRING,
        allowNull: false
    },
    preArticle: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    sourse:{
        type: Sequelize.STRING,
        allowNull: false
    }
});

const Association = sequelize.define("association", {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    num: {
        type: Sequelize.FLOAT,
        allowNull: false
    }
});

const Relation = sequelize.define("relation", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    }

})

Word.belongsToMany(Association,{through: Relation})
Word.belongsToMany(Article,{through: Relation})
Article.belongsToMany(Word,{through: Relation})


export {Word, Article, Relation,Association}