/**
 * @author Anthony Altieri on 11/4/16.
 */

import mongoose, { Schema } from 'mongoose';
import Settings from './Settings';
import Entity from './Entity';
const Id = Mongoose.Schema.Types.ObjectId;

const CourseSession = new Schema({
  ...Entity,
  ...Settings,
  courseId: Id,
  instructorIds: [Id],
  teacherAssistantIds: [Id],
  studentIds: [Id],//attendance
  activeSessionId: Id,
});

export default CourseSession;
