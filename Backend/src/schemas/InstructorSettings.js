/**
 * @author Anthony Altieri on 11/5/16.
 *
 */

import mongoose, { Schema } from 'mongoose';
import Entity from './Entity';
import Settings from './Settings';

const InstructorSettings = new Schema({
  ...Entity,
  ...Settings,
  userId: String,
});

export default InstructorSettings;