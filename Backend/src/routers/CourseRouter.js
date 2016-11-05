/**
 * @author: Anthony Altieri
 */

var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');

// Import Services
import SessionService from '../services/SessionService';

import CourseSessionService from '../services/CourseSessionService';
import TestService from '../services/TestService';

//import utils
var CourseRegistrationUtility = require('../utilities/CourseRegistrationUtility')

// Import Course Schema
var CourseSchema = require('../schemas/Course');
import UserSchema  from '../schemas/User';
import CourseSessionSchema from '../schemas/CourseSession'

// Create a model with the Schema
var Course = mongoose.model('courses', CourseSchema);
const User = mongoose.model('users', UserSchema);
const CourseSession = mongoose.model('courseSessions', CourseSessionSchema);


import db from '../db';

router.post('/register/getLink/:code', getRegistrationLink);
router.post('/register', registerStudentToCourse);
router.post('/create', create);
router.post('/remove', remove);
router.post('/get/all', getAll);
router.post('/get/enrolled', getEnrolled);
router.post('/courseSession/active/join', courseSessionActiveJoin);
router.post('/courseSession/activateOrJoin', courseSessionActivateOrJoin);
router.post('/courseSession/active/end', courseSessionActiveEnd);

function create(req, res) {
    const { title, code, instructorName, courseTime } = req.body;

  db.create({
    title,
    code,
    instructorName,
    courseTime
  }, Course)
    .then(course => { res.success() })
    .catch(error => { res.error(error) })
}

function remove(req, res) {
  const { id } = req.body;

  db.remove(id, Course)
    .then(course => { res.success() })
    .catch(error => { res.error(error) })
}

function getAll(req, res) {
  db.findAll(Course)
    .then(courses => {
      res.send({
        success: true,
        courses
      })
    })
    .catch(error => { res.error(error) })
}

function getEnrolled(req, res) {
    const {userId} = req.session;
    db.findById(userId, User)
        .then(user=>{
            let query = "";
          console.log('user.coursesEnrolled', JSON.stringify(user, null, 2));
            if(user.userType==="STUDENT") {
                query = {"_id": {$in: user.coursesEnrolled}};
            }
            else{
                query = {"instructorId" : user.id}
            }
            db.find(query, Course)
                .then(courses => {
                    res.send({
                        success: true,
                        courses
                    })
                })
                .catch(error => {
                    res.error(error)
                });
        })
        .catch(error=>{res.error(error)})
}

function courseSessionActiveJoin(req, res) {
  const { courseId } = req.body;
  const { userId } = req.session;

  db.findById(courseId, Course)
    .then(course => {
      if (!course.hasActiveSession) res.error('No active CourseSessions');

      db.findById(userId, User)
        .then(user => {
          user.inCourseSession = course.activeSessionId;

          db.save(user)
            .then(user => {
              CourseSessionService.handleStudentJoin(course.activeSessionId, userId, req.io);

              res.send({
                success: true,
                courseSessionId: course.activeSessionId,
                code: course.code
              })
            })
            .catch(error => { res.error(error) })
        })
        .catch(error => { res.error(error) })
    })
    .catch(error => { res.error(error) })
}

function courseSessionActivateOrJoin(req, res) {
  const { courseId } = req.body;
  const { firstName, lastName } = req.session;

  db.findById(courseId, Course)
    .then(course => {
      const instructorName = `${firstName} ${lastName}`;
      if (course.hasActiveSession) {
          db.findById(course.activeSessionId, CourseSession)
              .then(courseSession =>{
                  res.send({
                      success: true,
                      courseSessionId: course.activeSessionId,
                      code: course.code,
                      instructorName,
                      confusionThreshold: courseSession.confusionThreshold
                 })
              })
              .catch(error => { res.error(error) });
      } else {
        db.create({
          courseId: course._id,
          questions: [],
          confusionPoints: [],
          attendance: 0,
          inAttendance: []
        }, CourseSession)
          .then(courseSession => {
            course.hasActiveSession = true;
            course.activeSessionId = courseSession._id;

            db.save(course)
              .then(course => {
                  console.log("Saved session with thresh " + courseSession.confusionThreshold);
                res.send({
                  msg: 'CourseSession created',
                  success: true,
                  courseSessionId: courseSession._id,
                    confusionThreshold: courseSession.confusionThreshold,
                  instructorName,
                  code: course.code
                })
              })
              .catch(error => { res.error(error) })
          })
          .catch(error => { res.error(error) })
      }
    })
    .catch(error => { res.error(error) })
}

function courseSessionActiveEnd(req, res) {
  const { courseId } = req.body;

  db.findById(courseId, Course)
    .then(course => {
      const activeSessionId = course.activeSessionId;
      course.activeSessionId = null;
      course.hasActiveSession = false;
      db.save(course)
        .then(course => {
          CourseSessionService.handleEnd(activeSessionId, req.io);
          res.success()
        })
        .catch(error => { res.error(error) })
    })
    .catch(error => { res.error(error) })
}

function registerStudentToCourse(req, res){

    CourseRegistrationUtility.handleAuthenticatedRequest(req, res);
}

/*
Hit this endpoint to generate the link for a given course code 
 */
function getRegistrationLink(req, res){
    const code  = req.params.code;
    CourseRegistrationUtility.makeRegistrationLink(code, function(link){
        console.log("link : " + link );
        res.send(link);
    });
}

module.exports = router;