/**
 * Created by bharatbatra on 12/14/16.
 */
var express = require('express');
var router = express.Router();
import AlertService from '../services/Alert';


router.post('/create', addAlert);
router.post('/get/active', getActiveAlerts);

//NOTE: Alert Window is in seconds
async function addAlert(req, res) {
  const { userId, courseId, courseSessionId, alertWindow } = req.body;
  try {
    await AlertService.attemptAddAlert(
      userId,
      courseId,
      courseSessionId,
      alertWindow
    );
    res.send({});
  } catch (e) {
    res.error("[ERROR] in AlertRouter > addAlert : " + e);
  }

}

async function getActiveAlerts(req, res) {
  const { courseSessionId, alertWindow } = req.body;

  try {
    const numActiveAlerts = await AlertService.getActiveAlerts(courseSessionId, alertWindow);
    res.send({ activeAlerts : numActiveAlerts });
  }
  catch (e) {
    console.error("[ERROR] in AlertRouter > getActiveAlerts : " + e);
    res.error();
  }
}

function generateRandomAlerts(req, res) {
  res.send( { activeAlerts : Math.floor((Math.random() * 40) + 1)} );
}


export default router;