/** Author: Anthony Altieri **/

(() => {
  'use strict';

  angular
    .module('app')
    .controller('SignUpController', SignUpController);

  SignUpController.$inject = [
    '$rootScope', '$state', 'ServerService', 'UserRoutes', 'UserService'
  ];

  function SignUpController
  (
    $rootScope, $state, ServerService, UserRoutes, UserService
  ) {
    var vm = this;

    $rootScope.loading = false;
    
    vm.input = {
      email: '',
      firstname: '',
      lastname: ''
    };
    vm.signingUp = false;
    
    UserService.handleAlreadyLoggedIn(isLoggedIn => {
      if (isLoggedIn) {
        $state.go('dash.courses.active');
      }
    });

    vm.goBack = goBack;
    vm.createAccount = createAccount;


    function goBack() {
      $state.go('launch.login');
    }

    function createAccount(input) {
      vm.signingUp = true;
      
      const email = input.email.trim().toLocaleLowerCase();
      const { password, firstName, lastName } = input;
      UserService.createAccount(email, password, firstName, lastName, () => {
        vm.signingUp = false
      });
    }
  }

})();