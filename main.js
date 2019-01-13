var editor = ace.edit("editor");
editor.setTheme("ace/theme/chrome");
editor.session.setMode("ace/mode/forth");
editor.setFontSize(15);


let env = {};
let lbl = {};
let program = [];
let pc = 0;
let sleep = 0;

let parsed = false;
let finished = false;

let keys = [];

let jqconsole = $('#console').jqconsole();
jqconsole.Write('Runtime Script\n', 'console-gray');
jqconsole.SetPromptLabel('  ');

let startPrompt = function () {
	// Start the prompt with history enabled.
	jqconsole.Prompt(true, function (input) {
		startPrompt();
	});
}
startPrompt();


/* listener */
document.getElementById("run-btn").addEventListener("click", executeAll);
document.getElementById("step-btn").addEventListener("click", executeStep);
document.getElementById("restart-btn").addEventListener("click", restart);


function initEnv() {
	env = {};
	lbl = {};
	program = [];
	pc = 0;
	sleep = 0;

	parsed = false;
	finished = false;
	
	keys = [];
	
	document.getElementById("step-btn").classList.remove("disabled");

	editor.gotoLine(0, 0);
}

function restart() {
	initEnv();
	$(document).off("keydown");
}

function finishedExecution() {
	//console.log('finished')
	$(document).off("keydown");
	finished = true;
	document.getElementById("step-btn").classList.add("disabled");
}

/* parse source code */
function parseProgram() {
	initEnv();
	let src = editor.session.getValue()
	let lines = src.split('\n');
	for (let ln in lines) {
		let l = lines[ln].trim();
		if (l === '' || l.startsWith('/')) {
			program.push([]);
			continue;
		}
	
		// label
		if (l[0] === '#') {
			lbl[l.slice(1).trim()] = ln;
		}
		
		let lineTokens = tokenizeLine(l);
		program.push(lineTokens);
	}
	
	parsed = true;
	// console.log(lbl)
	// console.log(program)
}

/* execute program */
function loopStep() {
	editor.gotoLine(pc+1, 0);
	if (pc < program.length) {
		loop();
	} else {
		finishedExecution();
	}
}

function loop() {
	evaluate(program[pc]);
	//console.log(pc+1, env)
	pc++;
	if (sleep > 0) {
		setTimeout(function () {
			sleep = 0;
			loopStep();
		}, sleep);
	} else {
		window.clearTimeout();
		loopStep();
	}
	//console.log(env)
}

function executeAll() {
	$(document).on("keydown", function (e) {
		keys.push(e.which);
		//console.log(keys)
	});

	if (!parsed) {
		parseProgram();
	}
	if (!finished) {
		if (pc < program.length) {
			loop();
		}
	}
}

function executeStep() {
	if (!parsed) {
		parseProgram();
	}
	if (!finished) {
		editor.gotoLine(pc+1, 0);
		if (pc <= program.length) {
			evaluate(program[pc]);
			pc++;
		} else {
			finishedExecution();
		}
	}
}

function tokenizeLine(line) {
	let tokens = [];
	let current = '';
	for (let i = 0; i < line.length; i++) {
		let c = line[i];
		if (c === '{') {
			if (current !== '') {
				tokens.push(current);
				current = '';
			}
			i++;
			while (i < line.length && line[i] !== '}') {
				current += line[i];
				i++;
			}
		} else if (c != ' ') {
			current += c;
		} else {
			tokens.push(current);
			current = ''
		}
	}
	if (current !== '') {
		tokens.push(current);
	}
	return tokens;
}

