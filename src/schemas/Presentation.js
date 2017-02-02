/**
 * Created by bharatbatra on 2/2/17.
 */
import mongoose, { Schema } from 'mongoose';
import Entity from './Entity';

const Presentation = new Schema({
  ...Entity,
  courseId : String,
  userId: String,
  url : String,
  title : String
});

export default Presentation;