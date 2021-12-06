require('dotenv').config();

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const { notFound, errorHandler } = require('./middleware/errorHandler');
const { dbConnect } = require('./services/db');
const { PORT } = require('./config');
const { passport, session } = require('./services/passport');

const userRoute = require('./routes/users');
const articleRoute = require('./routes/articles');
const commentRoute = require('./routes/comments');
const tagRoute = require('./routes/tags');
const profileRoute = require('./routes/profile');
const favouriteRoute = require('./routes/favourites');

const app = express();

app.use(session);
app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({ credentials: true, origin: true }));
app.use(morgan('tiny'));

// what this does??
const sync = async () => await dbConnect.sync({ alter: true });
sync();

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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
