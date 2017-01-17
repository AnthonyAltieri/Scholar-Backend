/**
 * Created by bharatbatra on 11/11/16.
 */
import mongoose from 'mongoose';
import UserService from './UserService';
import * as DateUtil from '../utilities/Date';
import CourseSessionService from '../services/CourseSession';

import CourseSchema from '../schemas/Course';
import UserSchema from '../schemas/User';
import CourseSessionSchema from '../schemas/CourseSession';
const CourseSession = mongoose.model('coursesessions', CourseSessionSchema);
const Course = mongoose.model('Courses', CourseSchema);
const User = mongoose.model('users', UserSchema);


import db from '../db';
import ShortIdUtil from '../utilities/ShortIdUtil'
const ADD_CODE_LENGTH = 5;

function generateShortCode(length){
    return ShortIdUtil.generateShortIdLength(length);
}

async function buildCourse(
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
) {
    let addCode = generateShortCode(ADD_CODE_LENGTH);
    let isUnique = false;

    try {

      while (!isUnique) {

        let existingCourseSession = await db.findOne({ addCode }, Course);

        if(!existingCourseSession) {
          isUnique = true;
        }
        else {
          addCode = generateShortCode(ADD_CODE_LENGTH);
        }
      }

        return await db.create({
          schoolId,
          title,
          subject,
          abbreviation,
          addCode,
          term,
          timeStart,
          timeEnd,
          dateStart,
          dateEnd,
          instructorName,
          days,
          instructorIds : [instructorId],
          }, Course
        )
    }
    catch (error) {
        console.log("[ERROR] courseService > create : " + e);
        throw error;
    }


}

async function getAll(instructorId){
    try {
        const courses = db.find({instructorIds : {$elemMatch: {$eq: instructorId }}}, Course);
        return courses;
    }
    catch ( error ) {
        throw error;
    }
}

async function getActive(instructorId){
    try {
        const courses = db.find({instructorIds : {$elemMatch: {$eq: instructorId }}, isActive : true}, Course);
        return courses;
    }
    catch ( error ) {
        throw error;
    }
}

function mapToSend(course) {
  console.log('mapToSend', JSON.stringify(course, null ,2))
    return {
      id: course.id,
      title: course.title,
      abbreviation: course.abbreviation,
      activeCourseSessionId: course.activeCourseSessionId,
      instructorName: course.instructorName,
      subject: course.subject,
      isActive: course.isActive,
      timeStart: course.timeStart,
      timeEnd: course.timeEnd,
      days: course.days,
      term: course.term,
      addCode: course.addCode,
    };
}



async function setActivationStatus(courseId, isActive) {
    try {
      let course = await db.findById(courseId, Course);
      if (!course) return null;
      course.isActive = isActive;
      return await db.save(course);
    } catch (e) {
        throw e;
    }
}

async function getByUser(userId) {
  console.log('CourseService.getByUser()');
  try {
    const user = await UserService.getById(userId);
    if (!user) return null;
    if (!user.courses) {
      return [];
    }
    const courses = await getCourses(user.courses);
    console.log('courses', courses);
    return courses;
  } catch (e) {
    console.error('[ERROR] Course Service getByUser', e);
    return null;
  }
}

async function getById(id) {
  try {
    return await db.findById(id, Course);
  } catch (e) {
    return null;
  }
}

async function getCourses(courses) {
  try {
    const foundCourses = await db.findByIdArray(courses, Course);
    return foundCourses;
  } catch (e) {
    console.log('[ERROR] caught in CourseService > getCourses : ', e)
    return null;
  }
}


async function enrollStudent(addCode, studentId) {
  try {
    const course = await db.findOne({ addCode }, Course);

    if (!course) {
      return { invalidAddCode: true };
    }
    if(!!course.studentIds.filter(s => s === studentId)[0]){
      console.error("[ERROR] in CourseService > enrollStudent: Student Already Enrolled in Course");
      return { studentAlreadyEnrolled: true }
    }
    course.studentIds = [...course.studentIds, studentId];
    await db.save(course);
    const student = await db.findById(studentId, User);
    student.courses = [...student.courses, course.id];
    await db.save(student);
    return {
      course: course
    }
  } catch (e) {
    console.error('[ERROR] Course Service enrollStudent', e);
    return null;
  }
}

