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


/* UI */
let runBtn = $("#run-btn");
let restartBtn = $("#restart-btn");
let stepBtn = $("#step-btn");
let clearBtn = $("#clear-canvas-btn");
let runInput = $("#run-input-btn");

runBtn.click(function() {runtime.executeAll();});
restartBtn.click(function() {runtime.restart();});
stepBtn.click(function() {runtime.executeStep();});
clearBtn.click(function() {canvas.clearCanvas();});
runInput.click(function() {runtime.inputAndExecute();});

let controls = {
	run: runBtn,
	restart: restartBtn,
	stepBtn: stepBtn,
	clearBtn: clearBtn
};

runtime.config(parser, evaluator, editor, jqconsole, canvas, controls);

/* Breakpoints */
editor.on("guttermousedown", function(e){
    var target = e.domEvent.target;

    if (target.className.indexOf("ace_gutter-cell") == -1){ return; }
    if (!editor.isFocused()){ return; }
    if (e.clientX > 25 + target.getBoundingClientRect().left){ return; }

	var breakpoints = e.editor.session.getBreakpoints();
	var row = e.getDocumentPosition().row;

	if(typeof breakpoints[row] === typeof undefined){
		e.editor.session.setBreakpoint(row);
	}else{
		e.editor.session.clearBreakpoint(row);
	}

	let breakpointIdx = [];
	for (let i = 0; i < breakpoints.length; i++) {
		if (breakpoints[i] !== undefined) {
			breakpointIdx.push(i);
		}
	}

	runtime.setBreakpoints(breakpointIdx);

	e.stop();
})

let startPrompt = function () {
	// Start the prompt with history enabled.
	jqconsole.Prompt(true, function (input) {
		switch (input) {
			case 'clear':
				jqconsole.Reset();
				break;
			case 'env':
				jqconsole.Write(`${JSON.stringify(runtime.getEnv(), null, 2)}\n`, 'console-default');
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
