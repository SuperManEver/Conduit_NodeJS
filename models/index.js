const User = require('./models/User');
const Article = require('./models/Article');
const Tag = require('./models/Tag');
const Comment = require('./models/Comments');

//RELATIONS:
//1 to many relation between user and article
User.hasMany(Article, {
  onDelete: 'CASCADE',
});
Article.belongsTo(User);

//many to many relation between article and taglist
Article.belongsToMany(Tag, {
  through: 'TagList',
  uniqueKey: false,
  timestamps: false,
});
Tag.belongsToMany(Article, {
  through: 'TagList',
  uniqueKey: false,
  timestamps: false,
});

//One to many relation between Article and Comments
Article.hasMany(Comment, { onDelete: 'CASCADE' });
Comment.belongsTo(Article);

//One to many relation between User and Comments
User.hasMany(Comment, { onDelete: 'CASCADE' });
Comment.belongsTo(User);

//Many to many relation between User and User
User.belongsToMany(User, {
  through: 'Followers',
  as: 'followers',
  timestamps: false,
});

//favourite Many to many relation between User and article
User.belongsToMany(Article, { through: 'Favourites', timestamps: false });
Article.belongsToMany(User, { through: 'Favourites', timestamps: false });

module.exports = {
  Article,
  User,
  Tag,
  Comment,
};
