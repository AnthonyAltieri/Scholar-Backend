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
    const alert = await AlertService.attemptAddAlert(userId, courseId, courseSessionId, alertWindow);

    if (!!alert) {
      res.send({alert: AlertService.mapToSend(alert)})
    }
    else {
      res.error();
    }
  }
  catch (e) {
    res.error("[ERROR] in AlertRouter > addAlert : " + e);
  }

}

async function getActiveAlerts(req, res) {
  const { courseSessionId, alertWindow } = req.body;

  try {
    res.send({ activeAlerts : await AlertService.getActiveAlerts(courseSessionId, alertWindow)});
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