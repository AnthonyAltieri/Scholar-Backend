'use strict';

import SERVER_ENV from './ServerEnv';
import Socket from './services/Socket';
import fs from 'fs';
import https from 'https';
import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import path from 'path';
import mongoose from 'mongoose';
import SchoolService from './services/SchoolService'

import IdUtility from './utilities/IdUtility';
const MongoStore = require('connect-mongo/es5')(session);
const compression = require('compression');
const isOnRemoteServer = process.env.NODE_ENV === 'production';
import moment from 'moment-timezone';

Socket.init();

var PORTS = !!isOnRemoteServer
  ? [80, 443]
  : [7000, 8001];

const SESSION_SECRET = 'Scholar620';

mongoose.connect('mongodb://localhost/Scholar');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Database connection is open.');
});

var app = express();

if (process.env.NODE_ENV === 'production') {
  app.use(compression());
}

//JANK Logging
app.use((req, res, next) => {
  console.log(`time: ${moment().format('YYYY-MM-DD, h:mm:ss a')} \ntype: ${req.method} \nurl: ${req.url}`);
  next();
});

app.use((req, res, next) => {
  res.success = () => {
    res.send({
      success: true
    })
  };

  res.error = (error) => {
    console.error('ERROR: ', error);
    res.send({
      error: 'Server Error',
    })
  };

  next();
});

console.log('process.env.NODE_ENV', process.env.NODE_ENV);

if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (!req.secure) {
      res.redirect('https://' + req.headers.host + req.url);
      return;
    }
    next();
  })
}

const ORIGIN = isOnRemoteServer
  ? 'https://scholarapp.xyz'
  : 'http://localhost:3000';

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, *');
  next();
});

// Set up the application's body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var store = new MongoStore({ mongooseConnection: mongoose.connection });

app.use(session({
  genid: req => {
    return (IdUtility.generateUId());
  },
  secret: SESSION_SECRET,
  store: store
}));

app.use('/static', express.static(path.join(__dirname, '../../Frontend/dist')));

app.post('/schools', async function(req, res){
  res.send((await SchoolService.findAll()).map(s => s.name));
});

app.get("/pusher/auth", function(req, res) {
  var query = req.query;
  var socketId = query.socket_id;
  var channel = query.channel_name;
  var callback = query.callback;

  var auth = JSON.stringify(Socket.authenticate(socketId, channel));
  var cb = callback.replace(/\"/g,"") + "(" + auth + ");";

  res.set({
    "Content-Type": "application/javascript"
  });

  res.send(cb);
});


app.get("/pusher/auth", function(req, res) {
  const query = req.query;
  const socketId = query.socket_id;
  const channel = query.channel_name;
  const callback = query.callback;
  const auth = JSON.stringify(Socket.authenticate(socketId, channel));
  const cb = callback.replace(/\"/g,"") + "(" + auth + ");";
  res.set({
    "Content-Type": "application/javascript"
  });
  res.send(cb);
});

if (!!isOnRemoteServer) {
  const server = https.createServer(
    {
      key: fs.readFileSync('/home/ec2-user/tls/key.pem'),
      cert: fs.readFileSync('/home/ec2-user/tls/cert.pem'),
    },
    app
  );
  server.listen(PORTS[1]);
}
app.listen(PORTS[0], async function() {
  console.log('Starting server, listening on port %s', PORTS[0]);
});

import UserRouter from './routers/UserRouter';
app.use('/api/user', UserRouter);

import CourseRouter from './routers/CourseRouter';
app.use('/api/course', CourseRouter);

import CourseSettingsRouter from './routers/CourseSettings'
app.use('/api/courseSettings', CourseSettingsRouter);

import InstructorSettingsRouter from './routers/InstructorSettings'
app.use('/api/instructorSettings', InstructorSettingsRouter);

import CourseSessionRouter from './routers/CourseSession'
app.use('/api/courseSession', CourseSessionRouter);

import QuestionRouter from './routers/Question';
app.use('/api/question', QuestionRouter);

import ResponseRouter from './routers/Response'
app.use('/api/response', ResponseRouter);

import AssessmentBankRotuer from './routers/AssessmentBank';
app.use('/api/assessmentBank', AssessmentBankRotuer);

import BankedAssessmentRouter from './routers/BankedAssessment';
app.use('/api/bankedAssessment', BankedAssessmentRouter);

import InstantAssessmentRouter from './routers/InstantAssessment';
app.use('/api/instantAssessment', InstantAssessmentRouter);

import ReflectiveAssessmentRouter from './routers/ReflectiveAssessment';
app.use('/api/reflectiveAssessment', ReflectiveAssessmentRouter);

import AlertRouter from './routers/AlertRouter'
app.use('/api/alert', AlertRouter);

import VoteRouter from './routers/VoteRouter';
app.use('/api/vote', VoteRouter);

import TextMessageRouter from './routers/TextMessage';
app.use('/api/text', TextMessageRouter);

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../Frontend/dist/index.html'));
});
