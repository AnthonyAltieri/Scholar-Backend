/**
 * Created by bharatbatra on 12/20/16.
 */
var twilio = require('twilio');
import {joinAttendance} from './CourseSession'
var accountSid = 'ACf32fd596aaf2c7b337fc60728e1c7054';
var authToken = 'c4c956df0eb0404e40ac162e07d151f4';

//require the Twilio module and create a REST client
var client = twilio(accountSid, authToken);
var primaryNumber = "+18889975717";
var testNumber = "+17148057951";

var express = require('express');
var router = express.Router();

import TextMessageService from '../services/TextMessage';


router.post('/attendance', textJoinAttendance);
router.post('/sendText', sendTestMessage);
router.post('/receiveText', receiveTestMessage);

//This method acts as a reducer for all text interaction
async function textJoinAttendance(req, res)
{
  try {
    console.info("[INFO] TextMessage Router > textJoinAttendance : Text Received from Number " + req.body.From);
    const content = req.body.Body;
    let phone = TextMessageService.parsePhone(req.body.From);

    console.log(phone);

    const serialized = TextMessageService.parseMessage(content);

    const payload = await TextMessageService.generateResponse(serialized, phone);

    console.log(JSON.stringify(payload, null, 2));

    var twiml = new twilio.TwimlResponse();
    twiml.message(payload.content ? payload.content : TextMessageService.HELP_TEXT_2);
    res.writeHead(200, {'Content-Type': 'text/xml'});
    res.end(twiml.toString());
  }
  catch (e) {
    console.error("[ERROR] TextMessage Router > textJoinAttendance : " + e);
  }


}

function sendTestMessage(req, res) {
  const {content} = req.body;
  client.messages.create({
    to: primaryNumber,
    from: testNumber,
    body: content,
  },
    function(err, message) {
      if (!!err) {
        console.log(err);
        console.log(message);
        res.send({error : error});
      } else {
        res.send({success: 1});
      }
    });
}

function receiveTestMessage(req, res){
  const content = req.body.Body;
  console.log("Message From " + req.body.From);
  console.log(content);
  res.end();
}

export default router;
