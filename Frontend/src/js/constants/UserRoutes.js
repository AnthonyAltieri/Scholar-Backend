/** Author: Anthony Altieri **/

(() => {
  angular
    .module('app')
    .factory('UserRoutes', UserRoutes);

  UserRoutes.$inject = [];

  function UserRoutes() {
    const prefix = '/api/user';

    return  {
      LOG_IN: prefix + '/logIn',
      SIGN_UP: prefix + '/signUp',
      LOG_OUT: prefix + '/logOut',
      CHECK_FOR_VALID_SESSION: prefix + '/session/checkValid', 
      GET_TYPE: prefix + '/getType',
      GET_INFO: prefix + '/getInfo',
      ID_GET: prefix + '/get/id',
      TEST: prefix + '/test',
      CREATE_INSTRUCTOR_ACCOUNT: '/api/admin' + '/createInstructorAccount'
    };
  }
})();

