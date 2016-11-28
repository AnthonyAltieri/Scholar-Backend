/**
 * @author Anthony Altieri on 11/4/16.
 */
import Entity from './Entity';
import Vote from './Vote';
import mongoose, { Schema } from 'mongoose';
const Id = Schema.Types.String;

const Response = new Schema({
  ...Entity,
  userId: Id,
  courseId: Id,
  courseSessionId: Id,
  content: String,
  votes: [Vote],
  isFlagged: Boolean,
  isEndorsed: Boolean,
  isDismissed: Boolean,
  endorsedBy: Id,
  rootQuestionId: Id,
  parentId: Id,
  parentType: String, // Question | Response
});

export default Response;
