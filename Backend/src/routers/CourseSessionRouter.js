/**
 * @author: Anthony Altieri
 */

import express from 'express';
import md5 from '../../node_modules/blueimp-md5/js/md5.min'

import mongoose from 'mongoose';

import _ from 'lodash';

import db from '../db';

// Import Services
import SessionService from '../services/SessionService';
import CourseSessionService from '../services/CourseSessionService';
import UserService from '../services/UserService';
import QuestionService from '../services/QuestionService';

// Import Schemas
import CourseSchema from '../schemas/Course';
import CourseSessionSchema from '../schemas/CourseSession';
import QuestionsSchema from '../schemas/Question';
import VoteSchema from '../schemas/Vote';
import ConfusionPointSchema from '../schemas/ConfusionPoint';
import ReflectiveAssessmentSchema from '../schemas/ReflectiveAssessment';
import InstantAssessmentSchema from '../schemas/InstantAssessment';
import UserSchema from '../schemas/User'

const router = express.Router();

router.use((req, res, next) => {
  console.log('=====================');
  console.log(`REQUEST: ${req.url}`);
  next();
});

// Create models
const Course = mongoose.model('courses', CourseSchema);
const CourseSession = mongoose.model('CourseSessions', CourseSessionSchema);
const Question = mongoose.model('Questions', QuestionsSchema);
const ConfusionPoint = mongoose.model('confusionpoints', ConfusionPointSchema);
const Vote = mongoose.model('votes', VoteSchema);
const InstantAssessment = mongoose.model('instantAssessment', InstantAssessmentSchema);
const ReflectiveAssessment = mongoose.model('reflectiveAssessment', ReflectiveAssessmentSchema);
const User = mongoose.model('users', UserSchema);

router.post('/leave', leave);
router.post('/attendance/get', attendanceGet);
router.post('/questions/getObjects', questionsGetObjects);
router.post('/questionList/toggle', toggleQuestionList);//only instructor (validation reqd in future versions)
router.post('/questionList/isActive', isQuestionListActive);
router.post('/questions/get', questionsGet);
router.post('/questions/add', questionsAdd);
router.post('/questions/remove', questionsRemove);
router.post('/questions/vote', questionsVote);
router.post('/student/remove', studentRemove);
router.post('/alerts/add', alertAdd);
router.post('/alerts/getNumberActive', alertsGetNumberActive);
router.post('/alerts/getNumberAndPercent', alertsGetNumberAndPercent);
router.post('/alerts/setThreshold', alertsSetThreshold);
router.post('/assessments/getPriorSelections', assessmentsGetPriorSelections);
router.post('/assessments/getPriorActive', assessmentsGetPriorActive);


function leave(req, res) {
  const { userId } = req.session;
  const { courseSessionId } = req.body;
  CourseSessionService.handleStudentLeave(courseSessionId, userId, req.io);
  UserService.leaveCurrentCourseSession(userId);
  res.success()
}

function attendanceGet(req, res) {
  const { courseSessionId } = req.body;
  db.findById(courseSessionId, CourseSession)
    .then(courseSession => {
      res.send({
        success: true,
        attendance: courseSession.attendance
      })
    })
}

function alertAdd(req, res) {
  const  { userId } = req.session;
  const {  created, courseSessionId } = req.body;


    // console.log("USERID : " + userId);
    // console.log("SESSION : " + JSON.stringify(req.session, null, 2));
    // console.log("SESSION.USERID : " + JSON.stringify(req.session.userId, null, 2));
    // console.log("SESSION[USERID] : " + JSON.stringify(req.session['userId'], null, 2));
    // console.log("Created : " + created);
    // console.log("CourseSessionId : " + courseSessionId);

  db.findById(courseSessionId, CourseSession)
    .then(courseSession => {
      const windowMinutes = courseSession.confusionWindowMinutes || 1;
      const inWindow = CourseSessionService.isMostRecentInWindow(userId, courseSession.confusionPoints,
        windowMinutes);
      console.log('\ninWindow', inWindow)
      if (!inWindow) {
        console.log('NOT IN WINDOW')
        const confusionPoint = db.generate({ userId, created }, ConfusionPoint);
        courseSession.confusionPoints = [...courseSession.confusionPoints, confusionPoint];
        db.save(courseSession)
          .then((courseSession) => {
            const alertsInWindow = CourseSessionService.getAlertsInWindow(courseSession.confusionPoints,
              windowMinutes);
            CourseSessionService.handleAlertAdded(courseSessionId, alertsInWindow.length, req.io);
            res.success();
          })
          .catch(error => { res.error(error) })
      } else {
        console.log('IN WINDOW')
        res.send({
          success: false
        })
      }
    })
    .catch(error => { res.error(error) })
}

