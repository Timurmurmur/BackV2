import { Sequelize, DataTypes, Model } from 'sequelize';

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

sequelize.sync();

class Word extends Model {}
class Article extends Model {}
class Term extends Model {}
class Definition extends Model {}
class Association extends Model {}
class Relation extends Model {}

Word.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    word: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    sequelize,
    modelName: "word"
})

Article.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    title: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    articleHtml: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    articleText: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    link: {
        type: DataTypes.STRING,
        allowNull: false
    },
    preArticle: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    sourse:{
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    sequelize,
    modelName: "article",
})

Term.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    termin: {
        type: DataTypes.TEXT,
        allowNull: false
    },
}, {sequelize, modelName: "term"})

Definition.init({
    id: {
        primaryKey: true,
        type: DataTypes.INTEGER,
        autoIncrement: true
    },
    definition: {
        type: DataTypes.TEXT,
        allowNull: false
    }
}, {
    sequelize,
    modelName: "definition"
})

Association.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    num: {
        type: DataTypes.FLOAT,
        allowNull: false
    }
}, {sequelize, modelName: "association"})

Relation.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    }
}, {
    sequelize,
    modelName: "relation"
})

Definition.hasMany(Term);
Word.belongsToMany(Association,{through: Relation})
Word.belongsToMany(Article,{through: Relation})
Article.belongsToMany(Word,{through: Relation})


export {Word, Article, Relation, Term, Definition}
