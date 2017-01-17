/**
 * @author Anthony Altieri on 11/5/16.
 */

import mongoose, { Schema } from 'mongoose';
import Entity from './Entity';

const Review = new Schema({
  ...Entity,
  courseSessionId: String,
  courseId: String,
  userId: String,
  type: String, //SIMILAR/DISSIMILAR/GOOD/BAD
  answerId: String,
});

export default Review;
