/**
 * @author Anthony Altieri on 11/13/16.
 */

import mongoose from 'mongoose';
import CourseSessionSchema from '../schemas/CourseSession';
import CourseSettings from '../schemas/CourseSettings';
const CourseSession = mongoose.model('coursesessions', CourseSessionSchema);
import db from '../db';

async function getThreshold(id) {
  try {
    const courseSession = await db.findById(id, CourseSession);
    return course
  } catch (e) {
    return null;
  }
}
