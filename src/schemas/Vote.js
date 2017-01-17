/**
 * @author Anthony Altieri on 11/4/16.
 */

import mongoose, { Schema } from 'mongoose';
import Entity from './Entity';
const Id = mongoose.Schema.Types.ObjectId;

const Vote = new Schema({
  ...Entity,
  userId: String,
  courseId: String,
  courseSessionId: String,
  targetType: String, // Question, Response
  targetId: String,
  type: String, //UP, DOWN, etc.
});

export default Vote;