function mapArrayToSend(courses) {
  return courses.map(mapToSend);
}

async function saveToUser(userId, courseId) {
  try {
    const user = await db.findById(userId, User);
    if (!user.courses) {
      user.courses = [];
    }
    user.courses = [...user.courses, courseId];
    return await db.save(user);
  } catch (e) {
    return null;
  }
}

async function findById(id){
    return await db.findById(id, Course)
}

//Helper method that checks whether this instructor can make changes to course
//OR thereby to courseSession
function isInstructorPermittedForCourse(course, instructor){
    let isValid = false;
    if(!!course.id && !!instructor.id){
        course.instructorIds.forEach( id => {
            if(id === instructor.id){
                isValid = true;
            }
        });
    }
    return isValid;

}

//Sets the activeSessionId of this course
//To the courseSession.id
async function setActiveCourseSessionId(course, courseSessionId){
  course.activeCourseSessionId = courseSessionId;
  try {
    return await db.save(course);
  } catch (e) {
    console.error('[ERROR] setActiveCourseSessionId', e);
    return null;
  }

}

async function addBankedAssessment(courseId, bankedAssessmentId) {
  try {
    const course = await db.findById(courseId, Course);
    course.bankedAssessments = [
      ...course.bankedAssessments,
      bankedAssessmentId
    ];
    return await db.save(course);
  } catch (e) {
    console.error('[ERROR] Course Service addBankedAssessment', e);
    return null;
  }
}

async function getBankedAssessments(courseId) {
  try {
    const course = await db.findById(courseId, Course);
    return course.bankedAssessments;
  } catch (e) {
    console.error('[ERROR] Course Service getBankedAssessments', e);
    return null;
  }
}

async function getAllCourseSessions(courseId) {
  try {
    return await db.find({ courseId }, CourseSession);
  } catch (e) {
    console.error('[ERROR] Course Service getAllCourseSessions', e);
    return null;
  }
}

function getUsers(courseId) {
  return new Promise((resolve, reject) => {
    User.find(
      { courses: { $elemMatch: { $eq: courseId } } },
      (err, found) => {
        console.log('found', found);
        if (!!err) {
          console.error('[ERROR] Course Service getUsers', e);
          reject(null);
        }
        resolve(found);
      }
    )
  });
};

async function getAddCodesByUserId(userId) {
  try {
    const courses = await getByUser(userId);
    return courses.reduce((a, c) => (
      [
        ...a,
        {
          title: c.title,
          abbreviation: c.abbreviation,
          addCode: c.addCode,
        }
      ]
    ), []);
  } catch (e) {
    console.error('[ERROR] Course Service getAddCodesByUserId', e);
    return null;
  }
}

async function findById(courseId) {
  try {
    return await db.findById(courseId, Course);
  } catch (e) {
    console.error('[ERROR] Course Service findById', e);
    return null;
  }
}

async function removeActiveCourseSession(courseId) {
  try {
    const course = await getById(courseId);
    course.activeCourseSessionId = null;
    return await db.save(course);
  } catch (e) {
    console.error(
      '[ERROR] Course Service removeActiveCourseSession',
      e
    );
  }
}

async function handleCourseSessionActiveEvaluation(course) {
  try {
    if (!!course.activeCourseSessionId) {
      const courseSession = await CourseSessionService
        .getById(course.activeCourseSessionId);
      const shouldCreateNewCourseSession = DateUtil
        .shouldCreateNewCourseSession(courseSession.created);
      if (!!shouldCreateNewCourseSession) {
        course.activeCourseSessionId = null;
        await db.save(course);
      }
    }
  } catch (e) {
    console.error(
      '[ERROR] Course Service handleCourseSessionActiveEvaluation',
      e
    );
  }
}

const CourseService = {
  buildCourse,
  mapToSend,
  mapArrayToSend,
  getAll,
  getActive,
  getByUser,
  enrollStudent,
  saveToUser,
  setActivationStatus,
  isInstructorPermittedForCourse,
  getById,
  setActiveCourseSessionId,
  addBankedAssessment,
  getAllCourseSessions,
  getUsers,
  getAddCodesByUserId,
  findById,
  removeActiveCourseSession,
  handleCourseSessionActiveEvaluation,
};

export default  CourseService;
