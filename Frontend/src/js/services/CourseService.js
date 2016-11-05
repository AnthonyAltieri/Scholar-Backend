/** Author: Anthony Altieri **/

(() => {
  angular
    .module('app')
    .factory('CourseService', CourseService);
  
  CourseService.$inject = [
    '$state', 'ServerService', 'CourseRoutes'
  ];
  
  function CourseService 
  (
    $state, ServerService, CourseRoutes
  ) {
    var self = this;
    
    self.activateOrJoinCourseSession = activateOrJoinCourseSession;
    self.joinCourseSession = joinCourseSession;
    self.getAllCourses = getAllCourses;
    self.getEnrolledCourses = getEnrolledCourses;
    self.handleCourseRegistration = handleCourseRegistration;

    function activateOrJoinCourseSession(userId, courseId) {
      ServerService.post(CourseRoutes.COURSESESSION_ACTIVATE_OR_JOIN, {
        userId, 
        courseId
      }, responseSuccess => {
        const { data } = responseSuccess; 
        const { success, code, courseSessionId, instructorName, confusionThreshold } = data;

        if (success) {

          $state.go('dash.instructor', {
            data: {
              courseId,
              courseSessionId,
              instructorName,
              code,
              confusionThreshold
            }
          });
        }
      }, responseFail => {});
    }
    
    function joinCourseSession(courseId) {
      ServerService.post(CourseRoutes.COURSESESSION_ACTIVE_JOIN,
        {
          courseId
        }, resSuccess => {
          const { data } = resSuccess;
          const { success, code, courseSessionId } = data;

          if (success) {
            $state.go('dash.student', {
              data:  {
                courseId,
                code,
                courseSessionId
              }
            });
          }
        }, responseFail => {}
      )
    }
    
    function getAllCourses(callback) {
      ServerService.post(CourseRoutes.GET_ALL, {},
        resSuccess => {
          const { data } = resSuccess;
          const { success, courses } = data;

          if (success) {
            let active = [];
            let inactive = [];
            
            courses.forEach(c => {
              if (c.hasActiveSession) {
                active.push(c)
              } else {
                inactive.push(c)
              }
            });
            
            callback(active, inactive);
          }
        },
        resFail => {}
      )
    }

    function getEnrolledCourses(callback) {
      ServerService.post(CourseRoutes.GET_ENROLLED, {},
        resSuccess => {
          const { data } = resSuccess;
          const { success, courses } = data;

          if (success) {
            let active = [];
            let inactive = [];

            courses.forEach(c => {
              if (c.hasActiveSession) {
                active.push(c)
              } else {
                inactive.push(c)
              }
            });

            callback(active, inactive);
          }
        },
        resFail => {}
      )
    }

    function handleCourseRegistration(){
      const courseId = readCookie("course-registration");
      if( courseId ){
        ServerService.post(CourseRoutes.REGISTER_STUDENT_TO_COURSE,
            {
              courseId
            }, resSuccess => {
              toastr.success("You have been enrolled in this course! Setting it up for you!");


            }, responseFail => {
              toastr.error("Error - Could not enroll you in this Course");
            }
        )
      }
      eraseCookie("course-registration");
    }
    
    return self
  }
  
})();