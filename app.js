const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const cors = require("cors");
const bodyParser = require('body-parser');
const app = express();
const LocalStrategy = require("passport-local");
const passportLocalMongoose = require("passport-local-mongoose");
const User = require("./models/user");
const { render } = require("ejs");
const Movie = require("./models/Movie");

app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

mongoose.connect("mongodb://localhost/auth_demo_ejs", {
  useCreateIndex: true,
  useFindAndModify: false,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(
  require("express-session")({
    secret: "Any normal Word", //decode or encode session
    resave: false,
    saveUninitialized: false,
  })
);

// app.listen(port, () => {
//     console.log(`Application listening on port ${port}`);
// });

app.use(
  require("express-session")({
    secret: "Any normal Word", //decode or encode session
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
app.use(express.static(__dirname + "/public"));
app.use(express.static(__dirname + "/public/css/bootstrap.min.css"));
app.use(express.static(__dirname + "/public/css/styles.css"));

// Set up View Engine to use EJS
app.set("view engine", "ejs");

//=======================
//      R O U T E S
//=======================

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/userprofile", isLoggedIn, (req, res) => {
  res.render("userprofile");
});

//Auth Routes
app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", passport.authenticate("local", {
    successRedirect: "/movies",
    failureRedirect: "/login",
  }),
  function (req, res) {}
);

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
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
        res.render("register");
      }
      passport.authenticate("local")(req, res, function () {
        res.redirect("/login");
      });
    }
  );
});

app.get('/deleteMovie/:id', async (req, res) => {
	try {
    const id = req.params.id;
    const onemovie = await Movie.findById(id).exec();
    res.render('deleteMovie', { movie: onemovie});
  } catch (error) {
    res.status(404).send('Movie with the given Id not found');
  }
});

app.post('/deleteMovie/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const onemovie = await Movie.findByIdAndRemove(id).exec();
    if(!onemovie) return res.status({ message: error });
    res.redirect('/movies');
  } catch (error) {
    res.status(404).send('Movie with the given Id not found');
  }
});

app.get("/add", (req, res) => {
  res.render("add");
});

app.post("/add", (req, res) => {
  const movie = new Movie(req.body);
  movie.save().then((data) => {
    console.log(movie);
    res.redirect("/movies");
  });
});

app.get('/edit/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    const mv = await Movie.findById(id).exec();
    res.render('edit', { movie: mv });
  } catch (error) {
    res.status(400).send(error.message);
  }
});

app.post('/edit/:id', async (req, res, next) => {
  const id = req.params.id;
  const data = req.body;
  let movie = await Movie.findByIdAndUpdate(id, {
    title: data.title,
    director: data.director,
    genre: data.genre,
    release_date: data.release_date
  }, { new: true });
  if(!movie) return res.status(404).send('Movie with the given Id not found');
  res.redirect('/movies');
});

app.get('/movies', (req, res, next) => {
  const lists = Movie.find({}, (err, data ) => {
    if(err) throw err;
    res.render('movies', { lists: data });
  });
});

app.get("/userlist", (req, res) => {
  User.find({}, (err, data) => {
    if (err) throw err;
    res.render("userlist", { users: data });
  });
});

app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

//Listen On Server
app.listen(process.env.PORT || 3000, function (err) {
  if (err) {
    console.log(err);
  } else {
    console.log("Server Started At Port 3000");
  }
});
