'use strict';

import mongoose from 'mongoose';

import SocketRouter from '../routers/SocketRouter';
var socketRouter = new SocketRouter();

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

class InstantAssessmentService {
  constructor() {}
  
  static save (data) {
    let courseSessionId = data.courseSessionId;
    let optionContents = data.options;
    let options = [];

    for (let i = 0 ; i < optionContents.length ; i++) {
      let option = new Option({
        content: optionContents[i]
      });
      options.push(option);
    }

    const instantAssessment = new InstantAssessment({
      courseSessionId: courseSessionId,
      options: options
    });

    instantAssessment.save(err => {
      if (err) {
        console.error(err);
        return null;
      }

      console.log('Added InstantAssessment for CourseSession %s', courseSessionId);
      return instantAssessment;
    });
  }
  
  static handleStart(courseSessionId, instantAssessment, io) {
    const emit = `${socketRouter.INSTANT_ASSESSMENT_START}:${courseSessionId}`;
    
    console.log('emitting');
    console.log(emit);
    
    io.sockets.emit(emit, {
      id: instantAssessment._id.toString(),
      created: instantAssessment.created,
      prompt: instantAssessment.content || '',
      options: instantAssessment.options
    });
  }

  static determineVotes(answers) {
    let result = {
      A: 0,
      B: 0,
      C: 0,
      D: 0,
      E: 0
    };

    answers.forEach(a => {
      switch(a.optionIndex) {
        case 0:
          result.A++;
          break;
        
        case 1:
          result.B++;
          break;
        
        case 2:
          result.C++;
          break;
        
        case 3:
          result.D++;
          break;
        
        case 4:
          result.E++;
          break;
      }
    });
    
    return result;
  }
  
  static handleSelection(courseSessionId, io, answers) {
    const answerObject = this.determineVotes(answers);
    
    const emit = `${socketRouter.MC_SELECTION_MADE}:${courseSessionId}`;
    console.log('emit: ', emit);
    io.sockets.emit(emit, { answerObject });
  }
  
  static handleStop(courseSessionId, io, result) {
    const route = `${socketRouter.MC_STOP}:${courseSessionId}`;
    console.log('emit: ', route);
    io.sockets.emit(route, { result });
  }
}

module.exports = InstantAssessmentService;
