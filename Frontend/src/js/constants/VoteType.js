/** Author: Anthony Altieri **/

(() => {
  angular
    .module('app')
    .factory('VoteType', VoteType);

  function VoteType() {
    return {
      SIMILAR: 'SIMILAR',
      DIFFERENT: 'DIFFERENT',
      UNKOWN: 'UNKOWN',
      UP: 'UP',
      DOWN: 'DOWN'
    }
  }
})();
