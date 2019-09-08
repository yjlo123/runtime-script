let runtimeExecuter = (function() {
	let _parser = null;
	let _evaluater = null;
	let _console = null;
	let _canvas = null;

	let env = {};
	let lbl = {};

	let program = null;
	let running = false;
	let finished = false;

	function config(parser, evaluater, consl, canvas) {
		_parser = parser;
		_evaluater = evaluater;
		_console = consl;
		_canvas = canvas
	}

	function initEnv() {
		env = {
			_pc: 0,
			_sleep: 0,
			_console: _console,
			_canvas: _canvas,
			_random: getRandomInteger,
			_keys: []
		};
		lbl = {};
		program = null;

		running = false;
		finished = false;

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
		_evaluater.evaluate(program[env._pc], env, lbl);
		env._pc++;
		if (env._sleep > 0) {
			return setTimeout(function () {
				env._sleep = 0;
				if (env._pc < program.length) {
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
		document.getElementById("run-btn").classList.add("disabled");
		$(document).on("keydown", function (e) {
			env._keys.push(e.which);
		});

		parseSrc(editor.session.getValue())

		if (!finished) {
			running = true;
			if (env._pc < program.length) {
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
		editor.gotoLine(env._pc+1, 0);
		if (env._pc <= program.length) {
			_evaluater.evaluate(program[env._pc], env, lbl);
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
})();
