import mongoose from 'mongoose';

import SocketRouter from '../routers/SocketRouter';
var socketRouter = new SocketRouter();

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



class ReflectiveAssessmentService {
  
  constructor(){}
  
  static handleCreation(courseSessionId, io, reflectiveAssessment) {
    let route = `${socketRouter.REFLECTIVE_ASSESSMENT_START}:${courseSessionId}`;
    console.log(`emiting ${route}`);
    io.sockets.emit(route, {
      id: reflectiveAssessment._id,
      created: reflectiveAssessment.created,
      prompt: reflectiveAssessment.question.content
    });
  }
  
  static handleResponse(courseSessionId, io, responses, userId) {
    let routeStudent = `${socketRouter.REFLECTIVE_ASSESSMENT_RESPONSE}:${courseSessionId}`;
    const routeInstructor = `${socketRouter.RA_RESPONSE_NUMBER}:${courseSessionId}`;

    io.sockets.emit(routeStudent, { responses });
    io.sockets.emit(routeInstructor, { number: responses.length });
  }
  
  static handleResponseReviewed(courseSessionId, io, number) {
    const route = `${socketRouter.RA_RESPONSE_REVIEWED}:${courseSessionId}`;
    io.sockets.emit(route, { number });
  }
  
  
  static handleStop(courseSessionId, io) {
    const emit = `${socketRouter.REFLECTIVE_ASSESSMENT_STOP}:${courseSessionId}`;

    console.log(`about to emit: ${emit}`);
    io.sockets.emit(emit, {});
    
  }
}

module.exports = ReflectiveAssessmentService;
