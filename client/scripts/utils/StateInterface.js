function AppState(appId, userId){
	this.appId 	= appId;
	this.userId = userId;
	this._state = loadFullState();
	
	console.log("INIT APP STATE", this.appId, this.userId);

	// code for adding getters and setters to state, needs work work
	// for(var key in this._state){
	// 	if(this._state.hasOwnProperty(key)){
	// 		console.log("Defining stuff on",key);
	// 		Object.defineProperty(this._state, key,
	// 			{
	// 				set: function (x) { this._state[key] = x; console.log("Setting",key,"to",x)}
	// 			});
	// 		Object.defineProperty(this._state, key,
	// 			{
	// 				get: function ()  { return this._state[key]; }
	// 			});
	// 	}
	// }
}

AppState.prototype.value = function(key, value){
	if(this._state[key] === undefined){
		//invalid key
		console.log("Invalid key",key);
		return;
	}
	if(value === undefined){
		//using the getter
		return this._state[key];
	}
	this._state[key] = value;
	this.syncState();
	return;
}


AppState.prototype.syncState = function(){
	console.log("Hit syncState",this._state);
	//for now, sync on every change. This will obviously need to be changed
	$.post( "/syncState/"+this.userId+"/"+this.appId, this._state );
}


function loadFullState(){
	var mocked = {
		something: "cool",
		somethingElse: [1,2,3,4,5]
	};
	return mocked;
}
