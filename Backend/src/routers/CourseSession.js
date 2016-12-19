/**
 * @author Anthony Altieri on 11/13/16.
 */
const express = require('express');
const router = express.Router();

import CourseService from '../services/CourseService';
import CourseSessionService from '../services/CourseSession';
import InstantService from '../services/InstantAssessment';
import ReflectiveService from '../services/ReflectiveAssessment';
import UserService from '../services/UserService';

router.post('/create', createCourseSession);
router.post('/join/instructor', instructorJoinSession);
router.post('/join/student', studentJoinSession);
router.post('/end', instructorEndSession);
router.post('/get/activeAssessment', getActiveAssessment);
router.post('/attendance/create/code', createAttendanceCode);
router.post('/attendance/end', endAttendance);
router.post('/attendance/join', joinAttendance);

async function createCourseSession(req, res){
  const {
    courseId,
    instructorId
  } = req.body;

  try{
    console.log("Create in router");
    const courseSession = await CourseSessionService.build(courseId, instructorId);
    console.log("Post build in router");
    if (!courseSession) {
      res.error();
    }
    res.send({ courseSessionId: courseSession.id });
  } catch (e) {
    res.error();
  }
}

async function instructorJoinSession(req, res) {
  try {
    const {courseId, instructorId} = req.body;
    const courseSession = await CourseSessionService.instructorJoinActiveSession(courseId, instructorId);
    res.send(await CourseSessionService.mapToSend(courseSession));
  } catch (e) {
    console.error('[ERROR] CourseSession Router instructorJoinSession', e);
    res.error();
  }
}

async function studentJoinSession(req, res){
  try {
    const {courseId, studentId} = req.body;
    const courseSession = await CourseSessionService
      .studentJoinActiveSession(courseId, studentId);
    res.send(await CourseSessionService.mapToSend(courseSession));
  } catch(err) {
    res.error();
  }
}

async function instructorEndSession(req, res){
  try {
    const { courseId, instructorId } = req.body;
    const course = await CourseSessionService
      .instructorEndSession(courseId, instructorId);
    if (!course) {
      res.error();
    }
    res.success();
  } catch (e) {
    console.error('[ERROR] CourseSession router instructorEndSession', e);
    res.error();
  }
}

async function getActiveAssessment(req, res) {
  const { courseSessionId } = req.body;
  try {
    const result = await CourseSessionService.getActiveAssessment(courseSessionId);
    if (!result) {
      res.error();
      return;
    }
    const { activeAssessmentType, activeAssessmentId } = result;
    if (!activeAssessmentId) {
      res.send({})
      return;
    }
    if (activeAssessmentType === 'INSTANT') {
      const instantAssessment = await InstantService
        .getById(activeAssessmentId);
      res.send({
        activeAssessmentType,
        activeAssessment: {
          options: instantAssessment.options,
          question: instantAssessment.question,
          id: activeAssessmentId,
          answers: instantAssessment.answers.map(a => ({
            optionIndex: a.optionIndex,
            userId: a.userId,
          })),
        }
      })
    } else if (activeAssessmentType === 'REFLECTIVE') {
      const reflectiveAssessment = await ReflectiveService
        .getById(activeAssessmentId);
      const answers = await ReflectiveService.getAnswers(activeAssessmentId);
      const numberAnswers = answers.length;
      const numberReviews = answers.reduce((a, c) => a + c.reviews.length, 0);
      res.send({
        activeAssessmentType,
        activeAssessment: {
          numberAnswers,
          numberReviews,
          id: activeAssessmentId,
          question: reflectiveAssessment.question,
        }
      })

    } else {
      throw new Error(
        `Invalid active assessment type ${activeAssessmentType}`
      );
    }
  } catch (e) {
    console.error('[ERROR] CourseSession router getActiveAssessment', e);
    res.error();
  }
}

async function createAttendanceCode(req, res){
  try {
    const { courseSessionId } = req.body;
    console.log("Create Attendance code for : " + courseSessionId);
    const courseSession = await CourseSessionService.createAttendanceCode( courseSessionId );
    res.send({ code : courseSession.attendanceCode });
  } catch (e) {
    console.error('[ERROR] CourseSession Router > createAttendanceCode : ' + e);
    res.error();
  }
}

async function endAttendance(req, res) {
  try {
    const { courseSessionId } = req.body;
    console.log("End attendance for : " + courseSessionId);
    res.send(await CourseSessionService.destroyAttendanceCode(courseSessionId));
  } catch (e) {
    console.error('[ERROR] CourseSession Router > endAttendance : ' + e);
    res.error();
  }
}

async function joinAttendance(req, res) {
  try {
    const { courseSessionId, code, userId } = req.body;
    res.send(await CourseSessionService.studentJoinAttendance(courseSessionId, code, userId));
  }
  catch (e) {
    console.error('[ERROR] CourseSession Router > joinAttendance : ' + e);
    res.error();
  }
}
export default router;
