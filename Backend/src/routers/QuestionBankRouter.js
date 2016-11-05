'use strict';

import express from 'express';
var router = express.Router();

import mongoose from 'mongoose';

// Import Schemas
import QuestionBankSchema from '../schemas/QuestionBank'
import ReflectiveAssessmentSchema from '../schemas/ReflectiveAssessment'
import QuestionSchema from '../schemas/Question'
import ResponseSchema from '../schemas/Response'

// Create Models
const QuestionBank = mongoose.model('questionbanks', QuestionBankSchema);
const ReflectiveAssessment = mongoose.model('reflectiveassessments', ReflectiveAssessmentSchema);
const Question = mongoose.model('questions', QuestionSchema);
const Response = mongoose.model('responses', ResponseSchema);

// Gets a QuestionBank by id
router.post('/get', (req, res) => {
  let id = req.body.id;
  
  QuestionBank.findById(id, (err, questionBank) => {
    if (err) {
      console.error(`Error finding QuestionBank: ${err}`);
      return;
    }
    
    res.send(questionBank);
    res.end();
  });
});


// Adds, or saves, a QuestionBank
router.post('/save', (req, res) => {
  let courseId = req.body.courseId;
  let bank = [];
  
  const questionBank = new QuestionBank({
    courseId,
    bank
  });
  
  questionBank.save(err => {
    if (err) {
      console.error(`Error saving QuestionBank: ${err}`);
    }
    res.end();
  });
});



