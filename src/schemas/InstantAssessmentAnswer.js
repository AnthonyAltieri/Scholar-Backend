/**
 * @author Anthony Altieri on 11/5/16.
 */

import mongoose, { Schema } from 'mongoose';
import Entity from './Entity';

const InstantAssessmentAnswer = new Schema({
  ...Entity,
  courseSessionId: String,
  userId: String,
  assessmentId: String,
  courseId: String,
  optionIndex: Number,
});

export default InstantAssessmentAnswer;
