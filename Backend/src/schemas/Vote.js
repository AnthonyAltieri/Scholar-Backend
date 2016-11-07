/**
 * @author Anthony Altieri on 11/4/16.
 */

import mongoose, { Schema } from 'mongoose';
import Entity from './Entity';
const Id = mongoose.Schema.Types.ObjectId;

const Vote = new Schema({
  ...Entity,
  userId: Id,
  courseId: Id,
  courseSessionId: Id,
  targetType: String, // Question, Response
  targetId: Id,
  type: String, //UP, DOWN, etc.
});

export default Vote;