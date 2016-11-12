/**
 * @author: Anthony Altieri
 */

var express = require('express');
var router = express.Router();
import md5 from '../../node_modules/blueimp-md5/js/md5.js'

var mongoose = require('mongoose');
import UserSchema from '../schemas/User';
const User = mongoose.model('users', UserSchema);

import db from '../db';
import PasswordUtil from '../utilities/PasswordUtil'
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
router.post('/signUp/instructor', signUpInstructor);

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

  const encryptedPassword = PasswordUtil.encryptPassword(password, email);

  db.findOne({ email: email }, User)
    .then((user) => {
      db.findOne({
        email: email,
        password: encryptedPassword
      }, User)
        .then((user) => {
          if (!user) {
            res.send({})
          }

          req.session.userName = email;
          req.session.firstName = user.firstName;
          req.session.lastName = user.lastName;
          req.session.userType = user.type;
          req.session.userId = user.id;

          const name = `${user.firstName} ${user.lastName}`;
          const type = user.type;

          user.loggedIn = true;

          db.save(user)
              .then((user) => {
                  res.send(UserService.mapToSend(user))
              })
              .catch((error) => { res.error(error) });

        })
        .catch(error => {
          res.error("Password Incorrect");
        })
    })
    .catch(error => {
      switch(error) {
        case 'Not Found':
          res.error("User Not Found");
          break;

        default:
          res.error("Unknown Error");
          break;
      }
    });
}

 async function signUpStudent(req, res) {
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      institutionId,
      school
    } = req.body;

    try {
      const result = await UserService
        .buildUser(
          firstName,
          lastName,
          email,
          password,
          phone,
          institutionId,
          school,
          TYPE_STUDENT
        );

      res.send(
        !!result ? result : { error: 'Server Error' }
      );
    }
    catch (error) {
      res.error();
    }
}

async function signUpInstructor(req, res){
    const  {
        firstName,
        lastName,
        email,
        password,
        phone,
        school,
        referralCode
    } = req.body;

    try {
        const result = await UserService
            .buildUser(
                firstName,
                lastName,
                email,
                password,
                phone,
                school,
                TYPE_INSTRUCTOR,
                referralCode
            );

        if( !!result ){
            res.send(result);
        }
        else{
            res.error("Error creating User: Likely problem with Email or School provided");
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
