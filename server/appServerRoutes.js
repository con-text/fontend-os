var applications = require('./apps.js');
var applicationList = applications.getApps();
var unirest = require('unirest');

var baseUrl = "http://contexte.herokuapp.com/";
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

function userExists(uuid, callback){
	unirest.get(baseUrl+"users/"+uuid)
	.end(function(result){
		console.log(result.error);
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

function fetchObject(uuid, objectId, callback){
	var url = baseUrl + "objects/" + uuid+"/"+objectId;
	console.log(url);
	unirest.get(url)
	.end(function(result){
		console.log(result.error);
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
	getApp: function(req,res){
		console.log(req.params);
		var uuid = req.params.uuid;
		var appId = req.params.appId;
		// var id = req.body.id;
		var realApp = appExists(appId);

		//TODO: Use AS to pass it to the app
		console.log(req.query);

		userExists(uuid, function(exists, result){
			if(exists){
				//not too bothered about the user info at this point
				if(realApp.found){
					res.send(applicationList[realApp.index].mainPage);
				}
				else{
					res.send("App doesn't exist");
				}

			}
			else{
				res.json({message: "User doesn't exist"});
			}
		});
	},
	syncPost: function(req,res){
		var uuid = req.params.uuid;
		var appId= req.params.appId;

		userExists(uuid, function(exists, result){
			if(exists){
				//change to https
				unirest.post("http://contexte.herokuapp.com/app/syncState/"+uuid+"/"+appId)
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
				unirest.get("http://contexte.herokuapp.com/app/syncState/"+uuid+"/"+appId)
				.end(function(result){
					if(!result.error){
						console.log("results", result.body.message.state);
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
		console.log(req.params);
		var uuid = req.params.uuid;
		var objectId = req.params.objectId;
		// var id = req.body.id;


		userExists(uuid, function(exists, result){
			if(exists){
				//not too bothered about the user info at this point
				//look up the object and get the appId
				console.log("USER EXISTS");
				fetchObject(uuid, objectId, function(exists, result){
					console.log("CHECKING IF OBJECT EXISTS");
					if(exists){
						console.log("OBJECT EXISTS", result);
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
