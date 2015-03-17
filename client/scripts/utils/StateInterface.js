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
				console.log("got",data);
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

AppState.prototype.pushChange = function(eventName, data){
	var pushObject = data;
		pushObject.eventName = eventName;
	this.socket.emit('pushedChange', pushObject);
}

AppState.prototype.dealWithPushed = function(data){
	console.log("got from pushed", data.eventName);
	this.emit(data.eventName, data);
}

AppState.prototype.dealWithChange = function(changeInfo){
	switch(changeInfo.action){
		case "added":
		case "changed":
			switch(changeInfo.type){
				case "array":
					return this.parseArrayChange(this._state, changeInfo.path, changeInfo.splice, changeInfo.value);
				break;
				case "string":
					return updateValueFromArray(this._state, changeInfo.path, changeInfo.property, changeInfo.value);
				break;
				case "number":
				default:
					return updateValueFromArray(this._state, changeInfo.path, changeInfo.property, changeInfo.value);
				break;
			}
		break;
		case "removed":
			return deleteValueFromArray(this._state, changeInfo.path, changeInfo.property);
		break;
	}
	return false;
}

AppState.prototype.fillState = function(data){
	this._state = data;
	if(this.dependencies){
		this.dependencies.forEach(
			(function(context){ return function(m){
				//lets traverse the path to get to the right element
				var currentRoot = context._state;
				console.log(currentRoot);
				if(m.path !== ""){
					m.path.split(".").forEach(function(p){
						if(!currentRoot[p]){
							currentRoot[p] = {};
						}
						currentRoot = currentRoot[p];
					});
				}
				switch(m.type){
					case "array":
						if(currentRoot[m.property].constructor !== Array)
							currentRoot[m.property] = [];
					break;
					case "number":
					case "int":
						if(typeof currentRoot[m.property] !== "number"){
							currentRoot[m.property] = 0;
						}
					break;
					case "str":
					case "string":
						if(typeof currentRoot[m.property] !== "string"){
							currentRoot[m.property] = "";
						}
					break;
					case "object":
						if(typeof currentRoot[m.property] !== "object"){
							currentRoot[m.property] = {};
						}
					break;
				}
			}
		}(this)));
		console.log(this._state);
	}
	//sort the dependencies by the depth of the path, add listeners on the deepest first

	this.dependencies = this.dependencies.sort(function(a,b){
		var lena,lenb;
		// sorting function, get the depth of the path
		if(a.path === ""){
			lena = -1;
		}
		else{
			lena = a.path.split(".").length;
		}
		if(b.path === ""){
			lenb = -1;
		}
		else{
			lenb = b.path.split(".").length;
		}
		if(lena == lenb){
			return 0;
		}
		return (lena > lenb) ? -1 : 1;
	});
	this._state._parent = false;
	this._state._parentProp = false;
	this.dependencies.forEach((function(context){
		return function(dep){
			//traverse to the right location and add a listener...this may be able to be done above
			var currentRoot = context._state;
			if(dep.dontWatch){
				return;
			}
			console.log("DEP",dep);
			if(dep.path !== ""){
				dep.path.split(".").forEach(function(p){
					var parent = currentRoot;
					currentRoot = currentRoot[p];
				});
			}

			currentRoot = currentRoot[dep.property];
			var fullPath
			if(!dep.path){
				fullPath = dep.property;
			}
			else{
				fullPath = dep.path + "." + dep.property;
			}
			switch(dep.type){
					case "array":
						context.addArrayObserver(currentRoot, fullPath);
					break;
					case "number":
					case "int":
					case "str":
					case "string":
						context.addPathObserver(context._state, fullPath)
					break;
					case "object":
						context.addObserver(currentRoot, fullPath);
					break;
				}

		}
	}(this)));
	console.log(this._state);
	// console.log("GOT",data);

	// this.addWatcher();
};

AppState.prototype.addArrayObserver = function(obj, fullPath){
	this.observerArray[fullPath] = new ArrayObserver(obj);
	this.observerArray[fullPath].open((function(objectBeingObserved, AS, path){
		return function(splices) {
			// respond to changes to the elements of arr.
			splices.forEach(function(splice) {
				// console.log("splice", splice);
				// console.log("new value", objectBeingObserved[splice.index]);
				// splice.index; // index position that the change occurred.
				// splice.removed; // an array of values representing the sequence of elements which were removed
				// splice.addedCount; // the number of elements which were inserted.
				var property = path.split(".").slice(-1);
				var changeObject = {uuid: AS.userId, objectId: AS.objectId, action: 'changed',
									path: path.split("."), property: property, value: objectBeingObserved[splice.index],
									type: "array", splice: splice};
				console.log("SPLICE", splice);
				AS.socket.emit('stateChange', changeObject);
			});
			
		}
	})(obj, this, fullPath));
}

