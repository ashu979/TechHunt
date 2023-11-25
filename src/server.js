const express = require('express')
const app = express()
const mongoose = require('mongoose')
const flash = require('connect-flash')
const session = require('express-session')
const passport = require('passport')
const MongoDBStore = require('connect-mongodb-session')(session);
const User = require('./models/User.js');
const ejs = require('ejs');
// import Toastify from 'toastify-js';
const Toastify = require('toastify-js');
// import "toastify-js/src/toastify.css";

require('dotenv').config()
require('./passport')(passport);

mongoose.connect(process.env.DB_LINK, {
  useUnifiedTopology: true,
  useNewUrlParser: true
}, () => { console.log('db connected'); })

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

const store = new MongoDBStore({
  uri: process.env.DB_LINK,
  collection: 'sessions',
  ttl: 4 * 60,
  autoRemove: 'native'
});



// store.on('error', (error) => {
//   console.error('Session store error:', error);
// });

// const timeToExpire = 1000*60*2;

// const store=  new MongoDBStore({
//   uri: process.env.DB_LINK,
//   collection: 'session',
//   ttl: timeToExpire
// })

app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false,
  store: store,
  cookie: { maxAge: 1000 * 60 * 5 }
}));



/*const sessionId ="_34cPa0PrN9xty5mUPcsjF8Z8uNF9Fzp";
store.destroy(sessionId, function (err) {
  if (err) {
    console.log('Error deleting session:', err);
  } else {
    console.log('Session deleted successfully');
  }
});*/

app.use(function (req, res, next) {
  if (req.session && req.session.cookie && !req.session.cookie.expires) {
    console.log('Session expired!');
    // You can perform additional actions here when the session expires
  }
  next();
});
// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});


const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb+srv://admin-ashish:TEST123@cluster0.l1ryp.mongodb.net/?retryWrites=true&w=majority';
const dbName = 'test';

// const client = new MongoClient(url);
// const db = client.db(dbName);
// Get the reference to the "ques" collection
// const ques = db.collection('ques');

const getArray = async (req, res) => {
  try {
    const client = await MongoClient.connect(url);
    const db = client.db(dbName);

    // Get the reference to the "ques" collection
    const ques = db.collection('ques');

    const myData = await ques.find().toArray();

    // console.log('Documents in the "ques" collection:', myData);
    // Perform further operations with the "ques" array here

    // Close the database connection
    client.close();
    res.locals.myData = myData;
    // next();
    // res.send(myData); // Send the retrieved data as the response
  } catch (err) {
    console.error('Error retrieving documents from the collection:', err);
    res.status(500).send('Internal Server Error');
  }
};

// game page routes

// Routes
app.use('/', (req, res, next) => {
  getArray(req, res)
    .then(() => next())
    .catch(next);
});

app.post('/login',
  passport.authenticate('local', {
    failureRedirect: '/',
    failureFlash: true,
  }), async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    app.locals.myEmail = req.body.email;
    user.role === "Admin" ? res.redirect("/dashboard-admin") : res.redirect('/dashboard-user');
  }
);

app.get('/game1', (req, res) => {
  res.render('game1', { myData: res.locals.myData, gameCount });
});

app.get('/game2', (req, res) => {
  res.render('game2', { myData: res.locals.myData, gameCount });
});
app.get('/game3', (req, res) => {
  res.render('game3', { myData: res.locals.myData, gameCount });
});

app.get('/game4', (req, res) => {
  res.render('game4', { myData: res.locals.myData, gameCount });
});

app.get('/final', (req, res) => {
  res.render('final', { myData: res.locals.myData, gameCount });
});

app.get('/partials/messages', (req, res) => {
  res.render('partials/messages');
});

let gameCount = 1;
let chances = 0;
app.post('/check-answer', async (req, res) => {
  let errors = []
  if (chances == 3) {
    console.log("Sorry, No more chances.");
    chances = 0;
    gameCount=1;
    errors.push({msg:"No more chances, Try Again !"})
    // return res.redirect('/');
    return res.render('landing',{errors})
  }
  const userAnswer = req.body.exampleRadios; // Get the selected radio button value
  const correctAnswer = req.body.correctAnswer; // Get the correct answer value from the hidden input field
  if (userAnswer === correctAnswer) {
    // User's answer is correct
    const client = await MongoClient.connect(url);
    const db = client.db(dbName);
    const users = db.collection('users');
    if (gameCount == 1) {
      users.updateOne({ email: app.locals.myEmail }, {
        $set: { "answerRecord.ques1": chances + 1 }
      });
    } else if (gameCount == 2) {
      users.updateOne({ email: app.locals.myEmail }, {
        $set: { "answerRecord.ques2": chances + 1 }
      });
    } else if (gameCount == 3) {
      users.updateOne({ email: app.locals.myEmail }, {
        $set: { "answerRecord.ques3": chances + 1 }
      });
    } else {
      users.updateOne({ email: app.locals.myEmail }, {
        $set: { "answerRecord.ques4": chances + 1 }
      });
    }
    chances = 0;
    console.log('Congratulations! Your answer is correct.');
    if(gameCount==4){
      res.redirect('/final');
    }else {
      gameCount++;
      const nextGameUrl = '/game' + gameCount;
      res.redirect(nextGameUrl);
    }
  } else {
    // User's answer is incorrect
    chances++;
    // console.log("Sorry, your answer is incorrect.");
    // res.render('partials/messages', { msg: req.flash('error_msg',
    // 'Sorry , your answer is incorrect !') 
    // });
    errors.push({msg:`Your answer is incorrect ,${3-chances} more chances left !`});
    // errors.push({msg:"Your answer is incorrect! "});
    const nextGameUrl = 'game' + gameCount;
    // res.redirect(nextGameUrl);
    return res.render(nextGameUrl,{errors});
  }
});



app.use('/', require('./routes/users.js'))
app.listen(process.env.PORT, console.log(`Server running on  ${process.env.PORT}`))