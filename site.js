var jsonaryBundle = require('jsonary')
	.add('renderers/demo-code')
	.add('jsonary.undo')
	.writeJs('public/bundle.js')
	.writeCss('public/bundle.css');

var express = require('express'),
	app = express();

app.use('/schemas', function (request, response, next) {
	response.setHeader('Content-Type', 'application/json');
	next();
});
app.use('/schemas', express.static('schemas'));

app.use('/', express.static('public/'));

app.listen(8081);