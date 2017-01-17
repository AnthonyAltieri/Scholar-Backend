class Logger {

  /**
   * Constructor to make a logger, will output to terminal in Develop
   * mode and will output to a Log file if in PRODUCTION mode
   * 
   * @param mode - DEVELOP or PRODUCTION
   */
  constructor(mode) {
    this.mode = mode
  }
  
  log(input) {
    switch (this.mode) {
      case 'DEVELOP':
        Logger.logDevelop(input);
        break;
      
      case 'PRODUCTION':
        this.logProduction(input);
        break;
    }
  }
  
  static logDevelop(input) {
    console.log(input);
  } 
  
  // TODO: Implement logProduction
  
  error(input) {
    switch (this.mode) {
      case 'DEVELOP':
        Logger.errorDevelop(input);
        break;
      
      case 'PRODUCTION':
        this.errorProduction(input);
        break;
    }
  }
  
  static errorDevelop(input) {
    console.error(input);
  }
  
  // TODO: Implement errorProduction
}

module.exports = Logger;