function questionsGetObjects(req, res) {
  const { userId } = req.session;
  const { courseSessionId } = req.body;

  db.findById(courseSessionId, CourseSession)
    .then(courseSession => {
      const { questions } = courseSession;
      const asked = CourseSessionService.getUserAsked(questions, userId);
      const votedOn = CourseSessionService.getUserVotedOn(questions, userId);
      res.send({
        questions,
        asked,
        votedOn,
        success: true
      })
    })
    .catch(error => { res.error(error); });
}

function questionsGet(req, res) {
  const { courseSessionId } = req.body;

  db.findById(courseSessionId, CourseSession)
    .then((courseSession) => {
      const { questions } = courseSession;
      res.send({
        questions,
        success: true
      })
    })
    .catch(error => { res.error(error); });
}

function questionsAdd(req, res) {
  const {userId} = req.session;
  const { courseSessionId, content, created } = req.body;

  db.findById(courseSessionId, CourseSession)
    .then((courseSession) => {
      const question = db.generate({
        userId,
        content,
        created,
        rank: 0
      }, Question);
      courseSession.questions.push(question)
      db.save(courseSession)
        .then((courseSession) => {
          CourseSessionService.handleQuestionsAdd(courseSessionId, courseSession.questions, req.io);
          res.success();
        })
        .catch(error => { res.error(error) });
    })
    .catch(error => { res.error(error) });
}

function questionsRemove(req, res) {
  const { courseSessionId, questionId } = req.body;

  db.findById(courseSessionId, CourseSession)
    .then(courseSession => {
      courseSession.questions = courseSession.questions.filter(q => q._id.toString() !== questionId.toString());
      db.save(courseSession)
        .then((courseSession) => {
          CourseSessionService.handleQuestionDismissed(courseSession.questions, courseSessionId, req.io);
          res.success()
        })
        .catch(error => { res.error(error) })
    })
    .catch(error => { res.error(error) })
}

function questionsVote(req, res) {
  const { userId } = req.session;
  const { courseSessionId, questionId, questionUserId } = req.body;

  if (userId === questionUserId) {
    res.send({
      success: false,
      ownQuestion: true
    });
    return
  }

  let { vote } = req.body;
  vote.userId = userId;

  db.findById(courseSessionId, CourseSession)
    .then(courseSession => {
      const question = courseSession.questions.filter(q => q._id.toString() === questionId.toString())[0];
      const userVote = question.votes.filter(v => v.userId.toString() === userId.toString());

      switch (vote.type) {
        case 'UP':
          question.votes.push(new Vote(vote));
          question.rank++;
          break;
        case 'DOWN':
          question.votes = question.votes.filter(v => v.userId.toString() !== req.session.userId.toString());
          question.rank--;
          break;
      }

      db.save(courseSession)
        .then(courseSession => {
          CourseSessionService.handleQuestionVote(courseSessionId, questionId, vote, req.io);
          res.success()
        })
        .catch(error => {
          res.error(error)
        })
    })
    .catch(error => { res.error(error) })
}


function studentRemove(req, res) {
  const { userId } = req.session;
  const { courseSessionId } = req.body;

  const error = CourseSessionService.handleStudentLeave(courseSessionId, userId, req.io);

  if (error) {
    res.error(error);
  } else {
    res.success()
  }
}


function alertsGetNumberActive(req, res) {
  const { courseSessionId } = req.body;
  const windowLength = req.body.windowLength || 1;

  db.findById(courseSessionId, CourseSession)
    .then(courseSession => {
      const alertsInWindow = CourseSessionService.getAlertsInWindow(courseSession.confusionPoints, windowLength);
      res.send({
        success: true,
        activeAlerts: (alertsInWindow) ? alertsInWindow.length : 0
      })
    })
    .catch(error => { res.error(error) })
}

function alertsGetNumberAndPercent(req, res) {
  const { courseSessionId } = req.body;
  const windowLength = req.body.windowLength || 1;

  db.findById(courseSessionId, CourseSession)
    .then((courseSession) => {
      const alertsInWindow = CourseSessionService.getAlertsInWindow(courseSession.confusionPoints, windowLength);
      const number = (alertsInWindow) ? alertsInWindow.length : 0;
      const attendance = courseSession.inAttendance.length;
      const percent = (Math.floor((number / attendance) * 100) === 1)
        ? 100
        : Math.floor((number / attendance) * 100);
      console.log('percent', percent)
      res.send({
        threshold: courseSession.alertThreshold || 20,
        percent,
        number,
      })
    })
    .catch(error => { res.error(error) })
}


