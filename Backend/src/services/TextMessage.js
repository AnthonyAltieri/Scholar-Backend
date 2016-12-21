/**
 * Created by bharatbatra on 12/20/16.
 */
import db from '../db';
import mongoose from 'mongoose';
import UserSchema from '../schemas/User';
const User = mongoose.model('users', UserSchema);
// import CourseSchema from '../schemas/Course';
// const Course = mongoose.model('Courses', CourseSchema);
//
import QuestionService from '../services/Question';
import UserService from '../services/UserService';
import CourseSessionService from '../services/CourseSession'
import Socket from '../services/Socket'
import Events from '../services/Events'

const HELP_TEXT_1 = "Usage  \n"
  +"———————— \n"
  +"[Attendance] text this: \n"
  +"code : (Code) \n"

  +"where (Code) is the attendance code your professor gives you \n"
  + "Example: code : ABCD \n";

const HELP_TEXT_2 = HELP_TEXT_1
+"———————— \n"
+"[Ask a question] text this:\n"
+"question: (your question) \n"

+"notice the space in between the : and your question \n"
+"Example:what is life?";


//Converts the text message into a serialized JSON object
function parseMessage(content) {
  let returnObj = {};
  try {
    console.log(content);
    let parts = content.split('&');
    console.log(JSON.stringify(parts));
    parts.forEach( part => {
      let segments = part.split(":");
      console.log(segments[0] + " : " + segments[1]);
      returnObj[segments[0].trim().toLowerCase()] = segments[1].trim();
    });
    return returnObj;
  }
  catch(e) {
   console.error("[ERROR] TextMessageService > parseMessage : " + e);
  }
}

function parsePhone(phone) {
  console.log("Parsing Phone : " + phone);
  return phone.substring(phone.indexOf("+1") + 2);
}


async function generateResponse(serialized, phone) {
  let objToSend = {};
  try {

    console.log("Generate Response");

    objToSend.content = "";

    let user = await UserService.findByPhone(phone);
    console.log(JSON.stringify(user, null, 2));

    let courseId = user.textBoundCourse;
    let courseSessionId = user.textBoundSession;

    if (!!serialized.email && !!serialized.password && !user) {
      console.log("Gonna try to login");
      const { user } = await UserService.attemptLogin(serialized.email, serialized.password);
      if(!!user.error) {
        console.log("Error - couldn't log in");
        console.log(user.error);
        objToSend.content += "ERROR : " + user.error;
      }
      else {
        objToSend.content += "Success! Logged In";
        console.log("Success : logged in");
      }
      console.log(JSON.stringify(user, null, 2)) ;
    }

    if (!!serialized.code && !!user) {
      let courseSession = await CourseSessionService.findByAttendanceCode(serialized.code);
      if(!!courseSession){
        const payload = await CourseSessionService.studentJoinAttendance(courseSession.id, serialized.code, user.id);
        if(!!payload.attendance) {
          courseId = courseSession.courseId;
          courseSessionId = courseSession.id;
          user.textBoundSession = courseSessionId;
          user.textBoundCourse = courseId;
          db.save(user);
          Socket.send(
            Socket.generatePrivateChannel(courseSessionId),
            Events.STUDENT_JOINED_ATTENDANCE,
            { attendance: payload.attendance }
          );
          objToSend.content += "Success! Joined Attendance";
        }
        else {
          objToSend.content += JSON.stringify(payload) + "\n";
        }
      }
    }


    if(!!serialized.question && !!courseSessionId && !!courseId) {
      let question = await QuestionService
        .build(
          serialized.question,
          user.id,
          courseId,
          courseSessionId,
        );
        if (!!question) {
          Socket.send(
            Socket.generatePrivateChannel(courseSessionId),
            Events.QUESTION_ASKED,
            {
              question: QuestionService.mapToSend(question),
            }
          );
          objToSend.content += "Question Added Successfully!\n";
        }
    }
    return objToSend;

  } catch (error) {
    console.error("[ERROR] TestMessage Service > generateResponse : " + error);
    return objToSend;
  }
}

export default{
  parseMessage,
  HELP_TEXT_2,
  generateResponse,
  parsePhone
}
