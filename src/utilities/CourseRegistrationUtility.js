'use strict';

import mongoose from 'mongoose';
import db from '../db';
// Import Course Schema
var CourseSchema = require('../schemas/Course');
import UserSchema  from '../schemas/User';

// Create a model with the Schema
var Course = mongoose.model('courses', CourseSchema);
const User = mongoose.model('users', UserSchema);

import md5 from '../../node_modules/blueimp-md5/js/md5.min'
const SALT = '620';
class CourseRegistrationUtility {
    constructor() {};

    static makeRegistrationLink(courseCode, callback){
        db.findOne({'code' : courseCode.toString()}, Course)
            .then(course=>
            {
                console.log(JSON.stringify(course, null, 2));
                if(course)
                    callback( "http://scholarapp.xyz/registration?course="+course.code+"&code="+course.id);
                else
                    callback( null);
            })
            .catch(error=>{throw error});
    }

    /*
    This will simply create and send the cookie for this course if it is valid
     */
    static handleInitialRequest(req, res) {
        console.log(req.query.code);
        console.log(req.query.course);
        console.log(req.query.instantSignOn);
        if(req.query.instantSignOn === "true"){
            console.log("creating");
            db.create({
                firstName: "auto",
                lastName: "auto",
                userType: "STUDENT",
                loggedIn: true
            }, User)
                .then(user => {
                    console.log("created");
                    user.username = user._id+"@"+req.query.code+".xyz";
                    user.password = md5("auto-pass", null, true) + user.email + SALT;

                    db.save(user)
                        .then(savedUser => {
                            console.log("edited username");
                            res.cookie("course-registration",  req.query.code);
                            db.findById(req.query.code, Course)
                                .then(course => {
                                    console.log("sent cookie, now checking for course validity");
                                    //this is a valid request, now we allow login
                                    if(req.query.course===course.code){
                                        console.log("course valid, saving session");
                                        req.session.userName = savedUser.username;
                                        req.session.firstName = savedUser.firstName;
                                        req.session.lastName = savedUser.lastName;
                                        req.session.userType = savedUser.userType;
                                        req.session.userId = savedUser._id;
                                        req.session.save((err) => {});
                                    }
                                    else{
                                        console.log("course invalid, clear cookie");
                                        res.clearCookie("course-registration");
                                    }
                                })
                                .catch(error => {
                                    console.log(error) ;
                                    throw error });
                        })
                        .catch(error => { throw error });
                })
                .catch(error => { throw error })
        }
        else {
            db.findById(req.query.code, Course)
                .then((course) => {
                    //this is a valid request
                    if(req.query.course===course.code){
                        res.cookie("course-registration",  course.id);
                    }
                })
        }

    }


    static handleAuthenticatedRequest(req, res){
        console.log("here comes an authenticated request");
        const { courseId } = req.body;
        const { userId } = req.session;
        db.findById(courseId, Course)
            .then(course => {
                if(course) {
                    db.findById(userId, User)
                        .then(user => {
                            console.log(user);
                            if (user.userType === 'STUDENT') {
                                let studentAlreadyRegistered = false;
                                course.enrolledStudents.forEach(studentId=> {
                                    if (studentId.toString() === userId.toString()) {
                                        studentAlreadyRegistered = true;
                                        console.log("student already registered  " + userId.toString());
                                    }
                                });
                                if (!studentAlreadyRegistered) {
                                    course.enrolledStudents.push(userId);
                                    db.save(course)
                                        .then(course => {
                                            let courseAlreadyAdded = false;
                                            user.coursesEnrolled.forEach(c => {
                                                if (c.toString() === course.id.toString()) {
                                                    courseAlreadyAdded = true;
                                                    console.log("Course already registered  " + course.id.toString());

                                                }
                                            });
                                            if (!courseAlreadyAdded) {
                                                user.coursesEnrolled.push(course.id);
                                                user.coursesAll.push(course.id);
                                                db.save(user)
                                                    .then(user=> {
                                                        res.success();
                                                    })
                                                    .catch(error => {
                                                        res.error(error)
                                                    });
                                            }
                                        })
                                        .catch(error => {
                                            res.error(error)
                                        });
                                }

                            }
                        })
                        .catch(error => {
                            res.error(error)
                        });
                }
                else{
                    res.error("Course Does not exist");
                }
            })
            .catch(error => {res.error(error)});
    }

    static instantSignOn(req, res, callback){

    }

}

module.exports = CourseRegistrationUtility;
