/**
 * Created by bharatbatra on 11/8/16.
 */
var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');

import SchoolService from '../services/SchoolService';
import CourseService from '../services/CourseService';

router.post('/create', createCourse);
router.post('/get/all', getAll);
router.post('/get/active', getActive);
router.post('/set/activationStatus', setActivationStatus);

async function createCourse(req, res){
    const {
        instructorId,
        school,
        term,
        title,
        abbreviation
    } = req.body;

    const schoolId = await SchoolService.findByName(school);

    try{
        const course = await CourseService
            .buildCourse(
                instructorId,
                schoolId,
                title,
                abbreviation,
                term);

        res.send(CourseService.mapToSend(course));
    }
    catch ( error ) {
        res.error(error);
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


module.exports = router;