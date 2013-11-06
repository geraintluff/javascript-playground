Jsonary.render.register({
	renderHtml: function (data, context) {
		var result = '<div class="demo-code">';
		result += '<div class="demo-code-input">';
		result += '<div class="demo-code-html">' + context.renderHtml(data.property('html')) + '</div>';
		result += '<div class="demo-code-javascript">' + context.renderHtml(data.property('js')) + '</div>';
		result += '</div>';
		return result + '</div>';
	},
	render: function (element, data, context) {
		for (var i = 0; i < element.childNodes.length; i++) {
			if (element.childNodes[i].nodeType === 1) {
				element = element.childNodes[i];
				break;
			}
		}

		var result = document.createElement('div');
		result.className = "demo-code-result";
		if (data.get('/html')) {
			result.innerHTML = data.get('/html');
		}

		var consoleResult = document.createElement('div');
		consoleResult.className = "demo-code-console";

		var consoleWrapped = Object.create(console);
		consoleWrapped.log = function (value) {
			if (typeof value !== 'string') {
				value = JSON.stringify(value);
			}
			var logLine = document.createElement('div');
			logLine.className = "demo-code-console-line";
			logLine.innerHTML = '<span class="demo-code-console-line-mark">&gt;</span>' + Jsonary.escapeHtml(value);
			consoleResult.appendChild(logLine);
		};
		consoleWrapped.error = function (value) {
			if (typeof value !== 'string') {
				if (value.stack) {
					value = value.stack;
				} else {
					value = JSON.stringify(value);
				}
			}
			var logLine = document.createElement('div');
			logLine.className = "demo-code-console-error";
			logLine.innerHTML = '<span class="demo-code-console-line-mark">&gt;</span>' + Jsonary.escapeHtml(value);
			consoleResult.appendChild(logLine);
		};		
		var jsCode = data.get('/js');
		element.appendChild(result);
		element.appendChild(consoleResult);
		setTimeout(function () {
			try {
				var func = new Function('element', 'console', jsCode);
				func.call(result, result, consoleWrapped);
			} catch (e) {
				consoleWrapped.error(e);
			}
		}, 10);
	},
	update: function () {
		return true;
	},
	filter: {
		type: 'object',
		schema: '/schemas/demo-code'
	}
});

Jsonary.render.register({
	renderHtml: function (data, context) {
		var elementId = context.getElementId();
		return '<div class="ace-editor" id="' + elementId + '">' + Jsonary.escapeHtml(data.value()) + '</div>';
	},
	render: function (element, data, context) {
		for (var i = 0; i < element.childNodes.length; i++) {
			if (element.childNodes[i].nodeType === 1) {
				element = element.childNodes[i];
				break;
			}
		}

		var editor = ace.edit(element.id);
		editor.on('blur', function () {
			var jsCode = editor.getSession().getValue();
			data.setValue(jsCode);
		});
		var mediaType = null;
		data.schemas().any(function (index, schema) {
			mediaType = mediaType || schema.data.get('/media/type');
		});
		if (mediaType === 'application/javascript') {
			editor.getSession().setMode("ace/mode/javascript");
		} else if (mediaType === 'text/html') {
			editor.setTheme("ace/theme/github");
			editor.getSession().setMode("ace/mode/html");
		}
	},
	filter: {
		readOnly: false,
		filter: function (data, schemas) {
			return schemas.any(function (index, schema) {
				return schema.data.get('/media/type') && !schema.data.get('/media/binaryEncoding');
			});
		}
	}
});