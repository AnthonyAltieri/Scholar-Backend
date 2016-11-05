/**
 * Created by bharatbatra on 9/17/16.
 */
var express = require('express');
var router = express.Router();

import md5 from '../../node_modules/blueimp-md5/js/md5.min'
const SALT = '620';

var mongoose = require('mongoose');
import db from '../db';

// Import Course Schema
var CourseSchema = require('../schemas/Course');
import UserSchema  from '../schemas/User';

// Create a model with the Schema
var Course = mongoose.model('courses', CourseSchema);
const User = mongoose.model('users', UserSchema);

router.use((req, res, next) => {
    const { userType } = req.session;
    if (userType !== 'ADMIN') {
        res.send({
            error: {
                code: 404,
                msg: 'Not an Admin account',
            }
        });
        console.log("User : " + req.session.userId + " trying to make an admin request");
        return;
    }
    next();
})

router.post('/createInstructorAccount', createInstructorAccount);

function createInstructorAccount(req, res){
    const { email, password, firstName, lastName, courseCode, courseTitle, time } = req.body;

    console.log(req.body);

    const encryptedPassword = md5(password, null, true) + email + SALT;

    const userType = "INSTRUCTOR";

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

                        db.create({
                            instructorId: user.id,
                            code: courseCode,
                            title: courseTitle,
                            courseTime: time,
                            instructorName: user.firstName + " " + user.lastName,
                            hasActiveSession: false
                        }, Course)
                            .then(course=>{
                                console.log("success : " + course.id);
                                res.send({success: true, user: user, course: course});
                            })
                            .catch(error => {
                                console.error('error creating course: ', error);
                                res.error(error)
                            });



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
module.exports = router;