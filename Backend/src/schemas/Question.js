/**
 * @author Anthony Altieri on 11/4/16.
 */

import mongoose, { Schema } from 'mongoose';
import Entity from './Entity';
const Id = mongoose.Schema.Types.ObjectId;

const Question = new Schema({
  ...Entity,
  userId: Id,
  courseId: Id,
  courseSessionId: Id,
  content: String,
  isDismissed: Boolean,
  isEndorsed: Boolean,
  endorsedBy: Id,
  isFlagged: Boolean,
});

export default Question;
