/**
 * Created by bharatbatra on 11/8/16.
 */
var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
import CourseSchema from '../schemas/Course';
const Course = mongoose.model('Courses', CourseSchema);

import db from '../db';
import SchoolService from '../services/SchoolService'

router.post('/create', createCourse);

async function createCourse(req, res){
    const { instructorId, school, term } = req.body;

    const schoolId = await SchoolService.findByName(school);




}