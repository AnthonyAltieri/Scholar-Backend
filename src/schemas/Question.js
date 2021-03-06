/**
 * @author Anthony Altieri on 11/4/16.
 */

import mongoose, { Schema } from 'mongoose';
import Entity from './Entity';
import Vote from './Vote';
const Id = String;

const Question = new Schema({
  ...Entity,
  userId: Id,
  courseId: Id,
  courseSessionId: Id,
  content: String,
  isDismissed: Boolean,
  isEndorsed: Boolean,
  endorsedBy: Id,
  votes: [Vote],
  isFlagged: Boolean,
});

export default Question;
