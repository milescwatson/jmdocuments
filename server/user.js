/*jshint node:true */
/*global require */
'use strict';

var m = require('@milescwatson/m'),
    dbconfig = require('./include/dbconfig.json'),
    mysql = require('mysql2'),
    userFunctions = require('./userFunctions'),
    isValidEmail = function(email){
      var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      if(re.test(String(email).toLowerCase())){
        return([true]);
      }else{
        return([false, 'Error: Invalid email.']);
      }
    };

var executeQuery = function(query, callback){
  const pool = mysql.createPool(dbconfig);
  pool.query(query, function(error, results, fields) {
    callback(error, results, fields);
  })
}

var editUser = function(req, res){
  /*
  [] handle bad password
  [] handle duplicate email
  [] handle validEmail
  */

  var validateFormResponse = {
    isValid: true,
    errorMessage: null
  }

  const user = req.body;
  const sessionUser = req.user;


  if(req.user === 'admin'){
    const newRole = ((sessionUser.id === user.id) ? 'admin' : user.role); // user cant demote themselve from admin
    var sql = "UPDATE `User` SET `firstname`=?, `lastname`=?, `role`=?, `email`=? WHERE `id`=?";
    var values = [user.firstname, user.lastname, user.role, user.email, user.id];

    var isValidEmail = userFunctions.isValidEmail(user.email);
    console.log('isValidEmail = ', isValidEmail);

    if(isValidEmail[0]){
      if(user.password.length !== 0){
        // if password being changed
        userFunctions.generateHashAndSalt(user.password, function(hash, salt){
          sql = "UPDATE `User` SET `firstname`=?, `lastname`=?, `role`=?, `email`=?, `passwordHash`=?, `salt`=? WHERE `id`=?";
          values = [user.firstname, user.lastname, user.role, user.email, hash, salt, user.id];
          const updateQuery = {
            sql: sql,
            values: values
          }

            userFunctions.userExists(user.email, function(error, userExists){
              // TODO: Add existing email address checming
              if(true){
                executeQuery(updateQuery, function(error, result){
                  console.log('updatePassword sql = ', error, result);
                  if(!error){
                    const send = {
                      status: 'success',
                      error: error
                    }
                    res.send(send);
                  }else{
                    const send = {
                      status: 'error',
                      error: error
                    }
                    res.send(send);
                  }
                });
              }else{
                res.send(JSON.stringify({
                  error: "Error: User email already exists",
                  status: "error"
                }
                ));
              }
            });

        });
      }else{
        const updateQuery = {
          sql: sql,
          values: values
        }
        executeQuery(updateQuery, function(error, result){
          if(!error){
            const send = {
              status: 'success',
              error: error
            }
            res.send(JSON.stringify(send));
          }else{
            const send = {
              status: 'error',
              error: error
            }
            res.send(JSON.stringify(send));
          }
        });
      }
    }else{
      var send = {}
      send.error=true
      send.status="Invalid email"
      res.send(send);
    }

  }else{
    res.send("error")
  }
}

var listUsers = function(req, res){
  const query = {
    sql: "SELECT * From User"
  }
  executeQuery(query, function(error, result){
    if(!error){
      if(req.user){
        console.log('req.user = ', req.user);
        if(req.user.role === 'admin'){
          var userList = [];
          for(var i = 0; i <result.length; i++){
            var app = {
              id: result[i].id,
              firstname: result[i].firstname,
              lastname: result[i].lastname,
              email: result[i].email,
              role: result[i].role,
              createdDateTime: result[i].createdDateTime,
            }
            userList.push(app);
          }
          var response = {
            status: "true",
            error: null,
            userList: userList
          }
          res.send(JSON.stringify(response));
        }else{
          res.send('{status: "error", error:"notAdmin"}');
        }
      }else{
        res.send('{status: "error", error:"notLoggedIn"}');
      }
    }else{
      var s = '{status: error, error:' + error.toString() + '}'
      res.send(s);
    }
  });
}

var getUserObject = function(req, res){
  if(!req.user){
    res.send('null');
  }else{
    res.send(req.user);
  }
}

exports.editUser = editUser;
exports.listUsers = listUsers;
exports.getUserObject = getUserObject;
