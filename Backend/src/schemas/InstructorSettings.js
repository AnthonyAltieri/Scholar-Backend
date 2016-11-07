/**
 * @author Anthony Altieri on 11/5/16.
 *
 */

import mongoose, { Schema } from 'mongoose';
import Entity from './Entity';
import Settings from './Settings';
const Id = Mongoose.Schema.Types.ObjectId;

const InstructorSettings = new Schema({
  ...Entity,
  ...Settings,
  userId: Id,
});

export default InstructorSettings;