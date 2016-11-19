/**
 * Created by bharatbatra on 11/18/16.
 */
import mongoose from 'mongoose';
import AlertSchema from '../schemas/Alert';
const Alert = mongoose.model('alerts', AlertSchema);
import db from '../db';

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

export default {
  build,
  mapToSend,
  findByCourseSessionId,
}