function assessmentsGetPriorSelections(req, res) {
  const { userId } = req.session;
  const { courseSessionId } = req.body;

  db.findById(courseSessionId, CourseSession)
    .then(courseSession => {
      console.log('first mark', 'courseSession', courseSession)
      if (courseSession.activeReflectiveAssessment) {
        db.findById(courseSession.activeReflectiveAssessment, ReflectiveAssessment)
          .then(reflectiveAssessment => {
            const id = reflectiveAssessment._id;
            const responses = reflectiveAssessment.responses;
            let responsesReviewed = {};

            responses.forEach(r => {
              let userVote = r.votes.filter(v => v.userId.toString() === userId.toString())[0];
              if (userVote) {
                responsesReviewed[r._id] = true;
              }
            });
            const visibleResponses = responses.filter(r => !responsesReviewed[r._id]);
            const userResponse = responses.filter(r => r.userId.toString() === userId.toString());

            res.send({
              type: 'REFLECTIVE',
              responding: (userResponse.length === 0),
              responses,
              visibleResponses,
              responsesReviewed,
              id,
              created: reflectiveAssessment.created,
              prompt: reflectiveAssessment.question.content,
              success: true
            })
          })
          .catch(error => { res.error(error) })
      } else if (courseSession.activeInstantAssessment) {
        db.findById(courseSession.activeInstantAssessment, InstantAssessment)
          .then(instantAssessment => {
            const id = instantAssessment._id;
            const { content, options, created } = instantAssessment;

            const studentsAnswer = instantAssessment.answers
              .filter(a => a.studentId.toString() === userId.toString())[0];

            let optionSelected = null;

            if (studentsAnswer) {
              switch (studentsAnswer.optionIndex) {
                case 0:
                  optionSelected = 'A';
                  break;
                case 1:
                  optionSelected = 'B';
                  break;
                case 2:
                  optionSelected = 'C';
                  break;
                case 3:
                  optionSelected = 'D';
                  break;
                case 4:
                  optionSelected = 'E';
                  break;
                default:
                  optionSelected = null;
                  break;
              }
            }
            res.send({
              type: 'INSTANT',
              id,
              content,
              options,
              optionSelected,
              created,
              success: true
            });
          })
          .catch(error => { res.error(error) })
      } else {
        res.send({
          type: 'NONE',
          success: true
        })
      }

    })
    .catch(error => { res.error(error) })
}



function assessmentsGetPriorActive(req, res) {
  const { courseSessionId } = req.body;
  db.findById(courseSessionId, CourseSession)
    .then(courseSession => {
      if (courseSession.activeInstantAssessment) {
        db.findById(courseSession.activeInstantAssessment, InstantAssessment)
          .then(instantAssessment => {
            res.send({
              success: true,
              hasActiveAssessment: true,
              type: 'INSTANT',
              id: instantAssessment._id,
              question: (instantAssessment.question)
                ? instantAssessment.question.content
                : ''
            })
          })
          .catch(error => { res.error(error) })

      } else if (courseSession.activeReflectiveAssessment) {
        db.findById(courseSession.activeReflectiveAssessment, ReflectiveAssessment)
          .then((reflectiveAssessment) => {
            res.send({
              success: true,
              hasActiveAssessment: true,
              type: 'REFLECTIVE',
              id: reflectiveAssessment._id,
              question: (reflectiveAssessment.question)
                ? reflectiveAssessment.question.content
                : ''
            })
          })
          .catch(error => { res.error(error) })
      } else {
        res.send({
          success: true,
          hasActiveAssessment: false
        })
      }
    })
    .catch(error => { res.error(error) })
}

function alertsSetThreshold(req, res){
    const { courseSessionId, threshold } = req.body;
    db.findById(courseSessionId, CourseSession)
        .then(courseSession => {
            courseSession.confusionThreshold = threshold;
            db.save(courseSession)
                .then(courseSession =>{
                    res.send({success: true, threshold: courseSession.confusionThreshold});
                })
                .catch(error => {res.error(error)})
        })
        .catch(error => {res.error(error)})
}

function toggleQuestionList(req, res){
    const {courseSessionId} = req.body;
    db.findById(courseSessionId, CourseSession)
        .then( courseSession => {
            courseSession.questionListActive = !courseSession.questionListActive;
            db.save(courseSession)
                .then( courseSession => {
                    res.send({
                        success: true,
                        toggleValue: courseSession.questionListActive
                    })
                })
                .catch( error => { res.error(error) })
        })
        .catch( error => { res.error(error) })
}

function isQuestionListActive(req, res){
    const {courseSessionId} = req.body;
    db.findById(courseSessionId, CourseSession)
        .then( courseSession => {
            res.send({
                success: true,
                isActive: courseSession.questionListActive
            })
        })
        .catch( error => { res.error(error) })
}

module.exports = router;