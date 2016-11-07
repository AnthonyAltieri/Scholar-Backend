/**
 * @author: Anthony Altieri
 */

var express = require('express');
var router = express.Router();
import md5 from '../../node_modules/blueimp-md5/js/md5.js'

var mongoose = require('mongoose');

import db from '../db';

/*
User Constants
 */

const TYPE_STUDENT = "STUDENT";
const TYPE_INSTRUCTOR = "INSTRUCTOR";



// Services
//import SessionService from '../services/SessionService';

// Import User Schema


// Create a model with the Schema


import UserService from '../services/UserService'
import SchoolService from '../services/SchoolService'

router.post('/logIn', logIn);
router.post('/logOut', logOut);
router.post('/signUp/student', signUpStudent);

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

 async function signUpStudent(req, res) {
    const  {
          firstName,
          lastName,
          email,
          password,
          phone,
          school
        } = req.body;

    try {
        UserService.validateModel();
        const encryptedPassword = UserService.encryptPassword(password, email);
        const isEmailVacant = await UserService.isEmailVacant( email);
        const schoolFound = await SchoolService.findByName(school);//TODO: Hook this with SchoolService once ready; should return school obj if found
        if (!!isEmailVacant && !!schoolFound) {
            const user = await UserService
                .attemptSignUp(
                    firstName,
                    lastName,
                    email,
                    password,
                    phone,
                    schoolFound.id,
                    TYPE_STUDENT
                );
            res.send(UserService.mapToSend(user));
        } else {
            res.error("Email Already Exists or School Not Found");
        }

    }
    catch (error) {
        throw error;
    }
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


module.exports = router;
