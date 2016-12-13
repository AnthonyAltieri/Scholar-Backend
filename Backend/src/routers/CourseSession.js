/**
 * @author Anthony Altieri on 11/13/16.
 */
const express = require('express');
const router = express.Router();

import CourseService from '../services/CourseService';
import CourseSessionService from '../services/CourseSession';
import UserService from '../services/UserService';

router.post('/create', createCourseSession);
router.post('/join/instructor', instructorJoinSession);
router.post('/join/student', studentJoinSession);
router.post('/end', instructorEndSession);

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
  try{
    const {courseId, studentId} = req.body;
    const courseSession = await CourseSessionService.studentJoinActiveSession(courseId, studentId);
    res.send(await CourseSessionService.mapToSend(courseSession));
  }
  catch(err) {
    res.error(err);
  }
  res.end();
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
    res.error(e);
  }
}

export default router;
