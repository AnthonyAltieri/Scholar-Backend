/**
 * @author Anthony Altieri on 11/4/16.
 */

import mongoose, { Schema } from 'mongoose';
import Entity from './Entity';
const Id = mongoose.Schema.Types.ObjectId;

const Course = new Schema({
  ...Entity,
  instructorIds: [String],
  instructorName: String,
  teacherAssistantIds: [String],
  studentIds: [String],
  schoolId: String,
  activeSessionId: String,
  title: String,
  abbreviation: String,
  addCode: String,
  subject: String,
  days: [Boolean],
  // qFall | qWinter | qSpring | sFall | sWinter | summer | other
  term: String,
  timeStart: String,
  timeEnd: String,
  dateStart: Date,
  dateEnd: Date,
});

export default Course;
