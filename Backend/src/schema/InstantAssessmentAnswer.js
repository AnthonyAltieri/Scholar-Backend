/**
 * @author Anthony Altieri on 11/5/16.
 */

import mongoose, { Schema } from 'mongoose';
import Entity from './Entity';
const Id = Mongoose.Schema.Types.ObjectId;

const InstantAssessmentAnswer = new Schema({
  ...Entity,
  courseSessionId: Id,
  userId: Id,
  assessmentId: Id,
  courseId: Id,
  optionIndex: Number,
});

export default InstantAssessmentAnswer;
