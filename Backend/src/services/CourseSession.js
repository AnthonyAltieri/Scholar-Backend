/**
 * @author Anthony Altieri on 11/13/16.
 */

import mongoose from 'mongoose';
import UserService from '../services/UserService';
import CourseService from '../services/CourseService';
import CourseSessionSchema from '../schemas/CourseSession';
import moment from 'moment';
const CourseSession = mongoose.model('coursesessions', CourseSessionSchema);
import QuestionService from '../services/Question';
import AlertService from '../services/Alert';

import db from '../db';

//TODO: @tonio - account for this in routes
async function getThreshold(id) {
  try {
    const courseSession = await db.findById(id, CourseSession);
    return course;
  } catch (e) {
    return null;
  }
}

//Maps the courseSession object into a consumable object for the client
//We shall populate the courseSession with all required entities here
async function mapToSend(courseSession){
  console.log("Map to send course session");
  try {
    if(!!courseSession && typeof courseSession !== 'undefined'){
      console.log(JSON.stringify(courseSession, null, 2));
      console.log("attendance");
      const attendance = !!courseSession.studentIds
        ? courseSession.studentIds.length
        : 0;
      const questions = await QuestionService
        .getQuestionTrees(courseSession.id);
      console.log('questions', JSON.stringify(questions, null, 2));
      const alerts = await AlertService.findByCourseSessionId(courseSession.id);
      console.log("got alerts");
      //TODO: Add logic for assessments
      return {
        courseSession : {
          questions,
          attendance,
          id: courseSession.id,
          alerts: alerts.map(AlertService.mapToSend),//TODO: Only send number of active alerts
        }
      }
    } else {
      throw new Error("CourseSession not correctly defined for Mapping");
    }
  } catch (e) {
    console.error('[ERROR] CourseSession Service mapToSend', e);
    return null;
  }
}

async function build(courseId, instructorId){
  try {
    //Validate Course & Instructor ID
    const course = await CourseService.findById(courseId);

    if (!course) {
      console.error(`[ERROR] No course found with id: ${courseId}`);
      res.error();
      return;
    }

    const instructor = await UserService.findById(instructorId);

    if (!instructor) {
      console.error(`[ERROR] No user found with id: ${instructorId}`);
      res.error();
      return;
    }

    // TODO: validate that this instructor is allowed to make set change

    //build the courseSession if valid course & instructor
    if (!!CourseService.isInstructorPermittedForCourse(course, instructor)) {
      console.log("Instructor is permitted");
      const courseSession = await db.create(
        {
          courseId,
          instructorIds: [instructor.id]
        },
        CourseSession
      );

      if (!courseSession) {
        return null;
      }

      //successfully created the session
      console.log("Created in service");
      const savedCourse = await CourseService.setActiveCourseSessionId(
        course,
        courseSession.id
      );
      console.log('savedCourse', JSON.stringify(savedCourse, null, 2));
      return courseSession;
    }
  }
  catch (err) {
    throw err;
  }
  console.log("Nothing to return :(");
  return null;
}

async function instructorJoinActiveSession(courseId, instructorId){
  try{
   const courseSession = await joinActiveSession(courseId);
    return courseSession;
  }
  catch (err) {
    throw err;
  }
}

async function studentJoinActiveSession(courseId, studentId){
  try{
    const courseSession = await joinActiveSession(courseId);

    console.log("Student Join Active Session : " + studentId);

    //add student to sessionAttendance
    await addToAttendanceList(studentId, courseSession);
    //send socket notification
    return courseSession;
  }
  catch (err) {
    throw err;
  }
}

function isStudentInCourseSession(studentId, courseSession){
  console.log("Is student in course session?");
  let isStudentAlreadyPresent = false;
  courseSession.studentIds
    .forEach( id => {
      if(id === studentId){
        isStudentAlreadyPresent = true;
      }
    });
  console.log(isStudentAlreadyPresent);
  return isStudentAlreadyPresent;
}

