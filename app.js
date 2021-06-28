const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const cors = require('cors');
// const port = 4000;
const app = express();
const LocalStrategy = require('passport-local');
const passportLocalMongoose = require('passport-local-mongoose');
const User = require('./models/user');

app.use(cors());

mongoose.connect('mongodb://localhost/auth_demo_ejs', {
  useCreateIndex: true,
  useFindAndModify: false,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(
  require('express-session')({
    secret: 'Any normal Word', //decode or encode session
    resave: false,
    saveUninitialized: false,
  })
);

// app.listen(port, () => {
//     console.log(`Application listening on port ${port}`);
// });

app.use(
  require('express-session')({
    secret: 'Any normal Word', //decode or encode session
    resave: false,
    saveUninitialized: false,
  })
);

// Passport settings
passport.serializeUser(User.serializeUser()); //session encoding
passport.deserializeUser(User.deserializeUser()); //session decoding
passport.use(new LocalStrategy(User.authenticate()));
app.use(passport.initialize());
app.use(passport.session());

app.use(express.urlencoded({ extended: true }));

// Set up View Engine to use EJS
app.set('view engine', 'ejs');

//=======================
//      R O U T E S
//=======================

app.get('/', (req, res) => {
  res.render('home');
});

app.get('/userprofile', isLoggedIn, (req, res) => {
  res.render('userprofile');
});

//Auth Routes
app.get('/login', (req, res) => {
  res.render('login');
});
app.post('/login', passport.authenticate('local', {
    successRedirect: '/userprofile',
    failureRedirect: '/login',
  }),
  function (req, res) {}
);

app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', (req, res) => {
  User.register(
    new User({
      username: req.body.username,
      phone: req.body.phone,
      telephone: req.body.telephone,
    }),
    req.body.password,
    function (err, user) {
      if (err) {
        console.log(err);
        res.render('register');
      }
      passport.authenticate('local')(req, res, function () {
        res.redirect('/login');
      });
    }
  );
});

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

//Listen On Server
app.listen(process.env.PORT || 3000, function (err) {
  if (err) {
    console.log(err);
  } else {
    console.log('Server Started At Port 3000');
  }
});
