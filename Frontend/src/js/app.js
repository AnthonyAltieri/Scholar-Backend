/** Author: Anthony Altieri **/

(() => {
  angular
    .module('app', ['ui.router',  'nvd3'])
    .run(($http, $rootScope) => {
      $http.defaults.headers.common["X-Requested-With"] = 'XMLHttpRequest';

      $rootScope.ENV = ENV;

      switch ($rootScope.ENV) {
        case "DEVELOPMENT":
          $rootScope.socket = io.connect('http://localhost:8000');
          break;

        case "PRODUCTION":
          $rootScope.socket = io.connect('http://scholarapp.xyz');
          break;
      }

      $rootScope.socket.on('connect', () => {
        $rootScope.isSocketConnected = true;
        $rootScope.$broadcast('SOCKET_CONNECT', {});
      });
      $rootScope.socket.on('disconnect', () => {
        $rootScope.isSocketConnected = false;
        $rootScope.$broadcast('SOCKET_DISCONNECT', {});
      });


      $rootScope.loading = true;

      // Toast Options
      toastr.options.positionClass = 'toast-bottom-full-width';
      toastr.options.showDuration = 500;
      toastr.options.hideDuration = 500;
      toastr.options.timeOut = 3000;
    })
    .config(($stateProvider, $urlRouterProvider, $httpProvider, $locationProvider) => {

      $httpProvider.defaults.withCredentials = true;

      const launch = {
        name: 'launch',
        url: '/launch',
        templateUrl: '/static/templates/launch.html',
        abstract: true
      };

      const launchLogIn = {
        name: 'launch.login',
        parent: 'launch',
        url: '/login',
        templateUrl: '/static/templates/launch.login.html',
        controller: 'LoginController',
        controllerAs: 'vm'
      };

      const dashConfusion = {
        name: 'dash.confusion',
        url: '/confusion',
        templateUrl: '/static/templates/popup.confusion.html',
        controller: 'ConfusionPopUpController',
        controllerAs: 'popup'
      };

      const dashMCQ = {
        name: 'dash.mcq',
        url: '/mcq',
        templateUrl: '/static/templates/popup.mcq.html',
        controller: 'MCQPopUpController',
        controllerAs: 'popMCQ'
      };

      const launchSignUp = {
        name: 'launch.signup',
        parent: 'launch',
        url: '/signup',
        templateUrl: '/static/templates/launch.signup.html',
        controller: 'SignUpController',
        controllerAs: 'vm'
      };


      const dash = {
        name: 'dash',
        url: '/dash',
        abstract: true,
        templateUrl: '/static/templates/dash.html'
      };

      const dashCourses = {
        name: 'dash.courses',
        parent: 'dash',
        url: '/courses',
        templateUrl: '/static/templates/dash.courses.html',
        controller: 'DashCoursesController',
        controllerAs: 'dash'
      };

      const dashAdmin = {
        name: 'dash.admin',
        url: '/admin',
        templateUrl: '/static/templates/admin.create.instructor.account.html',
        controller: 'AdminCreateInstructorController',
        controllerAs: 'admin'
      };


      const dashCoursesActive = {
        name: 'dash.courses.active',
        parent: 'dash.courses',
        url: '/active',
        templateUrl: '/static/templates/dash.courses.active.html',
        controllerAs: 'courses'
      };

      const dashCoursesInactive = {
        name: 'dash.courses.inactive',
        parent: 'dash.courses',
        url: '/inactive',
        templateUrl: '/static/templates/dash.courses.inactive.html',
        controllerAs: 'courses'
      };

      const dashStudent = {
        name: 'dash.student',
        parent: 'dash',
        url: '/student',
        params: {
          data: null
        },
        views: {
          '': {
            templateUrl: '/static/templates/dash.student.html',
            controller: 'DashStudentController',
            controllerAs: 'dash',
          },
          'questions@dash.student': {
            templateUrl: '/static/templates/dash.student.questions.html',
            controller: 'StudentQuestionListController',
            controllerAs: 'questions'
          },
          'ask@dash.student':  {
            templateUrl: '/static/templates/dash.student.ask.html'
          },
          'reflective@dash.student': {
            templateUrl: '/static/templates/dash.student.reflective.html'
          },
          'instant@dash.student': {
            templateUrl: '/static/templates/dash.student.instant.html'
          }
        }
      };

      const dashInstructor = {
        name: 'dash.instructor',
        parent: 'dash',
        url: '/instructor',
        params: {
          data: null
        },
        views: {
          '': {
            templateUrl: '/static/templates/dash.instructor.html',
            controller: 'DashInstructorController',
            controllerAs: 'dash'
          },
          'homeStatistics@dash.instructor': {
            templateUrl: '/static/templates/dash.instructor.home.statistics.html'
          },
          'homeConfusion@dash.instructor': {
            templateUrl: '/static/templates/dash.instructor.home.confusion.html'
          },
          'homeQuestions@dash.instructor': {
            templateUrl: '/static/templates/dash.instructor.home.questions.html',
            controller: 'InstructorQuestionListController',
            controllerAs: 'questions'
          },
          'assessmentPropose@dash.instructor': {
            templateUrl: '/static/templates/dash.instructor.assessment.propose.html',
            controller: 'InstructorAssessmentProposeController',
            controllerAs: 'propose'
          },
          'assessmentStatistics@dash.instructor': {
            templateUrl: '/static/templates/dash.instructor.assessment.statistics.html',
            controller: 'InstructorAssessmentStatisticsController',
            controllerAs: 'stats'
          },
          'assessmentAnswers@dash.instructor': {
            templateUrl: '/static/templates/dash.instructor.assessment.answers.html'
          }
        }
      };


      $stateProvider
        .state('splash', {
          url: '/splash',
          templateUrl: '/static/templates/splashpage.html',
          controller: 'SplashController'
        })

        .state(launch)
        .state(launchLogIn)
        .state(launchSignUp)
        .state(dash)
        .state(dashCourses)
        .state(dashCoursesActive)
        .state(dashCoursesInactive)
        .state(dashStudent)
        .state(dashInstructor)
          .state(dashAdmin)
          .state(dashConfusion)
          .state(dashMCQ)

      // if none of the above states are matched, use this as the fallback
      $urlRouterProvider.otherwise('/splash');
      $locationProvider.html5Mode(true);

    })
  .directive('myEnter', function () {
    return function (scope, element, attrs) {
      element.bind("keydown keypress", function (event) {
        if(event.which === 13) {

          scope.$apply(function (){
            scope.$eval(attrs.myEnter);
          });

          event.preventDefault();
        }
      });
    };
  })
  ;

})();
