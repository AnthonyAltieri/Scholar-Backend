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
import ShortIdUtil from '../utilities/ShortIdUtil';
import db from '../db';

const ATTENDANCE_CODE_LENGTH = 4;
const ATTENDANCE_CODE_POOL = 'ABCDEFGHUJKLMNOPQRSTUVWXYZ1234567890';

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
  try {
    if(!!courseSession && typeof courseSession !== 'undefined'){
      const attendance = !!courseSession.studentIds
        ? courseSession.studentIds.length
        : 0;
      const questions = await QuestionService
        .getQuestionTrees(courseSession.id);
      const alerts = await AlertService.findByCourseSessionId(courseSession.id);
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
      const savedCourse = await CourseService.setActiveCourseSessionId(
        course,
        courseSession.id
      );
      return courseSession;
    }
  }
  catch (err) {
    throw err;
  }
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
  try {
    const courseSession = await joinActiveSession(courseId);
    return await addToAttendanceList(studentId, courseSession);
  } catch (e) {
    console.error(
      '[ERROR] CourseSession Service studentJoinActiveSession',
      e
    );
    return null;
  }
}

function isStudentInCourseSession(studentId, courseSession){
  return !!courseSession.studentIds.filter(s => s === studentId)[0];
}

//Adds student to courseSession.studentIds if not already present
async function addToAttendanceList(studentId, courseSession){
  try{
    const user = await UserService.findById(studentId);
    if(!!user && user.type === 'STUDENT'){
      if(!isStudentInCourseSession(studentId, courseSession)){
        courseSession.studentIds = [...courseSession.studentIds, user.id];
      }
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
      return await db.findById(course.activeCourseSessionId, CourseSession);
    } else {
      throw new Error("CourseSessionService > joinActiveSession: No Active Session Id");
    }
  }
  catch (e){
    console.error('[ERROR] CourseSession Service joinActiveSession', e);
    throw e;
  }
}

async function instructorEndSession(courseId, instructorId){
  try {
    const course = await CourseService.findById(courseId);
    if (!course) {
      return null;
    }
    const oldActiveCourseSession = course.activeCourseSessionId;
    course.activeCourseSessionId = null;
    const result = await db.save(course);
    if (!result) {
      return null;
    }
    return oldActiveCourseSession;
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
    const oldAssessmentId = courseSession.activeAssessmentId;
    courseSession.activeAssessmentId = assessmentId;
    courseSession.activeAssessmentType = type;
    await save(courseSession);
    return oldAssessmentId;
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

async function findByAttendanceCode(code) {
  try {
    let courseSession = await db.findOne({attendanceCode : code}, CourseSession);

    if(!!courseSession){
      return courseSession;
    }
    else {
      console.info("[INFO] Coursesession Service > findByattendanceCode :  No course found with code " + code);
      return null;
    }

  }
  catch (e) {
    console.error('[ERROR] CourseSession Service > findByAttendanceCode :  ', e);
    throw e;
  }
}
async function generateUniqueAttendanceCode() {
  let code = ShortIdUtil.generateShortIdWithRequirements(ATTENDANCE_CODE_LENGTH, ATTENDANCE_CODE_POOL);

  while(!!(await findByAttendanceCode(code))){
    console.info("[INFO] CourseSession Service > createAttendanceCode : Attendance Code Already in use - " + code );
    code = ShortIdUtil.generateShortIdWithRequirements(ATTENDANCE_CODE_LENGTH, ATTENDANCE_CODE_POOL);
  }

  return code;
}
async function createAttendanceCode(courseSessionId) {
  try {
    let code = await generateUniqueAttendanceCode();
    let courseSession = await db.findById(courseSessionId, CourseSession);

    if(!courseSession) {
      throw new Error("Invalid Course Session Id : " + courseSessionId);
    }

    courseSession.attendanceCode = code;
    return await db.save(courseSession);
  }
  catch (e) {
    console.error('[ERROR] CourseSession Service > createAttendanceCode : ', e);
    return null;
  }
}

async function destroyAttendanceCode(courseSessionId) {
  try {

    let courseSession = await db.findById(courseSessionId, CourseSession);
    if(!courseSession) {
      throw new Error("Invalid Course Session Id : " + courseSessionId);
    }

    courseSession.attendanceCode = null;
    await db.save(courseSession);
    return courseSession;
  } catch (e) {
    console.error('[ERROR] CourseSession Service > destroyAttendanceCode : ', e);
    return null;
  }
}

function isStudentInAttendance(courseSession, userId) {
  try {
    return ((courseSession.attendanceIds.filter( (u) => { return u === userId;})).length > 0) ;
  }
  catch (e) {
    console.error('[ERROR] CourseSession Service > isStudentInAttendance : ', e);
    throw e;
  }
}

async function studentJoinAttendance(courseSessionId, code, userId) {
  try {
    let courseSession = await db.findById(courseSessionId, CourseSession);

    if(!courseSession) {
      throw new Error("Invalid Course Session Id : " + courseSessionId);
    }

    if(courseSession.attendanceCode !== code){
      console.error(console.error('[ERROR] CourseSession Service > studentJoinAttendance : Incorrect Code ', code));
      console.info('[INFO] CourseSession Service > studentJoinAttendance : Correct Code ', courseSession.attendanceCode);
      if(!courseSession.attendanceCode){
        return ({isAttendanceClosed : true})
      }
      return ({invalidCode : true});
    }
    //attempt to add student
    if(!isStudentInAttendance(courseSession, userId)){
      courseSession.attendanceIds = [...courseSession.attendanceIds, userId];
      await db.save(courseSession);
      return {attendance : courseSession.attendanceIds.length};
    }
    else{
      return ({studentAlreadyInAttendance : true});
    }
  } catch (e) {
    console.error('[ERROR] CourseSession Service > studentJoinAttendance : ', e);
    return null;
  }
}

async function requestNewCourseSession(courseId, instructorId) {
  try {
    const courseSessions = await db.find({ courseId }, CourseSession);
    const mostRecentCourseSession = courseSessions
      .slice(0)
      .sort((l, r) => {
          if (l.created < r.created) {
            return 1;
          } else if (l.created > r.created) {
            return -1;
          } else {
            return 0;
          }
        })[0];
    const now = new Date();
    const isSameDateAs = (lhs, rhs) => (
      lhs.getFullYear() === rhs.getFullYear() &&
      lhs.getMonth() === rhs.getMonth() &&
      lhs.getDate() === rhs.getDate()
    );
    if (!!mostRecentCourseSession &&
        isSameDateAs(now, mostRecentCourseSession.created)) {
      const course = await CourseService.findById(mostRecentCourseSession.courseId);
      course.activeCourseSessionId = mostRecentCourseSession.id;
      await db.save(course);
      return mostRecentCourseSession;
    } else {
      return await build(courseId, instructorId);
    }
  } catch (e) {
    console.error(
      '[ERROR] CourseSession Service getMostRecentCourseSession',
      e
    );
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
  createAttendanceCode,
  destroyAttendanceCode,
  studentJoinAttendance,
  findByAttendanceCode,
  requestNewCourseSession,
}
