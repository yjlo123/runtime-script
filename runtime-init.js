(function() {
	let instanceCounter = 0;
	$(".runtime-embeded-box").each(function() {
		
		let source = $(this).text();
		$(this).text('');

		let runtimeEditor = $(this);

		let leftPane = $("<div class='runtime-embeded-left'></dev>");
		let rightPane = $("<div class='runtime-embeded-right'></dev>");
		leftPane.appendTo(runtimeEditor);
		rightPane.appendTo(runtimeEditor);
		
		/* left */
		let controlBox = $("<div class='runtime-embeded-control-box'></div>")
		let runBtn = $("<div class='btn runtime-embeded' id='run-btn'>Run</div>");
		let restartBtn = $("<div class='btn runtime-embeded' id='restart-btn'>Stop</div>");
		runBtn.appendTo(controlBox);
		restartBtn.appendTo(controlBox);
		controlBox.appendTo(leftPane)
		
		let editor = $(`<pre id='runtime-editor-${instanceCounter}' class='runtime-ace-editor runtime-embeded'>${source}</pre>`);
		editor.appendTo(leftPane);
		
		/* right */
		let canvas = $("<canvas id='runtime-canvas' class='runtime-embeded' width='168' height='168'></canvas>");
		canvas.hide();
		if ($(this).hasClass("runtime-show-canvas")) {
			canvas.show();
		}
		canvas.appendTo(rightPane);

		let consol = $("<div id='console-panel' class='runtime-embeded'><div id='runtime-console' class='runtime-embeded'></div></div>");
		if ($(this).hasClass("runtime-hide-console")) {
			consol.hide();
		}
		consol.appendTo(rightPane);

		instanceCounter++;
	});

})();
