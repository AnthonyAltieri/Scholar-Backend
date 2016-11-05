/** @author: Anthony Altieri **/

(() => {
  angular
    .module('app')
    .factory('CourseSessionRoutes', CourseSessionRoutes);
  
  CourseSessionRoutes.$inject = [];
  
  function CourseSessionRoutes() {
    const self = this;

    const prefix = '/api/courseSession';


    // Students
    self.STUDENT_REMOVE = prefix + '/student/remove';

    // Attendance
    self.ATTENDANCE_GET = prefix + '/attendance/get';

    // Questions
    self.QUESTIONS_GET = prefix + '/questions/get';
    self.QUESTIONS_GET_OBJECTS = prefix + '/questions/getObjects';
    self.QUESTIONS_ADD = prefix + '/questions/add';
    self.QUESTIONS_VOTE = prefix + '/questions/vote';
    self.QUESTIONS_REMOVE = prefix + '/questions/remove';
    self.QUESTIONLIST_TOGGLE = prefix + '/questionList/toggle';
    self.QUESTIONLIST_IS_ACTIVE = prefix + '/questionList/isActive';

    // Alerts
    self.ALERTS_ADD = prefix + '/alerts/add';
    self.ALERTS_GET_NUMBER_ACTIVE = prefix + '/alerts/getNumberActive';
    self.ALERTS_GET_NUMBER_AND_PERCENT = prefix + '/alerts/getNumberAndPercent';
    self.ALERTS_SET_THRESHOLD = prefix + '/alerts/setThreshold';

    // Util
    self.LEAVE = prefix + '/leave';

    // Assessments
    self.ASSESSMENTS_GET_PRIOR_SELECTIONS = prefix + '/assessments/getPriorSelections';
    self.ASSESSMENTS_GET_PRIOR_ACTIVE = prefix + '/assessments/getPriorActive';

    
    return self;
  }
  
})();


