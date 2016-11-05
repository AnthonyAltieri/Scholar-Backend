'use strict';

import md5 from '../../node_modules/blueimp-md5/js/md5.min'
import mongoose from 'mongoose';

import DateUtility from '../utilities/DateUtility';
import CourseSessionSchema from '../schemas/CourseSession';
import SocketRouter from '../routers/SocketRouter';
var socketRouter = new SocketRouter();

import db from '../db';

const CourseSession = mongoose.model('coursesessions', CourseSessionSchema)

class CourseSessionService {
  constructor() {};

  static getAlertsInWindow(confusionPoints, windowMinutes) {
      return confusionPoints.filter((c) => DateUtility.diffMinsFromNow(c.created) < windowMinutes);
  }

  static mostRecentConfusion(userId, confusionPoints) {
    const userAlerts = confusionPoints.filter((c) => c.userId.toString() === userId.toString());
    if (userAlerts.length === 0) return null;
    const sortedUserAlerts = userAlerts.sort((l, r) => {
      if (l.created < r.created) {
        return -1;
      } else if (l.created > r.created) {
        return 1;
      } else {
        return 0;
      }
    });
    return sortedUserAlerts[sortedUserAlerts.length - 1];
  }

  static isMostRecentInWindow(userId, confusionPoints, windowMinutes) {
    let confusionPoint = this.mostRecentConfusion(userId, confusionPoints);
    console.log('mostRecentConfusion', JSON.stringify(confusionPoint, null, 2));
    return (confusionPoint)
      ? DateUtility.diffMinsFromNow(confusionPoint.created) <= windowMinutes
      : false;
  }


  /**
   * Determines if a Student is inAttendance in a Course Session, if they are not the Student 
   * is added and the attendance is incremented. If the User was added the Course Session
   * is saved then a socket emit will take place to update the instructors attendance
   * 
   * @param courseSessionId - The id of the Course Session that the Student is joining
   * @param studentId - The id of the Student
   * @param io - The Socket.io connection
   */
  static handleStudentJoin(courseSessionId, studentId, io) {
    CourseSession.findById(courseSessionId, (err, courseSession) => {
      if (err) {
        console.error(`Error finding Course Session by id: ${err}`);
        return;
      }

      if (courseSession) {
        
        // If the user is not inAttendance , update the Course Session
        const student =  courseSession.inAttendance.filter(s => s === studentId)
        if (student.length === 0) {
          // Update attendance metrics
          courseSession.inAttendance.push(studentId);
          courseSession.attendance++;
          
          courseSession.save(error => {
            if (error) {
              console.error(`Error saving Course Session: ${error}`);
              return;
            }

            // Emit to update the instructor's client-side attendance
            io.sockets.emit(`${socketRouter.STUDENT_JOINED}:${courseSessionId}`, {
              attendance: courseSession.attendance
            })
          })
        }
      }
    })
  }

  /**
   * Returns an object that has a true value associated with the id of a question that a user has asked as
   * the key.
   *
   * @param questions {object[]} - A list of questions
   * @param userId {string} - The id of the user whose asked questions are being searched for
   * @returns {object} - That contains a true value for a question id key if the user has asked the
   * question
   */
  static getUserAsked(questions, userId) {
    const userQuestions = questions.filter(q => {
      console.log('q', JSON.stringify(q, null, 2))
      return q.userId.toString() === userId.toString()
    });

    let asked = {};

    userQuestions.forEach(q => { asked[q._id] = true; });

    return asked;
  }

  /**
   * Returns an object that has a true value associated with the id of a question that the user has voted
   * on already.
   *
   * @param questions {object[]} - A list of questions
   * @param userId {string} - The id of the user whose voted on questions are being searched for
   */
  static getUserVotedOn(questions, userId) {
    const votedOn = {};

    questions.forEach(q => {
      const userVotes = q.votes.filter(v =>  v.userId.toString() === userId.toString());

      if (userVotes.length > 0) {
        votedOn[q._id] = true;
      }
    });

    return votedOn
  }


  static handleStudentLeave(courseSessionId, studentId, io) {
    db.findById(courseSessionId, CourseSession)
      .then((courseSession) => {
        courseSession.inAttendance = courseSession.inAttendance.filter(s => s !== studentId);
        courseSession.attendance -= 1;
        db.save(courseSession)
          .then((courseSession) => {
            const emit = `${socketRouter.STUDENT_LEFT}:${courseSessionId}`;
            io.sockets.emit(emit, { attendance: courseSession.attendance })
          })
      })
  }

  static handleAlertAdded(courseSessionId, currentAlerts, io) {
    const emit = `${socketRouter.ALERT_ADDED}:${courseSessionId}`;
    console.log('about to emit: ', emit);
    io.sockets.emit(emit, { currentAlerts })
  }
  

  static handleQuestionsAdd(courseSessionId, questions, io) {
    let emit = `${socketRouter.QUESTION_ADDED}:${courseSessionId}`;
    console.log(`handleAddedQuestion, route: ${emit}`);
    io.sockets.emit(emit, { questions });
  }
  
  static handleQuestionVote(courseSessionId, questionId, vote, io) {
    console.log('CourseSessionService.handleQuestionVote()');
    console.log('questionId', questionId);
    const route = `${socketRouter.VOTED_ON_QUESTION}:${courseSessionId}`;
    io.sockets.emit(route, { questionId, vote });
  }
  
  static handleQuestionDismissed(questions, courseSessionId, io) {
    let route = `${socketRouter.QUESTION_DISMISSED}:${courseSessionId}`;
    console.log('emit: ', route);
    io.sockets.emit(route, { questions });
  }
  
  static handleEnd(courseSessionId, io) {
    const emit = `${socketRouter.COURSE_SESSION_END}:${courseSessionId}`;
    console.log('emitting: ', emit);
    io.sockets.emit(emit, {} );
  }


}

module.exports = CourseSessionService;

