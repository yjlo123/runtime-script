(function() {
	$(".runtime-embeded-box").each(function() {
		let editorElement = $(this).find('.runtime-ace-editor')[0];
		let editor = ace.edit(editorElement.id);
		editor.setTheme("ace/theme/chrome");
		editor.session.setMode("ace/mode/runtime");
		editor.setFontSize(13);

		/* Console */
		let jqconsole = $(this).find('#runtime-console').jqconsole(
			//welcomeString, promptLabel, continueLabel, disableAutoFocus
			'', '', '', true
		);
		jqconsole.Write('Runtime Script\n', 'console-gray');
		jqconsole.SetPromptLabel(' ');

		/* control buttons */
		let runBtn = $(this).find("#run-btn");
		let restartBtn = $(this).find("#restart-btn");
		let stepBtn = $(this).find("#step-btn");
		let clearBtn = $(this).find("#clear-canvas-btn");
		
		let controls = {
			run: runBtn,
			restart: restartBtn,
			stepBtn: stepBtn,
			clearBtn: clearBtn
		};
		
		let options = {};
		
		let runtime = runtimeExecuter();
		let canvas = runtimeCanvas();
		let evaluator = runtimeEvaluator();
		let parser = runtimeParser();
		canvas.init($(this).find('#runtime-canvas')[0]);
		runtime.config(parser, evaluator, editor, jqconsole, canvas, controls, options);

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

		/* listener */
		runBtn.click(function() {
			try {
				runtime.executeAll();
			} catch(err) {
				jqconsole.Write(`${err}\n`, 'console-error');
			}
			
		});
		restartBtn.click(function() {
			runtime.restart();
		});

	});

})();
