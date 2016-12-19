/**
 * Created by bharatbatra on 11/8/16.
 */
var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');

import SchoolService from '../services/SchoolService';
import CourseService from '../services/CourseService';
import BankedAssessmentService from '../services/BankedAssessment';

router.post('/create', createCourse);
router.post('/get/all', getAll);
router.post('/get/active', getActive);
router.post('/get/user', getUser);
router.post('/set/activationStatus', setActivationStatus);
router.post('/enroll/student', enrollStudent);
router.post('/add/bankedAssessment', addBankedAssessment);
router.post('/get/bankedAssessments', getBankedAssessments);
router.post('/grades/summary', gradesSummary);

async function createCourse(req, res){
    const {
      instructorId,
      instructorName,
      schoolId,
      subject,
      term,
      title,
      abbreviation,
      timeStart,
      timeEnd,
      dateStart,
      dateEnd,
      days,
    } = req.body;
  console.log('req.body', JSON.stringify(req.body, null, 2));

    try {
      const course = await CourseService
        .buildCourse(
          instructorId,
          instructorName,
          schoolId,
          title,
          subject,
          abbreviation,
          term,
          timeStart,
          timeEnd,
          dateStart,
          dateEnd,
          days,
        );
      if (!course) {
        res.error();
      }
      const user = await CourseService.saveToUser(instructorId, course.id);
      if (!user) {
        res.error();
      }
      res.success();
    }
    catch (error) {
        res.error();
    }
}

async function getAll(req, res){
    const {instructorId} = req.body;
    try{
        const courses = await CourseService.getAll(instructorId);
        if ( !!courses ) {
            res.send(CourseService.mapToSendList(courses));        }
        else{
            res.send();
        }

    }
    catch ( error ) {
        res.error(error);
    }

}


async function getActive(req, res){
    const {instructorId} = req.body;

    try{
        const courses = await CourseService.getActive(instructorId);


        if ( !!courses ) {
            res.send(CourseService.mapToSendList(courses));
        }
        else{
            res.send();
        }

    }
    catch ( error ) {
        res.error(error);
    }
}

async function getUser(req, res) {
  const { userId } = req.body;
  try {
    const userCourses = await CourseService.getByUser(userId);
    if (!userCourses) {
      res.send({ courses: [] });
      return;
    }
    res.send({
      courses: CourseService.mapArrayToSend(userCourses)
    });
  } catch (e) {
    res.error()
  }
}

async function setActivationStatus(req, res){
    const { courseId, activationStatus } = req.body;

    try {
        const course = await CourseService.setActivationStatus( courseId, activationStatus );

        res.send( { activationStatus : course.isActive } );
    }
    catch ( error ) {
        res.error(error);
    }
}

async function enrollStudent(req, res){
  console.log("Course router enroll student");
  const { addCode, studentId } = req.body;
  try {
    const result = await CourseService.enrollStudent(addCode, studentId);
    const { invalidAddCode, course, studentAlreadyEnrolled} = result;
    if (!!invalidAddCode) {
      res.send({ invalidAddCode });
      return;
    }
    if (!!studentAlreadyEnrolled) {
      res.send({ studentAlreadyEnrolled });
      return;
    }
    res.send({ course });
  } catch (e) {
    res.error();
  }
}

async function addBankedAssessment(req, res) {
  const { courseId, bankedAssessmentId } = req.body;
  try {
    const course = CourseService
      .addBankedAssessment(courseId, bankedAssessmentId)
    res.success();
  } catch (e) {
    console.error('[ERROR] Course Router addBankedAssessment', e);
    res.error();
  }
}

async function getBankedAssessments(req, res) {
  const { courseId } = req.body;
  try {
    const bankedAssessments = CourseService.getBankedAssessments(courseId);
    res.send({
      bankedAssessments: bankedAssessments
        .map(BankedAssessmentService.mapToSend)
    })
  } catch (e) {
    console.error('[ERROR] Course Router getBankedAssessments', e);
    res.error();
  }
}

async function gradesSummary(req, res) {
  const {
    courseId,
  } = req.body;
  try {
    const courseSessions = await CourseService.getAllCourseSessions(courseId);
    const usersInCourse = await CourseService.getUsers(courseId);
    const students = usersInCourse.filter(u => u.userType === 'STUDENT');
    const instructors = usersInCourse.filter(u => u.userType === 'INSTRUCTOR');
    const contains = (list, x) => !!list.filter(i => i === x)[0];
    for (let i = 0 ; i < students.length ; i++) {
      const student = students[i];
      const courseSessionsInAttendance = !!courseSessions
        ? courseSessions
          .filter(c => contains(c.inAttendance, student.id))
          .length
        : 0;
      // const numberOfQuestions = courseSessions



    }
  } catch (e) {
    console.error('[ERROR] Course Router gradesSummary', e);
    res.error();
  }

}

module.exports = router;
