/**
 * Created by bharatbatra on 11/18/16.
 */
import mongoose from 'mongoose';
import AlertSchema from '../schemas/Alert';
import CourseSessionSchema from '../schemas/CourseSession';
const CourseSession = mongoose.model('coursesessions', CourseSessionSchema);
const Alert = mongoose.model('alerts', AlertSchema);
import db from '../db';
import DateUtility from '../utilities/DateUtility'

//TODO: Implement
async function build() {

}

//TODO: Implement
function mapToSend(alert) {
  return alert;
}

async function findByCourseSessionId(id) {
  try {
    return await db.find({courseSessionId : id}, Alert);
  }
  catch (err) {
    throw err;
  }

}

async function findByUserAndCourseSessionId(userId, courseSessionId){
  try {
    return await db.find({
      courseSessionId : courseSessionId,
      userId : userId
    }, Alert);
  }
  catch (err) {
    console.error("[ERROR] Alert Service > findByUserAndCourseSessionId : " + err);
    throw err;
  }
}

function getMostRecentAlert(alerts){
  let mostRecentAlert = alerts[0];
  alerts.forEach( a => {
    if(a.created.getTime() > mostRecentAlert.created.getTime()) {
      mostRecentAlert = a;
    }
  });
  return mostRecentAlert;
}

function isAlertInWindow(alert, alertWindowMillis) {
  return ((DateUtility.diffMillisFromNow(alert.created.getTime())) < alertWindowMillis)
}

async function isDuplicateAlert(userId, courseSessionId, alertWindowMillis) {
  try {
    let userAlerts = await findByUserAndCourseSessionId(
      userId,
      courseSessionId
    );
    if(!!userAlerts && userAlerts.length > 0) {
      let mostRecentAlert = getMostRecentAlert(userAlerts);
      return isAlertInWindow(mostRecentAlert, alertWindowMillis);
    }
    return false;
  } catch (err) {
    console.error("[ERROR] Alert Service > isDuplicateAlert",err);
    throw err;
  }
}

//NOTE: alertWindow is in seconds
async function attemptAddAlert(userId, courseId, courseSessionId, alertWindow = 60) {
  try {
    let alertWindowMillis = alertWindow * 1000;
    if(!(await isDuplicateAlert(userId, courseSessionId, alertWindowMillis))) {
      console.log('is not duplicate alert');
      const alert = await db.create({
        userId,
        courseId,
        courseSessionId
      }, Alert);
      return { alert };
    } else {
      return { duplicateAlert: true };
    }
  }
  catch (err) {
    console.error("[ERROR] in Alert Service > attemptAddAlert : " + err);
    throw err;
  }
}

//NOTE: alertWindow is in seconds
async function getActiveAlerts(courseSessionId, alertWindow = 60) {
  try {
    let alerts = await findByCourseSessionId(courseSessionId);

    if(!!alerts && alerts.length > 0){
      return alerts.filter( (a) => isAlertInWindow(a, alertWindow * 1000)).length;
    }
    else {
      return 0;
    }
  }
  catch (e) {
    console.error("[ERROR] in Alert Service > getActiveAlerts : " + e);
    throw e;
  }
}

async function getInCourseSession(courseSessionId) {
  try {
    return await db.find({ courseSessionId }, CourseSession);
  } catch (e) {
    console.error('[ERROR] Alert Service getNumberInCourseSession', e);
    return null;
  }
}

const AlertService = {
  build,
  mapToSend,
  findByCourseSessionId,
  attemptAddAlert,
  getActiveAlerts,
  getInCourseSession,
};

export default AlertService;
