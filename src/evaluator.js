let runtimeEvaluator = function() {
	let _env = null;

	function _gotoIfFalse(program, env) {
		env._pc++; // first 'ife'
		let ifStack = 0;
		while (env._pc <= program.length) {
			let currentCmd = program[env._pc][0];
			if (currentCmd === 'ife') {
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

	function _input(env, varName) {
		env._console.Input(function(input) {
			env[varName] = input;
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
			env[ts[1]] = expr(ts[2]);

		} else if (cmd === 'prt') {
			_print(env, ts)
		} else if (cmd === 'inp') {
			_input(env, ts[1]);
			env._pause = true;

		/* ===== JUMP ===== */
		} else if (cmd === 'jmp') {
			// console.log('jump', ts[1], lbl[ts[1]])
			env._pc = lbl[ts[1]] - 1;
		} else if (cmd === 'jeq') {
			// equal
			if (expr(ts[1]) == expr(ts[2])) {
				env._pc = lbl[ts[3]] - 1;
			}
		} else if (cmd === 'jne') {
			// not equal
			if (expr(ts[1]) != expr(ts[2])) {
				env._pc = lbl[ts[3]] - 1;
			}
		} else if (cmd === 'jlt') {
			// less than
			if (expr(ts[1]) < expr(ts[2])) {
				env._pc = lbl[ts[3]] - 1;
			}
		} else if (cmd === 'jgt') {
			// greater than
			if (expr(ts[1]) > expr(ts[2])) {
				env._pc = lbl[ts[3]] - 1;
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
		} else if (cmd === 'add') {
			let val1 = expr(ts[2]);
			let val2 = expr(ts[3]);
			if (val1 === null && typeof val2 === 'number') {
				env[ts[1]] = String.fromCharCode(val2);
			} else {
				env[ts[1]] = val1 + val2;
			}
		} else if (cmd === 'sub') {
			let val1 = expr(ts[2]);
			let val2 = expr(ts[3]);
			if (typeof val1 === 'string' && val1.length === 1 && val2 === null) {
				env[ts[1]] = val1.charCodeAt(0) - val2;
			} else {
				env[ts[1]] = val1 - val2;
			}
		} else if (cmd === 'mul') {
			let val1 = expr(ts[2]);
			let val2 = expr(ts[3]);
			if (typeof val1 === 'string' && typeof val2 === 'number') {
				env[ts[1]] = val1.repeat(val2);
			} else {
				env[ts[1]] = expr(ts[2]) * expr(ts[3]);
			}
		} else if (cmd === 'mod') {
			env[ts[1]] = expr(ts[2]) % expr(ts[3]);
		} else if (cmd === 'div') {
			env[ts[1]] = Math.floor(expr(ts[2]) / expr(ts[3]));
		} else if (cmd === 'int') {
			env[ts[1]] = parseInt(expr(ts[2]));
		} else if (cmd === 'str') {
			env[ts[1]] = expr(ts[2]).toString();
		} else if (cmd === 'typ') {
			let val = expr(ts[2]);
			if (typeof val === 'number') {
				env[ts[1]] = 'int';
			} else if (typeof val === 'string') {
				env[ts[1]] = 'str';
			} else if (Array.isArray(val)) {
				env[ts[1]] = 'list';
			} else if (typeof val === 'object') {
				env[ts[1]] = 'map';
			} else {
				env[ts[1]] = 'err';
			}
		} else if (cmd === 'slp') {
			env._sleep = expr(ts[1]);
		} else if (cmd === 'prs') {
			env[ts[1]] = JSON.parse(expr(ts[2]));
		
		/* ===== CANVAS ===== */
		} else if (cmd === 'drw') {
			// draw pixel
			let x = expr(ts[1]);
			let y = expr(ts[2]);
			let c = expr(ts[3]);
			env._canvas.drawPixel(x, y, c);
		} else if (cmd === 'drt') {
			// draw text
			let x = expr(ts[1]);
			let y = expr(ts[2]);
			let t = expr(ts[3]);
			let s = expr(ts[4]);
			let c = expr(ts[5]);
			env._canvas.drawText(x, y, t, s, c);
		} else if (cmd === 'pxl') {
			env[ts[1]] = env._canvas.getPixel(expr(ts[2]), expr(ts[3]))
		} else if (cmd === 'clr') {
			let canvasSize = ts[1] === undefined ? 24 : expr(ts[1]);
			env._canvas.clearCanvas(canvasSize);

		/* ===== LIST ===== */
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
				if (lstVal.length === 0) {
					env[ts[2]] = '';
				} else {
					env[ts[2]] = lstVal.slice(-1);
					env[lstVar] = lstVal.substring(0, lstVal.length-1);
				}
			} else {
				// array
				let val = lstVal.pop();
				env[ts[2]] = val === undefined ? null : val;
			}
		} else if (cmd === 'pol') {
			let lstVar = ts[1].slice(1);
			let lstVal = env[lstVar];
			if (typeof lstVal === 'string') {
				// string
				if (lstVal.length === 0) {
					env[ts[2]] = '';
				} else {
					env[ts[2]] = lstVal.charAt(0);
					env[lstVar] = lstVal.substring(1, lstVal.length);
				}
			} else {
				// array
				let val = lstVal.shift();
				env[ts[2]] = val === undefined ? null : val;
			}

		/* ===== MAP ===== */
		} else if (cmd === 'put') {
			let lstVar = ts[1];
			env[lstVar.slice(1)][expr(ts[2])] = expr(ts[3]);
		} else if (cmd === 'get') {
			let lstVar = ts[1];
			let valByKey = env[lstVar.slice(1)][expr(ts[2])]
			env[ts[3]] = valByKey === undefined ? null : valByKey;
		} else if (cmd === 'key') {
			let map = env[ts[1].slice(1)];
			env[ts[2]] = Object.keys(map);
		} else if (cmd === 'del') {
			delete env[ts[1].slice(1)][expr(ts[2])]

		/* ===== MISC ===== */
		} else if (cmd === 'rnd') {
			env[ts[1]] = env._random(expr(ts[2]), expr(ts[3]));
		} else if (cmd === 'tim') {
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
			env[ts[1]] = dateFuncMap[ts[2]].call(new Date());
		} else if (cmd === 'def') {
			_gotoEnd(program, env, 'end');
		} else if (cmd === 'ret' || cmd === 'end') {
			env._func_args.pop();
			let retPc = env._stack.pop();
			env._pc = retPc;
		} else if (cmd === 'cal') {
			let args = ts.slice(2);
			let func_args = []
			for (let v of args) {
				func_args.push(expr(v));
			}
			env._func_args.push(func_args);
			env._stack.push(env._pc);
			env._pc = fun[ts[1]];
		} else {
			console.log('ignore', cmd);
		}
	}

	function expr(exp) {
		if (exp[0] === '$') {
			// var
			let varName = exp.slice(1);
			if (varName === 'lastkey') {
				// specila value: lastkey
				result = _env._keys.length > 0 ? _env._keys.shift() : -1;
			} else if (varName === 'nil'){
				// special value: nil
				result = null;
			} else {
				if (!isNaN(varName) && Number.isInteger(parseInt(varName))) {
					// func arg
					let argIndex = parseInt(varName);
					let funcArgsCount = _env._func_args.length;
					let func_args = funcArgsCount > 0 ? _env._func_args[funcArgsCount-1] : [];
					if (func_args.length > 0 && argIndex < func_args.length) {
						result = func_args[argIndex];
					} else {
						//console.error(`Invalid func argument index: ${argIndex}`);
						result = null;
					}
				} else {
					// env value
					let value = _env[varName];
					if (value === undefined) {
						//console.error(`Variable ${varName} undefined`);
						result = null;
					} else if (value && value.length > 1 && value[0] === '\'' && value[value.length-1] === '\'') {
						result = value.slice(1, -1);
					} else {
						result = value;
					}
				}
			}
		} else if (exp === '[]') {
			// array
			result = [];
		} else if (exp === '{}') {
			// hash table
			result = {};
		} else {
			if (exp.length > 1 && exp[0] === '\'' && exp[exp.length-1] === '\'') {
				// string
				result = exp.slice(1, -1);
			} else {
				if (!isNaN(parseInt(exp)) && exp <= Number.MAX_SAFE_INTEGER) {
					// integer
					result = parseInt(exp);
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

	return {
		evaluate
	};
};
