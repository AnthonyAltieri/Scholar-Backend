/**
 * @author: Anthony Altieri
 */

var express = require('express');
var router = express.Router();
import md5 from '../../node_modules/blueimp-md5/js/md5.min'
const SALT = '620';

import UserService from '../services/UserService'
import QuestionService from '../services/QuestionService';

import db from '../db';

var mongoose = require('mongoose');

// Services
import SessionService from '../services/SessionService';

// Import User Schema
var UserSchema = require('../schemas/User');

// Create a model with the Schema
var User = mongoose.model('users', UserSchema); 

router.post('/get/id', getId);
router.post('/remove', remove);
router.post('/logIn', logIn);
router.post('/logOut', logOut);
router.post('/signUp', signUp);
router.post('/getInfo', getInfo);
router.post('/getType', getType);
router.post('/session/checkValid', hasValidSession);
router.post('/test', test);

function test(req, res){
    console.log("TESTING");
    console.log(req.headers);
}

function getId(req, res) {
  res.send({
    userId: req.session.userId
  })

}

/**
 * @description
 * Attempts to log in with credentials, if an account is found that corresponds
 * with the credentials provided a session will be created
 *
 * @body
 *  - email: The email that is the username associated with the user's account
 *  - password: The unencrypted password associated with the user's account
 */
function logIn(req, res) {
  const { email, password } = req.body;

  const encryptedPassword = md5(password, null, true) + email + SALT;

  db.findOne({ username: email }, User)
    .then((user) => {
      db.findOne({
        username: email,
        password: encryptedPassword
      }, User)
        .then((user) => {
          req.session.userName = email;
          req.session.firstName = user.firstName;
          req.session.lastName = user.lastName;
          req.session.userType = user.userType;
          req.session.userId = user._id;

          const name = `${user.firstName} ${user.lastName}`;
          const type = user.userType;

          user.loggedIn = true;

          db.save(user)
            .then(user => {
              res.send({
                name,
                type,
                success: true,
                userType: user.userType
              });
            })
            .catch(error => { res.error(error) });
        })
        .catch(error => {
          res.send({
            success: false,
            foundUser: true
          })
        })
    })
    .catch(error => {
      switch(error) {
        case 'Not Found':
          res.send({
            success: false,
            foundUser: false
          });
          break;

        default:
          res.send({
            success: false
          });
          break;
      }
    });
}

function signUp(req, res) {
  const { email, password, firstName, lastName, userType } = req.body;

  const encryptedPassword = md5(password, null, true) + email + SALT;

  db.findOne({
    username: email,
    password: encryptedPassword
  }, User)
    .then(user => {
      if (user) {
	console.log('EMAIL IN USE');
        res.send({
          msg: 'Email in use',
          success: false
        })
      } else {
        db.create({
          username: email,
          password: encryptedPassword,
          firstName,
          lastName,
          userType,
          loggedIn: true
        }, User)
          .then(user => {
            req.session.userName = email;
            req.session.firstName = firstName;
            req.session.lastName = lastName;
            req.session.userType = userType;
            req.session.userId = user._id;

            res.success()
          })
          .catch(error => { 
		console.error('error: ', error);
		res.error(error) 
	})
      }
    })
    .catch(error => { 
	console.error('error: ', error);
	res.error(error) 
	})
}

function remove(req, res) {
  const { userId } = req.session;

  db.remove(userId, User)
    .then(user => { res.success() })
    .catch(error => { res.error(error) })
}

function logOut(req, res) {
  const { userId } = req.session;

  db.findById(userId, User)
    .then(user => {
      user.loggedIn = false;
      db.save(user)
        .then(user => {
          req.session.destroy(error => {
            if (error) {
              res.error(error);
              return
            }
            res.success()
          })
        })
        .catch(error => { res.sendServerError(error) })
    })
    .catch(error => { res.sendServerError(error) })
}

function getInfo(req, res) {
  const { userId } = req.session;
  console.log('in /getInfo');
  console.log('userId', userId);

  User.findById(userId, (err, user) => {
    if (err) {
      res.sendServerError();
      return
    }

    res.send({
      success: true,
      type: user.userType,
      name: `${user.firstName} ${user.lastName}`
    })
  });
}

function getType(req, res) {
  const { userId } = req.session;

  User.findById(userId, (err, user) => {
    if (err) {
      res.sendServerError();
      return
    }

    res.send({
      success: true,
      type: user.userType
    })
  })
}

function hasValidSession(req, res) {
  if (req.session.userId) {
    res.send({
      hasValidSession: true
    })
  } else {
    res.send({
      hasValidSession: false
    })
  }
}

module.exports = router;