function arrayIndexingToEvalString(variable, arrayIdx, value) {
	let varName = variable.slice(0, arrayIdx);
	let varIndexing = variable.slice(arrayIdx);
	return 'env["' + varName + '"]' + varIndexing + (value ? ('=' + value) : '');
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
		let variable = ts[1]
		let arrayIdx = variable.indexOf('[');
		if ( arrayIdx > -1) {
			evalString = arrayIndexingToEvalString(variable, arrayIdx, expression(ts[2]));
			// TODO eval
			eval(evalString);
		} else {
			env[variable] = expression(ts[2]);
		}

	} else if (cmd === 'print') {
		let resultExp = expression(ts[1]);
		if (resultExp instanceof Array) {
			resultExp = JSON.stringify(resultExp);
		} else {
			resultExp += '';
		}
		jqconsole.Write(resultExp + '\n', 'console-default');
	} else if (cmd === 'jump') {
		// console.log('jump', ts[1], lbl[ts[1]])
		pc = lbl[ts[1]] - 1;
	} else if (cmd === 'if') {
		if (expression(ts[1]) !== 0) {
			if (ts[2] !== '_') {
				pc = lbl[ts[2]] - 1;
			}
		} else {
			if (ts[3]) {
				pc = lbl[ts[3]] - 1;
			}
		}
	} else if (cmd === 'sleep') {
		sleep = expression(ts[1]);
	} else if (cmd === 'draw') {
		let x = expression(ts[1]);
		let y = expression(ts[2]);
		let c = expression(ts[3]);
		drawPixel(x, y, c);
	} else if (cmd === 'pixel') {
		env[ts[1]] = getPixel(expression(ts[2]), expression(ts[3]))
	} else if (cmd === 'push') {
		env[ts[1]].push(expression(ts[2]))
	} else if (cmd === 'pop') {
		env[ts[2]] = env[ts[1]].pop();
	} else if (cmd === 'poll') {
		env[ts[2]] = env[ts[1]].shift();
	} else if (cmd === 'random') {
		env[ts[1]] = getRndInteger(expression(ts[2]), expression(ts[3]))
	} else {
		console.log('ignore', cmd)
	}
}

function expression(exp) {
	//console.log('in', exp)
	let varIdx = exp.indexOf('$');
	let varName = '';
	while (varIdx > -1) {
		varIdx++;
		while (varIdx < exp.length) {
			let endingChars = '+-*/%&|!<>=),' + (varName.indexOf('[')>-1?'':']');
			if (endingChars.indexOf(exp[varIdx]) === -1) {
				varName += exp[varIdx];
				varIdx++;
			} else {
				break;
			}
		}
		// console.log(varName)
		let varValue = null;
		if (varName === 'lastkey') {
			varValue = keys.length > 0 ? keys.shift() : -1;
		} else {
			let arrayIdx = varName.indexOf('[');
			if ( arrayIdx > -1) {
				evalString = arrayIndexingToEvalString(varName, arrayIdx);
				// TODO eval
				varValue = eval(evalString);
			} else {
				varValue = env[varName]
			}

			if (varValue instanceof Array) {
				varValue = JSON.stringify(varValue);
			}
		}
		exp = exp.replace('$'+varName, varValue);

		varName = '';
		varIdx = exp.indexOf('$');
		//console.log(exp);
	}
	//console.log(exp)
	
	// TODO eval
	let result = eval(exp);
	if (typeof result === "boolean") {
		return result|0;
	}
	return result;
}

function getRndInteger(min, max) {
	return Math.floor(Math.random() * (max - min) ) + min;
}


var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var width = canvas.width;
var height = canvas.height;
var widthInBlocks = 24;
var heightInBlocks = 24;
var blockSize = width / widthInBlocks;

ctx.fillStyle = "#000";
ctx.fillRect(0, 0, width, height);

let pixels = [];

function drawPixel(x, y, value) {
	//var x = offset % widthInBlocks;
	//var y = Math.floor(offset / widthInBlocks);
	pixels[widthInBlocks*x+y] = value;
	var color = value ? 'white' : 'black';
	ctx.fillStyle = color;

	ctx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
}

function getPixel(x, y) {
	return pixels[widthInBlocks*x+y] | 0;
}
