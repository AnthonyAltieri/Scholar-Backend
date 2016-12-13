/**
 * @author Anthony Altieri on 11/13/16.
 */

import CourseSettingsService from '../services/CourseSettings';

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

router.post('get/alertThreshold', getAlertThreshold);
router.post('/set/all', setAllCourseSettings);

async function getAlertThreshold(req, res) {
  const { courseId } = req.body;
  try {
    const alertThreshold = await CourseSettingsService.getThreshold(courseId);
    res.send({ alertThreshold });
  } catch (e) {
    res.error();
  }
}

async function setAllCourseSettings(req, res){
  const { courseId, isAskDisabled, alertThreshold, isAlertDisabled, isResponseDisabled } = req.body;

  try {
    const courseSettings = await CourseSettingsService.setCourseSettings(courseId, isAskDisabled, alertThreshold, isAlertDisabled, isResponseDisabled);

    res.send(courseSettings);
  }
  catch(error) {
    res.error(error);
  }
}

module.exports = router;
