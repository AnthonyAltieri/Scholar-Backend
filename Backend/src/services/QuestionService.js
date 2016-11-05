/**
 * @author: Anthony Altieri
 */

// Import Schemas

import mongoose from 'mongoose';

import CourseSessionService from '../services/CourseSessionService';
import CourseSessionSchema from '../schemas/CourseSession';
import QuestionsSchema from '../schemas/Question';
import VoteSchema from '../schemas/Vote';
import ConfusionPointSchema from '../schemas/ConfusionPoint';
import InstantAssessmentSchema from '../schemas/InstantAssessment';


// Create models
var CourseSession = mongoose.model('CourseSessions', CourseSessionSchema);
var Question = mongoose.model('Questions', QuestionsSchema);
var ConfusionPoint = mongoose.model('confusionpoints', ConfusionPointSchema);
var InstantAssessment = mongoose.model('instantAssessment', InstantAssessmentSchema);

import PythonShell from 'python-shell';

class QuestionService {
  constructor() {};
  
  static add(data) {
    let courseSessionId = data.courseSessionId;
    let studentId = data.studentId;
    let created = data.created;
    let content = data.content;

    const question = new Question({
      userId: studentId,
      content: content,
      created: created
    });

    CourseSession.findByIdAndUpdate(courseSessionId,
      {
        $push: { 'questions': question }
      },
      {
        safe: true, upsert: true, new: true
      }, (err, courseSession) => {
        if (err) {
          console.error(err);
          return;
        }
        console.log('Question submitted to CourseSession %s from Student %s',
          courseSessionId, studentId);
        
        return courseSession.questions;
      }
    );
    
    return null;
  }

  static getSimilarity(threshold, question, questionList) {
    return new Promise((resolve, reject) => {
      let args = [threshold.toString(), question];
      questionList.forEach(q => {
        args.push(q)
      })
      const options = {
        scriptPath: __dirname + '/../python',
        args
      };
      PythonShell.run('QuestionSimilarity.py', options, (err, results) => {
        if (err) {
          console.log('error: ', err);
          reject(err);
          return
        }

        console.log('ran successfully', results[results.length - 1])

        resolve(parseInt(results[results.length - 1]));
      })
    })
  }
}

module.exports = QuestionService;
