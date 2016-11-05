(() => {
  angular
    .module('app')
    .controller('InstructorQuestionListController', InstructorQuestionListController);

  InstructorQuestionListController.$inject = [
    '$rootScope', '$scope', 'SocketRoutes', 'QuestionListService', 'ServerService',
    'CourseSessionRoutes', 'SocketService'
  ];

  function InstructorQuestionListController(
    $rootScope, $scope, SocketRoutes, QuestionListService, ServerService, CourseSessionRoutes,
    SocketService
  ) {
    const vm = this;

    vm.loading = true;

    vm.dismissQuestion = dismissQuestion;
    vm.timeFromNow = timeFromNow;

    vm.courseSession = {};
    vm.courseSession.id = "";

    vm.toggleQuestionList = toggleQuestionList;
    vm.questionListToggleValue=true;
    function dismissQuestion(question, questionId, courseSessionId) {
      vm.all = vm.all.filter(q => q._id.toString() !== questionId.toString())
      ServerService.p(CourseSessionRoutes.QUESTIONS_REMOVE, { questionId, courseSessionId })
        .then((data) => {
          const { success } = data;
          if (!success) {
            toastr.error('Server Error', 'Please dismiss question again.');
            vm.all.push(question);
          }
        })
    }

    function timeFromNow(dateString) {
      return moment(dateString).fromNow();
    }

    function init(courseSessionId) {
      QuestionListService.get(courseSessionId)
        .then((questions) => {
          vm.all = questions
          vm.loading = false;
          $scope.$emit('QUESTION_NUMBER', {
            number: vm.all.length,
          });
        });
      QuestionListService.isQuestionListActive(courseSessionId, val => {
        vm.questionListToggleValue = val;
        console.log("After checking: " + vm.questionListToggleValue);
      });
      vm.courseSession.id = courseSessionId;


    }

    $scope.$on('QUESTION_ADDED', (event, data) => {
      const { questions } = data;
      vm.all = questions;
      $scope.$emit('QUESTION_NUMBER', {
        number: vm.all.length,
      });
      $scope.$apply();
    });

    $scope.$on('QUESTION_DISMISSED', (event, data) => {
      const { questions } = data;

      vm.all = questions;

      $scope.$emit('QUESTION_NUMBER', {
        number: vm.all.length,
      });
      $scope.$apply();
    });

    $scope.$on('QUESTION_VOTE', (event, data) => {
      const { questionId, vote } = data;

      const indexAll = vm.all.findIndex(q => q._id.toString() === questionId.toString());
      switch (vote.type) {
        case 'UP': {
          vm.all[indexAll].votes = [...vm.all[indexAll].votes, vote];
          vm.all[indexAll].rank += 1;
          break;
        }
        case 'DOWN': {
          vm.all[indexAll].votes = vm.all[indexAll].votes.filter(v => (
            v.userId.toString() !== vote.userId.toString()
          ));
          vm.all[indexAll].rank -= 1;
        }
      }
      $scope.$apply();
    });


    $scope.$on('COURSESESSION_JOINED_QUESTION', (event, data) => {
      const { courseSessionId } = data;
      vm.courseSessionId = courseSessionId;

      init(courseSessionId);

      SocketService.handleQuestionAdded(courseSessionId);
      SocketService.handleQuestionDismissed(courseSessionId);
      SocketService.handleQuestionVote(courseSessionId);
    });

    function toggleQuestionList(){
      console.log("toggle : " + vm.questionListToggleValue);
      QuestionListService.toggleQuestionList(vm.courseSession.id);
    }


    $scope.$emit('QUESTION_LIST_INIT', {});
  }
})();