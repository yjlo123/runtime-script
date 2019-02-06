var editor = ace.edit("editor");
editor.setTheme("ace/theme/chrome");
editor.session.setMode("ace/mode/runtime");
editor.setFontSize(15);


let env = {};
let lbl = {};
let program = [];
let pc = 0;
let sleep = 0;

let parsed = false;
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
document.getElementById("clear-canvas-btn").addEventListener("click", clearCanvas);

function initEnv() {
	env = {};
	lbl = {};
	program = [];
	pc = 0;
	sleep = 0;

	parsed = false;
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
function loop() {
	evaluate(program[pc]);
	//console.log(pc+1, env)
	pc++;
	if (sleep > 0) {
		return setTimeout(function () {
			sleep = 0;
			if (pc < program.length) {
				return loop();
			}
		}, sleep);
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

	parseProgram();

	if (!finished) {
		running = true;
		if (pc < program.length) {
			loop();
		}
	}
}

function executeStep() {
	if (!parsed) {
		parseProgram();
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

function tokenizeLine(line) {
	let tokens = [];
	let current = '';
	for (let i = 0; i < line.length; i++) {
		let c = line[i];
		if (c === '\'') {
			if (current !== '') {
				tokens.push(current);
				current = '';
			}
			current += line[i];
			i++;
			while (i < line.length && line[i] !== '\'') {
				current += line[i];
				i++;
			}
			current += line[i];
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
		if (expr(ts[1]) === expr(ts[2])) {
			pc = lbl[ts[3]] - 1;
		}
	} else if (cmd === 'jne') {
		// not equal
		if (expr(ts[1]) !== expr(ts[2])) {
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
	} else if (cmd === 'slp') {
		sleep = expr(ts[1]);
	} else if (cmd === 'drw') {
		let x = expr(ts[1]);
		let y = expr(ts[2]);
		let c = expr(ts[3]);
		drawPixel(x, y, c);
	} else if (cmd === 'pxl') {
		env[ts[1]] = getPixel(expr(ts[2]), expr(ts[3]))
	} else if (cmd === 'psh') {
		env[ts[1]].push(expr(ts[2]))
	} else if (cmd === 'pop') {
		env[ts[2]] = env[ts[1]].pop();
	} else if (cmd === 'pol') {
		env[ts[2]] = env[ts[1]].shift();
	} else if (cmd === 'rnd') {
		env[ts[1]] = getRndInteger(expr(ts[2]), expr(ts[3]))
	} else {
		console.log('ignore', cmd)
	}
}

function expr(exp) {
	//console.log('in', exp)
	let varIdx = exp.indexOf('$');
	let varName = '';
	while (varIdx > -1) {
		varIdx++;
		while (varIdx < exp.length) {
			if ('+-*/%&|!<>=),'.indexOf(exp[varIdx]) === -1) {
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
			varValue = env[varName]
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
	let result = null;
	try {
		result = eval(exp);
	} catch (e){
		console.log(exp)
		return;
	}
	
	if (typeof result === "boolean") {
		return result|0;
	}
	return result;
}

function getRndInteger(min, max) {
	return Math.floor(Math.random() * (max - min) ) + min;
}


let colors = ['#000000', '#ffffff', '#d6a090', '#fe3b1e', '#a12c32', '#fa2f7a', '#fb9fda', '#e61cf7', '#992f7c', '#47011f', '#051155', '#4f02ec', '#2d69cb', '#00a6ee', '#6febff', '#08a29a', '#2a666a', '#063619', '#4a4957', '#8e7ba4', '#b7c0ff', '#acbe9c', '#827c70', '#5a3b1c', '#ae6507', '#f7aa30', '#f4ea5c', '#9b9500', '#566204', '#11963b', '#51e113', '#08fdcc']

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
	var color = colors[parseInt(value)];
	ctx.fillStyle = color;

	ctx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
}

function getPixel(x, y) {
	return pixels[widthInBlocks*x+y] | 0;
}

function clearCanvas() {
	for (let i = 0 ; i < widthInBlocks; i++) {
		for (let j = 0; j < heightInBlocks; j++) {
			drawPixel(i, j, 0);
		}
	}
}
