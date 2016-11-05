/** Author: Anthony Altieri **/

(() => {
  'use strict';

  angular
    .module('app')
    .controller('LoginController', LoginController);

  LoginController.$inject = [
    '$rootScope', '$state', 'UserService', 'ServerService', 'UserRoutes', 'CourseRoutes', '$interval'
  ];

  function LoginController
  (
    $rootScope, $state, UserService, ServerService, UserRoutes, CourseRoutes, $interval
  ) {
    const vm = this;

    vm.input = {
      email: '',
      password: ''
    };
    vm.invalidEmail = false;
    vm.emailError = false;
    vm.passwordError = false;

    UserService.handleAlreadyLoggedIn(isLoggedIn => {
      if (isLoggedIn) {
        $state.go('dash.courses.active');
      } else {
        $rootScope.loading = false;
      }
    });


    vm.tryLogin = tryLogin;
    vm.goToSignUp = goToSignUp;
    vm.validEmail = validEmail;

    function tryLogin(input) {
      vm.loggingIn = true;
      const email = input.email.trim().toLowerCase();
      if (!email) {
        toastr.error('Incorrect Email');
        return;
      }
      const password = input.password.trim();
      if (!password) {
        toastr.error('Incorrect Password');
        return;
      }
      UserService.logIn(email, password, error => {
        switch (error) {
          case 'ERROR_EMAIL':
            vm.emailError = true;
            break;
          case 'ERROR_PASSWORD':
            vm.emailError = false;
            vm.passwordError = true;
            break;
        }
        vm.loggingIn = false;
      })
    }

    function goToSignUp() {
      $state.go('launch.signup');
    }

    function validEmail(email) {
      const regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return regex.test(email);
    }

  }



})();
