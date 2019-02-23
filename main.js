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
		_sleep: 0
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
	//console.log('finished')
	$(document).off("keydown");
	running = false;
	finished = true;
	document.getElementById("step-btn").classList.add("disabled");
	document.getElementById("run-btn").classList.remove("disabled");
}

/* execute program */
function loop() {
	evaluate(program[pc]);
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
	//console.log(env)
}

function executeAll() {
	if (running) {
		return;
	}
	document.getElementById("run-btn").classList.add("disabled");
	$(document).on("keydown", function (e) {
		keys.push(e.which);
		//console.log(keys)
	});

	initEnv();
	let src = editor.session.getValue()
	program = runtimeParser.parse(src);

	if (!finished) {
		running = true;
		if (pc < program.length) {
			loop();
		}
	}
}

function executeStep() {
	if (program === null) {
		initEnv();
		let src = editor.session.getValue()
		program = runtimeParser.parse(src);
	}
	if (finished) {
		return;
	}
	editor.gotoLine(pc+1, 0);
	if (pc <= program.length) {
		evaluate(program[pc]);
		pc++;
	} else {
		finishedExecution();
	}
}

function evaluate(ts) {
	if (ts.length === 0) {
		return;
	}
	if (ts[0][0] === '#') {
		return;
	}
	
	let cmd = ts[0];
	if (cmd === 'let') {
		env[ts[1]] = expr(ts[2]);

	} else if (cmd === 'prt') {
		let resultExp = expr(ts[1]);
		if (resultExp instanceof Array) {
			resultExp = JSON.stringify(resultExp);
		} else {
			resultExp += '';
		}
		jqconsole.Write(resultExp + '\n', 'console-default');
	} else if (cmd === 'jmp') {
		// console.log('jump', ts[1], lbl[ts[1]])
		pc = lbl[ts[1]] - 1;
	} else if (cmd === 'jeq') {
		// equal
		if (expr(ts[1]) == expr(ts[2])) {
			pc = lbl[ts[3]] - 1;
		}
	} else if (cmd === 'jne') {
		// not equal
		if (expr(ts[1]) != expr(ts[2])) {
			pc = lbl[ts[3]] - 1;
		}
	} else if (cmd === 'jlt') {
		// less than
		if (expr(ts[1]) < expr(ts[2])) {
			pc = lbl[ts[3]] - 1;
		}
	} else if (cmd === 'jgt') {
		// greater than
		if (expr(ts[1]) > expr(ts[2])) {
			pc = lbl[ts[3]] - 1;
		}
	}else if (cmd === 'add') {
		env[ts[1]] = expr(ts[2]) + expr(ts[3]);
	} else if (cmd === 'sub') {
		env[ts[1]] = expr(ts[2]) - expr(ts[3]);
	} else if (cmd === 'mul') {
		env[ts[1]] = expr(ts[2]) * expr(ts[3]);
	} else if (cmd === 'mod') {
		env[ts[1]] = expr(ts[2]) % expr(ts[3]);
	} else if (cmd === 'div') {
		env[ts[1]] = Math.floor(expr(ts[2]) / expr(ts[3]));
	} else if (cmd === 'slp') {
		env._sleep = expr(ts[1]);
	} else if (cmd === 'drw') {
		// draw pixel
		let x = expr(ts[1]);
		let y = expr(ts[2]);
		let c = expr(ts[3]);
		runtimeCanvas.drawPixel(x, y, c);
	} else if (cmd === 'drt') {
		// draw text
		let x = expr(ts[1]);
		let y = expr(ts[2]);
		let t = expr(ts[3]);
		let s = expr(ts[4]);
		let c = expr(ts[5]);
		runtimeCanvas.drawText(x, y, t, s, c);
	} else if (cmd === 'pxl') {
		env[ts[1]] = runtimeCanvas.getPixel(expr(ts[2]), expr(ts[3]))
	} else if (cmd === 'clr') {
		runtimeCanvas.clearCanvas();
	} else if (cmd === 'psh') {
		let lstVar = ts[1].slice(1);
		let lstVal = env[lstVar];
		if (typeof lstVal === 'string') {
			// string
			env[lstVar] = lstVal + expr(ts[2]);
		} else {
			// array
			lstVal.push(expr(ts[2]));
		}
	} else if (cmd === 'pop') {
		let lstVar = ts[1].slice(1);
		let lstVal = env[lstVar];
		if (typeof lstVal === 'string') {
			// string
			env[ts[2]] = lstVal.slice(-1);
			env[lstVar] = lstVal.substring(0, lstVal.length-1);
		} else {
			// array
			env[ts[2]] = lstVal.pop();
		}
	} else if (cmd === 'pol') {
		let lstVar = ts[1].slice(1);
		let lstVal = env[lstVar];
		if (typeof lstVal === 'string') {
			// string
			env[ts[2]] = lstVal.slice(-1);
			env[lstVar] = lstVal.substring(1, lstVal.length);
		} else {
			// array
			env[ts[2]] = lstVal.shift();
		}
	} else if (cmd === 'put') {
		let lstVar = ts[1];
		env[lstVar.slice(1)][expr(ts[2])] = expr(ts[3]);
	} else if (cmd === 'get') {
		let lstVar = ts[1];
		env[ts[3]] = env[lstVar.slice(1)][expr(ts[2])];
	} else if (cmd === 'rnd') {
		env[ts[1]] = getRndInteger(expr(ts[2]), expr(ts[3]))
	} else {
		console.log('ignore', cmd)
	}
}

function expr(exp) {
	if (exp[0] === '$') {
		// var
		let varName = exp.slice(1)
		if (varName === 'lastkey') {
			result = keys.length > 0 ? keys.shift() : -1;
		} else {
			value = env[varName];
			if (value[0] === '\'' && value[value.length-1] === '\'') {
				result = value.slice(1, -1);
			} else {
				result = value
			}
		}
	} else if (exp === '[]') {
		// array
		result = [];
	} else if (exp === '{}') {
		// hash table
		result = {};
	} else {
		if (exp[0] === '\'' && exp[exp.length-1] === '\'') {
			// string
			result = exp.slice(1, -1);
		} else {
			if (!isNaN(parseInt(exp)) && exp <= Number.MAX_SAFE_INTEGER) {
				// integer
				result = parseInt(exp)
			} else {
				result = exp;
			}
		}
	}

	if (typeof result === "boolean") {
		return result|0;
	}
	return result;
}

function getRndInteger(min, max) {
	return Math.floor(Math.random() * (max - min) ) + min;
}
