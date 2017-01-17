'use strict';

class IdUtility {
  constructor() {};

  static rand4Str () {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  }
  
  static generateUId() {
    return this.rand4Str() + this.rand4Str() + this.rand4Str() + this.rand4Str() 
      + this.rand4Str() + this.rand4Str();
  }
}

module.exports = IdUtility;