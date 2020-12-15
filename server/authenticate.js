/*jshint node:true */
/*global require */
'use strict';

var mysqlQueryExecutor = require('./mysqlQueryExecutor'),
    dbconfig = require('./include/dbconfig.json'),
    crypto = require('crypto'),
    generateHashAndSalt = function(password, callback){
      var salt = crypto.randomBytes(64).toString('base64');
      crypto.pbkdf2(password, salt, 100000, 64, 'sha512', function(error, hash){
        if (error) {
          callback('Error: Could not generate hash', null);
        }
        callback(hash.toString('hex'), salt);
      });
    },
    verifyPassword = function(password, storedHash, storedSalt, callback){
      crypto.pbkdf2(password, storedSalt, 100000, 64, 'sha512', function(error, hash){
        if (error){
          callback(error, null);
        }
        callback(null, hash.toString('hex') === storedHash);
      });
    },
    isValidEmail = function(email){
      var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      if(re.test(String(email).toLowerCase())){
        return([true]);
      }else{
        return([false, 'Error: Invalid email.']);
      }
    },
    isValidPassword = function(password){
      if((password !== undefined)){
        if(password.length < 3){
          return([false, 'Error: Password must be greater than 3 characters.']);
        }else{
          return([true]);
        }
      }
    },
    userExists = function(email, callback){
      // deal with situation where user signs in with different method, but same e-mail
      mysqlQueryExecutor.executeCallableStatement({
        "sql": 'SELECT COUNT(*) FROM User WHERE email=?',
        "values": [email]
      }, function(error, results){
        if(results[0]['COUNT(*)'] >= 1){
          callback('Cannot create a new account: email address already in use.', true);
        }else if(results[0]['COUNT(*)'] === 0){
          callback(null, false);
        }else{
          callback('userExists() error');
        }
      });
    };

exports.signIn = function(request, response){
  console.log('request.user: ', request.user);
  response.status(200).send('sign in');
};

exports.verifyUserCallback = function(username, password, done){
  console.log('verifyUserCallback');
  try {
    mysqlQueryExecutor.executeCallableStatement({
      "sql" : "SELECT * FROM User WHERE email=?",
      "values": [username]
    }, function(error, results){
      if (error) { done(null, false, {message: 'SQL Error'}) }

      if (results.length === 1){
        //username/ email addresses are unique.
        verifyPassword(password, results[0].passwordHASH, results[0].salt, function(error, isValidPassword){
          if (error) { done(null, false, {message: ('Password Encryption Error: ' + error)}) }

          if (isValidPassword){
            var userObject = {
              id : results[0].id
            };
            console.log(results[0].firstname + ' ' + results[0].lastname + ' has logged in.');
            done(null, userObject);
          } else {
            done(null, false, {message: 'invalid password'})
          }
        });
      } else {
        done(null, false, {message: 'Non-existant User'})
      }

    });
  } catch (error) {
    console.log('caught error in verifyUserCallback: ', error);
  } finally {
    // done(null, false, {message: 'unknown error'})
  }
};

exports.findById = function(id, done){
  // Used in deserialize user
  var userObject = {
    id : id,
    firstname: '',
    lastname: '',
    email: '',
    role: ''
  }

  mysqlQueryExecutor.executeCallableStatement({
    "sql" : "SELECT * FROM User WHERE id=?",
    "values": [id]
  }, function(error, results){
    if(!error){
      userObject.firstname = results[0].firstname;
      userObject.lastname = results[0].lastname;
      userObject.email = results[0].email;
      userObject.role = results[0].role;
      console.log('findById userObject: ', userObject);
      done(null, userObject);
    } else {
      // sql error in finding by ID
      console.log('sql error in finding by ID');
      done(true)
    }
  });
};

exports.deserializeUser = function(id, done){
  console.log('deserializeUser');
  module.exports.findById(id, function(error, user){
    if(error){
      return done(error);
    }
    done(null, user);
  });
};

exports.serializeUser = function(user, done){
  console.log('serializeUser');
  var serialize = {
    id: user.id,
    test: 'foo'
  }

  done(null, user.id);
};

exports.createUser = function(request, response){
  if(request.body.password !== undefined && request.body.email !== undefined){
    userExists(request.body.email, function(error, userExists){
      if(!userExists){
        if (!isValidPassword(request.body.password)[0]) {
          response.status(403).send(isValidPassword(request.body.password));
        } else if(!isValidEmail(request.body.email)[0]) {
          response.status(403).send(isValidEmail(request.body.email));
        }else{
          //proceed, valid email and password
          generateHashAndSalt(request.body.password, function(hash, salt){
            var newUserArray = [request.body.firstname, request.body.lastname, request.body.email, salt, hash, 1, 'user'];
            mysqlQueryExecutor.executeCallableStatement({"sql": "INSERT INTO User (firstname, lastname, email, salt, passwordHASH, createdByUserId, role) VALUES(?,?,?,?,?,?,?)", "values": newUserArray}, function(error, results){
              if(error){
                response.status(403).send([false, ('mysql error: ' + error)]);
              }else{
                response.status(200).send([true, 'Account Created Successfully']);
              }
            });
          });
        }
      }else{
        response.status(200).send([false, error]);
      }
    });
  } else {
    response.status(403).send('error undefined password or email');
  }
};

exports.loginStatus = function(request, response){
  if(request.user !== undefined){
    var userObject = request.user;
    response.status(200).send(userObject);
  }else{
    response.status(200).send({
      id: null
    });

  }
};

exports.logout = function(request, response){
  // console.log('logout triggered');
  // try {
  //   request.user = undefined;
  //   response.status(200).send('logout-success');
  // } catch (error) {
  //   response.status(200).send(error.toString());
  // }
  request.logout();
  response.send('{loggedIn: false}');
};

exports.deleteUser = function(request, response){
  if(request.user.role === 'admin'){
    const userToDeleteID = parseInt(request.body.userID);
    const deleteUserQuery = {
      "sql": "DELETE FROM `User` WHERE `id`=?",
      "values": [userToDeleteID]
    }
    mysqlQueryExecutor.executeCallableStatement(deleteUserQuery, function(error, result){
      if(!error){
        const send = {
          status: 'Deleted User',
          error: error
        }
        response.send(send);
      }else{
        const send = {
          status: 'Error: Could not delete user',
          error: error
        }
        response.send(send);
      }
    })
  }
}
