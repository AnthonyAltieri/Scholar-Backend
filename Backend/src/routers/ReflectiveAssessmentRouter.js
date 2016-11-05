'use strict';

import express from 'express';
import db from '../db';
var router = express.Router();

import mongoose from 'mongoose';

import ReflectiveAssessmentSchema from '../schemas/ReflectiveAssessment';
import CourseSessionSchema from '../schemas/CourseSession';
import QuestionSchema from '../schemas/Question';
import ResponseSchema from '../schemas/Response'
import VoteSchema from '../schemas/Vote';

var ReflectiveAssessment = mongoose.model('reflectiveAssessments', ReflectiveAssessmentSchema);
var CourseSession = mongoose.model('courseSessions', CourseSessionSchema);
var Question = mongoose.model('questions', QuestionSchema);
var Response = mongoose.model('responses', ResponseSchema);
var Vote = mongoose.model('votes', VoteSchema);

import ReflectiveAssessmentService from '../services/ReflectiveAssessmentService';

router.use((req, res, next) => {
  console.log(req.url);
  next();
});

router.post('/respond', respond);
router.post('/response/vote', responseVote);

// Adds a ReflectiveAssessment to a CourseSession by _id
router.post('/add', (req, res) => {
  console.log('api/reflectiveAssessment/add');
  
  const { courseSessionId } = req.body;
  const { userId } = req.session;
  const questionContent = req.body.questionContent || '';
  const created = req.body.created || new Date();
  
  console.log('mark');
  const question = new Question({
    userId: userId,
    content: questionContent
  });
  
  const reflectiveAssessment = new ReflectiveAssessment({
    courseSessionId: courseSessionId,
    question: question,
    responses: [],
    created: created
  });

  reflectiveAssessment.save(err => {
    if (err) {
      console.error(`Error saving Reflective Assessment: ${err}`);
      return;
    }
    
    CourseSession.findById(courseSessionId, (error, courseSession) => {
      if (error) {
        console.error(`Error finding Course Session by id: ${error}`);
        return;
      }
      
      courseSession.activeReflectiveAssessment = reflectiveAssessment._id;
      
      courseSession.save(saveError => {
        if (saveError) {
          console.error(`Error saving Course Session: ${saveError}`);
          return;
        }


        ReflectiveAssessmentService.handleCreation(courseSessionId, req.io, reflectiveAssessment);

        console.log('Successfully added ReflectiveAssessment for CourseSession %s',
          courseSessionId);
        res.send({
          msg: `Began a Reflective Assessment session`,
          id: reflectiveAssessment._id.toString(),
          success: true
        });
      })
    });
  });
});

// Adds a student's response to the Reflective Assessment

function respond(req, res) {
  const { courseSessionId, reflectiveAssessmentId, content } = req.body;
  const { userId } = req.session;

  db.findById(reflectiveAssessmentId, ReflectiveAssessment)
    .then((reflectiveAssessment) => {
      const response = new Response({ userId, content });
      console.log('mark mark mark hellllllo');
      console.log('reflectiveAssessment.responses before', reflectiveAssessment.responses);
      reflectiveAssessment.responses = [...reflectiveAssessment.responses, response];
      console.log('reflectiveAssessment.responses after', reflectiveAssessment.responses);

      db.save(reflectiveAssessment)
        .then((reflectiveAssessment) => {
          ReflectiveAssessmentService.handleResponse(courseSessionId, req.io,
            reflectiveAssessment.responses, userId);

          res.send({
            success: true,
            id: response._id.toString(),
            responses: reflectiveAssessment.responses,
          })
        })
    })
    .catch((error) => { res.error(error) });
}

// Gets a ReflectiveAssessment
router.post('/get', (req, res) => {
  let id = req.body.id;
  
  ReflectiveAssessment.findById(id, (err, reflectiveAssessment) => {
    if (err) {
      console.error(`Error finding ReflectiveAssessment by id: ${err}`);
      return;
    }
    
    res.send(reflectiveAssessment);
  });
});


// Vote on a student's Response
function responseVote(req, res) {
  const { courseSessionId, reflectiveAssessmentId, voteType, responseId } = req.body;
  const { userId } = req.session;

  const vote = db.generate({
    type: voteType,
    created: new Date(),
    userId,
  }, Vote);

  db.findById(reflectiveAssessmentId, ReflectiveAssessment)
    .then((reflectiveAssessment) => {
      const response = reflectiveAssessment.responses
        .filter(r => r._id.toString() === responseId.toString())[0];
      response.votes.push(vote);
      db.save(reflectiveAssessment)
        .then((reflectiveAssessment) => {
          let numberReviewed = 0;
          reflectiveAssessment.responses.forEach((r) => {
            numberReviewed += r.votes.length;
          });
          ReflectiveAssessmentService.handleResponseReviewed(courseSessionId, req.io,
            numberReviewed);
          res.success();
        })
        .catch((error) => { res.error(error) })
    })
    .catch((error) => { res.error(error) })

}

router.post('/stop', (req, res) => {
  const { reflectiveAssessmentId } = req.body;
  const { courseSessionId } = req.body;
  
  CourseSession.findById(courseSessionId, (err, courseSession) => {
    if (err) {
      res.sendServerError(err);
      return;
    }
    
    courseSession.activeReflectiveAssessment = null;
    
    courseSession.save(error => {
      if (error) {
        res.sendServerError(error);
        return;
      }
      
      
      ReflectiveAssessment.findById(reflectiveAssessmentId, (errorRA, reflectiveAssessment) => {
        if (errorRA) {
          res.sendServerError(errorRA);
          return;
        }
        
        if (!reflectiveAssessment) {
          res.sendServerError('No Reflective Assessment Found with id');
          return;
        }

        ReflectiveAssessmentService.handleStop(courseSessionId, req.io);

        const responses = reflectiveAssessment.responses;

        const mostUpvoted = responses.sort((lhs, rhs) => {
          const lhsUpVotes = lhs.votes.filter(v => v.type === 'UP');
          const rhsUpVotes = rhs.votes.filter(v => v.type === 'UP');
          if (lhsUpVotes > rhsUpVotes) {
            return -1
          } else if (lhsUpVotes < rhsUpVotes) {
            return 1
          } else {
            return 0
          }
        });

        let top = [];
        for (let i = 0 ; (i < mostUpvoted.length && i < 5) ; i++) {
          if (mostUpvoted[i].votes.filter(v => v.type === 'UP').length > 0) {
            top.push(mostUpvoted[i]);
          }
        }

        res.send({
          success: true,
          top
        })
      })
    })
  })
});

module.exports = router;
