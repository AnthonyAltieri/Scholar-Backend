/** Author: Anthony Altieri **/

(() => {
  angular
    .module('app')
    .factory('UserService', UserService);
  
  UserService.$inject = ['$rootScope', '$state', 'ServerService', 'UserRoutes'];
  
  function UserService
  (
    $rootScope, $state, ServerService, UserRoutes
  ) {
    const self = this;
    
    self.handleAlreadyLoggedIn = handleAlreadyLoggedIn;
    self.getUserType = getUserType;
    self.logOut = logOut;
    self.logIn = logIn;
    self.createAccount = createAccount;
    self.getUserInformation = getUserInformation;
    self.getId = getId;
    self.createInstructorAccount = createInstructorAccount;
    
    
    function getUserType(callback) {
      ServerService.post(UserRoutes.GET_TYPE, {},
        responseSuccess => {
          const { data } = responseSuccess;
          const { type } = data;
          
          callback(type);
        },
        responseFail => {}
      )
    }
    
    function logOut() {
      ServerService.post(UserRoutes.LOG_OUT, {},
        responseSuccess => {
          $state.go('launch.login');
          toastr.success('Successfully logged out');
        }, 
        responseFail => {}
      )
    }
    
    function logIn(email, password, callback) {
      if (!email) {
        toastr.error('Email is incorrect, try again', 'Login Failed');
        callback(false);
        return
      }

      if (!password) {
        toastr.error('Password is incorrect, try again', 'Login Failed');
        callback(false);
        return
      }

      ServerService.post(UserRoutes.LOG_IN, {
          email,
          password
        },
        resSuccess => {
          const { data } = resSuccess;
          const { success, foundUser, name, userType } = data;

          if (success) {
            $state.go('dash.courses.active');
          } else {
            if (foundUser) {
              toastr.error('Password incorrect');
              callback('ERROR_PASSWORD');
            } else {
              toastr.error('No account found for that email')
              callback('ERROR_EMAIL');
            }

          }
        }, resFail => { callback(null) }
      );
      
    }
    
    function createAccount(email, password, firstName, lastName, callback) {
      if (!email || !email.trim()) {
        toastr.error('Enter a valid email');
        callback();
        return
      }
      if (!password || !password.trim()) {
        toastr.error('Enter a valid password');
        callback();
        return
      }
      if (!firstName || !firstName.trim()) {
        toastr.error('Enter a valid First Name');
        callback();
        return
      }
      if (!lastName || lastName.trim('').length === 0) {
        toastr.error('Enter a valid Last Name');
        callback();
        return
      }
      ServerService.post(UserRoutes.SIGN_UP, {
        email,
        password,
        firstName,
        lastName,
        userType: 'STUDENT'
      },
        resSuccess => {
          const { data } = resSuccess;
          const { success, msg } = data;

          if (success) {
            toastr.success('Account successfully created.');
            $state.go('dash.courses.active');
          } else {
            if (msg === 'Email in use') {
              toastr.error('Email in use, try another one.');
            } else if (msg === 'Server error') {
            }
          }
          callback()
        }, 
        resFail => {
          callback()
        }
      )
      
    }
    
    function getUserInformation() {
      return new Promise((resolve, reject) => {
        ServerService.p(UserRoutes.GET_INFO, {})
          .then((data) => { resolve(data) })
      })
    }
    
    function handleAlreadyLoggedIn(callback) {
      ServerService.post(UserRoutes.CHECK_FOR_VALID_SESSION,
        {},
        resSuccess => {
          const { data } = resSuccess;
          const { hasValidSession } = data;
          if (hasValidSession) {
            console.log("valid session");
            callback(true);
          } else {
            console.log("invalid session");
            callback(false);
          }
        }, resFail => {}
      )
    }


    function getId() {
      return new Promise((resolve, reject) => {
        ServerService.p(UserRoutes.ID_GET, {})
          .then(id => { resolve(id) })
      });
      // Todo: handle reject
    }

    function createInstructorAccount(email, password, firstName, lastName, courseCode, courseTitle, time, callback){
      ServerService.post(UserRoutes.CREATE_INSTRUCTOR_ACCOUNT, {
            email,
            password,
            firstName,
            lastName,
            courseCode,
            courseTitle,
            time
          },
          resSuccess => {
            const { data } = resSuccess;
            const { success, user, course, msg } = data;

            if (success) {
              toastr.success('Instructor Account & Course successfully created.');
              console.log(user);
              console.log(course);
            } else {
              if (msg === 'Email in use') {
                toastr.error('Email in use, try another one.');
              } else if (msg === 'Server error') {
                console.log("Server Error : " + msg);
              }
            }
            callback(user, course)
          },
          resFail => {
            callback()
          });
    }
    
    return self
  }


  
  
})();