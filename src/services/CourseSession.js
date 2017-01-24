/**
 * @author Anthony Altieri on 11/13/16.
 */

import mongoose from 'mongoose';
import CourseService from '../services/CourseService';
import CourseSessionSchema from '../schemas/CourseSession';
import SchoolSchema from '../schemas/School'
import moment from 'moment';
import QuestionService from '../services/Question';
import UserService from '../services/UserService';
import AlertService from '../services/Alert';
import InstantAssessmentService from '../services/InstantAssessment';
import InstantAssessmentAnswerService from '../services/InstantAssessmentAnswer'
import ReflectiveAssessmentService from '../services/ReflectiveAssessment'
import ReflectiveAssessmentAnswerService from '../services/ReflectiveAssessmentAnswer'
import ShortIdUtil from '../utilities/ShortIdUtil';
import db from '../db';
import * as DateUtil from '../utilities/Date'

const CourseSession = mongoose.model('coursesessions', CourseSessionSchema);
const School = mongoose.model('schools', SchoolSchema);
const ATTENDANCE_CODE_LENGTH = 4;
const ATTENDANCE_CODE_POOL = 'abcdefghjkmnpqrstuvwxyz123456789';

//TODO: @tonio - account for this in routes
//TODO: complete this function
async function getThreshold(id) {
  try {
    const courseSession = await db.findById(id, CourseSession);
    return courseSession;
  } catch (e) {
    return null;
  }
}

