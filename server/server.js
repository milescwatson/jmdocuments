/*jshint node:true */
/*global require */
'use strict';

var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    compression = require('compression'),
    passport = require('passport'),
    session = require('session'),
    LocalStrategy = require('passport-local').Strategy,
    authentication = require('./authenticate'),
    user = require('./user'),
    ftp = require('./ftp/FTPServer.js'),
    document = require('./document.js'),
    port = 3001;

app.use(bodyParser.json());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'merrakesh', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(authentication.serializeUser);
passport.deserializeUser(authentication.deserializeUser);
passport.use(new LocalStrategy(authentication.verifyUserCallback));

app.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    console.log('authenticate');
    if (err) { console.log('first error'); return next(err); }
    if (!user) { console.log('no user error'); return res.redirect('/login'); }

    req.login(user, function(err) {
      if (err) {
        console.log('login block error');
        return next(err);
      }
      console.log('login successfull');
      return res.send('true');
    });

  })(req, res, next);
});

app.get('/logout', authentication.logout);

app.get('/login-status', authentication.loginStatus);

app.post('/create-user', authentication.createUser);

app.post('/delete-user', authentication.deleteUser);

app.post('/edit-user', user.editUser);

app.get('/list-users', user.listUsers);

app.get('/get-user-object', user.getUserObject);

app.get('/get-documents-by-page/:pageNumber', document.getDocumentsByPage);

app.get('/get-document-count', document.getDocumentCount);

app.get('/health', function(request, response, next) {
	  response.send('{"status": "healthy"}');
});

app.use(express.static(__dirname + '../frontend/build'));

app.listen(port, function() {
  console.log('listening on port ', port, '!');
});

ftp.startFTPServer()
