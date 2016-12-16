/**
 * Created by bharatbatra on 11/18/16.
 */
import mongoose from 'mongoose';
import AlertSchema from '../schemas/Alert';
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

async function isDuplicateAlert(userId, courseSessionId, alertWindowMillis) {
  try {
    let userAlerts = await findByUserAndCourseSessionId(userId, courseSessionId);

    if(!!userAlerts && userAlerts.length > 0) {
      const mostRecentAlert = userAlerts.sort(
          (a, b) => {
          return (a > b);
        }
      );

      if(DateUtility.diffMillisFromNow(mostRecentAlert[0].created) < alertWindowMillis) {
        return true;
      }
    }
    return false;
  }
  catch (err) {
    console.error("[ERROR] Alert Service > isDuplicateAlert : " + err);
    throw err;
  }
}

async function attemptAddAlert(userId, courseId, courseSessionId, alertWindow = 60) {
  try {
    let alertWindowMillis = alertWindow * 1000;
    if(! ( await isDuplicateAlert(userId, courseSessionId, alertWindowMillis ))){
      return await db.create({
        userId,
        courseId,
        courseSessionId
      }, Alert);
    }
    else {
      throw new Error("Duplicate Alert");
    }
  }
  catch (err) {
    console.error("[ERROR] in Alert Service > attemptAddAlert : " + err);
    throw err;
  }
}

const AlertService = {
  build,
  mapToSend,
  findByCourseSessionId,
  attemptAddAlert
};

export default AlertService;