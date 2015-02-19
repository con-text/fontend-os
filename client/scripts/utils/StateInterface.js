function AppState(appId, userId, dependencies){
	this.appId 	= appId;
	this.userId = userId;
	this.dependencies = dependencies;
	this.loadFullState();
	this.handlers = {};
}

AppState.prototype.addWatcher = function(){
	// console.log("ADDWATCHER CONTEXT", this);
	watch(this._state, (function(state){
		return function(d){
			console.log("found change", state);
			$.post( "/syncState/"+state.userId+"/"+state.appId, {state: JSON.stringify(state._state)} );
		};
	})(this), 4, true);
};

AppState.prototype.on = function(eventName, callback) {
	this.handlers[eventName] = callback;
};

AppState.prototype.off = function(eventName, callback) {
	delete this.handlers[eventName];
};

AppState.prototype.emit = function(eventName, data) {
	var eventHandler = this.handlers[eventName];
	if(eventHandler) {
		eventHandler(data);
	}
};



AppState.prototype.fillState = function(data){
	// console.log(this);
	// console.log(data);
	if(this.dependencies){
		this.dependencies.forEach(function(m){
			//the property name doesn't exist, lets create it
			if(!data[m.name]){
				switch(m.type.toLowerCase()){
					case "array":
						data[m.name] = [];
					break;
					case "object":
						data[m.name] = {};
					break;
					case "string":
						data[m.name] = "";
					break;
					default:
						data[m.name] = 0;
					break;
				}
			}
		});
	}
	this._state = data;
	this.addWatcher();
}

AppState.prototype.on = function(eventName, callback) {
	this.handlers[eventName] = callback;
};

AppState.prototype.off = function(eventName, callback) {
	delete this.handlers[eventName];
};

AppState.prototype.emit = function(eventName, data) {
	var eventHandler = this.handlers[eventName];
	if(eventHandler) {
		eventHandler(data);
	}

};

AppState.prototype.loadFullState = function(){
	$.getJSON("/syncState/"+this.userId+"/"+this.appId).done(
		(function(AS){
			// console.log("Got into closure",this);
			return function(data){
				console.log(data);
				if(!data)
					data = {};
				// console.log("Got",data.message.state,"in",AS);
				AS.fillState(data.message.state);
				AS.emit("load");
			};
	})(this));
};
