(function(exports){
exports.makeArray = function(rows, columns, fill) {
    var arr = new Array(rows);
    
    for (pos of arr) {
      pos = new Array(columns);
    }
    for (var i = 0; i < arr.length; i++) {
      for (var j = 0; j < arr[i].length; j++) {
        arr[i][j] = fill;
      }
    }
    return arr;
  }
  
  exports.makeToken = function(length, taken) { // taken takes array or obj with tokens as top level keys
    var chars = "qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM0123456789";
    var token = "";
    
    for (var i = 0; i < length; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    for (let tok in taken) {
      if (taken[tok]==token || tok==token) { // to support arrays or objects, once in a blue moon this will produce unpredictable results
        token = makeToken(length, taken);
        return token; // bc the child call will varify it is correct
      }
    }
    
    return token;
  }
  
  exports.randRange = function(min, max, int = true) {
    var num = Math.random()*max + min;
    if (int)
      num = Math.floor(num);
    return num;
  }
  
  exports.CONST = {
    defaultWidth: 16,
    defaultHeight: 30,
    gameIDLength: 5
  }
  
})(typeof exports === 'undefined' ? this['tShared']={} : exports);
