var socket = new BCSocket('http://contexte.herokuapp.com/channel', {reconnect: true});
// var socket = new BCSocket('http://localhost:3000/channel', {reconnect: true});
var sjs = new sharejs.Connection(socket);
// sharejs.registerType(window.ottypes['rich-text']);

// var share = new sharejs.Connection(socket);

var doc;

function initSJS(docId){
	console.log("INit SJS");
	doc = sjs.get('docs', docId);
	// Subscribe to changes
	doc.subscribe();

	// This will be called when we have a live copy of the server's data.
	doc.whenReady(function () {
		

		// var userId = 'id-' + Math.random(10) * 1000;

		console.log('doc ready, data: ', doc);
		if (!doc.type) {
		        doc.create('text');
		    }
		 
		    var elem = document.getElementById('pad');
		    doc.attachTextarea(elem);

	});

}



function hexToRgb(hex) {
	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result ? {
		r: parseInt(result[1], 16),
		g: parseInt(result[2], 16),
		b: parseInt(result[3], 16)
	} : null;
}