(() => {
  angular
    .module('app')
    .controller('InstructorAssessmentProposeController', InstructorAssessmentProposeController)

  InstructorAssessmentProposeController.$inject = ['$scope', 'ServerService']

  function InstructorAssessmentProposeController($scope, ServerService) {
    const vm = this;
    init();

    $scope.$on('ASSESSMENT_ACTIVATED', (event, data) => {
      vm.input.question = '';
    });

    function init() {
      vm.input = {
        question: ''
      };
    }
  }
})();