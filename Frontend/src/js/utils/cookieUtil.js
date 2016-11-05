'use strict';
// Create cookie
function createCookie(name, value, hours) {
  var expires;
  if (hours) {
    var date = new Date();
    date.setTime(date.getTime()+(hours*60*60*1000));
    expires = "; expires="+date.toGMTString();
  }
  else {
    expires = "";
  }
  document.cookie = name+"="+JSON.stringify(value)+expires+"; path=/";
}

// Read cookie
function readCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(';');
  for(var i=0;i < ca.length;i++) {
    var c = ca[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1,c.length);
    }
    if (c.indexOf(nameEQ) === 0) {
      try {
        return JSON.parse(c.substring(nameEQ.length, c.length));
      }
      catch(err){
        return c.substring(nameEQ.length,c.length);
      }
    }
  }
  return null;
}

// Erase cookie
function eraseCookie(name) {
  createCookie(name,"",-1);
}
