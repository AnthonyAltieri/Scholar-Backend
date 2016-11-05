/** Author: Anthony Altieri **/

(() => {
  'use strict';
  
  angular
    .module('app')
    .controller('SplashController', SplashController);

  SplashController.$inject = ['$timeout', '$state'];

  function SplashController($timeout, $state) {
    var SPLASH_WAIT_TIME = 1500; 

    $timeout(() => {
      $state.go('launch.login')
    }, SPLASH_WAIT_TIME)
  }
})();