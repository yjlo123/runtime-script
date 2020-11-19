let runtimeExecuter = function() {
	let _parser = null;
	let _evaluater = null;
	let _editor = null;
	let _console = null;
	let _canvas = null;
	let _controls = {};
	let _options = {};

	let env = {};
	let lbl = {};
	let fun = {};

	let program = null;
	let running = false;
	let paused = false;
	let finished = false;

	let break_points = [];

	function config(parser, evaluater, editor, consl, canvas, controls, options) {
		_parser = parser;
		_evaluater = evaluater;
		_editor = editor;
		_console = consl;
		_canvas = canvas;
		_controls = controls;
		_options = options;
	}

	function initEnv(args) {
		env = {
			_pc: 0,
			_sleep: 0,
			_pause: false, // for user input
			_resume: executeStep, // callback function, default execute step
			_editor: _editor,
			_console: _console,
			_canvas: _canvas,
			_random: getRandomInteger,
			_keys: [],
			_stack: [], // function call stack {pc, func_name, func_env, func_lbls}
			_loops: {}, // for loops
			_controls: _controls,
			_options: _options,
			_global: {
				...args
			}
		};
		lbl = {};
		fun = {};
		program = null;

		running = false;
		paused = false; // for breakpoint
		finished = false;
		
		_controls.step && _controls.step.removeClass("running");
	}

	function restart() {
		initEnv();
		window.clearTimeout();
		$(document).off("keydown");

		_controls.run && _controls.run.removeClass("running");
		_controls.stepBtn && _controls.stepBtn.removeClass("disabled");
		_controls.statusIndicator && _controls.statusIndicator.removeClass("status-run");
		_controls.statusIndicator && _controls.statusIndicator.removeClass("status-break");

		_console.AbortInput();
	}

	function finishedExecution() {
		$(document).off("keydown");
		finished = true;
		running = false;
		paused = false;
		
		_controls.stepBtn && _controls.stepBtn.addClass("disabled");
		_controls.run && _controls.run.removeClass("running");
		_controls.statusIndicator && _controls.statusIndicator.removeClass("status-run");
		_controls.statusIndicator && _controls.statusIndicator.removeClass("status-break");
	}

	/* execute program */
	function loop() {
		while (true) {
			if (env._pause) {
				env._resume = loop;
				return;
			}
			if (break_points.includes(env._pc)) {
				// break point
				_editor.gotoLine(env._pc+1, 0);
				paused = true;
				_controls.statusIndicator && _controls.statusIndicator.removeClass("status-run");
				_controls.statusIndicator && _controls.statusIndicator.addClass("status-break");
				return;
			}
			_evaluater.evaluate(program[env._pc], env, lbl, fun, program);
			env._pc++;
			if (env._sleep > 0) {
				return setTimeout(function () {
					env._sleep = 0;
					// program is null when stopped
					if (program && env._pc < program.length) {
						return loop();
					}
				}, env._sleep);
			}

			window.clearTimeout();
			if (env._pc >= program.length) {
				break;
			}
		}
		finishedExecution();
	}

	function executeAll(args, src_text) {
		if (running && !paused) {
			return;
		}

		_controls.run && _controls.run.addClass("running");
		_controls.statusIndicator && _controls.statusIndicator.addClass("status-run");

		$(document).off("keydown"); // clear previous listener (if any)
		$(document).on("keydown", function (e) {
			env._keys.push(e.which);
			env._keys.splice(0, env._keys.length - 10);
		});


		if (!paused) {
			parseSrc(src_text || _editor.session.getValue(), args);
		}

		if (!finished) {
			running = true;
			if (env._pc < program.length) {
				if (paused) {
					paused = false;
					executeStep();
				}
				loop();
			}
		}
	}

	function inputAndExecute() {
		const input = prompt("Type your input\ne.g.\n  1024\n  Hello World!\n  [1, 2, 3]\nThen get the value from $in", "");
		if (input === null) {
			return;
		}
		let parsedInput = input;
		try {
			parsedInput = JSON.parse(input);
		} catch (e) {}
		executeAll({
			in: parsedInput
		});
	}

	function executeStep() {
		if (program === null) {
			parseSrc(_editor.session.getValue());
		}
		if (finished) {
			return;
		}
		if (env._pause) {
			env._resume = executeStep;
			return;
		}
		_editor.gotoLine(env._pc+1, 0);
		if (env._pc < program.length) {
			_evaluater.evaluate(program[env._pc], env, lbl, fun, program);
			env._pc++;
		} else {
			finishedExecution();
		}
	}

	function parseSrc(src, args) {
		initEnv(args);
		parsed = _parser.parse(src);
		program = parsed.program;
		lbl = parsed.labels;
		fun = parsed.funcs;
	}

	function getRandomInteger(min, max) {
		return Math.floor(Math.random() * (max - min) ) + min;
	}

	function setBreakpoints(rows) {
		break_points = rows;
	}

	function getEnv() {
		console.log(env);
		return {
			global: env._global,
			func_stack: env._stack,
			pc: env._pc,
			keys: env._keys
		}
	}

	function getFuncList() {
		parseSrc(_editor.session.getValue());
		return parsed.funcs;
	}

	return {
		config,
		executeAll,
		inputAndExecute,
		executeStep,
		restart,
		setBreakpoints,
		getEnv,
		getFuncList
	};
};