AppState.prototype.addPathObserver = function(obj,fullPath){
	console.log("Adding path obs", obj, fullPath);
	this.observerArray[fullPath] = new PathObserver(obj, ((fullPath.charAt(0) == ".") ? fullPath.substr(1) : fullPath));
	this.observerArray[fullPath].open((function(objectBeingObserved, AS, path){
		return function(newValue, oldValue) {
			// respond to changes to the elements of arr.
			console.log("newValue",newValue,"oldValue",oldValue);
			var changeObject = {uuid: AS.userId, objectId: AS.objectId, action: 'changed',
								path: path.split("."), property: path.split(".").slice(-1), value: newValue, type: (typeof newValue)};
			if(typeof newValue === "string" && typeof oldValue === "string"){
				//use changes instead of entire string
				var OTChanges = getOperations(oldValue, newValue);
				console.log(OTChanges);
				changeObject.OTChanges = OTChanges;
			}
			AS.socket.emit('stateChange', changeObject);
		}
	})(obj, this, fullPath));
}

AppState.prototype.addObserver = function(obj, fullPath){
	console.log("Adding observer", obj, fullPath);
	
	this.observerArray[fullPath] = new ObjectObserver(obj);
	obsObj = this.observerArray[fullPath];
	obsObj.open(
		(function(objectBeingObserved, AS, path){
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
						console.log("Got add in",property);



						AS.socket.emit('stateChange',
								{uuid: AS.userId, objectId: AS.objectId, action: 'added',
								path: path.split("."), property: property, value: added[property], type: 'object'});


					}

					for(i = 0; i<removedKeys.length; i++) {
						property = removedKeys[property];

					console.log("Got removed in",property);

						AS.socket.emit('stateChange',
								{uuid: AS.userId, objectId: AS.objectId, action: 'removed',
								path: path.split("."), property: property, type: "object"});
					}



					for(i = 0; i<changedKeys.length; i++){
						property = changedKeys[i];
						// console.log("Changed", property, changed[property], getOldValueFn(property));
						var changeObject = {uuid: AS.userId, objectId: AS.objectId, action: 'changed',
								path: path.split("."), property: property, value: changed[property], type: (typeof changed[property])};
						if(typeof changed[property] === "string"){
							//use changes instead of entire string
							var OTChanges = getOperations(getOldValueFn(property), changed[property]);
							console.log(OTChanges);
							changeObject.OTChanges = OTChanges;
						}
						console.log("Got change in",property);
						AS.socket.emit('stateChange', changeObject);
					}


				};
			})(obj, this, fullPath));
};

function getToRoot(obj){
	var fullPath = [];
	while(obj._parent){
		fullPath.unshift(obj._parentProp);
		obj = obj._parent;
	}
	return fullPath;
}

AppState.prototype.parseArrayChange = function(obj, arr, splice, value){
	for(var i = 0; i<arr.length; i++){
		obj = obj[arr[i]];
		if(obj === undefined){
			return false;
		}
	}
	console.log("parse array change");
	console.log(obj,splice,value);
	if(splice.removed.length !== 0){
		obj.splice(splice.index);
	}
	else{
		obj.splice(splice.index, 0, value);
	}
	this.observerArray[arr.join(".")].discardChanges();
	return obj;
}


AppState.prototype.updateValueFromArray = function(change,obj,path,prop,value,transformations){

	if(change.type === "array"){

	}

	if(transformations){
		value = applyChange(obj[prop], transformations);
	}

	//set the value and discard the changes
	obj[prop] = value;

	var fullPath = path.join(".");

	if(fullPath.indexOf(".") === -1 && path.length === 1){
		//doesn't have a full stop
		fullPath = "."+fullPath;
	}

	console.log("fullpath = ",fullPath);
	// console.log("Fullpath = ",fullPath);
	// console.log(this.observerArray,arr);
	this.observerArray[fullPath].discardChanges();
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
	this.observerArray[arr.join(".")].close();
	delete this.observerArray[arr.join(".")];
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
