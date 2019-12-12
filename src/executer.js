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
	let finished = false;

	function config(parser, evaluater, editor, consl, canvas, controls, options) {
		_parser = parser;
		_evaluater = evaluater;
		_editor = editor;
		_console = consl;
		_canvas = canvas;
		_controls = controls;
		_options = options;
	}

	function initEnv() {
		env = {
			_pc: 0,
			_sleep: 0,
			_pause: false,
			_resume: executeStep, // callback function, default execute step
			_editor: _editor,
			_console: _console,
			_canvas: _canvas,
			_random: getRandomInteger,
			_keys: [],
			_stack: [], // pc stack
			_controls: _controls,
			_options: _options
		};
		lbl = {};
		fun = {};
		program = null;

		running = false;
		finished = false;
		
		if (_controls.step) {
			_controls.step.removeClass("disabled");
		}
	}

	function restart() {
		initEnv();
		window.clearTimeout();
		$(document).off("keydown");
		if (_controls.run) {
			_controls.run.removeClass("disabled");
		}
	}

	function finishedExecution() {
		$(document).off("keydown");
		running = false;
		finished = true;
		
		if (_controls.step) {
			_controls.step.addClass("disabled");
		}
		if (_controls.run) {
			_controls.run.removeClass("disabled");
		}
	}

	/* execute program */
	function loop() {
		if (env._pause) {
			env._resume = loop;
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
		} else {
			window.clearTimeout();
			if (env._pc < program.length) {
				return loop();
			}
		}
		finishedExecution();
	}

	function executeAll() {
		if (running) {
			return;
		}

		if (_controls.run) {
			_controls.run.addClass("disabled");
		}

		$(document).on("keydown", function (e) {
			env._keys.push(e.which);
		});

		parseSrc(_editor.session.getValue());

		if (!finished) {
			running = true;
			if (env._pc < program.length) {
				loop();
			}
		}
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

	function parseSrc(src) {
		initEnv();
		parsed = _parser.parse(src);
		program = parsed.program;
		lbl = parsed.labels;
		fun = parsed.funcs;
	}

	function getRandomInteger(min, max) {
		return Math.floor(Math.random() * (max - min) ) + min;
	}

	return {
		config,
		executeAll,
		executeStep,
		restart
	};
};
