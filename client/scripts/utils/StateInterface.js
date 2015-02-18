function AppState(appId, userId){
	this.appId 	= appId;
	this.userId = userId;
	this.loadFullState();
}

AppState.prototype.addWatcher = function(){
	// console.log("ADDWATCHER CONTEXT", this);
	watch(this._state, (function(state){
		return function(d){
			console.log("found change", state);
			$.post( "/syncState/"+state.userId+"/"+state.appId, {state: JSON.stringify(state._state)} );
		}
	})(this), 4, true);
}

AppState.prototype.fillState = function(data){
	// console.log(this);
	// console.log(data);
	this._state = data;
	this.addWatcher();
}


AppState.prototype.loadFullState = function(){
	$.getJSON("/syncState/"+this.userId+"/"+this.appId).done(
		(function(AS){
			// console.log("Got into closure",this);
			return function(data){
				if(!data.message.state)
					data.message.state = {};
				// console.log("Got",data.message.state,"in",AS);
				AS.fillState(data.message.state);
			}
	})(this));
}
