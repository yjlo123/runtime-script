var editor = ace.edit("editor");
editor.setTheme("ace/theme/chrome");
editor.session.setMode("ace/mode/runtime");
editor.session.setTabSize(1);
editor.setFontSize(15);


/* Console */
let jqconsole = $('#console').jqconsole();
jqconsole.Write('Runtime Script\n', 'console-gray');
jqconsole.SetPromptLabel('  ');

let runtime = runtimeExecuter();
let canvas = runtimeCanvas();
canvas.init($('#canvas')[0]);
let evaluator = runtimeEvaluator();
let parser = runtimeParser();

let runBtn = $("#run-btn");
let restartBtn = $("#restart-btn");
let stepBtn = $("#step-btn");
let clearBtn = $("#clear-canvas-btn");

runBtn.click(function() {runtime.executeAll()});
restartBtn.click(function() {runtime.restart()});
stepBtn.click(function() {runtime.executeStep()});
clearBtn.click(function() {canvas.clearCanvas()});

let controls = {
	run: runBtn,
	restart: restartBtn,
	stepBtn: stepBtn,
	clearBtn: clearBtn
};

runtime.config(parser, evaluator, editor, jqconsole, canvas, controls);

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
