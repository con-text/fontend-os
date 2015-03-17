var applications = require('./apps.js');
var applicationList = applications.getApps();
var unirest = require('unirest');

var config = require('../config/config');

var baseUrl = config.baseApiUrl;

// var baseUrl = "http://localhost:3000/";

var appExists = function(id){
	var found = false;
	var index = -1;
	applicationList.forEach(function(m,idx){
		if(m.id == id){
			found = true;
			index = idx;
			return;
		}
	});
	return {found:found, index: index};
};

var constructDependencies = function(dependencies){
	var currentState = {};
	dependencies.forEach(function(dep){
		//lets traverse the path to get to the right element
		var currentRoot = currentState;
		// console.log(currentRoot,dep);
		if(dep.path !== ""){
			dep.path.split(".").forEach(function(p){
				if(!currentRoot[p]){
					currentRoot[p] = {};
				}
				currentRoot = currentRoot[p];
			});
		}
		switch(dep.type){
			case "array":
				if(!currentRoot[dep.property] || currentRoot[dep.property].constructor !== Array)
					currentRoot[dep.property] = [];
			break;
			case "number":
			case "int":
				if(typeof currentRoot[dep.property] !== "number"){
					currentRoot[dep.property] = 0;
				}
			break;
			case "str":
			case "string":
				if(typeof currentRoot[dep.property] !== "string"){
					currentRoot[dep.property] = "";
				}
			break;
			case "object":
				if(typeof currentRoot[dep.property] !== "object"){
					currentRoot[dep.property] = {};
				}
			break;
		}
	});
	console.log(currentState);
	return currentState;

}

var mapIdToIndex = function(list){
	var map = {};
	list.forEach(function(item){
		map[item.id] = item;
		if(item.dependencies){
			map[item.id].dependencies = constructDependencies(item.dependencies);
		}
	});
	return map;
}
var applicationMap  = mapIdToIndex(applicationList);

function userExists(uuid, callback){
	unirest.get(baseUrl+"/users/"+uuid)
	.end(function(result){

		if(result.statusType !== 2){
			//user probably doesn't exist, can change this depending on header
			callback(false, result.error);
		}
		else{
			//not too bothered about the user info at this point
			callback(true, result.body.message);
		}
	});
}


function getState(uuid, appId, objectId, callback){
	unirest
	.get(baseUrl+"/users/"+uuid+"/apps/"+appId+"/states/"+objectId)
	.end(function(response){

		if(response.error){
			//user probably doesn't exist, can change this depending on header
			callback(response.error);
			return;
		}

		callback(null, response.body);
	});
}

/**
* Create a new state object or get a very first state of the app
*
* {uuid} - User id
* {appId} - App id
* {callback}
*/
function getOrCreateObject(uuid, appId, callback) {
	unirest.get(baseUrl + '/users/' + uuid + '/apps/' + appId)
	.end(function(response) {

		var states = response.body;

		// If exists, get first state
		if(states && states.length > 0) {
			callback && callback(null, states[0]._id);
		} else {

			// We need to create a state
			unirest.post(baseUrl + '/users/' + uuid + '/apps/' + appId)
			.header('Accept', 'application/json')
			.send({"state": JSON.stringify(applicationMap[appId].dependencies)})
			.end(function(response) {

				if(response.error) {
					callback && callback(response.error);
					return;
				}

				var newState = response.body;
				callback && callback(null, newState._id);
			});
		}
	});
}

/**
* Create a new state object
* {uuid} - User id
* {appId} - App id
* {callback}
*/
function createObject(uuid, appId, callback) {
	// We need to create a state
	unirest.post(baseUrl + '/users/' + uuid + '/apps/' + appId)
	.header('Accept', 'application/json')
	.send({"state": JSON.stringify(applicationMap[appId].dependencies)})
	.end(function(response) {

		if(response.error) {
			callback && callback(response.error);
			return;
		}

		var newState = response.body;
		callback && callback(null, newState._id);
	});
}

