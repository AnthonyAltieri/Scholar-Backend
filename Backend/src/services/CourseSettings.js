/**
 * @author Anthony Altieri on 11/13/16.
 */

import mongoose from 'mongoose';
import CourseSettingsSchema from '../schemas/CourseSettings';
import db from '../db';
const CourseSettings = mongoose.model('coursesettings', CourseSettingsSchema);

const DEFAULT_THRESHOLD = 30;

async function getThreshold(id) {
  try {
    const settings = await db.findById(id, CourseSettings);
    return settings.alertThreshold;
  } catch (e) {
    return DEFAULT_THRESHOLD;
  }
}

export default {
  getThreshold,
}
