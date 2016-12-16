/**
 * @author Anthony Altieri on 11/5/16.
 */

import mongoose, { Schema } from 'mongoose';
import Entity from './Entity';
import Review from './Review';

const ReflectiveAssessmentAnswer = new Schema({
  ...Entity,
  courseSessionId: String,
  userId: String,
  assessmentId: String,
  courseId: String,
  content: String,
  reviews: [Review],
});

export default ReflectiveAssessmentAnswer;
