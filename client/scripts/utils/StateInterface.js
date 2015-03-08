var events = require('events');

function AppState(appId, userId, objectId, dependencies){

	this.appId 	= appId;
	this.userId = userId;
	this.objectId = objectId;
	this.dependencies = dependencies;
	this.handlers = {};
	this.eventEmitter = new events.EventEmitter();
	this.socket = io('http://localhost:3001');
	this.observerArray = {};


	this.socket.on('fillData', (function(AS){
			// console.log("Got into closure",this);
			return function(data){
				console.log(data);
				if(!data)
					data = {};
				// console.log("Got",data,"in",AS);
				AS.fillState(data);
				AS.emit("load");
			};
	})(this));


	this.socket.on('connect', (function(AS){
			// console.log("Got into closure",this);
			return function(){
				// console.log("Connected to socket", AS);
				AS.socket.emit('getInitial', {uuid: AS.userId, objectId: AS.objectId});
			};
	})(this));


	this.socket.on('syncedState', (function(AS){
			// console.log("Got into closure",this);
			return function(data){
				// console.log("Got", data);

				AS.dealWithChange(data);
				AS.emit('syncedState', data);
			};
	})(this));
	// this.socket.on('disconnect', function(){});
}

AppState.prototype.addWatcher = function(){
	this.watchDeepObject(this._state);
};

AppState.prototype.on = function(eventName, callback) {
	this.eventEmitter.on(eventName, callback);
};

AppState.prototype.off = function(eventName, callback) {
	this.eventEmitter.removeListener(eventName, callback);
};

AppState.prototype.emit = function(eventName, data) {
	this.eventEmitter.emit(eventName, data);
};


AppState.prototype.dealWithChange = function(changeInfo){
	switch(changeInfo.action){
		case "added":
		case "changed":
			this.updateValueFromArray(this._state, changeInfo.path, changeInfo.property, changeInfo.value, changeInfo.OT);
		break;
		case "removed":
			this.deleteValueFromArray(this._state, changeInfo.path, changeInfo.property);
		break;
	}
};

AppState.prototype.fillState = function(data){
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
	// console.log("GOT",data);
	this._state = data;
	this._state._parent = false;
	this._state._parentProp = false;
	this.addWatcher();
};

AppState.prototype.addObserver = function(obj){
	// console.log("Adding observer", obj);
	var obsObj;
	if(!this.observerArray.root){
		//first time setting an observer
		this.observerArray.root = new ObjectObserver(obj);
		obsObj = this.observerArray.root;
	}
	else{
		var fullPath = getToRoot(obj).join("_");
		this.observerArray[fullPath] = new ObjectObserver(obj);
		obsObj = this.observerArray[fullPath];
	}
	obsObj.open(
		(function(objectBeingObserved, AS){
			return function handleChanges(added, removed, changed, getOldValueFn) {


					var changedKeys = Object.keys(changed);
					var addedKeys = Object.keys(added);
					var removedKeys = Object.keys(removed);
					var property;
					var toClosePath;

					var i;
					for(i = 0; i < addedKeys.length; i++) {

						property = addedKeys[i];
						//new property added, check if it's an object, if so, add a listener

						if(typeof added[property] === "object"){
							// give it parent and parentprop values then add the observer
							//this is used to traverse the tree upwards
							added[property]._parent = objectBeingObserved;
							added[property]._parentProp = property;
							AS.addObserver(added[property]);
						}

						AS.socket.emit('stateChange',
								{uuid: AS.userId, objectId: AS.objectId, action: 'added',
								path: getToRoot(objectBeingObserved), property: property, value: added[property]});


					}

					for(i = 0; i<removedKeys.length; i++) {
						property = removedKeys[property];


						if(typeof getOldValueFn(property) === "object"){

							toClosePath = getToRoot(objectBeingObserved).join("_");
							AS.observerArray[toClosePath].close();
							delete AS.observerArray[toClosePath];
						}

						AS.socket.emit('stateChange',
								{uuid: AS.userId, objectId: AS.objectId, action: 'removed',
								path: getToRoot(objectBeingObserved), property: property});
					}



					for(i = 0; i<changedKeys.length; i++){
						property = changedKeys[i];
						// console.log("Changed", property, changed[property], getOldValueFn(property));
						if(typeof changed[property] !== getOldValueFn(property)){
							//type has changed, check for new object
							if(typeof changed[property] === "object"){
								changed[property]._parent = objectBeingObserved;
								changed[property]._parentProp = property;
								AS.addObserver(changed[property]);
							}
							else if(typeof getOldValueFn(property) === "object"){
								console.log("Closing observer");
								toClosePath = getToRoot(objectBeingObserved).join("_");
								AS.observerArray[toClosePath].close();
								delete AS.observerArray[toClosePath];
							}
						}
						var changeObject = {uuid: AS.userId, objectId: AS.objectId, action: 'changed',
								path: getToRoot(objectBeingObserved), property: property, value: changed[property]};
						if(typeof changed[property] === "string"){
							//use changes instead of entire string
							var OTChanges = getOperations(getOldValueFn(property), changed[property]);
							console.log(OTChanges);
							changeObject.OTChanges = OTChanges;
						}
						AS.socket.emit('stateChange', changeObject);
					}


				};
			})(obj, this));
};

