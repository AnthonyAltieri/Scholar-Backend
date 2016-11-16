/**
 * @author Anthony Altieri on 11/4/16.
 */
import Entity from './Entity';
import mongoose, { Schema } from 'mongoose';
const Id = Mongoose.Schema.Types.ObjectId;

const Response = new Schema({
  ...Entity,
  userId: Id,
  courseId: Id,
  courseSessionId: Id,
  content: String,
  votes: [Vote],
  isFlagged: Boolean,
  isEndorsed: Boolean,
  endorsedBy: Id,
  rootQuestionId: Id,
  parentId: Id,
  parentType: String, // Question | Response
});

export default Response;