//Maps the courseSession object into a consumable object for the client
//We shall populate the courseSession with all required entities here
async function mapToSend(courseSession){
  try {
    if (!!courseSession) {
      const attendance = !!courseSession.studentIds
        ? courseSession.studentIds.length
        : 0;
      const questions = await QuestionService
        .getQuestionTrees(courseSession.id);
      const alerts = await AlertService
        .findByCourseSessionId(courseSession.id);
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

async function build(course, instructor){
  try {
    const created = new Date();
    return await db.create(
      {
        courseId: course.id,
        instructorIds: [instructor.id],
        lastActiveTime: new Date(),
        created,
      },
      CourseSession
    );
  } catch (e) {
    console.error('[ERROR] CourseSession Service build', e);
    return null;
  }
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
      user.textBoundSession = courseSession.id;
      user.textBoundCourse = courseSession.courseId;
      await db.save(user);
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
    const course = await CourseService.getById(courseId);
    if (!course) {
      throw new Error(`No course found with id ${courseId}`);
    }
    const oldActiveCourseSession = course.activeCourseSessionId;
    course.activeCourseSessionId = null;
    await db.save(course);
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
    // TODO: use the timezonned "now" to subtract a day from
    const twentyFourHoursAgo = moment().subtract(1, 'days');
    return !twentyFourHoursAgo.isBefore(
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
      activeAssessmentId: courseSession.activeAssessmentId,
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
  let code = ShortIdUtil.generateShortIdWithRequirements(
    ATTENDANCE_CODE_LENGTH,
    ATTENDANCE_CODE_POOL
  );

  while (!!(await findByAttendanceCode(code))) {
    code = ShortIdUtil.generateShortIdWithRequirements(
      ATTENDANCE_CODE_LENGTH,
      ATTENDANCE_CODE_POOL
    );
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
  return !!courseSession.attendanceIds.filter(id => id === userId)[0];
}

async function studentJoinAttendance(courseSessionId, code, userId) {
  try {
    const courseSession = await getById(courseSessionId);
    if (!courseSession) {
      throw new Error("Invalid Course Session Id : " + courseSessionId);
    }
    const { attendanceCode } = courseSession;
    if (!attendanceCode) return { isAttendanceClosed: true };
    if (attendanceCode.toLowerCase() !== code.toLowerCase()){
      return { invalidCode: true }
    }
    if (!isStudentInAttendance(courseSession, userId)){
      courseSession.attendanceIds = [...courseSession.attendanceIds, userId];
      await db.save(courseSession);
      return { attendance: courseSession.attendanceIds.length };
    } else {
      return { studentAlreadyInAttendance: true };
    }
  } catch (e) {
    console.error(
      '[ERROR] CourseSession Service > studentJoinAttendance : ',
      e
    );
    return null;
  }
}

async function requestNewCourseSession(courseId, instructorId) {
  try {
    const result = await getMostRecent(courseId);
    if (!!result && !result.none) {
      const instructor = await UserService.getById(instructorId);
      const school = await db.findById(instructor.schoolId, School);
      let timeZone = school.timezoneName;
      if (!timeZone) timeZone = 'America/Los_Angeles';
      const needsNewCourseSession = DateUtil.shouldCreateNewCourseSession(
        result.mostRecentCourseSession.created,
        timeZone
      );
      if (!needsNewCourseSession) {
        const course = await CourseService.getById(courseId);
        course.activeCourseSessionId = result.mostRecentCourseSession.id;
        await db.save(course);
        result.mostRecentCourseSession.lastActiveTime = new Date();
        await db.save(result.mostRecentCourseSession);
        return result.mostRecentCourseSession;
      } else {
        const course = await CourseService.getById(courseId);
        const courseSession = await build(course, instructor);
        course.activeCourseSessionId = courseSession.id;
        await db.save(course);
        return courseSession;
      }
    } else {
      const course = await CourseService.getById(courseId);
      const instructor = await UserService.getById(instructorId);
      const school = await db.findById(instructor.schoolId, School);
      const timeZone = school.timezoneName;
      const courseSession = await build(course, instructor, timeZone);
      course.activeCourseSessionId = courseSession.id;
      await db.save(course);
      return courseSession;
    }
  } catch (e) {
    console.error(
      '[ERROR] CourseSession Service getMostRecentCourseSession',
      e
    );
    return null;
  }
}

async function getMostRecent(courseId) {

  try {
    const courseSessions = await findByCourseId(courseId);
    if (courseSessions.length === 0) {
      return {
        none: true,
      }
    }
    const filteredCourseSessions = courseSessions
      .sort((a, b) => {
        if (a.created < b.created) return -1;
        if (b.created > a.created) return 1;
        return 0;
      });
    return {
      mostRecentCourseSession: filteredCourseSessions[0],
      none: false,
    }
  } catch (e) {
    console.error('[ERROR] CourseSession Service getMostRecent', e);
    return null;
  }
}

async function makeInactive(courseSessionId) {
  try {
    const courseSession = await getById(courseSessionId);
    courseSession.isActive = false;
    return await db.save(courseSession);
  } catch (e) {
    console.error('[ERROR] CourseSession Service makeInactive', e);
    return null;
  }
}

async function getSessionReport(courseSessionId) {
  try {
    const courseSession = await getById(courseSessionId);
    const course = await CourseService.getById(courseSession.courseId);
    const questionsInSession = await QuestionService.findByCourseSessionId(courseSessionId);
    const questionsDismissed = questionsInSession.filter( q => q.isDismissed === true);
    const questionsEndorsed = questionsInSession.filter( q => q.isEndorsed === true);
    const questionsFlagged = questionsInSession.filter( q => q.isFlagged === true);


    const numberPresent = await getNumberInCourseSession(courseSessionId);
    const numberInAttendance = await getNumberInAttendance(courseSessionId);
    const alerts = await AlertService.getInCourseSession(courseSessionId);

    const instantAssessments = await InstantAssessmentService.getInCourseSession(courseSessionId);
    let numberInstantAnswers = 0;
    let numberCorrectInstantAnswers = 0;

    instantAssessments.forEach( (assessment) => {
      if(!!assessment.answers){
        numberInstantAnswers += assessment.answers.length;
        numberCorrectInstantAnswers += InstantAssessmentService.getNumberCorrectlyAnswered(assessment);
      }
    });

    const reflectiveAssessments = await ReflectiveAssessmentService.getInCourseSession(courseSessionId);

    let numberReflectiveAnswers = 0;

    for(let assessment of reflectiveAssessments) {
      const reflectiveAnswers = await ReflectiveAssessmentAnswerService.getByAssessmentId(assessment.id);
      numberReflectiveAnswers += !!reflectiveAnswers ? reflectiveAnswers.length : 0;
    };

    const date = new Date(courseSession.created);

    let stats = {
      course : course.abbreviation,
      date : (date.getMonth()+1) + '-'+date.getDate() +'-' + date.getFullYear(),
      numberQuestions : questionsInSession.length,
      numberQuestionsDismissed : questionsDismissed.length,
      numberQuestionsEndorsed : questionsEndorsed.length,
      numberQuestionsFlagged : questionsFlagged.length,
      numberAlerts : alerts.length,
      numberStudentsPresent : numberPresent,
      numberInAttendance : numberInAttendance,
      numberInstantAssessments : instantAssessments.length,
      numberInstantAnswers : numberInstantAnswers,
      numberCorrectInstantAnswers : numberCorrectInstantAnswers,
      numberReflectiveAssessments : reflectiveAssessments.length,
      numberReflectiveAnswers : numberReflectiveAnswers
    };

    return stats;

  }
  catch (e) {
    console.error("[ERROR] in CourseSessionService > getSessionReport : " + e);
  }
}

async function getNumberInCourseSession(courseSessionId){
  try {
    const courseSession = await getById(courseSessionId);

    return courseSession.studentIds.length;
  }
  catch (e) {
    console.error('[ERROR] CourseSessionService > getNumberInCourseSession : ' + e);
    throw e;
  }
}
async function getNumberInAttendance(courseSessionId){
  try {
    const courseSession = await getById(courseSessionId);

    return courseSession.attendanceIds.length;
  }
  catch (e) {
    console.error('[ERROR] CourseSessionService > getNumberInAttendance : ' + e);
    throw e;
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
  getMostRecent,
  makeInactive,
  getSessionReport,
  getNumberInCourseSession,
  getNumberInAttendance
}
