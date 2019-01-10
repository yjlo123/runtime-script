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


/* listener */
document.getElementById("run-btn").addEventListener("click", executeAll);
document.getElementById("step-btn").addEventListener("click", executeStep);
document.getElementById("restart-btn").addEventListener("click", initEnv);


function initEnv() {
	env = {};
	lbl = {};
	program = [];
	pc = 0;
	sleep = 0;

	parsed = false;
	finished = false;
	
	document.getElementById("step-btn").classList.remove("disabled");

	editor.gotoLine(0, 0);
}

function finishedExecution() {
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
		if (l === '') {
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
	//if (sleep > 0) {
	setTimeout(function () {
		sleep = 0;
		editor.gotoLine(pc+1, 0);
		if (pc < program.length) {
			loop();
		}
	}, sleep);
	//}
	
}

function executeAll() {
	if (!parsed) {
		parseProgram();
	}
	if (!finished) {
		if (pc < program.length) {
			loop();
		}
		finishedExecution();
	}
}

function executeStep() {
	if (!parsed) {
		parseProgram();
	}
	if (!finished) {
		editor.gotoLine(pc+1, 0);
		if (pc < program.length) {
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

function evaluate(ts) {
	if (ts.length === 0) {
		return;
	}
	if (ts[0][0] === '#') {
		return;
	}
	
	let cmd = ts[0];
	if (cmd === 'let') {
		env[ts[1]] = expression(ts[2]);
	} else if (cmd === 'print') {
		console.log(expression(ts[1]))
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
	} else {
		console.log('ignore', cmd)
	}
}

function expression(exp) {
	let varIdx = exp.indexOf('$');
	let varName = '';
	while (varIdx > -1) {
		varIdx++;
		while (varIdx < exp.length && '+-*/%!<>=()'.indexOf(exp[varIdx]) === -1) {
			varName += exp[varIdx];
			varIdx++;
		}
		// console.log(varName)
		exp = exp.replace('$'+varName, env[varName]);
		varName = '';
		varIdx = exp.indexOf('$');
		// console.log(exp);
	}
	
	let result = eval(exp);
	if (typeof result === "boolean") {
		return result|0;
	}
	return result;
}
