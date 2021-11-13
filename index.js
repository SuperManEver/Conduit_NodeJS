const dotenv = require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const { notFound, errorHandler } = require('./middleware/errorHandler');
const sequelize = require('./dbConnection');

const { Article, User, Tag, Comment } = require('./models');

const userRoute = require('./routes/users');
const articleRoute = require('./routes/articles');
const commentRoute = require('./routes/comments');
const tagRoute = require('./routes/tags');
const profileRoute = require('./routes/profile');
const favouriteRoute = require('./routes/favourites');

const app = express();

//CORS
app.use(cors({ credentials: true, origin: true }));

// what this does??
const sync = async () => await sequelize.sync({ alter: true });
sync();

app.use(express.json());
app.use(morgan('tiny'));

app.get('/', (req, res) => {
  res.json({ status: 'API is running' });
});
app.use('/api', userRoute);
app.use('/api/articles', articleRoute);
app.use('/api/articles', commentRoute);
app.use('/api/tags', tagRoute);
app.use('/api/profiles', profileRoute);
app.use('/api/articles', favouriteRoute);
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:8080`);
});
