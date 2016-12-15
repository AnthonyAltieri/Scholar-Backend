/**
 * Created by bharatbatra on 12/14/16.
 */
var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');

router.post('/add', addAlert);
router.post('/get/active', getActiveAlerts);


async function addAlert(req, res) {
  { userId, courseId, courseSess }
}

async function getActiveAlerts(req, res) {

}