/**
 * @author Anthony Altieri on 11/4/16.
 */

import mongoose, { Schema } from 'mongoose';
import Settings from './Settings';
import Entity from './Entity';
const Id = mongoose.Schema.Types.ObjectId;

const CourseSession = new Schema({
  ...Entity,
  courseId: Id,
  instructorIds: [Id],
  teacherAssistantIds: [Id],
  studentIds: [Id],//attendance
  activeSessionId: Id,
});

export default CourseSession;
