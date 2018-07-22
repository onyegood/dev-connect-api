const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

//Routes
const users = require('./routes/api/users');
const profile = require('./routes/api/profile');
const posts = require('./routes/api/posts');
//Routes

const app = express();

//Body Parser middleware
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());


//DB Config
const db = require('./config/keys').mongoURI;


//Connect to Mongo DB
mongoose
.connect(db, { useNewUrlParser: true })
.then(() => console.log('MongoDB Connected'))
.catch(error => console.log(error));

app.get('/', (req, res) => res.send('Hello, World'));


//Use Route
app.use('/api/users', users);
app.use('/api/profile', profile);
app.use('/api/posts', posts);
//Use Route

//Deployment setting process.env.PORT allow you to deploy to heroku while 5000 allow you to run it on localhost
const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server running on port ${port}`));