//Adds student to courseSession.studentIds if not already present
async function addToAttendanceList(studentId, courseSession){
  try{
    const user = await UserService.findById(studentId);
    if(!!user && user.type === 'STUDENT'){
      console.log("valid student");
      if(!isStudentInCourseSession(studentId, courseSession)){
        courseSession.studentIds = [...courseSession.studentIds, user.id];
      }
      console.log("appended time to save");
      return await db.save(courseSession);
    }
    else{
      throw new Error("Invalid Student UserId");
    }
  }
  catch (err) {
    throw err;
  }
}

async function joinActiveSession(courseId){

  try {
    let course = await CourseService.findById(courseId);

    if(!!course.activeCourseSessionId) {
      console.log("Activer session id : " + course.activeCourseSessionId);
      return await db.findById(course.activeCourseSessionId, CourseSession);
    }
    else {
      throw new Error("CourseSessionService > joinActiveSession: No Active Session Id");
    }
  }
  catch (err){
    throw err;
  }
}

async function instructorEndSession(courseId, instructorId){
  try {
    const course = await CourseService.findById(courseId);
    if (!course) {
      return null;
    }
    course.activeCourseSessionId = null;
    return await db.save(course);
  } catch (e) {
    console.error('[ERROR] CourseSession Service instructorEndSession', e);
    return null;
  }
}



async function findByCourseId(courseId) {
  try {
    return await db.find({ courseId }, CourseSession);
  } catch (e) {
    console.error('[ERROR] CourseSession service findByCourseId', e)
    return null;
  }
}

async function hasCourseSessionInLast24Hours(courseId) {
  try {
    const courseSessions = await findByCourseId(courseId);
    if (courseSessions.length === 0) return false;
    courseSessions.sort(((a, b) => {
      if (a.created < b.created) {
        return 1;
      } else if (a.created > b.created) {
        return -1;
      } else {
        return 0;
      }
    }));
    const mostRecentCourseSession = courseSessions[0];
    const twentyFourHoursAgo = moment().subtract(1, 'days');
    return !twentyFourHoursAgo
      .isBefore(
        moment(mostRecentCourseSession.created)
      )
  } catch (e) {
    console.error('[ERROR] CourseSession service hasCourseSessionInLast24Hours', e);
    return false;
  }
}

async function getById(id) {
  try {
    return await db.findById(id, CourseSession);
  } catch (e) {
    console.error('[ERROR] CourseSession service getById', e);
    return null;
  }
}

async function save(courseSession) {
  try {
    return await db.save(courseSession);
  } catch (e) {
    console.error('[ERROR] CourseSession service save', e);
    return null;
  }
}

async function setActiveAssessment(courseSessionId, assessmentId, type) {
  try {
    const courseSession = await getById(courseSessionId);
    courseSession.activeAssessmentId = assessmentId;
    courseSession.activeAssessmentType = type;
    return await save(courseSession);
  } catch (e) {
    console.error('[ERROR] CourseSession Service setActiveAssessment', e);
    return null;
  }
}

async function removeActiveAssessment(courseSessionId) {
  try {
    return await setActiveAssessment(courseSessionId, null, null);
  } catch (e) {
    console.error('[ERROR] CourseSession Service removeActiveAssessment', e);
    return null;
  }
}

async function getActiveAssessment(courseSessionId) {
  try {
    const courseSession = await getById(courseSessionId);
    return {
      activeAssessmentType: courseSession.activeAssessmentType,
      activeAssessmentId: courseSessionId.activeAssessmentId,
    }
  } catch (e) {
    console.error('[ERROR] CourseSession Service getActiveAssessment', e);
    return null;
  }
}

export default {
  build,
  instructorEndSession,
  instructorJoinActiveSession,
  studentJoinActiveSession,
  joinActiveSession,
  mapToSend,
  getThreshold,
  findByCourseId,
  getById,
  save,
  setActiveAssessment,
  removeActiveAssessment,
  getActiveAssessment,
}
