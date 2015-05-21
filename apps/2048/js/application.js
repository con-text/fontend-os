// Wait till the browser is ready to render the game (avoids glitches)

var frameReady = false;
var stateReady = false;

window.requestAnimationFrame(function () {
	frameReady = true;
	checkBothReady();
});

AS.on("load", function(){
	stateReady = true;
	checkBothReady();
});

function checkBothReady(){
	console.log("Checking ready", stateReady, frameReady);
	if(frameReady && stateReady){
		new GameManager(4, KeyboardInputManager, HTMLActuator, LocalStorageManager);
	}
}