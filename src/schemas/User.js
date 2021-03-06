/**
 * @author Anthony Altieri on 11/3/16.
 */

import mongoose, { Schema } from 'mongoose';
import Entity from './Entity';
const Id = mongoose.Schema.Types.ObjectId;

const User = new Schema({
  ...Entity,
  email: String,
  password: String,
  firstName: String,
  lastName: String,
  phone: String,
  loggedIn: Boolean,
  courses: [String],
  schoolId: String,
  institutionId: String,
  passwordResetCode: String,
  referralCode: String,
  sessionsInAttendance: [String],
  textBoundSession: String,
  textBoundCourse: String,
  forgotPasswordCode: String,
  type: String //STUDENT | INSTRUCTOR | ADMIN | STUDENT_REP | TEACHER_ASSISTANT

});

export default User;
