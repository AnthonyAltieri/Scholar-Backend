/**
 * @author Anthony Altieri on 11/4/16.
 */

import mongoose, { Schema } from 'mongoose';
import Entity from './Entity';
const Id = mongoose.Schema.Types.ObjectId;

const Course = new Schema({
  ...Entity,
  instructorIds: [String],
  teacherAssistantIds: [String],
  studentIds: [String],
  schoolId: String,
  activeSessionId: String,
  title: String,
  abbreviation: String,
  addCode: String,
  // qFall | qWinter | qSpring | sFall | sWinter | summer | other
  term: String,
  isActive: Boolean,
});

export default Course;
