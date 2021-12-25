const express = require('express');
const router = express.Router();

const { passport } = require('../services/passport');

const { authByToken } = require('../middleware/auth');

const ArticleController = require('../controllers/articles');

router.get('/', ArticleController.getAllArticles); //Get most recent articles from users you follow
router.get('/feed', authByToken, ArticleController.getFeed); //Get most recent articles globally

router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  ArticleController.createArticle,
); // Create an article

router.get('/:slug', ArticleController.getSingleArticleBySlug); //Get an article
router.patch(
  '/:slug',
  passport.authenticate('jwt', { session: false }),
  ArticleController.updateArticle,
); //Update an article

router.delete(
  '/:slug',
  passport.authenticate('jwt', { session: false }),
  ArticleController.deleteArticle,
); //Delete an article

module.exports = router;
