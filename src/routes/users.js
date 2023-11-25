const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
// Load User model
const User = require('../models/User');
const { forwardAuthenticated ,ensureAuthenticated} = require('../auth');

// Login Page
router.get('/login', forwardAuthenticated, (req, res) => res.render('login'));
router.get('/', forwardAuthenticated, (req, res) => res.render('landing'));
// router.get('/dashboard-user', forwardAuthenticated, (req, res) => res.render('index'));

router.get('/dashboard-user', ensureAuthenticated, async(req, res) =>{
  res.render('index', {
    user: req.user,
  })
});

const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb+srv://admin-ashish:TEST123@cluster0.l1ryp.mongodb.net/?retryWrites=true&w=majority';
const dbName = 'test';

router.get('/dashboard-admin', ensureAuthenticated, async(req, res) =>{
  // getUsers(req, res);
  const client = await MongoClient.connect(url);
  const db = client.db(dbName);

  const users = db.collection('users');
  const myUsers = await users.find({role:"User"}).toArray();
  client.close();
  res.locals.myUsers = myUsers;
  console.log(myUsers);
  res.render('adminLanding', {
    // myUsers: res.locals.myUsers,
    myUsers,
  })
});

// Register Page
router.get('/register', forwardAuthenticated, (req, res) => res.render('register'));
// Register
router.post('/register', (req, res) => {
  try{
  const { name, email, password, password2,role } = req.body;
  console.log(req.body);
  let errors = [];

  if (!name || !email || !password || !password2) {
    errors.push({msg:"All field are required"});
  }
  
  if (password != password2) {
    errors.push({msg:"Passwords do not match"});
  }
  
  if (password.length < 6) {
    errors.push({msg:"Password must be at least 6 characters"});
  }

  if (errors.length > 0) {
    res.render('register', {
      errors,
      name,
      email,
      password,
      password2
    });
  } else {
    User.findOne({ email: email }).then(user => {
      if (user) {
        errors.push({msg:"Email already Exists"});
        res.render('register', {
          errors,
          name,
          email,
          password,
          password2
        });
      } else {
        const newUser = new User({
          name,
          email,
          password,
          role
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then(user => {
                req.flash(
                  'success_msg',
                  'You are now registered and can log in'
                );
                res.redirect('/login')
              })
              .catch(err => console.log(err));
          });
        });
      }
    });
  }
}
  catch(err){
    console.log(err);
    res.status(200).send({"result":"Some error occured"});
  }
});

// Login
// router.post('/login', 
//   passport.authenticate('local', {
//     failureRedirect: '/',
//     failureFlash: true,
//   }), async (req, res) => {
//     const user = await User.findOne({email: req.body.email});
//     app.locals = {
//       myEmail: req.body.email,
//     };
//     user.role === "Admin" ? res.redirect("/dashboard-admin") : res.redirect('/dashboard-user');
//   }
// );

// Logout
router.get('/logout', (req, res) => {
  req.logout(function(){
    req.flash('success_msg', 'You are logged out');
  res.redirect('/');
  });
  
});

module.exports = router;