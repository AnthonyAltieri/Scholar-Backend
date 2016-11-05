/** @Author: Anthony Altieri **/

(() => {
  angular
    .module('app')
    .controller('DashCoursesController', DashCoursesController);

  DashCoursesController.$inject = [
    '$scope', '$rootScope', '$log', '$interval', '$state', 'ServerService', 
    'SocketService', 'CourseRoutes', 'UserRoutes', 'CourseService', 'UserService', 
    'CourseSessionService'
  ];

  function DashCoursesController 
  (
    $scope, $rootScope, $log, $interval, $state, ServerService, SocketService, 
    CourseRoutes, UserRoutes, CourseService, UserService, CourseSessionService
  ) {
    var vm = this;

    ServerService.checkForValidSession();

    //In case the user had been redirected from a course registration link, we will register now
    CourseService.handleCourseRegistration();

    // By Default Active classes are shown
    vm.tabSelected = 'ACTIVE';

    vm.user = {};

    UserService.getUserInformation()
      .then((data) => {
        const { name, type } = data;
        vm.user.name = name;
        vm.user.type = type;
      });

    vm.courses = {
      active: [],
      inactive: []
    };

    $rootScope.loading = false;
    
    let intervalPromises = [];
    
    /** Function **/

    vm.chooseClass = chooseClass;
    vm.logOut = logOut;
    vm.clickActive = clickActive;
    vm.clickInactive = clickInactive;

    /** Function Implementation **/

    function chooseClass(chosenClass) {
      switch (vm.user.type) {
        case 'INSTRUCTOR':
          CourseService.activateOrJoinCourseSession(vm.user.id, chosenClass._id);
          break;
        case 'STUDENT':
          CourseService.joinCourseSession(chosenClass._id);
          break;
      }
    }

    function logOut() {
      UserService.logOut();
    }

    CourseService.getEnrolledCourses((active, inactive) => {
      vm.courses.active = active;
      vm.courses.inactive = inactive;
    });

    // CourseService.getEnrolledCourses((active, inactive) => {
    //   vm.courses.active = active;
    //   vm.courses.inactive = inactive;
    // });
    

    function clickActive() {
      vm.tabSelected = 'ACTIVE';
    }
    
    function clickInactive() {
      vm.tabSelected = 'INACTIVE'
    }

    if ($rootScope.priorCourseSessionId) {
      CourseSessionService.removeStudentFromAll();
      $rootScope.priorCourseSessionId = null;
    }
    
    const promiseCourseGet = $interval(() => {
      CourseService.getEnrolledCourses((active, inactive) => {
        vm.courses.active = active;
        vm.courses.inactive = inactive;
      });
    }, 5000);
    intervalPromises.push(promiseCourseGet);

    $scope.$on('$destroy', () => {
      $interval.cancel(promiseCourseGet);
    })
  }

})();