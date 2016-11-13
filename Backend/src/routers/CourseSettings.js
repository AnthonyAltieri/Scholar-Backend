/**
 * @author Anthony Altieri on 11/13/16.
 */

import CourseSettingsService from '../services/CourseSettings';

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

router.post('get/alertThreshold', getAlertThreshold);

async function getAlertThreshold(req, res) {
  const { courseId } = req.body;
  try {
    const alertThreshold = await CourseSettingsService.getThreshold(courseId);
    res.send({ alertThreshold });
  } catch (e) {
    res.error();
  }
}
