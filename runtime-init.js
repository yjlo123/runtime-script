(function() {
	let instanceCounter = 0;
	$(".runtime-embedded-box").each(function() {
		
		let source = $(this).text();
		$(this).text('');

		let runtimeEditor = $(this);

		let leftPane = $("<div class='runtime-embedded-left'></dev>");
		let rightPane = $("<div class='runtime-embedded-right'></dev>");
		leftPane.appendTo(runtimeEditor);
		rightPane.appendTo(runtimeEditor);
		
		/* left */
		let controlBox = $("<div class='runtime-embedded-control-box'></div>")
		let runBtn = $("<div class='btn runtime-embedded' id='run-btn'>Run</div>");
		let restartBtn = $("<div class='btn runtime-embedded' id='restart-btn'>Stop</div>");
		runBtn.appendTo(controlBox);
		restartBtn.appendTo(controlBox);
		controlBox.appendTo(leftPane)
		
		let editor = $(`<pre id='runtime-editor-${instanceCounter}' class='runtime-ace-editor runtime-embedded'>${source}</pre>`);
		editor.appendTo(leftPane);
		
		/* right */
		let canvas = $("<canvas id='runtime-canvas' class='runtime-embedded' width='168' height='168'></canvas>");
		canvas.hide();
		if ($(this).hasClass("runtime-show-canvas")) {
			canvas.show();
		}
		canvas.appendTo(rightPane);

		let consol = $("<div id='console-panel' class='runtime-embedded'><div id='runtime-console' class='runtime-embedded'></div></div>");
		if ($(this).hasClass("runtime-hide-console")) {
			consol.hide();
		}
		consol.appendTo(rightPane);

		instanceCounter++;
	});

})();
