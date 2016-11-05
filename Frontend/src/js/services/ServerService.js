/** Author: Anthony Altieri **/

(() => {
    'use strict';

    angular
      .module('app')
      .factory('ServerService', ServerService);

    ServerService.$inject = ['$http', '$state', '$rootScope', 'UserRoutes'];

    function ServerService($http, $state, $rootScope, UserRoutes) {
      let self = this;
        
      self.postWithoutPrefix = postWithoutPrefix;
      self.post = post;
      self.p = p;
        self.promisePostWithoutPrefix = promisePostWithoutPrefix;
      self.checkForValidSession = checkForValidSession;

      let SERVER_PREFIX = null;

      switch ($rootScope.ENV) {
        case 'DEVELOPMENT':
          SERVER_PREFIX = 'http://localhost:8000';
          break; 
        case 'PRODUCTION':
          SERVER_PREFIX = 'http://scholarapp.xyz';
          break;
      }
      
      function postWithoutPrefix(prefix, url, params, successCallback, failCallback) {
        $http.post(prefix + url, params)
          .then(
            response => {
              successCallback(response);
            }, response => {
              failCallback(response);
            }
          )
      }

      function post(url, params, successCallback, failCallback) {
        $http.post(SERVER_PREFIX + url, params)
          .then(
            response => {
              successCallback(response);
            }, response => {
              failCallback(response);
            }
          );
      }

      function p(url, params) {
        return new Promise((resolve, reject) => {
          $http.post(SERVER_PREFIX + url, params)
            .then((response) => { resolve(response.data) })
            .catch((response) => { reject(response) })
        })
      }

      function promisePostWithoutPrefix(url, params) {
        return new Promise((resolve, reject) => {
          $http.post( url, params)
            .then((response) => { resolve(response.data) })
            .catch((response) => { reject(response) })
        })
      }

      function checkForValidSession() {
        self.post(UserRoutes.CHECK_FOR_VALID_SESSION, {},
            resSuccess => {
              const { data } = resSuccess;
              const { hasValidSession } = data;
            if (!hasValidSession) {
              $state.go('launch.login');
            }
          }, responseFail => {});
      }
      

      return self;
    }
})();

