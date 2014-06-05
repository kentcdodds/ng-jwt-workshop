// Require deps
var express = require('express');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var fs = require('fs');


// Database
var dbFile = './user.json';
if (fs.existsSync(__dirname + '/user.local.json')) {
  dbFile = './user.local.json';
}
var user = require(dbFile);
var userPassword = user.password;
delete user.password;

// setup server
var app = express();
app.use(cookieParser());
app.use(session({
  name: 'sessionId',
  secret: 'u3i59jldsgj9023458'
}));

app.use(bodyParser());


// setup cors
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  next();
});


// setup passport
passport.use(new LocalStrategy(function(username, password, done) {
  if (username === user.username && password === userPassword) {
    return done(null, user);
  } else {
    done(null, false, { message: 'Incorrect username or password' });
  }
}));

passport.serializeUser(function(user, done) {
  done(null, user.username);
});

passport.deserializeUser(function(username, done) {
  if (username === user.username) {
    done(null, user);
  } else {
    done('No user with username ' + username);
  }
});

app.use(passport.initialize());
app.use(passport.session());

// serve app from server
app.use(express.static(__dirname + '/frontend'));

// setup routes
app.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.json(404, 'No user found...');
    }
    req.logIn(user, function(err) {
      if (err) {
        return next(err);
      }
      return res.json(200, user);
    });
  })(req, res, next);
});

app.get('/logout', function(req, res) {
  req.logout();
  res.json(200, { success: true });
});

app.get('/users/me', function(req, res) {
  if (req.user) {
    res.json(user);
  } else {
    res.json(403, { message: 'Not authorized' });
  }
});

var funnyPicIndex = Math.floor(Math.random()*12);
function getNextFunnyPic() {
  funnyPicIndex++;
  if (funnyPicIndex > 12) {
    funnyPicIndex = 0;
  }
  return __dirname + '/funny-pics/' + funnyPicIndex + '.jpg';
}

app.get('/funny-pic', function(req, res) {
  if (req.user) {
    res.sendfile(getNextFunnyPic());
  } else {
    res.json(403, { message: 'Not authorized' });
  }
});

// listen on port
var server = app.listen(3000, function() {
  var addy = server.address();
  console.log('Server listening at: ', addy.address + ':' + addy.port);
});