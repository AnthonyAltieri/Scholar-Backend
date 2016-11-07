/**
 * @author Anthony Altieri on 11/5/16.
 */

import mongoose, { Schema } from 'mongoose';
import Entity from './Entity';
const Id = Mongoose.Schema.Types.ObjectId;

const Review = new Schema({
  ...Entity,
  courseSessionId: Id,
  courseId: Id,
  userId: Id,
  type: String, //SIMILAR/DISSIMILAR/GOOD/BAD
  answerId: Id,
});


