var editor = ace.edit("editor");
editor.setTheme("ace/theme/chrome");
editor.session.setMode("ace/mode/runtime");
editor.setFontSize(15);


/* Console */
let jqconsole = $('#console').jqconsole();
jqconsole.Write('Runtime Script\n', 'console-gray');
jqconsole.SetPromptLabel('  ');

let runtime = runtimeExecuter;
runtime.config(runtimeParser, runtimeEvaluator, jqconsole, runtimeCanvas)

let startPrompt = function () {
	// Start the prompt with history enabled.
	jqconsole.Prompt(true, function (input) {
		switch (input) {
			case 'clear':
			jqconsole.Reset();
			break;
		}
		startPrompt();
	});
}
startPrompt();

/* Load Code */
function getCodeUrl(codeId) {
	return 'https://raw.githubusercontent.com/yjlo123/runtime-script/master/examples/' + codeId + '.runtime';
}

function getURLParameter(sParam) {
	var sPageURL = window.location.search.substring(1);
	var sURLVariables = sPageURL.split('&');
	for (var i = 0; i < sURLVariables.length; i++) 
	{
		var sParameterName = sURLVariables[i].split('=');
		if (sParameterName[0] == sParam) 
		{
			return sParameterName[1];
		}
	}
}

function getCode(codeId) {
	$.ajax(getCodeUrl(codeId))
	.done(function(code) {
		editor.setValue(code);
		editor.gotoLine(0);
	})
	.fail(function() {
		jqconsole.Write('Loading source failed.\n', 'console-error');
	})
	.always(function() {
		console.log('Load source code finished.')
	});
}

let codeId = getURLParameter('src');
if (codeId) {
	getCode(codeId);
}


/* listener */
document.getElementById("run-btn").addEventListener("click", runtime.executeAll);
document.getElementById("step-btn").addEventListener("click", runtime.executeStep);
document.getElementById("restart-btn").addEventListener("click", runtime.restart);
document.getElementById("clear-canvas-btn").addEventListener("click", runtimeCanvas.clearCanvas);
