function sanitizeOutputMultiple(article) {
  const newTagList = [];
  for (let t of article.dataValues.Tags) {
    newTagList.push(t.name);
  }
  delete article.dataValues.Tags;
  article.dataValues.tagList = newTagList;

  let user = {
    username: article.dataValues.User.username,
    email: article.dataValues.User.email,
    bio: article.dataValues.User.bio,
    image: article.dataValues.User.image,
  };

  delete article.dataValues.User;
  article.dataValues.author = user;

  return article;
}

module.exports = { sanitizeOutputMultiple };
