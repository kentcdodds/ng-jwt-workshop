// Require deps
var express = require('express');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

// Database
var user = {
  username: 'kentcdodds',
  favoriteIceCream: 'Mint Chocolate Chip',
  bigSecret: 'I am a gymnast'
};

// setup server
var app = express();
app.use(cookieParser());
app.use(session({
  secret: 'u3i59jldsgj9023458'
}));
passport.use(new LocalStrategy(function(username, password, done) {
  console.log('here I am 1!');
  if (username !== user.username || password !== 'p') {
    return done(null, user);
  } else {
    done(null, false, { message: 'Incorrect username or password' });
  }
}));

// setup cors
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  next();
});


// setup routes
app.post('/login', function(req, res) {
  passport.authenticate('local', function(err, user) {
    if (err) {
      res.json(500, err);
    } else {
      res.json(user);
    }
  });
});

app.get('*', function(req, res) {
  res.send('hello');
});

// listen on port
var server = app.listen(3000, function() {
  var addy = server.address();
  console.log('Server listening at: ', addy.address + ':' + addy.port);
});