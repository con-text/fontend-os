var socket = new BCSocket('http://contexte.herokuapp.com/channel', {reconnect: true});
var sjs = new sharejs.Connection(socket);
sharejs.registerType(window.ottypes['rich-text']);

var doc;

function initSJS(docId, userId, editor){
	doc = sjs.get('docs', docId);
	// Subscribe to changes
	doc.subscribe();

	// This will be called when we have a live copy of the server's data.
	doc.whenReady(function () {

		// var userId = 'id-' + Math.random(10) * 1000;

		console.log('doc ready, data: ', doc);


		// Create a rich-text doc
		if (!doc.type) {
			console.log('doc has not type - trying to create a rich-text doc');
			doc.create('rich-text', '');
			console.log('created as ', doc);
		}


		// Update the doc with the recent changes
		editor.updateContents(doc.getSnapshot());

		//************ end ***************//

		editor.on('text-change', function (delta, source) {
			console.log('text-change', delta, source);
			doc.submitOp(delta);
		});

		doc.on('op', function (op, localContext) {
			if (!localContext) {
				editor.updateContents(op.ops);
			}
		});
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