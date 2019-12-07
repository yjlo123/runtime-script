(function() {
	let instanceCounter = 0;
	$(".runtime-embeded-box").each(function() {

		let runtimeEditor = $(this);

		let leftPane = $("<div class='runtime-embeded-left'></dev>");
		let rightPane = $("<div class='runtime-embeded-right'></dev>");
		leftPane.appendTo(runtimeEditor);
		rightPane.appendTo(runtimeEditor);
		
		/* left */
		let controlBox = $("<div class='runtime-embeded-control-box'></div>")
		let runBtn = $("<div class='btn' id='run-btn'>Run</div>");
		let restartBtn = $("<div class='btn' id='restart-btn'>Stop</div>");
		runBtn.appendTo(controlBox);
		restartBtn.appendTo(controlBox);
		controlBox.appendTo(leftPane)
		
		let editor = $(`<pre id='runtime-editor-${instanceCounter}' class='runtime-ace-editor runtime-embeded'></pre>`);
		editor.appendTo(leftPane);
		
		/* right */
		let canvas = $("<canvas id='runtime-canvas' class='runtime-embeded' width='168' height='168'></canvas>");
		let consol = $("<div id='console-panel'><div id='runtime-console' class='runtime-embeded'></div></div>");
		canvas.appendTo(rightPane);
		consol.appendTo(rightPane);
		
		instanceCounter++;
	});

})();
