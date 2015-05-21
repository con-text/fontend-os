window.fakeStorage = {
  _data: {},

  setItem: function (id, val) {
    // console.log("setting item");
    return AS._state[id] = String(val);
    // return this._data[id] = String(val);
  },

  getItem: function (id) {
    // console.log("Getting item", AS._state[id]);
    return AS._state[id];
    // return this._data.hasOwnProperty(id) ? this._data[id] : undefined;
  },

  removeItem: function (id) {
    return delete this._data[id];
  },

  clear: function () {
    return this._data = {};
  }
};

// window.fakeStorage = {
//   _data: AS._state,
//   setItem: function(id,val){

//   }
//   init: function(){
//     this.setItem = function (id, val) {
//       return this._data[id] = String(val);
//     };

//     this.getItem = function (id) {
//       return this._data.hasOwnProperty(id) ? this._data[id] : undefined;
//     };

//     this.removeItem = function (id) {
//       return delete this._data[id];
//     };

//     this.clear = function () {
//       return this._data = {};
//     }
//   }.bind(window.fakeStorage)

// };


function LocalStorageManager() {
  this.bestScoreKey     = "bestScore";
  this.gameStateKey     = "gameState";

  //force use of fakeStorage, which I'm shoehorning AS into 
  var supported = false;


  this.storage = supported ? window.localStorage : window.fakeStorage;

}

LocalStorageManager.prototype.localStorageSupported = function () {
  var testKey = "test";
  var storage = window.localStorage;

  try {
    storage.setItem(testKey, "1");
    storage.removeItem(testKey);
    return true;
  } catch (error) {
    return false;
  }
};

// Best score getters/setters
LocalStorageManager.prototype.getBestScore = function () {
  return this.storage.getItem(this.bestScoreKey) || 0;
};

LocalStorageManager.prototype.setBestScore = function (score) {
  this.storage.setItem(this.bestScoreKey, score);
};

// Game state getters/setters and clearing
LocalStorageManager.prototype.getGameState = function () {
  var stateJSON = this.storage.getItem(this.gameStateKey);
  return stateJSON ? JSON.parse(stateJSON) : null;
};

LocalStorageManager.prototype.setGameState = function (gameState) {
  this.storage.setItem(this.gameStateKey, JSON.stringify(gameState));
};

LocalStorageManager.prototype.clearGameState = function () {
  this.storage.removeItem(this.gameStateKey);
};
