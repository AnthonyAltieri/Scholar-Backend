'use strict';

import express from 'express';
var router = express.Router();

import mongoose from 'mongoose';

import ReflectiveAssessmentSchema from '../schemas/ReflectiveAssessment';
import CourseSessionSchema from '../schemas/CourseSession';
import VoteSchema from '../schemas/Vote';

var ReflectiveAssessment = mongoose.model('reflectiveAssessments', ReflectiveAssessmentSchema);
var CourseSession = mongoose.model('courseSessions', CourseSessionSchema);
var Vote = mongoose.model('votes', VoteSchema);



// Votes on a question
router.post('/question', (req, res) => {
  let courseSessionId = req.body.courseSessionId;
  let questionId = req.body.questionId;
  let studentId = req.body.studentId;
  let created = req.body.created;
  let type = req.body.type;

  CourseSession.findById(courseSessionId, (err, courseSession) => {
    if (err) {
      console.error(err);
      return;
    }

    let votes = null;
    let questions = courseSession.questions;
    for (let i = 0 ; i < questions.length ; i++) {
      let question = questions[i];
      if (question._id === questionId) {
        let vote = new Vote({
          studentId: studentId,
          type: type,
          created: created
        });
        break;
      }
    }

    courseSession.save(err => {
      if (err) {
        console.error(err);
        return;
      }
      console.log('Question %s successfully voted on by student %s', questionId, studentId);
    });

  });
  
  res.end();
});

// Votes on an Response 
router.post('/response', (req, res) => {
  let reflectiveAssessmentId = req.body.reflectiveAssessmentId;
  let studentId = req.body.studentId;
  let type = req.body.type;
  let created = req.body.created;
  
  const vote = new Vote({
    studentId,
    type,
    created
  });
  
  ReflectiveAssessment.findById(reflectiveAssessmentId, (err, reflectiveAssessment) => {
    
  });
  
  
});

module.exports = router;
