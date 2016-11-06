/**
 * @author Anthony Altieri on 11/4/16.
 */

import mongoose, { Schema } from 'mongoose';
import Entity from './Entity';
const Id = Mongoose.Schema.Types.ObjectId;

const Question = new Schema({
  ...Entity,
  userId: Id,
  courseId: Id,
  courseSessionId: Id,
  isDismissed: Boolean,
  isEndorsed: Boolean,
});

export default Question;
