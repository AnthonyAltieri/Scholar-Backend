/**
 * Created by bharatbatra on 11/11/16.
 */
import mongoose from 'mongoose';

import CourseSchema from '../schemas/Course';
const Course = mongoose.model('Courses', CourseSchema);
import UserSchema from '../schemas/User';
const User = mongoose.model('users', UserSchema);

import db from '../db';
import ShortIdUtil from '../utilities/ShortIdUtil'

function generateShortCode(length){
    return ShortIdUtil.generateShortId();
}

async function buildCourse(instructorId, schoolId, title, abbreviation, term ){
    const addCode = generateShortCode(5);
    try{
        const course = await db
            .create({
                    instructorIds : [instructorId],
                    schoolId : schoolId,
                    title : title,
                    abbreviation : abbreviation,
                    addCode : addCode,
                    term : term,
                    isActive: true //TODO: consider revising how to set isActive
                },
                Course);
        return course;
    }
    catch ( error ) {
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

function mapToSend( course ) {
    return {course : {
        id: course.id,
        title: course.title,
        abbreviation: course.abbreviation
    }};
}

function mapToSendList( courses ) {
    return { courseList : courses.map ( (c) => { return {id: c.id, title: c.title, abbreviation: c.abbreviation, isActive: c.isActive} })}
}

async function setActivationStatus(courseId, isActive) {
    try{
        let course = await db.findById(courseId, Course);

        if (!!course) {
            course.isActive = isActive;

            course = await db.save(course);
            return course;
        }
        else {
            throw error("No Course Found");
        }
    }
    catch ( error ) {
        throw error;
    }
}

async function attemptEnrollStudent(addCode, courseId, studentId){
    try {
        console.log("try enroll");
        let course = await db.findById(courseId, Course);
        if(!!course && course.addCode === addCode) {
            console.log("course found and addCode match");
            let student = await db.findById(studentId, User);
            if(!!student) {
                console.log("student found");
                if(!student.enrolledCourses.includes(course.id)){
                    console.log("student doesnt have course");
                    student.enrolledCourses.push(course.id);
                    student = await db.save(student);
                }
                if(!course.studentIds.includes(student.id)){
                    console.log("course doesn't gave student");
                    course.studentIds.push(student.id);
                    course = await db.save(course);
                }
                return true;
            }
        }
        return false;
    }
    catch(error) {
        throw error;
    }


}



const CourseService = {
    buildCourse,
    mapToSend,
    mapToSendList,
    getAll,
    getActive,
    setActivationStatus,
    attemptEnrollStudent
};

export default  CourseService;