function getToRoot(obj){
	var fullPath = [];
	while(obj._parent){
		fullPath.unshift(obj._parentProp);
		obj = obj._parent;
	}
	return fullPath;
}

AppState.prototype.watchDeepObject = function(obj){

	this.addObserver(obj);

	var keys = Object.keys(obj);
	var key;
	for(var i = 0; i<keys.length; i++){
		key = keys[i];
		if(key === "_parentProp" || key === "_parent"){
			return;
		}
		if(typeof obj[key] === "object" && obj.constructor !== Array){
			obj[key]._parentProp = key;
			obj[key]._parent = obj;
			this.watchDeepObject(obj[key]);
			// console.log("parent",obj,"key",key);
		}
	}
};

AppState.prototype.updateValueFromArray = function(obj,arr,prop,value,transformations){
	//loop through until we're at the right object
	for(var i = 0; i<arr.length; i++){
		obj = obj[arr[i]];
		if(obj === undefined){
			return false;
		}
	}

	if(transformations){
		value = applyChange(obj[prop], transformations);
	}
	
	//set the value and discard the changes
	obj[prop] = value;

	if(typeof value === "object"){
		value._parent = obj;
		value._parentProp = prop;
		this.addObserver(value);
	}
	// console.log(this.observerArray,arr);
	this.observerArray[arr.join("_")].discardChanges();
	return true;
};

AppState.prototype.deleteValueFromArray = function(obj,arr,prop){
	for(var i = 0; i<arr.length; i++){
		obj = obj[arr[i]];
		if(obj === undefined){
			return false;
		}
	}
	//set the value and discard the changes
	//there may be observers within this part, deal with this later
	this.observerArray[arr.join("_")].close();
	delete this.observerArray[arr.join("_")];
	delete obj[prop];
	return true;
};

function getOperations(startText, endText, id){

	console.log("SE", "'"+startText+"'", "'"+endText+"'", id);
	var diff 		= dmp.diff_main(startText, endText);
	var actions = [];
	var cursor = 0;
	diff.forEach(function(change){
		if(change[0] === 0){
			//no change here
			cursor += change[1].length;
		}
		else if(change[0] === 1){
			//insertion
			actions.push({cursor: cursor, action: 1, text: change[1]});
			cursor += change[1].length;
		}
		else if(change[0] === -1){
			//deletion
			actions.push({cursor: cursor, action: -1, text: change[1]});
		}
		else{
			console.log("Invalid change param");
		}
	});

	return actions;
}

function applyChange(startText, changes){
	var text = startText;
	changes.forEach(function(change){
		console.log("Applying","'"+change.text+"'", "to",text, change.cursor);
		if(change.action === 1){
			text = new ot.TextOperation().retain(change.cursor).insert(change.text).retain(text.length - change.cursor).apply(text);
		}
		else if(change.action === -1){
			text = new ot.TextOperation().retain(change.cursor).delete(change.text).retain(text.length - change.text.length - change.cursor).apply(text);
		}
	});
	return text;
}

module.exports = AppState;
