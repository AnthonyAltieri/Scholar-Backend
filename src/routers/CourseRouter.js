/**
 * Created by bharatbatra on 11/8/16.
 */
var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
import db from '../db';

import SchoolService from '../services/SchoolService';
import CourseService from '../services/CourseService';
import QuestionService from '../services/Question';
import AlertService from '../services/Alert';
import InstantService from '../services/InstantAssessment';
import InstantAnswerService from '../services/InstantAssessmentAnswer';
import ReflectiveAnswerService from '../services/ReflectiveAssessmentAnswer';
import ReflectiveService from '../services/ReflectiveAssessment';
import PresentationSchema from '../schemas/Presentation';
const Presentation = mongoose.model('presentations', PresentationSchema);

import BankedAssessmentService from '../services/BankedAssessment';

router.post('/create', createCourse);
router.post('/get/all', getAll);
router.post('/get/active', getActive);
router.post('/get/user', getUser);
router.post('/set/activationStatus', setActivationStatus);
router.post('/enroll/student', enrollStudent);
router.post('/add/bankedAssessment', addBankedAssessment);
router.post('/get/bankedAssessments', getBankedAssessments);
router.post('/get/addCodes', getAddCodes);
router.post('/get/id', getId);
router.post('/get/report/date', getReportByDate);
router.post('/add/presentation', addPresentation);
router.post('/get/presentation/mostRecent', getMostRecentPresentation);
router.post('/get/presentations', getPresentations);
router.post('/set/presentation/accessTime', setPresentationAccessTime);
router.get('/grade/summary', gradesSummary);

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
    for (let i = 0 ; i < userCourses.length ; i++) {
      const course = userCourses[i];
      await CourseService.handleCourseSessionActiveEvaluation(course);
    }
    res.send({
      courses: CourseService
        .mapArrayToSend(userCourses)
    });
  } catch (e) {
    console.error('[ERROR] Course Router getUser', e);
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

async function getAddCodes(req, res) {
  const { userId } = req.body;
  try {
    const addCodes = await CourseService.getAddCodesByUserId(userId);
    res.send({
      addCodes,
    })
  } catch (e) {
    console.error('[ERROR] Course Router getAddCodes');
    res.error();
  }
}

async function getId(req, res) {
  const { courseId } = req.body;
  try {
    const course = await CourseService.getById(courseId);
    res.send({ course })
  } catch (e) {
    console.error('[ERROR] Course Router getId');
    res.error();
  }
}


async function gradesSummary(req, res) {
  const {
    courseId,
    courseTitle,
  } = req.query;
  const contains = (list, x) => !!list.filter(i => i === x)[0];
  try {
    const courseSessions = await CourseService.getAllCourseSessions(courseId);
    if (courseSessions === null) {
      res.error();
    }
    const usersInCourse = await CourseService.getUsers(courseId);
    if (usersInCourse === null) {
      res.error();
    }
    const students = usersInCourse.filter(u => u.type === 'STUDENT');
    const instructors = usersInCourse.filter(u => u.type === 'INSTRUCTOR');
    let grades = [];
    for (let i = 0 ; i < students.length ; i++) {
      const student = students[i];
      let numberAlerts = 0;
      let numberQuestions = 0;
      let numberCourseSessionsIn = 0;

      // Instant numbers
      let numberInstantParticipated = 0;
      let numberInstantCorrect = 0;
      let totalNumberInstants = 0;

      // Reflective numbers
      let numberReflectiveParticipated = 0;
      let agreeWithAnswer = 0;
      let disagreeWithAnswer = 0;
      let totalNumberReflectives = 0;

      for (let j = 0 ; j < courseSessions.length ; j++) {
        const courseSession = courseSessions[j];
        const isInAttendance = contains(
          courseSession.attendanceIds,
          student.id
        );
        if (isInAttendance) {
          numberCourseSessionsIn++;
        }
        const questionsInCourseSession = await QuestionService
          .getInCourseSession(courseSession.id);
        numberQuestions += questionsInCourseSession
          .filter(q => q.userId === student.id).length;
        const alertsInCourseSession = await AlertService
          .getInCourseSession(courseSession.id);
        if (isInAttendance) {
          numberAlerts += alertsInCourseSession
            .filter(a => q.userId === student.id).length;
        }
        const instantAssessmentsInCourseSession = await InstantService
          .getInCourseSession(courseSession.id);
        for (let m = 0 ;
            m < instantAssessmentsInCourseSession.length ;
            m++
        ) {
          const instantAssessment = instantAssessmentsInCourseSession[m];
          const correctOption = instantAssessment.correctOption;
          const studentAnswer = await InstantAnswerService
            .getByUserId(student.id, instantAssessment.id);
          if (!!studentAnswer) {
          // If there was no answer the student was correct if they answered
            const isStudentsAnswerCorrect = (correctOption === -1)
              ? (!!studentAnswer)
              : (correctOption === studentAnswer.optionIndex);
            if (isStudentsAnswerCorrect) {
              numberInstantCorrect++;
            }
            numberInstantParticipated++;
          }
          totalNumberInstants++;
        }
        const reflectiveAssessmentsInCourseSession = await ReflectiveService
          .getInCourseSession(courseSession.id);
        for (let m = 0 ;
          m < reflectiveAssessmentsInCourseSession.length ;
          m++
        ) {
          const reflectiveAssessment = reflectiveAssessmentsInCourseSession[m];
          const studentAnswer = await ReflectiveAnswerService
            .getByUserId(student.id);
          if (!!studentAnswer) {
            numberReflectiveParticipated++;
            let numberAgree = 0;
            let numberDisagree = 0;
            if(!!studentAnswer.reviews){
              studentAnswer.reviews.forEach((r) => {
                if (r.type === 'AGREE') {
                  numberAgree++;
                } else if (r.type === 'DISAGREE') {
                  numberDisagree++;
                } else {
                  throw new Error(`Invalid review type ${r.type}`);
                }
              });
              agreeWithAnswer += numberAgree;
              disagreeWithAnswer += numberDisagree;
            }
          }
          totalNumberReflectives++;
        }
      }
        const studentName = `${student.firstName} ${student.lastName}`;
        grades = ([
            ...grades,
            [
              studentName,
              student.institutionId,
              student.email,
              numberCourseSessionsIn,
              numberQuestions,
              numberAlerts,
              numberInstantParticipated,
              totalNumberInstants,
              numberInstantCorrect,
              numberReflectiveParticipated,
              totalNumberReflectives,
              agreeWithAnswer,
              disagreeWithAnswer,
            ]
          ])
    }
    res.setHeader(
      'Content-disposition',
      `attachment; filename=${courseTitle}.csv`
    );
    res.setHeader('Content-type', 'text/plain');
    res.charset = 'UTF-8';
    let csv = 'Student Name,'
      + 'Student Id,'
      + 'Student Email,'
      + 'Course Sessions In Attendance,'
      + '# Questions Asked,'
      + '# Alerts Created,'
      + '# Instant Assessments Participated In,'
      + '# Instant Assessments In Course,'
      + '# Instant Asessments Correct,'
      + '# Reflective Assessments Participated In,'
      + '# Reflective Assessments In Course,'
      + '# Students That Agreed With Answer,'
      + '# Students That Disagreed With Answer\n';
    grades.forEach((g) => {
      csv += g.reduce((a, c, i) => (i === (g.length - 1)
        ? a + `${c}\n`
        : a + `${c},`
      ), '')
    });
    res.write(csv);
    res.end();
  } catch (e) {
    console.error('[ERROR] Course Router gradesSummary', e);
    res.error();
  }

}

async function getReportByDate(req, res) {
  try {
    const { courseId, date } = req.body;
    const report = await CourseService.getReportByDate(courseId, date);
    res.send(report);
  }
  catch (e) {
    console.error("[ERROR] in CourseRouter > getReportByDate ", e);
  }
}

async function addPresentation(req, res) {
  try{
    const { courseId, userId, url, title } = req.body;
    await db.create({
      courseId,
      userId,
      url,
      title,
      lastAccessTime : new Date()
    }, Presentation);
    console.log("SEND ME");
    res.send({});//SUCCESS
  }
  catch (e) {
    console.error("[ERROR] in CourseRouter > addPresentation ", e);
    res.error();
  }
}

//Gets the most recently accessed presentation
async function getMostRecentPresentation(req, res) {
  try {
    const { courseId } = req.body;
    const presentations = await db.find({ courseId : courseId }, Presentation);
    if(presentations.length>0){
      let mostRecentPresentation = presentations[0];

      presentations.forEach( (p) => {
        if(new Date (p.lastAccessTime) > new Date(mostRecentPresentation.lastAccessTime) )
            mostRecentPresentation = p;
      });

      res.send(mostRecentPresentation);

    }
    else res.send();//No presentations

  }
  catch (e) {
    console.error("[ERROR] in CourseRouter > getMostRecentPresentation ", e);
    res.error();
  }
}
async function getPresentations(req, res) {
  try{
    const { courseId } = req.body;
    const presentations = await db.find({ courseId : courseId }, Presentation);
    res.send(presentations);
  }
  catch (e) {
    console.error("[ERROR] in CourseRouter > getPresentation ", e);
    res.error();
  }
}

async function setPresentationAccessTime(req, res){
  try{
    console.log("IS THIS BEING HIT?");
    const { presentationId } = req.body;

    console.log("Hit : " + presentationId);
    const presentation = await db.findById( presentationId, Presentation );
    console.log("Found");
    presentation.lastAccessTime = new Date();
    await db.save(presentation);
    console.log("SABED");
    console.log(JSON.stringify(presentation));
    res.success();
  }
  catch (e) {
    console.error("[ERROR] in CourseRouter > setPresentationAccessTime ", e);
    res.error();
  }
}
module.exports = router;
