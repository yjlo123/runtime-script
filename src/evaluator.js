let runtimeEvaluator = function() {
	let _env = null;

	function _gotoIfFalse(program, env) {
		env._pc++; // first 'ife'
		let ifStack = 0;
		while (env._pc <= program.length) {
			let currentCmd = program[env._pc][0];
			if (currentCmd === 'ife' || currentCmd === 'ifg') {
				ifStack++;
			} else if (currentCmd === 'fin') {
				if (ifStack === 0) {
					return;
				} else {
					ifStack--;
				}
			} else if (currentCmd === 'els') {
				if (ifStack === 0) {
					return;
				}
			}
			env._pc++;
		}
	}
	
	function _gotoEnd(program, env, keyword) {
		while (env._pc <= program.length && program[env._pc][0] !== keyword) {
			env._pc++;
		}
	}
	
	function _gotoLoopEnd(program, env) {
		env._pc++; // first 'for'
		let forStack = 0;
		while (env._pc <= program.length) {
			let currentCmd = program[env._pc][0];
			if (currentCmd === 'for') {
				forStack++;
			} else if (currentCmd === 'nxt') {
				if (forStack === 0) {
					return;
				}
				forStack--;
			}
			env._pc++;
		}
	}

	function _backToLoopHead(program, env) {
		let forStack = 0;
		env._pc--;
		while (env._pc > 0) {
			let currentCmd = program[env._pc][0];
			if (currentCmd === 'for') {
				if (forStack === 0) {
					env._pc--;
					return;
				}
				forStack--;
			} else if (currentCmd === 'nxt') {
				forStack++;
			}
			env._pc--;
		}
	}

	function _input(env, varName) {
		env._console.Input(function(input) {
			_assignVar(env, varName, input);
			env._pause = false;
			env._resume.call();
		});
	}
	
	function _print(env, ts) {
		let resultExp = expr(ts[1]);
		let endChar = ts[2] === undefined ? '\n' : expr(ts[2]);
		if (Array.isArray(resultExp)) {
			resultExp = JSON.stringify(resultExp);
		} else if (resultExp === null) {
			resultExp = 'nil';
		} else if (typeof resultExp === 'object') {
			resultExp = JSON.stringify(resultExp, null, " ")
		} else {
			resultExp += '';
		}
		env._console.Write(resultExp + endChar, 'console-default');
	}

	function _assignVar(env, varName, val, forceScope=false) {
		if ((forceScope || varName[0] === '_') && env._stack.length > 0) {
			// function scoped variable
			env._stack[env._stack.length-1]['env'][varName] = val;
		} else {
			// global variable
			env._global[varName] = val;
		}
	}

	function _getVarVal(env, varName) {
		// for `list` and `map`
		if (varName[0] === '_' && env._stack.length > 0) {
			// function scoped variable
			return env._stack[env._stack.length-1]['env'][varName];
		} else {
			// global variable
			return env._global[varName];
		}
	}

	function _gotoLabelPc(env, lbl, name) {
		let lblSet = -1;
		if (env._stack.length > 0) {
			let funcStackObj = env._stack[env._stack.length-1];
			lblSet = lbl[funcStackObj.func];
		} else {
			lblSet = lbl['global'];
		}
		if (name in lblSet) {
			env._pc = lblSet[name] - 1;
		} else {
			console.log('Invalid label in scope:', name);
		}
	}

	function evaluate(ts, env, lbl, fun, program) {
		_env = env; // for expr
		if (ts.length === 0) {
			return;
		}
		if (ts[0][0] === '#') {
			return;
		}
		
		let cmd = ts[0];
		if (cmd === 'let') {
			let varName = ts[1];
			let val = expr(ts[2]);
			_assignVar(env, varName, val);
		} else if (cmd === 'prt') {
			_print(env, ts)
		} else if (cmd === 'inp') {
			_input(env, ts[1]);
			env._pause = true;

		/* ===== JUMP ===== */
		} else if (cmd === 'jmp') {
			_gotoLabelPc(env, lbl, ts[1]);
		} else if (cmd === 'jeq') {
			// equal
			if (expr(ts[1]) == expr(ts[2])) {
				_gotoLabelPc(env, lbl, ts[3]);
			}
		} else if (cmd === 'jne') {
			// not equal
			if (expr(ts[1]) != expr(ts[2])) {
				_gotoLabelPc(env, lbl, ts[3]);
			}
		} else if (cmd === 'jlt') {
			// less than
			if (expr(ts[1]) < expr(ts[2])) {
				_gotoLabelPc(env, lbl, ts[3]);
			}
		} else if (cmd === 'jgt') {
			// greater than
			if (expr(ts[1]) > expr(ts[2])) {
				_gotoLabelPc(env, lbl, ts[3]);
			}

		} else if (cmd === 'ife') {
			// if equal
			if (expr(ts[1]) !== expr(ts[2])) {
				_gotoIfFalse(program, env);
			}
		} else if (cmd === 'ifg') {
			// if greater than
			if (expr(ts[1]) <= expr(ts[2])) {
				_gotoIfFalse(program, env);
			}
		} else if (cmd === 'els') {
			_gotoEnd(program, env, 'fin');
		} else if (cmd === 'fin') {
			return;

		/* ===== ARITHMATIC ===== */
		} else if (cmd === 'add') {
			let varName = ts[1];
			let val1 = expr(ts[2]);
			let val2 = expr(ts[3]);
			if (val1 === null && typeof val2 === 'number') {
				_assignVar(env, varName, String.fromCharCode(val2));
			} else {
				_assignVar(env, varName, val1 + val2);
			}
		} else if (cmd === 'sub') {
			let varName = ts[1];
			let val1 = expr(ts[2]);
			let val2 = expr(ts[3]);
			if (typeof val1 === 'string' && val1.length === 1 && val2 === null) {
				_assignVar(env, varName, val1.charCodeAt(0) - val2);
			} else {
				_assignVar(env, varName, val1 - val2);
			}
		} else if (cmd === 'mul') {
			let varName = ts[1];
			let val1 = expr(ts[2]);
			let val2 = expr(ts[3]);
			if (typeof val1 === 'string' && typeof val2 === 'number') {
				_assignVar(env, varName, val1.repeat(val2));
			} else {
				_assignVar(env, varName, expr(ts[2]) * expr(ts[3]));
			}
		} else if (cmd === 'mod') {
			let res = expr(ts[2]) % expr(ts[3]);
			_assignVar(env, ts[1], res);
		} else if (cmd === 'div') {
			let res = Math.floor(expr(ts[2]) / expr(ts[3]));
			_assignVar(env, ts[1], res);

		/* ===== DATA TYPE ===== */
		} else if (cmd === 'int') {
			let res = parseInt(expr(ts[2]));
			if (Number.isNaN(res)) {
				res = null;
			}
			_assignVar(env, ts[1], res);
		} else if (cmd === 'str') {
			let res = expr(ts[2]).toString();
			_assignVar(env, ts[1], res);
		} else if (cmd === 'typ') {
			let val = expr(ts[2]);
			let type = 'err';
			if (typeof val === 'number') {
				type = 'int';
			} else if (typeof val === 'string') {
				type = 'str';
			} else if (Array.isArray(val)) {
				type = 'list';
			} else if (typeof val === 'object' && val !== null) {
				type = 'map';
			} else if (val === null) {
				type = 'nil';
			}
			_assignVar(env, ts[1], type);

		/* ===== CANVAS ===== */
		} else if (cmd === 'drw') {
			// draw pixel
			let x = expr(ts[1]);
			let y = expr(ts[2]);
			let c = expr(ts[3]);
			env._canvas.drawPixel(x, y, c);
		} else if (cmd === 'pxl') {
			let val = env._canvas.getPixel(expr(ts[2]), expr(ts[3]));
			_assignVar(env, ts[1], val);
		} else if (cmd === 'clr') {
			let canvasSize = ts[1] === undefined ? 24 : expr(ts[1]);
			env._canvas.clearCanvas(canvasSize);

		/* ===== LIST ===== */
		} else if (cmd === 'psh') {
			let listVarName = ts[1].slice(1); // remove `$`
			let listVarVal = _getVarVal(env, listVarName);
			for (const val of ts.slice(2)) {
				if (typeof listVarVal === 'string') {
					// string
					_assignVar(env, listVarName, listVarVal + expr(val));
				} else {
					// array
					listVarVal.push(expr(val));
				}
			}
		} else if (cmd === 'pop') {
			let listVarName = ts[1].slice(1); // remove `$`
			let listVarVal = _getVarVal(env, listVarName);
			let varName = ts[2];
			if (typeof listVarVal === 'string') {
				// string
				if (listVarVal.length === 0) {
					_assignVar(env, varName, '');
				} else {
					_assignVar(env, varName, listVarVal.slice(-1));
					let newStrVal = listVarVal.substring(0, listVarVal.length-1);
					_assignVar(env, listVarName, newStrVal);
				}
			} else {
				// array
				let val = listVarVal.pop();
				let varVal = val === undefined ? null : val;
				_assignVar(env, varName, varVal);
			}
		} else if (cmd === 'pol') {
			let listVarName = ts[1].slice(1); // remove `$`
			let listVarVal = _getVarVal(env, listVarName);
			let varName = ts[2];
			if (typeof listVarVal === 'string') {
				// string
				if (listVarVal.length === 0) {
					_assignVar(env, varName, '');
				} else {
					_assignVar(env, varName,  listVarVal.charAt(0));
					let newStrVal = listVarVal.substring(1, listVarVal.length);
					_assignVar(env, listVarName, newStrVal);
				}
			} else {
				// array
				let val = listVarVal.shift();
				let varVal = val === undefined ? null : val;
				_assignVar(env, varName, varVal);
			}

		/* ===== MAP ===== */
		} else if (cmd === 'put') {
			let mapVarName = ts[1].slice(1); // remove `$`
			let mapVarVal = _getVarVal(env, mapVarName);
			let mapKey = expr(ts[2]);
			let mapVal = expr(ts[3]);
			mapVarVal[mapKey] = mapVal;
		} else if (cmd === 'get') {
			let mapVarName = ts[1].slice(1); // remove `$`
			let mapVarVal = _getVarVal(env, mapVarName);
			let mapKey = expr(ts[2]);
			let mapValByKey = mapVarVal[mapKey]
			let varVal =  mapValByKey === undefined ? null : mapValByKey;
			_assignVar(env, ts[3], varVal);
		} else if (cmd === 'key') {
			let mapVarName = ts[1].slice(1); // remove `$`
			let mapVarVal = _getVarVal(env, mapVarName);
			_assignVar(env, ts[2], Object.keys(mapVarVal));
		} else if (cmd === 'del') {
			let mapVarName = ts[1].slice(1); // remove `$`
			let mapKey = expr(ts[2]);
			let mapVarVal = _getVarVal(env, mapVarName);
			delete mapVarVal[mapKey]

		/* ===== MISC ===== */
		} else if (cmd === 'rnd') {
			let val = env._random(expr(ts[2]), expr(ts[3]));
			_assignVar(env, ts[1], val);
		} else if (cmd === 'tim') {
			let timeType = ts[2];
			let dateFuncMap = {
				'year': Date.prototype.getFullYear,
				'month': Date.prototype.getMonth,
				'date': Date.prototype.getDate,
				'day': Date.prototype.getDay,
				'hour': Date.prototype.getHours,
				'minute': Date.prototype.getMinutes,
				'second': Date.prototype.getSeconds,
				'milli': Date.prototype.getMilliseconds
			}
			let val = -1;
			if (timeType in dateFuncMap) {
				val = dateFuncMap[timeType].call(new Date());
			} else if (timeType === 'now') {
				val = Date.now();
			}
			_assignVar(env, ts[1], val);
		} else if (cmd === 'slp') {
			env._sleep = expr(ts[1]);
		} else if (cmd === 'prs') {
			_assignVar(env, ts[1], JSON.parse(expr(ts[2])));

		/* ===== FUNC ===== */
		} else if (cmd === 'def') {
			_gotoEnd(program, env, 'end');
		} else if (cmd === 'ret' || cmd === 'end') {
			let val = ts[1] && expr(ts[1]); // must eval before pop
			let stackObj = env._stack.pop();
			if (val !== undefined && cmd === 'ret') {
				_assignVar(env, 'ret', val, forceScope=true);
			}
			env._pc = stackObj.pc;
		} else if (cmd === 'cal') {
			let funcName = ts[1];
			let args = ts.slice(2);
			let funcEnv = {}
			args.forEach((v, i) => {
				funcEnv[i] = expr(v);
			});
			env._stack.push({
				func: funcName,
				pc: env._pc, // pc for jump back
				env: funcEnv
			});
			env._pc = fun[funcName];

		/* ===== FOR LOOP ===== */
		} else if (cmd === 'for') {
			let varName = ts[1];
			let range = expr(ts[2]);
			if (!(varName in env._loops) || env._loops[varName].pc !== env._pc) {
				let rangeList = [];
				if (Number.isInteger(range)) {
					rangeList = Array.from(Array(range).keys());
				} else if (Array.isArray(range)) {
					rangeList = range;
				} else if (typeof range === 'string' || range instanceof String) {
					rangeList = range.split('');
				} else if (typeof range === 'object' && range !== null) {
					rangeList = Object.keys(range);
				}
				env._loops[varName] = {
					items: rangeList,
					pc: env._pc, // to prevent the same var names
					index: 0
				}
			}
			
			let loopState = env._loops[varName];
			if (loopState.index >= loopState.items.length) {
				delete env._loops[varName]
				_gotoLoopEnd(program, env);
			} else {
				_assignVar(env, varName, loopState.items[loopState.index]);
				loopState.index++;
			}
		} else if (cmd === 'nxt') {
			_backToLoopHead(program, env);
		} else if (cmd === 'lod' || cmd === 'sav') {
			console.error(`'${cmd}' is not supported in browser. Please run it on the binary version of Runtime Script. (https://github.com/yjlo123/runtime-go)`);
		} else {
			console.log('Unknown command:', cmd);
		}
	}

	function expr(exp) {
		if (exp[0] === '$') {
			// value reference
			let varName = exp.slice(1);
			if (varName === 'lastkey') {
				// specila value: lastkey
				result = _env._keys.length > 0 ? _env._keys.shift() : -1;
			} else if (varName === 'nil'){
				// special value: nil
				result = null;
			} else {
				// env value
				let value = null;
				let funcStackObj = _env._stack.length > 0? _env._stack[_env._stack.length-1] : null;
				if (funcStackObj && varName in funcStackObj.env) {
					// function scoped variable
					value = funcStackObj.env[varName];
				} else if (!isNaN(varName) && Number.isInteger(parseInt(varName))) {
					value = funcStackObj.env[varName];
				} else {
					value = _env._global[varName];
				}
				if (value === undefined) {
					console.log(`Variable ${varName} undefined`);
					result = null;
				} else if (value && value.length > 1 && value[0] === '\'' && value[value.length-1] === '\'') {
					result = value.slice(1, -1);
				} else {
					result = value;
				}
			}
		} else if (exp === '[]') {
			// list
			result = [];
		} else if (exp === '{}') {
			// map
			result = {};
		} else if (exp.length > 1 && exp[0] === '\'' && exp[exp.length-1] === '\'') {
			// string
			result = exp.slice(1, -1);
		} else if (!isNaN(parseInt(exp)) && exp <= Number.MAX_SAFE_INTEGER) {
			// integer
			result = parseInt(exp);
		} else {
			result = exp;
		}

		if (typeof result === "boolean") {
			return result|0;
		}
		return result;
	}

	return {
		evaluate
	};
};
