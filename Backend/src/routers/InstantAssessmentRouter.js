'use strict';

import express from 'express';
var router = express.Router();

import mongoose from 'mongoose';

import db from '../db';

// Import Schemas
import InstantAssessmentSchema from '../schemas/InstantAssessment';
import OptionSchema from '../schemas/Option';
import CourseSessionSchema from '../schemas/CourseSession';
import AnswerSchema from '../schemas/Answer';

// Create models
var InstantAssessment = mongoose.model('instantAssessments', InstantAssessmentSchema);
var Option = mongoose.model('options', OptionSchema);
var CourseSession = mongoose.model('courseSessions', CourseSessionSchema);
var Answer = mongoose.model('answers', AnswerSchema);

import InstantAssessmentService from '../services/InstantAssessmentService';

import SocketRouter from '../routers/SocketRouter';
var socketRouter = new SocketRouter();

router.post('/create', create);
router.post('/select/correct', selectCorrectAnswer);

function create(req, res) {
  const { courseSessionId, content, options} = req.body;
  let optionsModels = [];

  if (options.length > 0) {
    options.forEach(o => { optionsModels.push(db.generate({ content: o }, Option)) });
  }
  console.log('\n\n\n')
  console.log('options', options);

  const instantAssessment = db.generate({
    courseSessionId,
    options: optionsModels,
    created: new Date(),
    content: content
  }, InstantAssessment);

  db.save(instantAssessment)
    .then(instantAssessment => {
      InstantAssessmentService.handleStart(courseSessionId, instantAssessment, req.io)

      db.findById(courseSessionId, CourseSession)
        .then(courseSession => {
          courseSession.activeInstantAssessment = instantAssessment._id;
          db.save(courseSession)
            .then(courseSession => {
              res.send({
                instantAssessmentId: instantAssessment._id.toString(),
                success: true,
                error: null
              })
            })
            .catch(error => { res.error(error) })
        })
        .catch(error => { res.error(error) })

    })
    .catch(error => { res.error(error) })
}


// Gets an InstantAssessment
router.post('/get', (req, res) => {
  let id = req.body.id;
  
  InstantAssessment.findById(instandAssessmentId, (err, instantAssessment) => {
    if (err) {
      console.error(`Error finding InstantAssessment by Id: ${err}`);
      return;
    }
    
    res.send({instantAssessment});
  });
});

router.post('/chooseOption', (req, res) => {
  const { userId } = req.session;
  const { answerType } = req.body;
  const { optionIndex } = req.body;
  const { instantAssessmentId } = req.body;
  const { courseSessionId } = req.body;
  
  console.log('/api/instantAssessment/chooseOption');
  
  console.log('courseSessionId', courseSessionId);
  console.log('optionIndex', optionIndex);
  console.log('instantAssessmentId', instantAssessmentId);
  console.log('answerType', answerType);
  console.log('userId', userId);
  
  InstantAssessment.findById(instantAssessmentId, (err, instantAssessment) => {
    if (err) {
      res.sendServerError()
      return;
    }
    
    switch (answerType) {
      case 'SELECT':
        console.log('instantAssessment.answers before:', instantAssessment.answers)
        
        
        
        let answers = instantAssessment.answers
          .filter(a => a.studentId.toString() !== userId.toString());
          
        
        const answer = new Answer({
          studentId: userId,
          optionIndex
        });
        
        console.log('answer');
        console.log(JSON.stringify(answer, null, 2));
        
        console.log('answer');
        console.log(JSON.stringify(answer, null, 2));
        
        answers.push(answer);
        instantAssessment.answers = answers;
        
        console.log('instantAssessment.answers after:', instantAssessment.answers)
        
        instantAssessment.save();
        
        InstantAssessmentService.handleSelection(courseSessionId, req.io, instantAssessment.answers);
        
        res.send({
          success: true,
          answerType,
          index: optionIndex,
          error: false
        });
        return;
      
      case 'UNSELECT': 
        instantAssessment.answers = instantAssessment.answers.filter(a => 
          a.studentId.toString() !== userId.toString()
        );
        
        instantAssessment.save();
        
        InstantAssessmentService.handleSelection(courseSessionId, req.io, instantAssessment.answers);
        
        res.send({
          success: true,
          answerType,
          index: optionIndex,
          error: false
        });
        return;
    }

    res.send({
      success: false
    });
  })
});

router.post('/stop', (req, res) => {
  const { courseSessionId } = req.body;
  const { instantAssessmentId } = req.body;
  
  console.log('instantAssessmentId', instantAssessmentId);
  console.log('courseSessionId', courseSessionId);
  
  CourseSession.findById(courseSessionId, (err, courseSession) => {
    if (err) {
      res.sendServerError();
      return
    }
    
    InstantAssessment.findById(instantAssessmentId, (error, instantAssessment) => {
      if (error) {
        res.sendServerError();
        return;
      }
      
      const result = (instantAssessment.answers) 
        ? InstantAssessmentService.determineVotes(instantAssessment.answers)
        : { A:0, B:0, C:0, D:0, E:0 };
      
      InstantAssessmentService.handleStop(courseSessionId, req.io, result);
      

      courseSession.activeInstantAssessment = null;
      
      courseSession.save(errorCourseSession => {
        if (errorCourseSession) {
          res.sendServerError();
          return;
        }
        
        instantAssessment.save(errorInstantAssessment => {
          if (errorInstantAssessment) {
            res.sendServerError();
            return;
          }
          
          res.send({
            success: true,
            error: null
          })
        })
      })
    })
    
  })
  
});

function selectCorrectAnswer(req, res){
  const {instantAssessmentId, correctIndex} = req.body;
  db.findById(instantAssessmentId, InstantAssessment)
      .then(instantAssessment => {
        /*
        TODO: Error checking here if required
         */
        instantAssessment.correctIndex = correctIndex;
        db.save(instantAssessment)
            .then( instantAssessment =>
            {
              res.success();
            })
            .catch(error => {res.error(error)});

      }).catch(error => {res.error(error)});
}
module.exports = router;