/**
 * @author Anthony Altieri on 11/5/16.
 **/

import mongoose, { Schema } from 'mongoose';
import Entity from './Entity';
import Settings from './Settings'
const Id = mongoose.Schema.Types.ObjectId;

const CourseSettings = new Schema({
  ...Entity,
  ...Settings,
  userId: String,//TODO: do we really need this here?
  courseId: String,
});

export default CourseSettings;
