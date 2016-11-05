/** @Author: Anthony Altieri **/

;(() => {
  angular
    .module('app')
    .factory('CourseSessionService', CourseSessionService);
  
  CourseSessionService.$inject = ['$state', 'ServerService', 'CourseSessionRoutes'];
  
  function CourseSessionService
  (
    $state, ServerService, CourseSessionRoutes
  ) {
    const self = this;

    self.removeStudentFromAll = removeStudentFromAll;
    self.getQuestionObjects = getQuestionObjects;
    self.getQuestions = getQuestions;
    self.getAttendance = getAttendance;


    function removeStudentFromAll(courseSessionId) {
      ServerService.post(CourseSessionRoutes.STUDENT_REMOVE,
        {
          courseSessionId
        },
        responseSuccess => {},
        responseFail => {}
      )
    }

    function getQuestionObjects(courseSessionId) {
      return new Promise((resolve, reject) => {
        ServerService.p(CourseSessionRoutes.QUESTIONS_GET_OBJECTS, { courseSessionId })
          .then((data) => {
            const { questions, votedOn, asked } = data;
            resolve({ questions, votedOn, asked })
          })
      });
      // TODO: handle when server fails
    }

    function getQuestions(courseSessionId) {
      return new Promise((resolve, reject) => {
        ServerService.p(CourseSessionRoutes.QUESTIONS_GET, { courseSessionId })
          .then((data) => {
            const { questions } = data;
            resolve(questions);
          })
      })
      // TODO: handle when server fails
    }

    function getAttendance(courseSessionId) {
      return new Promise((resolve, reject) => {
        ServerService.p(CourseSessionRoutes.ATTENDANCE_GET, { courseSessionId })
          .then((data) => {
            resolve(data)
          })
      })
      // todo: handle error
    }


    return self
  }
  
})();