function fetchObject(uuid, objectId, callback){
	var url = baseUrl + "/objects/" + uuid+"/"+objectId;

	unirest.get(url)
	.end(function(result){

		if(result.statusType !== 2){
			//user probably doesn't exist, can change this depending on header
			callback(false, result.error);
		}
		else{
			//not too bothered about the user info at this point
			callback(true, result.body.message);
		}
	});
}

module.exports = {
	root: function (req, res) {
		var appIds = [];
		applicationList.forEach(function(m){
			appIds.push(m.id);
		});
	  res.json(appIds);
	},

	createState: function(req, res) {
		createObject(req.params.uuid, req.params.appId, function(err, stateId){
			if(err) {
				return res.status(500).send("Couldn't get new state, wat111");
			}

			res.json({stateId: stateId});
		});
	},

	getDefaultState: function(req, res) {
		getOrCreateObject(req.params.uuid, req.params.appId, function(err, stateId){
			if(err) {
				return res.status(500).send("Couldn't get new state, wat111");
			}

			res.json({stateId: stateId});
		});
	},

	getApp: function(req,res){

		var uuid = req.params.uuid;
		var appId = req.params.appId;

		var realApp = appExists(appId);

		// Create object or get default (first)
		getOrCreateObject(uuid, appId, function(err, objectId) {

			if(err) {
				res.status(404).json(err);
				return;
			}

			getState(uuid, appId, objectId, function(err, state){

				if(err){
					res.status(404).json(err);
					return;
				}

				//not too bothered about the user info at this point
				if(realApp.found){

					res.send(applicationList[realApp.index].displayApp(uuid, objectId, req.query));
				}
				else{
					res.status(404).json({message: "App doesn't exist"});
				}

			});
		});
	},

	getAppWithObject: function(req,res){

		var uuid = req.params.uuid;
		var appId = req.params.appId;
		var objectId = req.params.objectId;
		var realApp = appExists(appId);

		getState(uuid, appId, objectId, function(err, state){

			if(err) {
				res.status(404).send({message: "User doesn't exist"});
				return;
			}

			//not too bothered about the user info at this point
			if(realApp.found){
				res.send(applicationList[realApp.index].displayApp(uuid, objectId, req.query));
			}
			else{
				console.log("State doesn't exist");
				res.json({message: "State doesn't exist"});
			}

		});
	},


	syncPost: function(req,res){
		var uuid = req.params.uuid;
		var appId= req.params.appId;

		userExists(uuid, function(exists, result){
			if(exists){
				//change to https
				unirest.post(baseUrl + "/app/syncState/"+uuid+"/"+appId)
				.header('Accept', 'application/json')
				.send(req.body)
				.end(function(response){
					res.json({message:"Sending update"});
				});
			}
			else{
				res.json({message: "User doesn't exist"});
			}
		});
	},
	syncGet: function(req,res){
		var uuid = req.params.uuid;
		var appId= req.params.appId;
		console.log("entering statesync fetch method");
		userExists(uuid, function(exists,result){
			if(exists){
				//get the values, change to https soon
				unirest.get(baseUrl + "app/syncState/"+uuid+"/"+appId)
				.end(function(result){
					if(!result.error){
						res.json(result.body.message.state);
					}
					else{
						res.json({"message": "error "+err});
					}
				});
			}
			else{
				res.json({message: "User doesn't exist"});
			}
		});
	},
	getObject: function(req,res){
		var uuid = req.params.uuid;
		var objectId = req.params.objectId;

		userExists(uuid, function(exists, result){
			if(exists){

				//not too bothered about the user info at this point
				//look up the object and get the appId

				fetchObject(uuid, objectId, function(exists, result){
					if(exists){
						var realApp = appExists(result.appId);
						if(realApp.found){
							res.send(applicationList[realApp.index].displayApp(uuid, objectId));
						}
						else{
							res.send("App doesn't exist");
						}
					}
					else{
						res.send("Object doesn't exist");
					}

				});
			}
			else{
				res.json({message: "User doesn't exist"});
			}
		});
	}
};
