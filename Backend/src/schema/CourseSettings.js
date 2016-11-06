/**
 * @author Anthony Altieri on 11/5/16.
 **/

import mongoose, { Schema } from 'mongoose';
import Entity from './Entity';
import Settings from './Settings'
const Id = Mongoose.Schema.Types.ObjectId;

const CourseSettings = new Schema({
  ...Entity,
  ...Settings,
  userId: Id,
  courseId: Id,
});

export default CourseSettings;
