var applications = require('./apps.js');
var applicationList = applications.getApps();
var unirest = require('unirest');

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
	unirest.get("https://contexte.herokuapp.com/users/"+uuid)
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
		// console.log(req.params);
		// console.log(req.body);
		var uuid = req.params.uuid;
		var appId= req.params.appId;
		console.log("entering state sync post method", req.body);
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
	}
}