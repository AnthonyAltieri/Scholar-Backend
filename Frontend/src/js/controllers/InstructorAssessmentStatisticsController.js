(() => {
  angular
    .module('app')
    .controller('InstructorAssessmentStatisticsController', InstructorAssessmentStatisticsController)

  InstructorAssessmentStatisticsController.$inject = ['$rootScope', '$scope', 'SocketService'];

  function InstructorAssessmentStatisticsController($rootScope, $scope, SocketService) {
    const vm = this;

    vm.currentAlerts = 0;
    vm.attendance = 0;
    vm.numberAnswered = 0;
    vm.numberReviewed = 0;
    vm.percentAnswered = '';


    $scope.$on('ASSESSMENT_STOP', (event, data) => {
      resetAssessmentInteraction(vm);
    });

    $scope.$on('ASSESSMENT_ACTIVATED' , (event, data) => {
      resetAssessmentInteraction(vm);
    });

    function resetAssessmentInteraction(vm) {
      vm.numberAnswered = 0;
      vm.numberReviewed = 0;
      vm.percentAnswered = '0%';
    }

    $scope.$on('ASSESSMENT_INSTANT_SELECTION', (event, data) => {
      const { answerObject } = data;
      vm.numberAnswered = answerObject.A + answerObject.B + answerObject.C + answerObject.D + answerObject.E
    });

    $scope.$on('ASSESSMENT_REVIEWED', (event, data) => {
      const { numberReviewed } = data;
      vm.answersSubmitted = numberReviewed;
      $scope.$apply();
    });

    $scope.$on('ASSESSMENT_ANSWERED', (event, data) => {
      const { numberAnswered } = data;
      vm.numberAnswered = numberAnswered;
      $scope.$apply();
    });

    $scope.$on('ALERT_UPDATED', (event, data) => {
      const { currentAlerts } = data;
      vm.currentAlerts = currentAlerts;
      $scope.$apply();
    });

    $scope.$on('STUDENT_JOINED', (event, data) => {
      const { attendance } = data;
      vm.attendance = attendance;
      $scope.$apply();
    });

    $scope.$on('STUDENT_LEFT', (event, data) => {
      const { attendance } = data;
      vm.attendance = attendance;
      $scope.$apply();
    });

    $scope.$on('RA_RESPONSE_NUMBER', (event, data) => {
      const { number } = data;
      vm.numberAnswered = number;
      vm.percentAnswered = Math.floor(vm.numberAnswered / vm.attendance );
      $scope.$apply();
    });

    $scope.$on('RA_RESPONSE_REVIEWED', (event, data) => {
      const { number } = data;
      vm.numberReviewed = number;
      $scope.$apply();
    })

    $scope.$on('INSTANT_ASSESSMENT_SELECTION', (event, data) => {
      const { answerObject } = data;
      vm.numberAnswered = answerObject.A + answerObject.B + answerObject.C + answerObject.D + answerObject.E;
      const percent = vm.numberAnswered/vm.attendance * 100;
      vm.percentAnswered = `${Math.round(percent)}%`;
      $scope.$apply();
    })
  }
})();