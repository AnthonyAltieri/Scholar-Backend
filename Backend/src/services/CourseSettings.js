/**
 * @author Anthony Altieri on 11/13/16.
 */

import mongoose from 'mongoose';
import CourseSettingsSchema from '../schemas/CourseSettings';
import db from '../db';
const CourseSettings = mongoose.model('coursesettings', CourseSettingsSchema);
import CourseSchema from '../schemas/Course';
const Course = mongoose.model('Courses', CourseSchema);

const DEFAULT_THRESHOLD = 30;

async function getThreshold(courseId) {
  try {
    const settings = await db.findOne({courseId : courseId}, CourseSettings);
    return settings.alertThreshold;
  } catch (e) {
    return DEFAULT_THRESHOLD;
  }
}

function buildSettingsObject(currentSettings, isAskDisabled, alertThreshold, isAlertDisabled, isResponseDisabled){

  let settings = {};

  if(!!currentSettings){
    settings = currentSettings;
  }

  if(!!isAskDisabled){
    settings.isAskDisabled = isAskDisabled;
  }

  if(!!alertThreshold){
    settings.alertThreshold = alertThreshold;
  }

  if(!!isAlertDisabled){
    settings.isAlertDisabled = isAlertDisabled;
  }

  if(!!isResponseDisabled){
    settings.isResponseDisabled = isResponseDisabled;
  }

  return settings;
}

/*
sets course settings. If none are found for course, creates new
 */
async function setCourseSettings(courseId, isAskDisabled, alertThreshold, isAlertDisabled, isResponseDisabled){
  try {

    if(!!courseId){
      const currentSettings = await db.findOne({courseId : courseId}, CourseSettings);
      const newSettings = buildSettingsObject(currentSettings, isAskDisabled, alertThreshold, isAlertDisabled, isResponseDisabled);
      let savedSettings = {};

      if(!!currentSettings ){
        savedSettings = await db.save(newSettings);
      }
      else{

        savedSettings = await db.create({...newSettings, courseId : courseId }, CourseSettings);
      }

      return savedSettings;
    }
    else{
      throw ("INVALID REQUEST : CourseID must be present in request");
    }

  }
  catch(error) {
    throw error;
  }

}


export default {
  getThreshold,
  buildSettingsObject,
  setCourseSettings
}
