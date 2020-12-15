var mysqlQueryExecutor = require('./mysqlQueryExecutor'),
    crypto = require('crypto');

module.exports.verifyPassword = function(password, storedHash, storedSalt, callback){
  crypto.pbkdf2(password, storedSalt, 100000, 64, 'sha512', function(error, hash){
    if (error){
      callback(error, null);
    }
    callback(null, hash.toString('hex') === storedHash);
  });
};

module.exports.isValidPassword = function(password){
  if((password !== undefined)){
    if(password.length < 3){
      return([false, 'Error: Password must be greater than 3 characters.']);
    }else{
      return([true]);
    }
  }
};

module.exports.isValidEmail = function(email){
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if(re.test(String(email).toLowerCase())){
    return([true]);
  }else{
    return([false, 'Error: Invalid email.']);
  }
};

module.exports.userExists = function(email, callback){
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

module.exports.generateHashAndSalt = function(password, callback){
  var salt = crypto.randomBytes(64).toString('base64');
  crypto.pbkdf2(password, salt, 100000, 64, 'sha512', function(error, hash){
    if (error) {
      return
      callback('Error: Could not generate hash', null);
    }
    callback(hash.toString('hex'), salt);
  });
};
