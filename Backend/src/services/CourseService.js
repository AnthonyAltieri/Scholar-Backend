/**
 * Created by bharatbatra on 11/11/16.
 */
import mongoose from 'mongoose';
import CourseSchema from '../schemas/Course';
const Course = mongoose.model('Courses', CourseSchema);
import db from '../db';


function buildCourse(instructorId){

}

const CourseService = {buildCourse : buildCourse};

export default  CourseService;
