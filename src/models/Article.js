const { DataTypes } = require('sequelize');
const { sequelize } = require('../services/db');

const Article = sequelize.define('Article', {
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  body: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
});

Article.addFavoriteArticle = ({ userEmail, articleSlug }) => {
  console.log(userEmail, articleSlug);

  try {
    const query = `INSERT INTO "Favourites" ("UserEmail", "ArticleSlug")
    VALUES ("${userEmail}", "${articleSlug}");`;

    return sequelize.query(query);
  } catch (err) {
    console.error('Article.addFavoriteArticle() ', err);
  }
};

module.exports = Article;

/*
```JSON
{
  "article": {
    "slug": "how-to-train-your-dragon",
    "title": "How to train your dragon",
    "description": "Ever wonder how?",
    "body": "It takes a Jacobian",
    "tagList": ["dragons", "training"],
    "createdAt": "2016-02-18T03:22:56.637Z",
    "updatedAt": "2016-02-18T03:48:35.824Z",
    "favorited": false,
    "favoritesCount": 0,
    "author": {
      "username": "jake",
      "bio": "I work at statefarm",
      "image": "https://i.stack.imgur.com/xHWG8.jpg",
      "following": false
    }
  }
}
```
*/
