/**
 * @author Anthony Altieri on 11/4/16.
 */

import mongoose, { Schema } from 'mongoose';
import Entity from './Entity';
const Id = Mongoose.Schema.Types.ObjectId;

const Course = new Schema({
  ...Entity,
  instructorIds: [Id],
  teacherAssistantIds: [Id],
  studentIds: [Id],
  schoolId: Id,
  activeSessionId: Id,
  // qFall | qWinter | qSpring | sFall | sWinter | summer | other
  term: String
});

export default Course;
