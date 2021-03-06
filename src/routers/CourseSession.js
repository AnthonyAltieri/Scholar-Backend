/**
 * @author Anthony Altieri on 11/13/16.
 */
const express = require('express');
const router = express.Router();

import CourseService from '../services/CourseService';
import moment from 'moment-timezone';
import CourseSessionService from '../services/CourseSession';
import InstantService from '../services/InstantAssessment';
import ReflectiveService from '../services/ReflectiveAssessment';
import UserService from '../services/UserService';
import * as DateUtil from '../utilities/Date';
import Socket from '../services/Socket';
import Events from '../services/Events';

router.post('/create', createCourseSession);
router.post('/join/instructor', instructorJoinSession);
router.post('/join/student', studentJoinSession);
router.post('/end', instructorEndSession);
router.post('/get/activeAssessment', getActiveAssessment);
router.post('/attendance/create/code', createAttendanceCode);
router.post('/attendance/end', endAttendance);
router.post('/attendance/join', joinAttendance);
router.post('/numberInCourseSession/get', numberInCourseSessionGet);
router.post('/attendance/get', getNumberInAttendance);
router.post('/get/mostRecent', getMostRecent);
router.post('/get/report', getSessionReport);

async function createCourseSession(req, res){
  const {
    courseId,
    instructorId,
  } = req.body;
  try {
    console.log("------------------------------------------------------");
    console.log("instructorCreateSession");
    console.log(`courseId=${courseId}, instructorId=${instructorId}`);

    const courseSession = await CourseSessionService.requestNewCourseSession(
      courseId,
      instructorId
    );
    if (!courseSession) {
      res.error();
    }
    res.send({
      courseSessionId: courseSession.id,
      numberInCourseSession: courseSession.studentIds.length,
      numberAttendees: courseSession.attendanceIds.length,
    });

    console.log(`Sending Session = ${courseSession.id}`);

  } catch (e) {
    res.error();
  }
}

async function instructorJoinSession(req, res) {
  try {
    const {courseId, instructorId} = req.body;
    console.log("------------------------------------------------------");
    console.log("instructorJoinSession");
    console.log(`courseId=${courseId}, instructorId=${instructorId}`);
    const courseSession = await CourseSessionService.instructorJoinActiveSession(courseId, instructorId);
    res.send(await CourseSessionService.mapToSend(courseSession));
    console.log(`Sending Session = ${courseSession.id}`);
  } catch (e) {
    console.error('[ERROR] CourseSession Router instructorJoinSession', e);
    res.error();
  }
}

async function studentJoinSession(req, res){
  try {
    const {courseId, studentId} = req.body;
    console.log("------------------------------------------------------");
    console.log("studentJoinSession");
    console.log(`courseId=${courseId}, studentId=${studentId}`);
    const courseSession = await CourseSessionService
      .studentJoinActiveSession(courseId, studentId);
    Socket.send(
      Socket.generatePrivateChannel(courseSession.id),
      Events.STUDENT_JOINED_COURSESESSION,
      { numberInCourseSession: courseSession.studentIds.length }
    );
    res.send(await CourseSessionService.mapToSend(courseSession));
    console.log(`Sending Session = ${courseSession.id}`);

  } catch(e) {
    console.error('[ERROR] CourseSession Router studentJoinSession', e);
    res.error();
  }
}

async function instructorEndSession(req, res){
  try {
    const { courseId, instructorId } = req.body;
    const courseSessionId = await CourseSessionService
      .instructorEndSession(courseId, instructorId);
    if (!courseSessionId) {
      res.error();
      return;
    }
    Socket.send(
      Socket.generatePrivateChannel(courseSessionId),
      Events.END_COURSESESSION,
      {}
    );
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
      res.send({});
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
    const courseSession = await CourseSessionService
      .createAttendanceCode(courseSessionId);
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
    await CourseSessionService.destroyAttendanceCode(courseSessionId);
    res.send({success: true});
  } catch (e) {
    console.error('[ERROR] CourseSession Router > endAttendance : ' + e);
    res.error();
  }
}

export async function joinAttendance(req, res) {
  try {
    const { courseSessionId, code, userId } = req.body;
    console.log("------------------------------------------------------");
    console.log("Student Join Attendance");
    console.log(`courseSessionId=${courseSessionId}, studentId=${userId}, code=${code}`);
    const payload = await CourseSessionService.studentJoinAttendance(
      courseSessionId,
      code,
      userId
    );

    if (payload.attendance) {
      console.log(`Success, new attendance=${payload.attendance}`);
      res.send({ attendance: payload.attendance });
      Socket.send(
        Socket.generatePrivateChannel(courseSessionId),
        Events.STUDENT_JOINED_ATTENDANCE,
        { attendance: payload.attendance }
      );
    }
    else {
      console.log(`Erroneous Result=${payload}`);
      res.send(payload);
    }
  }
  catch (e) {
    console.error('[ERROR] CourseSession Router > joinAttendance : ' + e);
    res.error();
  }
}
async function getNumberInAttendance(req, res) {
  try {
    const { courseSessionId } = req.body;
    const courseSession = await CourseSessionService.getById(courseSessionId);
    if(!!courseSession) {
      res.send({ attendance : courseSession.attendanceIds.length})
    }
    else {
      console.error("[ERROR] CourseSession Router > getNumberInAttendance : CourseSession Not Found");
      res.error();
    }

  }
  catch (e) {
    console.error("[ERROR] CourseSession Router > getNumberInAttendance : " + e);
    res.error();
  }
}
async function numberInCourseSessionGet(req, res) {
  const { courseSessionId } = req.body;
  try {
    const courseSession = await CourseSessionService
      .getById(courseSessionId);
    res.send({
      numberInCourseSession: courseSession.studentIds.length,
    })
  } catch (e) {
    console.error(
      '[ERROR] CourseSession Router numberInCourseSessionGet',
      e
    );
    res.error();
  }
}

async function getMostRecent(req, res) {
  const { courseId } = req.body;
  try {
    const result = await CourseSessionService.getMostRecent(courseId);
    if (!!result.none) {
      console.log('most recent CourseSession : NONE');
      res.send({
        none: true,
      });
      return;
    }
    console.log(
      'most recent CourseSession',
      moment(result.mostRecentCourseSession).format('l')
    );

    const shouldCreateNewCourseSession = DateUtil
      .shouldCreateNewCourseSession(result.mostRecentCourseSession.created);
    if (!!shouldCreateNewCourseSession
        && !!result.mostRecentCourseSession.isActive) {
      await CourseService.removeActiveCourseSession(courseId);
      await CourseSessionService.makeInactive(
        result.mostRecentCourseSession.id
      );
    }
    res.send({
      none: false,
      mostRecentCourseSession: result.mostRecentCourseSession,
    })
  } catch (e) {
    console.error('[ERROR] CourseSession Router getMostRecent', e);
    res.error();
  }
}


async function getSessionReport(req, res) {
  try {
    const { courseSessionId } = req.body;
    res.send(await CourseSessionService.getSessionReport(courseSessionId));

  }
  catch (e) {
    console.error("[ERROR] in CourseSessionRouter > getSessionReport : ", e);
    res.error();
  }
}

export default router;
