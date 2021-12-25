const { User, Tag, Article } = require('../models');
const { slugify } = require('../utils/stringUtil');
const { sequelize } = require('../services/db');

const { sanitizeOutputMultiple } = require('./serializers');

function sanitizeOutput(article, user) {
  const newTagList = [];
  for (let t of article.dataValues.Tags) {
    newTagList.push(t.name);
  }
  delete article.dataValues.Tags;
  article.dataValues.tagList = newTagList;

  if (article) {
    delete user.dataValues.password;
    delete user.dataValues.email;
    delete user.dataValues.following;
    article.dataValues.author = user;
    return article;
  }
}

async function createArticle(req, res) {
  try {
    if (!req.body.article) throw new Error('No articles data');
    const data = req.body.article;
    if (!data.title) throw new Error('Article title is required');
    if (!data.body) throw new Error('Article body is required');
    if (!data.description) throw new Error('Article description is required');

    // Find out author object
    const user = await User.findByPk(req.user.email);

    if (!user) {
      throw new Error('User does not exist');
    }

    const slug = slugify(data.title);

    let article = await Article.create({
      slug: slug,
      title: data.title,
      description: data.description,
      body: data.body,
      UserEmail: user.email,
    });

    if (data.tagList) {
      for (let t of data.tagList) {
        let tagExists = await Tag.findByPk(t);
        let newTag;
        if (!tagExists) {
          newTag = await Tag.create({ name: t });
          article.addTag(newTag);
        } else {
          article.addTag(tagExists);
        }
      }
    }

    article = await Article.findByPk(slug, { include: Tag });
    article = sanitizeOutput(article, user);
    res.status(201).json({ article });
  } catch (e) {
    return res.status(422).json({
      errors: { body: ['Could not create article', e.message] },
    });
  }
}

async function getSingleArticleBySlug(req, res) {
  try {
    const { slug } = req.params;

    let article = await Article.findByPk(slug, { include: Tag });

    const user = await article.getUser();

    article = sanitizeOutput(article, user);

    res.status(200).json({ article });
  } catch (e) {
    return res.status(422).json({
      errors: { body: ['Could not get article', e.message] },
    });
  }
}

async function updateArticle(req, res) {
  try {
    if (!req.body.article) throw new Error('No articles data');
    const data = req.body.article;
    const slugInfo = req.params.slug;
    let article = await Article.findByPk(slugInfo, { include: Tag });

    if (!article) {
      res.status(404);
      throw new Error('Article not found');
    }

    const user = await User.findByPk(req.user.email);

    if (user.email != article.UserEmail) {
      res.status(403);
      throw new Error('You must be the author to modify this article');
    }

    const title = data.title ? data.title : article.title;
    const description = data.description
      ? data.description
      : article.description;
    const body = data.body ? data.body : article.body;
    const slug = data.title ? slugify(title) : slugInfo;

    const updatedArticle = await article.update({
      slug,
      title,
      description,
      body,
    });

    article = sanitizeOutput(updatedArticle, user);
  } catch (e) {
    const code = res.statusCode ? res.statusCode : 422;
    return res.status(code).json({
      errors: { body: ['Could not update article', e.message] },
    });
  }
}

async function deleteArticle(req, res) {
  try {
    const slugInfo = req.params.slug;
    let article = await Article.findByPk(slugInfo, { include: Tag });

    if (!article) {
      res.status(404);
      throw new Error('Article not found');
    }

    const user = await User.findByPk(req.user.email);

    if (user.email != article.UserEmail) {
      res.status(403);
      throw new Error('You must be the author to modify this article');
    }

    await Article.destroy({ where: { slug: slugInfo } });
    res.status(200).json({ message: 'Article deleted successfully' });
  } catch (e) {
    const code = res.statusCode ? res.statusCode : 422;
    return res.status(code).json({
      errors: { body: ['Could not delete article', e.message] },
    });
  }
}

function getTagOptions(tag) {
  if (!tag) {
    return {
      model: Tag,
      attributes: ['name'],
    };
  }

  return {
    model: Tag,
    attributes: ['name'],
    where: { name: tag },
  };
}

function getAuthorOptions(author) {
  if (!author) {
    return {
      model: User,
      attributes: ['email', 'username', 'bio', 'image'],
    };
  }

  return {
    model: User,
    attributes: ['email', 'username', 'bio', 'image'],
    where: { username: author },
  };
}

async function getAllArticles(req, res) {
  try {
    // Get all articles:

    const { tag, author, limit = 20, offset = 0 } = req.query;

    /**
     * @todo: split into subfunctions
     * logic for determining required include attributes can be extracted!
     */

    const article = await Article.findAll({
      include: [getTagOptions(tag), getAuthorOptions(author)],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    /**
     * @todo: looks like serialization
     */
    let articles = [];

    for (let t of article) {
      let addArt = sanitizeOutputMultiple(t);

      articles.push(addArt);
    }

    res.json({ articles, articlesCount: articles.length });
  } catch (e) {
    const code = res.statusCode ? res.statusCode : 422;
    return res.status(code).json({
      errors: { body: ['Could not get all articles', e.message] },
    });
  }
}

async function getFeed(req, res) {
  console.log('getFeed');

  try {
    const query = `
            SELECT UserEmail
            FROM followers
            WHERE followerEmail = "${req.user.email}"`;

    const followingUsers = await sequelize.query(query);
    if (followingUsers[0].length == 0) {
      return res.json({ articles: [] });
    }
    let followingUserEmail = [];
    for (let t of followingUsers[0]) {
      followingUserEmail.push(t.UserEmail);
    }

    let article = await Article.findAll({
      where: {
        UserEmail: followingUserEmail,
      },
      include: [Tag, User],
    });

    let articles = [];
    for (let t of article) {
      let addArt = sanitizeOutputMultiple(t);
      articles.push(addArt);
    }

    res.json({ articles });
  } catch (e) {
    const code = res.statusCode ? res.statusCode : 422;
    return res.status(code).json({
      errors: { body: ['Could not get feed ', e.message] },
    });
  }
}

module.exports = {
  createArticle,
  getSingleArticleBySlug,
  updateArticle,
  deleteArticle,
  getAllArticles,
  getFeed,
  getTagOptions,
  getAuthorOptions,
};
