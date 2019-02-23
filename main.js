var editor = ace.edit("editor");
editor.setTheme("ace/theme/chrome");
editor.session.setMode("ace/mode/runtime");
editor.setFontSize(15);


let env = {};
let lbl = {};

let program = null;
let pc = 0;

let running = false;
let finished = false;

let keys = [];

let evaluate = runtimeEvaluator.evaluate;

/* Console */

let jqconsole = $('#console').jqconsole();
jqconsole.Write('Runtime Script\n', 'console-gray');
jqconsole.SetPromptLabel('  ');

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
document.getElementById("run-btn").addEventListener("click", executeAll);
document.getElementById("step-btn").addEventListener("click", executeStep);
document.getElementById("restart-btn").addEventListener("click", restart);
document.getElementById("clear-canvas-btn").addEventListener("click", runtimeCanvas.clearCanvas);

function initEnv() {
	env = {
		_sleep: 0,
		_console: jqconsole,
		_random: getRandomInteger
	};
	lbl = {};
	program = null;
	pc = 0;

	running = false;
	finished = false;
	
	keys = [];
	
	document.getElementById("step-btn").classList.remove("disabled");
}

function restart() {
	initEnv();
	window.clearTimeout();
	$(document).off("keydown");
	document.getElementById("run-btn").classList.remove("disabled");
}

function finishedExecution() {
	$(document).off("keydown");
	running = false;
	finished = true;
	document.getElementById("step-btn").classList.add("disabled");
	document.getElementById("run-btn").classList.remove("disabled");
}

/* execute program */
function loop() {
	evaluate(program[pc], env, lbl);
	//console.log(pc+1, env)
	pc++;
	if (env._sleep > 0) {
		return setTimeout(function () {
			env._sleep = 0;
			if (pc < program.length) {
				return loop();
			}
		}, env._sleep);
	} else {
		window.clearTimeout();
		if (pc < program.length) {
			return loop();
		}
	}
	finishedExecution();
}

function executeAll() {
	if (running) {
		return;
	}
	document.getElementById("run-btn").classList.add("disabled");
	$(document).on("keydown", function (e) {
		keys.push(e.which);
	});

	parseSrc(editor.session.getValue())

	if (!finished) {
		running = true;
		if (pc < program.length) {
			loop();
		}
	}
}

function executeStep() {
	if (program === null) {
		parseSrc(editor.session.getValue())
	}
	if (finished) {
		return;
	}
	editor.gotoLine(pc+1, 0);
	if (pc <= program.length) {
		evaluate(program[pc], env, lbl);
		pc++;
	} else {
		finishedExecution();
	}
}

function parseSrc(src) {
	initEnv();
	parsed = runtimeParser.parse(src);
	program = parsed.program;
	lbl = parsed.labels;
}

function getRandomInteger(min, max) {
	return Math.floor(Math.random() * (max - min) ) + min;
}
